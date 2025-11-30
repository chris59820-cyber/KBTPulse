import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'

// GET - Récupérer tous les salariés
export async function GET() {
  try {
    const user = await getCurrentUser()
    // Permettre l'accès en lecture aux rôles autorisés à gérer les affectations
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const salaries = await prisma.salarie.findMany({
      orderBy: { nom: 'asc' },
      include: {
        user: true
      }
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

// POST - Créer un nouveau salarié
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      nom, prenom, dateNaissance, email, telephone, adresse, photoUrl,
      poste, fonction, coefficient, matricule, dateEmbauche, typeContrat,
      tauxHoraire, deplacement, niveauAcces, perimetreId,
      creerCompte, emailConnexion, motDePasse
    } = body

    if (!nom || !prenom || !poste) {
      return NextResponse.json(
        { error: 'Le nom, prénom et poste sont requis' },
        { status: 400 }
      )
    }

    // Vérifier les identifiants de connexion si création de compte demandée
    if (creerCompte) {
      if (!emailConnexion) {
        return NextResponse.json(
          { error: 'L\'e-mail de connexion est requis pour créer un compte' },
          { status: 400 }
        )
      }
      if (!motDePasse || motDePasse.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }
    }

    // Créer le salarié et le compte utilisateur dans une transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Créer le salarié
      const salarie = await tx.salarie.create({
        data: {
          nom,
          prenom,
          dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
          email: email || null,
          telephone: telephone || null,
          adresse: adresse || null,
          photoUrl: photoUrl || null,
          poste,
          fonction: fonction || null,
          coefficient: coefficient ? parseFloat(coefficient) : null,
          matricule: matricule || null,
          dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : new Date(),
          typeContrat: typeContrat || null,
          tauxHoraire: tauxHoraire ? parseFloat(tauxHoraire) : null,
          deplacement: deplacement ? parseFloat(deplacement) : null,
          niveauAcces: niveauAcces || null,
          perimetreId: perimetreId || null,
          statut: 'actif'
        }
      })

      // Créer le compte utilisateur si demandé
      if (creerCompte && emailConnexion && motDePasse) {
        // Générer un identifiant basé sur le nom/prénom ou l'email
        const identifiant = emailConnexion.toLowerCase().split('@')[0] || 
          `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/\s+/g, '.')

        // Hacher le mot de passe
        const motDePasseHash = await hashPassword(motDePasse)

        // Déterminer le rôle basé sur le niveau d'accès
        const role = niveauAcces && ['PREPA', 'CE', 'RDC', 'CAFF', 'OUVRIER', 'AUTRE'].includes(niveauAcces)
          ? niveauAcces
          : 'AUTRE'

        await tx.user.create({
          data: {
            identifiant,
            email: emailConnexion,
            motDePasse: motDePasseHash,
            nom,
            prenom,
            role,
            salarieId: salarie.id,
            actif: true
          }
        })
      }

      return salarie
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating salarie:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email ou matricule est déjà utilisé' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du salarié' },
      { status: 500 }
    )
  }
}
