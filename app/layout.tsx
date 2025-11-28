import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { GlobalModalProvider } from "@/components/global-modal-provider"

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
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <GlobalModalProvider />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                if (!event) return;
                
                try {
                  const errorStr = JSON.stringify(event.reason) || String(event.reason) || '';
                  const errorMessage = event.reason?.message || '';
                  const errorName = event.reason?.name || '';
                  const errorCode = event.reason?.code || '';
                  
                  const walletKeywords = [
                    'MetaMask', 'metamask', 'METAMASK',
                    'ethereum', 'Ethereum', 'ETHEREUM',
                    'wallet', 'Wallet', 'WALLET',
                    'Web3', 'web3', 'WEB3',
                    'crypto', 'Crypto', 'CRYPTO',
                    'connect', 'Connect', 'CONNECT',
                    'provider', 'Provider', 'PROVIDER'
                  ];
                  
                  const shouldSuppress = walletKeywords.some(keyword => 
                    errorStr.toLowerCase().includes(keyword.toLowerCase()) ||
                    errorMessage.toLowerCase().includes(keyword.toLowerCase()) ||
                    errorName.toLowerCase().includes(keyword.toLowerCase()) ||
                    String(errorCode).toLowerCase().includes(keyword.toLowerCase())
                  );
                  
                  if (shouldSuppress) {
                    event.preventDefault();
                    console.debug('[EVO STUDENT] Wallet extension error suppressed:', errorStr.substring(0, 100));
                    return false;
                  }
                } catch (e) {
                  const fullError = String(event.reason || '');
                  if (fullError.match(/(meta|wallet|ethereum|web3|crypto)/i)) {
                    event.preventDefault();
                    return false;
                  }
                }
              });
              
              const originalError = console.error;
              console.error = function(...args) {
                const errorText = args.join(' ').toLowerCase();
                if (errorText.includes('metamask') || 
                    errorText.includes('ethereum') || 
                    errorText.includes('wallet') ||
                    errorText.includes('web3')) {
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
