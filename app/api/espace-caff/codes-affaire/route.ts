import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les codes affaire
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const codesAffaire = await prisma.codeAffaire.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true
          }
        },
        rdc: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    return NextResponse.json(codesAffaire)
  } catch (error) {
    console.error('Error fetching codes affaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des codes affaire' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau code affaire
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, description, clientId, rdcId, codeContrat } = body

    if (!code || !description) {
      return NextResponse.json(
        { error: 'Le code et la description sont requis' },
        { status: 400 }
      )
    }

    const codeAffaire = await prisma.codeAffaire.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        clientId: clientId || null,
        rdcId: rdcId || null,
        codeContrat: codeContrat === true,
        actif: true
      }
    })

    return NextResponse.json(codeAffaire, { status: 201 })
  } catch (error: any) {
    console.error('Error creating code affaire:', error)
    
    // Gestion des erreurs spécifiques Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ce code est déjà utilisé par un autre code affaire' },
        { status: 400 }
      )
    }

    // Retourner le message d'erreur détaillé en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Erreur lors de la création du code affaire'
      : 'Erreur lors de la création du code affaire'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
