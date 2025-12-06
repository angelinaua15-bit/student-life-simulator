// Must be imported first in layout.tsx before any other code

// Browser polyfill
if (typeof window !== "undefined" && typeof window.btoa === "function") {
  const originalBtoa = window.btoa
  const originalAtob = window.atob

  window.btoa = (str: string): string => {
    try {
      // Try original first
      return originalBtoa(str)
    } catch (e) {
      // If it fails with non-Latin1 chars, convert to UTF-8 first
      try {
        const encoder = new TextEncoder()
        const utf8Array = encoder.encode(str)
        let binaryString = ""
        for (let i = 0; i < utf8Array.length; i++) {
          binaryString += String.fromCharCode(utf8Array[i])
        }
        return originalBtoa(binaryString)
      } catch (err) {
        console.error("[v0] btoa UTF-8 encoding failed:", err)
        return ""
      }
    }
  }

  window.atob = (base64: string): string => {
    try {
      const binaryString = originalAtob(base64)
      try {
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const decoder = new TextDecoder()
        return decoder.decode(bytes)
      } catch (e) {
        return binaryString
      }
    } catch (err) {
      console.error("[v0] atob decoding failed:", err)
      return ""
    }
  }
}

// Node.js / Server-side polyfill
if (typeof global !== "undefined" && typeof Buffer !== "undefined") {
  // Override global btoa/atob for server-side
  ;(global as any).btoa = (str: string): string => {
    try {
      return Buffer.from(str, "utf-8").toString("base64")
    } catch (err) {
      console.error("[v0] Server btoa failed:", err)
      return ""
    }
  }
  ;(global as any).atob = (base64: string): string => {
    try {
      return Buffer.from(base64, "base64").toString("utf-8")
    } catch (err) {
      console.error("[v0] Server atob failed:", err)
      return ""
    }
  }
}

export {}
