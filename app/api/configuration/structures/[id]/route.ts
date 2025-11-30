import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer une structure par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['ADMIN', 'CAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const structure = await prisma.structureOrganisationnelle.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        enfants: {
          where: { actif: true }
        }
      }
    })

    if (!structure) {
      return NextResponse.json(
        { error: 'Structure non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error('Error fetching structure:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la structure' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une structure
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['ADMIN', 'CAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      nom,
      code,
      description,
      numeroPDP,
      ordre
    } = body

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      )
    }

    const structure = await prisma.structureOrganisationnelle.update({
      where: { id: params.id },
      data: {
        nom,
        code: code || null,
        description: description || null,
        numeroPDP: numeroPDP || null,
        ordre: ordre ? parseInt(ordre) : null
      }
    })

    return NextResponse.json(structure)
  } catch (error: any) {
    console.error('Error updating structure:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Structure non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de la structure' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une structure (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['ADMIN', 'CAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier si la structure a des enfants
    const structure = await prisma.structureOrganisationnelle.findUnique({
      where: { id: params.id },
      include: {
        enfants: {
          where: { actif: true }
        }
      }
    })

    if (!structure) {
      return NextResponse.json(
        { error: 'Structure non trouvée' },
        { status: 404 }
      )
    }

    if (structure.enfants && structure.enfants.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une structure qui contient des sous-structures. Veuillez d\'abord supprimer les sous-structures.' },
        { status: 400 }
      )
    }

    // Soft delete
    await prisma.structureOrganisationnelle.update({
      where: { id: params.id },
      data: { actif: false }
    })

    return NextResponse.json({ message: 'Structure supprimée avec succès' })
  } catch (error: any) {
    console.error('Error deleting structure:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Structure non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la structure' },
      { status: 500 }
    )
  }
}

