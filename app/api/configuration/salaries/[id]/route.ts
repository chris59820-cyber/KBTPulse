import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'

// PUT - Mettre à jour un salarié
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Récupérer le salarié existant avec son compte utilisateur
    const salarieExistant = await prisma.salarie.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!salarieExistant) {
      return NextResponse.json(
        { error: 'Salarié non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le salarié et gérer le compte utilisateur dans une transaction
    const salarie = await prisma.$transaction(async (tx) => {
      // Mettre à jour le salarié
      const salarieUpdated = await tx.salarie.update({
        where: { id: params.id },
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
          dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : undefined,
          typeContrat: typeContrat || null,
          tauxHoraire: tauxHoraire ? parseFloat(tauxHoraire) : null,
          deplacement: deplacement ? parseFloat(deplacement) : null,
          niveauAcces: niveauAcces || null,
          perimetreId: perimetreId || null,
        }
      })

      // Gérer le compte utilisateur
      const compteExistant = salarieExistant.user

      if (creerCompte) {
        if (!emailConnexion) {
          throw new Error('L\'e-mail de connexion est requis pour créer un compte')
        }

        // Déterminer le rôle basé sur le niveau d'accès
        const role = niveauAcces && ['PREPA', 'CE', 'RDC', 'CAFF', 'OUVRIER', 'AUTRE'].includes(niveauAcces)
          ? niveauAcces
          : 'AUTRE'

        if (compteExistant) {
          // Mettre à jour le compte existant
          const updateData: any = {
            email: emailConnexion,
            nom,
            prenom,
            role
          }

          // Mettre à jour le mot de passe seulement s'il est fourni
          if (motDePasse && motDePasse.length >= 6) {
            updateData.motDePasse = await hashPassword(motDePasse)
          }

          await tx.user.update({
            where: { id: compteExistant.id },
            data: updateData
          })
        } else {
          // Créer un nouveau compte
          if (!motDePasse || motDePasse.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères')
          }

          const identifiant = emailConnexion.toLowerCase().split('@')[0] || 
            `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/\s+/g, '.')

          await tx.user.create({
            data: {
              identifiant,
              email: emailConnexion,
              motDePasse: await hashPassword(motDePasse),
              nom,
              prenom,
              role,
              salarieId: salarieUpdated.id,
              actif: true
            }
          })
        }
      } else if (compteExistant) {
        // Désactiver le compte si la case est décochée (soft delete)
        await tx.user.update({
          where: { id: compteExistant.id },
          data: { actif: false }
        })
      }

      return salarieUpdated
    })

    return NextResponse.json(salarie)
  } catch (error: any) {
    console.error('Error updating salarie:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email ou matricule est déjà utilisé' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du salarié' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un salarié
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer le salarié avec son compte utilisateur
    const salarie = await prisma.salarie.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!salarie) {
      return NextResponse.json(
        { error: 'Salarié non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le salarié et toutes ses données associées dans une transaction
    await prisma.$transaction(async (tx) => {
      // Supprimer le compte utilisateur associé s'il existe
      if (salarie.user) {
        await tx.user.delete({
          where: { id: salarie.user.id }
        })
      }

      // Supprimer le salarié (cela supprimera automatiquement toutes les relations en cascade)
      await tx.salarie.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ message: 'Salarié et toutes ses données supprimés avec succès' })
  } catch (error: any) {
    console.error('Error deleting salarie:', error)
    
    // Gérer les erreurs de contrainte de clé étrangère
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce salarié car il est encore référencé dans d\'autres données' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du salarié' },
      { status: 500 }
    )
  }
}
