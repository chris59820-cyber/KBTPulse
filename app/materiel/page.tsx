import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Package, Truck, Wrench, Droplet } from 'lucide-react'
import Link from 'next/link'

const categorieIcons: Record<string, any> = {
  outillage: Wrench,
  vehicule: Truck,
  machine: Wrench,
  consommable: Droplet
}

const categorieLabels: Record<string, string> = {
  outillage: 'Outillage',
  vehicule: 'Véhicule',
  machine: 'Machine',
  consommable: 'Consommable'
}

const typesMaterielFourni: Record<string, string> = {
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

const typesMaterielAttribue: Record<string, string> = {
  cle_echafaudage: 'Clé échafaudage',
  marteau: 'Marteau',
  caisse_calorifuge: 'Caisse calorifuge',
  harnais: 'Harnais',
  detecteur_4_gaz: 'Détecteur 4 gaz',
  ceinture_porte_outil: 'Ceinture porte-outil',
  chaussures_securite: 'Chaussures de sécurité type Rangeruse',
  masque_gvs: 'Masque GVS'
}

export default async function MaterielPage() {
  const user = await requireAuth()
  
  // Pour les ouvriers, afficher uniquement leur matériel fourni et attribué
  // Pour les autres rôles, afficher l'inventaire complet
  let materiel: any[] = []
  let materielOuvrier: {
    materielFourni: any[]
    materielAttribue: any[]
    enginsConfies: any[]
  } | null = null

  if (user.role === 'OUVRIER' && user.salarieId) {
    // Récupérer le matériel du salarié ouvrier
    const salarie = await prisma.salarie.findUnique({
      where: { id: user.salarieId },
      include: {
        materielFourni: true,
        materielAttribue: {
          where: {
            dateRestitution: null // Uniquement le matériel non restitué
          }
        },
        enginsConfies: {
          where: {
            dateRestitution: null // Uniquement les engins non restitués
          }
        }
      }
    })

    if (salarie) {
      materielOuvrier = {
        materielFourni: salarie.materielFourni,
        materielAttribue: salarie.materielAttribue,
        enginsConfies: salarie.enginsConfies
      }
    }
  } else {
    // Pour les autres rôles, afficher l'inventaire complet
    materiel = await prisma.materiel.findMany({
      orderBy: { nom: 'asc' },
      take: 100
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion du matériel" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.role === 'OUVRIER' ? 'Mon matériel' : 'Inventaire du matériel'}
            </h2>
            {user && user.role !== 'OUVRIER' && (
              <Link href="/materiel/nouveau" className="btn btn-primary flex items-center gap-2">
                <Plus size={20} />
                Nouveau matériel
              </Link>
            )}
          </div>

          {user.role === 'OUVRIER' && materielOuvrier ? (
            <div className="space-y-6">
              {/* Matériel fourni */}
              {materielOuvrier.materielFourni.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Matériel fourni</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materielOuvrier.materielFourni.map((item) => (
                      <div key={item.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 rounded-lg">
                              <Package className="text-primary-600" size={24} />
                            </div>
                            <div>
                              <h3 className="card-title">
                                {typesMaterielFourni[item.type] || item.type.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Fourni le {formatDate(item.dateFourni)}
                              </p>
                            </div>
                          </div>
                          <span className={`badge ${
                            item.etat === 'bon' ? 'badge-success' :
                            item.etat === 'usage' ? 'badge-warning' :
                            item.etat === 'degrade' ? 'badge-danger' :
                            'badge-danger'
                          }`}>
                            {item.etat}
                          </span>
                        </div>
                        {item.commentaire && (
                          <p className="text-sm text-gray-600">{item.commentaire}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matériel attribué */}
              {materielOuvrier.materielAttribue.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Matériel attribué</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materielOuvrier.materielAttribue.map((item) => (
                      <div key={item.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 rounded-lg">
                              <Package className="text-primary-600" size={24} />
                            </div>
                            <div>
                              <h3 className="card-title">
                                {typesMaterielAttribue[item.type] || item.type.replace(/_/g, ' ')}
                              </h3>
                              {item.reference && (
                                <p className="text-sm text-gray-500 mt-1">Réf: {item.reference}</p>
                              )}
                              {item.pointure && (
                                <p className="text-sm text-gray-500 mt-1">Pointure: {item.pointure}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                Attribué le {formatDate(item.dateAttribution)}
                              </p>
                            </div>
                          </div>
                          <span className={`badge ${
                            item.etat === 'bon' ? 'badge-success' :
                            item.etat === 'usage' ? 'badge-warning' :
                            item.etat === 'degrade' ? 'badge-danger' :
                            'badge-danger'
                          }`}>
                            {item.etat}
                          </span>
                        </div>
                        {item.commentaire && (
                          <p className="text-sm text-gray-600">{item.commentaire}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engins confiés */}
              {materielOuvrier.enginsConfies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engins confiés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materielOuvrier.enginsConfies.map((item) => (
                      <div key={item.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 rounded-lg">
                              <Truck className="text-primary-600" size={24} />
                            </div>
                            <div>
                              <h3 className="card-title">{item.type}</h3>
                              {item.marque && item.modele && (
                                <p className="text-sm text-gray-500 mt-1">{item.marque} {item.modele}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">{item.immatriculation}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Attribué le {formatDate(item.dateAttribution)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {item.commentaire && (
                          <p className="text-sm text-gray-600">{item.commentaire}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message si aucun matériel */}
              {materielOuvrier.materielFourni.length === 0 && 
               materielOuvrier.materielAttribue.length === 0 && 
               materielOuvrier.enginsConfies.length === 0 && (
                <div className="card text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun matériel assigné
                  </h3>
                  <p className="text-gray-500">
                    Vous n'avez aucun matériel fourni, attribué ou engin confié pour le moment
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materiel.map((item) => {
                const Icon = categorieIcons[item.categorie] || Package
                return (
                  <Link
                    key={item.id}
                    href={`/materiel/${item.id}`}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-100 rounded-lg">
                          <Icon className="text-primary-600" size={24} />
                        </div>
                        <div>
                          <h3 className="card-title">{item.nom}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {categorieLabels[item.categorie] || item.categorie}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${
                        item.statut === 'disponible' ? 'badge-success' :
                        item.statut === 'en_utilisation' ? 'badge-info' :
                        item.statut === 'maintenance' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {item.statut.replace('_', ' ')}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Quantité</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.quantite} {item.unite}
                        </p>
                      </div>
                      {item.prixUnitaire && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Prix unitaire</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.prixUnitaire)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {user.role !== 'OUVRIER' && materiel.length === 0 && (
            <div className="card text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun matériel
              </h3>
              {user && user.role !== 'OUVRIER' ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Commencez par ajouter votre premier matériel
                  </p>
                  <Link href="/materiel/nouveau" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Ajouter du matériel
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">
                  Aucun matériel disponible pour le moment
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
