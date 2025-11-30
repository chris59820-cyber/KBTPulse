'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Search, Calendar, User, MapPin } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface TabGestionPointagesProps {
  user: any
}

interface Pointage {
  id: string
  salarieId: string
  salarie: {
    nom: string
    prenom: string
    matricule: string | null
  }
  perimetre?: {
    nom: string
    adresse: string
  } | null
  codeAffaire?: {
    code: string
    libelle: string
  } | null
  date: Date
  heureArrivee: string | null
  heureDepart: string | null
  nombreHeures: number | null
  deplacement: number | null
  primes: number | null
  type: string
  commentaire: string | null
}

export default function TabGestionPointages({ user }: TabGestionPointagesProps) {
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  useEffect(() => {
    loadPointages()
  }, [selectedDate])

  const loadPointages = async () => {
    try {
      const response = await fetch(`/api/espace-staff/pointages?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setPointages(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPointages = pointages.filter(p =>
    `${p.salarie.prenom} ${p.salarie.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.salarie.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion des pointages
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input text-sm"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Ajouter un pointage
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un salarié..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-1"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredPointages.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucun pointage trouvé</p>
      ) : (
        <div className="space-y-3">
          {filteredPointages.map((pointage) => (
            <div key={pointage.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-primary-600" size={20} />
                    <h5 className="font-semibold text-gray-900">
                      {pointage.salarie.prenom} {pointage.salarie.nom}
                    </h5>
                    {pointage.salarie.matricule && (
                      <span className="text-sm text-gray-500">({pointage.salarie.matricule})</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-8 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Date</p>
                      <p className="font-medium">{formatDate(pointage.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Heures</p>
                      <p className="font-medium">
                        {pointage.heureArrivee || '-'} - {pointage.heureDepart || '-'}
                      </p>
                      {pointage.nombreHeures && (
                        <p className="text-xs text-gray-500">{pointage.nombreHeures}h</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Lieu</p>
                      <p className="font-medium flex items-center gap-1">
                        {pointage.perimetre ? (
                          <>
                            <MapPin size={14} />
                            {pointage.perimetre.nom}
                          </>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                    {pointage.codeAffaire && (
                      <div>
                        <p className="text-gray-600 mb-1">Code affaire</p>
                        <p className="font-medium">{pointage.codeAffaire.code}</p>
                      </div>
                    )}
                    {pointage.deplacement && (
                      <div>
                        <p className="text-gray-600 mb-1">Déplacement</p>
                        <p className="font-medium">{pointage.deplacement} km</p>
                      </div>
                    )}
                    {pointage.primes && (
                      <div>
                        <p className="text-gray-600 mb-1">Primes</p>
                        <p className="font-medium">{pointage.primes} €</p>
                      </div>
                    )}
                  </div>

                  {pointage.commentaire && (
                    <div className="mt-2 ml-8">
                      <p className="text-sm text-gray-600">{pointage.commentaire}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            Formulaire de création de pointage - À implémenter
          </p>
        </div>
      )}
    </div>
  )
}
