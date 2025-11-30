import { Car, Truck, Settings, Calendar, Camera, FileText, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  enginsConfies: {
    id: string
    type: string
    marque: string | null
    modele: string | null
    immatriculation: string
    dateAttribution: Date
    dateRestitution: Date | null
    photoAttribution: string | null
    ficheConstatAttribution: string | null
    photoRestitution: string | null
    ficheConstatRestitution: string | null
    commentaire: string | null
  }[]
}

interface TabEnginsConfiesProps {
  salarie: Salarie
}

const typeIcons: Record<string, any> = {
  Voiture: Car,
  Camion: Truck,
  Engin: Settings
}

export default function TabEnginsConfies({ salarie }: TabEnginsConfiesProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Engins confiés</h3>
      
      <div className="space-y-4">
        {salarie.enginsConfies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun engin confié</p>
        ) : (
          salarie.enginsConfies.map((engin) => {
            const Icon = typeIcons[engin.type] || Car
            
            return (
              <div
                key={engin.id}
                className={`card ${!engin.dateRestitution ? 'border-l-4 border-l-primary-600' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {engin.photoAttribution ? (
                    <img
                      src={engin.photoAttribution}
                      alt={engin.immatriculation}
                      className="w-24 h-24 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-primary-600" size={32} />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-gray-900">
                            {engin.type}
                          </h5>
                          {!engin.dateRestitution && (
                            <span className="badge badge-info text-xs">En cours</span>
                          )}
                        </div>
                        {engin.marque && engin.modele && (
                          <p className="text-sm text-gray-600">{engin.marque} {engin.modele}</p>
                        )}
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {engin.immatriculation}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Attribué le {formatDate(engin.dateAttribution)}</span>
                      </div>
                      {engin.dateRestitution && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Restitué le {formatDate(engin.dateRestitution)}</span>
                        </div>
                      )}
                    </div>

                    {engin.commentaire && (
                      <p className="text-sm text-gray-600 mt-2">{engin.commentaire}</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      {engin.photoAttribution && (
                        <a
                          href={engin.photoAttribution}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Camera size={14} />
                          Photo attribution
                        </a>
                      )}
                      {engin.ficheConstatAttribution && (
                        <a
                          href={engin.ficheConstatAttribution}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <FileText size={14} />
                          Fiche constat attribution
                        </a>
                      )}
                      {engin.dateRestitution && engin.photoRestitution && (
                        <a
                          href={engin.photoRestitution}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Camera size={14} />
                          Photo restitution
                        </a>
                      )}
                      {engin.dateRestitution && engin.ficheConstatRestitution && (
                        <a
                          href={engin.ficheConstatRestitution}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <FileText size={14} />
                          Fiche constat restitution
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
