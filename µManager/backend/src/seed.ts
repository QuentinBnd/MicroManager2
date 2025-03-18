import { AppDataSource } from "./config/data-source";
import { User } from "./entities/User";
import { Company } from "./entities/Company";
import { Client } from "./entities/Client";
import { Invoice } from "./entities/Invoice";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
  const connection = AppDataSource;
  if (!connection.isInitialized) {
    console.log("Base de données non initialisée, annulation du seeding.");
    return;
  }

  console.log("Début du seeding...");

  try {
    const userRepo = connection.getRepository(User);
    const companyRepo = connection.getRepository(Company);
    const clientRepo = connection.getRepository(Client);
    const invoiceRepo = connection.getRepository(Invoice);


    // Vérification si les données existent déjà
    const existingUsers = await userRepo.find();
    if (existingUsers.length > 0) {
      console.log("La base de données contient déjà des données. Seeding ignoré.");
      return;
    }

    const plainPassword = "password";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Création d'un utilisateur avec des données concrètes
    const user = userRepo.create({
      name: "Quentin",
      lastName: "Bernard",
      email: "quentinn.bernardd@gmail.com",
      password: hashedPassword,
    });
    await userRepo.save(user);

    // Création d'une entreprise concrète
    const company = companyRepo.create({
      name: "Q'Dev",
      address: "245 Boulevard de la litorne",
      city: "Saint-Cyr-sur-Mer",
      postalCode: "83270",
      phone: "0643777948",
      email: "quentinn.bernardd@gmail.com",
      rib: "FR76111222333344445555666",
      siret: "12345678901234",
      user,
    });
    await companyRepo.save(company);

    // Création de 4 clients concrets (2 clients supplémentaires)
    const client1 = clientRepo.create({
      clientRib: "FR76987654321098765432109",
      clientCompany: "Tech Innovators",
      name: "Marie",
      lastName: "Lefevre",
      email: "marie.lefevre@techinnov.com",
      phone: "0123456789",
      address: "12 Avenue de la Technologie",
      company,
    });
    const client2 = clientRepo.create({
      clientRib: "FR76123456789012345678906",
      clientCompany: "Web Services SARL",
      name: "Pierre",
      lastName: "Moreau",
      email: "pierre.moreau@webservices.com",
      phone: "0987654321",
      address: "34 Boulevard du Digital",
      company,
    });
    const client3 = clientRepo.create({
      clientRib: "FR76111222333344445555667",
      clientCompany: "Solutions IT",
      name: "Sophie",
      lastName: "Martin",
      email: "sophie.martin@solutionsit.com",
      phone: "0156789456",
      address: "78 Rue de l'Informatique",
      company,
    });
    const client4 = clientRepo.create({
      clientRib: "FR76111222333344445555668",
      clientCompany: "Cloud Experts",
      name: "Luc",
      lastName: "Bernard",
      email: "luc.bernard@cloudexperts.com",
      phone: "0176543210",
      address: "90 Avenue du Cloud",
      company,
    });
    await clientRepo.save([client1, client2, client3, client4]);

    // Définition de services concrets
    const services = ["Développement", "R&D", "Maintenance", "Consulting", "Support"];

    // Factures : au moins 1 facture par mois depuis janvier 2023 jusqu'au mois en cours
    const startDate = new Date(2023, 0, 1); // Janvier 2023
    const currentDate = new Date();
    // Date limite : 6 mois avant aujourd'hui
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let year = startDate.getFullYear();
    let month = startDate.getMonth();

    while (year < currentDate.getFullYear() || (year === currentDate.getFullYear() && month <= currentDate.getMonth())) {
      // Générer entre 1 et 3 factures pour le mois courant (garanti au minimum 1 facture)
      const numInvoicesThisMonth = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numInvoicesThisMonth; i++) {
        // Générer une date aléatoire dans le mois
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const randomTimestamp = firstDay.getTime() + Math.random() * (lastDay.getTime() - firstDay.getTime());
        const invoiceDateObj = new Date(randomTimestamp);
        const issueDate = invoiceDateObj.toISOString().split("T")[0];

        // Génération des lignes de facture
        const lines = [];
        let total = 0;
        const numberOfLines = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 lignes
        for (let j = 0; j < numberOfLines; j++) {
          const unitPrice = Math.floor(Math.random() * 1000) + 50; // Montant entier entre 50 et 1049€
          const quantity = Math.floor(Math.random() * 10) + 1; // Quantité entre 1 et 10
          const totalPrice = unitPrice * quantity;
          total += totalPrice;

          // Choix aléatoire d'un service
          const service = services[Math.floor(Math.random() * services.length)];

          lines.push({
            description: service,
            unitPrice,
            quantity,
            totalPrice,
          });
        }

        // Choix aléatoire d'un client parmi les 4
        const clients = [client1, client2, client3, client4];
        const client = clients[Math.floor(Math.random() * clients.length)];

        // Choix initial aléatoire du status ("Draft", "Sent" ou "Paid")
        let status: "Draft" | "Sent" | "Paid" = ["Draft", "Sent", "Paid"][Math.floor(Math.random() * 3)] as "Draft" | "Sent" | "Paid";

        // Si la facture a été envoyée il y a plus de 6 mois, on force le status à "Paid"
        if (new Date(issueDate) < sixMonthsAgo && status === "Sent") {
          status = "Paid";
        }

        const invoice = invoiceRepo.create({
          client,
          company,
          total,
          status,
          issueDate,
          lines,
        });

        await invoiceRepo.save(invoice);
      }

      // Passage au mois suivant
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    console.log("Seeding terminé avec succès !");
  } catch (error) {
    console.error("Erreur lors du seeding :", error);
  }
};