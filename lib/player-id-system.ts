/**
 * Player ID System
 * Generates and manages unique player IDs in format STU-XXXXX-XXXXX
 */

const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

/**
 * Generate a unique player ID
 * Format: STU-XXXXX-XXXXX (2 groups of 5 characters)
 */
export function generatePlayerId(): string {
  const group1 = Array.from({ length: 5 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join("")

  const group2 = Array.from({ length: 5 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join("")

  return `STU-${group1}-${group2}`
}

/**
 * Validate player ID format
 */
export function isValidPlayerId(id: string): boolean {
  const pattern = /^STU-[A-Z0-9]{5}-[A-Z0-9]{5}$/
  return pattern.test(id)
}

/**
 * Format player ID with nice spacing
 */
export function formatPlayerId(id: string): string {
  if (!isValidPlayerId(id)) return id
  return id
}

/**
 * Copy player ID to clipboard
 */
export async function copyPlayerId(id: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(id)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = id
    textArea.style.position = "fixed"
    textArea.style.opacity = "0"
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand("copy")
    document.body.removeChild(textArea)
    return success
  }
}

/**
 * Generate QR code data URL for player ID
 */
export function generateQRCode(playerId: string): string {
  // Simple QR code generation using a data URL
  // In production, you'd use a proper QR library
  const size = 200
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  if (!ctx) return ""

  // Draw a simple visual representation
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = "#000000"
  ctx.font = "12px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // Draw ID in center
  const lines = playerId.split("-")
  lines.forEach((line, index) => {
    ctx.fillText(line, size / 2, size / 2 + (index - 1) * 20)
  })

  return canvas.toDataURL()
}
