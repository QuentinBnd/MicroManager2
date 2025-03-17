# Étape 1 : Utiliser une image Node.js
FROM node:18

# Étape 2 : Créer et positionner dans le répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers de l'application
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Exposer le port
EXPOSE 3000

# Étape 7 : Lancer l'application
CMD ["npm", "run", "dev"] 