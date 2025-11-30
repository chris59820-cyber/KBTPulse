import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import EspaceCAFFContent from '@/components/espace-caff/EspaceCAFFContent'

export default async function EspaceCAFFPage() {
  const user = await requireSpace('CAFF')

  // Récupérer les statistiques
  let congesEnAttente = 0
  let totalSalaries = 0
  let codesAffaireActifs = 0

  try {
    // Compter les congés en attente pour ouvriers et CE
    const conges = await prisma.conge.findMany({
      where: {
        statut: 'en_attente',
        salarie: {
          user: {
            role: { in: ['OUVRIER', 'CE'] }
          }
        }
      },
      include: {
        salarie: {
          include: {
            user: true
          }
        }
      }
    })
    congesEnAttente = conges.length
  } catch (error) {
    console.error('Erreur lors du comptage des congés:', error)
  }

  try {
    totalSalaries = await prisma.salarie.count({
      where: { statut: 'actif' }
    })
  } catch (error) {
    console.error('Erreur lors du comptage des salariés:', error)
  }

  try {
    codesAffaireActifs = await prisma.codeAffaire.count({
      where: { actif: true }
    })
  } catch (error) {
    console.error('Erreur lors du comptage des codes affaire:', error)
    // Si le modèle n'existe pas encore, retourner 0
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Espace CAFF - Chargé d'affaires" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <EspaceCAFFContent
              user={user}
              congesEnAttente={congesEnAttente}
              totalSalaries={totalSalaries}
              codesAffaireActifs={codesAffaireActifs}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
