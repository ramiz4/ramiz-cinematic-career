import { Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
  Vector3,
  type Group,
  type InstancedMesh,
  type LineSegments,
} from 'three';
import { initGsapLayoutBridge } from '../js/gsap-layout-bridge.js';
import { initThreeViewportController, updateThreeViewport } from '../js/three-viewport-controller.js';

const LINK_COUNT = 28;

type SceneProps = { compact?: boolean };

function seeded(index: number, salt = 1) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createLayouts(count: number) {
  const core: Vector3[] = [];
  const network: Vector3[] = [];
  const career: Vector3[] = [];
  const products: Vector3[] = [];
  const blueprint: Vector3[] = [];
  const portal: Vector3[] = [];
  const productCenters = [
    [-2.1, 1.35, 0], [0, 1.7, -.4], [2.1, 1.35, 0],
    [-2.1, -1.35, 0], [0, -1.7, .4], [2.1, -1.35, 0],
  ];

  for (let index = 0; index < count; index += 1) {
    const ratio = index / Math.max(1, count - 1);
    const y = 1 - ratio * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = index * Math.PI * (3 - Math.sqrt(5));
    core.push(new Vector3(Math.cos(theta) * radius * 1.45, y * 1.45, Math.sin(theta) * radius * 1.45));

    network.push(new Vector3(
      (seeded(index, 2) - .5) * 6.8,
      (seeded(index, 3) - .5) * 5.2,
      (seeded(index, 4) - .5) * 2.8,
    ));

    const milestone = index % 5;
    const orbit = Math.floor(index / 5);
    career.push(new Vector3(
      Math.sin(orbit * .8 + milestone) * (1 + seeded(index, 5) * .45),
      2.7 - milestone * 1.35 + (seeded(index, 6) - .5) * .35,
      Math.cos(orbit * .8 + milestone) * .85,
    ));

    const center = productCenters[index % productCenters.length];
    products.push(new Vector3(
      center[0] + (seeded(index, 7) - .5) * .78,
      center[1] + (seeded(index, 8) - .5) * .78,
      center[2] + (seeded(index, 9) - .5) * .78,
    ));

    const column = index % 4;
    const row = Math.floor(index / 4) % 6;
    const depth = Math.floor(index / 24) % 4;
    blueprint.push(new Vector3((column - 1.5) * .82, (row - 2.5) * .72, (depth - 1.5) * .72));

    const portalAngle = ratio * Math.PI * 2;
    const portalRadius = 2.05 + (index % 3 - 1) * .16;
    portal.push(new Vector3(
      Math.cos(portalAngle) * portalRadius,
      Math.sin(portalAngle) * portalRadius,
      (seeded(index, 10) - .5) * .3,
    ));
  }

  return [core, network, career, products, blueprint, portal];
}

