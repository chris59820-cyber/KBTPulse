import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import EspaceRDCContent from '@/components/espace-rdc/EspaceRDCContent'

export default async function EspaceRDCPage() {
  const user = await requireSpace('RDC')

  // Récupérer le salarié RDC pour obtenir son ID
  const salarieRDC = user.salarieId ? await prisma.salarie.findUnique({
    where: { id: user.salarieId }
  }) : null

  // Récupérer les salariés affectés à ce RDC
  const personnelAffecte = await prisma.salarie.findMany({
    where: {
      rdcId: salarieRDC?.id || user.id,
      statut: 'actif'
    },
    include: {
      conges: {
        where: {
          type: 'RTT',
          statut: 'en_attente'
        },
        orderBy: { dateDebut: 'asc' }
      },
      evaluations: {
        orderBy: { date: 'desc' },
        take: 5
      },
      evenementsRH: {
        orderBy: { date: 'desc' },
        take: 10
      },
      interventions: {
        where: {
          statut: { in: ['en_cours', 'planifiee'] }
        },
        take: 5
      },
      affectations: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        take: 10
      }
    },
    orderBy: { nom: 'asc' }
  })

  // Récupérer les statistiques
  const [interventionsEnCours, affectationsAujourdhui, congesRTTEnAttente] = await Promise.all([
    prisma.intervention.count({
      where: {
        rdcId: salarieRDC?.id || user.id,
        statut: 'en_cours'
      }
    }),
    prisma.affectationPlanning.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        },
        salarie: {
          rdcId: salarieRDC?.id || user.id
        }
      }
    }),
    prisma.conge.count({
      where: {
        type: 'RTT',
        statut: 'en_attente',
        salarie: {
          rdcId: salarieRDC?.id || user.id
        }
      }
    })
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Espace RDC - Responsable de chantier" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <EspaceRDCContent
              user={user}
              salarieRDC={salarieRDC}
              personnelAffecte={personnelAffecte}
              interventionsEnCours={interventionsEnCours}
              affectationsAujourdhui={affectationsAujourdhui}
              congesRTTEnAttente={congesRTTEnAttente}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
