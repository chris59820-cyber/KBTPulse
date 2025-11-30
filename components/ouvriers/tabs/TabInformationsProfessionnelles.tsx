import { Briefcase, User, Hash, Calendar, TrendingUp, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Ouvrier {
  poste: string
  fonction: string | null
  metier: string | null
  coefficient: number | null
  tauxHoraire: number | null
  matricule: string | null
  dateEmbauche: Date
  competences: {
    id: string
    nom: string
    niveau: string | null
  }[]
}

interface TabInformationsProfessionnellesProps {
  ouvrier: Ouvrier
}

interface TabInformationsProfessionnellesProps {
  ouvrier: Ouvrier
  canViewSensitive: boolean
}

export default function TabInformationsProfessionnelles({ ouvrier, canViewSensitive }: TabInformationsProfessionnellesProps) {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Briefcase className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Poste</p>
              <p className="text-gray-900 font-medium">{ouvrier.poste}</p>
            </div>
          </div>

          {ouvrier.fonction && (
            <div className="flex items-start gap-3">
              <User className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Fonction</p>
                <p className="text-gray-900 font-medium">{ouvrier.fonction}</p>
              </div>
            </div>
          )}

          {ouvrier.metier && (
            <div className="flex items-start gap-3">
              <Briefcase className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Métier exercé</p>
                <p className="text-gray-900 font-medium">{ouvrier.metier}</p>
              </div>
            </div>
          )}

          {ouvrier.matricule && (
            <div className="flex items-start gap-3">
              <Hash className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Numéro de matricule</p>
                <p className="text-gray-900 font-medium">{ouvrier.matricule}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Date d'embauche</p>
              <p className="text-gray-900 font-medium">{formatDate(ouvrier.dateEmbauche)}</p>
            </div>
          </div>
        </div>

        {canViewSensitive && (
          <div className="space-y-4">
            {ouvrier.coefficient !== null && (
              <div className="flex items-start gap-3">
                <TrendingUp className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Coefficient</p>
                  <p className="text-gray-900 font-medium">{ouvrier.coefficient}</p>
                </div>
              </div>
            )}

            {ouvrier.tauxHoraire !== null && (
              <div className="flex items-start gap-3">
                <DollarSign className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taux horaire</p>
                  <p className="text-gray-900 font-medium">{formatCurrency(ouvrier.tauxHoraire)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compétences */}
      {ouvrier.competences.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Compétences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ouvrier.competences.map((competence) => (
              <div
                key={competence.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <p className="font-medium text-gray-900 mb-1">{competence.nom}</p>
                {competence.niveau && (
                  <span className={`badge ${
                    competence.niveau === 'expert' ? 'badge-success' :
                    competence.niveau === 'avance' ? 'badge-info' :
                    competence.niveau === 'intermediaire' ? 'badge-warning' :
                    'badge-secondary'
                  } text-xs`}>
                    {competence.niveau}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
