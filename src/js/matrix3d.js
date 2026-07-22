import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  LinearFilter,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

const GLYPHS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}+-=*/\\|';
const ATLAS_COLUMNS = 8;
const ATLAS_CELL_SIZE = 48;
const CAMERA_Z = 12;
const FIELD_DEPTH = 58;
const FIELD_HEIGHT = 26;
const MAX_PIXEL_RATIO = 1.5;
const POINTER_DAMPING = 5.5;
const CAMERA_DAMPING = 4.2;

const VERTEX_SHADER = /* glsl */ `
  precision highp float;

  attribute float aSpeed;
  attribute float aPhase;
  attribute float aGlyph;
  attribute float aIntensity;
  attribute float aSize;

  uniform float uTime;
  uniform float uCycleHeight;
  uniform float uPixelRatio;
  uniform float uMaxPointSize;

  varying float vGlyph;
  varying float vIntensity;
  varying float vVisibility;

  void main() {
    float fallingY = mod(
      position.y - uTime * aSpeed + aPhase + uCycleHeight * 0.5,
      uCycleHeight
    ) - uCycleHeight * 0.5;

    vec3 animatedPosition = vec3(
      position.x + sin(uTime * 0.17 + aPhase) * 0.035,
      fallingY,
      position.z
    );
    vec4 viewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    float viewDepth = max(0.001, -viewPosition.z);
    float perspectiveScale = 88.0 / viewDepth;

    vGlyph = aGlyph;
    vIntensity = aIntensity * (0.82 + sin(uTime * 1.7 + aPhase) * 0.18);
    vVisibility = 1.0 - smoothstep(34.0, 68.0, viewDepth);

    gl_PointSize = clamp(
      aSize * uPixelRatio * perspectiveScale,
      2.0,
      uMaxPointSize
    );
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uAtlas;
  uniform float uAtlasColumns;
  uniform float uAtlasRows;
  uniform float uGlyphCount;
  uniform float uTime;

  varying float vGlyph;
  varying float vIntensity;
  varying float vVisibility;

  void main() {
    float animatedGlyph = mod(
      floor(vGlyph * uGlyphCount) + floor(uTime * 0.85 + vGlyph * 13.0),
      uGlyphCount
    );
    vec2 atlasCell = vec2(
      mod(animatedGlyph, uAtlasColumns),
      floor(animatedGlyph / uAtlasColumns)
    );
    vec2 pointUv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    pointUv = mix(vec2(0.08), vec2(0.92), pointUv);
    vec2 atlasUv = (atlasCell + pointUv) / vec2(uAtlasColumns, uAtlasRows);
    float glyphAlpha = texture2D(uAtlas, atlasUv).a;
    float alpha = glyphAlpha * vIntensity * vVisibility;

    if (alpha < 0.025) discard;

    vec3 dimGreen = vec3(0.02, 0.34, 0.18);
    vec3 brightGreen = vec3(0.32, 1.0, 0.68);
    vec3 color = mix(dimGreen, brightGreen, clamp(vIntensity, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

let activeInstance = null;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createGlyphAtlas() {
  const rows = Math.ceil(GLYPHS.length / ATLAS_COLUMNS);
  const atlas = globalThis.document.createElement('canvas');
  atlas.width = ATLAS_COLUMNS * ATLAS_CELL_SIZE;
  atlas.height = rows * ATLAS_CELL_SIZE;

  const context = atlas.getContext('2d', { alpha: true });
  if (!context) throw new Error('Unable to create the Matrix glyph atlas.');

  context.clearRect(0, 0, atlas.width, atlas.height);
  context.fillStyle = '#ffffff';
  context.font = `700 ${Math.round(ATLAS_CELL_SIZE * 0.7)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  Array.from(GLYPHS).forEach((glyph, index) => {
    const column = index % ATLAS_COLUMNS;
    const row = Math.floor(index / ATLAS_COLUMNS);
    context.fillText(
      glyph,
      column * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.5,
      row * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.52,
    );
  });

  const texture = new CanvasTexture(atlas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { texture, rows };
}

function createGlyphField(compact) {
  const columnCount = compact ? 52 : 112;
  const glyphsPerColumn = compact ? 15 : 24;
  const count = columnCount * glyphsPerColumn;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const intensities = new Float32Array(count);
  const sizes = new Float32Array(count);
  const random = seededRandom(0xC70F10);
  const rowSpacing = FIELD_HEIGHT / glyphsPerColumn;

  for (let column = 0; column < columnCount; column += 1) {
    const z = 5 - random() * FIELD_DEPTH;
    const viewDepth = CAMERA_Z - z;
    const visibleHalfWidth = Math.min(compact ? 11 : 27, viewDepth * (compact ? 0.34 : 0.7));
    const x = (random() - 0.5) * visibleHalfWidth * 2;
    const speed = 1.65 + random() * 3.25;
    const phase = random() * FIELD_HEIGHT;
    const columnScale = 0.82 + random() * 0.52;

    for (let row = 0; row < glyphsPerColumn; row += 1) {
      const index = column * glyphsPerColumn + row;
      const positionIndex = index * 3;
      const trailPosition = row / Math.max(1, glyphsPerColumn - 1);

      positions[positionIndex] = x + (random() - 0.5) * 0.08;
      positions[positionIndex + 1] = FIELD_HEIGHT * 0.5 - row * rowSpacing;
      positions[positionIndex + 2] = z;
      speeds[index] = speed;
      phases[index] = phase;
      glyphs[index] = random();
      intensities[index] = row === 0
        ? 1
        : Math.max(0.24, (1 - trailPosition) * (0.72 + random() * 0.26));
      sizes[index] = (2.15 + random() * 0.72) * columnScale;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1));
  geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
  geometry.setAttribute('aGlyph', new BufferAttribute(glyphs, 1));
  geometry.setAttribute('aIntensity', new BufferAttribute(intensities, 1));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));

  return geometry;
}

