'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, MapPin, FileText, Users, Package, Calendar, 
  Upload, X, Plus, Link as LinkIcon, CheckSquare, CheckCircle, ArrowLeft
} from 'lucide-react'

interface Chantier {
  id: string
  nom: string
  adresse?: string | null
}

interface Salarie {
  id: string
  nom: string
  prenom: string
  photoUrl?: string | null
  poste: string
  niveauAcces?: string | null
}

interface Materiel {
  id: string
  nom: string
  categorie: string
  quantite: number
}

interface Vehicule {
  id: string
  type: string
  marque?: string | null
  modele?: string | null
  immatriculation: string
}

interface Intervention {
  id: string
  titre: string
  description: string | null
  chantierId: string
  usine: string | null
  secteur: string | null
  latitude: number | null
  longitude: number | null
  type: string | null
  nature: string | null
  dateDebut: Date | string
  dateFin: Date | string | null
  tempsPrevu: number | null
  responsableId: string | null
  rdcId: string | null
  donneurOrdreNom: string | null
  donneurOrdreTelephone: string | null
  donneurOrdreEmail: string | null
  retexPositifs: string | null
  retexNegatifs: string | null
  affectationsIntervention?: any[]
  ressourcesIntervention?: any[]
  checklistSecurite?: {
    id: string
    elements: string
    completee: boolean
    completeePar: string | null
    dateCompletion: Date | null
  } | null
}

interface Usine {
  id: string
  nom: string
}

interface CodeAffaire {
  id: string
  code: string
  description: string | null
  actif: boolean
}

interface FormNouvelleInterventionProps {
  chantiers: Chantier[]
  salaries: Salarie[]
  materiels: Materiel[]
  vehicules: Vehicule[]
  usines: Usine[]
  codesAffaire?: CodeAffaire[] // Codes affaire disponibles
  intervention?: Intervention // Optionnelle pour le mode édition
  chantierIdPreSelectionne?: string // ID du chantier pré-sélectionné depuis la page chantier
}

interface DocumentUpload {
  file: File | null
  type: string
  nom: string
  description?: string
}

interface Affectation {
  salarieId: string
  role: 'chef_equipe' | 'ouvrier'
  // Les dates seront automatiquement utilisées depuis l'intervention
}

interface RessourceMaterielle {
  materielId?: string
  vehiculeId?: string
  type: 'outillage' | 'fourniture' | 'epi' | 'vehicule'
  nom: string
  quantite: number
  description?: string
}

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

interface MapPickerModalProps {
  latitude: number | null
  longitude: number | null
  onSelect: (lat: number, lng: number) => void
  onClose: () => void
}

