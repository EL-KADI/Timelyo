import type React from "react"
import type { Metadata } from "next"
import { Inter, Cairo } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const cairo = Cairo({ subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "Timelyo",
  description:
    "A stunning calendar application supporting both Gregorian and Hijri dates with Arabic and English support",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} ${cairo.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
