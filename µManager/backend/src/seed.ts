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

    // Création d'un utilisateur
    const user = userRepo.create({
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: hashedPassword,
    });
    await userRepo.save(user);

    // Création d'une entreprise
    const company = companyRepo.create({
      name: "My Company",
      address: "123 Main St",
      city: "Paris",
      postalCode: "75000",
      phone: "0123456789",
      email: "contact@mycompany.com",
      rib: "FR76 1234 5678 9012 3456 7890 123",
      siret: "12345678901234",
      user,
    });
    await companyRepo.save(company);

    // Création de clients
    const client1 = clientRepo.create({
      clientRib: "FR76 9876 5432 1098 7654 3210 987",
      clientCompany: "Client Company 1",
      name: "Client",
      lastName: "One",
      email: "client1@example.com",
      phone: "0987654321",
      address: "456 Client St",
      company,
    });
    const client2 = clientRepo.create({
      clientRib: "FR76 1234 5678 9012 3456 7890 654",
      clientCompany: "Client Company 2",
      name: "Client",
      lastName: "Two",
      email: "client2@example.com",
      phone: "0654321098",
      address: "789 Client Ave",
      company,
    });
    await clientRepo.save([client1, client2]);

    // Génération des factures pour les clients avec lignes
    const statuses = ["Draft", "Sent", "Paid"];
    const randomAmount = () => parseFloat((Math.random() * 1000 + 50).toFixed(2)); // Montants entre 50€ et 1050€
    const randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
    const randomDate = (start: Date, end: Date) => {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split("T")[0]; // Retourne une date au format YYYY-MM-DD
    };

    for (let i = 0; i < 30; i++) {
      const lines = [];
      let total = 0;

      const numberOfLines = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 lignes
      for (let j = 0; j < numberOfLines; j++) {
        const unitPrice = randomAmount();
        const quantity = Math.floor(Math.random() * 10) + 1; // Quantité entre 1 et 10
        const totalPrice = parseFloat((unitPrice * quantity).toFixed(2));
        total += totalPrice;

        lines.push({
          description: `Produit ${j + 1}`,
          unitPrice,
          quantity,
          totalPrice,
        });
      }

      const invoice = invoiceRepo.create({
        client: i % 2 === 0 ? client1 : client2,
        company,
        total: parseFloat(total.toFixed(2)),
        status: randomStatus() as "Draft" | "Sent" | "Paid",
        issueDate: randomDate(new Date(2023, 0, 1), new Date(2025, 1, 31)), // Dates en 2023
        lines,
      });

      await invoiceRepo.save(invoice);
    }

    console.log("Seeding terminé avec succès !");
  } catch (error) {
    console.error("Erreur lors du seeding :", error);
  }
};