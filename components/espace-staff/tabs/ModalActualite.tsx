'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
}

interface Actualite {
  id?: string
  titre: string
  description?: string | null
  contenu?: string | null
  imageUrl?: string | null
  images?: string | null
  perimetreId?: string | null
  publie: boolean
}

interface ModalActualiteProps {
  actualite?: Actualite | null
  perimetres: Perimetre[]
  onClose: () => void
  onSave: () => void
}

export default function ModalActualite({
  actualite,
  perimetres,
  onClose,
  onSave
}: ModalActualiteProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    titre: actualite?.titre || '',
    description: actualite?.description || '',
    contenu: actualite?.contenu || '',
    imageUrl: actualite?.imageUrl || '',
    perimetreId: actualite?.perimetreId || '',
    publie: actualite?.publie !== undefined ? actualite.publie : true
  })

  useEffect(() => {
    if (actualite?.images) {
      try {
        const parsed = JSON.parse(actualite.images)
        if (Array.isArray(parsed)) {
          setAdditionalImages(parsed)
        }
      } catch (e) {
        console.error('Error parsing images:', e)
      }
    }
  }, [actualite])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'actualite')

      const uploadResponse = await fetch('/api/upload/photo', {
        method: 'POST',
        body: uploadFormData
      })

      if (uploadResponse.ok) {
        const data = await uploadResponse.json()
        const imageUrl = data.url
        if (isMain) {
          setFormData(prev => ({ ...prev, imageUrl }))
        } else {
          setAdditionalImages(prev => [...prev, imageUrl])
        }
      } else {
        alert('Erreur lors de l\'upload de l\'image')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titre.trim()) {
      alert('Le titre est requis')
      return
    }

    setLoading(true)

    try {
      const url = actualite?.id
        ? `/api/actualites/${actualite.id}`
        : '/api/actualites'

      const method = actualite?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: additionalImages.length > 0 ? additionalImages : null,
          perimetreId: formData.perimetreId || null
        })
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {actualite?.id ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="input w-full"
              required
              placeholder="Titre de l'actualité"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full h-24 resize-none"
              placeholder="Description courte de l'actualité"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu
            </label>
            <textarea
              value={formData.contenu}
              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
              className="input w-full h-32 resize-none"
              placeholder="Contenu détaillé de l'actualité"
            />
          </div>

          {/* Image principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image principale
            </label>
            {formData.imageUrl && (
              <div className="relative mb-3 inline-block">
                <img
                  src={formData.imageUrl}
                  alt="Aperçu"
                  className="w-48 h-32 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                className="hidden"
                disabled={uploadingImage}
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 disabled:opacity-50">
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>{formData.imageUrl ? 'Changer l\'image' : 'Ajouter une image'}</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Images supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images supplémentaires
            </label>
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {additionalImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                className="hidden"
                disabled={uploadingImage}
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <ImageIcon size={16} />
                <span>Ajouter une image supplémentaire</span>
              </div>
            </label>
          </div>

          {/* Périmètre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Périmètre
            </label>
            <select
              value={formData.perimetreId}
              onChange={(e) => setFormData({ ...formData, perimetreId: e.target.value })}
              className="input w-full"
            >
              <option value="">Tous les périmètres</option>
              {perimetres.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Publié */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publie"
              checked={formData.publie}
              onChange={(e) => setFormData({ ...formData, publie: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="publie" className="text-sm font-medium text-gray-700">
              Publier immédiatement
            </label>
          </div>
        </form>

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
            onClick={handleSubmit}
            className="btn btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
