# Snapchat Web - Maquette avec base de donnees

Maquette Snapchat Web avec un backend Node.js et une base de donnees SQLite pour gerer l'inscription et la connexion des utilisateurs.

## Structure du projet

```
snap-projet/
  server.js            <- Serveur Express + SQLite
  package.json         <- Dependances Node.js
  README.md            <- Ce fichier
  public/
    index.html         <- Page de connexion
    register.html      <- Page d'inscription
    script.js          <- Logique front-end (fetch API)
    styles.css         <- Styles CSS
    assets/img/        <- Images
```

## Installation

1. **Installer Node.js** (version 18 ou superieure) : https://nodejs.org

2. **Installer les dependances** :
   ```bash
   cd snap-projet
   npm install
   ```

3. **Demarrer le serveur** :
   ```bash
   npm start
   ```

4. **Ouvrir dans le navigateur** : http://localhost:3000

## Fonctionnalites

- **Inscription** : creer un compte avec nom d'utilisateur, e-mail et mot de passe
- **Connexion** : se connecter avec son nom d'utilisateur ou e-mail
- **Base de donnees SQLite** : les donnees sont stockees dans `snapchat.db` (cree automatiquement)
- **Mots de passe hashes** : les mots de passe sont securises avec bcrypt

## API

| Methode | Route           | Description                          |
|---------|-----------------|--------------------------------------|
| POST    | /api/register   | Creer un compte                      |
| POST    | /api/login      | Se connecter                         |
| GET     | /api/users      | Lister les utilisateurs (debug only) |

## Technologies

- **Express.js** - Serveur web
- **better-sqlite3** - Base de donnees SQLite
- **bcryptjs** - Hashage des mots de passe
