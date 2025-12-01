'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, Camera, X, Upload, Eye, EyeOff } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
}

interface FormSalarieProps {
  perimetres: Perimetre[]
  salarie?: any
  onSave?: () => void // Callback appelé après sauvegarde réussie
}

export default function FormSalarie({ perimetres, salarie, onSave }: FormSalarieProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(salarie?.photoUrl || null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean>(!!salarie?.user) // Indique si un mot de passe existe déjà
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: salarie?.nom || '',
    prenom: salarie?.prenom || '',
    dateNaissance: salarie?.dateNaissance ? new Date(salarie.dateNaissance).toISOString().split('T')[0] : '',
    email: salarie?.email || '',
    telephone: salarie?.telephone || '',
    adresse: salarie?.adresse || '',
    photoUrl: salarie?.photoUrl || '',
    
    // Informations professionnelles
    fonction: salarie?.fonction || '',
    poste: salarie?.poste || '',
    coefficient: salarie?.coefficient?.toString() || '',
    matricule: salarie?.matricule || '',
    dateEmbauche: salarie?.dateEmbauche ? new Date(salarie.dateEmbauche).toISOString().split('T')[0] : '',
    typeContrat: salarie?.typeContrat || 'CDI',
    tauxHoraire: salarie?.tauxHoraire?.toString() || '',
    deplacement: salarie?.deplacement?.toString() || '',
    niveauAcces: salarie?.niveauAcces || '',
    perimetreId: salarie?.perimetreId || '',
    
    // Identifiants de connexion
    emailConnexion: salarie?.user?.email || salarie?.email || '',
    motDePasse: '', // Toujours vide, ne sera envoyé que si rempli
    creerCompte: salarie?.user ? true : true, // Cocher par défaut
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = salarie
        ? `/api/configuration/salaries/${salarie.id}`
        : '/api/configuration/salaries'
      
      const method = salarie ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coefficient: formData.coefficient ? parseFloat(formData.coefficient) : null,
          tauxHoraire: formData.tauxHoraire ? parseFloat(formData.tauxHoraire) : null,
          deplacement: formData.deplacement ? parseFloat(formData.deplacement) : null,
          dateNaissance: formData.dateNaissance ? new Date(formData.dateNaissance) : null,
          dateEmbauche: formData.dateEmbauche ? new Date(formData.dateEmbauche) : new Date(),
          perimetreId: formData.perimetreId || null,
          // Ne pas envoyer le mot de passe s'il est vide (pour la mise à jour)
          motDePasse: formData.motDePasse || undefined,
        }),
      })

      if (response.ok) {
        // Appeler le callback pour mettre à jour la liste
        if (onSave) {
          onSave()
        }
        router.refresh()
        if (!salarie) {
          // Réinitialiser le formulaire
          setFormData({
            nom: '', prenom: '', dateNaissance: '', email: '', telephone: '', adresse: '',
            photoUrl: '', fonction: '', poste: '', coefficient: '', matricule: '',
            dateEmbauche: '', typeContrat: 'CDI', tauxHoraire: '', deplacement: '',
            niveauAcces: '', perimetreId: '', emailConnexion: '', motDePasse: '', creerCompte: true
          })
          setPhotoPreview(null)
          setHasPassword(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        } else {
          // Mettre à jour l'état du mot de passe après modification
          const updatedSalarie = await response.json()
          setHasPassword(!!updatedSalarie?.user)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    setUploadingPhoto(true)

    // Convertir l'image directement en base64 et la stocker
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, photoUrl: base64String }))
      setPhotoPreview(base64String)
      setUploadingPhoto(false)
    }
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier')
      setUploadingPhoto(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }))
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informations personnelles */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Informations personnelles</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="input text-sm"
                placeholder="Nom"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="input text-sm"
                placeholder="Prénom"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
            <input
              type="date"
              value={formData.dateNaissance}
              onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              className="input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="input text-sm"
              placeholder="Adresse"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="input text-sm"
                placeholder="Téléphone"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input text-sm"
                placeholder="E-mail"
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Photo</label>
            
            {/* Aperçu de la photo */}
            {photoPreview && (
              <div className="relative mb-3 inline-block">
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer la photo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Bouton d'upload */}
            <div>
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploadingPhoto ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>{photoPreview ? 'Changer la photo' : 'Télécharger une photo'}</span>
                    </>
                  )}
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                La photo sera stockée directement dans la base de données
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Informations professionnelles</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Poste *</label>
              <select
                required
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                className="input text-sm"
              >
                <option value="">Sélectionner un poste</option>
                <option value="Ouvrière / Ouvrier">Ouvrière / Ouvrier</option>
                <option value="Préparatrice / Préparateur">Préparatrice / Préparateur</option>
                <option value="Chef d'équipe / Cheffe d'équipe">Chef d'équipe / Cheffe d'équipe</option>
                <option value="Responsable de chantier">Responsable de chantier</option>
                <option value="Conductrice de travaux / Conducteur de travaux">Conductrice de travaux / Conducteur de travaux</option>
                <option value="Chargée d'affaires / Chargé d'affaires">Chargée d'affaires / Chargé d'affaires</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fonction</label>
              <input
                type="text"
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                className="input text-sm"
                placeholder="Fonction"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coefficient</label>
              <input
                type="number"
                step="0.01"
                value={formData.coefficient}
                onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
                className="input text-sm"
                placeholder="Coefficient"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Matricule</label>
              <input
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                className="input text-sm"
                placeholder="Matricule"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date d'embauche *</label>
              <input
                type="date"
                required
                value={formData.dateEmbauche}
                onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type de contrat</label>
              <select
                value={formData.typeContrat}
                onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
                className="input text-sm"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="ETT">ETT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Taux horaire</label>
              <input
                type="number"
                step="0.01"
                value={formData.tauxHoraire}
                onChange={(e) => setFormData({ ...formData, tauxHoraire: e.target.value })}
                className="input text-sm"
                placeholder="Taux horaire"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Déplacement (KM)</label>
              <input
                type="number"
                step="0.01"
                value={formData.deplacement}
                onChange={(e) => setFormData({ ...formData, deplacement: e.target.value })}
                className="input text-sm"
                placeholder="KM"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Niveau d'accès</label>
            <select
              value={formData.niveauAcces}
              onChange={(e) => setFormData({ ...formData, niveauAcces: e.target.value })}
              className="input text-sm"
            >
              <option value="">Sélectionner</option>
              <option value="PREPA">PREPA</option>
              <option value="CE">CE (Chef d'équipe)</option>
              <option value="RDC">RDC</option>
              <option value="CAFF">CAFF</option>
              <option value="OUVRIER">Ouvrier</option>
              <option value="AUTRE">AUTRE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Périmètre</label>
            <select
              value={formData.perimetreId}
              onChange={(e) => setFormData({ ...formData, perimetreId: e.target.value })}
              className="input text-sm"
            >
              <option value="">Sélectionner un périmètre</option>
              {perimetres.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Identifiants de connexion */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Identifiants de connexion</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="creerCompte"
              checked={formData.creerCompte}
              onChange={(e) => setFormData({ ...formData, creerCompte: e.target.checked, motDePasse: '' })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="creerCompte" className="text-sm font-medium text-gray-700">
              Créer un compte de connexion pour ce salarié
            </label>
          </div>

          {formData.creerCompte && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  E-mail de connexion *
                </label>
                <input
                  type="email"
                  required={formData.creerCompte}
                  value={formData.emailConnexion}
                  onChange={(e) => setFormData({ ...formData, emailConnexion: e.target.value })}
                  className="input text-sm"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cet e-mail sera utilisé pour se connecter à l'application
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {salarie?.user 
                    ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' 
                    : 'Mot de passe *'}
                </label>
                {hasPassword && !formData.motDePasse && (
                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center gap-2">
                    <span>✓</span>
                    <span>Un mot de passe est déjà défini pour ce compte. Entrez un nouveau mot de passe pour le modifier.</span>
                  </div>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={formData.creerCompte && !salarie?.user}
                    value={formData.motDePasse}
                    onChange={(e) => {
                      setFormData({ ...formData, motDePasse: e.target.value })
                    }}
                    className="input text-sm pr-10"
                    placeholder={hasPassword && !formData.motDePasse ? "Entrer un nouveau mot de passe..." : "••••••••"}
                    minLength={salarie?.user ? undefined : 6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {salarie?.user 
                    ? 'Laisser vide si vous ne souhaitez pas changer le mot de passe'
                    : 'Minimum 6 caractères'
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        <Save size={18} />
        {loading ? 'Enregistrement...' : salarie ? 'Modifier' : 'Créer'}
      </button>
    </form>
  )
}
