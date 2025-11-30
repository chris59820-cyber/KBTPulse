import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les chantiers
export async function GET() {
  try {
    const chantiers = await prisma.chantier.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(chantiers)
  } catch (error) {
    console.error('Error fetching chantiers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chantiers' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau chantier
export async function POST(request: NextRequest) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
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
      description, 
      clientId, 
      dateDebut, 
      dateFin, 
      budget, 
      statut,
      rdcId,
      codeAffaireId,
      site,
      secteur,
      numeroCommande,
      donneurOrdreId
    } = body

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du chantier est requis' },
        { status: 400 }
      )
    }

    const chantier = await prisma.chantier.create({
      data: {
        nom: nom.trim(),
        adresse: adresse ? adresse.trim() : null,
        description: description ? description.trim() : null,
        clientId: clientId || null,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        budget: budget && budget.toString().trim() !== '' ? parseFloat(budget.toString()) : null,
        statut: statut || 'planifie',
        rdcId: rdcId || null,
        codeAffaireId: codeAffaireId || null,
        site: site ? site.trim() : null,
        secteur: secteur ? secteur.trim() : null,
        numeroCommande: numeroCommande ? numeroCommande.trim() : null,
        donneurOrdreId: donneurOrdreId || null
      }
    })

    return NextResponse.json(chantier, { status: 201 })
  } catch (error: any) {
    console.error('Error creating chantier:', error)
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un chantier avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Message d'erreur plus détaillé
    let errorMessage = error.message || 'Erreur lors de la création du chantier'
    
    // Détecter les erreurs liées au client Prisma non régénéré
    if (error.message && error.message.includes('Unknown argument')) {
      const match = error.message.match(/Unknown argument ['"]([^'"]+)['"]/)
      if (match) {
        const unknownField = match[1]
        errorMessage = `Erreur Prisma : Le champ "${unknownField}" n'est pas reconnu. Cela indique généralement que le client Prisma n'a pas été régénéré après une modification du schéma.\n\nSolution : Arrêtez le serveur de développement, exécutez "npx prisma generate", puis redémarrez le serveur.`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
