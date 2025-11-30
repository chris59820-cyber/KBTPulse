'use client'

import { useState } from 'react'
import { Clock, Calendar, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  horaires: {
    id: string
    jourSemaine: number
    heureDebut: string
    heureFin: string
    pauseDebut: string | null
    pauseFin: string | null
    actif: boolean
  }[]
  pointages: {
    id: string
    date: Date
    heureArrivee: string | null
    heureDepart: string | null
    type: string
  }[]
}

interface TabHorairesTempsTravailProps {
  salarie: Salarie
}

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function TabHorairesTempsTravail({ salarie }: TabHorairesTempsTravailProps) {
  const [periode, setPeriode] = useState<'jour' | 'semaine' | 'mois' | 'annee'>('semaine')

  // Calculer les heures travaillées
  const calculerHeures = (pointages: typeof salarie.pointages) => {
    let totalHeures = 0
    let totalMinutes = 0

    pointages.forEach(pointage => {
      if (pointage.heureArrivee && pointage.heureDepart) {
        const [hArr, mArr] = pointage.heureArrivee.split(':').map(Number)
        const [hDep, mDep] = pointage.heureDepart.split(':').map(Number)
        
        let heures = hDep - hArr
        let minutes = mDep - mArr
        
        if (minutes < 0) {
          heures--
          minutes += 60
        }
        
        totalHeures += heures
        totalMinutes += minutes
      }
    })

    totalHeures += Math.floor(totalMinutes / 60)
    totalMinutes = totalMinutes % 60

    return { heures: totalHeures, minutes: totalMinutes }
  }

  const now = new Date()
  let pointagesFiltres = salarie.pointages

  switch (periode) {
    case 'jour':
      const aujourdhui = new Date(now.setHours(0, 0, 0, 0))
      pointagesFiltres = salarie.pointages.filter(p => {
        const date = new Date(p.date)
        return date.toDateString() === aujourdhui.toDateString()
      })
      break
    case 'semaine':
      const debutSemaine = new Date(now)
      debutSemaine.setDate(now.getDate() - now.getDay())
      debutSemaine.setHours(0, 0, 0, 0)
      const finSemaine = new Date(debutSemaine)
      finSemaine.setDate(debutSemaine.getDate() + 6)
      finSemaine.setHours(23, 59, 59, 999)
      pointagesFiltres = salarie.pointages.filter(p => {
        const date = new Date(p.date)
        return date >= debutSemaine && date <= finSemaine
      })
      break
    case 'mois':
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
      const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      pointagesFiltres = salarie.pointages.filter(p => {
        const date = new Date(p.date)
        return date >= debutMois && date <= finMois
      })
      break
    case 'annee':
      const debutAnnee = new Date(now.getFullYear(), 0, 1)
      const finAnnee = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      pointagesFiltres = salarie.pointages.filter(p => {
        const date = new Date(p.date)
        return date >= debutAnnee && date <= finAnnee
      })
      break
  }

  const tempsTravaille = calculerHeures(pointagesFiltres)

  return (
    <div className="space-y-6">
      {/* Sélection de la période */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Horaires et temps de travail</h3>
        <div className="flex gap-2">
          {(['jour', 'semaine', 'mois', 'annee'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                periode === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p === 'jour' ? 'Jour' : p === 'semaine' ? 'Semaine' : p === 'mois' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="text-primary-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tempsTravaille.heures}h{tempsTravaille.minutes > 0 ? `${tempsTravaille.minutes}` : ''}
          </p>
          <p className="text-sm text-gray-500">Heures travaillées ({periode})</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="text-primary-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {pointagesFiltres.length}
          </p>
          <p className="text-sm text-gray-500">Jours pointés</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="text-primary-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {pointagesFiltres.length > 0 
              ? (tempsTravaille.heures / pointagesFiltres.length).toFixed(1)
              : 0}h
          </p>
          <p className="text-sm text-gray-500">Moyenne par jour</p>
        </div>
      </div>

      {/* Horaires par jour */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Horaires par jour</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {joursSemaine.map((jour, index) => {
            const horaire = salarie.horaires.find(h => h.jourSemaine === index && h.actif)
            return (
              <div
                key={index}
                className={`card ${horaire ? 'bg-primary-50' : 'bg-gray-50'}`}
              >
                <h5 className="font-semibold text-gray-900 mb-2">{jour}</h5>
                {horaire ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span>{horaire.heureDebut} - {horaire.heureFin}</span>
                    </div>
                    {horaire.pauseDebut && horaire.pauseFin && (
                      <div className="text-gray-600 text-xs ml-6">
                        Pause: {horaire.pauseDebut} - {horaire.pauseFin}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Pas d'horaire défini</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Derniers pointages */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Derniers pointages ({periode})</h4>
        <div className="space-y-2">
          {pointagesFiltres.slice(0, 10).length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun pointage pour cette période</p>
          ) : (
            pointagesFiltres.slice(0, 10).map((pointage) => (
              <div
                key={pointage.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(pointage.date)}</p>
                    {pointage.heureArrivee && pointage.heureDepart && (
                      <p className="text-sm text-gray-600">
                        {pointage.heureArrivee} - {pointage.heureDepart}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`badge ${
                  pointage.type === 'normal' ? 'badge-success' :
                  pointage.type === 'retard' ? 'badge-warning' :
                  pointage.type === 'absence' ? 'badge-danger' :
                  'badge-info'
                } text-xs`}>
                  {pointage.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
