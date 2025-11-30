'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface StructureOrganisationnelle {
  id: string
  type: string
  nom: string
  code: string | null
  description: string | null
  numeroPDP: string | null
  parentId: string | null
  ordre: number | null
}

interface ModalStructureOrganisationnelleProps {
  usineId: string
  perimetreId?: string
  structure: StructureOrganisationnelle | null
  parentId: string | null
  onClose: () => void
  onSave: () => void
}

export default function ModalStructureOrganisationnelle({
  usineId,
  perimetreId,
  structure,
  parentId,
  onClose,
  onSave
}: ModalStructureOrganisationnelleProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Déterminer le type en fonction du parent
  const determineType = (): 'secteur' | 'unite' => {
    if (structure?.type) {
      return structure.type as 'secteur' | 'unite'
    }
    // Par défaut, c'est un secteur
    // L'utilisateur peut créer un secteur enfant d'un secteur ou une unité
    return 'secteur'
  }

  const [type, setType] = useState<'secteur' | 'unite'>(determineType())
  const [nom, setNom] = useState(structure?.nom || '')
  const [code, setCode] = useState(structure?.code || '')
  const [description, setDescription] = useState(structure?.description || '')
  const [numeroPDP, setNumeroPDP] = useState(structure?.numeroPDP || '')
  const [ordre, setOrdre] = useState(structure?.ordre?.toString() || '')

  // Ne permettre que certains types en fonction du parent
  useEffect(() => {
    if (!structure) {
      // Par défaut, c'est un secteur
      setType('secteur')
    }
  }, [parentId, structure])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!nom || !type) {
        throw new Error('Le nom et le type sont requis')
      }

      const data = {
        type,
        nom,
        code: code || null,
        description: description || null,
        numeroPDP: numeroPDP || null,
        parentId: parentId || null,
        ordre: ordre ? parseInt(ordre) : null,
        usineId,
        perimetreId
      }

      const url = structure ? `/api/configuration/structures/${structure.id}` : '/api/configuration/structures'
      const method = structure ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erreur lors de la ${structure ? 'modification' : 'création'} de la structure`)
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const typeLabels = {
    secteur: 'Secteur',
    unite: 'Unité',
    batiment: 'Bâtiment',
    etage: 'Étage'
  }

  const typeDescriptions = {
    secteur: 'Sous-catégorie d\'un site (ex: Secteur A, Secteur B)',
    unite: 'Sous-sous-catégorie d\'un secteur (ex: Unité 1, Unité 2)'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {structure ? 'Modifier la structure' : 'Nouvelle structure'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'secteur' | 'unite')}
                className="input"
                required
                disabled={!!structure} // Ne pas permettre de changer le type en modification
              >
                <option value="secteur">Secteur</option>
                <option value="unite">Unité</option>
              </select>
              {typeDescriptions[type] && (
                <p className="text-xs text-gray-500 mt-1">{typeDescriptions[type]}</p>
              )}
              {parentId && (
                <p className="text-xs text-blue-600 mt-1">
                  Cette structure sera créée comme enfant de la structure parente.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={ordre}
                onChange={(e) => setOrdre(e.target.value)}
                className="input"
                placeholder="Optionnel"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input"
                required
                placeholder={`Ex: ${type === 'secteur' ? 'Secteur A' : 'Unité 1'}`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input"
                placeholder="Code de référence optionnel"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de PDP
              </label>
              <input
                type="text"
                value={numeroPDP}
                onChange={(e) => setNumeroPDP(e.target.value)}
                className="input"
                placeholder="Numéro de PDP (Plan de Prévention)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={3}
                placeholder="Description de la structure..."
              />
            </div>
          </div>

          {parentId && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
              <p className="text-sm">
                <strong>Note :</strong> Cette structure sera ajoutée comme enfant de la structure parente.
              </p>
            </div>
          )}

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
              {loading ? 'Enregistrement...' : (structure ? 'Enregistrer' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

