'use client'

import { useState, useRef } from 'react'
import { X, Save, AlertTriangle, Info, CheckCircle, XCircle, Upload } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
}

interface MessageSecurite {
  id?: string
  titre: string
  contenu: string
  type: string
  imageUrl?: string | null
  perimetreId?: string | null
  actif: boolean
  dateDebut: Date | string
  dateFin?: Date | string | null
}

interface ModalMessageSecuriteProps {
  message?: MessageSecurite | null
  perimetres: Perimetre[]
  onClose: () => void
  onSave: () => void
}

const typeOptions = [
  { value: 'info', label: 'Information', icon: Info, color: 'blue' },
  { value: 'warning', label: 'Avertissement', icon: AlertTriangle, color: 'yellow' },
  { value: 'danger', label: 'Danger', icon: XCircle, color: 'red' },
  { value: 'success', label: 'Succès', icon: CheckCircle, color: 'green' }
]

export default function ModalMessageSecurite({
  message,
  perimetres,
  onClose,
  onSave
}: ModalMessageSecuriteProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(message?.imageUrl || null)
  const [formData, setFormData] = useState({
    titre: message?.titre || '',
    contenu: message?.contenu || '',
    type: message?.type || 'info',
    imageUrl: message?.imageUrl || '',
    perimetreId: message?.perimetreId || '',
    actif: message?.actif !== undefined ? message.actif : true,
    dateDebut: message?.dateDebut 
      ? (typeof message.dateDebut === 'string' 
          ? new Date(message.dateDebut).toISOString().split('T')[0] 
          : new Date(message.dateDebut).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    dateFin: message?.dateFin
      ? (typeof message.dateFin === 'string'
          ? new Date(message.dateFin).toISOString().split('T')[0]
          : new Date(message.dateFin).toISOString().split('T')[0])
      : ''
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      uploadFormData.append('type', 'message-securite')

      const uploadResponse = await fetch('/api/upload/photo', {
        method: 'POST',
        body: uploadFormData
      })

      if (uploadResponse.ok) {
        const data = await uploadResponse.json()
        const imageUrl = data.url
        setFormData(prev => ({ ...prev, imageUrl }))
        setImagePreview(imageUrl)
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

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titre.trim() || !formData.contenu.trim()) {
      alert('Le titre et le contenu sont requis')
      return
    }

    setLoading(true)

    try {
      const url = message?.id
        ? `/api/messages-securite/${message.id}`
        : '/api/messages-securite'

      const method = message?.id ? 'PUT' : 'POST'

      // Préparer les dates correctement pour l'API
      const dateDebut = formData.dateDebut 
        ? new Date(formData.dateDebut + 'T00:00:00').toISOString()
        : new Date().toISOString()
      
      const dateFin = formData.dateFin && formData.dateFin !== ''
        ? new Date(formData.dateFin + 'T23:59:59').toISOString()
        : null

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          perimetreId: formData.perimetreId && formData.perimetreId !== '' ? formData.perimetreId : null,
          dateDebut: dateDebut,
          dateFin: dateFin,
          imageUrl: formData.imageUrl && formData.imageUrl.trim() !== '' ? formData.imageUrl : null
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

  const selectedType = typeOptions.find(t => t.value === formData.type) || typeOptions[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {message?.id ? 'Modifier le message de sécurité' : 'Nouveau message de sécurité'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de message *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {typeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = formData.type === option.value
                const colorClasses = {
                  blue: isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                  yellow: isSelected ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-gray-300',
                  red: isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300',
                  green: isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }
                const iconColorClasses = {
                  blue: isSelected ? 'text-blue-600' : 'text-gray-400',
                  yellow: isSelected ? 'text-yellow-600' : 'text-gray-400',
                  red: isSelected ? 'text-red-600' : 'text-gray-400',
                  green: isSelected ? 'text-green-600' : 'text-gray-400'
                }
                const textColorClasses = {
                  blue: isSelected ? 'text-blue-700' : 'text-gray-600',
                  yellow: isSelected ? 'text-yellow-700' : 'text-gray-600',
                  red: isSelected ? 'text-red-700' : 'text-gray-600',
                  green: isSelected ? 'text-green-700' : 'text-gray-600'
                }
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      colorClasses[option.color as keyof typeof colorClasses] || colorClasses.blue
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon 
                        size={24} 
                        className={iconColorClasses[option.color as keyof typeof iconColorClasses] || iconColorClasses.blue}
                      />
                      <span className={`text-xs font-medium ${
                        textColorClasses[option.color as keyof typeof textColorClasses] || textColorClasses.blue
                      }`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

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
              placeholder="Titre du message de sécurité"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu *
            </label>
            <textarea
              value={formData.contenu}
              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
              className="input w-full h-32 resize-none"
              required
              placeholder="Contenu du message de sécurité"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            
            {/* Aperçu de la photo */}
            {imagePreview && (
              <div className="relative mb-3 inline-block">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-48 h-32 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer la photo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Bouton d'upload */}
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
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
                    <span>{imagePreview ? 'Changer la photo' : 'Ajouter une photo'}</span>
                  </>
                )}
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
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
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          {/* Actif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="actif" className="text-sm font-medium text-gray-700">
              Message actif
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
