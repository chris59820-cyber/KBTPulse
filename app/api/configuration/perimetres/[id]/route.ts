import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un périmètre par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const perimetre = await prisma.perimetre.findUnique({
      where: { id: params.id }
    })

    if (!perimetre) {
      return NextResponse.json(
        { error: 'Périmètre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(perimetre)
  } catch (error) {
    console.error('Error fetching perimetre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du périmètre' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un périmètre
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nom, adresse, ville, codePostal, latitude, longitude, description } = body

    const perimetre = await prisma.perimetre.update({
      where: { id: params.id },
      data: {
        nom,
        adresse,
        ville: ville || null,
        codePostal: codePostal || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || null,
      }
    })

    return NextResponse.json(perimetre)
  } catch (error) {
    console.error('Error updating perimetre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du périmètre' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un périmètre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await prisma.perimetre.update({
      where: { id: params.id },
      data: { actif: false }
    })

    return NextResponse.json({ message: 'Périmètre supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting perimetre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du périmètre' },
      { status: 500 }
    )
  }
}
