'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Building2, MapPin, Phone, Mail, FileText, AlertCircle, Image, X } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id?: string
  nom: string
  adresse?: string | null
  telephone?: string | null
  email?: string | null
  photoUrl?: string | null
  commentaire?: string | null
  actif?: boolean
}

interface FormClientProps {
  client?: Client
}

export default function FormClient({ client }: FormClientProps) {
  const router = useRouter()
  const isEditMode = !!client?.id

  const [formData, setFormData] = useState<Client>({
    nom: client?.nom || '',
    adresse: client?.adresse || '',
    telephone: client?.telephone || '',
    email: client?.email || '',
    photoUrl: client?.photoUrl || '',
    commentaire: client?.commentaire || '',
    actif: client?.actif !== undefined ? client.actif : true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(client?.photoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditMode ? `/api/clients/${client.id}` : '/api/clients'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement')
      }

      router.push('/clients-donneurs-ordre')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingPhoto(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'client')

      const uploadResponse = await fetch('/api/upload/photo', {
        method: 'POST',
        body: uploadFormData
      })

      if (uploadResponse.ok) {
        const data = await uploadResponse.json()
        const imageUrl = data.url
        setFormData(prev => ({ ...prev, photoUrl: imageUrl }))
        setPhotoPreview(imageUrl)
      } else {
        alert('Erreur lors de l\'upload de l\'image')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }))
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/clients-donneurs-ordre"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="mr-2" size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Modifier le client' : 'Nouveau client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="inline mr-2" size={16} />
              Nom du client <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Adresse
            </label>
            <input
              type="text"
              value={formData.adresse || ''}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="input"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline mr-2" size={16} />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.telephone || ''}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          {/* Photo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="inline mr-2" size={16} />
              Photo
            </label>
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Photo du client"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Supprimer la photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Image className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">
                    {uploadingPhoto ? 'Upload en cours...' : 'Cliquez pour ajouter une photo'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline mr-2" size={16} />
              Commentaire
            </label>
            <textarea
              value={formData.commentaire || ''}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              className="input"
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/clients-donneurs-ordre"
            className="btn btn-secondary"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