function damp(current, target, smoothing, delta) {
  return current + (target - current) * (1 - Math.exp(-smoothing * delta));
}

function createMatrixResources(canvas, compact) {
  let renderer;
  let atlasTexture;
  let geometry;
  let material;

  try {
    const atlas = createGlyphAtlas();
    atlasTexture = atlas.texture;
    geometry = createGlyphField(compact);
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);

    const context = renderer.getContext();
    const pointSizeRange = context.getParameter(context.ALIASED_POINT_SIZE_RANGE);
    material = new ShaderMaterial({
      uniforms: {
        uAtlas: { value: atlasTexture },
        uAtlasColumns: { value: ATLAS_COLUMNS },
        uAtlasRows: { value: atlas.rows },
        uGlyphCount: { value: GLYPHS.length },
        uTime: { value: 0 },
        uCycleHeight: { value: FIELD_HEIGHT },
        uPixelRatio: { value: 1 },
        uMaxPointSize: { value: Math.min(pointSizeRange[1], compact ? 30 : 42) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const scene = new Scene();
    const camera = new PerspectiveCamera(52, 1, 0.1, 90);
    camera.position.set(0, 0, CAMERA_Z);
    const field = new Points(geometry, material);
    field.frustumCulled = false;
    scene.add(field);

    return { renderer, atlasTexture, geometry, material, scene, camera };
  } catch (error) {
    material?.dispose();
    geometry?.dispose();
    atlasTexture?.dispose();
    renderer?.dispose();
    throw error;
  }
}

function createMatrixInstance({ canvas, compact }) {
  const { renderer, atlasTexture, geometry, material, scene, camera } = createMatrixResources(canvas, compact);

  const pointerTarget = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  const container = canvas.parentElement ?? canvas;
  let resizeObserver = null;
  let frameId = 0;
  let lastFrameTime = 0;
  let elapsedTime = 0;
  let enabled = true;
  let destroyed = false;

  function resize() {
    if (destroyed) return;
    const width = Math.max(1, container.clientWidth || globalThis.innerWidth || 1);
    const height = Math.max(1, container.clientHeight || globalThis.innerHeight || 1);
    const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, compact ? 1 : MAX_PIXEL_RATIO);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    material.uniforms.uPixelRatio.value = pixelRatio;
  }

  function onPointerMove(event) {
    if (event.pointerType === 'touch') return;
    pointerTarget.x = (event.clientX / Math.max(1, globalThis.innerWidth)) * 2 - 1;
    pointerTarget.y = (event.clientY / Math.max(1, globalThis.innerHeight)) * 2 - 1;
  }

  function resetPointer() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  }

  function shouldRender() {
    return enabled && !destroyed && !globalThis.document.hidden;
  }

  function requestFrame() {
    if (!frameId && shouldRender()) frameId = globalThis.requestAnimationFrame(render);
  }

  function render(time) {
    frameId = 0;
    if (!shouldRender()) return;

    const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
    lastFrameTime = time;
    elapsedTime += delta;

    pointer.x = damp(pointer.x, pointerTarget.x, POINTER_DAMPING, delta);
    pointer.y = damp(pointer.y, pointerTarget.y, POINTER_DAMPING, delta);
    camera.position.x = damp(camera.position.x, pointer.x * (compact ? 0.45 : 1.15), CAMERA_DAMPING, delta);
    camera.position.y = damp(camera.position.y, pointer.y * (compact ? -0.25 : -0.7), CAMERA_DAMPING, delta);
    camera.rotation.x = damp(camera.rotation.x, pointer.y * 0.025, CAMERA_DAMPING, delta);
    camera.rotation.y = damp(camera.rotation.y, pointer.x * -0.04, CAMERA_DAMPING, delta);
    material.uniforms.uTime.value = elapsedTime;

    renderer.render(scene, camera);
    requestFrame();
  }

  function onVisibilityChange() {
    lastFrameTime = 0;
    requestFrame();
  }

  function destroyInstance() {
    if (destroyed) return;
    destroyed = true;
    enabled = false;
    if (frameId) globalThis.cancelAnimationFrame(frameId);
    globalThis.removeEventListener('pointermove', onPointerMove);
    globalThis.removeEventListener('pointerleave', resetPointer);
    globalThis.removeEventListener('resize', resize);
    globalThis.document.removeEventListener('visibilitychange', onVisibilityChange);
    resizeObserver?.disconnect();
    geometry.dispose();
    material.dispose();
    atlasTexture.dispose();
    renderer.dispose();
    delete canvas.dataset.matrixState;
  }

  try {
    resizeObserver = typeof globalThis.ResizeObserver === 'function'
      ? new globalThis.ResizeObserver(resize)
      : null;
    resizeObserver?.observe(container);
    globalThis.addEventListener('pointermove', onPointerMove, { passive: true });
    globalThis.addEventListener('pointerleave', resetPointer, { passive: true });
    globalThis.addEventListener('resize', resize, { passive: true });
    globalThis.document.addEventListener('visibilitychange', onVisibilityChange);
    resize();
    canvas.dataset.matrixState = 'running';
    requestFrame();
  } catch (error) {
    destroyInstance();
    throw error;
  }

  return {
    camera,
    destroy: destroyInstance,
  };
}

/**
 * Initializes the single Matrix renderer owned by the session intro.
 * Repeated calls are safe: a previous instance is disposed before replacement.
 */
export function initMatrix({ canvas, compact = false } = {}) {
  if (typeof globalThis.document === 'undefined' || typeof canvas?.getContext !== 'function') return null;
  destroy();

  try {
    activeInstance = createMatrixInstance({ canvas, compact });
    return activeInstance;
  } catch {
    canvas.dataset.matrixState = 'fallback';
    activeInstance = null;
    return null;
  }
}

/** Releases WebGL, texture, geometry, RAF and event-listener resources. */
export function destroy() {
  activeInstance?.destroy();
  activeInstance = null;
}

/** Returns the live camera so GSAP can animate its z-position without coupling. */
export function getCamera() {
  return activeInstance?.camera ?? null;
}
