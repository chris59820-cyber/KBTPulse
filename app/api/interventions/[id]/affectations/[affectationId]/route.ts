import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour une affectation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, affectationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role, dateDebut, dateFin, actif } = body

    const affectation = await prisma.affectationIntervention.update({
      where: { id: params.affectationId },
      data: {
        ...(role && { role }),
        ...(dateDebut && { dateDebut: new Date(dateDebut) }),
        ...(dateFin !== undefined && { dateFin: dateFin ? new Date(dateFin) : null }),
        ...(actif !== undefined && { actif })
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            photoUrl: true,
            poste: true
          }
        }
      }
    })

    return NextResponse.json(affectation)
  } catch (error) {
    console.error('Error updating affectation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'affectation' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer (désactiver) une affectation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, affectationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Soft delete : marquer comme inactif
    const affectation = await prisma.affectationIntervention.update({
      where: { id: params.affectationId },
      data: {
        actif: false,
        dateFin: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting affectation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'affectation' },
      { status: 500 }
    )
  }
}
