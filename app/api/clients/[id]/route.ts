import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un client par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            chantiers: true,
            donneursOrdre: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du client' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      nom, 
      adresse, 
      telephone, 
      email, 
      siret, 
      siren, 
      photoUrl,
      commentaire,
      actif
    } = body

    // Vérifier que le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du client est requis' },
        { status: 400 }
      )
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        nom: nom.trim(),
        adresse: adresse ? adresse.trim() : null,
        telephone: telephone ? telephone.trim() : null,
        email: email ? email.trim() : null,
        siret: siret ? siret.trim() : null,
        siren: siren ? siren.trim() : null,
        photoUrl: photoUrl ? photoUrl.trim() : null,
        commentaire: commentaire ? commentaire.trim() : null,
        actif: actif !== undefined ? actif : existingClient.actif
      }
    })

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Error updating client:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un client avec ce nom existe déjà' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la mise à jour du client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un client (désactivation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions - Seuls PREPA, CE, CAFF, ADMIN peuvent supprimer
    if (!['PREPA', 'CE', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Désactiver le client au lieu de le supprimer
    const client = await prisma.client.update({
      where: { id: params.id },
      data: { actif: false }
    })

    return NextResponse.json({ message: 'Client désactivé avec succès' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    )
  }
}

