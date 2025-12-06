// UTF-8 compatible btoa/atob polyfill
// This must be imported first in layout.tsx

if (typeof window !== "undefined") {
  const originalBtoa = window.btoa
  const originalAtob = window.atob

  window.btoa = (str: string): string => {
    try {
      return originalBtoa(str)
    } catch (e) {
      try {
        const encoder = new TextEncoder()
        const utf8Data = encoder.encode(str)
        let binaryString = ""
        for (let i = 0; i < utf8Data.length; i++) {
          binaryString += String.fromCharCode(utf8Data[i])
        }
        return originalBtoa(binaryString)
      } catch (err) {
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
      return ""
    }
  }
}

export {}
