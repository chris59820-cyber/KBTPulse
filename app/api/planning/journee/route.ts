import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les congés, formations et absences pour une date
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

    if (!date) {
      return NextResponse.json(
        { error: 'La date est requise' },
        { status: 400 }
      )
    }

    // Parser la date (format YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number)
    
    // Créer les dates de début et fin de journée
    // Utiliser l'heure locale pour éviter les problèmes de conversion UTC
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    
    // Fonction helper pour extraire uniquement la partie date (YYYY-MM-DD) d'un objet Date
    // en utilisant l'heure locale pour éviter les décalages de fuseau horaire
    const getDateOnly = (dateValue: Date | string): string => {
      let d: Date
      if (typeof dateValue === 'string') {
        // Si c'est une string ISO, extraire la partie date et créer une date locale
        const datePart = dateValue.split('T')[0]
        const [y, m, d_val] = datePart.split('-').map(Number)
        d = new Date(y, m - 1, d_val)
      } else {
        // Si c'est un objet Date, l'utiliser directement
        // Les dates de Prisma sont des objets Date JavaScript
        d = dateValue
      }
      // Utiliser les méthodes locales (pas UTC) pour respecter le fuseau horaire du serveur
      // Cela garantit que la date affichée correspond à la date réelle, pas à la date UTC
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    // Récupérer TOUS les congés validés (sans filtre de date pour éviter les problèmes de fuseau horaire)
    const allConges = await prisma.conge.findMany({
      where: {
        statut: 'valide'
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            poste: true
          }
        }
      }
    })

    // Filtrer les congés en comparant uniquement les dates (sans l'heure)
    const selectedDateStr = date
    const congesFiltered = allConges.filter(conge => {
      // Convertir les dates en format YYYY-MM-DD en utilisant l'heure locale
      const dateDebutStr = getDateOnly(conge.dateDebut)
      const dateFinStr = getDateOnly(conge.dateFin)
      
      // Vérifier si la date sélectionnée est dans la plage [dateDebut, dateFin]
      const isInRange = selectedDateStr >= dateDebutStr && selectedDateStr <= dateFinStr
      
      // Log détaillé pour déboguer
      if (conge.salarie.prenom === 'Alexis' && conge.salarie.nom === 'Declemy') {
        const dateDebutObj = new Date(conge.dateDebut)
        const dateFinObj = new Date(conge.dateFin)
        console.log('=== Congé Alexis - Debug détaillé ===')
        console.log('Date recherchée:', selectedDateStr)
        console.log('dateDebut (raw):', conge.dateDebut)
        console.log('dateDebut (Date object):', dateDebutObj.toString())
        console.log('dateDebut (ISO):', dateDebutObj.toISOString())
        console.log('dateDebut (local):', dateDebutObj.toLocaleString('fr-FR'))
        console.log('dateDebut (YYYY-MM-DD):', dateDebutStr)
        console.log('dateFin (raw):', conge.dateFin)
        console.log('dateFin (Date object):', dateFinObj.toString())
        console.log('dateFin (ISO):', dateFinObj.toISOString())
        console.log('dateFin (local):', dateFinObj.toLocaleString('fr-FR'))
        console.log('dateFin (YYYY-MM-DD):', dateFinStr)
        console.log('isInRange:', isInRange)
        console.log('Type:', conge.type)
        console.log('Statut:', conge.statut)
        console.log('=====================================')
      }
      
      return isInRange
    })

    // Récupérer les formations pour cette date
    const formations = await prisma.formationSalarie.findMany({
      where: {
        dateFormation: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            poste: true
          }
        }
      }
    })

    // Récupérer les salariés absents (statut = 'congé' ou 'inactif')
    const salariesAbsents = await prisma.salarie.findMany({
      where: {
        statut: { in: ['congé', 'inactif'] }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        poste: true,
        statut: true
      }
    })

    return NextResponse.json({
      conges: congesFiltered,
      formations,
      salariesAbsents
    })
  } catch (error) {
    console.error('Error fetching day data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de la journée' },
      { status: 500 }
    )
  }
}

