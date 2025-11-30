'use client'

import { useState, useEffect } from 'react'
import { User, Edit, Trash2, Mail, Phone, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import FormSalarie from './FormSalarie'

interface Salarie {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  poste: string
  fonction: string | null
  matricule: string | null
  dateEmbauche: Date
  typeContrat: string | null
  tauxHoraire: number | null
  niveauAcces: string | null
  photoUrl: string | null
  user: {
    role: string
  } | null
}

interface ListeSalariesProps {
  salaries: Salarie[]
  perimetres: any[]
  refreshListRef?: React.MutableRefObject<(() => void) | null>
}

export default function ListeSalaries({ salaries, perimetres, refreshListRef }: ListeSalariesProps) {
  const [selectedSalarie, setSelectedSalarie] = useState<Salarie | null>(null)
  const [salariesList, setSalariesList] = useState<Salarie[]>(salaries)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour rafraîchir la liste depuis le serveur
  const refreshList = async () => {
    try {
      const response = await fetch('/api/configuration/salaries')
      if (response.ok) {
        const updatedSalaries = await response.json()
        setSalariesList(updatedSalaries)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la liste:', error)
    }
  }

  // Exposer la fonction refreshList via la ref si fournie
  useEffect(() => {
    if (refreshListRef) {
      refreshListRef.current = refreshList
    }
  }, [refreshList])

  const handleDelete = async (id: string, nom: string, prenom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le salarié ${prenom} ${nom} ?\n\nCette action est irréversible et supprimera toutes les données associées (congés, pointages, affectations, etc.).`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/configuration/salaries/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      // Mettre à jour la liste localement
      setSalariesList(prev => prev.filter(s => s.id !== id))
      
      // Optionnel : recharger la page pour s'assurer que les données sont à jour
      // window.location.reload()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      setError(error.message || 'Erreur lors de la suppression du salarié')
      alert(error.message || 'Erreur lors de la suppression du salarié')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {selectedSalarie ? (
        <div>
          <button
            onClick={() => setSelectedSalarie(null)}
            className="text-sm text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Retour à la liste
          </button>
          <FormSalarie 
            salarie={selectedSalarie} 
            perimetres={perimetres} 
            onSave={async () => {
              await refreshList()
              setSelectedSalarie(null) // Retour à la liste après sauvegarde
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {salariesList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun salarié</p>
          ) : (
            salariesList.map((salarie) => (
              <div
                key={salarie.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {salarie.photoUrl ? (
                    <img
                      src={salarie.photoUrl}
                      alt={`${salarie.prenom} ${salarie.nom}`}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="text-primary-600" size={24} />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {salarie.prenom} {salarie.nom}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{salarie.poste}</p>
                        {salarie.fonction && (
                          <p className="text-sm text-gray-500">{salarie.fonction}</p>
                        )}
                      </div>
                      {salarie.niveauAcces && (
                        <span className="badge badge-info text-xs">
                          {salarie.niveauAcces}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      {salarie.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span>{salarie.email}</span>
                        </div>
                      )}
                      {salarie.telephone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{salarie.telephone}</span>
                        </div>
                      )}
                      {salarie.matricule && (
                        <div className="text-xs">
                          Matricule: {salarie.matricule}
                        </div>
                      )}
                      <div className="text-xs">
                        Embauché le: {formatDate(salarie.dateEmbauche)}
                      </div>
                      {salarie.tauxHoraire && (
                        <div className="text-xs">
                          {salarie.tauxHoraire}€/h
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSalarie(salarie)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(salarie.id, salarie.nom, salarie.prenom)}
                      disabled={loading}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Supprimer"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
