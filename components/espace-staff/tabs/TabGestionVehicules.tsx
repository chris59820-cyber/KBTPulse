'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Truck, Plus, Car, Wrench, CheckCircle, AlertCircle, Calendar, FileText } from 'lucide-react'

interface TabGestionVehiculesProps {
  user: any
}

interface Vehicule {
  id: string
  type: string
  marque: string | null
  modele: string | null
  immatriculation: string
  kilometrage: number
  statut: string
  affectations: Array<{
    id: string
    salarie?: {
      nom: string
      prenom: string
    } | null
    intervention?: {
      titre: string
    } | null
    dateAttribution: string
  }>
  _count: {
    historiques: number
    documents: number
  }
}

export default function TabGestionVehicules({ user }: TabGestionVehiculesProps) {
  const [loading, setLoading] = useState(true)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [stats, setStats] = useState({
    total: 0,
    disponible: 0,
    enUtilisation: 0,
    maintenance: 0,
    horsService: 0
  })

  useEffect(() => {
    loadVehicules()
  }, [])

  const loadVehicules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicules')
      if (response.ok) {
        const data = await response.json()
        setVehicules(data)
        
        // Calculer les statistiques
        setStats({
          total: data.length,
          disponible: data.filter((v: Vehicule) => v.statut === 'disponible').length,
          enUtilisation: data.filter((v: Vehicule) => v.statut === 'en_utilisation').length,
          maintenance: data.filter((v: Vehicule) => v.statut === 'maintenance').length,
          horsService: data.filter((v: Vehicule) => v.statut === 'hors_service').length
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error)
    } finally {
      setLoading(false)
    }
  }

  const vehiculeIcons: Record<string, any> = {
    Voiture: Car,
    Camion: Truck,
    Engin: Wrench
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <p className="text-gray-500 text-center py-8">Chargement des véhicules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion des véhicules
        </h3>
        <Link
          href="/vehicules/nouveau"
          className="btn btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau véhicule
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.disponible}</div>
          <div className="text-sm text-gray-500 mt-1">Disponibles</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.enUtilisation}</div>
          <div className="text-sm text-gray-500 mt-1">En utilisation</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          <div className="text-sm text-gray-500 mt-1">Maintenance</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{stats.horsService}</div>
          <div className="text-sm text-gray-500 mt-1">Hors service</div>
        </div>
      </div>

      {/* Liste des véhicules récents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Véhicules récents</h4>
          <Link href="/vehicules" className="text-sm text-primary-600 hover:underline">
            Voir tous →
          </Link>
        </div>

        {vehicules.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">Aucun véhicule enregistré</p>
            <Link href="/vehicules/nouveau" className="btn btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              Ajouter un véhicule
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicules.slice(0, 5).map((vehicule) => {
              const Icon = vehiculeIcons[vehicule.type] || Truck
              const affectationActive = vehicule.affectations[0] // Affectations actives déjà filtrées dans l'API
              
              return (
                <Link
                  key={vehicule.id}
                  href={`/vehicules/${vehicule.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Icon className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {vehicule.immatriculation}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicule.type}
                          {vehicule.marque && vehicule.modele && (
                            <> - {vehicule.marque} {vehicule.modele}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {affectationActive && (
                        <div className="flex items-center gap-1 text-primary-600">
                          <Calendar size={14} />
                          <span>
                            {affectationActive.salarie 
                              ? `${affectationActive.salarie.prenom} ${affectationActive.salarie.nom}`
                              : affectationActive.intervention?.titre || 'Affecté'}
                          </span>
                        </div>
                      )}
                      <span className={`badge ${
                        vehicule.statut === 'disponible' ? 'badge-success' :
                        vehicule.statut === 'en_utilisation' ? 'badge-info' :
                        vehicule.statut === 'maintenance' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {vehicule.statut.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>{vehicule._count.historiques} historique(s)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>{vehicule._count.documents} document(s)</span>
                    </div>
                    {vehicule.kilometrage && (
                      <div className="flex items-center gap-1">
                        <Truck size={12} />
                        <span>{vehicule.kilometrage.toLocaleString('fr-FR')} km</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Description et lien vers la page complète */}
      <div className="card">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Gestion complète des véhicules</h4>
          <p className="text-gray-600 text-sm">
            Cette section permet de gérer les véhicules et engins par plaque d'immatriculation :
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Enregistrement des documents (carte grise, assurance, contrôle technique)</li>
            <li>Fiche de suivi des véhicules</li>
            <li>Historique (révision, entretien, kilométrage)</li>
            <li>Affectation à une personne ou à une intervention</li>
            <li>Photos et fiches de constat lors de l'attribution et de la restitution</li>
            <li>Création et modification des véhicules</li>
          </ul>
          <div className="pt-4">
            <Link 
              href="/vehicules" 
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Truck size={18} />
              Accéder à la gestion complète des véhicules →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
