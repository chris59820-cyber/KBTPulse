import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// DELETE - Supprimer un élément de l'historique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; histId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const historique = await prisma.historiqueVehicule.findUnique({
      where: { id: params.histId }
    })

    if (!historique || historique.vehiculeId !== params.id) {
      return NextResponse.json(
        { error: 'Élément d\'historique non trouvé' },
        { status: 404 }
      )
    }

    await prisma.historiqueVehicule.delete({
      where: { id: params.histId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting historique:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Élément d\'historique non trouvé' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'historique' },
      { status: 500 }
    )
  }
}

