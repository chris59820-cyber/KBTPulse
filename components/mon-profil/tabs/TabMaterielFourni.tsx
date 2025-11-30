import { Package, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  materielFourni: {
    id: string
    type: string
    dateFourni: Date
    etat: string
    commentaire: string | null
  }[]
}

interface TabMaterielFourniProps {
  salarie: Salarie
}

const typesMateriel: Record<string, string> = {
  lampe_frontale: 'Lampe frontale',
  perceuse_batterie: 'Perceuse sur batterie',
  masque_fuite: 'Masque de fuite',
  stop_chute: 'Stop Chute',
  visseuse: 'Visseuse',
  masque_catec: 'Masque CATEC',
  gilet_sauvetage: 'Gilet de sauvetage',
  telephone: 'Téléphone',
  talkie_walkie: 'Talkie-Walkie'
}

const etatColors: Record<string, string> = {
  bon: 'text-green-600',
  usage: 'text-yellow-600',
  degrade: 'text-orange-600',
  perdu: 'text-red-600'
}

export default function TabMaterielFourni({ salarie }: TabMaterielFourniProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Matériel fourni</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salarie.materielFourni.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-full">Aucun matériel fourni</p>
        ) : (
          salarie.materielFourni.map((materiel) => (
            <div
              key={materiel.id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Package className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      {typesMateriel[materiel.type] || materiel.type}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center gap-1 text-sm ${etatColors[materiel.etat] || 'text-gray-600'}`}>
                        {materiel.etat === 'bon' && <CheckCircle size={14} />}
                        {materiel.etat === 'usage' && <AlertCircle size={14} />}
                        {materiel.etat === 'perdu' && <XCircle size={14} />}
                        <span className="capitalize">{materiel.etat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Fourni le {formatDate(materiel.dateFourni)}</span>
              </div>

              {materiel.commentaire && (
                <p className="text-sm text-gray-600 mt-2">{materiel.commentaire}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
