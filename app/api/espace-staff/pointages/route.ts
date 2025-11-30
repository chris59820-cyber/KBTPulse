import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les pointages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const where: any = {}
    
    if (date) {
      const dateObj = new Date(date)
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const pointages = await prisma.pointage.findMany({
      where,
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true
          }
        },
        perimetre: {
          select: {
            nom: true,
            adresse: true
          }
        },
        codeAffaire: {
          select: {
            code: true,
            libelle: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(pointages)
  } catch (error) {
    console.error('Error fetching pointages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pointages' },
      { status: 500 }
    )
  }
}
