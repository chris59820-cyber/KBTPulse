import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Marquer la check-list comme complétée
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
        rdcId: true,
        checklistSecurite: true
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    if (!intervention.checklistSecurite) {
      return NextResponse.json(
        { error: 'La check-list n\'existe pas encore' },
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

    const body = await request.json()
    const { completee } = body

    const updated = await prisma.checklistSecurite.update({
      where: { interventionId: params.id },
      data: {
        completee: completee !== undefined ? completee : true,
        completeePar: user.salarieId || user.id,
        dateCompletion: completee !== false ? new Date() : null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la check-list:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la check-list' },
      { status: 500 }
    )
  }
}




