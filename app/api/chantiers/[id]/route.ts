import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un chantier par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chantier = await prisma.chantier.findUnique({
      where: { id: params.id },
      include: {
        interventions: true,
        affectations: {
          include: {
            salarie: true
          }
        }
      }
    })

    if (!chantier) {
      return NextResponse.json(
        { error: 'Chantier non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(chantier)
  } catch (error) {
    console.error('Error fetching chantier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du chantier' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un chantier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
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

    // Vérifier que le chantier existe
    const existingChantier = await prisma.chantier.findUnique({
      where: { id: params.id }
    })

    if (!existingChantier) {
      return NextResponse.json(
        { error: 'Chantier non trouvé' },
        { status: 404 }
      )
    }

    // Validation du nom (requis)
    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du chantier est requis' },
        { status: 400 }
      )
    }

    const chantier = await prisma.chantier.update({
      where: { id: params.id },
      data: {
        nom: nom.trim(),
        adresse: adresse ? adresse.trim() : null,
        description: description ? description.trim() : null,
        clientId: clientId || null,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        budget: budget && budget.toString().trim() !== '' ? parseFloat(budget.toString()) : null,
        statut,
        rdcId: rdcId || null,
        codeAffaireId: codeAffaireId || null,
        site: site ? site.trim() : null,
        secteur: secteur ? secteur.trim() : null,
        numeroCommande: numeroCommande ? numeroCommande.trim() : null,
        donneurOrdreId: donneurOrdreId || null
      }
    })

    return NextResponse.json(chantier)
  } catch (error: any) {
    console.error('Error updating chantier:', error)
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un chantier avec ce nom existe déjà' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Chantier non trouvé' },
        { status: 404 }
      )
    }

    // Message d'erreur plus détaillé avec analyse de la cause
    let errorMessage = error.message || 'Erreur lors de la mise à jour du chantier'
    
    // Détecter les erreurs liées au client Prisma non régénéré
    if (error.message && error.message.includes('Unknown argument')) {
      const match = error.message.match(/Unknown argument ['"]([^'"]+)['"]/)
      if (match) {
        const unknownField = match[1]
        errorMessage = `Erreur Prisma : Le champ "${unknownField}" n'est pas reconnu. Cela indique généralement que le client Prisma n'a pas été régénéré après une modification du schéma.\n\nSolution : Arrêtez le serveur de développement, exécutez "npx prisma generate", puis redémarrez le serveur.`
      }
    }
    
    // Détecter les erreurs de champ manquant
    if (error.message && error.message.includes('Unknown field')) {
      const match = error.message.match(/Unknown field ['"]([^'"]+)['"]/)
      if (match) {
        const unknownField = match[1]
        errorMessage = `Erreur Prisma : Le champ "${unknownField}" n'existe pas dans le modèle. Vérifiez que le schéma Prisma a été mis à jour et que le client Prisma a été régénéré avec "npx prisma generate".`
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

// DELETE - Supprimer un chantier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès - Seuls PREPA, CE, CAFF, ADMIN peuvent supprimer
    if (!['PREPA', 'CE', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await prisma.chantier.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Chantier supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting chantier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du chantier' },
      { status: 500 }
    )
  }
}
