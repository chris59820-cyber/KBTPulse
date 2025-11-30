import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await deleteSession()
    return NextResponse.json({ message: 'Déconnexion réussie' })
  } catch (error) {
    console.error('Error in deconnexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    )
  }
}
