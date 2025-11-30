# Guide d'authentification et de gestion des profils

## Structure de l'application

L'application se compose de plusieurs espaces selon les profils utilisateurs :

### 1. Page d'accueil
- **URL** : `/`
- **Accessible** : Tous les utilisateurs (public)
- **Description** : Page d'accueil publique présentant l'application

### 2. Espace Mon Profil
- **URL** : `/mon-profil`
- **Accessible** : Tous les utilisateurs authentifiés (PREPA, CE, RDC, CAFF, RH, AUTRE, ADMIN)
- **Description** : Permet de consulter et modifier ses informations personnelles

### 3. Espace Interventions
- **URL** : `/interventions`
- **Accessible** : Tous les utilisateurs authentifiés
- **Description** : Gestion des chantiers et interventions

### 4. Espace Staff
- **URL** : `/espace-staff`
- **Accessible** : Profils PREPA, CE, RDC, CAFF, RH, AUTRE, ADMIN
- **Description** : Espace réservé au personnel avec statistiques et fonctionnalités spécifiques

### 5. Espace RDC (Responsable de chantier)
- **URL** : `/espace-rdc`
- **Accessible** : RDC, CAFF, ADMIN
- **Description** : Fonctions de gestion avancée pour les responsables de chantier

### 6. Espace CAFF (Chargé d'affaires)
- **URL** : `/espace-caff`
- **Accessible** : CAFF, ADMIN
- **Description** : Gestion commerciale et administrative

### 7. Zone de configuration
- **URL** : `/configuration`
- **Accessible** : CAFF, ADMIN
- **Description** : Configuration système, gestion des utilisateurs et paramètres

## Authentification

### Connexion

1. Accédez à la page de connexion : `/connexion`
2. Entrez votre identifiant et mot de passe
3. Vous serez redirigé vers le tableau de bord après connexion réussie

### Déconnexion

Cliquez sur le bouton "Déconnexion" dans la sidebar pour vous déconnecter.

### Comptes par défaut

Lors de l'initialisation de la base de données (seed), deux comptes sont créés :

1. **Administrateur**
   - Identifiant : `admin`
   - Mot de passe : `admin123`
   - Rôle : ADMIN

2. **Chargé d'affaires**
   - Identifiant : `caff`
   - Mot de passe : `caff123`
   - Rôle : CAFF

⚠️ **Important** : Changez ces mots de passe en production !

## Rôles et permissions

### PREPA (Préparateur)
- Accès à l'espace Staff
- Accès au profil
- Accès aux interventions

### CE (Chef d'équipe)
- Accès à l'espace Staff
- Accès au profil
- Accès aux interventions

### RDC (Responsable de chantier)
- Accès à l'espace Staff
- Accès à l'espace RDC
- Accès au profil
- Accès aux interventions

### CAFF (Chargé d'affaires)
- Accès à l'espace Staff
- Accès à l'espace RDC
- Accès à l'espace CAFF
- Accès à la zone de configuration
- Accès au profil
- Accès aux interventions

### RH (Ressources Humaines)
- Accès à l'espace Staff
- Accès au profil
- Accès aux interventions

### AUTRE
- Accès à l'espace Staff
- Accès au profil
- Accès aux interventions

### ADMIN (Administrateur)
- Accès complet à tous les espaces
- Accès à la zone de configuration
- Gestion des utilisateurs

## Protection des routes

Les routes sont protégées automatiquement selon les rôles. Si un utilisateur tente d'accéder à une page pour laquelle il n'a pas les permissions, il sera redirigé vers la page "Accès refusé" (`/acces-refuse`).

## Création d'utilisateurs

Pour créer de nouveaux utilisateurs, vous devez :

1. Accéder à la zone de configuration (en tant que CAFF ou ADMIN)
2. Utiliser la section "Gestion des utilisateurs"
3. Ou créer directement via l'API ou Prisma Studio

Les mots de passe sont hashés avec bcrypt avant stockage en base de données.

## Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les sessions sont gérées via des cookies httpOnly
- Les routes sont protégées côté serveur
- La vérification des permissions est effectuée à chaque requête
