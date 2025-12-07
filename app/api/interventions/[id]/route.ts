import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer une intervention par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: params.id },
      include: {
        chantier: true,
        salarie: true,
        materielUtilise: {
          include: {
            materiel: true
          }
        }
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(intervention)
  } catch (error) {
    console.error('Error fetching intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'intervention' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une intervention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions : PREPA, CE, RDC, CAFF peuvent modifier
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      // Vérifier si l'utilisateur est responsable de l'intervention
      const existingIntervention = await prisma.intervention.findUnique({
        where: { id: params.id },
        select: { responsableId: true }
      })

      if (existingIntervention?.responsableId !== user.salarieId) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }
    }

    const formData = await request.formData()

    // Récupérer tous les champs et convertir les chaînes vides en null
    const getValueOrNull = (value: FormDataEntryValue | null): string | null => {
      if (!value) return null
      const str = value.toString().trim()
      return str === '' ? null : str
    }

    const titre = formData.get('titre') as string
    const description = getValueOrNull(formData.get('description'))
    const dateDebut = getValueOrNull(formData.get('dateDebut'))
    const dateFin = getValueOrNull(formData.get('dateFin'))
    const tempsPrevu = getValueOrNull(formData.get('tempsPrevu'))
    const type = getValueOrNull(formData.get('type'))
    const nature = getValueOrNull(formData.get('nature'))
    const usine = getValueOrNull(formData.get('usine'))
    const secteur = getValueOrNull(formData.get('secteur'))
    const latitude = getValueOrNull(formData.get('latitude'))
    const longitude = getValueOrNull(formData.get('longitude'))
    const responsableId = getValueOrNull(formData.get('responsableId'))
    const rdcId = getValueOrNull(formData.get('rdcId'))
    const codeAffaireId = getValueOrNull(formData.get('codeAffaireId'))
    const donneurOrdreNom = getValueOrNull(formData.get('donneurOrdreNom'))
    const donneurOrdreTelephone = getValueOrNull(formData.get('donneurOrdreTelephone'))
    const donneurOrdreEmail = getValueOrNull(formData.get('donneurOrdreEmail'))
    const retexPositifs = getValueOrNull(formData.get('retexPositifs'))
    const retexNegatifs = getValueOrNull(formData.get('retexNegatifs'))
    const chantierId = formData.get('chantierId') as string

    // Validation des champs requis
    if (!titre || !chantierId) {
      return NextResponse.json(
        { error: 'Le titre et le chantier sont requis' },
        { status: 400 }
      )
    }
    
    // Récupérer l'intervention existante pour préserver les valeurs non modifiées
    const existingIntervention = await prisma.intervention.findUnique({
      where: { id: params.id },
      select: {
        dateDebut: true,
        statut: true
      }
    })

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }
    
    // Vérifier si une nouvelle date de début est fournie (non null)
    const hasNewDateDebut = dateDebut !== null
    
    // Déterminer le statut en fonction de la planification
    let statut = existingIntervention.statut
    if (hasNewDateDebut) {
      // Nouvelle planification fournie
      statut = 'planifiee'
    } else {
      // Planification retirée (dateDebut null)
      statut = 'en_attente'
    }

    // Préparer les données de mise à jour
    // Tous les champs null seront enregistrés comme null dans la base de données
    const updateData: any = {
      titre,
      description: description || null,
      dateFin: dateFin ? new Date(dateFin) : null,
      tempsPrevu: tempsPrevu ? parseFloat(tempsPrevu) : null,
      type: type || null,
      nature: nature || null,
      usine: usine || null,
      secteur: secteur || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      responsableId: responsableId || null,
      rdcId: rdcId || null,
      codeAffaireId: codeAffaireId || null,
      donneurOrdreNom: donneurOrdreNom || null,
      donneurOrdreTelephone: donneurOrdreTelephone || null,
      donneurOrdreEmail: donneurOrdreEmail || null,
      retexPositifs: retexPositifs || null,
      retexNegatifs: retexNegatifs || null,
      chantierId,
      statut,
      // Toujours mettre à jour dateDebut, même si null
      dateDebut: hasNewDateDebut ? new Date(dateDebut!) : null
    }

    // Log pour déboguer
    console.log('Update data:', JSON.stringify(updateData, null, 2))

    // Mettre à jour l'intervention dans une transaction
    const intervention = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'intervention
      const updatedIntervention = await tx.intervention.update({
        where: { id: params.id },
        data: updateData
      })

      // Traiter les affectations si fournies
      const affectationsJson = formData.get('affectations') as string
      if (affectationsJson) {
        try {
          const affectations: Array<{ salarieId: string; role: string }> = JSON.parse(affectationsJson)
          
          // Utiliser les dates de l'intervention mise à jour
          const dateDebutAffectation = updatedIntervention.dateDebut || new Date()
          const dateFinAffectation = updatedIntervention.dateFin
          
          // Récupérer les affectations existantes
          const existingAffectations = await tx.affectationIntervention.findMany({
            where: { interventionId: params.id }
          })

          // Identifier les affectations à supprimer (celles qui ne sont plus dans la nouvelle liste)
          const newSalarieIds = new Set(affectations.map(aff => aff.salarieId).filter(id => id))
          const toDelete = existingAffectations.filter(existing => !newSalarieIds.has(existing.salarieId))

          // Supprimer les affectations qui ne sont plus dans la liste
          for (const affToDelete of toDelete) {
            await tx.affectationIntervention.update({
              where: { id: affToDelete.id },
              data: { actif: false }
            })
          }

          // Mettre à jour ou créer les affectations
          for (const aff of affectations) {
            if (!aff.salarieId) continue

            // Chercher une affectation existante pour ce salarié
            const existingAffectation = await tx.affectationIntervention.findFirst({
              where: {
                interventionId: params.id,
                salarieId: aff.salarieId
              }
            })

            if (existingAffectation) {
              // Mettre à jour l'affectation existante
              await tx.affectationIntervention.update({
                where: { id: existingAffectation.id },
                data: {
                  role: aff.role as any,
                  dateDebut: dateDebutAffectation instanceof Date ? dateDebutAffectation : new Date(dateDebutAffectation),
                  dateFin: dateFinAffectation ? (dateFinAffectation instanceof Date ? dateFinAffectation : new Date(dateFinAffectation)) : null,
                  actif: true
                }
              })
            } else {
              // Créer une nouvelle affectation
              await tx.affectationIntervention.create({
                data: {
                  interventionId: params.id,
                  salarieId: aff.salarieId,
                  role: aff.role as any,
                  dateDebut: dateDebutAffectation instanceof Date ? dateDebutAffectation : new Date(dateDebutAffectation),
                  dateFin: dateFinAffectation ? (dateFinAffectation instanceof Date ? dateFinAffectation : new Date(dateFinAffectation)) : null
                }
              })
            }
          }
        } catch (e) {
          console.error('Erreur lors de la mise à jour des affectations:', e)
          // Ne pas faire échouer la transaction si les affectations échouent
        }
      }

      return updatedIntervention
    })

    return NextResponse.json(intervention)
  } catch (error: any) {
    console.error('Error updating intervention:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'intervention' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une intervention
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
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

    await prisma.intervention.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Intervention supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'intervention' },
      { status: 500 }
    )
  }
}
