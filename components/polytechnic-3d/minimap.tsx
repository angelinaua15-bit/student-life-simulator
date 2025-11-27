"use client"

import { useEffect, useRef } from "react"
import type * as THREE from "three"

interface MinimapProps {
  playerPosition: THREE.Vector3
  questMarkers?: { position: THREE.Vector3; label: string }[]
}

export function Minimap({ playerPosition, questMarkers = [] }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "rgba(240, 248, 255, 0.95)"
    ctx.fillRect(0, 0, 150, 150)

    ctx.strokeStyle = "#8b5cf6"
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, 150, 150)

    const scale = 150 / 70
    const centerX = 75
    const centerY = 75

    ctx.fillStyle = "#deb887"
    ctx.fillRect(centerX - 15 * scale, centerY + 15 * scale, 30 * scale, 2 * scale)

    const rooms = [
      { x: 0, z: 0, w: 30, h: 20, color: "#ffeaa7" },
      { x: -17.5, z: 20, w: 15, h: 20, color: "#fdcb6e" },
      { x: -25, z: 17, w: 10, h: 10, color: "#fab1a0" },
      { x: -25, z: 28, w: 10, h: 10, color: "#ff7675" },
      { x: 20, z: 20, w: 20, h: 20, color: "#74b9ff" },
    ]

    rooms.forEach((room) => {
      ctx.fillStyle = room.color
      ctx.fillRect(
        centerX + (room.x - room.w / 2) * scale,
        centerY - (room.z + room.h / 2) * scale,
        room.w * scale,
        room.h * scale,
      )
      ctx.strokeStyle = "#2d3436"
      ctx.lineWidth = 1
      ctx.strokeRect(
        centerX + (room.x - room.w / 2) * scale,
        centerY - (room.z + room.h / 2) * scale,
        room.w * scale,
        room.h * scale,
      )
    })

    questMarkers.forEach((marker) => {
      ctx.fillStyle = "#fdcb6e"
      ctx.strokeStyle = "#e17055"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX + marker.position.x * scale, centerY - marker.position.z * scale, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })

    ctx.fillStyle = "#6c5ce7"
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX + playerPosition.x * scale, centerY - playerPosition.z * scale, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = "#ffffff"
    ctx.fillStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(centerX + playerPosition.x * scale, centerY - playerPosition.z * scale)
    ctx.lineTo(centerX + playerPosition.x * scale, centerY - playerPosition.z * scale - 10)
    ctx.stroke()
  }, [playerPosition, questMarkers])

  return (
    <div className="absolute bottom-4 right-4 border-4 border-purple-500 rounded-2xl overflow-hidden shadow-2xl bg-white">
      <canvas ref={canvasRef} width={150} height={150} />
      <div
        className="absolute top-2 left-2 bg-purple-600 text-white text-sm font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wide"
        style={{
          textShadow: "0 0 5px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        Карта
      </div>
    </div>
  )
}
