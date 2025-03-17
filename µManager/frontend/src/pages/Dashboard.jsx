import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  // États pour le Dashboard
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
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [cumulativeRevenue, setCumulativeRevenue] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [year, setYear] = useState("");

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  // Récupération des revenus du mois courant (en format padStart pour le mois)
  const fetchCurrentMonthRevenue = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    try {
      const response = await fetch(
        `http://localhost:3000/dashboard/monthly-revenue/${companyId}?year=${currentYear}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, ${response.statusText}`
        );
      }
      const data = await response.json();
      const charges = (data.paid || 0) * 0.24;
      const net = (data.paid || 0) - charges;
      setCurrentMonthRevenue({
        total: data.total || 0,
        paid: data.paid || 0,
        sent: data.pending || 0,
        charges: charges.toFixed(2),
        net: net.toFixed(2),
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des revenus du mois :",
        error
      );
    }
  };

  // Récupération des statistiques des factures via l'endpoint ratio (ancien style)
  const fetchInvoiceStats = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    try {
      const response = await fetch(
        `http://localhost:3000/dashboard/ratio/${companyId}?year=${currentYear}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}`, companyId } }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, ${response.statusText}`
        );
      }
      const data = await response.json();
      setInvoiceStats(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques des factures :",
        error
      );
    }
  };

  // Récupération des années disponibles (endpoint de RevenueTracking ancien)
  const fetchAvailableYears = async () => {
    try {
      const response = await fetch(`http://localhost:3000/revenue/years`, {
        headers: { Authorization: `Bearer ${token}`, companyId },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const currentYear = new Date().getFullYear().toString();
      // Si aucune année n'est renvoyée, on utilise l'année actuelle
      if (data.years && data.years.length > 0) {
        setAvailableYears(data.years);
        setYear(data.years[0]);
      } else {
        setAvailableYears([currentYear]);
        setYear(currentYear);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des années :", error);
      // Fallback : année actuelle
      const currentYear = new Date().getFullYear().toString();
      setAvailableYears([currentYear]);
      setYear(currentYear);
    }
  };

  // Récupération des revenus mensuels (endpoint revenue)
  const fetchMonthlyRevenue = async () => {
    if (!year) return;
    try {
      const response = await fetch(
        `http://localhost:3000/revenue/monthly?year=${year}`,
        { headers: { Authorization: `Bearer ${token}`, companyId } }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, ${response.statusText}`
        );
      }
      const data = await response.json();
      setMonthlyRevenue(data.revenueByMonth);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des revenus mensuels :",
        error
      );
      setMonthlyRevenue(Array(12).fill(0));
    }
  };

  // Récupération des revenus cumulés (endpoint revenue)
  const fetchCumulativeRevenue = async () => {
    if (!year) return;
    try {
      const response = await fetch(
        `http://localhost:3000/revenue/cumulative?year=${year}`,
        { headers: { Authorization: `Bearer ${token}`, companyId } }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, ${response.statusText}`
        );
      }
      const data = await response.json();
      setCumulativeRevenue(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des revenus cumulés :",
        error
      );
      setCumulativeRevenue([]);
    }
  };

  // Récupération des meilleurs clients
  const fetchTopClients = async () => {
    try {
      const response = await fetch(`http://localhost:3000/revenue/top-clients`, {
        headers: { Authorization: `Bearer ${token}`, companyId },
      });
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, ${response.statusText}`
        );
      }
      const data = await response.json();
      setTopClients(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des meilleurs clients :",
        error
      );
      setTopClients([]);
    }
  };

  // Récupération du statut des paiements
  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/revenue/payment-status`,
        { headers: { Authorization: `Bearer ${token}`, companyId } }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPaymentStatus(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du statut des paiements :",
        error
      );
      setPaymentStatus({
        "Non payé": 0,
        "En attente": 0,
        "Payé": 0,
      });
    }
  };

  useEffect(() => {
    fetchCurrentMonthRevenue();
    fetchInvoiceStats();
    fetchAvailableYears();
    fetchTopClients();
    fetchPaymentStatus();
  }, []);

  useEffect(() => {
    if (year) {
      fetchMonthlyRevenue();
      fetchCumulativeRevenue();
    }
  }, [year]);

  // Options et données des graphiques
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#374151",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
          font: { family: "'Inter', sans-serif" },
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.2)"
            : "rgba(209, 213, 219, 0.2)",
        },
      },
      y: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
          font: { family: "'Inter', sans-serif" },
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.2)"
            : "rgba(209, 213, 219, 0.2)",
        },
      },
    },
  };

  const monthlyChartData = {
    labels: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    datasets: [
      {
        label: `CA Mensuel en ${year}`,
        data: monthlyRevenue,
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgb(79, 70, 229)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const cumulativeChartData = {
    labels: cumulativeRevenue.map((row) => `Mois ${row.month}`),
    datasets: [
      {
        label: "Revenus Cumulés (€)",
        data: cumulativeRevenue.map((row) => row.total),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        fill: true,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const paymentStatusData = {
    labels: Object.keys(paymentStatus),
    datasets: [
      {
        data: Object.values(paymentStatus),
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)", // Non payé (Red-500)
          "rgba(249, 115, 22, 0.7)", // En attente (Orange-500)
          "rgba(16, 185, 129, 0.7)", // Payé (Green-500)
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar title="Tableau de bord" />

      <div className="w-11/12 max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Tableau de bord
          </h2>

          {/* Sélection de l'année pour les graphiques */}
          <div className="flex items-center">
            <label
              htmlFor="year"
              className="mr-2 text-gray-700 dark:text-gray-300 font-medium"
            >
              Année :
            </label>
            <div className="relative">
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-1.5 px-3 pr-8 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {availableYears.map((availableYear) => (
                  <option key={availableYear} value={availableYear}>
                    {availableYear}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Section KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenus du mois */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Revenus du mois
              </h3>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium py-1 px-2 rounded-full">
                Ce mois
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payés
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {currentMonthRevenue.paid} €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  En attente
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {currentMonthRevenue.sent} €
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Total
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {currentMonthRevenue.total} €
                </span>
              </div>
            </div>
          </div>

          {/* Factures du mois */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Factures du mois
              </h3>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium py-1 px-2 rounded-full">
                Statut
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payées
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {invoiceStats.Paid || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  En attente
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {invoiceStats.Sent || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Brouillons
                </span>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  {invoiceStats.Draft || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Charges sociales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Charges et revenu net
              </h3>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium py-1 px-2 rounded-full">
                Estimations
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Revenus bruts
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {currentMonthRevenue.paid} €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Charges sociales (24%)
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {currentMonthRevenue.charges} €
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Revenu net
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {currentMonthRevenue.net} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CA Mensuel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                CA Mensuel
              </h3>
            </div>
            <div className="p-6">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Revenus Cumulés */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Revenus Cumulés
              </h3>
            </div>
            <div className="p-6">
              <Line data={cumulativeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Section Clients et statut de paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Meilleurs Clients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Meilleurs Clients
              </h3>
            </div>
            <div className="p-6">
              {topClients && topClients.length > 0 ? (
                <ul className="space-y-3">
                  {topClients.map((client, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {client.firstName ? client.firstName.charAt(0) : ""}
                          {client.lastName ? client.lastName.charAt(0) : ""}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {client.firstName} {client.lastName}
                          </p>
                          {client.company && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {client.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {client.total} €
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </div>

          {/* Taux de Paiement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Taux de Paiement
              </h3>
            </div>
            <div className="p-6 flex justify-center items-center">
              <div className="w-64 h-64">
                <Pie
                  data={paymentStatusData}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: true,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            Actions rapides
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => (window.location.href = "/create-invoice")}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-full transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nouvelle facture</span>
            </button>

            <button
              onClick={() => (window.location.href = "/add-client")}
              className="flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-2 px-4 rounded-full transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nouveau client</span>
            </button>

            <button
              onClick={() => (window.location.href = "/add-contract")}
              className="flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-2 px-4 rounded-full transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nouveau contrat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;