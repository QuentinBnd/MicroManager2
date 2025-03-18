import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/data-source";
import routes from "./routes";
import cors from "cors";
import { seedDatabase } from "./seed";

const app = express();

// Configuration de CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Remplace par l'URL de ton frontend
  })
);

// Augmentation de la limite des requêtes JSON et URL-encoded
app.use(express.json({ limit: "10mb" })); // Augmente la limite pour JSON
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Augmente la limite pour les requêtes URL-encoded

// Ajout des routes
app.use(routes);

// Fonction pour initialiser la source de données avec des tentatives
const initializeDataSourceWithRetry = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      console.log("Tentative d'initialisation de la source de données...");
      await AppDataSource.initialize();
      console.log("Source de données initialisée avec succès !");
      return true; // La connexion est établie
    } catch (err: unknown) {
      console.error(
        `Échec d'initialisation. Tentatives restantes : ${retries - 1}`
      );
      console.error(err);
      retries--;

      if (retries === 0) {
        console.error(
          "Impossible de se connecter à la base de données. Arrêt du serveur."
        );
        return false; // La connexion a échoué
      }

      console.log(`Nouvelle tentative dans ${delay / 1000} secondes...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Fonction pour démarrer le serveur
const startServer = async () => {
  const dataSourceInitialized = await initializeDataSourceWithRetry();

  if (dataSourceInitialized) {
    await seedDatabase();
    app.listen(3000, () =>
      console.log("Server is running on http://localhost:3000")
    );
  } else {
    console.error(
      "Le serveur n'a pas pu démarrer en raison de problèmes de base de données."
    );
    process.exit(1); 
  }
};

startServer();