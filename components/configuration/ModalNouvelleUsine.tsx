'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Save, Navigation } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
}

interface Usine {
  id: string
  nom: string
  secteurActivite: string | null
  adresse: string
  latitudePoste: number | null
  longitudePoste: number | null
  latitudeRassemblement: number | null
  longitudeRassemblement: number | null
  numeroUrgence: string | null
  perimetreId: string
}

interface ModalNouvelleUsineProps {
  usine: Usine | null
  perimetres: Perimetre[]
  onClose: () => void
  onSave: () => void
}

export default function ModalNouvelleUsine({ usine, perimetres, onClose, onSave }: ModalNouvelleUsineProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [nom, setNom] = useState(usine?.nom || '')
  const [secteurActivite, setSecteurActivite] = useState(usine?.secteurActivite || '')
  const [adresse, setAdresse] = useState(usine?.adresse || '')
  const [perimetreId, setPerimetreId] = useState(usine?.perimetreId || '')
  const [numeroUrgence, setNumeroUrgence] = useState(usine?.numeroUrgence || '')
  
  const [latitudePoste, setLatitudePoste] = useState(usine?.latitudePoste?.toString() || '')
  const [longitudePoste, setLongitudePoste] = useState(usine?.longitudePoste?.toString() || '')
  const [latitudeRassemblement, setLatitudeRassemblement] = useState(usine?.latitudeRassemblement?.toString() || '')
  const [longitudeRassemblement, setLongitudeRassemblement] = useState(usine?.longitudeRassemblement?.toString() || '')

  const handleGetCurrentLocation = (type: 'poste' | 'rassemblement') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (type === 'poste') {
            setLatitudePoste(position.coords.latitude.toString())
            setLongitudePoste(position.coords.longitude.toString())
          } else {
            setLatitudeRassemblement(position.coords.latitude.toString())
            setLongitudeRassemblement(position.coords.longitude.toString())
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error)
          alert('Impossible d\'obtenir la position GPS')
        }
      )
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!nom || !adresse || !perimetreId) {
        throw new Error('Le nom, l\'adresse et le périmètre sont requis')
      }

      const data = {
        nom,
        secteurActivite: secteurActivite || null,
        adresse,
        perimetreId,
        numeroUrgence: numeroUrgence || null,
        latitudePoste: latitudePoste ? parseFloat(latitudePoste) : null,
        longitudePoste: longitudePoste ? parseFloat(longitudePoste) : null,
        latitudeRassemblement: latitudeRassemblement ? parseFloat(latitudeRassemblement) : null,
        longitudeRassemblement: longitudeRassemblement ? parseFloat(longitudeRassemblement) : null
      }

      const url = usine ? `/api/configuration/usines/${usine.id}` : '/api/configuration/usines'
      const method = usine ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erreur lors de la ${usine ? 'modification' : 'création'} du site`)
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {usine ? 'Modifier le site' : 'Nouveau site'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du site <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input"
                required
                placeholder="Ex: Site de production Nord"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <input
                type="text"
                value={secteurActivite}
                onChange={(e) => setSecteurActivite(e.target.value)}
                className="input"
                placeholder="Ex: Production, Logistique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Périmètre <span className="text-red-500">*</span>
              </label>
              <select
                value={perimetreId}
                onChange={(e) => setPerimetreId(e.target.value)}
                className="input"
                required
              >
                <option value="">Sélectionner un périmètre</option>
                {perimetres.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="input"
                required
                placeholder="Adresse complète du site"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro d'urgence
              </label>
              <input
                type="text"
                value={numeroUrgence}
                onChange={(e) => setNumeroUrgence(e.target.value)}
                className="input"
                placeholder="Ex: 06 12 34 56 78"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordonnées GPS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste de garde
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={latitudePoste}
                      onChange={(e) => setLatitudePoste(e.target.value)}
                      className="input flex-1"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      value={longitudePoste}
                      onChange={(e) => setLongitudePoste(e.target.value)}
                      className="input flex-1"
                      placeholder="Longitude"
                    />
                    <button
                      type="button"
                      onClick={() => handleGetCurrentLocation('poste')}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Utiliser la position actuelle"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point de rassemblement
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={latitudeRassemblement}
                      onChange={(e) => setLatitudeRassemblement(e.target.value)}
                      className="input flex-1"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      value={longitudeRassemblement}
                      onChange={(e) => setLongitudeRassemblement(e.target.value)}
                      className="input flex-1"
                      placeholder="Longitude"
                    />
                    <button
                      type="button"
                      onClick={() => handleGetCurrentLocation('rassemblement')}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Utiliser la position actuelle"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : (usine ? 'Enregistrer' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

