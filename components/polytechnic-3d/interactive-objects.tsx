"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { interactiveObjects } from "@/lib/polytechnic-3d-data"
import type * as THREE from "three"

interface InteractiveObjectsProps {
  onCollect: (itemId: string) => void
  onInteract: (type: string, id: string) => void
  onInteractionPrompt: (prompt: string | null) => void
  collectedItems: string[]
}

export function InteractiveObjects({
  onCollect,
  onInteract,
  onInteractionPrompt,
  collectedItems,
}: InteractiveObjectsProps) {
  return (
    <>
      {interactiveObjects.map((obj) => {
        const isCollected = obj.givesItem && collectedItems.includes(obj.id)
        if (isCollected) return null

        return (
          <InteractiveObject
            key={obj.id}
            object={obj}
            onCollect={onCollect}
            onInteract={onInteract}
            onInteractionPrompt={onInteractionPrompt}
          />
        )
      })}
    </>
  )
}

function InteractiveObject({ object, onCollect, onInteract, onInteractionPrompt }: any) {
  const meshRef = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls()
  const isNearPlayer = useRef(false)
  const hasInteracted = useRef(false)

  useFrame((state) => {
    if (!meshRef.current) return

    const camera = state.camera
    const distance = meshRef.current.position.distanceTo(camera.position)

    // Rotate items
    if (object.type === "item") {
      meshRef.current.rotation.y += 0.02
    }

    if (distance < 2 && !hasInteracted.current) {
      if (!isNearPlayer.current) {
        isNearPlayer.current = true
        const action = object.givesItem ? "підібрати" : object.type === "light" ? "увімкнути світло" : "взаємодіяти"
        onInteractionPrompt(`${action}: ${object.name}`)
      }

      const keys = getKeys()
      if (keys.interact) {
        if (object.givesItem) {
          onCollect(object.givesItem)
        } else {
          onInteract(object.type, object.id)
        }
        hasInteracted.current = true
        onInteractionPrompt(null)
      }
    } else if (distance >= 2) {
      if (isNearPlayer.current) {
        isNearPlayer.current = false
        onInteractionPrompt(null)
      }
    }
  })

  const renderObject = () => {
    switch (object.type) {
      case "item":
        if (object.givesItem === "tea-bag") {
          return (
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.3, 0.1]} />
              <meshStandardMaterial color="#e6c968" emissive="#e6c968" emissiveIntensity={0.3} />
            </mesh>
          )
        }
        if (object.givesItem === "textbook") {
          return (
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.5, 0.7, 0.1]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          )
        }
        if (object.givesItem === "schedule-piece") {
          return (
            <mesh castShadow>
              <planeGeometry args={[0.4, 0.3]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          )
        }
        break

      case "projector":
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.2, 0.3]} />
              <meshStandardMaterial color="#2c2c2c" />
            </mesh>
            <mesh position={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )

      case "light":
        return (
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#f5f5dc" />
          </mesh>
        )

      case "book":
        return (
          <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshStandardMaterial color="#8b0000" />
          </mesh>
        )

      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
        )
    }
  }

  return (
    <group ref={meshRef} position={object.position}>
      {renderObject()}
    </group>
  )
}