function MapPickerModal({ latitude, longitude, onSelect, onClose }: MapPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [selectedLat, setSelectedLat] = useState<number | null>(latitude || 50.88)
  const [selectedLng, setSelectedLng] = useState<number | null>(longitude || 2.01)

  useEffect(() => {
    // Charger Leaflet depuis CDN
    const loadLeaflet = () => {
      if (typeof window === 'undefined') return

      // Vérifier si Leaflet est déjà chargé
      if ((window as any).L) {
        setTimeout(initMap, 100)
        return
      }

      // Charger le CSS
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      // Charger le JS
      const existingScript = document.querySelector('script[src*="leaflet"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        script.onload = () => {
          setTimeout(initMap, 100)
        }
        script.onerror = () => {
          console.error('Erreur lors du chargement de Leaflet')
        }
        document.body.appendChild(script)
      } else {
        setTimeout(initMap, 100)
      }
    }

    const initMap = () => {
      if (!mapRef.current || !(window as any).L) {
        setTimeout(initMap, 100)
        return
      }

      const L = (window as any).L
      const initialLat = latitude || 50.88
      const initialLng = longitude || 2.01

      // Vérifier si la carte existe déjà
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // S'assurer que le conteneur est visible
      if (mapRef.current.offsetParent === null) {
        setTimeout(initMap, 100)
        return
      }

      // Créer la carte
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([initialLat, initialLng], 13)

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // Ajouter un marqueur initial si des coordonnées existent
      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude])
          .addTo(mapInstanceRef.current)
        setSelectedLat(latitude)
        setSelectedLng(longitude)
      } else {
        setSelectedLat(initialLat)
        setSelectedLng(initialLng)
      }

      // Gérer le clic sur la carte
      mapInstanceRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        setSelectedLat(lat)
        setSelectedLng(lng)

        // Mettre à jour ou créer le marqueur
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
        }
      })
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [latitude, longitude])

  const handleConfirm = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onSelect(selectedLat, selectedLng)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] max-w-5xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sélectionner un emplacement sur la carte</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={selectedLat || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : null
                    setSelectedLat(val)
                    if (val !== null && selectedLng !== null && mapInstanceRef.current && (window as any).L) {
                      const L = (window as any).L
                      if (markerRef.current) {
                        markerRef.current.setLatLng([val, selectedLng])
                        mapInstanceRef.current.setView([val, selectedLng], mapInstanceRef.current.getZoom())
                      }
                    }
                  }}
                  className="input"
                  placeholder="Latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={selectedLng || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : null
                    setSelectedLng(val)
                    if (selectedLat !== null && val !== null && mapInstanceRef.current && (window as any).L) {
                      const L = (window as any).L
                      if (markerRef.current) {
                        markerRef.current.setLatLng([selectedLat, val])
                        mapInstanceRef.current.setView([selectedLat, val], mapInstanceRef.current.getZoom())
                      }
                    }
                  }}
                  className="input"
                  placeholder="Longitude"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedLat === null || selectedLng === null}
                className="btn btn-primary flex items-center gap-2"
              >
                <MapPin size={18} />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FormNouvelleIntervention({
  chantiers,
  salaries,
  materiels,
  vehicules,
  usines,
  codesAffaire = [],
  intervention,
  chantierIdPreSelectionne
}: FormNouvelleInterventionProps) {
  const router = useRouter()
  const isEditMode = !!intervention
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extraire la date et l'heure de début
  const getDateAndTime = (date: Date | string | null) => {
    if (!date) return { date: '', heure: '' }
    const d = typeof date === 'string' ? new Date(date) : date
    return {
      date: d.toISOString().split('T')[0],
      heure: d.toTimeString().slice(0, 5)
    }
  }

  // 6.1 Informations générales
  const [titre, setTitre] = useState(intervention?.titre || '')
  const [chantierId, setChantierId] = useState(intervention?.chantierId || chantierIdPreSelectionne || '')
  const [usineId, setUsineId] = useState<string>('')
  const [secteurId, setSecteurId] = useState<string>('')
  const [secteurs, setSecteurs] = useState<Array<{id: string, nom: string}>>([])
  
  // Flags pour éviter de réinitialiser après sélection manuelle
  const [usineManuallySelected, setUsineManuallySelected] = useState(false)
  const [usineInitializedFromIntervention, setUsineInitializedFromIntervention] = useState(false)

  // Surveiller les changements de usineId pour déboguer
  useEffect(() => {
    console.log('📊 usineId a changé:', usineId)
    console.log('📊 usineManuallySelected:', usineManuallySelected)
    console.log('📊 usineInitializedFromIntervention:', usineInitializedFromIntervention)
  }, [usineId, usineManuallySelected, usineInitializedFromIntervention])

  // Log pour déboguer - afficher l'intervention complète au chargement
  useEffect(() => {
    console.log('=== DEBUG FORMULAIRE ===')
    console.log('Usines reçues en props:', usines)
    console.log('Nombre d\'usines:', usines?.length || 0)
    console.log('UsineId actuel:', usineId)
    console.log('SecteurId actuel:', secteurId)
    
    if (intervention) {
      console.log('=== DEBUG INTERVENTION ===')
      console.log('Intervention complète:', intervention)
      console.log('Type de intervention.secteur:', typeof intervention.secteur)
      console.log('Valeur de intervention.secteur:', intervention.secteur)
      console.log('Valeur de intervention.usine:', intervention.usine)
      console.log('Secteurs chargés:', secteurs.length, secteurs.map(s => ({ id: s.id, nom: s.nom })))
      console.log('Usines disponibles:', usines.map(u => ({ id: u.id, nom: u.nom })))
      
      // Vérifier si le secteur est présent dans les secteurs chargés
      if (intervention.secteur && secteurs.length > 0) {
        const secteurTrouve = secteurs.find(s => 
          s.nom.trim().toLowerCase() === intervention.secteur?.trim().toLowerCase()
        )
        console.log('Secteur trouvé dans la liste?', secteurTrouve ? 'OUI' : 'NON', secteurTrouve)
      }
      console.log('==========================')
    }
    console.log('==========================')
  }, [intervention, usineId, secteurId, secteurs, usines])
  
  // Initialiser l'usine en mode édition (seulement au premier chargement, une seule fois)
  useEffect(() => {
    // Si l'utilisateur a déjà sélectionné manuellement, ne pas réinitialiser
    if (usineManuallySelected) return
    
    // Si l'initialisation depuis l'intervention a déjà été faite, ne pas réinitialiser
    if (usineInitializedFromIntervention) return
    
    // Si c'est une nouvelle intervention (pas de mode édition), ne rien faire
    if (!intervention) return
    
    // Si les usines ne sont pas encore chargées, attendre
    if (usines.length === 0) return
    
    // Si l'intervention a une usine, essayer de la trouver et l'initialiser
    if (intervention?.usine) {
      const usine = usines.find(u => {
        // Comparaison insensible à la casse et aux espaces
        const nomUsine = u.nom.trim().toLowerCase()
        const nomIntervention = intervention.usine?.trim().toLowerCase() || ''
        return nomUsine === nomIntervention
      })
      
      if (usine) {
        // Seulement mettre à jour si c'est différent de la valeur actuelle
        if (usineId !== usine.id) {
          console.log('🟢 Initialisation usine depuis intervention:', usine.nom, 'ID:', usine.id)
          console.log('🟢 Avant setUsineId, valeur actuelle:', usineId)
          setUsineId(usine.id)
          console.log('🟢 Après setUsineId, nouvelle valeur:', usine.id)
        }
        setUsineInitializedFromIntervention(true) // Marquer comme initialisé
      } else {
        console.warn('⚠️ Usine de l\'intervention non trouvée:', intervention.usine)
        console.warn('Usines disponibles:', usines.map(u => u.nom))
        setUsineInitializedFromIntervention(true) // Marquer comme initialisé même si non trouvée
      }
    } else {
      // Pas d'usine dans l'intervention, marquer comme initialisé pour éviter les réinitialisations
      setUsineInitializedFromIntervention(true)
    }
  }, [intervention?.usine, usines, usineManuallySelected, usineInitializedFromIntervention])

  // Charger les secteurs quand un site est sélectionné
  useEffect(() => {
    if (usineId) {
      console.log('📥 Chargement des secteurs pour usineId:', usineId)
      fetch(`/api/configuration/structures?usineId=${usineId}`)
        .then(res => res.json())
        .then(data => {
          // Filtrer seulement les secteurs (type === 'secteur' et parentId === null pour les secteurs racines)
          const secteursList = data
            .filter((s: any) => s.type === 'secteur' && s.actif && !s.parentId)
            .map((s: any) => ({ id: s.id, nom: s.nom }))
          console.log('📋 Secteurs chargés:', secteursList.map((s: any) => s.nom))
          setSecteurs(secteursList)
        })
        .catch(err => {
          console.error('❌ Erreur lors du chargement des secteurs:', err)
          setSecteurs([])
        })
    } else {
      setSecteurs([])
      setSecteurId('')
    }
  }, [usineId])

  // Pré-remplir le secteur une fois que les secteurs sont chargés
  // Cette logique s'exécute après que les secteurs soient chargés pour s'assurer que le secteur est bien présélectionné
  useEffect(() => {
    // Ne faire la recherche que si on a tous les éléments nécessaires
    if (!intervention?.secteur) {
      // Si pas de secteur dans l'intervention, réinitialiser
      if (secteurId) {
        console.log('Pas de secteur dans l\'intervention, réinitialisation')
        setSecteurId('')
      }
      return
    }

    // Attendre que les secteurs soient chargés et que l'usine soit définie
    if (secteurs.length === 0 || !usineId) {
      console.log('⏳ En attente: secteurs.length =', secteurs.length, ', usineId =', usineId)
      return
    }

    const secteurNomNormalise = intervention.secteur.trim().toLowerCase()
    console.log('🔍 Recherche du secteur:', secteurNomNormalise)
    console.log('📋 Secteurs disponibles:', secteurs.map((s: any) => s.nom))
    console.log('🔍 SecteurId actuel:', secteurId)
    
    // Chercher avec comparaison insensible à la casse
    const secteur = secteurs.find((s: any) => {
      const nomLower = s.nom.trim().toLowerCase()
      return nomLower === secteurNomNormalise
    })
    
    if (secteur) {
      console.log('✅ Secteur trouvé! ID:', secteur.id, 'Nom:', secteur.nom)
      // TOUJOURS mettre à jour, même si secteurId est déjà défini, pour forcer la sélection
      // Utiliser une fonction pour forcer la mise à jour même si la valeur semble identique
      setSecteurId(prevId => {
        if (prevId !== secteur.id) {
          console.log('🔄 Mise à jour secteurId de', prevId, 'vers', secteur.id)
          return secteur.id
        }
        console.log('✓ SecteurId déjà correct:', secteur.id)
        return prevId
      })
    } else {
      console.warn('❌ Secteur non trouvé! intervention.secteur:', intervention.secteur)
      console.warn('Secteurs disponibles:', secteurs.map((s: any) => s.nom))
      // Si le secteur n'est pas trouvé, réinitialiser
      if (secteurId) {
        console.log('🔄 Réinitialisation secteurId car secteur non trouvé')
        setSecteurId('')
      }
    }
    // Ne pas inclure secteurId dans les dépendances pour éviter les boucles
  }, [secteurs, intervention?.secteur, usineId])
  const [latitude, setLatitude] = useState<number | null>(intervention?.latitude || null)
  const [longitude, setLongitude] = useState<number | null>(intervention?.longitude || null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [type, setType] = useState<'echafaudage' | 'calorifuge' | ''>((intervention?.type as any) || '')
  const [nature, setNature] = useState<'pose' | 'depose' | 'preparations' | 'evacuation' | 'manutentions' | 'transport' | 'chargements' | 'dechargements' | 'repli_chantier' | ''>((intervention?.nature as any) || '')
  const [description, setDescription] = useState(intervention?.description || '')

  // 6.2 Documents d'intervention
  const [documents, setDocuments] = useState<DocumentUpload[]>([])

  // 6.3 Équipe et responsabilités
  const [responsableId, setResponsableId] = useState(intervention?.responsableId || '')
  const [rdcId, setRdcId] = useState(intervention?.rdcId || '')
  const [codeAffaireId, setCodeAffaireId] = useState<string>('')
  
  // Initialiser le code affaire en mode édition
  useEffect(() => {
    if (intervention && 'codeAffaireId' in intervention) {
      const codeAffaireIdValue = (intervention as any).codeAffaireId
      if (codeAffaireIdValue && typeof codeAffaireIdValue === 'string' && codeAffaireIdValue !== '' && codeAffaireIdValue !== '{}') {
        setCodeAffaireId(String(codeAffaireIdValue))
      } else {
        setCodeAffaireId('')
      }
    }
  }, [intervention])
  
  // Filtrer les codes affaire : afficher ceux liés au chantier ou ceux sans chantier spécifique
  const codesAffaireFiltres = codesAffaire.filter(ca => {
    // Afficher tous les codes affaire actifs
    return ca.actif
  })
  const [affectations, setAffectations] = useState<Affectation[]>(() => {
    if (!intervention?.affectationsIntervention) return []
    
    return intervention.affectationsIntervention
      .filter(aff => aff.actif !== false) // Filtrer les affectations actives
      .map(aff => {
        // S'assurer que salarieId est présent
        const salarieId = aff.salarieId || (aff.salarie?.id)
        if (!salarieId) {
          console.warn('Affectation sans salarieId:', aff)
          return null
        }
        
        return {
          salarieId: salarieId,
          role: (aff.role || 'ouvrier') as 'chef_equipe' | 'ouvrier'
          // Les dates seront automatiquement utilisées depuis l'intervention
        }
      })
      .filter((aff): aff is Affectation => aff !== null)
  })
  const [donneurOrdreId, setDonneurOrdreId] = useState<string>((intervention as any)?.donneurOrdreId || '')
  const [donneursOrdre, setDonneursOrdre] = useState<Array<{
    id: string
    nom: string
    prenom: string | null
    telephone: string | null
    email: string | null
  }>>([])
  const [donneurOrdreNom, setDonneurOrdreNom] = useState(intervention?.donneurOrdreNom || '')
  const [donneurOrdreTelephone, setDonneurOrdreTelephone] = useState(intervention?.donneurOrdreTelephone || '')
  const [donneurOrdreEmail, setDonneurOrdreEmail] = useState(intervention?.donneurOrdreEmail || '')

  // Charger la liste des donneurs d'ordre
  useEffect(() => {
    fetch('/api/donneurs-ordre')
      .then(res => res.json())
      .then(data => {
        const donneursActifs = data.filter((donneurOrdre: any) => donneurOrdre.actif !== false)
        setDonneursOrdre(donneursActifs)
        
        // Si on est en mode édition et qu'il y a un donneurOrdreId, le pré-sélectionner
        if (intervention && (intervention as any).donneurOrdreId) {
          setDonneurOrdreId((intervention as any).donneurOrdreId)
        }
      })
      .catch(err => {
        console.error('Erreur lors du chargement des donneurs d\'ordre:', err)
      })
  }, [intervention])

  // Quand un donneur d'ordre est sélectionné, pré-remplir les champs
  useEffect(() => {
    if (donneurOrdreId) {
      const donneurOrdre = donneursOrdre.find((doItem: any) => doItem.id === donneurOrdreId)
      if (donneurOrdre) {
        setDonneurOrdreNom(donneurOrdre.nom + (donneurOrdre.prenom ? ` ${donneurOrdre.prenom}` : ''))
        setDonneurOrdreTelephone(donneurOrdre.telephone || '')
        setDonneurOrdreEmail(donneurOrdre.email || '')
      }
    } else {
      // Si aucun donneur d'ordre n'est sélectionné, vider les champs
      setDonneurOrdreNom('')
      setDonneurOrdreTelephone('')
      setDonneurOrdreEmail('')
    }
  }, [donneurOrdreId, donneursOrdre])

  // 6.4 Ressources matérielles
  const [ressources, setRessources] = useState<RessourceMaterielle[]>(
    intervention?.ressourcesIntervention?.map(ress => ({
      materielId: undefined, // Le schéma n'a pas de materielId
      vehiculeId: undefined, // Le schéma n'a pas de vehiculeId
      type: ress.type as 'outillage' | 'fourniture' | 'epi' | 'vehicule',
      nom: ress.nom || '',
      quantite: ress.quantite || 1,
      description: ress.description || undefined
    })) || []
  )

  // 6.5 Planification et suivi
  const dateDebutInfo = getDateAndTime(intervention?.dateDebut || null)
  const dateFinInfo = getDateAndTime(intervention?.dateFin || null)
  const [dateDebut, setDateDebut] = useState(dateDebutInfo.date)
  const [heureDebut, setHeureDebut] = useState(dateDebutInfo.heure)
  const [dateFin, setDateFin] = useState(dateFinInfo.date)
  const [heureFin, setHeureFin] = useState(dateFinInfo.heure)
  const [tempsPrevu, setTempsPrevu] = useState(intervention?.tempsPrevu?.toString() || '')
  
  // Valeurs originales de la planification (pour restauration)
  const originalPlanning = {
    dateDebut: dateDebutInfo.date,
    heureDebut: dateDebutInfo.heure,
    dateFin: dateFinInfo.date,
    heureFin: dateFinInfo.heure,
    tempsPrevu: intervention?.tempsPrevu?.toString() || ''
  }
  
  // Fonction pour restaurer la planification actuelle
  const handleRestorePlanning = () => {
    setDateDebut(originalPlanning.dateDebut)
    setHeureDebut(originalPlanning.heureDebut)
    setDateFin(originalPlanning.dateFin)
    setHeureFin(originalPlanning.heureFin)
    setTempsPrevu(originalPlanning.tempsPrevu)
  }
  
  // Fonction pour effacer la planification actuelle
  const handleClearPlanning = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer la planification actuelle ?')) {
      setDateDebut('')
      setHeureDebut('')
      setDateFin('')
      setHeureFin('')
      setTempsPrevu('')
    }
  }
  const [photos, setPhotos] = useState<File[]>([])
  const [retexPositifs, setRetexPositifs] = useState(intervention?.retexPositifs || '')
  const [retexNegatifs, setRetexNegatifs] = useState(intervention?.retexNegatifs || '')
  
  // 6.6 Check-list - Structure par défaut
  const defaultChecklistStructure: ChecklistSection[] = [
    {
      id: 'epi',
      title: '1 - Équipements de Protection Individuelle (EPI) requis pour l\'intervention',
      items: [
        { id: 'epi_tenue_travail', label: 'Tenue de travail complète', checked: false },
        { id: 'epi_combinaison_jetable', label: 'Combinaison jetable (type 3/4/5/6 selon environnement)', checked: false },
        { id: 'epi_combinaison_ignifugee', label: 'Combinaison ignifugée (norme EN ISO 11612)', checked: false },
        { id: 'epi_casque_4points', label: 'Casque de sécurité avec jugulaire 4 points', checked: false },
        { id: 'epi_lunettes_securite', label: 'Lunettes de sécurité', checked: false },
        { id: 'epi_lunettes_etanches', label: 'Lunettes étanches', checked: false },
        { id: 'epi_ecran_facial', label: 'Écran facial / visière de protection (mécanique ou chimique)', checked: false },
        { id: 'epi_detecteur_multigaz', label: 'Détecteur multigaz (4 gaz ou plus selon site)', checked: false },
        { id: 'epi_detecteur_atex', label: 'Détecteur d\'atmosphères explosives (selon site ATEX)', checked: false },
        { id: 'epi_gants_echafaudeur', label: 'Gants d\'échafaudeur', checked: false },
        { id: 'epi_gants_coquets', label: 'Gants coquets', checked: false },
        { id: 'epi_gants_calorifuge', label: 'Gants de calorifuge anti-coupure', checked: false },
        { id: 'epi_gants_chimique', label: 'Gants de protection chimique', checked: false },
        { id: 'epi_gants_haute_temp', label: 'Gants anti-chaleur Haute Température', checked: false },
        { id: 'epi_gants_nitrile', label: 'Gants jetables nitrile', checked: false },
        { id: 'epi_manchettes', label: 'Manchettes anti-coupure', checked: false },
        { id: 'epi_bouchons_oreilles', label: 'Bouchons d\'oreilles', checked: false },
        { id: 'epi_arceaux_antibruit', label: 'Arceaux antibruit', checked: false },
        { id: 'epi_casque_antibruit', label: 'Casque antibruit', checked: false },
        { id: 'epi_harnais_2longes', label: 'Harnais de sécurité avec 2 longes type Mini-Maxi', checked: false },
        { id: 'epi_harnais_nacelle', label: 'Harnais de sécurité pour nacelle', checked: false },
        { id: 'epi_longe_absorbeur', label: 'Longe absorbeur d\'énergie', checked: false },
        { id: 'epi_ara', label: 'Enrouleur / Antichute à rappel automatique (ARAs)', checked: false },
        { id: 'epi_trepied', label: 'Trépied avec système de récupération (espaces confinés)', checked: false },
        { id: 'epi_chaussures_montantes', label: 'Chaussures de sécurité montantes', checked: false },
        { id: 'epi_chaussures_rangers', label: 'Chaussures de sécurité type Rangers', checked: false },
        { id: 'epi_surchaussures', label: 'Surchaussures', checked: false },
        { id: 'epi_bottes', label: 'Bottes de sécurité', checked: false },
        { id: 'epi_guetres', label: 'Guêtres anti-coupure (tronçonnage)', checked: false },
        { id: 'epi_genouilleres', label: 'Genouillères en mousse', checked: false },
        { id: 'epi_epaulieres', label: 'Épaulières en mousse', checked: false },
        { id: 'epi_ceinture_lombaire', label: 'Ceinture de maintien lombaire (selon politique HSE)', checked: false },
        { id: 'epi_demi_masque_ffp3', label: 'Demi-masques filtrants FFP3', checked: false },
        { id: 'epi_masque_abek', label: 'Masque ABEK', checked: false },
        { id: 'epi_masque_fuite', label: 'Masque de fuite', checked: false },
        { id: 'epi_ari', label: 'Appareils respiratoires isolants (ARI)', checked: false },
        { id: 'epi_papr', label: 'Masque à assistance ventilée (PAPR)', checked: false },
        { id: 'epi_cartouches', label: 'Cartouches filtrantes spécifiques (A2P3, AX, B2, E2, K2, etc.)', checked: false },
        { id: 'epi_vetements_chimique', label: 'Vêtements de protection chimique', checked: false },
        { id: 'epi_blouson_visibilite', label: 'Blouson haute visibilité', checked: false },
        { id: 'epi_veste_impermable', label: 'Veste anti-pluie / tenue imperméable', checked: false },
        { id: 'epi_tabliers', label: 'Tabliers de protection (cuir, chimique, anti-coupure)', checked: false },
        { id: 'epi_gilet_visibilite', label: 'Gilets haute visibilité', checked: false },
        { id: 'epi_gilet_sauvetage', label: 'Gilets de sauvetage', checked: false },
        { id: 'epi_brassards', label: 'Brassards d\'identification (chef d\'équipe, SST, etc.)', checked: false },
        { id: 'epi_autres', label: 'Autres EPI selon risques spécifiques', checked: false },
        { id: 'epi_protection_cryogenique', label: 'Protection thermique cryogénique', checked: false },
      ]
    },
    {
      id: 'outils',
      title: '2 - Vérification des outils et matériels',
      items: [
        { id: 'outils_caisse_calo', label: 'Caisse calorifuge (caisse calo)', checked: false },
        { id: 'outils_visseuse', label: 'Visseuse / perceuse électrique', checked: false },
        { id: 'outils_pistolet_silicone', label: 'Pistolet à silicone', checked: false },
        { id: 'outils_chariot', label: 'Chariot roulant', checked: false },
        { id: 'outils_ceinture_outils', label: 'Ceinture porte-outils', checked: false },
        { id: 'outils_porte_marteau', label: 'Porte-marteau', checked: false },
        { id: 'outils_porte_cle', label: 'Porte clé à cliquet', checked: false },
        { id: 'outils_marteau', label: 'Marteau avec dragonne', checked: false },
        { id: 'outils_cle_cliquet', label: 'Clé à cliquet pour échafaudage 19/22 mm avec dragonne', checked: false },
        { id: 'outils_niveau', label: 'Niveau avec dragonne', checked: false },
        { id: 'outils_metre', label: 'Mètre ruban', checked: false },
        { id: 'outils_diphoterine', label: 'Diphotérine (solution de décontamination d\'urgence)', checked: false },
        { id: 'outils_extincteur', label: 'Extincteur (type adapté au risque : eau pulvérisée, CO₂, poudre polyvalente, etc.)', checked: false },
        { id: 'outils_kit_pollution', label: 'Kit anti-pollution (absorbants, barrages, granulés, sacs de confinement)', checked: false },
        { id: 'outils_rack', label: 'Rack d\'échafaudage', checked: false },
        { id: 'outils_panier', label: 'Panier d\'échafaudage', checked: false },
        { id: 'outils_bois', label: 'Bois d\'échafaudage', checked: false },
        { id: 'outils_palette', label: 'Palette d\'échafaudage', checked: false },
        { id: 'outils_crochet_plettac', label: 'Crochet Plettac', checked: false },
        { id: 'outils_potence_plettac', label: 'Potence Plettac', checked: false },
        { id: 'outils_poulie', label: 'Poulie', checked: false },
        { id: 'outils_corde_guidage', label: 'Corde de guidage', checked: false },
        { id: 'outils_perche_guidage', label: 'Perche de guidage', checked: false },
        { id: 'outils_elingue_1t_05', label: 'Élingue 1T / 0,5 m', checked: false },
        { id: 'outils_elingue_1t_1', label: 'Élingue 1T / 1 m', checked: false },
        { id: 'outils_elingue_1t_2', label: 'Élingue 1T / 2 m', checked: false },
        { id: 'outils_elingue_2t_05', label: 'Élingue 2T / 0,5 m', checked: false },
        { id: 'outils_elingue_2t_1', label: 'Élingue 2T / 1 m', checked: false },
        { id: 'outils_elingue_2t_2', label: 'Élingue 2T / 2 m', checked: false },
        { id: 'outils_elingue_3t_1', label: 'Élingue 3T / 1 m', checked: false },
        { id: 'outils_elingue_3t_2', label: 'Élingue 3T / 2 m', checked: false },
        { id: 'outils_elingue_3t_3', label: 'Élingue 3T / 3 m', checked: false },
        { id: 'outils_elingue_3t_4', label: 'Élingue 3T / 4 m', checked: false },
        { id: 'outils_elingue_3t_5', label: 'Élingue 3T / 5 m', checked: false },
        { id: 'outils_elingue_5t_2', label: 'Élingue 5T / 2 m', checked: false },
        { id: 'outils_elingue_5t_3', label: 'Élingue 5T / 3 m', checked: false },
        { id: 'outils_elingue_5t_4', label: 'Élingue 5T / 4 m', checked: false },
        { id: 'outils_elingue_5t_5', label: 'Élingue 5T / 5 m', checked: false },
        { id: 'outils_corde_25', label: 'Corde 25 m', checked: false },
        { id: 'outils_corde_50', label: 'Corde 50 m', checked: false },
        { id: 'outils_corde_100', label: 'Corde 100 m', checked: false },
        { id: 'outils_talkie', label: 'Talkie-walkies', checked: false },
        { id: 'outils_sifflet', label: 'Sifflet', checked: false },
        { id: 'outils_corne', label: 'Corne de brume', checked: false },
        { id: 'outils_rubalise', label: 'Rubalise', checked: false },
        { id: 'outils_chaine', label: 'Chaîne de signalisation plastique', checked: false },
        { id: 'outils_poteaux', label: 'Poteaux de balisage', checked: false },
        { id: 'outils_barriere', label: 'Barrière de chantier', checked: false },
        { id: 'outils_cone', label: 'Cône de signalisation', checked: false },
        { id: 'outils_barriere_grillage', label: 'Barrière de chantier grillagée', checked: false },
        { id: 'outils_chevalet', label: 'Chevalet de signalisation', checked: false },
        { id: 'outils_panneaux', label: 'Panneaux de chantier', checked: false },
        { id: 'outils_separateurs', label: 'Séparateurs de voie en plastique', checked: false },
      ]
    },
    {
      id: 'acces',
      title: '3 - Vérification de l\'accès au chantier',
      items: [
        { id: 'acces_carte_identite', label: 'Carte d\'identité en cours de validité', checked: false },
        { id: 'acces_permis_conduire', label: 'Permis de conduire en cours de validité', checked: false },
        { id: 'acces_carte_btp', label: 'Carte BTP', checked: false },
        { id: 'acces_badge', label: 'Badge d\'accès au site', checked: false },
        { id: 'acces_visite_medicale', label: 'Visite médicale en cours de validité', checked: false },
        { id: 'acces_titres_habilitations', label: 'Titres et habilitations requis (ATEX, travail en hauteur, CACES, SST, etc.)', checked: false },
        { id: 'acces_anfas', label: 'Carte ANFAS N1 / N2 (habilitation risques chimiques)', checked: false },
      ]
    },
    {
      id: 'documents',
      title: '4 - Vérification des documents nécessaires',
      items: [
        { id: 'doc_autorisation_travail', label: 'Autorisation de travail', checked: false },
        { id: 'doc_pdp', label: 'Plan de Prévention (PDP)', checked: false },
        { id: 'doc_mode_operatoire', label: 'Mode opératoire validé', checked: false },
        { id: 'doc_icp', label: 'Inspection Commune Préalable (ICP)', checked: false },
        { id: 'doc_procedure', label: 'Procédure interne applicable à l\'intervention', checked: false },
        { id: 'doc_permis_penetrer', label: 'Permis de pénétrer (espace confiné)', checked: false },
        { id: 'doc_permis_feu', label: 'Permis feu', checked: false },
        { id: 'doc_consignation', label: 'Consignation de l\'installation client (énergie, fluide, mécanique, etc.)', checked: false },
        { id: 'doc_autorisation_acces', label: 'Autorisation d\'accès au site', checked: false },
      ]
    },
    {
      id: 'formations',
      title: '5 - Vérification des formations et habilitations',
      items: [
        { id: 'form_anfas_n1', label: 'ANFAS N1', checked: false },
        { id: 'form_anfas_n2', label: 'ANFAS N2', checked: false },
        { id: 'form_travaux_hauteur', label: 'Travaux en hauteur', checked: false },
        { id: 'form_harnais', label: 'Port du harnais / utilisation des EPI antichute', checked: false },
        { id: 'form_atex', label: 'Habilitation ATEX', checked: false },
        { id: 'form_electrique', label: 'Habilitation électrique H0/B0', checked: false },
        { id: 'form_espace_confine', label: 'Travaux en espace confiné', checked: false },
        { id: 'form_catec', label: 'Travaux en espace confiné CATEC', checked: false },
        { id: 'form_ari', label: 'Utilisation d\'ARI (Appareil Respiratoire Isolant)', checked: false },
        { id: 'form_reception_echafaudage', label: 'Réception d\'échafaudage', checked: false },
        { id: 'form_utilisation_echafaudage', label: 'Utilisation d\'échafaudage', checked: false },
        { id: 'form_autorisation_nacelle', label: 'Autorisation de conduite Nacelle', checked: false },
        { id: 'form_caces_nacelle', label: 'CACES Nacelle (R486)', checked: false },
        { id: 'form_caces_cat3', label: 'CACES catégorie 3 (chariot élévateur – R489)', checked: false },
        { id: 'form_caces_cat9', label: 'CACES catégorie 9 (conduite d\'engins – R482)', checked: false },
        { id: 'form_vehicule_leger', label: 'Conduite de véhicule léger (autorisation interne)', checked: false },
        { id: 'form_pontier', label: 'Pontier / commande de pont roulant', checked: false },
        { id: 'form_elingueur', label: 'Élingueur (contrôle et mise en charge des levages)', checked: false },
        { id: 'form_chef_manoeuvre', label: 'Chef de manœuvre (direction des opérations de levage)', checked: false },
        { id: 'form_vigie', label: 'Vigie (surveillance sécurité, zones à risques)', checked: false },
      ]
    }
  ]

  const [creatingChecklist, setCreatingChecklist] = useState(false)
  const [checklist, setChecklist] = useState<ChecklistSection[]>(defaultChecklistStructure)
  const [savingChecklist, setSavingChecklist] = useState(false)
  const [completingChecklist, setCompletingChecklist] = useState(false)

  const handleAddDocument = () => {
    setDocuments([...documents, { file: null, type: 'plan', nom: '', description: '' }])
  }

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleDocumentChange = (index: number, field: string, value: any) => {
    const updated = [...documents]
    updated[index] = { ...updated[index], [field]: value }
    setDocuments(updated)
  }

  const handleAddAffectation = () => {
    setAffectations([...affectations, {
      salarieId: '',
      role: 'ouvrier'
      // Les dates seront automatiquement utilisées depuis l'intervention
    }])
  }

  const handleRemoveAffectation = (index: number) => {
    setAffectations(affectations.filter((_, i) => i !== index))
  }

  const handleAffectationChange = (index: number, field: string, value: any) => {
    const updated = [...affectations]
    updated[index] = { ...updated[index], [field]: value }
    setAffectations(updated)
  }

  const handleAddRessource = () => {
    setRessources([...ressources, {
      type: 'outillage',
      nom: '',
      quantite: 1
    }])
  }

  const handleRemoveRessource = (index: number) => {
    setRessources(ressources.filter((_, i) => i !== index))
  }

  const handleRessourceChange = (index: number, field: string, value: any) => {
    const updated = [...ressources]
    updated[index] = { ...updated[index], [field]: value }
    setRessources(updated)
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)])
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  // Charger la check-list existante ou utiliser la structure par défaut
  useEffect(() => {
    if (intervention?.checklistSecurite?.elements) {
      try {
        let parsed = intervention.checklistSecurite.elements
        
        // Si c'est déjà une string, essayer de la parser
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
        }
        
        // Si le résultat est encore une string, essayer de parser à nouveau
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
        }
        
        if (Array.isArray(parsed)) {
          setChecklist(parsed)
        } else {
          console.error('La check-list n\'est pas un tableau:', parsed)
          setChecklist(defaultChecklistStructure)
        }
      } catch (e) {
        console.error('Erreur lors du parsing de la check-list:', e)
        console.error('Contenu:', intervention.checklistSecurite.elements)
        setChecklist(defaultChecklistStructure)
      }
    } else {
      // Si pas de check-list, utiliser la structure par défaut
      setChecklist(defaultChecklistStructure)
    }
  }, [intervention?.checklistSecurite])

  const handleCreateChecklist = async () => {
    if (!intervention?.id) {
      alert('Veuillez d\'abord enregistrer l\'intervention avant de créer la check-list')
      return
    }

    setCreatingChecklist(true)

    // Utiliser la structure actuelle de la check-list (avec les éléments cochés)
    const checklistToSave = checklist.length > 0 ? checklist : defaultChecklistStructure

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: JSON.stringify(checklistToSave) })
      })

      if (response.ok) {
        alert('Check-list créée avec succès')
        setCreatingChecklist(false)
        // Recharger la page pour afficher la check-list créée
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la création de la check-list')
        setCreatingChecklist(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création de la check-list')
      setCreatingChecklist(false)
    }
  }

  const handleToggleChecklistItem = (sectionId: string, itemId: string) => {
    if (intervention?.checklistSecurite?.completee) return
    
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      }
      return section
    }))
  }

  const handleSaveChecklist = async () => {
    if (!intervention?.id || !intervention?.checklistSecurite) {
      alert('La check-list n\'existe pas encore. Veuillez d\'abord la créer.')
      return
    }

    setSavingChecklist(true)

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/checklist/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements: JSON.stringify(checklist)
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour l'état local avec les données sauvegardées
        if (data.elements) {
          try {
            let parsed = data.elements
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed)
            }
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed)
            }
            if (Array.isArray(parsed)) {
              setChecklist(parsed)
            }
          } catch (e) {
            console.error('Erreur lors du parsing après sauvegarde:', e)
          }
        }
        // Mettre à jour l'objet intervention pour indiquer que la checklist existe
        if (intervention && !intervention.checklistSecurite) {
          // L'objet intervention est en lecture seule, mais on peut mettre à jour l'état local
          // Les données seront rechargées au prochain rechargement de page
        }
        alert('Check-list sauvegardée avec succès')
        setSavingChecklist(false)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sauvegarde de la check-list')
        setSavingChecklist(false)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de la check-list')
      setSavingChecklist(false)
    }
  }

  const handleCompleteChecklist = async () => {
    if (!intervention?.id || !intervention?.checklistSecurite) {
      alert('La check-list n\'existe pas encore. Veuillez d\'abord la créer.')
      return
    }

    if (!confirm('Voulez-vous marquer cette checklist comme complétée ?')) {
      return
    }

    setCompletingChecklist(true)

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/checklist/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completee: true
        })
      })

      if (response.ok) {
        alert('Check-list marquée comme complétée')
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la mise à jour de la checklist')
        setCompletingChecklist(false)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour de la checklist')
      setCompletingChecklist(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {

    try {
      // Validation des champs requis
      if (!titre || !chantierId) {
        throw new Error('Le titre et le chantier sont requis')
      }

      // Vérifier si la planification est complète
      const hasPlanning = dateDebut && heureDebut
      
      // Construction de la date/heure de début (si planification présente)
      const dateDebutComplete = hasPlanning ? new Date(`${dateDebut}T${heureDebut}`) : null
      const dateFinComplete = dateFin && heureFin ? new Date(`${dateFin}T${heureFin}`) : null

      // Préparer les données pour l'API
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('description', description)
      formData.append('chantierId', chantierId)
      if (dateDebutComplete) {
        formData.append('dateDebut', dateDebutComplete.toISOString())
      } else {
        formData.append('dateDebut', '')
      }
      // Toujours envoyer tous les champs, même s'ils sont vides, pour permettre de les mettre à null
      if (dateFinComplete) {
        formData.append('dateFin', dateFinComplete.toISOString())
      } else {
        formData.append('dateFin', '')
      }
      formData.append('tempsPrevu', tempsPrevu || '')
      formData.append('type', type || '')
      formData.append('nature', nature || '')
      
      // Récupérer les noms des sites et secteurs sélectionnés
      const usineNom = usineId ? usines.find(u => u.id === usineId)?.nom || '' : ''
      const secteurNom = secteurId ? secteurs.find(s => s.id === secteurId)?.nom || '' : ''
      
      formData.append('usine', usineNom)
      formData.append('secteur', secteurNom)
      formData.append('latitude', latitude !== null ? latitude.toString() : '')
      formData.append('longitude', longitude !== null ? longitude.toString() : '')
      formData.append('responsableId', responsableId || '')
      formData.append('rdcId', rdcId || '')
      formData.append('codeAffaireId', codeAffaireId || '')
      formData.append('donneurOrdreId', donneurOrdreId || '')
      formData.append('donneurOrdreNom', donneurOrdreNom || '')
      formData.append('donneurOrdreTelephone', donneurOrdreTelephone || '')
      formData.append('donneurOrdreEmail', donneurOrdreEmail || '')
      formData.append('retexPositifs', retexPositifs || '')
      formData.append('retexNegatifs', retexNegatifs || '')

      // Ajouter les affectations
      formData.append('affectations', JSON.stringify(affectations))

      // Ajouter les ressources
      formData.append('ressources', JSON.stringify(ressources))

      // Ajouter les photos
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo)
      })

      // Ajouter les documents
      documents.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`document_${index}`, doc.file)
          formData.append(`document_${index}_type`, doc.type)
          formData.append(`document_${index}_nom`, doc.nom)
          if (doc.description) {
            formData.append(`document_${index}_description`, doc.description)
          }
        }
      })

      const url = isEditMode ? `/api/interventions/${intervention.id}` : '/api/interventions'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erreur lors de la ${isEditMode ? 'modification' : 'création'} de l'intervention`)
      }

      const savedIntervention = await response.json()
      router.push(`/interventions/${savedIntervention.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'equipe', label: 'Équipe', icon: Users },
    { id: 'materiel', label: 'Ressources matérielles', icon: Package },
    { id: 'planification', label: 'Planification', icon: Calendar },
    { id: 'checklist', label: 'Check-list', icon: CheckSquare }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="grid grid-cols-2 md:grid-cols-3 gap-1 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-3 text-sm font-medium border-b-2 transition-all rounded-t-lg ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon size={18} className={isActive ? 'text-primary-600' : 'text-gray-500'} />
                    <span className="text-center">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 6.1 Informations générales */}
      {activeTab === 'general' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'intervention *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chantier *
              </label>
              <select
                value={chantierId}
                onChange={(e) => setChantierId(e.target.value)}
                className="input"
                required
              >
                <option value="">Sélectionner un chantier</option>
                {chantiers.map((chantier) => (
                  <option key={chantier.id} value={chantier.id}>
                    {chantier.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site
              </label>
              <select
                value={usineId || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value
                  const selectedUsine = usines?.find(u => u.id === selectedValue)
                  console.log('🔵 Site sélectionné - Valeur:', selectedValue, 'Nom:', selectedUsine?.nom)
                  console.log('🔵 Usines disponibles:', usines?.map(u => ({ id: u.id, nom: u.nom })))
                  console.log('🔵 Avant setUsineId, valeur actuelle:', usineId)
                  setUsineId(selectedValue)
                  setUsineManuallySelected(true) // Marquer comme sélectionné manuellement
                  console.log('🔵 Après setUsineId, nouvelle valeur:', selectedValue)
                }}
                className="input w-full"
                disabled={!usines || usines.length === 0}
              >
                <option value="">Sélectionner un site</option>
                {usines && usines.length > 0 ? (
                  usines.map((usine) => (
                    <option key={usine.id} value={usine.id}>
                      {usine.nom}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucun site disponible</option>
                )}
              </select>
              {(!usines || usines.length === 0) && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Aucun site disponible. Veuillez contacter l'administrateur.
                </p>
              )}
              {usines && usines.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {usines.length} site(s) disponible(s) - Sélection actuelle: {usineId ? usines.find(u => u.id === usineId)?.nom || 'Inconnu' : 'Aucune'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'intervention
              </label>
              <select
                value={secteurId}
                onChange={(e) => {
                  console.log('Secteur sélectionné manuellement:', e.target.value)
                  setSecteurId(e.target.value)
                }}
                className="input"
                disabled={!usineId || secteurs.length === 0}
              >
                <option value="">
                  {!usineId ? 'Sélectionnez d\'abord un site' : secteurs.length === 0 ? 'Aucun secteur disponible' : 'Sélectionner un secteur'}
                </option>
                {secteurs.map((secteur) => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ))}
              </select>
              {intervention?.secteur && !secteurId && secteurs.length > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Secteur enregistré: "{intervention.secteur}" - Recherche en cours...
                </p>
              )}
              {intervention?.secteur && secteurId && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Secteur sélectionné: {secteurs.find(s => s.id === secteurId)?.nom || 'Inconnu'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'intervention
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="input"
              >
                <option value="">Sélectionner un type</option>
                <option value="echafaudage">Échafaudage</option>
                <option value="calorifuge">Calorifuge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nature
              </label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value as any)}
                className="input"
              >
                <option value="">Sélectionner une nature</option>
                <option value="pose">Pose</option>
                <option value="depose">Dépose</option>
                <option value="preparations">Préparations</option>
                <option value="evacuation">Évacuation</option>
                <option value="manutentions">Manutentions</option>
                <option value="transport">Transport</option>
                <option value="chargements">Chargements</option>
                <option value="dechargements">Déchargements</option>
                <option value="repli_chantier">Repli de chantier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RDC responsable
              </label>
              <select
                value={rdcId}
                onChange={(e) => setRdcId(e.target.value)}
                className="input"
              >
                <option value="">Sélectionner un RDC</option>
                {salaries
                  .filter(s => s.niveauAcces === 'RDC' || s.poste?.toLowerCase().includes('responsable de chantier'))
                  .map((salarie) => (
                    <option key={salarie.id} value={salarie.id}>
                      {salarie.prenom} {salarie.nom} - {salarie.poste}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code affaire
              </label>
              <select
                value={codeAffaireId}
                onChange={(e) => setCodeAffaireId(e.target.value)}
                className="input"
              >
                <option value="">Sélectionner un code affaire</option>
                {codesAffaireFiltres.map((codeAffaire) => (
                  <option key={codeAffaire.id} value={codeAffaire.id}>
                    {codeAffaire.code} - {codeAffaire.description || 'Sans description'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps prévu pour réaliser l'intervention (en heures)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={tempsPrevu}
                onChange={(e) => setTempsPrevu(e.target.value)}
                className="input"
                placeholder="Ex: 8"
              />
            </div>
          </div>

          {/* Coordonnées GPS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordonnées GPS
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  step="any"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Latitude"
                  className="input"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="any"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Longitude"
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="btn btn-secondary flex items-center gap-2"
              >
                <MapPin size={18} />
                Localiser
              </button>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <MapPin size={18} />
                Sélectionner sur la carte
              </button>
            </div>
            {latitude && longitude && (
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                <LinkIcon size={14} />
                Voir sur la carte / Obtenir l'itinéraire
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input"
            />
          </div>
        </div>
      )}

      {/* 6.2 Documents d'intervention */}
      {activeTab === 'documents' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Documents d'intervention</h3>
            <button
              type="button"
              onClick={handleAddDocument}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter un document
            </button>
          </div>

          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                      className="input"
                    >
                      <option value="plan">Plan</option>
                      <option value="photo">Photo</option>
                      <option value="pdp">PDP</option>
                      <option value="liste">Liste</option>
                      <option value="mos">MOS</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={doc.nom}
                      onChange={(e) => handleDocumentChange(index, 'nom', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentChange(index, 'file', e.target.files?.[0] || null)}
                      className="input"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="btn btn-danger flex items-center gap-2"
                    >
                      <X size={18} />
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={doc.description || ''}
                    onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                    rows={2}
                    className="input"
                  />
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucun document ajouté. Cliquez sur "Ajouter un document" pour commencer.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 6.3 Équipe et responsabilités */}
      {activeTab === 'equipe' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Équipe et responsabilités</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RDC responsable de l'activité
            </label>
            <select
              value={rdcId}
              onChange={(e) => setRdcId(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner un RDC</option>
              {salaries
                .filter(s => s.niveauAcces === 'RDC' || s.poste?.toLowerCase().includes('responsable de chantier'))
                .map((salarie) => (
                  <option key={salarie.id} value={salarie.id}>
                    {salarie.prenom} {salarie.nom} - {salarie.poste}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsable de l'intervention
            </label>
            <select
              value={responsableId}
              onChange={(e) => setResponsableId(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner un responsable</option>
              {salaries
                .filter(s => ['PREPA', 'CE', 'RDC', 'CAFF'].includes(s.niveauAcces || ''))
                .map((salarie) => (
                  <option key={salarie.id} value={salarie.id}>
                    {salarie.prenom} {salarie.nom} - {salarie.poste}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Personnes affectées</h4>
              <button
                type="button"
                onClick={handleAddAffectation}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus size={18} />
                Ajouter une affectation
              </button>
            </div>

            <div className="space-y-4">
              {affectations.map((aff, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salarié
                      </label>
                      <select
                        value={aff.salarieId}
                        onChange={(e) => handleAffectationChange(index, 'salarieId', e.target.value)}
                        className="input"
                      >
                        <option value="">Sélectionner un salarié</option>
                        {salaries.map((salarie) => (
                          <option key={salarie.id} value={salarie.id}>
                            {salarie.prenom} {salarie.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <select
                        value={aff.role}
                        onChange={(e) => handleAffectationChange(index, 'role', e.target.value)}
                        className="input"
                      >
                        <option value="ouvrier">Ouvrier</option>
                        <option value="chef_equipe">Chef d'équipe</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveAffectation(index)}
                        className="btn btn-danger flex items-center gap-2"
                      >
                        <X size={18} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {affectations.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Aucune affectation. Cliquez sur "Ajouter une affectation" pour commencer.
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Contact du donneur d'ordre</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donneur d'ordre
                </label>
                <select
                  value={donneurOrdreId}
                  onChange={(e) => setDonneurOrdreId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Sélectionner un donneur d'ordre</option>
                  {donneursOrdre.map((donneurOrdre) => (
                    <option key={donneurOrdre.id} value={donneurOrdre.id}>
                      {donneurOrdre.nom} {donneurOrdre.prenom || ''}
                    </option>
                  ))}
                </select>
              </div>
              {donneurOrdreId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={donneurOrdreNom}
                      onChange={(e) => setDonneurOrdreNom(e.target.value)}
                      className="input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={donneurOrdreTelephone}
                      onChange={(e) => setDonneurOrdreTelephone(e.target.value)}
                      className="input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={donneurOrdreEmail}
                      onChange={(e) => setDonneurOrdreEmail(e.target.value)}
                      className="input"
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6.4 Ressources matérielles */}
      {activeTab === 'materiel' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ressources matérielles</h3>
            <button
              type="button"
              onClick={handleAddRessource}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter une ressource
            </button>
          </div>

          <div className="space-y-4">
            {ressources.map((ressource, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={ressource.type}
                      onChange={(e) => handleRessourceChange(index, 'type', e.target.value)}
                      className="input"
                    >
                      <option value="outillage">Outillage</option>
                      <option value="fourniture">Fourniture</option>
                      <option value="epi">EPI</option>
                      <option value="vehicule">Véhicule</option>
                    </select>
                  </div>
                  {ressource.type === 'vehicule' ? (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Véhicule
                      </label>
                      <select
                        value={ressource.vehiculeId || ''}
                        onChange={(e) => {
                          const vehicule = vehicules.find(v => v.id === e.target.value)
                          handleRessourceChange(index, 'vehiculeId', e.target.value)
                          handleRessourceChange(index, 'nom', vehicule ? `${vehicule.type} ${vehicule.immatriculation}` : '')
                        }}
                        className="input"
                      >
                        <option value="">Sélectionner un véhicule</option>
                        {vehicules.map((vehicule) => (
                          <option key={vehicule.id} value={vehicule.id}>
                            {vehicule.type} {vehicule.immatriculation}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Matériel
                        </label>
                        <select
                          value={ressource.materielId || ''}
                          onChange={(e) => {
                            const materiel = materiels.find(m => m.id === e.target.value)
                            handleRessourceChange(index, 'materielId', e.target.value)
                            handleRessourceChange(index, 'nom', materiel ? materiel.nom : '')
                          }}
                          className="input"
                        >
                          <option value="">Sélectionner un matériel</option>
                          {materiels.map((materiel) => (
                            <option key={materiel.id} value={materiel.id}>
                              {materiel.nom} ({materiel.categorie})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={ressource.quantite}
                      onChange={(e) => handleRessourceChange(index, 'quantite', parseInt(e.target.value) || 1)}
                      className="input"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRessource(index)}
                      className="btn btn-danger flex items-center gap-2"
                    >
                      <X size={18} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {ressources.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucune ressource ajoutée. Cliquez sur "Ajouter une ressource" pour commencer.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 6.5 Planification et suivi */}
      {activeTab === 'planification' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Planification et suivi</h3>
            {isEditMode && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestorePlanning}
                  className="btn btn-secondary flex items-center gap-2"
                  title="Restaurer la planification actuelle"
                >
                  <Calendar size={18} />
                  Restaurer la planification actuelle
                </button>
                <button
                  type="button"
                  onClick={handleClearPlanning}
                  className="btn btn-danger flex items-center gap-2"
                  title="Effacer la planification actuelle"
                >
                  <X size={18} />
                  Effacer la planification
                </button>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Horaires</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Photos</h4>
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="input mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Retour d'expérience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points positifs
                </label>
                <textarea
                  value={retexPositifs}
                  onChange={(e) => setRetexPositifs(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Points positifs de l'intervention..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points négatifs
                </label>
                <textarea
                  value={retexNegatifs}
                  onChange={(e) => setRetexNegatifs(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Points négatifs de l'intervention..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6.6 Check-list */}
      {activeTab === 'checklist' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Check-list de sécurité</h3>
            {intervention?.id && !intervention?.checklistSecurite && (
              <button
                type="button"
                onClick={handleCreateChecklist}
                disabled={creatingChecklist}
                className="btn btn-success flex items-center gap-2"
              >
                <CheckSquare size={18} />
                {creatingChecklist ? 'Création...' : 'Créer la Check-list'}
              </button>
            )}
          </div>

          {!intervention?.id ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">
                Veuillez d'abord enregistrer l'intervention avant de créer la check-list.
              </p>
            </div>
          ) : checklist.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">
                Chargement de la check-list...
              </p>
            </div>
          ) : (
            <>
              {/* Badge de complétion */}
              {intervention?.checklistSecurite?.completee && (
                <div className="mb-6">
                  <span className="badge badge-success flex items-center gap-2 w-fit">
                    <CheckCircle size={16} />
                    Complétée
                  </span>
                </div>
              )}

              {/* Info si la check-list n'est pas encore créée */}
              {!intervention?.checklistSecurite && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> La check-list n'est pas encore enregistrée. Cochez les éléments souhaités puis cliquez sur "Créer la Check-list" pour l'enregistrer.
                  </p>
                </div>
              )}

              {/* Sections de la check-list */}
              <div className="space-y-6">
                {checklist.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">{section.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.items.map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            item.checked
                              ? 'bg-green-50 border-2 border-green-200'
                              : 'bg-gray-50 border-2 border-gray-200'
                          } ${
                            intervention?.checklistSecurite?.completee 
                              ? 'cursor-default' 
                              : item.checked
                              ? 'hover:bg-green-100 hover:border-green-300 cursor-pointer'
                              : 'hover:bg-gray-100 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleChecklistItem(section.id, item.id)}
                            className={`w-6 h-6 rounded focus:ring-2 focus:ring-offset-2 cursor-pointer flex-shrink-0 ${
                              item.checked
                                ? 'text-green-600 border-2 border-green-400 focus:ring-green-500'
                                : 'text-gray-600 border-2 border-gray-400 focus:ring-gray-500'
                            }`}
                            disabled={intervention?.checklistSecurite?.completee}
                          />
                          <span className={`text-base font-medium ${
                            item.checked ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              {!intervention?.checklistSecurite?.completee && (
                <div className="mt-6 flex items-center gap-3">
                  {intervention?.checklistSecurite ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveChecklist}
                        disabled={savingChecklist}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Save size={18} />
                        {savingChecklist ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCompleteChecklist}
                        disabled={completingChecklist}
                        className="btn btn-success flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        {completingChecklist ? 'Enregistrement...' : 'Marquer comme complétée'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateChecklist}
                      disabled={creatingChecklist}
                      className="btn btn-success flex items-center gap-2"
                    >
                      <CheckSquare size={18} />
                      {creatingChecklist ? 'Création...' : 'Créer la Check-list'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal pour sélectionner les coordonnées sur la carte */}
      {showMapModal && (
        <MapPickerModal
          latitude={latitude}
          longitude={longitude}
          onSelect={(lat, lng) => {
            setLatitude(lat)
            setLongitude(lng)
            setShowMapModal(false)
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* Boutons d'action */}
      <div className="flex justify-between gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => {
            if (isEditMode && intervention?.id) {
              router.push(`/interventions/${intervention.id}`)
            } else {
              router.back()
            }
          }}
          className="btn btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <ArrowLeft size={18} />
          Fermer
        </button>
        <div className="flex gap-4 ml-auto">
          <button
            type="button"
            onClick={() => router.back()}
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
            {loading 
              ? (isEditMode ? 'Modification en cours...' : 'Création en cours...') 
              : (isEditMode ? 'Enregistrer les modifications' : 'Créer l\'intervention')}
          </button>
        </div>
      </div>
      </form>
    </div>
  )
}

