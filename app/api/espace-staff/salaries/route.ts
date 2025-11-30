import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les salariés du périmètre de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer le salarié de l'utilisateur pour obtenir son périmètre
    let perimetreId: string | null = null
    
    if (user.salarieId) {
      const salarie = await prisma.salarie.findUnique({
        where: { id: user.salarieId },
        select: {
          perimetreId: true,
          salariePerimetres: {
            where: { dateFin: null },
            select: { perimetreId: true }
          }
        }
      })
      
      // Utiliser le périmètre direct ou le premier périmètre actif
      perimetreId = salarie?.perimetreId || salarie?.salariePerimetres[0]?.perimetreId || null
    }

    // Récupérer les salariés actifs du périmètre
    const salaries = await prisma.salarie.findMany({
      where: {
        statut: 'actif',
        ...(perimetreId ? {
          OR: [
            { perimetreId },
            {
              salariePerimetres: {
                some: {
                  perimetreId,
                  dateFin: null
                }
              }
            }
          ]
        } : {})
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        poste: true,
        fonction: true
      },
      orderBy: [
        { nom: 'asc' },
        { prenom: 'asc' }
      ]
    })

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des salariés' },
      { status: 500 }
    )
  }
}



