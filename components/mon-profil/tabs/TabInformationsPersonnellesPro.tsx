import { User, Phone, Mail, MapPin, Calendar, Briefcase, Hash, Camera, TrendingUp, Car } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Salarie {
  nom: string
  prenom: string
  fonction: string | null
  coefficient: number | null
  matricule: string | null
  telephone: string | null
  adresse: string | null
  dateNaissance: Date | null
  email: string | null
  photoUrl: string | null
  dateEmbauche: Date
  typeContrat: string | null
  tauxHoraire: number | null
}

interface TabInformationsPersonnellesProProps {
  salarie: Salarie
  deplacementKM: number | null
}

export default function TabInformationsPersonnellesPro({ salarie, deplacementKM }: TabInformationsPersonnellesProProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Nom complet</p>
                <p className="text-gray-900 font-medium">{salarie.prenom} {salarie.nom}</p>
              </div>
            </div>

            {salarie.dateNaissance && (
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
                  <p className="text-gray-900 font-medium">{formatDate(salarie.dateNaissance)}</p>
                </div>
              </div>
            )}

            {salarie.email && (
              <div className="flex items-start gap-3">
                <Mail className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">E-mail</p>
                  <p className="text-gray-900 font-medium">{salarie.email}</p>
                </div>
              </div>
            )}

            {salarie.telephone && (
              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                  <p className="text-gray-900 font-medium">{salarie.telephone}</p>
                </div>
              </div>
            )}

            {salarie.adresse && (
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Adresse</p>
                  <p className="text-gray-900 font-medium">{salarie.adresse}</p>
                </div>
              </div>
            )}

            {salarie.photoUrl && (
              <div className="flex items-start gap-3">
                <Camera className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Photo</p>
                  <img
                    src={salarie.photoUrl}
                    alt={`${salarie.prenom} ${salarie.nom}`}
                    className="w-32 h-32 rounded-lg object-cover mt-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations professionnelles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
          <div className="space-y-4">
            {salarie.fonction && (
              <div className="flex items-start gap-3">
                <Briefcase className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fonction</p>
                  <p className="text-gray-900 font-medium">{salarie.fonction}</p>
                </div>
              </div>
            )}

            {salarie.coefficient !== null && (
              <div className="flex items-start gap-3">
                <TrendingUp className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Coefficient</p>
                  <p className="text-gray-900 font-medium">{salarie.coefficient}</p>
                </div>
              </div>
            )}

            {salarie.matricule && (
              <div className="flex items-start gap-3">
                <Hash className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Numéro de matricule</p>
                  <p className="text-gray-900 font-medium">{salarie.matricule}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Date d'embauche</p>
                <p className="text-gray-900 font-medium">{formatDate(salarie.dateEmbauche)}</p>
              </div>
            </div>

            {salarie.typeContrat && (
              <div className="flex items-start gap-3">
                <Briefcase className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type de contrat</p>
                  <p className="text-gray-900 font-medium">{salarie.typeContrat}</p>
                </div>
              </div>
            )}

            {salarie.tauxHoraire !== null && (
              <div className="flex items-start gap-3">
                <DollarSign className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taux horaire</p>
                  <p className="text-gray-900 font-medium">{formatCurrency(salarie.tauxHoraire)}</p>
                </div>
              </div>
            )}

            {deplacementKM !== null && (
              <div className="flex items-start gap-3">
                <Car className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Déplacement (KM)</p>
                  <p className="text-gray-900 font-medium">
                    {deplacementKM.toFixed(2)} km
                    <span className="text-xs text-gray-500 ml-2">(calculé automatiquement)</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
