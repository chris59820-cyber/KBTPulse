'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, User, Phone, Mail } from 'lucide-react'

interface FormContactUrgenceProps {
  salarieId: string
  contact?: any
  onClose: () => void
}

export default function FormContactUrgence({ salarieId, contact, onClose }: FormContactUrgenceProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: contact?.nom || '',
    prenom: contact?.prenom || '',
    relation: contact?.relation || '',
    telephone: contact?.telephone || '',
    telephoneSecondaire: contact?.telephoneSecondaire || '',
    email: contact?.email || '',
    priorite: contact?.priorite?.toString() || '1',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = contact
        ? `/api/mon-profil/contacts-urgence/${contact.id}`
        : '/api/mon-profil/contacts-urgence'
      
      const method = contact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salarieId,
          ...formData,
          priorite: parseInt(formData.priorite),
        }),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {contact ? 'Modifier le contact' : 'Nouveau contact d\'urgence'}
        </h4>
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
            Nom *
          </label>
          <input
            type="text"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="input"
            placeholder="Nom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            required
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="input"
            placeholder="Prénom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relation
          </label>
          <input
            type="text"
            value={formData.relation}
            onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
            className="input"
            placeholder="Ex: Conjoint, Parent, Ami..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            value={formData.priorite}
            onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
            className="input"
          >
            <option value="1">1 - Principal</option>
            <option value="2">2 - Secondaire</option>
            <option value="3">3 - Tertiaire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            className="input"
            placeholder="Numéro de téléphone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone secondaire
          </label>
          <input
            type="tel"
            value={formData.telephoneSecondaire}
            onChange={(e) => setFormData({ ...formData, telephoneSecondaire: e.target.value })}
            className="input"
            placeholder="Numéro secondaire (optionnel)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            placeholder="E-mail (optionnel)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Enregistrement...' : 'Enregistrer'}
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
