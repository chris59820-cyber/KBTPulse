import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un code affaire par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const codeAffaire = await prisma.codeAffaire.findUnique({
      where: { id: params.id },
      include: {
        chantier: true,
        rdc: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true
          }
        }
      }
    })

    if (!codeAffaire) {
      return NextResponse.json(
        { error: 'Code affaire introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(codeAffaire)
  } catch (error) {
    console.error('Error fetching code affaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du code affaire' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un code affaire
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, libelle, description, client, activite, budget, dateDebut, dateFin, chantierId, rdcId, actif, codeContrat } = body

    if (!code || !libelle) {
      return NextResponse.json(
        { error: 'Le code et le libellé sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si le code existe déjà pour un autre code affaire
    const existingCode = await prisma.codeAffaire.findFirst({
      where: {
        code: code.toUpperCase(),
        id: { not: params.id }
      }
    })

    if (existingCode) {
      return NextResponse.json(
        { error: 'Ce code est déjà utilisé par un autre code affaire' },
        { status: 400 }
      )
    }

    const codeAffaire = await prisma.codeAffaire.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        libelle,
        description: description || null,
        client: client || null,
        activite: activite || null,
        budget: budget ? parseFloat(budget) : null,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        chantierId: chantierId || null,
        rdcId: rdcId || null,
        codeContrat: codeContrat !== undefined ? codeContrat : false,
        actif: actif !== undefined ? actif : true
      }
    })

    return NextResponse.json(codeAffaire)
  } catch (error: any) {
    console.error('Error updating code affaire:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Code affaire introuvable' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ce code est déjà utilisé par un autre code affaire' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du code affaire' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un code affaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await prisma.codeAffaire.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting code affaire:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Code affaire introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression du code affaire' },
      { status: 500 }
    )
  }
}

