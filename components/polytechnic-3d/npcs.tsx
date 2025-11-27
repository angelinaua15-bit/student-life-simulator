"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, useKeyboardControls } from "@react-three/drei"
import { npcs } from "@/lib/polytechnic-3d-data"
import * as THREE from "three"

interface NPCsProps {
  onDialogue: (dialogue: string[]) => void
  onInteractionPrompt: (prompt: string | null) => void
}

export function NPCs({ onDialogue, onInteractionPrompt }: NPCsProps) {
  return (
    <>
      {npcs.map((npc) => (
        <NPC key={npc.id} npc={npc} onDialogue={onDialogue} onInteractionPrompt={onInteractionPrompt} />
      ))}
    </>
  )
}

function NPC({ npc, onDialogue, onInteractionPrompt }: any) {
  const meshRef = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls()
  const patrolIndex = useRef(0)
  const patrolProgress = useRef(0)
  const isNearPlayer = useRef(false)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const camera = state.camera
    const distance = meshRef.current.position.distanceTo(camera.position)

    if (distance < 3) {
      if (!isNearPlayer.current) {
        isNearPlayer.current = true
        onInteractionPrompt(`поговорити з ${npc.name}`)
      }

      const keys = getKeys()
      if (keys.interact) {
        onDialogue(npc.dialogue)
        onInteractionPrompt(null)
      }
    } else {
      if (isNearPlayer.current) {
        isNearPlayer.current = false
        onInteractionPrompt(null)
      }
    }

    // Patrol movement
    if (npc.patrolPath && npc.patrolPath.length > 1) {
      const currentPoint = npc.patrolPath[patrolIndex.current]
      const nextIndex = (patrolIndex.current + 1) % npc.patrolPath.length
      const nextPoint = npc.patrolPath[nextIndex]

      const start = new THREE.Vector3(...currentPoint)
      const end = new THREE.Vector3(...nextPoint)

      patrolProgress.current += delta * 0.3
      if (patrolProgress.current >= 1) {
        patrolProgress.current = 0
        patrolIndex.current = nextIndex
      }

      meshRef.current.position.lerpVectors(start, end, patrolProgress.current)
    }
  })

  const color = npc.role === "professor" ? "#4169e1" : npc.role === "student" ? "#32cd32" : "#ffa500"

  return (
    <group ref={meshRef} position={npc.position}>
      {/* Body */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Name tag */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {npc.name}
      </Text>
    </group>
  )
}
