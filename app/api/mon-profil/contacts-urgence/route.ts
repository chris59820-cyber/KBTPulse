import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Créer un contact d'urgence
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.salarieId) {
      return NextResponse.json(
        { error: 'Non authentifié ou aucun salarié associé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { salarieId, nom, prenom, relation, telephone, telephoneSecondaire, email, priorite } = body

    if (!nom || !prenom || !telephone) {
      return NextResponse.json(
        { error: 'Le nom, prénom et téléphone sont requis' },
        { status: 400 }
      )
    }

    if (salarieId !== user.salarieId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const contact = await prisma.contactUrgence.create({
      data: {
        salarieId,
        nom,
        prenom,
        relation: relation || null,
        telephone,
        telephoneSecondaire: telephoneSecondaire || null,
        email: email || null,
        priorite: priorite || 1
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact urgence:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du contact' },
      { status: 500 }
    )
  }
}
