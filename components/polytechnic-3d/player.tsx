"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import * as THREE from "three"

interface PlayerProps {
  controlsLocked: boolean
  onInteractionPrompt: (prompt: string | null) => void
  onPlayerMove?: (position: THREE.Vector3) => void
}

export function Player({ controlsLocked, onInteractionPrompt, onPlayerMove }: PlayerProps) {
  const { camera } = useThree()
  const playerRef = useRef({
    position: new THREE.Vector3(0, 1.6, -25),
    velocity: new THREE.Vector3(),
    canJump: true,
    jumpCount: 0,
    isSliding: false,
    slideTime: 0,
  })
  const [, getKeys] = useKeyboardControls()
  const [movementState, setMovementState] = useState<"idle" | "walking" | "running" | "jumping" | "sliding">("idle")

  useEffect(() => {
    camera.position.set(0, 1.6, -25)
  }, [camera])

  useFrame((state, delta) => {
    if (controlsLocked) return

    const keys = getKeys()
    const player = playerRef.current

    const maxSpeed = keys.run ? 12 : 6
    const acceleration = keys.run ? 25 : 15
    const deceleration = 0.85

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, direction).normalize()

    // Handle sliding
    if (keys.run && keys.backward && !player.isSliding && player.canJump) {
      player.isSliding = true
      player.slideTime = 0.5
      player.velocity.add(direction.multiplyScalar(-20))
      setMovementState("sliding")
    }

    if (player.isSliding) {
      player.slideTime -= delta
      if (player.slideTime <= 0) {
        player.isSliding = false
      }
    }

    // Movement with acceleration
    if (!player.isSliding) {
      const moveDir = new THREE.Vector3()

      if (keys.forward) moveDir.add(direction)
      if (keys.backward) moveDir.add(direction.clone().negate())
      if (keys.left) moveDir.add(right)
      if (keys.right) moveDir.add(right.clone().negate())

      if (moveDir.length() > 0) {
        moveDir.normalize()
        player.velocity.x += moveDir.x * acceleration * delta
        player.velocity.z += moveDir.z * acceleration * delta

        // Limit speed
        const horizontalSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.z ** 2)
        if (horizontalSpeed > maxSpeed) {
          const scale = maxSpeed / horizontalSpeed
          player.velocity.x *= scale
          player.velocity.z *= scale
        }

        setMovementState(keys.run ? "running" : "walking")
      } else {
        setMovementState("idle")
      }
    }

    // Double jump
    if (keys.jump && player.jumpCount < 2) {
      if (player.canJump) {
        player.velocity.y = 6
        player.jumpCount++
        player.canJump = false
        setMovementState("jumping")

        setTimeout(() => {
          player.canJump = true
        }, 200)
      }
    }

    // Apply gravity
    player.velocity.y -= 20 * delta

    // Update position
    player.position.add(player.velocity.clone().multiplyScalar(delta))

    // Floor collision with landing detection
    if (player.position.y < 1.6) {
      player.position.y = 1.6
      player.velocity.y = 0
      player.jumpCount = 0
      if (movementState === "jumping") {
        setMovementState("idle")
      }
    }

    // Smooth boundary checks
    player.position.x = Math.max(-35, Math.min(35, player.position.x))
    player.position.z = Math.max(-35, Math.min(35, player.position.z))

    // Apply deceleration with inertia
    player.velocity.x *= deceleration
    player.velocity.z *= deceleration

    // Smooth camera follow with slight lag
    const targetPos = player.position.clone()
    camera.position.lerp(targetPos, 0.15)

    // Notify parent of position updates
    if (onPlayerMove) {
      onPlayerMove(player.position.clone())
    }
  })

  return null
}
