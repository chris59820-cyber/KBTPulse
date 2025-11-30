import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// GET - Export Excel des données CAFF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateDebut = searchParams.get('dateDebut')
    const dateFin = searchParams.get('dateFin')

    // TODO: Générer le fichier Excel avec les données
    // Pour l'instant, on retourne une réponse indiquant que l'export sera implémenté
    
    return NextResponse.json({
      message: 'Export Excel en cours de développement',
      dateDebut,
      dateFin
    })
  } catch (error) {
    console.error('Error exporting Excel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export Excel' },
      { status: 500 }
    )
  }
}
