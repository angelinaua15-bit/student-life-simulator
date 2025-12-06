import "@/lib/btoa-polyfill"
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { GlobalModalProvider } from "@/components/global-modal-provider"
import { Premium3DBackground } from "@/components/premium-3d-background"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EVO STUDENT - Симулятор студентського життя",
  description: "Керуй життям студента, грай в міні-ігри, заробляй гроші та досягай успіху!",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // UTF-8 compatible btoa/atob - must run BEFORE any modules
              (function() {
                if (typeof window === 'undefined') return;
                
                const originalBtoa = window.btoa;
                const originalAtob = window.atob;
                
                window.btoa = function(str) {
                  try {
                    return originalBtoa(str);
                  } catch (e) {
                    try {
                      // Convert UTF-8 to Latin1-compatible format
                      const encoder = new TextEncoder();
                      const utf8Array = encoder.encode(str);
                      let binaryString = '';
                      for (let i = 0; i < utf8Array.length; i++) {
                        binaryString += String.fromCharCode(utf8Array[i]);
                      }
                      return originalBtoa(binaryString);
                    } catch (err) {
                      console.warn('[btoa] UTF-8 encoding failed, returning empty string');
                      return '';
                    }
                  }
                };
                
                window.atob = function(base64) {
                  try {
                    const binaryString = originalAtob(base64);
                    try {
                      const bytes = new Uint8Array(binaryString.length);
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }
                      const decoder = new TextDecoder();
                      return decoder.decode(bytes);
                    } catch (e) {
                      return binaryString;
                    }
                  } catch (err) {
                    console.warn('[atob] Decoding failed, returning empty string');
                    return '';
                  }
                };
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <Premium3DBackground />
        {children}
        <Analytics />
        <GlobalModalProvider />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress external errors (wallet extensions, btoa, etc.)
              window.addEventListener('unhandledrejection', function(event) {
                if (!event) return;
                
                try {
                  const errorStr = String(event.reason || '');
                  const errorMessage = event.reason?.message || '';
                  
                  // Suppress known external errors
                  if (errorStr.match(/(wallet|ethereum|web3|btoa|latin1|metamask)/i) ||
                      errorMessage.match(/(wallet|ethereum|web3|btoa|latin1|metamask)/i)) {
                    event.preventDefault();
                    return false;
                  }
                } catch (e) {
                  // Suppress any error checking errors
                }
              });
              
              // Suppress console errors for external issues
              const originalError = console.error;
              console.error = function(...args) {
                const errorText = args.join(' ').toLowerCase();
                if (errorText.match(/(wallet|ethereum|web3|btoa|latin1|metamask)/)) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </body>
    </html>
  )
}
