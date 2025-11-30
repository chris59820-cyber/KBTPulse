import { User, Phone, Mail, MapPin, Calendar, Camera } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Ouvrier {
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  dateNaissance: Date | null
  photoUrl: string | null
}

interface TabInformationsPersonnellesProps {
  ouvrier: Ouvrier
}

export default function TabInformationsPersonnelles({ ouvrier }: TabInformationsPersonnellesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <User className="text-gray-400 mt-1" size={20} />
          <div>
            <p className="text-sm text-gray-500 mb-1">Nom complet</p>
            <p className="text-gray-900 font-medium">{ouvrier.prenom} {ouvrier.nom}</p>
          </div>
        </div>

        {ouvrier.dateNaissance && (
          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
              <p className="text-gray-900 font-medium">{formatDate(ouvrier.dateNaissance)}</p>
            </div>
          </div>
        )}

        {ouvrier.email && (
          <div className="flex items-start gap-3">
            <Mail className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">E-mail</p>
              <p className="text-gray-900 font-medium">{ouvrier.email}</p>
            </div>
          </div>
        )}

        {ouvrier.telephone && (
          <div className="flex items-start gap-3">
            <Phone className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Téléphone</p>
              <p className="text-gray-900 font-medium">{ouvrier.telephone}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {ouvrier.adresse && (
          <div className="flex items-start gap-3">
            <MapPin className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Adresse</p>
              <p className="text-gray-900 font-medium">{ouvrier.adresse}</p>
            </div>
          </div>
        )}

        {ouvrier.photoUrl && (
          <div className="flex items-start gap-3">
            <Camera className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Photo</p>
              <img
                src={ouvrier.photoUrl}
                alt={`${ouvrier.prenom} ${ouvrier.nom}`}
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
  )
}
