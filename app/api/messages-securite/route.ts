import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les messages de sécurité
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const messages = await prisma.messageSecurite.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages securite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages de sécurité' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau message de sécurité
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès (PREPA, CE, RDC, CAFF, ADMIN)
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, contenu, type, imageUrl, perimetreId, actif, dateDebut, dateFin } = body

    if (!titre || !contenu) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      )
    }

    const message = await prisma.messageSecurite.create({
      data: {
        titre,
        contenu,
        type: type || 'info',
        imageUrl: imageUrl || null,
        perimetreId: perimetreId || null,
        actif: actif !== undefined ? actif : true,
        dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
        dateFin: dateFin ? new Date(dateFin) : null
      },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message securite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du message de sécurité' },
      { status: 500 }
    )
  }
}
