export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
// Assurez-vous que cette fonction existe bien dans votre middleware, sinon utilisez requireAuth
import { getCurrentUser } from '@/lib/auth' 
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Composants
import ActualitesSection from '@/components/accueil/ActualitesSection'
import ChatSection from '@/components/accueil/ChatSection'
import MessagesSecuriteSection from '@/components/accueil/MessagesSecuriteSection'
import WidgetMeteo from '@/components/accueil/WidgetMeteo'
import BoutonsAccesRapide from '@/components/accueil/BoutonsAccesRapide'
import TableauBordAccueil from '@/components/accueil/TableauBordAccueil'

export default async function AccueilPage() {
  const user = await getCurrentUser()
  
  // 1. Vérification Auth
  if (!user) {
    redirect('/connexion')
  }

  const allowedRoles = ['PREPA', 'RDC', 'CAFF', 'AUTRE', 'OUVRIER', 'ADMIN']
  if (!allowedRoles.includes(user.role)) {
    redirect('/acces-refuse')
  }

  // 2. DIAGNOSTIC : Ceci affichera dans vos logs serveur quel modèle pose problème.
  // Si l'application plante, regardez les logs Render pour voir lequel est "undefined".
  console.log('--- DIAGNOSTIC PRISMA ---');
  console.log('Model Actualite:', !!prisma.actualite ? 'OK' : 'MANQUANT (Vérifiez le schema)');
  console.log('Model MessageSecurite:', !!prisma.messageSecurite ? 'OK' : 'MANQUANT (Vérifiez le schema)');
  console.log('Model Conversation:', !!prisma.conversation ? 'OK' : 'MANQUANT (Vérifiez le schema)');
  console.log('-------------------------');

  // 3. Chargement des données
  // Note : Si vous avez une erreur ici, c'est que le nom (ex: prisma.actualite) 
  // ne correspond pas exactement à votre fichier schema.prisma
  const [actualites, messagesSecurite, conversations, perimetres] = await Promise.all([
    
    // Vérifiez si c'est 'actualite' ou 'actualites' dans votre schema
    prisma.actualite.findMany({ 
      where: { publie: true },
      orderBy: { datePublication: 'desc' },
      take: 10,
      include: {
        perimetre: {
          select: { id: true, nom: true }
        }
      }
    }),

    // Vérifiez si c'est 'messageSecurite' ou 'MessageSecurite' ou 'message_securite'
    prisma.messageSecurite.findMany({
      where: { 
        actif: true,
        dateDebut: { lte: new Date() }, // Le message doit avoir commencé
        OR: [
          { dateFin: null },
          { dateFin: { gte: new Date() } } // Le message n'est pas encore expiré
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
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
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Messages de sécurité */}
            {messagesSecurite.length > 0 && (
              <div className="mb-6">
                <MessagesSecuriteSection messages={messagesSecurite} />
              </div>
            )}

            {/* Grille Principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Actualités */}
              <div className="lg:col-span-2">
                <ActualitesSection actualites={actualites} />
              </div>

              {/* Chat */}
              <div className="space-y-6">
                <ChatSection 
                  conversations={conversations}
                  userId={user.id}
                />
                {/* Fallback si pas de messages prioritaires */}
                {messagesSecurite.length === 0 && (
                  <MessagesSecuriteSection messages={messagesSecurite} />
                )}
              </div>
            </div>

            {/* Widgets & Accès Rapide */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-1">
                <WidgetMeteo perimetre={perimetres[0] || null} />
              </div>
              <div className="lg:col-span-3">
                <BoutonsAccesRapide />
              </div>
            </div>

            {/* Tableau de bord */}
            <TableauBordAccueil userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}