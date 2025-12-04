import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Settings, Users, Shield, Database, Key, MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'

export default async function ConfigurationPage() {
  const user = await requireSpace('CONFIGURATION')

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Configuration" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Zone de configuration</h2>
                  <p className="text-gray-600">Accès réservé aux administrateurs et CAFF</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/configuration/perimetre" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuration du périmètre</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Saisie de l'adresse et coordonnées GPS du périmètre
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/salaries" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des profils salariés</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Gérer les informations personnelles et professionnelles des salariés
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/usines" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Création et gestion des sites</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Gérer les sites avec accès, formations et équipements
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/structure" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Structure organisationnelle</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Créer et gérer la hiérarchie : Site, Unité, Secteur, Bâtiment, Étage
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/affectation" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Shield className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Affectation du personnel</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Affecter le personnel sur les périmètres et définir les rôles
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/utilisateurs" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Créer, modifier et gérer les comptes utilisateurs et leurs rôles
                </p>
                <span className="text-sm text-primary-600 hover:text-primary-700">
                  Accéder →
                </span>
              </a>

              <a href="/configuration/base-de-donnees" className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-300 bg-yellow-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Database className="text-yellow-700" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Administration Base de données</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Accéder et modifier l'ensemble des tableaux de la base de données
                </p>
                <span className="text-sm text-yellow-700 hover:text-yellow-800 font-medium">
                  Accéder →
                </span>
              </a>
            </div>

            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Version de l'application</p>
                  <p className="text-gray-900 font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Environnement</p>
                  <p className="text-gray-900 font-medium">{process.env.NODE_ENV || 'development'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
