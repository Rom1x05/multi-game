---
description: Comment déployer l'application en ligne (Vercel/Netlify)
---

Puisque votre application est une "Static Single Page Application" (React + Vite) sans base de données backend complexe (tout est stocké dans le navigateur), le déploiement est très simple et gratuit.

## Option 1 : Vercel (Recommandé)
C'est la méthode la plus simple pour les projets React/Vite.

### Prérequis
- Avoir votre projet sur GitHub, GitLab ou Bitbucket.

### Étapes
1. Créez un compte sur [Vercel.com](https://vercel.com).
2. Cliquez sur "Add New..." > "Project".
3. Importez votre dépôt Git.
4. Framework Preset : Vercel détectera automatiquement "Vite".
5. Cliquez sur **Deploy**.

C'est tout ! Vercel vous donnera une URL du type `multigame-app.vercel.app`.

---

## Option 2 : Netlify (Glisser-Déposer)
Si vous ne voulez pas utiliser Git, vous pouvez le faire manuellement.

### Étapes
1. Dans votre terminal VS Code, lancez la commande de construction :
   ```bash
   npm run build
   ```
2. Cela va créer un dossier `dist/` dans votre projet.
3. Allez sur [Netlify Drop](https://app.netlify.com/drop).
4. Glissez-déposez le dossier `dist` (et seulement ce dossier) dans la zone prévue.
5. Votre site est en ligne instantanément.

---

## ⚠️ Important : Données et Persistance
Votre application utilise actuellement le `localStorage` du navigateur pour sauvegarder les joueurs et les courses.

Ce que cela signifie une fois en ligne :
- **Les données ne sont pas partagées** : Si vous ouvrez le site sur votre téléphone, vous ne verrez pas les courses créées sur votre ordinateur. Chaque appareil a ses propres données.
- **C'est parfait pour un usage personnel** : Si vous êtes le "Maître du Jeu" et que vous utilisez toujours la même tablette/PC pour gérer les courses, c'est idéal.
- **Pour partager les résultats** : Si vous voulez que d'autres voient les résultats, vous devrez implémenter une "vraie" base de données (Firebase, Supabase, etc.), ce qui est une étape plus complexe.
