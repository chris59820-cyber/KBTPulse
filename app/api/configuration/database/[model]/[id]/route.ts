import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    model: string
    id: string
  }>
}

// GET - Récupérer un enregistrement spécifique
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { model, id } = await params
    
    // Mapping des noms d'URL vers les noms de modèles Prisma
    const modelMapping: Record<string, string> = {
      'user': 'User', 'salarie': 'Salarie', 'competence': 'Competence',
      'habilitation': 'Habilitation', 'autorisation': 'Autorisation',
      'visitemedicale': 'VisiteMedicale', 'restrictionmedicale': 'RestrictionMedicale',
      'publication': 'Publication', 'actualite': 'Actualite',
      'messagesecurite': 'MessageSecurite', 'conversation': 'Conversation',
      'participantconversation': 'ParticipantConversation', 'message': 'Message',
      'conge': 'Conge', 'contacturgence': 'ContactUrgence',
      'materielfourni': 'MaterielFourni', 'enginconfie': 'EnginConfie',
      'materielattribue': 'MaterielAttribue', 'documentpersonnel': 'DocumentPersonnel',
      'formationsalarie': 'FormationSalarie', 'accesiteclient': 'AccesSiteClient',
      'client': 'Client', 'intervention': 'Intervention', 'materiel': 'Materiel',
      'materielutilise': 'MaterielUtilise', 'documentintervention': 'DocumentIntervention',
      'affectationintervention': 'AffectationIntervention', 'ressourceintervention': 'RessourceIntervention',
      'photointervention': 'PhotoIntervention', 'autocontrole': 'AutoControle',
      'messageintervention': 'MessageIntervention', 'checklistsecurite': 'ChecklistSecurite',
      'affectationplanning': 'AffectationPlanning', 'perimetre': 'Perimetre',
      'salarieperimetre': 'SalariePerimetre', 'chantier': 'Chantier',
      'donneurordre': 'DonneurOrdre', 'codeaffaire': 'CodeAffaire',
      'vehicule': 'Vehicule', 'affectationvehicule': 'AffectationVehicule',
      'pointage': 'Pointage', 'horaire': 'Horaire', 'evaluation': 'Evaluation',
      'evenementrh': 'EvenementRH', 'affectationpersonnel': 'AffectationPersonnel',
      'usine': 'Usine', 'structureorganisationnelle': 'StructureOrganisationnelle'
    }

    const modelNameLower = model.toLowerCase()
    const modelName = modelMapping[modelNameLower]

    if (!modelName) {
      return NextResponse.json(
        { error: `Modèle ${model} non trouvé` },
        { status: 404 }
      )
    }

    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1)

    const data = await (prisma as any)[prismaModelName].findUnique({
      where: { id }
    })

    if (!data) {
      return NextResponse.json(
        { error: 'Enregistrement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching database record:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un enregistrement
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { model, id } = await params
    
    const modelMapping: Record<string, string> = {
      'user': 'User', 'salarie': 'Salarie', 'competence': 'Competence',
      'habilitation': 'Habilitation', 'autorisation': 'Autorisation',
      'visitemedicale': 'VisiteMedicale', 'restrictionmedicale': 'RestrictionMedicale',
      'publication': 'Publication', 'actualite': 'Actualite',
      'messagesecurite': 'MessageSecurite', 'conversation': 'Conversation',
      'participantconversation': 'ParticipantConversation', 'message': 'Message',
      'conge': 'Conge', 'contacturgence': 'ContactUrgence',
      'materielfourni': 'MaterielFourni', 'enginconfie': 'EnginConfie',
      'materielattribue': 'MaterielAttribue', 'documentpersonnel': 'DocumentPersonnel',
      'formationsalarie': 'FormationSalarie', 'accesiteclient': 'AccesSiteClient',
      'client': 'Client', 'intervention': 'Intervention', 'materiel': 'Materiel',
      'materielutilise': 'MaterielUtilise', 'documentintervention': 'DocumentIntervention',
      'affectationintervention': 'AffectationIntervention', 'ressourceintervention': 'RessourceIntervention',
      'photointervention': 'PhotoIntervention', 'autocontrole': 'AutoControle',
      'messageintervention': 'MessageIntervention', 'checklistsecurite': 'ChecklistSecurite',
      'affectationplanning': 'AffectationPlanning', 'perimetre': 'Perimetre',
      'salarieperimetre': 'SalariePerimetre', 'chantier': 'Chantier',
      'donneurordre': 'DonneurOrdre', 'codeaffaire': 'CodeAffaire',
      'vehicule': 'Vehicule', 'affectationvehicule': 'AffectationVehicule',
      'pointage': 'Pointage', 'horaire': 'Horaire', 'evaluation': 'Evaluation',
      'evenementrh': 'EvenementRH', 'affectationpersonnel': 'AffectationPersonnel',
      'usine': 'Usine', 'structureorganisationnelle': 'StructureOrganisationnelle'
    }

    const modelNameLower = model.toLowerCase()
    const modelName = modelMapping[modelNameLower]

    if (!modelName) {
      return NextResponse.json(
        { error: `Modèle ${model} non trouvé` },
        { status: 404 }
      )
    }

    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1)
    const body = await request.json()

    // Nettoyer les données
    const cleanData: any = { ...body }
    delete cleanData.id
    delete cleanData.createdAt
    delete cleanData.updatedAt

    // Convertir les chaînes vides en null
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '') {
        cleanData[key] = null
      }
    })

    const updated = await (prisma as any)[prismaModelName].update({
      where: { id },
      data: cleanData
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating database record:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un enregistrement
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { model, id } = await params
    
    const modelMapping: Record<string, string> = {
      'user': 'User', 'salarie': 'Salarie', 'competence': 'Competence',
      'habilitation': 'Habilitation', 'autorisation': 'Autorisation',
      'visitemedicale': 'VisiteMedicale', 'restrictionmedicale': 'RestrictionMedicale',
      'publication': 'Publication', 'actualite': 'Actualite',
      'messagesecurite': 'MessageSecurite', 'conversation': 'Conversation',
      'participantconversation': 'ParticipantConversation', 'message': 'Message',
      'conge': 'Conge', 'contacturgence': 'ContactUrgence',
      'materielfourni': 'MaterielFourni', 'enginconfie': 'EnginConfie',
      'materielattribue': 'MaterielAttribue', 'documentpersonnel': 'DocumentPersonnel',
      'formationsalarie': 'FormationSalarie', 'accesiteclient': 'AccesSiteClient',
      'client': 'Client', 'intervention': 'Intervention', 'materiel': 'Materiel',
      'materielutilise': 'MaterielUtilise', 'documentintervention': 'DocumentIntervention',
      'affectationintervention': 'AffectationIntervention', 'ressourceintervention': 'RessourceIntervention',
      'photointervention': 'PhotoIntervention', 'autocontrole': 'AutoControle',
      'messageintervention': 'MessageIntervention', 'checklistsecurite': 'ChecklistSecurite',
      'affectationplanning': 'AffectationPlanning', 'perimetre': 'Perimetre',
      'salarieperimetre': 'SalariePerimetre', 'chantier': 'Chantier',
      'donneurordre': 'DonneurOrdre', 'codeaffaire': 'CodeAffaire',
      'vehicule': 'Vehicule', 'affectationvehicule': 'AffectationVehicule',
      'pointage': 'Pointage', 'horaire': 'Horaire', 'evaluation': 'Evaluation',
      'evenementrh': 'EvenementRH', 'affectationpersonnel': 'AffectationPersonnel',
      'usine': 'Usine', 'structureorganisationnelle': 'StructureOrganisationnelle'
    }

    const modelNameLower = model.toLowerCase()
    const modelName = modelMapping[modelNameLower]

    if (!modelName) {
      return NextResponse.json(
        { error: `Modèle ${model} non trouvé` },
        { status: 404 }
      )
    }

    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1)

    await (prisma as any)[prismaModelName].delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting database record:', error)
    
    // Gérer les erreurs de contrainte de clé étrangère
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Impossible de supprimer : cet enregistrement est référencé ailleurs' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}