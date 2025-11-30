import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les messages d'une intervention
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a accès à l'intervention
    const intervention = await prisma.intervention.findUnique({
      where: { id: params.id },
      include: {
        affectationsIntervention: {
          where: { actif: true }
        }
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier l'accès
    const hasAccess = 
      ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) ||
      intervention.affectationsIntervention.some(aff => user.salarieId === aff.salarieId) ||
      user.salarieId === intervention.responsableId ||
      user.salarieId === intervention.salarieId

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const messages = await prisma.messageIntervention.findMany({
      where: { interventionId: params.id },
      orderBy: { createdAt: 'asc' }
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

// POST - Créer un message dans une intervention
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { contenu, auteurId } = body

    if (!contenu || !auteurId) {
      return NextResponse.json(
        { error: 'Le contenu et l\'auteur sont requis' },
        { status: 400 }
      )
    }

    // Vérifier l'accès
    const intervention = await prisma.intervention.findUnique({
      where: { id: params.id },
      include: {
        affectationsIntervention: {
          where: { actif: true }
        }
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    const hasAccess = 
      ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) ||
      intervention.affectationsIntervention.some(aff => user.salarieId === aff.salarieId) ||
      user.salarieId === intervention.responsableId ||
      user.salarieId === intervention.salarieId

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const message = await prisma.messageIntervention.create({
      data: {
        interventionId: params.id,
        auteurId,
        contenu
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du message' },
      { status: 500 }
    )
  }
}
