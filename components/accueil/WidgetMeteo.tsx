'use client'

import { useState, useEffect } from 'react'
import { MapPin, Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
  adresse: string
  ville: string | null
  latitude: number | null
  longitude: number | null
}

interface WidgetMeteoProps {
  perimetre: Perimetre | null
}

interface MeteoData {
  temperature: number
  condition: string
  icon: string
  prevision: {
    jour: string
    temp: number
    condition: string
  }[]
}

export default function WidgetMeteo({ perimetre }: WidgetMeteoProps) {
  const [meteo, setMeteo] = useState<MeteoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler les données météo (à remplacer par un appel API réel)
    const simulateMeteo = () => {
      const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      const prevision = jours.map((jour, index) => ({
        jour,
        temp: Math.floor(Math.random() * 10) + 15,
        condition: ['Sun', 'Cloud', 'CloudRain'][Math.floor(Math.random() * 3)]
      }))

      setMeteo({
        temperature: 22,
        condition: 'Ensoleillé',
        icon: 'Sun',
        prevision
      })
      setLoading(false)
    }

    simulateMeteo()
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sun':
        return <Sun className="text-yellow-500" size={24} />
      case 'Cloud':
        return <Cloud className="text-gray-500" size={24} />
      case 'CloudRain':
        return <CloudRain className="text-blue-500" size={24} />
      case 'CloudSnow':
        return <CloudSnow className="text-blue-300" size={24} />
      default:
        return <Sun className="text-yellow-500" size={24} />
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Météo</h2>
        {perimetre && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span>{perimetre.ville || perimetre.adresse}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : meteo ? (
        <>
          {/* Météo actuelle */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              {getWeatherIcon(meteo.icon)}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {meteo.temperature}°C
            </div>
            <p className="text-gray-600">{meteo.condition}</p>
          </div>

          {/* Prévisions de la semaine */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prévisions de la semaine</h3>
            {meteo.prevision.map((prev, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{prev.jour}</span>
                <div className="flex items-center gap-2">
                  {getWeatherIcon(prev.condition)}
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {prev.temp}°C
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8 text-sm">
          Données météo non disponibles
        </p>
      )}
    </div>
  )
}
