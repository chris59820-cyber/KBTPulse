import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversationId, contenu } = body

    if (!conversationId || !contenu) {
      return NextResponse.json(
        { error: 'conversationId et contenu sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      p => p.userId === user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas participant à cette conversation' },
        { status: 403 }
      )
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        userId: user.id,
        salarieId: user.salarieId || null,
        contenu
      }
    })

    // Mettre à jour la date de mise à jour de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les messages d'une conversation
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      p => p.userId === user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas participant à cette conversation' },
        { status: 403 }
      )
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}
