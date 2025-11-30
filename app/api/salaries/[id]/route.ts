import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un salarié par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salarie = await prisma.salarie.findUnique({
      where: { id: params.id },
      include: {
        interventions: {
          include: {
            chantier: true
          }
        },
        affectations: {
          include: {
            chantier: true
          }
        }
      }
    })

    if (!salarie) {
      return NextResponse.json(
        { error: 'Salarié non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(salarie)
  } catch (error) {
    console.error('Error fetching salarie:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du salarié' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un salarié
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nom, prenom, email, telephone, poste, dateEmbauche, statut } = body

    const salarie = await prisma.salarie.update({
      where: { id: params.id },
      data: {
        nom,
        prenom,
        email,
        telephone,
        poste,
        dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : undefined,
        statut
      }
    })

    return NextResponse.json(salarie)
  } catch (error: any) {
    console.error('Error updating salarie:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du salarié' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un salarié
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.salarie.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Salarié supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting salarie:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du salarié' },
      { status: 500 }
    )
  }
}
