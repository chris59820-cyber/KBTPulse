import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les donneurs d'ordre
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const actif = searchParams.get('actif')

    const where: any = {}
    if (clientId) {
      where.clientId = clientId
    }
    // Si actif est spécifié, on filtre selon la valeur
    if (actif !== null && actif !== '') {
      where.actif = actif === 'true'
    }
    // Si actif n'est pas spécifié ou est vide, on affiche tous (actifs et inactifs)

    const donneursOrdre = await prisma.donneurOrdre.findMany({
      where,
      orderBy: { nom: 'asc' },
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
    return NextResponse.json(donneursOrdre)
  } catch (error) {
    console.error('Error fetching donneurs ordre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des donneurs d\'ordre' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau donneur d'ordre
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions : PREPA, CE, RDC, CAFF, ADMIN peuvent créer
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
      commentaire 
    } = body

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du donneur d\'ordre est requis' },
        { status: 400 }
      )
    }

    const donneurOrdre = await prisma.donneurOrdre.create({
      data: {
        nom: nom.trim(),
        prenom: prenom ? prenom.trim() : null,
        telephone: telephone ? telephone.trim() : null,
        email: email ? email.trim() : null,
        fonction: fonction ? fonction.trim() : null,
        entreprise: entreprise ? entreprise.trim() : null,
        clientId: clientId || null,
        commentaire: commentaire ? commentaire.trim() : null,
        actif: true
      }
    })

    return NextResponse.json(donneurOrdre, { status: 201 })
  } catch (error: any) {
    console.error('Error creating donneur ordre:', error)
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un donneur d\'ordre avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la création du donneur d\'ordre',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}




