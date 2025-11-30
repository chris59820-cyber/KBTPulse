import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer une formation par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const formation = await prisma.formationSalarie.findUnique({
      where: { id: params.id },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Error fetching formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une formation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { salarieId, nom, organisme, dateFormation, dateExpiration, duree, fichierUrl } = body

    if (!salarieId || !nom || !dateFormation) {
      return NextResponse.json(
        { error: 'Le salarié, le nom et la date de formation sont requis' },
        { status: 400 }
      )
    }

    const formation = await prisma.formationSalarie.update({
      where: { id: params.id },
      data: {
        salarieId,
        nom,
        organisme: organisme || null,
        dateFormation: new Date(dateFormation),
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
        duree: duree ? parseFloat(duree) : null,
        fichierUrl: fichierUrl || null
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Error updating formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la formation' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une formation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await prisma.formationSalarie.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Formation supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    )
  }
}



