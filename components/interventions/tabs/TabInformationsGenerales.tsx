'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Building2, Navigation, Calendar, Briefcase, Tag, User, Clock, Phone, Mail } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Intervention {
  titre: string
  usine: string | null
  secteur: string | null
  latitude: number | null
  longitude: number | null
  type: string | null
  nature: string | null
  chantier: {
    nom: string
    adresse: string | null
  }
  dateDebut: Date | null
  dateFin: Date | null
  tempsPrevu: number | null
  dureeReelle: number | null
  rdc: {
    id: string
    nom: string
    prenom: string
    poste: string | null
  } | null
  donneurOrdreNom: string | null
  donneurOrdreTelephone: string | null
  donneurOrdreEmail: string | null
}

interface TabInformationsGeneralesProps {
  intervention: Intervention
}

export default function TabInformationsGenerales({ intervention }: TabInformationsGeneralesProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const googleMapsUrl = intervention.latitude && intervention.longitude
    ? `https://www.google.com/maps?q=${intervention.latitude},${intervention.longitude}`
    : null

  // Obtenir la position actuelle de l'utilisateur pour l'itinéraire
  const getItineraireUrl = () => {
    if (!intervention.latitude || !intervention.longitude) return null
    
    if (userLocation) {
      // Itinéraire depuis la position actuelle de l'utilisateur
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${intervention.latitude},${intervention.longitude}`
    } else {
      // Itinéraire depuis la position actuelle (Google Maps utilisera la géolocalisation)
      return `https://www.google.com/maps/dir/?api=1&destination=${intervention.latitude},${intervention.longitude}`
    }
  }

  const itineraireUrl = getItineraireUrl()

  // Obtenir la position actuelle de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation && intervention.latitude && intervention.longitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error)
        }
      )
    }
  }, [intervention.latitude, intervention.longitude])

  // Charger et initialiser la carte Leaflet
  useEffect(() => {
    if (!intervention.latitude || !intervention.longitude || !mapRef.current) return

    const loadLeaflet = () => {
      if (typeof window === 'undefined') return

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

      // Nettoyer la carte existante
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }

      // S'assurer que le conteneur est visible
      if (mapRef.current.offsetParent === null) {
        setTimeout(initMap, 100)
        return
      }

      // Créer la carte centrée sur les coordonnées GPS
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([intervention.latitude!, intervention.longitude!], 15)

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // Ajouter un marqueur aux coordonnées GPS
      markerRef.current = L.marker([intervention.latitude!, intervention.longitude!], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
      }).addTo(mapInstanceRef.current)

      // Ajouter un popup avec les coordonnées
      markerRef.current.bindPopup(`
        <strong>Coordonnées GPS</strong><br>
        ${intervention.latitude!.toFixed(6)}, ${intervention.longitude!.toFixed(6)}
      `).openPopup()
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
  }, [intervention.latitude, intervention.longitude])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Nom de l'intervention</p>
                <p className="text-gray-900 font-medium">{intervention.titre}</p>
              </div>
            </div>

            {intervention.usine && (
              <div className="flex items-start gap-3">
                <Building2 className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Site</p>
                  <p className="text-gray-900 font-medium">{intervention.usine}</p>
                </div>
              </div>
            )}

            {intervention.secteur && (
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Secteur d'intervention</p>
                  <p className="text-gray-900 font-medium">{intervention.secteur}</p>
                </div>
              </div>
            )}

            {intervention.type && (
              <div className="flex items-start gap-3">
                <Tag className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type d'intervention</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {intervention.type === 'echafaudage' ? 'Échafaudage' : 
                     intervention.type === 'calorifuge' ? 'Calorifuge' : 
                     intervention.type}
                  </p>
                </div>
              </div>
            )}

            {intervention.nature && (
              <div className="flex items-start gap-3">
                <Tag className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nature</p>
                  <p className="text-gray-900 font-medium">
                    {intervention.nature === 'pose' ? 'Pose' : 
                     intervention.nature === 'depose' ? 'Dépose' :
                     intervention.nature === 'preparations' ? 'Préparations' :
                     intervention.nature === 'evacuation' ? 'Évacuation' :
                     intervention.nature === 'manutentions' ? 'Manutentions' :
                     intervention.nature === 'transport' ? 'Transport' :
                     intervention.nature === 'chargements' ? 'Chargements' :
                     intervention.nature === 'dechargements' ? 'Déchargements' :
                     intervention.nature === 'repli_chantier' ? 'Repli de chantier' :
                     intervention.nature}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Building2 className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Chantier</p>
                <p className="text-gray-900 font-medium">{intervention.chantier.nom}</p>
                {intervention.chantier.adresse && (
                  <p className="text-sm text-gray-600 mt-1">{intervention.chantier.adresse}</p>
                )}
              </div>
            </div>

            {intervention.rdc && (
              <div className="flex items-start gap-3">
                <User className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">RDC responsable</p>
                  <p className="text-gray-900 font-medium">
                    {intervention.rdc.prenom} {intervention.rdc.nom}
                  </p>
                  {intervention.rdc.poste && (
                    <p className="text-sm text-gray-600 mt-1">{intervention.rdc.poste}</p>
                  )}
                </div>
              </div>
            )}

            {(intervention.tempsPrevu || intervention.dureeReelle) && (
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-1" size={20} />
                <div className="space-y-2">
                  {intervention.tempsPrevu && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Temps prévu</p>
                      <p className="text-gray-900 font-medium">{intervention.tempsPrevu} heures</p>
                    </div>
                  )}
                  {intervention.dureeReelle && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Temps réellement passé</p>
                      <p className="text-gray-900 font-medium">{intervention.dureeReelle} heures</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(intervention.donneurOrdreNom || intervention.donneurOrdreTelephone || intervention.donneurOrdreEmail) && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact du donneur d'ordre</h4>
                <div className="space-y-3">
                  {intervention.donneurOrdreNom && (
                    <div className="flex items-start gap-3">
                      <User className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nom</p>
                        <p className="text-gray-900 font-medium">{intervention.donneurOrdreNom}</p>
                      </div>
                    </div>
                  )}
                  {intervention.donneurOrdreTelephone && (
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                        <p className="text-gray-900 font-medium">{intervention.donneurOrdreTelephone}</p>
                      </div>
                    </div>
                  )}
                  {intervention.donneurOrdreEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="text-gray-900 font-medium">{intervention.donneurOrdreEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planification</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de début</p>
                {intervention.dateDebut ? (
                  <p className="text-gray-900 font-medium">{formatDateTime(intervention.dateDebut)}</p>
                ) : (
                  <p className="text-gray-400 italic">Non planifiée</p>
                )}
              </div>
            </div>

            {intervention.dateFin && (
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de fin prévue</p>
                  <p className="text-gray-900 font-medium">{formatDateTime(intervention.dateFin)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carte avec point GPS */}
      {intervention.latitude && intervention.longitude && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
          <div className="card">
            <div className="aspect-video rounded-lg mb-4 overflow-hidden" style={{ minHeight: '400px' }}>
              <div ref={mapRef} className="w-full h-full" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Coordonnées GPS: {intervention.latitude.toFixed(6)}, {intervention.longitude.toFixed(6)}
              </p>
              <div className="flex gap-2">
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-sm flex items-center gap-2"
                  >
                    <MapPin size={14} />
                    Voir sur la carte
                  </a>
                )}
                {itineraireUrl && (
                  <a
                    href={itineraireUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary text-sm flex items-center gap-2"
                  >
                    <Navigation size={14} />
                    Itinéraire
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
