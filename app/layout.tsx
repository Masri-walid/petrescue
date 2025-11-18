import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "PetRescue Connect - Smart Platform for Animal Rescue & Adoption",
  description:
    "Connecting communities to rescue, care for, and find loving homes for stray animals. Join citizens, shelters, and veterinarians in making a difference.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  )
}
