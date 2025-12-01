export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import ActualitesSection from '@/components/accueil/ActualitesSection'
import ChatSection from '@/components/accueil/ChatSection'
import MessagesSecuriteSection from '@/components/accueil/MessagesSecuriteSection'
import WidgetMeteo from '@/components/accueil/WidgetMeteo'
import BoutonsAccesRapide from '@/components/accueil/BoutonsAccesRapide'
import TableauBordAccueil from '@/components/accueil/TableauBordAccueil'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AccueilPage() {
  const user = await getCurrentUser()
  
  // Vérifier si l'utilisateur a accès à cette page
  if (!user) {
    redirect('/connexion')
  }

  const allowedRoles = ['PREPA', 'RDC', 'CAFF', 'AUTRE', 'OUVRIER', 'ADMIN']
  if (!allowedRoles.includes(user.role)) {
    redirect('/acces-refuse')
  }

  // Récupérer les données nécessaires
  const [actualites, messagesSecurite, conversations, perimetres] = await Promise.all([
    prisma.actualite.findMany({
      where: { publie: true },
      orderBy: { datePublication: 'desc' },
      take: 10,
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    }),
    prisma.messageSecurite.findMany({
      where: { 
        actif: true,
        OR: [
          { dateFin: null },
          { dateFin: { gte: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.conversation.findMany({
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    }),
    prisma.perimetre.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    })
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Accueil" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Messages de sécurité en haut et en évidence */}
            {messagesSecurite.length > 0 && (
              <div className="mb-6">
                <MessagesSecuriteSection messages={messagesSecurite} />
              </div>
            )}

            {/* Première ligne : Actualités et Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Actualités */}
              <div className="lg:col-span-2 order-1">
                <ActualitesSection actualites={actualites} />
              </div>

              {/* Colonne droite : Chat */}
              <div className="space-y-4 sm:space-y-6 order-2">
                <ChatSection 
                  conversations={conversations}
                  userId={user.id}
                />
                {/* Afficher Messages de sécurité ici aussi s'il n'y en a pas */}
                {messagesSecurite.length === 0 && (
                  <MessagesSecuriteSection messages={messagesSecurite} />
                )}
              </div>
            </div>

            {/* Deuxième ligne : Widgets d'information et Boutons d'accès rapide */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Widget Météo */}
              <div className="lg:col-span-1">
                <WidgetMeteo perimetre={perimetres[0] || null} />
              </div>

              {/* Boutons d'accès rapide */}
              <div className="lg:col-span-3">
                <BoutonsAccesRapide />
              </div>
            </div>

            {/* Tableau de bord sécurisé */}
            <TableauBordAccueil userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
