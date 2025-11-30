'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Truck, Car, Wrench, Plus } from 'lucide-react'

interface RDC {
  id: string
  nom: string
  prenom: string
  photoUrl?: string | null
}

interface FormNouveauVehiculeProps {
  rdcList: RDC[]
}

export default function FormNouveauVehicule({ rdcList }: FormNouveauVehiculeProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historiqueEntretiens, setHistoriqueEntretiens] = useState<Array<{
    type: string
    date: string
    description: string
    kilometrage: string
    cout: string
    commentaire: string
  }>>([])
  
  const [formData, setFormData] = useState({
    type: 'Voiture',
    marque: '',
    modele: '',
    immatriculation: '',
    dateAchat: '',
    kilometrage: '0',
    statut: 'disponible',
    nombrePlaces: '',
    motorisation: '',
    plateauOuTole: '',
    proprietaire: '',
    rdcId: '',
    dureeLocation: '',
    dateProchaineMaintenance: '',
    typeCarburant: '',
    typeContratLocation: '',
    description: '',
    categorie: '',
    dateProchainControleTechnique: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddEntretien = () => {
    setHistoriqueEntretiens([...historiqueEntretiens, {
      type: 'entretien',
      date: '',
      description: '',
      kilometrage: '',
      cout: '',
      commentaire: ''
    }])
  }

  const handleRemoveEntretien = (index: number) => {
    setHistoriqueEntretiens(historiqueEntretiens.filter((_, i) => i !== index))
  }

  const handleEntretienChange = (index: number, field: string, value: string) => {
    const updated = [...historiqueEntretiens]
    updated[index] = { ...updated[index], [field]: value }
    setHistoriqueEntretiens(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.type || !formData.immatriculation) {
        throw new Error('Le type et l\'immatriculation sont requis')
      }

      // Validation format immatriculation (facultatif mais recommandé)
      if (formData.immatriculation.length < 3) {
        throw new Error('L\'immatriculation doit contenir au moins 3 caractères')
      }

      // Validation kilométrage
      const kilometrage = parseFloat(formData.kilometrage)
      if (isNaN(kilometrage) || kilometrage < 0) {
        throw new Error('Le kilométrage doit être un nombre positif')
      }

      const response = await fetch('/api/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: formData.type,
          marque: formData.marque || null,
          modele: formData.modele || null,
          immatriculation: formData.immatriculation.toUpperCase().trim(),
          dateAchat: formData.dateAchat || null,
          kilometrage: kilometrage,
          statut: formData.statut,
          nombrePlaces: formData.nombrePlaces ? parseInt(formData.nombrePlaces) : null,
          motorisation: formData.motorisation || null,
          plateauOuTole: formData.plateauOuTole || null,
          proprietaire: formData.proprietaire || null,
          rdcId: formData.rdcId || null,
          dureeLocation: formData.dureeLocation || null,
          dateProchaineMaintenance: formData.dateProchaineMaintenance || null,
          typeCarburant: formData.typeCarburant || null,
          typeContratLocation: formData.typeContratLocation || null,
          description: formData.description || null,
          categorie: formData.categorie || null,
          dateProchainControleTechnique: formData.dateProchainControleTechnique || null,
          historiques: historiqueEntretiens.filter(h => h.date && h.type)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.error || 'Erreur lors de la création du véhicule'
        
        // Ajouter les détails de l'erreur si disponibles
        if (errorData.details) {
          errorMessage += `\n\nDétails: ${errorData.details}`
        }
        
        // Ajouter le code d'erreur en mode développement
        if (errorData.code && process.env.NODE_ENV === 'development') {
          errorMessage += `\n\nCode d'erreur: ${errorData.code}`
        }
        
        throw new Error(errorMessage)
      }

      const vehicule = await response.json()
      
      // Rediriger vers la page de détails du véhicule
      router.push(`/vehicules/${vehicule.id}`)
      router.refresh()
    } catch (err: any) {
      console.error('Erreur lors de la création du véhicule:', err)
      console.error('Détails de l\'erreur:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      
      // Afficher un message d'erreur détaillé
      let errorMessage = err.message || 'Une erreur est survenue lors de la création du véhicule'
      let errorDetails: string | null = null
      
      // Parser les détails de l'erreur si disponibles
      if (errorMessage.includes('\n\nDétails:')) {
        const parts = errorMessage.split('\n\nDétails:')
        errorMessage = parts[0]
        errorDetails = parts[1]?.split('\n\nCode d\'erreur:')[0] || null
      }
      
      // Améliorer les messages d'erreur courants
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = '❌ Erreur de connexion au serveur'
        errorDetails = 'Vérifiez votre connexion internet et réessayez.'
      } else if (errorMessage.includes('P2002') || errorMessage.includes('existe déjà')) {
        errorMessage = '❌ Immatriculation déjà utilisée'
        errorDetails = 'Un véhicule avec cette immatriculation existe déjà dans la base de données. Veuillez en choisir une autre.'
      } else if (errorMessage.includes('P2003') || errorMessage.includes('relation')) {
        errorMessage = '❌ Erreur de relation avec le RDC'
        errorDetails = 'Le RDC responsable sélectionné n\'existe pas ou n\'est plus disponible. Veuillez sélectionner un autre RDC.'
      } else if (errorMessage.includes('P2011') || errorMessage.includes('validation')) {
        errorMessage = '❌ Erreur de validation'
        errorDetails = 'Un champ requis est manquant ou contient une valeur invalide. Veuillez vérifier tous les champs du formulaire.'
      } else if (errorMessage.includes('champ requis')) {
        errorMessage = '❌ Champs manquants'
        errorDetails = errorMessage
      } else if (errorMessage.includes('Non authentifié') || errorMessage.includes('Accès non autorisé')) {
        errorMessage = '❌ Problème d\'authentification'
        errorDetails = 'Votre session a expiré ou vous n\'avez pas les droits nécessaires. Veuillez vous reconnecter.'
      } else {
        errorMessage = `❌ ${errorMessage}`
        if (errorDetails) {
          errorDetails = errorDetails
        } else if (process.env.NODE_ENV === 'development') {
          errorDetails = 'Consultez la console du navigateur pour plus de détails.'
        }
      }
      
      setError(errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage)
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const vehiculeIcons: Record<string, any> = {
    Voiture: Car,
    Camion: Truck,
    Engin: Wrench
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 text-red-900">Erreur lors de la création du véhicule</h4>
                <div className="space-y-2">
                  {error.split('\n\n').map((line, index) => (
                    <p key={index} className={`text-sm ${index === 0 ? 'font-semibold' : ''} whitespace-pre-wrap`}>
                      {line}
                    </p>
                  ))}
                </div>
                {process.env.NODE_ENV === 'development' && error.includes('Code d\'erreur:') && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                      🔍 Voir les détails techniques complets
                    </summary>
                    <div className="mt-2 p-3 bg-red-100 rounded text-red-900 font-mono text-xs overflow-auto border border-red-200">
                      {error}
                    </div>
                  </details>
                )}
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Fermer l'erreur"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Informations du véhicule
            </h2>
          </div>

          {/* Type de véhicule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span>Type de véhicule</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Voiture', 'Camion', 'Engin'].map((type) => {
                const Icon = vehiculeIcons[type]
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.type === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon 
                        size={32} 
                        className={formData.type === type ? 'text-primary-600' : 'text-gray-400'} 
                      />
                      <span className={`text-sm font-medium ${
                        formData.type === type ? 'text-primary-600' : 'text-gray-700'
                      }`}>
                        {type}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Immatriculation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span>Immatriculation</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="immatriculation"
              value={formData.immatriculation}
              onChange={handleChange}
              className="input"
              placeholder="Ex: AB-123-CD"
              required
              maxLength={20}
            />
            <p className="mt-1 text-sm text-gray-500">
              L'immatriculation doit être unique et servira d'identifiant principal
            </p>
          </div>

          {/* Marque et Modèle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque
              </label>
              <input
                type="text"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Renault, Peugeot..."
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modèle
              </label>
              <input
                type="text"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Master, Jumper..."
                maxLength={50}
              />
            </div>
          </div>

          {/* Date d'achat et Kilométrage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'achat
              </label>
              <input
                type="date"
                name="dateAchat"
                value={formData.dateAchat}
                onChange={handleChange}
                className="input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span>Kilométrage actuel (km)</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="kilometrage"
                value={formData.kilometrage}
                onChange={handleChange}
                className="input"
                min="0"
                step="1"
                placeholder="0"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Le kilométrage actuel du véhicule
              </p>
            </div>
          </div>

          {/* Nombre de places et Motorisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de places
              </label>
              <input
                type="number"
                name="nombrePlaces"
                value={formData.nombrePlaces}
                onChange={handleChange}
                className="input"
                min="1"
                step="1"
                placeholder="Ex: 3, 5, 9..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motorisation
              </label>
              <select
                name="motorisation"
                value={formData.motorisation}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner</option>
                <option value="thermique">Thermique</option>
                <option value="electrique">Électrique</option>
              </select>
            </div>
          </div>

          {/* Plateau/Tôle et Type de carburant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plateau ou Tôle
              </label>
              <select
                name="plateauOuTole"
                value={formData.plateauOuTole}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner</option>
                <option value="plateau">Plateau</option>
                <option value="tole">Tôle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de carburant
              </label>
              <select
                name="typeCarburant"
                value={formData.typeCarburant}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="electrique">Électrique</option>
                <option value="hybride">Hybride</option>
                <option value="gpl">GPL</option>
              </select>
            </div>
          </div>

          {/* Propriétaire et RDC responsable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propriétaire
              </label>
              <input
                type="text"
                name="proprietaire"
                value={formData.proprietaire}
                onChange={handleChange}
                className="input"
                placeholder="Nom du propriétaire"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RDC responsable
              </label>
              <select
                name="rdcId"
                value={formData.rdcId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un RDC</option>
                {rdcList.map((rdc) => (
                  <option key={rdc.id} value={rdc.id}>
                    {rdc.prenom} {rdc.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type de contrat et Durée de location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de contrat de location
              </label>
              <select
                name="typeContratLocation"
                value={formData.typeContratLocation}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner</option>
                <option value="propriete">Propriété</option>
                <option value="location_longue_duree">Location longue durée</option>
                <option value="location_courte_duree">Location courte durée</option>
                <option value="leasing">Leasing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de la location
              </label>
              <input
                type="text"
                name="dureeLocation"
                value={formData.dureeLocation}
                onChange={handleChange}
                className="input"
                placeholder="Ex: 12 mois, 2 ans..."
                maxLength={50}
              />
            </div>
          </div>

          {/* Dates importantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de la prochaine maintenance
              </label>
              <input
                type="date"
                name="dateProchaineMaintenance"
                value={formData.dateProchaineMaintenance}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date du prochain contrôle technique
              </label>
              <input
                type="date"
                name="dateProchainControleTechnique"
                value={formData.dateProchainControleTechnique}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Catégorie et Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <input
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="input"
              placeholder="Ex: Utilitaire, Véhicule de chantier..."
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input"
              placeholder="Description du véhicule, caractéristiques particulières..."
              maxLength={1000}
            />
          </div>

          {/* Historique des entretiens */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Historique des entretiens
              </label>
              <button
                type="button"
                onClick={handleAddEntretien}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Ajouter un entretien
              </button>
            </div>

            <div className="space-y-4">
              {historiqueEntretiens.map((entretien, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={entretien.type}
                        onChange={(e) => handleEntretienChange(index, 'type', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="entretien">Entretien</option>
                        <option value="revision">Révision</option>
                        <option value="reparation">Réparation</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={entretien.date}
                        onChange={(e) => handleEntretienChange(index, 'date', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Kilométrage (km)
                      </label>
                      <input
                        type="number"
                        value={entretien.kilometrage}
                        onChange={(e) => handleEntretienChange(index, 'kilometrage', e.target.value)}
                        className="input text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Coût (€)
                      </label>
                      <input
                        type="number"
                        value={entretien.cout}
                        onChange={(e) => handleEntretienChange(index, 'cout', e.target.value)}
                        className="input text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={entretien.description}
                      onChange={(e) => handleEntretienChange(index, 'description', e.target.value)}
                      className="input text-sm"
                      placeholder="Description de l'entretien"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Commentaire
                    </label>
                    <textarea
                      value={entretien.commentaire}
                      onChange={(e) => handleEntretienChange(index, 'commentaire', e.target.value)}
                      className="input text-sm"
                      rows={2}
                      placeholder="Commentaire supplémentaire"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEntretien(index)}
                    className="btn btn-danger text-sm flex items-center gap-2"
                  >
                    <X size={16} />
                    Supprimer
                  </button>
                </div>
              ))}
              {historiqueEntretiens.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun entretien ajouté. Cliquez sur "Ajouter un entretien" pour commencer.
                </p>
              )}
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut initial
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="input"
            >
              <option value="disponible">Disponible</option>
              <option value="en_utilisation">En utilisation</option>
              <option value="maintenance">Maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Le statut initial du véhicule lors de sa création
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <X size={18} />
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Création en cours...' : 'Créer le véhicule'}
          </button>
        </div>
      </form>
    </div>
  )
}

