import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un site par ID
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

    const usine = await prisma.usine.findUnique({
      where: { id: params.id },
      include: {
        perimetre: true,
        structures: {
          where: { parentId: null, actif: true },
          include: {
            enfants: {
              where: { actif: true },
              include: {
                enfants: {
                  where: { actif: true }
                }
              }
            }
          }
        }
      }
    })

    if (!usine) {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(usine)
  } catch (error) {
    console.error('Error fetching usine:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du site' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un site
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
      secteurActivite,
      adresse,
      perimetreId,
      numeroUrgence,
      latitudePoste,
      longitudePoste,
      latitudeRassemblement,
      longitudeRassemblement
    } = body

    if (!nom || !adresse || !perimetreId) {
      return NextResponse.json(
        { error: 'Le nom, l\'adresse et le périmètre sont requis' },
        { status: 400 }
      )
    }

    const usine = await prisma.usine.update({
      where: { id: params.id },
      data: {
        nom,
        secteurActivite: secteurActivite || null,
        adresse,
        perimetreId,
        numeroUrgence: numeroUrgence || null,
        latitudePoste: latitudePoste ? parseFloat(latitudePoste) : null,
        longitudePoste: longitudePoste ? parseFloat(longitudePoste) : null,
        latitudeRassemblement: latitudeRassemblement ? parseFloat(latitudeRassemblement) : null,
        longitudeRassemblement: longitudeRassemblement ? parseFloat(longitudeRassemblement) : null
      }
    })

    return NextResponse.json(usine)
  } catch (error: any) {
    console.error('Error updating usine:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un site avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du site' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un site
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

    await prisma.usine.delete({
      where: { id: params.id }
    })

      return NextResponse.json({ message: 'Site supprimé avec succès' })
  } catch (error: any) {
    console.error('Error deleting usine:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression du site' },
      { status: 500 }
    )
  }
}

