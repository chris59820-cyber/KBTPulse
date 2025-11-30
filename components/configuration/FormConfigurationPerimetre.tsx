'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Save, X } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
  adresse: string
  ville: string | null
  codePostal: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
}

interface FormConfigurationPerimetreProps {
  perimetre?: Perimetre
}

export default function FormConfigurationPerimetre({ perimetre }: FormConfigurationPerimetreProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(!perimetre)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: perimetre?.nom || '',
    adresse: perimetre?.adresse || '',
    ville: perimetre?.ville || '',
    codePostal: perimetre?.codePostal || '',
    latitude: perimetre?.latitude?.toString() || '',
    longitude: perimetre?.longitude?.toString() || '',
    description: perimetre?.description || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = perimetre 
        ? `/api/configuration/perimetres/${perimetre.id}`
        : '/api/configuration/perimetres'
      
      const method = perimetre ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      })

      if (response.ok) {
        router.refresh()
        if (!perimetre) {
          setFormData({
            nom: '',
            adresse: '',
            ville: '',
            codePostal: '',
            latitude: '',
            longitude: '',
            description: '',
          })
        } else {
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing && perimetre) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="btn btn-secondary text-sm"
      >
        Modifier
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du périmètre *
          </label>
          <input
            id="nom"
            type="text"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="input"
            placeholder="Nom du périmètre"
          />
        </div>

        <div>
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <input
            id="adresse"
            type="text"
            required
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            className="input"
            placeholder="Adresse complète"
          />
        </div>

        <div>
          <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <input
            id="ville"
            type="text"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            className="input"
            placeholder="Ville"
          />
        </div>

        <div>
          <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-1">
            Code postal
          </label>
          <input
            id="codePostal"
            type="text"
            value={formData.codePostal}
            onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
            className="input"
            placeholder="Code postal"
          />
        </div>

        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude GPS
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="input"
            placeholder="Ex: 48.8566"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude GPS
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="input"
            placeholder="Ex: 2.3522"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows={3}
          placeholder="Description du périmètre"
        />
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
        {perimetre && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <X size={18} />
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
