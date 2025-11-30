# KBTPulse - Application de Gestion de Chantiers BTP

KBTPulse est une application web et mobile destinée à la gestion complète des chantiers dans une entreprise du BTP.

## Fonctionnalités

- **Tableau de bord** : Vue d'ensemble avec métriques et graphiques
- **Gestion des salariés** : Gestion complète du personnel
- **Gestion des chantiers** : Suivi des projets et interventions
- **Gestion du matériel** : Inventaire et suivi du matériel
- **Planning** : Organisation et planification des ressources
- **Ressources** : Gestion des ressources matérielles et humaines

## Technologies

- **Next.js 14** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling
- **Prisma** : ORM et gestion de base de données
- **Recharts** : Graphiques et visualisations
- **Lucide React** : Icônes

## Installation

```bash
npm install
```

## Configuration de la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push

# Peupler la base de données avec des données d'exemple (optionnel)
npm run db:seed
```

## Utilisation

### Page d'accueil publique

- **Page d'accueil** : `/` - Accessible à tous, présentation de l'application

### Authentification

L'application utilise un système d'authentification par identifiant et mot de passe.

**Comptes par défaut (créés lors du seed) :**
- **Admin** : identifiant `admin`, mot de passe `admin123`
- **CAFF** : identifiant `caff`, mot de passe `caff123`

### Espaces utilisateurs

Une fois connecté, vous pouvez accéder à :

- **Tableau de bord** : `/tableau-de-bord` - Vue d'ensemble avec métriques et graphiques
- **Mon Profil** : `/mon-profil` - Accessible à tous les utilisateurs authentifiés
- **Interventions** : `/interventions` - Gestion des chantiers (accessible à tous)
- **Espace Staff** : `/espace-staff` - Accessible aux profils PREPA, CE, RDC, CAFF, RH, AUTRE
- **Espace RDC** : `/espace-rdc` - Responsable de chantier (RDC, CAFF, ADMIN)
- **Espace CAFF** : `/espace-caff` - Chargé d'affaires (CAFF, ADMIN)
- **Chantiers** : `/chantiers` - Gestion des chantiers
- **Salariés** : `/salaries` - Gestion du personnel
- **Matériel** : `/materiel` - Inventaire du matériel
- **Planning** : `/planning` - Planification des ressources
- **Configuration** : `/configuration` - Zone de configuration (CAFF, ADMIN)

### Rôles et permissions

L'application supporte les rôles suivants :
- **PREPA** : Préparateur
- **CE** : Chef d'équipe
- **RDC** : Responsable de chantier
- **CAFF** : Chargé d'affaires
- **RH** : Ressources Humaines
- **AUTRE** : Autre profil
- **ADMIN** : Administrateur (accès complet)

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
/
├── app/              # Pages Next.js (App Router)
├── components/       # Composants React réutilisables
├── lib/             # Utilitaires et configurations
├── prisma/          # Schéma Prisma et migrations
└── public/          # Fichiers statiques
```
