import Link from 'next/link'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function AccesRefusePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="text-red-600" size={48} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Accès refusé
          </h1>
          
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/tableau-de-bord"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Retour au tableau de bord
            </Link>
            
            <Link
              href="/"
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
