import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Créer une check-list pour une intervention
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

    // Vérifier les permissions
    const intervention = await prisma.intervention.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        responsableId: true,
        rdcId: true
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions : PREPA, CE, RDC, CAFF, ADMIN ou responsable
    const canAccess = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) ||
                      intervention.responsableId === user.salarieId ||
                      intervention.rdcId === user.salarieId

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier si une check-list existe déjà
    const existingChecklist = await prisma.checklistSecurite.findUnique({
      where: { interventionId: params.id }
    })

    if (existingChecklist) {
      return NextResponse.json(
        { error: 'Une check-list existe déjà pour cette intervention' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { elements } = body

    if (!elements) {
      return NextResponse.json(
        { error: 'Les éléments de la check-list sont requis' },
        { status: 400 }
      )
    }

    const checklist = await prisma.checklistSecurite.create({
      data: {
        interventionId: params.id,
        elements: typeof elements === 'string' ? elements : JSON.stringify(elements)
      }
    })

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Erreur lors de la création de la check-list:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la check-list' },
      { status: 500 }
    )
  }
}




