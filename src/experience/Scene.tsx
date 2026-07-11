import { Float, Line, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

function Core() {
  const group = useRef<Group>(null);
  useFrame(({ clock, pointer }) => { if (!group.current) return; group.current.rotation.y = clock.elapsedTime * .08 + pointer.x * .15; group.current.rotation.x = pointer.y * .08; });
  const points: [number,number,number][] = [[-2,0,0],[0,1,0],[2,-.5,0],[0,-2,0],[-1.5,2,0],[2,2,0]];
  return <group ref={group}>{points.map((p,i) => <Float key={i} speed={1+i*.08} floatIntensity={.4}><mesh position={p}><icosahedronGeometry args={[.22,1]}/><meshStandardMaterial color="#36ff9d" emissive="#0a6c43" emissiveIntensity={2}/></mesh></Float>)}<Line points={points} color="#2be88f" transparent opacity={.25} lineWidth={1}/></group>;
}
export function Scene() {
  const reduced = useReducedMotion();
  if (reduced) return <div className="scene scene--static" aria-hidden="true"/>;
  return <div className="scene" aria-hidden="true"><Canvas dpr={[1,1.5]} camera={{ position:[0,0,8], fov:50 }}><color attach="background" args={['#050806']}/><ambientLight intensity={.4}/><pointLight position={[3,3,5]} intensity={25} color="#4affb1"/><Suspense fallback={null}><Stars radius={60} depth={30} count={1200} factor={3} fade speed={.3}/><Core/></Suspense></Canvas></div>;
}
