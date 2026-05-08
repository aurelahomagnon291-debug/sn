# Snapchat Web - Maquette avec MongoDB

Maquette Snapchat Web avec un backend Node.js/Express et MongoDB (Mongoose) pour gerer l'inscription et la connexion des utilisateurs.

## Structure du projet

```
snap-projet/
  server.js            <- Serveur Express + MongoDB/Mongoose
  index.js             <- Point d'entree pour Vercel
  models/
    User.js            <- Modele Mongoose pour les utilisateurs
    LoginAttempt.js    <- Modele Mongoose pour les tentatives de connexion
  package.json         <- Dependances Node.js
  README.md            <- Ce fichier
  public/
    index.html         <- Page de connexion
    register.html      <- Page d'inscription
    admin.html         <- Page d'administration
    script.js          <- Logique front-end (fetch API)
    styles.css         <- Styles CSS
    assets/img/        <- Images
```

## Prerequis

- **Node.js** (version 18 ou superieure) : https://nodejs.org
- **MongoDB** (version 6 ou superieure) : https://www.mongodb.com/try/download/community

## Installation

1. **Installer MongoDB** et demarrer le service :
   ```bash
   # Sur Ubuntu/Debian
   sudo systemctl start mongod

   # Sur macOS (avec Homebrew)
   brew services start mongodb-community
   ```

2. **Installer les dependances** :
   ```bash
   npm install
   ```

3. **Configurer la connexion MongoDB** (optionnel) :

   Par defaut, l'application se connecte a `mongodb://localhost:27017/snapchat`.
   Pour utiliser une autre URI (ex: MongoDB Atlas), creez un fichier `.env` :
   ```
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/snapchat
   ```

4. **Demarrer le serveur** :
   ```bash
   npm start
   ```

5. **Ouvrir dans le navigateur** : http://localhost:3000

## Fonctionnalites

- **Inscription** : creer un compte avec nom d'utilisateur, e-mail et mot de passe
- **Connexion** : se connecter avec son nom d'utilisateur ou e-mail
- **Base de donnees MongoDB** : les donnees sont stockees dans MongoDB via Mongoose
- **Administration** : voir les utilisateurs et les tentatives de connexion sur /admin.html

## API

| Methode | Route              | Description                          |
|---------|--------------------|--------------------------------------|
| POST    | /api/register      | Creer un compte                      |
| POST    | /api/login         | Se connecter                         |
| GET     | /api/users         | Lister les utilisateurs (debug only) |
| GET     | /api/login-attempts| Lister les tentatives de connexion   |
| DELETE  | /api/users/:id     | Supprimer un utilisateur             |

## Technologies

- **Express.js** - Serveur web
- **Mongoose** - ODM pour MongoDB
- **MongoDB** - Base de donnees NoSQL
