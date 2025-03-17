import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState({
    total: 0,
    paid: 0,
    sent: 0,
    charges: 0,
    net: 0,
  });
  const [invoiceStats, setInvoiceStats] = useState({
    Draft: 0,
    Sent: 0,
    Paid: 0,
  });

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  const fetchCurrentMonthRevenue = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    try {
      const response = await fetch(
        `http://localhost:3000/dashboard/monthly-revenue/${companyId}?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
      }
      const data = await response.json();
      
      const charges = (data.paid || 0) * 0.24; // Calcul des charges sociales (24%)
      const net = (data.paid || 0) - charges;  // Calcul du revenu net

      setCurrentMonthRevenue({
        total: data.total || 0,
        paid: data.paid || 0,
        sent: data.pending || 0,
        charges: charges.toFixed(2),
        net: net.toFixed(2),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des revenus du mois :", error);
    }
  };

  const fetchInvoiceStats = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    try {
      const response = await fetch(`http://localhost:3000/dashboard/ratio/${companyId}?year=${year}&month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          companyId: companyId,
        },
      });

      const data = await response.json();
      console.log(data);
      setInvoiceStats(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du taux de paiement :", error);
    }
  };

  useEffect(() => {
    fetchCurrentMonthRevenue();
    fetchInvoiceStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <Navbar title="Dashboard" />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Tableau de Bord
        </h2>

        {/* Revenus du mois actuel */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Revenus du mois actuel
            </h3>
            <p className="text-green-500">Payés : {currentMonthRevenue.paid} €</p>
            <p className="text-orange-500">
              En attente : {currentMonthRevenue.sent} €
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              Total : {currentMonthRevenue.total} €
            </p>
            
          </div>

          {/* Factures */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Factures
            </h3>
            <p className="text-green-500">Payées : {invoiceStats.Paid}</p>
            <p className="text-orange-500">En attente : {invoiceStats.Sent}</p>
            <p className="text-gray-800 dark:text-gray-200">
              Brouillons : {invoiceStats.Draft}
            </p>
          </div>

          {/* Charges sociales estimées sur les revenus payés */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Charges Sociales
            </h3>
            <p className="text-gray-800 dark:text-gray-200">
              Charges Sociales Estimé ({currentMonthRevenue.paid}€) : {currentMonthRevenue.charges} €
            </p>
            <p className="text-blue-500">
              Revenu Net Estimé : {currentMonthRevenue.net} €
            </p>

            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;