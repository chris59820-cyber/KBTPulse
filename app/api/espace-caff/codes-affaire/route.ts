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

    // Transformer les données pour correspondre à l'interface attendue
    const codesAffaireFormatted = codesAffaire.map((code) => ({
      ...code,
      libelle: code.description, // Mapper description vers libelle pour compatibilité
      client: code.client?.nom || null
    }))

    return NextResponse.json(codesAffaireFormatted)
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
    const { code, libelle, description, client, activite, rdcId, codeContrat } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Le code est requis' },
        { status: 400 }
      )
    }

    // Trouver le client par nom si fourni
    let clientId = null
    if (client) {
      const clientFound = await prisma.client.findFirst({
        where: { nom: { contains: client, mode: 'insensitive' } }
      })
      if (clientFound) {
        clientId = clientFound.id
      }
    }

    const codeAffaire = await prisma.codeAffaire.create({
      data: {
        code: code.toUpperCase(),
        description: description || libelle || null,
        clientId: clientId,
        activite: activite || null,
        rdcId: rdcId || null,
        codeContrat: codeContrat === true,
        actif: true
      },
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
            prenom: true
          }
        }
      }
    })

    // Formater la réponse pour correspondre à l'interface
    const codeAffaireFormatted = {
      ...codeAffaire,
      libelle: codeAffaire.description,
      client: codeAffaire.client?.nom || null
    }

    return NextResponse.json(codeAffaireFormatted, { status: 201 })
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
