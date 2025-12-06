export async function register() {
  // Monkey-patch btoa/atob to handle UTF-8 BEFORE any other code runs
  if (typeof globalThis !== "undefined") {
    const originalBtoa = globalThis.btoa
    const originalAtob = globalThis.atob

    // UTF-8 safe btoa
    globalThis.btoa = (str: string): string => {
      try {
        // Try original first for Latin1 strings
        return originalBtoa(str)
      } catch (e) {
        // If it fails, encode as UTF-8
        try {
          const encoder = new TextEncoder()
          const utf8Bytes = encoder.encode(str)
          let binaryString = ""
          for (let i = 0; i < utf8Bytes.length; i++) {
            binaryString += String.fromCharCode(utf8Bytes[i])
          }
          return originalBtoa(binaryString)
        } catch (err) {
          console.error("[v0] btoa UTF-8 encoding failed:", err)
          return ""
        }
      }
    }

    // UTF-8 safe atob
    globalThis.atob = (str: string): string => {
      try {
        const binaryString = originalAtob(str)
        // Try to decode as UTF-8
        try {
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const decoder = new TextDecoder()
          return decoder.decode(bytes)
        } catch {
          // If UTF-8 decoding fails, return as-is
          return binaryString
        }
      } catch (err) {
        console.error("[v0] atob decoding failed:", err)
        return ""
      }
    }
  }
}
