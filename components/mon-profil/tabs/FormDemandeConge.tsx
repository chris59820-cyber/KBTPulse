'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Calendar } from 'lucide-react'

interface FormDemandeCongeProps {
  salarieId: string
  onClose: () => void
}

export default function FormDemandeConge({ salarieId, onClose }: FormDemandeCongeProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CP',
    dateDebut: '',
    dateFin: '',
    dureeJours: '',
    dureeHeures: '',
    commentaire: '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/mon-profil/conges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salarieId,
          ...formData,
          dureeJours: formData.dureeJours ? parseFloat(formData.dureeJours) : null,
          dureeHeures: formData.dureeHeures ? parseFloat(formData.dureeHeures) : null,
        }),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Erreur lors de la demande de congé:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer la durée automatiquement si dates sont fournies
  const calculateDuree = () => {
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut)
      const fin = new Date(formData.dateFin)
      const diffTime = fin.getTime() - debut.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setFormData({ ...formData, dureeJours: diffDays.toString() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Nouvelle demande de congé</h4>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de congé *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input"
          >
            <option value="CP">CP - Congés payés</option>
            <option value="RTT">RTT</option>
            <option value="Repos">Repos</option>
            <option value="RC">RC</option>
            <option value="RL">RL</option>
            <option value="EF">EF - Événement familial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée (jours)
          </label>
          <input
            type="number"
            step="0.5"
            value={formData.dureeJours}
            onChange={(e) => setFormData({ ...formData, dureeJours: e.target.value })}
            className="input"
            placeholder="Nombre de jours"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début *
          </label>
          <input
            type="date"
            required
            value={formData.dateDebut}
            onChange={(e) => {
              setFormData({ ...formData, dateDebut: e.target.value })
              calculateDuree()
            }}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin *
          </label>
          <input
            type="date"
            required
            value={formData.dateFin}
            onChange={(e) => {
              setFormData({ ...formData, dateFin: e.target.value })
              calculateDuree()
            }}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée (heures) - optionnel
          </label>
          <input
            type="number"
            step="0.5"
            value={formData.dureeHeures}
            onChange={(e) => setFormData({ ...formData, dureeHeures: e.target.value })}
            className="input"
            placeholder="Nombre d'heures"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commentaire
        </label>
        <textarea
          value={formData.commentaire}
          onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
          className="input"
          rows={3}
          placeholder="Commentaire (optionnel)"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Envoi...' : 'Envoyer la demande'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary flex items-center gap-2"
        >
          <X size={18} />
          Annuler
        </button>
      </div>
    </form>
  )
}
