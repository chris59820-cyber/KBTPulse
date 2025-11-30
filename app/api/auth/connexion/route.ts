import { NextRequest, NextResponse } from 'next/server'
import { authenticate, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifiant, motDePasse } = body

    if (!identifiant || !motDePasse) {
      return NextResponse.json(
        { error: 'Identifiant et mot de passe sont requis' },
        { status: 400 }
      )
    }

    const user = await authenticate(identifiant, motDePasse)

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer la session
    await createSession(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        identifiant: user.identifiant,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Error in connexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}
