import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import MonProfilContent from '@/components/mon-profil/MonProfilContent'

export default async function MonProfilPage() {
  const user = await requireAuth()
  // Récupérer les informations complètes du salarié
  const salarie = user?.salarieId ? await prisma.salarie.findUnique({
    where: { id: user.salarieId },
    include: {
      user: true,
      horaires: {
        where: { actif: true },
        orderBy: { jourSemaine: 'asc' }
      },
      affectations: {
        include: {
          chantier: true
        },
        orderBy: { date: 'asc' },
        take: 10
      },
      conges: {
        orderBy: { dateDebut: 'desc' },
        take: 50
      },
      contactsUrgence: {
        orderBy: { priorite: 'asc' }
      },
      materielFourni: true,
      enginsConfies: {
        where: {
          dateRestitution: null
        },
        orderBy: { dateAttribution: 'desc' }
      },
      materielAttribue: {
        where: {
          dateRestitution: null
        },
        orderBy: { dateAttribution: 'desc' }
      },
      habilitations: {
        where: { actif: true },
        orderBy: { dateExpiration: 'asc' }
      },
      autorisations: {
        where: { actif: true },
        orderBy: { dateExpiration: 'asc' }
      },
      visitesMedicales: {
        orderBy: { dateVisite: 'desc' },
        take: 10
      },
      documentsPersonnels: true,
      formationsSalarie: {
        orderBy: { dateFormation: 'desc' }
      },
      accesSitesClients: {
        orderBy: { dateExpiration: 'asc' }
      },
      pointages: {
        orderBy: { date: 'desc' },
        take: 100
      },
      salariePerimetres: {
        include: {
          perimetre: true
        },
        where: {
          dateFin: null
        }
      }
    }
  }) : null

  // Calculer le déplacement automatique si adresse et périmètre sont disponibles
  let deplacementKM = salarie?.deplacement || null
  if (salarie && salarie.adresse && salarie.salariePerimetres.length > 0) {
    const perimetre = salarie.salariePerimetres[0].perimetre
    if (perimetre.latitude && perimetre.longitude) {
      // En production, utiliser un service de géolocalisation (Google Maps API, etc.)
      // pour calculer la distance entre l'adresse du salarié et le périmètre
      // Pour l'instant, on garde la valeur existante ou on peut simuler
      if (!deplacementKM) {
        // Simulation : utiliser la valeur du périmètre si disponible
        deplacementKM = 0 // À remplacer par un calcul réel
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Mon Profil" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {salarie ? (
              <MonProfilContent salarie={salarie} user={user!} deplacementKM={deplacementKM} />
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">Aucune information de salarié associée à votre compte</p>
                <p className="text-sm text-gray-400">
                  Veuillez contacter votre administrateur pour associer un profil salarié à votre compte
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
