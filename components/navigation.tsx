"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  Plus,
  RefreshCw,
  Pencil,
  LayoutGrid,
  Database,
  GraduationCap,
  Menu,
  Music,
  Sun,
  Moon,
} from "lucide-react"

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/criar", label: "Criar Letra", icon: Plus },
    { href: "/reescrever", label: "Reescrever", icon: RefreshCw },
    { href: "/editar", label: "Editar", icon: Pencil },
    { href: "/galeria", label: "Galeria", icon: LayoutGrid },
    { href: "/backup", label: "Backup", icon: Database },
    { href: "/aprender", label: "Aprender", icon: GraduationCap },
  ]

  return (
    <header className="border-b border-primary/10 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Music className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold hidden sm:block">Chorão Compositor</span>
          <span className="text-lg font-bold sm:hidden">Chorão</span>
        </Link>

        {/* Menu mobile */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          <ThemeToggle />
        </nav>
      </div>

      {/* Menu mobile expandido */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-2 grid gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t mt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
