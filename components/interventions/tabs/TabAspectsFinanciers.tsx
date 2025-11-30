import { DollarSign, TrendingUp, TrendingDown, Calculator, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Intervention {
  montantTotal: number | null
  montantResteAFaire: number | null
  avancement: number
  dureeReelle: number | null
  affectationsIntervention: {
    salarie: {
      tauxHoraire: number | null
    }
  }[]
}

interface TabAspectsFinanciersProps {
  intervention: Intervention
}

export default function TabAspectsFinanciers({ intervention }: TabAspectsFinanciersProps) {
  // Calculer le taux horaire moyen de l'équipe
  const tauxHoraires = intervention.affectationsIntervention
    .map(aff => aff.salarie.tauxHoraire)
    .filter(taux => taux !== null && taux > 0) as number[]

  const tauxHoraireMoyen = tauxHoraires.length > 0
    ? tauxHoraires.reduce((sum, taux) => sum + taux, 0) / tauxHoraires.length
    : 0

  // Calculer le coût réel (temps passé × taux horaire moyen)
  const coutReel = intervention.dureeReelle && tauxHoraireMoyen > 0
    ? intervention.dureeReelle * tauxHoraireMoyen
    : 0

  // Calculer le reste à faire si montant total disponible
  const resteAFaire = intervention.montantTotal
    ? intervention.montantTotal - (intervention.montantTotal * intervention.avancement / 100)
    : intervention.montantResteAFaire || 0

  // Comparaison avec le montant de l'intervention
  const ecart = intervention.montantTotal ? intervention.montantTotal - coutReel : 0
  const ecartPourcentage = intervention.montantTotal && intervention.montantTotal > 0
    ? (ecart / intervention.montantTotal) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspects financiers</h3>
        <p className="text-sm text-gray-600 mb-6">
          Accès réservé : PREPA, CE, RDC, CAFF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Montant total */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-primary-600" size={20} />
            <h4 className="font-semibold text-gray-900">Montant total</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {intervention.montantTotal ? formatCurrency(intervention.montantTotal) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">Montant de l'intervention</p>
        </div>

        {/* Reste à faire */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="text-orange-600" size={20} />
            <h4 className="font-semibold text-gray-900">Reste à faire</h4>
          </div>
          <p className="text-2xl font-bold text-orange-600 mb-1">
            {formatCurrency(resteAFaire)}
          </p>
          <p className="text-xs text-gray-500">
            Selon l'avancement ({intervention.avancement}%)
          </p>
        </div>

        {/* Coût réel */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="text-blue-600" size={20} />
            <h4 className="font-semibold text-gray-900">Coût réel</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">
            {coutReel > 0 ? formatCurrency(coutReel) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            Temps passé × Taux moyen
            {tauxHoraireMoyen > 0 && (
              <span className="block mt-1">
                ({intervention.dureeReelle || 0}h × {formatCurrency(tauxHoraireMoyen)}/h)
              </span>
            )}
          </p>
        </div>

        {/* Écart */}
        {intervention.montantTotal && coutReel > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className={ecart >= 0 ? 'text-green-600' : 'text-red-600'} size={20} />
              <h4 className="font-semibold text-gray-900">Écart</h4>
            </div>
            <p className={`text-2xl font-bold mb-1 ${ecart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
            </p>
            <p className="text-xs text-gray-500">
              {ecart >= 0 ? 'Économie' : 'Dépassement'}
              {ecartPourcentage !== 0 && (
                <span className="block mt-1">
                  ({ecartPourcentage >= 0 ? '+' : ''}{ecartPourcentage.toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Bilan financier détaillé */}
      <div className="card">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Bilan financier</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Montant total de l'intervention</span>
            <span className="font-semibold text-gray-900">
              {intervention.montantTotal ? formatCurrency(intervention.montantTotal) : 'N/A'}
            </span>
          </div>

          {intervention.dureeReelle && tauxHoraireMoyen > 0 && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  Temps passé × Taux horaire moyen de l'équipe
                </span>
                <span className="font-semibold text-gray-900">
                  {intervention.dureeReelle}h × {formatCurrency(tauxHoraireMoyen)}/h
                  <span className="ml-2 text-primary-600">
                    = {formatCurrency(coutReel)}
                  </span>
                </span>
              </div>

              {intervention.montantTotal && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Reste à faire (selon avancement)</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(resteAFaire)}
                    <span className="ml-2 text-xs text-gray-500">
                      ({100 - intervention.avancement}%)
                    </span>
                  </span>
                </div>
              )}

              {intervention.montantTotal && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-gray-900">Écart</span>
                  <span className={`font-bold ${ecart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
                    <span className="ml-2 text-sm">
                      ({ecartPourcentage >= 0 ? '+' : ''}{ecartPourcentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )}
            </>
          )}

          {(!intervention.dureeReelle || tauxHoraireMoyen === 0) && (
            <p className="text-sm text-gray-500 italic text-center py-4">
              Les informations financières seront disponibles une fois le temps réellement passé saisi
              {tauxHoraireMoyen === 0 && ' et les taux horaires de l\'équipe renseignés'}
            </p>
          )}
        </div>
      </div>

      {/* Informations complémentaires */}
      {tauxHoraires.length > 0 && (
        <div className="card bg-gray-50">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">Taux horaires de l'équipe</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Nombre de personnes avec taux horaire: {tauxHoraires.length}</p>
            <p>Taux horaire moyen: {formatCurrency(tauxHoraireMoyen)}/h</p>
            {intervention.dureeReelle && (
              <p>
                Coût total estimé: {formatCurrency(intervention.dureeReelle * tauxHoraireMoyen)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
