import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Company } from "../entities/Company";
import { Client } from "../entities/Client";
import { Invoice } from "../entities/Invoice";
import { InvoiceLine } from "../entities/InvoiceLine";
import { Contract } from "../entities/Contract";
import { PasswordReset } from "../entities/PasswordReset";

export const AppDataSource = new DataSource({
  type: "mysql", // ou "mariadb"
  host: "db", // correspond au service dans docker-compose
  port: 3306,
  username: "root",
  password: "root",
  database: "micromanager",
  entities: [User, Company, Client, Contract, Invoice, InvoiceLine, PasswordReset],
  synchronize: true, // Crée ou met à jour automatiquement les tables
  logging: true, // (optionnel) affiche les requêtes SQL générées dans les logs
});