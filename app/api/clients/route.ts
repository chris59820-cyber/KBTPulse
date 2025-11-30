import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            chantiers: true,
            donneursOrdre: true
          }
        }
      }
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau client
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
      adresse, 
      telephone, 
      email, 
      siret, 
      siren, 
      photoUrl,
      commentaire 
    } = body

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du client est requis' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        nom: nom.trim(),
        adresse: adresse ? adresse.trim() : null,
        telephone: telephone ? telephone.trim() : null,
        email: email ? email.trim() : null,
        siret: siret ? siret.trim() : null,
        siren: siren ? siren.trim() : null,
        photoUrl: photoUrl ? photoUrl.trim() : null,
        commentaire: commentaire ? commentaire.trim() : null,
        actif: true
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client:', error)
    
    // Vérifier si le modèle Client existe dans Prisma
    if (error.message && error.message.includes('undefined') && error.message.includes('create')) {
      return NextResponse.json(
        { 
          error: 'Le modèle Client n\'est pas disponible. Veuillez arrêter le serveur et exécuter: npx prisma generate',
          details: 'Le client Prisma doit être régénéré après l\'ajout du modèle Client dans le schéma.'
        },
        { status: 500 }
      )
    }
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un client avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la création du client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

