import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un matériel par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materiel = await prisma.materiel.findUnique({
      where: { id: params.id },
      include: {
        utilisations: {
          include: {
            intervention: {
              include: {
                chantier: true
              }
            }
          }
        }
      }
    })

    if (!materiel) {
      return NextResponse.json(
        { error: 'Matériel non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(materiel)
  } catch (error) {
    console.error('Error fetching materiel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du matériel' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un matériel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nom, description, categorie, quantite, unite, prixUnitaire, statut } = body

    const materiel = await prisma.materiel.update({
      where: { id: params.id },
      data: {
        nom,
        description,
        categorie,
        quantite: quantite ? parseInt(quantite) : undefined,
        unite,
        prixUnitaire: prixUnitaire ? parseFloat(prixUnitaire) : null,
        statut
      }
    })

    return NextResponse.json(materiel)
  } catch (error) {
    console.error('Error updating materiel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du matériel' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un matériel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.materiel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Matériel supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting materiel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du matériel' },
      { status: 500 }
    )
  }
}
