import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer une actualité spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const actualite = await prisma.actualite.findUnique({
      where: { id: params.id },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    if (!actualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(actualite)
  } catch (error) {
    console.error('Error fetching actualite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'actualité' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une actualité
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { titre, description, contenu, imageUrl, images, perimetreId, publie } = body

    const actualite = await prisma.actualite.update({
      where: { id: params.id },
      data: {
        ...(titre !== undefined && { titre }),
        ...(description !== undefined && { description }),
        ...(contenu !== undefined && { contenu }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images: images ? JSON.stringify(images) : null }),
        ...(perimetreId !== undefined && { perimetreId }),
        ...(publie !== undefined && { publie })
      },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(actualite)
  } catch (error) {
    console.error('Error updating actualite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'actualité' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une actualité
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    await prisma.actualite.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting actualite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'actualité' },
      { status: 500 }
    )
  }
}
