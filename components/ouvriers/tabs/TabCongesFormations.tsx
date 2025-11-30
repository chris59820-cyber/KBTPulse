'use client'

import { useState, useEffect } from 'react'
import { Calendar, GraduationCap, UserX, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TabCongesFormationsProps {
  salarieId: string
}

interface Conge {
  id: string
  type: string
  dateDebut: Date
  dateFin: Date
  dureeJours: number | null
  dureeHeures: number | null
  statut: string
  commentaire: string | null
}

interface Formation {
  id: string
  nom: string
  organisme: string | null
  dateFormation: Date
  dateExpiration: Date | null
  duree: number | null
}

export default function TabCongesFormations({ salarieId }: TabCongesFormationsProps) {
  const [conges, setConges] = useState<Conge[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [absences, setAbsences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [salarieId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Récupérer les congés validés
      const congesResponse = await fetch(`/api/salaries/${salarieId}/conges?statut=valide`)
      if (congesResponse.ok) {
        const congesData = await congesResponse.json()
        setConges(congesData.map((c: any) => ({
          ...c,
          dateDebut: new Date(c.dateDebut),
          dateFin: new Date(c.dateFin)
        })))
      }

      // Récupérer les formations
      const formationsResponse = await fetch(`/api/salaries/${salarieId}/formations`)
      if (formationsResponse.ok) {
        const formationsData = await formationsResponse.json()
        setFormations(formationsData.map((f: any) => ({
          ...f,
          dateFormation: new Date(f.dateFormation),
          dateExpiration: f.dateExpiration ? new Date(f.dateExpiration) : null
        })))
      }

      // Récupérer les absences (congés avec type "Absente" ou statut inactif)
      const absencesResponse = await fetch(`/api/salaries/${salarieId}/absences`)
      if (absencesResponse.ok) {
        const absencesData = await absencesResponse.json()
        setAbsences(absencesData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RTT':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'RC':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RL':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'CP':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Repos':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'EF':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RTT':
        return 'RTT'
      case 'RC':
        return 'RC'
      case 'RL':
        return 'RL'
      case 'CP':
        return 'Congés payés'
      case 'Repos':
        return 'Repos'
      case 'EF':
        return 'Événement familial'
      default:
        return type
    }
  }

  const filteredConges = filterType === 'all' 
    ? conges 
    : conges.filter(c => c.type === filterType)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filtrer par type :</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input text-sm"
        >
          <option value="all">Tous</option>
          <option value="RTT">RTT</option>
          <option value="RC">RC</option>
          <option value="RL">RL</option>
          <option value="CP">Congés payés</option>
          <option value="Repos">Repos</option>
          <option value="EF">Événement familial</option>
        </select>
      </div>

      {/* Congés */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-primary-600" size={20} />
          Congés validés
        </h4>
        {filteredConges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun congé validé</p>
        ) : (
          <div className="space-y-3">
            {filteredConges.map((conge) => (
              <div
                key={conge.id}
                className={`p-4 border rounded-lg ${getTypeColor(conge.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{getTypeLabel(conge.type)}</span>
                      <span className="text-xs opacity-75">
                        {formatDate(conge.dateDebut)} - {formatDate(conge.dateFin)}
                      </span>
                    </div>
                    {(conge.dureeJours || conge.dureeHeures) && (
                      <div className="text-sm opacity-75">
                        Durée: {conge.dureeJours ? `${conge.dureeJours} jour(s)` : ''}
                        {conge.dureeJours && conge.dureeHeures ? ' - ' : ''}
                        {conge.dureeHeures ? `${conge.dureeHeures} heure(s)` : ''}
                      </div>
                    )}
                    {conge.commentaire && (
                      <p className="text-sm mt-2 opacity-75">{conge.commentaire}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="text-primary-600" size={20} />
          Formations
        </h4>
        {formations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune formation</p>
        ) : (
          <div className="space-y-3">
            {formations.map((formation) => (
              <div
                key={formation.id}
                className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-indigo-900 mb-2">
                      {formation.nom}
                    </div>
                    <div className="text-sm text-indigo-700 space-y-1">
                      {formation.organisme && (
                        <div>Organisme: {formation.organisme}</div>
                      )}
                      <div>Date: {formatDate(formation.dateFormation)}</div>
                      {formation.dateExpiration && (
                        <div>Expire le: {formatDate(formation.dateExpiration)}</div>
                      )}
                      {formation.duree && (
                        <div>Durée: {formation.duree} heures</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Absences */}
      {absences.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserX className="text-primary-600" size={20} />
            Absences
          </h4>
          <div className="space-y-3">
            {absences.map((absence) => (
              <div
                key={absence.id}
                className="p-4 border border-gray-300 bg-gray-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">
                      Absence
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      {absence.dateDebut && absence.dateFin && (
                        <div>
                          {formatDate(new Date(absence.dateDebut))} - {formatDate(new Date(absence.dateFin))}
                        </div>
                      )}
                      {absence.commentaire && (
                        <div>{absence.commentaire}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

