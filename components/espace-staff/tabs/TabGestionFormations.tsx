'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Calendar, Edit, Trash2, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TabGestionFormationsProps {
  user: any
}

interface Formation {
  id: string
  salarieId: string
  salarie: {
    nom: string
    prenom: string
  }
  nom: string
  organisme: string | null
  dateFormation: Date
  dateExpiration: Date | null
  duree: number | null
  fichierUrl: string | null
}

interface Salarie {
  id: string
  nom: string
  prenom: string
  poste: string
  fonction: string | null
}

export default function TabGestionFormations({ user }: TabGestionFormationsProps) {
  const [formations, setFormations] = useState<Formation[]>([])
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null)
  const [formData, setFormData] = useState({
    salarieId: '',
    nom: '',
    organisme: '',
    dateFormation: '',
    dateExpiration: '',
    duree: '',
    fichierUrl: ''
  })

  useEffect(() => {
    loadFormations()
    loadSalaries()
  }, [])

  const loadSalaries = async () => {
    try {
      const response = await fetch('/api/espace-staff/salaries')
      if (response.ok) {
        const data = await response.json()
        setSalaries(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des salariés:', error)
    }
  }

  const loadFormations = async () => {
    try {
      const response = await fetch('/api/espace-staff/formations')
      if (response.ok) {
        const data = await response.json()
        setFormations(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingFormation
        ? `/api/espace-staff/formations/${editingFormation.id}`
        : '/api/espace-staff/formations'
      const method = editingFormation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duree: formData.duree ? parseFloat(formData.duree) : null,
          dateExpiration: formData.dateExpiration || null
        })
      })

      if (response.ok) {
        loadFormations()
        setShowForm(false)
        setEditingFormation(null)
        setFormData({
          salarieId: '',
          nom: '',
          organisme: '',
          dateFormation: '',
          dateExpiration: '',
          duree: '',
          fichierUrl: ''
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return

    try {
      const response = await fetch(`/api/espace-staff/formations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadFormations()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleEdit = (formation: Formation) => {
    setEditingFormation(formation)
    setFormData({
      salarieId: formation.salarieId,
      nom: formation.nom,
      organisme: formation.organisme || '',
      dateFormation: new Date(formation.dateFormation).toISOString().split('T')[0],
      dateExpiration: formation.dateExpiration ? new Date(formation.dateExpiration).toISOString().split('T')[0] : '',
      duree: formation.duree?.toString() || '',
      fichierUrl: formation.fichierUrl || ''
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des formations</h3>
        <button
          onClick={() => {
            setEditingFormation(null)
            setFormData({
              salarieId: '',
              nom: '',
              organisme: '',
              dateFormation: '',
              dateExpiration: '',
              duree: '',
              fichierUrl: ''
            })
            setShowForm(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter une formation
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900">
                {editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingFormation(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salarié *
                </label>
                <select
                  required
                  value={formData.salarieId}
                  onChange={(e) => setFormData({ ...formData, salarieId: e.target.value })}
                  className="input"
                >
                  <option value="">Sélectionner un salarié</option>
                  {salaries.map((salarie) => (
                    <option key={salarie.id} value={salarie.id}>
                      {salarie.prenom} {salarie.nom} {salarie.poste ? `- ${salarie.poste}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la formation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="input"
                  placeholder="Nom de la formation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisme
                </label>
                <input
                  type="text"
                  value={formData.organisme}
                  onChange={(e) => setFormData({ ...formData, organisme: e.target.value })}
                  className="input"
                  placeholder="Organisme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de formation *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateFormation}
                  onChange={(e) => setFormData({ ...formData, dateFormation: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={formData.dateExpiration}
                  onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (heures)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                  className="input"
                  placeholder="Durée en heures"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du fichier/certificat
              </label>
              <input
                type="url"
                value={formData.fichierUrl}
                onChange={(e) => setFormData({ ...formData, fichierUrl: e.target.value })}
                className="input"
                placeholder="URL du document"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {editingFormation ? 'Modifier' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingFormation(null)
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X size={18} />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des formations */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : formations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune formation</p>
      ) : (
        <div className="space-y-3">
          {formations.map((formation) => (
            <div key={formation.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="text-primary-600" size={20} />
                    <h5 className="font-semibold text-gray-900">{formation.nom}</h5>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 ml-8">
                    <p>
                      <span className="font-medium">Salarié:</span> {formation.salarie.prenom} {formation.salarie.nom}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(formation.dateFormation)}
                    </p>
                    {formation.organisme && (
                      <p>
                        <span className="font-medium">Organisme:</span> {formation.organisme}
                      </p>
                    )}
                    {formation.dateExpiration && (
                      <p>
                        <span className="font-medium">Expire le:</span> {formatDate(formation.dateExpiration)}
                      </p>
                    )}
                    {formation.duree && (
                      <p>
                        <span className="font-medium">Durée:</span> {formation.duree} heures
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(formation)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(formation.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
