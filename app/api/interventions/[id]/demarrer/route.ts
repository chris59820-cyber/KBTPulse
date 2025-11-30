import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Démarrer une intervention
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
        statut: true,
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

    // Vérifier que l'intervention est planifiée
    if (intervention.statut !== 'planifiee') {
      return NextResponse.json(
        { error: 'Seules les interventions planifiées peuvent être démarrées' },
        { status: 400 }
      )
    }

    const updated = await prisma.intervention.update({
      where: { id: params.id },
      data: {
        statut: 'en_cours',
        dateDebutReelle: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors du démarrage de l\'intervention' },
      { status: 500 }
    )
  }
}




