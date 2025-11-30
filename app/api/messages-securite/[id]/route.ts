import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un message de sécurité spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const message = await prisma.messageSecurite.findUnique({
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

    if (!message) {
      return NextResponse.json(
        { error: 'Message de sécurité non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error fetching message securite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du message de sécurité' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un message de sécurité
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
    const { titre, contenu, type, imageUrl, perimetreId, actif, dateDebut, dateFin } = body

    // Vérifier que le message existe
    const existingMessage = await prisma.messageSecurite.findUnique({
      where: { id: params.id }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message de sécurité non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    
    if (titre !== undefined) updateData.titre = titre
    if (contenu !== undefined) updateData.contenu = contenu
    if (type !== undefined) updateData.type = type
    if (imageUrl !== undefined) {
      // Convertir les chaînes vides en null
      updateData.imageUrl = imageUrl && imageUrl.trim() !== '' ? imageUrl : null
    }
    if (perimetreId !== undefined) {
      updateData.perimetreId = perimetreId && perimetreId !== '' ? perimetreId : null
    }
    if (actif !== undefined) updateData.actif = actif
    if (dateDebut !== undefined) {
      updateData.dateDebut = dateDebut ? new Date(dateDebut) : new Date()
    }
    if (dateFin !== undefined) {
      updateData.dateFin = dateFin && dateFin !== '' ? new Date(dateFin) : null
    }

    const message = await prisma.messageSecurite.update({
      where: { id: params.id },
      data: updateData,
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error: any) {
    console.error('Error updating message securite:', error)
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Message de sécurité non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du message de sécurité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un message de sécurité
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

    await prisma.messageSecurite.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message securite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message de sécurité' },
      { status: 500 }
    )
  }
}
