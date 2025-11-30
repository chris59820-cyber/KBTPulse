import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un donneur d'ordre par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donneurOrdre = await prisma.donneurOrdre.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            nom: true
          }
        },
        _count: {
          select: {
            chantiers: true,
            interventions: true
          }
        }
      }
    })

    if (!donneurOrdre) {
      return NextResponse.json(
        { error: 'Donneur d\'ordre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(donneurOrdre)
  } catch (error) {
    console.error('Error fetching donneur ordre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du donneur d\'ordre' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un donneur d'ordre
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
      prenom, 
      telephone, 
      email, 
      fonction, 
      entreprise, 
      clientId, 
      commentaire,
      actif
    } = body

    // Vérifier que le donneur d'ordre existe
    const existingDonneurOrdre = await prisma.donneurOrdre.findUnique({
      where: { id: params.id }
    })

    if (!existingDonneurOrdre) {
      return NextResponse.json(
        { error: 'Donneur d\'ordre non trouvé' },
        { status: 404 }
      )
    }

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du donneur d\'ordre est requis' },
        { status: 400 }
      )
    }

    const donneurOrdre = await prisma.donneurOrdre.update({
      where: { id: params.id },
      data: {
        nom: nom.trim(),
        prenom: prenom ? prenom.trim() : null,
        telephone: telephone ? telephone.trim() : null,
        email: email ? email.trim() : null,
        fonction: fonction ? fonction.trim() : null,
        entreprise: entreprise ? entreprise.trim() : null,
        clientId: clientId || null,
        commentaire: commentaire ? commentaire.trim() : null,
        actif: actif !== undefined ? actif : existingDonneurOrdre.actif
      }
    })

    return NextResponse.json(donneurOrdre)
  } catch (error: any) {
    console.error('Error updating donneur ordre:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un donneur d\'ordre avec ce nom existe déjà' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Donneur d\'ordre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la mise à jour du donneur d\'ordre',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un donneur d'ordre (désactivation)
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

    // Désactiver le donneur d'ordre au lieu de le supprimer
    const donneurOrdre = await prisma.donneurOrdre.update({
      where: { id: params.id },
      data: { actif: false }
    })

    return NextResponse.json({ message: 'Donneur d\'ordre désactivé avec succès' })
  } catch (error) {
    console.error('Error deleting donneur ordre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du donneur d\'ordre' },
      { status: 500 }
    )
  }
}




