"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export function PolytechnicWorld() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshStandardMaterial color="#90c890" roughness={0.7} metalness={0.1} />
      </mesh>

      <group position={[0, 0, -15]}>
        <mesh castShadow receiveShadow position={[0, 5, 0]}>
          <boxGeometry args={[30, 10, 2]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.5} metalness={0.2} />
        </mesh>

        {[-10, -5, 0, 5, 10].map((x, i) => (
          <mesh key={i} position={[x, 5, 1.05]}>
            <boxGeometry args={[2, 3, 0.1]} />
            <meshPhysicalMaterial
              color="#b3d9ff"
              transparent
              opacity={0.4}
              roughness={0.05}
              metalness={0.95}
              reflectivity={0.9}
            />
          </mesh>
        ))}

        {/* Window frames */}
        {[-10, -5, 0, 5, 10].map((x, i) => (
          <group key={`frame-${i}`}>
            <mesh position={[x, 5, 1.1]}>
              <boxGeometry args={[2.2, 0.1, 0.05]} />
              <meshStandardMaterial color="#8b6f47" />
            </mesh>
            <mesh position={[x, 3.5, 1.1]}>
              <boxGeometry args={[2.2, 0.1, 0.05]} />
              <meshStandardMaterial color="#8b6f47" />
            </mesh>
            <mesh position={[x, 6.5, 1.1]}>
              <boxGeometry args={[2.2, 0.1, 0.05]} />
              <meshStandardMaterial color="#8b6f47" />
            </mesh>
          </group>
        ))}
      </group>

      <RoomBox position={[0, 3, 0]} size={[30, 6, 20]} color="#faf0e6" name="Головний хол" />
      <RoomBox position={[-17.5, 3, 20]} size={[15, 6, 20]} color="#f5f5dc" name="Коридор 1" />
      <RoomBox position={[-25, 3, 17]} size={[10, 6, 10]} color="#ffe4c4" name="Аудиторія 301" />
      <RoomBox position={[-25, 3, 28]} size={[10, 6, 10]} color="#ffefd5" name="Лабораторія 101" />
      <RoomBox position={[20, 3, 20]} size={[20, 6, 20]} color="#fff8dc" name="Бібліотека" />

      <AnimatedTree position={[-10, 0, -22]} />
      <AnimatedTree position={[10, 0, -22]} />
      <AnimatedTree position={[-15, 0, -22]} />
      <AnimatedTree position={[15, 0, -22]} />

      <Bench position={[-5, 0, -20]} />
      <Bench position={[5, 0, -20]} />
      <Bench position={[0, 0, -18]} />

      <BookShelf position={[15, 0, 15]} />
      <BookShelf position={[15, 0, 20]} />
      <BookShelf position={[15, 0, 25]} />
      <BookShelf position={[23, 0, 15]} />
      <BookShelf position={[23, 0, 20]} />
      <BookShelf position={[23, 0, 25]} />

      {[-26, -24].map((x) => [15, 18].map((z) => <Desk key={`${x}-${z}`} position={[x, 0, z]} />))}

      <pointLight position={[0, 4, 0]} intensity={1.2} color="#fff8dc" distance={20} decay={2} />
      <pointLight position={[20, 4, 20]} intensity={1.0} color="#fff8dc" distance={20} decay={2} />
      <pointLight position={[-25, 4, 17]} intensity={1.0} color="#fff8dc" distance={15} decay={2} />
      <pointLight position={[-25, 4, 28]} intensity={1.0} color="#fff8dc" distance={15} decay={2} />
      <pointLight position={[0, 8, -15]} intensity={0.8} color="#ffffff" distance={30} decay={2} />
    </group>
  )
}

function RoomBox({ position, size, color, name }: any) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, -3, 0]}>
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshStandardMaterial color="#deb887" roughness={0.6} metalness={0.15} />
      </mesh>

      <mesh castShadow position={[0, 0, -size[2] / 2]}>
        <boxGeometry args={[size[0], size[1], 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0, size[2] / 2]}>
        <boxGeometry args={[size[0], size[1], 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-size[0] / 2, 0, 0]}>
        <boxGeometry args={[0.5, size[1], size[2]]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[size[0] / 2, 0, 0]}>
        <boxGeometry args={[0.5, size[1], size[2]]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      <mesh receiveShadow position={[0, 3, 0]}>
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.5} emissive="#fff8dc" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function AnimatedTree({ position }: any) {
  const treeRef = useRef<THREE.Group>(null)
  const leavesRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      leavesRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={treeRef} position={position}>
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 2, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>

      <mesh ref={leavesRef} castShadow position={[0, 3, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#4a7c3a" roughness={0.6} />
      </mesh>

      <mesh castShadow position={[0, 3.8, 0]}>
        <coneGeometry args={[1.2, 2.5, 8]} />
        <meshStandardMaterial color="#5a8c4a" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Bench({ position }: any) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.1, 0.5]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh castShadow position={[0, 0.25, -0.2]}>
        <boxGeometry args={[2, 0.4, 0.1]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.5} />
      </mesh>
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.4]} />
          <meshStandardMaterial color="#6b4423" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function BookShelf({ position }: any) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 2, 3]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.4} />
      </mesh>
      {[0.6, 1.2, 1.8].map((y, i) => (
        <mesh key={i} castShadow position={[0.1, y, 0]}>
          <boxGeometry args={[0.3, 0.15, 2.8]} />
          <meshStandardMaterial color={["#dc143c", "#4169e1", "#228b22"][i]} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Desk({ position }: any) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#b8956a" roughness={0.3} metalness={0.25} />
      </mesh>
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.5]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
