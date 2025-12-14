import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Début du seed...')

  // Créer un utilisateur admin par défaut
  const adminPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { identifiant: 'admin' },
    update: {},
    create: {
      identifiant: 'admin',
      motDePasse: adminPassword,
      email: 'admin@btp.fr',
      nom: 'Administrateur',
      prenom: 'Admin',
      role: 'ADMIN',
      actif: true
    }
  })

  console.log('✅ Utilisateur admin créé (identifiant: admin, mot de passe: admin123)')

  // Créer un utilisateur CAFF par défaut
  const caffPassword = await hashPassword('caff123')
  const caffUser = await prisma.user.upsert({
    where: { identifiant: 'caff' },
    update: {},
    create: {
      identifiant: 'caff',
      motDePasse: caffPassword,
      email: 'caff@btp.fr',
      nom: 'CAFF',
      prenom: 'Chargé',
      role: 'CAFF',
      actif: true
    }
  })

  console.log('✅ Utilisateur CAFF créé (identifiant: caff, mot de passe: caff123)')

  // Créer des salariés
  const salarie1 = await prisma.salarie.create({
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@btp.fr',
      telephone: '0612345678',
      poste: 'Chef de chantier',
      dateEmbauche: new Date('2020-01-15'),
      statut: 'actif'
    }
  })

  const salarie2 = await prisma.salarie.create({
    data: {
      nom: 'Martin',
      prenom: 'Pierre',
      email: 'pierre.martin@btp.fr',
      telephone: '0623456789',
      poste: 'Ouvrier qualifié',
      dateEmbauche: new Date('2021-03-20'),
      statut: 'actif'
    }
  })

  const salarie3 = await prisma.salarie.create({
    data: {
      nom: 'Bernard',
      prenom: 'Marie',
      email: 'marie.bernard@btp.fr',
      telephone: '0634567890',
      poste: 'Maçon',
      dateEmbauche: new Date('2022-06-10'),
      statut: 'actif'
    }
  })

  console.log('✅ Salariés créés')

  // Créer des chantiers
  const chantier1 = await prisma.chantier.create({
    data: {
      nom: 'Résidence Les Jardins',
      adresse: '123 Rue de la Construction, 75001 Paris',
      description: 'Construction d\'une résidence de 50 logements',
      client: 'Promoteur Immobilier ABC',
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2024-12-31'),
      budget: 5000000,
      statut: 'en_cours'
    }
  })

  const chantier2 = await prisma.chantier.create({
    data: {
      nom: 'Rénovation Bureaux',
      adresse: '45 Avenue des Affaires, 69000 Lyon',
      description: 'Rénovation complète de bureaux d\'entreprise',
      client: 'Société XYZ',
      dateDebut: new Date('2024-02-15'),
      dateFin: new Date('2024-08-30'),
      budget: 850000,
      statut: 'en_cours'
    }
  })

  const chantier3 = await prisma.chantier.create({
    data: {
      nom: 'Extension École Primaire',
      adresse: '78 Rue de l\'Éducation, 33000 Bordeaux',
      description: 'Extension de 6 classes',
      client: 'Mairie de Bordeaux',
      dateDebut: new Date('2024-03-01'),
      budget: 1200000,
      statut: 'planifie'
    }
  })

  console.log('✅ Chantiers créés')

  // Créer du matériel
  const materiel1 = await prisma.materiel.create({
    data: {
      nom: 'Bétonnière 350L',
      description: 'Bétonnière électrique 350 litres',
      categorie: 'machine',
      quantite: 2,
      unite: 'unité',
      prixUnitaire: 2500,
      statut: 'disponible'
    }
  })

  const materiel2 = await prisma.materiel.create({
    data: {
      nom: 'Camion benne 10T',
      description: 'Camion benne pour transport de matériaux',
      categorie: 'vehicule',
      quantite: 3,
      unite: 'unité',
      prixUnitaire: 65000,
      statut: 'disponible'
    }
  })

  const materiel3 = await prisma.materiel.create({
    data: {
      nom: 'Perceuse visseuse',
      description: 'Perceuse visseuse sans fil 18V',
      categorie: 'outillage',
      quantite: 15,
      unite: 'unité',
      prixUnitaire: 150,
      statut: 'disponible'
    }
  })

  const materiel4 = await prisma.materiel.create({
    data: {
      nom: 'Ciment Portland',
      description: 'Sac de ciment 50kg',
      categorie: 'consommable',
      quantite: 500,
      unite: 'sac',
      prixUnitaire: 8.50,
      statut: 'disponible'
    }
  })

  console.log('✅ Matériel créé')

  // Créer des interventions
  const intervention1 = await prisma.intervention.create({
    data: {
      titre: 'Préparation des fondations',
      description: 'Creusement et préparation des fondations pour le bâtiment principal',
      dateDebut: new Date('2024-06-01T08:00:00'),
      dateFin: new Date('2024-06-15T18:00:00'),
      duree: 120,
      statut: 'en_cours',
      chantierId: chantier1.id,
      salarieId: salarie1.id
    }
  })

  const intervention2 = await prisma.intervention.create({
    data: {
      titre: 'Travaux de maçonnerie',
      description: 'Élévation des murs porteurs',
      dateDebut: new Date('2024-06-16T08:00:00'),
      duree: 200,
      statut: 'planifiee',
      chantierId: chantier1.id,
      salarieId: salarie3.id
    }
  })

  const intervention3 = await prisma.intervention.create({
    data: {
      titre: 'Démolition cloisons',
      description: 'Démolition des anciennes cloisons',
      dateDebut: new Date('2024-06-20T08:00:00'),
      dateFin: new Date('2024-06-22T17:00:00'),
      duree: 24,
      statut: 'terminee',
      chantierId: chantier2.id,
      salarieId: salarie2.id
    }
  })

  console.log('✅ Interventions créées')

  // Créer des affectations de planning
  await prisma.affectationPlanning.create({
    data: {
      date: new Date('2024-06-19'),
      heureDebut: '08:00',
      heureFin: '17:00',
      salarieId: salarie1.id,
      chantierId: chantier1.id,
      description: 'Supervision du chantier'
    }
  })

  await prisma.affectationPlanning.create({
    data: {
      date: new Date('2024-06-19'),
      heureDebut: '08:00',
      heureFin: '17:00',
      salarieId: salarie2.id,
      chantierId: chantier1.id,
      description: 'Travaux de terrassement'
    }
  })

  await prisma.affectationPlanning.create({
    data: {
      date: new Date('2024-06-19'),
      heureDebut: '08:00',
      heureFin: '12:00',
      salarieId: salarie3.id,
      chantierId: chantier2.id,
      description: 'Rénovation façade'
    }
  })

  console.log('✅ Affectations de planning créées')

  // Créer des utilisations de matériel
  await prisma.materielUtilise.create({
    data: {
      quantite: 1,
      dateDebut: new Date('2024-06-01T08:00:00'),
      dateFin: new Date('2024-06-15T18:00:00'),
      interventionId: intervention1.id,
      materielId: materiel1.id
    }
  })

  await prisma.materielUtilise.create({
    data: {
      quantite: 50,
      dateDebut: new Date('2024-06-01T08:00:00'),
      interventionId: intervention1.id,
      materielId: materiel4.id
    }
  })

  await prisma.materielUtilise.create({
    data: {
      quantite: 2,
      dateDebut: new Date('2024-06-20T08:00:00'),
      dateFin: new Date('2024-06-22T17:00:00'),
      interventionId: intervention3.id,
      materielId: materiel3.id
    }
  })

  console.log('✅ Utilisations de matériel créées')

  console.log('🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