function useStoryAnchors() {
  const anchors = useRef<number[]>([0]);

  useEffect(() => {
    const measure = () => {
      anchors.current = Array.from(document.querySelectorAll<HTMLElement>('[data-story]'))
        .map((element) => element.offsetTop);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return anchors;
}

function EngineeringEngine({ compact = false }: SceneProps) {
  const count = compact ? 56 : 88;
  const fragmentsRef = useRef<InstancedMesh>(null);
  const linksRef = useRef<LineSegments>(null);
  const lineAttributeRef = useRef<BufferAttribute>(null);
  const linksMaterialRef = useRef<LineBasicMaterial>(null);
  const viewportRef = useRef<Group>(null);
  const pointerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);
  const coreMaterialRef = useRef<MeshBasicMaterial>(null);
  const portalRef = useRef<Group>(null);
  const storyPosition = useRef(0);
  const anchors = useStoryAnchors();
  const layouts = useMemo(() => createLayouts(count), [count]);
  const currentPositions = useMemo(() => Array.from({ length: count }, () => new Vector3()), [count]);
  const dummy = useMemo(() => new Object3D(), []);
  const mixedPosition = useMemo(() => new Vector3(), []);

  useEffect(() => initThreeViewportController(), []);

  useEffect(() => {
    const fragments = fragmentsRef.current;
    if (!fragments) return;
    const palette = [new Color('#36ff9d'), new Color('#8fffc5'), new Color('#1fc77a')];
    fragments.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let index = 0; index < count; index += 1) {
      fragments.setColorAt(index, palette[index % palette.length]);
    }
    if (fragments.instanceColor) fragments.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame(({ clock, viewport }, delta) => {
    const fragments = fragmentsRef.current;
    const viewportLayer = viewportRef.current;
    const pointerLayer = pointerRef.current;
    const world = worldRef.current;
    if (!fragments || !viewportLayer || !pointerLayer || !world) return;

    const measuredAnchors = anchors.current;
    let rawStoryPosition = 0;
    for (let index = 0; index < measuredAnchors.length - 1; index += 1) {
      if (window.scrollY >= measuredAnchors[index]) rawStoryPosition = index;
      if (window.scrollY < measuredAnchors[index + 1]) {
        const distance = Math.max(1, measuredAnchors[index + 1] - measuredAnchors[index]);
        rawStoryPosition = index + MathUtils.clamp((window.scrollY - measuredAnchors[index]) / distance, 0, 1);
        break;
      }
    }
    if (measuredAnchors.length > 1 && window.scrollY >= measuredAnchors.at(-1)!) {
      rawStoryPosition = measuredAnchors.length - 1;
    }

    storyPosition.current = MathUtils.damp(storyPosition.current, rawStoryPosition, 4.2, delta);
    const position = MathUtils.clamp(storyPosition.current, 0, layouts.length - 1);
    const fromIndex = Math.floor(position);
    const toIndex = Math.min(layouts.length - 1, fromIndex + 1);
    const mix = MathUtils.smoothstep(position - fromIndex, 0, 1);
    const elapsed = clock.elapsedTime;

    for (let index = 0; index < count; index += 1) {
      mixedPosition.lerpVectors(layouts[fromIndex][index], layouts[toIndex][index], mix);
      currentPositions[index].copy(mixedPosition);
      dummy.position.copy(mixedPosition);
      dummy.rotation.set(
        seeded(index, 11) * Math.PI + elapsed * .08,
        seeded(index, 12) * Math.PI + elapsed * .12,
        seeded(index, 13) * Math.PI,
      );
      const pulse = .72 + seeded(index, 14) * .7 + Math.sin(elapsed * 1.4 + index) * .08;
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      fragments.setMatrixAt(index, dummy.matrix);
    }
    fragments.instanceMatrix.needsUpdate = true;

    const lineAttribute = lineAttributeRef.current;
    for (let link = 0; lineAttribute && link < LINK_COUNT; link += 1) {
      const from = currentPositions[(link * 3) % count];
      const to = currentPositions[(link * 3 + 7) % count];
      lineAttribute.setXYZ(link * 2, from.x, from.y, from.z);
      lineAttribute.setXYZ(link * 2 + 1, to.x, to.y, to.z);
    }
    if (lineAttribute) lineAttribute.needsUpdate = true;
    if (linksMaterialRef.current) {
      const phaseOpacity = [.07, .24, .14, .09, .22, .18];
      linksMaterialRef.current.opacity = MathUtils.lerp(
        phaseOpacity[fromIndex],
        phaseOpacity[toIndex],
        mix,
      );
    }

    const desktopX = [2.2, 1.6, 2.2, 1.8, 2.2, 1.7];
    const targetX = compact ? 0 : MathUtils.lerp(desktopX[fromIndex], desktopX[toIndex], mix);
    const targetY = compact ? .95 : 0;
    world.position.x = MathUtils.damp(world.position.x, targetX, 3.5, delta);
    world.position.y = MathUtils.damp(world.position.y, targetY, 3.5, delta);
    world.scale.setScalar(MathUtils.damp(world.scale.x, compact ? .72 : 1, 4, delta));
    world.rotation.y = elapsed * .035 + position * .17;
    world.rotation.x = Math.sin(elapsed * .2) * .035;

    const viewportTransform = updateThreeViewport(delta);
    viewportLayer.position.x = compact ? 0 : viewportTransform.layoutX * viewport.width * .5;
    pointerLayer.position.x = compact ? 0 : viewportTransform.pointerX * Math.min(viewport.width * .024, .38);
    pointerLayer.position.y = compact ? 0 : viewportTransform.pointerY * .24;
    pointerLayer.rotation.x = compact ? 0 : viewportTransform.rotationX;
    pointerLayer.rotation.y = compact ? 0 : viewportTransform.rotationY;

    if (coreRef.current) {
      const visibility = MathUtils.clamp(1 - position * 1.3, 0, 1);
      coreRef.current.scale.setScalar(Math.max(.001, visibility));
      coreRef.current.rotation.x = elapsed * .16;
      coreRef.current.rotation.y = elapsed * .24;
      if (coreMaterialRef.current) coreMaterialRef.current.opacity = visibility * .8;
    }
    if (portalRef.current) {
      const visibility = MathUtils.smoothstep(position, 4.15, 5);
      portalRef.current.scale.setScalar(Math.max(.001, visibility));
      portalRef.current.rotation.z = -elapsed * .12;
    }
  });

  return (
    <group ref={viewportRef}>
      <group ref={pointerRef}>
        <group ref={worldRef}>
          <group ref={coreRef}>
            <mesh>
              <icosahedronGeometry args={[1.05, 2]} />
              <meshBasicMaterial ref={coreMaterialRef} color="#76ffb8" wireframe transparent opacity={.8} />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <torusGeometry args={[1.45, .018, 8, 96]} />
              <meshBasicMaterial color="#36ff9d" transparent opacity={.45} blending={AdditiveBlending} />
            </mesh>
            <mesh rotation={[0, Math.PI / 3, Math.PI / 2]}>
              <torusGeometry args={[1.72, .012, 8, 96]} />
              <meshBasicMaterial color="#8fffc5" transparent opacity={.25} blending={AdditiveBlending} />
            </mesh>
          </group>

          <instancedMesh ref={fragmentsRef} args={[undefined, undefined, count]} frustumCulled={false}>
            <boxGeometry args={[.1, .1, .42]} />
            <meshStandardMaterial
              vertexColors
              color="#b8ffda"
              emissive="#0b7548"
              emissiveIntensity={1.4}
              metalness={.75}
              roughness={.22}
            />
          </instancedMesh>

          <lineSegments ref={linksRef}>
            <bufferGeometry>
              <bufferAttribute ref={lineAttributeRef} attach="attributes-position" args={[new Float32Array(LINK_COUNT * 6), 3]} />
            </bufferGeometry>
            <lineBasicMaterial ref={linksMaterialRef} color="#62ffad" transparent opacity={.1} />
          </lineSegments>

          <group ref={portalRef} scale={.001}>
            <mesh>
              <torusGeometry args={[2.05, .055, 12, 128]} />
              <meshBasicMaterial color="#36ff9d" transparent opacity={.8} blending={AdditiveBlending} />
            </mesh>
            <mesh scale={1.08}>
              <torusGeometry args={[2.05, .016, 8, 128]} />
              <meshBasicMaterial color="#d5ffe9" transparent opacity={.45} blending={AdditiveBlending} />
            </mesh>
          </group>

          <pointLight position={[0, 0, 3]} intensity={compact ? 16 : 24} color="#45ffa5" distance={9} />
        </group>
      </group>
    </group>
  );
}

export function Scene({ compact = false }: SceneProps) {
  useEffect(() => initGsapLayoutBridge(document), []);

  return (
    <div className="scene" aria-hidden="true" data-testid="story-scene">
      <Canvas
        dpr={compact ? 1 : [1, 1.5]}
        camera={{ position: [0, 0, compact ? 9.2 : 8], fov: compact ? 58 : 50 }}
        gl={{ antialias: !compact, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: .6 }}
      >
        <fog attach="fog" args={['#030705', 8, 18]} />
        <ambientLight intensity={.5} />
        <directionalLight position={[-3, 4, 5]} intensity={2.4} color="#a9ffd2" />
        <Suspense fallback={null}>
          <Stars
            radius={55}
            depth={28}
            count={compact ? 550 : 1300}
            factor={compact ? 2 : 3}
            fade
            speed={.18}
          />
          <EngineeringEngine compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}
