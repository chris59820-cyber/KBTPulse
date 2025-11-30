import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour un contact d'urgence
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.salarieId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nom, prenom, relation, telephone, telephoneSecondaire, email, priorite } = body

    // Vérifier que le contact appartient au salarié
    const contact = await prisma.contactUrgence.findUnique({
      where: { id: params.id }
    })

    if (!contact || contact.salarieId !== user.salarieId) {
      return NextResponse.json(
        { error: 'Contact non trouvé ou accès non autorisé' },
        { status: 404 }
      )
    }

    const updatedContact = await prisma.contactUrgence.update({
      where: { id: params.id },
      data: {
        nom,
        prenom,
        relation: relation || null,
        telephone,
        telephoneSecondaire: telephoneSecondaire || null,
        email: email || null,
        priorite: priorite || 1
      }
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Error updating contact urgence:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un contact d'urgence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.salarieId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que le contact appartient au salarié
    const contact = await prisma.contactUrgence.findUnique({
      where: { id: params.id }
    })

    if (!contact || contact.salarieId !== user.salarieId) {
      return NextResponse.json(
        { error: 'Contact non trouvé ou accès non autorisé' },
        { status: 404 }
      )
    }

    await prisma.contactUrgence.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Contact supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting contact urgence:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    )
  }
}
