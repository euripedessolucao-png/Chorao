'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { 
  Home, Plus, RefreshCw, Pencil, LayoutGrid, 
  Database, TrendingUp, GraduationCap, HelpCircle, 
  Menu, Music, Sun, Moon 
} from 'lucide-react'

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            window.location.href = '/'
            break
          case '2':
            e.preventDefault()
            window.location.href = '/create'
            break
          // ... outros atalhos
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/create', label: 'Nova Letra', icon: Plus },
    { href: '/rewrite', label: 'Reescrever', icon: RefreshCw },
    { href: '/editar', label: 'Editar com Assistente', icon: Pencil },
    { href: '/gallery', label: 'Galeria', icon: LayoutGrid },
    { href: '/backup', label: 'Backup', icon: Database },
    { href: '/melhorias', label: 'Melhorias', icon: TrendingUp },
    { href: '/aprender', label: 'Aprender', icon: GraduationCap },
    { href: '/manual', label: 'Manual', icon: HelpCircle },
  ]

  return (
    <header className="border-b border-primary/10 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Music className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold hidden sm:block">Chorão - Compositor</span>
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
                <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
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
          </div>
        </div>
      )}
    </header>
  )
}