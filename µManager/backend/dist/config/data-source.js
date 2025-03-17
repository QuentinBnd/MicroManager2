"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Company_1 = require("../entities/Company");
const Client_1 = require("../entities/Client");
const Contract_1 = require("../entities/Contract");
const Invoice_1 = require("../entities/Invoice");
const Payment_1 = require("../entities/Payment");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql", // ou "mariadb"
    host: "db", // correspond au service dans docker-compose
    port: 3306,
    username: "root",
    password: "root",
    database: "micromanager",
    entities: [User_1.User, Company_1.Company, Client_1.Client, Contract_1.Contract, Invoice_1.Invoice, Payment_1.Payment],
    synchronize: true, // Crée ou met à jour automatiquement les tables
    logging: true, // (optionnel) affiche les requêtes SQL générées dans les logs
});
