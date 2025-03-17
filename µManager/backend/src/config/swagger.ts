import swaggerJsdoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentation de l'API",
    },
    servers: [
      {
        url: "http://localhost:3000", // Change selon l'URL de ton API
        description: "Serveur local",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"], // Indique le chemin des fichiers où Swagger doit scanner les commentaires
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };