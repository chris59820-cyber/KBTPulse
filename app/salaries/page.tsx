import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Plus, User, Mail, Phone, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default async function SalariesPage() {
  const user = await requireAuth()
  
  const salaries = await prisma.salarie.findMany({
    orderBy: { nom: 'asc' },
    take: 100
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion des salariés" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Liste des salariés</h2>
            {user && user.role !== 'OUVRIER' && (
              <Link href="/salaries/nouveau" className="btn btn-primary flex items-center gap-2">
                <Plus size={20} />
                Nouveau salarié
              </Link>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salarié
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Poste
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Contact
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Date d'embauche
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salaries.map((salarie) => (
                      <tr key={salarie.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="text-primary-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {salarie.prenom} {salarie.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase size={16} />
                          <span className="truncate max-w-[150px]">{salarie.poste}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          {salarie.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} />
                              {salarie.email}
                            </div>
                          )}
                          {salarie.telephone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              {salarie.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {formatDate(salarie.dateEmbauche)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          salarie.statut === 'actif' ? 'badge-success' :
                          salarie.statut === 'inactif' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {salarie.statut}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/salaries/${salarie.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {salaries.length === 0 && (
            <div className="card text-center py-12">
              <User className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun salarié
              </h3>
              {user && user.role !== 'OUVRIER' ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Commencez par ajouter votre premier salarié
                  </p>
                  <Link href="/salaries/nouveau" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Ajouter un salarié
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">
                  Aucun salarié disponible pour le moment
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
