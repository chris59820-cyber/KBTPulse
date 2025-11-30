'use client'

import { useState, useEffect } from 'react'
import { X, Save, UserPlus, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  photoUrl: string | null
  poste: string
}

interface Affectation {
  id: string
  salarieId: string
  salarie: Salarie
  role: string
  dateDebut: string
  dateFin: string | null
  actif: boolean
}

interface ModalGestionAffectationsProps {
  interventionId: string
  affectations: Affectation[]
  onClose: () => void
  onSave: () => void
}

export default function ModalGestionAffectations({
  interventionId,
  affectations,
  onClose,
  onSave
}: ModalGestionAffectationsProps) {
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [selectedSalarie, setSelectedSalarie] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'chef_equipe' | 'ouvrier'>('ouvrier')
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0])
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)
  const [localAffectations, setLocalAffectations] = useState<Affectation[]>(affectations)

  useEffect(() => {
    fetchSalaries()
  }, [])

  const fetchSalaries = async () => {
    try {
      const response = await fetch('/api/configuration/salaries')
      if (response.ok) {
        const data = await response.json()
        setSalaries(data.filter((s: any) => s.statut === 'actif'))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des salariés:', error)
    }
  }

  // Filtrer les salariés déjà affectés
  const availableSalaries = salaries.filter(s => {
    const alreadyAssigned = localAffectations.some(a => a.salarieId === s.id && a.actif)
    return !alreadyAssigned
  })

  const handleAddAffectation = async () => {
    if (!selectedSalarie) return

    setLoading(true)
    try {
      const response = await fetch(`/api/interventions/${interventionId}/affectations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salarieId: selectedSalarie,
          role: selectedRole,
          dateDebut: new Date(dateDebut),
          dateFin: dateFin ? new Date(dateFin) : null
        })
      })

      if (response.ok) {
        const newAffectation = await response.json()
        setLocalAffectations([...localAffectations, newAffectation])
        setSelectedSalarie('')
        setDateDebut(new Date().toISOString().split('T')[0])
        setDateFin('')
        setSelectedRole('ouvrier')
        // Recharger la liste des salariés pour exclure le nouveau salarié affecté
        fetchSalaries()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'ajout de l\'affectation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout de l\'affectation')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAffectation = async (affectationId: string) => {
    if (!confirm('Voulez-vous vraiment retirer cette affectation ?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/interventions/${interventionId}/affectations/${affectationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLocalAffectations(localAffectations.filter(a => a.id !== affectationId))
        // Recharger la liste des salariés pour réafficher le salarié retiré
        fetchSalaries()
      } else {
        alert('Erreur lors de la suppression de l\'affectation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression de l\'affectation')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    onSave()
    onClose()
  }

  const rolesLabels: Record<string, string> = {
    chef_equipe: 'Chef d\'équipe',
    ouvrier: 'Ouvrier'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Gérer les affectations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Formulaire d'ajout */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une affectation</h3>
            
            <div className="space-y-4">
              {/* Sélection de salarié */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salarié *
                </label>
                <select
                  value={selectedSalarie}
                  onChange={(e) => setSelectedSalarie(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">Sélectionner un salarié</option>
                  {availableSalaries.map(salarie => (
                    <option key={salarie.id} value={salarie.id}>
                      {salarie.prenom} {salarie.nom} - {salarie.poste}
                    </option>
                  ))}
                </select>
                {availableSalaries.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Tous les salariés sont déjà affectés</p>
                )}
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'chef_equipe' | 'ouvrier')}
                  className="input w-full"
                >
                  <option value="ouvrier">Ouvrier</option>
                  <option value="chef_equipe">Chef d'équipe</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin (optionnelle)
                  </label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Bouton d'ajout */}
              <button
                onClick={handleAddAffectation}
                disabled={!selectedSalarie || loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={16} />
                {loading ? 'Ajout...' : 'Ajouter l\'affectation'}
              </button>
            </div>
          </div>

          {/* Liste des affectations actuelles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Affectations actuelles ({localAffectations.length})
            </h3>
            
            {localAffectations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune affectation</p>
            ) : (
              <div className="space-y-3">
                {localAffectations.map(affectation => (
                  <div key={affectation.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {affectation.salarie.photoUrl ? (
                        <img
                          src={affectation.salarie.photoUrl}
                          alt={`${affectation.salarie.prenom} ${affectation.salarie.nom}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {affectation.salarie.prenom[0]}{affectation.salarie.nom[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {affectation.salarie.prenom} {affectation.salarie.nom}
                          </p>
                          <span className={`badge text-xs ${
                            affectation.role === 'chef_equipe' ? 'badge-primary' : 'badge-secondary'
                          }`}>
                            {rolesLabels[affectation.role] || affectation.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Du {formatDate(affectation.dateDebut)}
                          {affectation.dateFin && ` au ${formatDate(affectation.dateFin)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAffectation(affectation.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer l'affectation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Save size={16} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
