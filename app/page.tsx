import Link from 'next/link'
import { Building2, Users, Wrench, Package, Calendar, Shield, LogIn } from 'lucide-react'
import Logo from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" showText={true} />
            </div>
            <Link
              href="/connexion"
              className="btn btn-primary flex items-center gap-2"
            >
              <LogIn size={20} />
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            KBTPulse - Gestion de Chantiers BTP
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gérez efficacement vos chantiers, salariés, interventions, matériel et planning 
            avec une interface moderne et intuitive
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Building2 className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion des Chantiers</h3>
            <p className="text-gray-600">
              Suivez vos projets de construction de A à Z avec toutes les informations nécessaires
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Users className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion du Personnel</h3>
            <p className="text-gray-600">
              Gérez vos salariés, leurs affectations et leurs interventions sur les chantiers
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Wrench className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interventions</h3>
            <p className="text-gray-600">
              Planifiez et suivez toutes les interventions sur vos chantiers
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Package className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventaire Matériel</h3>
            <p className="text-gray-600">
              Suivez votre matériel, son utilisation et sa disponibilité
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Calendar className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Planning</h3>
            <p className="text-gray-600">
              Organisez et planifiez les affectations de votre personnel
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="p-4 bg-primary-100 rounded-lg w-fit mb-4">
              <Shield className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurité</h3>
            <p className="text-gray-600">
              Accès sécurisé avec différents profils utilisateurs selon les rôles
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à démarrer ?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Connectez-vous pour accéder à votre espace de travail
          </p>
          <Link
            href="/connexion"
            className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
          >
            <LogIn size={24} />
            Se connecter
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 KBTPulse - Application de gestion de chantiers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
