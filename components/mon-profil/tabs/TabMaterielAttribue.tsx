import { Package, Calendar, Hash, Shoe } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  materielAttribue: {
    id: string
    type: string
    reference: string | null
    pointure: string | null
    dateAttribution: Date
    dateRestitution: Date | null
    etat: string
    commentaire: string | null
  }[]
}

interface TabMaterielAttribueProps {
  salarie: Salarie
}

const typesMateriel: Record<string, string> = {
  cle_echafaudage: 'Clé échafaudage',
  marteau: 'Marteau',
  caisse_calorifuge: 'Caisse calorifuge',
  harnais: 'Harnais',
  detecteur_4_gaz: 'Détecteur 4 gaz',
  ceinture_porte_outil: 'Ceinture porte-outil',
  chaussures_securite: 'Chaussures de sécurité type Rangeruse',
  masque_gvs: 'Masque GVS'
}

export default function TabMaterielAttribue({ salarie }: TabMaterielAttribueProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Matériel attribué</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salarie.materielAttribue.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-full">Aucun matériel attribué</p>
        ) : (
          salarie.materielAttribue.map((materiel) => (
            <div
              key={materiel.id}
              className={`card ${!materiel.dateRestitution ? 'border-l-4 border-l-primary-600' : ''}`}
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
                    {materiel.reference && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <Hash size={14} />
                        <span>Référence: {materiel.reference}</span>
                      </div>
                    )}
                    {materiel.type === 'chaussures_securite' && materiel.pointure && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <Shoe size={14} />
                        <span>Pointure: {materiel.pointure}</span>
                      </div>
                    )}
                    {materiel.type === 'chaussures_securite' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Date d'attribution: {formatDate(materiel.dateAttribution)}
                      </p>
                    )}
                    {materiel.type === 'masque_gvs' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Date d'attribution: {formatDate(materiel.dateAttribution)}
                      </p>
                    )}
                  </div>
                </div>
                {!materiel.dateRestitution && (
                  <span className="badge badge-info text-xs">Attribué</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>
                  {materiel.dateRestitution 
                    ? `Restitué le ${formatDate(materiel.dateRestitution)}`
                    : `Attribué le ${formatDate(materiel.dateAttribution)}`
                  }
                </span>
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
