'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Calendar, 
  Package, 
  Building2,
  User,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SessionUser } from '@/lib/types'
import Logo from '@/components/Logo'

interface SidebarClientProps {
  user: SessionUser | null
}

interface MenuItem {
  href: string
  label: string
  icon: any
  roles?: string[]
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const allMenuItems: MenuItem[] = [
    { href: '/accueil', label: 'Accueil', icon: LayoutDashboard },
    { href: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/mon-profil', label: 'Mon Profil', icon: User },
    { href: '/ouvriers', label: 'Gestion des ouvriers', icon: Users, roles: ['PREPA', 'RDC', 'CAFF', 'AUTRE', 'ADMIN'] },
    { href: '/interventions', label: 'Interventions', icon: Wrench },
    { 
      href: '/espace-staff', 
      label: 'Espace Staff', 
      icon: Briefcase,
      roles: ['PREPA', 'CE', 'RDC', 'CAFF', 'RH', 'AUTRE', 'OUVRIER', 'ADMIN']
    },
    { 
      href: '/espace-rdc', 
      label: 'Espace RDC', 
      icon: Shield,
      roles: ['RDC', 'CAFF', 'ADMIN']
    },
    { 
      href: '/espace-caff', 
      label: 'Espace CAFF', 
      icon: Shield,
      roles: ['CAFF', 'ADMIN']
    },
    { href: '/chantiers', label: 'Chantiers', icon: Building2 },
    { href: '/salaries', label: 'Salariés', icon: Users },
    { href: '/materiel', label: 'Matériel', icon: Package },
    { href: '/planning', label: 'Planning', icon: Calendar },
    { 
      href: '/configuration', 
      label: 'Configuration', 
      icon: Settings,
      roles: ['CAFF', 'ADMIN']
    },
  ]

  // Filtrer les éléments du menu selon le rôle
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true // Accessible à tous
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const handleDeconnexion = async () => {
    try {
      await fetch('/api/auth/deconnexion', { method: 'POST' })
      router.push('/connexion')
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-52 bg-gray-800 text-white z-40 transform transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-3 border-b border-gray-700">
          <Logo size="sm" showText={true} variant="dark" />
          {user && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs font-medium text-white truncate">
                {user.prenom || user.nom || user.identifiant}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon size={18} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-700 space-y-1">
          {user && (
            <button
              onClick={handleDeconnexion}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
            >
              <LogOut size={18} />
              <span className="truncate">Déconnexion</span>
            </button>
          )}
          <p className="text-xs text-gray-400 text-center">
            © 2024 KBTPulse
          </p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
