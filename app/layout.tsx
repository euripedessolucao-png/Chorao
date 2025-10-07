import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Seu App",
  description: "Descrição do seu app",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          <div>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
