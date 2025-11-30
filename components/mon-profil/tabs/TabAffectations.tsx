import { Calendar, Building2, Clock, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Salarie {
  affectations: {
    id: string
    date: Date
    heureDebut: string | null
    heureFin: string | null
    description: string | null
    chantier: {
      id: string
      nom: string
      adresse: string | null
    }
  }[]
}

interface TabAffectationsProps {
  salarie: Salarie
}

export default function TabAffectations({ salarie }: TabAffectationsProps) {
  const now = new Date()
  const aujourdhui = new Date(now.setHours(0, 0, 0, 0))

  const affectationsActuelles = salarie.affectations.filter(a => {
    const date = new Date(a.date)
    return date >= aujourdhui
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const affectationsPassees = salarie.affectations.filter(a => {
    const date = new Date(a.date)
    return date < aujourdhui
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Affectations</h3>
      
      {/* Affectations actuelles et futures */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4">
          Affectations actuelles et futures ({affectationsActuelles.length})
        </h4>
        <div className="space-y-3">
          {affectationsActuelles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune affectation à venir</p>
          ) : (
            affectationsActuelles.map((affectation) => (
              <Link
                key={affectation.id}
                href={`/chantiers/${affectation.chantier.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="text-primary-600" size={20} />
                      <h5 className="font-semibold text-gray-900">{affectation.chantier.nom}</h5>
                    </div>
                    {affectation.chantier.adresse && (
                      <p className="text-sm text-gray-600 mb-2">{affectation.chantier.adresse}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(affectation.date)}</span>
                      </div>
                      {affectation.heureDebut && affectation.heureFin && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{affectation.heureDebut} - {affectation.heureFin}</span>
                        </div>
                      )}
                    </div>
                    {affectation.description && (
                      <p className="text-sm text-gray-600 mt-2">{affectation.description}</p>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Affectations passées */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4">
          Affectations passées ({affectationsPassees.length})
        </h4>
        <div className="space-y-3">
          {affectationsPassees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune affectation passée</p>
          ) : (
            affectationsPassees.slice(0, 10).map((affectation) => (
              <div
                key={affectation.id}
                className="card bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="text-gray-400" size={20} />
                      <h5 className="font-semibold text-gray-900">{affectation.chantier.nom}</h5>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(affectation.date)}</span>
                      </div>
                      {affectation.heureDebut && affectation.heureFin && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{affectation.heureDebut} - {affectation.heureFin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
