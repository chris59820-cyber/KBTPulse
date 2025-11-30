import Link from 'next/link'
import { 
  Wrench, 
  User, 
  Clock, 
  Calendar, 
  MessageCircle, 
  Users, 
  Timer,
  Building2
} from 'lucide-react'

const boutons = [
  {
    href: '/interventions',
    label: 'Interventions',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    href: '/mon-profil',
    label: 'Mon Profil',
    icon: User,
    color: 'bg-green-100 text-green-600'
  },
  {
    href: '/pointages',
    label: 'Pointages',
    icon: Clock,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    href: '/planning',
    label: 'Planning',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    href: '/messagerie',
    label: 'Messagerie',
    icon: MessageCircle,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    href: '/affectations',
    label: 'Affectation',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    href: '/horaires',
    label: 'Horaires',
    icon: Timer,
    color: 'bg-teal-100 text-teal-600'
  },
  {
    href: '/clients-donneurs-ordre',
    label: 'Clients & Donneurs d\'ordre',
    icon: Building2,
    color: 'bg-cyan-100 text-cyan-600'
  },
]

export default function BoutonsAccesRapide() {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Accès rapide</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boutons.map((bouton) => {
          const Icon = bouton.icon
          
          return (
            <Link
              key={bouton.href}
              href={bouton.href}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all hover:scale-105"
            >
              <div className={`p-3 rounded-lg ${bouton.color} mb-2`}>
                <Icon size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {bouton.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
