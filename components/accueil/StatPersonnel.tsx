import { prisma } from '@/lib/prisma'
import { Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface StatPersonnelProps {
  perimetreId: string | undefined
}

export default async function StatPersonnel({ perimetreId }: StatPersonnelProps) {
  // Récupérer les salariés du périmètre
  const salaries = await prisma.salarie.findMany({
    where: {
      statut: 'actif',
      ...(perimetreId ? {
        salariePerimetres: {
          some: {
            perimetreId
          }
        }
      } : {})
    },
    include: {
      salariePerimetres: true
    }
  })

  // Compter par fonction
  const parFonction = salaries.reduce((acc, salarie) => {
    const fonction = salarie.fonction || salarie.poste || 'Non défini'
    acc[fonction] = (acc[fonction] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Compter par RDC
  const parRDC = salaries.reduce((acc, salarie) => {
    const rdc = salarie.rdcId || 'Non affecté'
    acc[rdc] = (acc[rdc] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalSalaries = salaries.length

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Statistiques du personnel</h3>
        </div>
        <Link
          href="/salaries"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Voir tout
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Total */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total salariés sur le périmètre</p>
        <p className="text-3xl font-bold text-primary-600">{totalSalaries}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Par fonction */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Par fonction</h4>
          <div className="space-y-2">
            {Object.entries(parFonction).length === 0 ? (
              <p className="text-sm text-gray-500">Aucune donnée</p>
            ) : (
              Object.entries(parFonction).map(([fonction, count]) => (
                <Link
                  key={fonction}
                  href={`/salaries?fonction=${encodeURIComponent(fonction)}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-gray-900">{fonction}</span>
                  <span className="text-sm font-semibold text-primary-600">{count}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Par RDC */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Par RDC</h4>
          <div className="space-y-2">
            {Object.entries(parRDC).length === 0 ? (
              <p className="text-sm text-gray-500">Aucune donnée</p>
            ) : (
              Object.entries(parRDC).map(([rdc, count]) => (
                <Link
                  key={rdc}
                  href={`/salaries?rdc=${encodeURIComponent(rdc)}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-gray-900">{rdc}</span>
                  <span className="text-sm font-semibold text-primary-600">{count}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
