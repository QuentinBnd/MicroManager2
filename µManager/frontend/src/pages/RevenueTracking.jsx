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

function RevenueTracking() {
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [cumulativeRevenue, setCumulativeRevenue] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({});
    const [availableYears, setAvailableYears] = useState([]);
    const [year, setYear] = useState("");

    const fetchAvailableYears = async () => {
        try {
            const response = await fetch(`http://localhost:3000/revenue/years`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    companyId: localStorage.getItem("companyId"),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAvailableYears(data.years);

            if (data.years.length > 0) {
                setYear(data.years[0]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des années :", error);
        }
    };

    const fetchMonthlyRevenue = async () => {
        if (!year) return;

        try {
            const response = await fetch(
                `http://localhost:3000/revenue/monthly?year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        companyId: localStorage.getItem("companyId"),
                    },
                }
            );

            const data = await response.json();
            setMonthlyRevenue(data.revenueByMonth);
        } catch (error) {
            console.error("Erreur lors de la récupération des revenus mensuels :", error);
        }
    };

    const fetchCumulativeRevenue = async () => {
        if (!year) return;

        try {
            const response = await fetch(
                `http://localhost:3000/revenue/cumulative?year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        companyId: localStorage.getItem("companyId"),
                    },
                }
            );

            const data = await response.json();
            setCumulativeRevenue(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des revenus cumulés :", error);
        }
    };

    const fetchTopClients = async () => {
        try {
            const response = await fetch(`http://localhost:3000/revenue/top-clients`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    companyId: localStorage.getItem("companyId"),
                },
            });

            const data = await response.json();
            setTopClients(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des meilleurs clients :", error);
        }
    };

    const fetchPaymentStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3000/revenue/payment-status`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    companyId: localStorage.getItem("companyId"),
                },
            });

            const data = await response.json();
            setPaymentStatus(data);
        } catch (error) {
            console.error("Erreur lors de la récupération du taux de paiement :", error);
        }
    };

    useEffect(() => {
        fetchAvailableYears();
    }, []);

    useEffect(() => {
        fetchMonthlyRevenue();
        fetchCumulativeRevenue();
    }, [year]);

    useEffect(() => {
        fetchTopClients();
        fetchPaymentStatus();
    }, []);

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
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    const cumulativeChartData = {
        labels: cumulativeRevenue.map((row) => `Mois ${row.month}`),
        datasets: [
            {
                label: "Revenus Cumulés (€)",
                data: cumulativeRevenue.map((row) => row.total),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
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
                backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
                borderColor: "#fff",
            },
        ],
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <Navbar title="Suivi du CA" />
            <div className="container mx-auto mt-10 p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Suivi du Chiffre d'Affaires
                </h2>

                {/* Sélection de l'année */}
                <div className="mb-6">
                    <label htmlFor="year" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
                        Année :
                    </label>
                    <div className="relative w-48">
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="block appearance-none w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableYears.map((availableYear) => (
                                <option key={availableYear} value={availableYear}>
                                    {availableYear}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Graphique CA Mensuel */}
                <div className="mb-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            CA Mensuel
                        </h3>
                        <Bar data={monthlyChartData} />
                    </div>
                </div>

                {/* Graphique Revenus Cumulés */}
                <div className="mb-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Revenus Cumulés
                        </h3>
                        <Line data={cumulativeChartData} />
                    </div>
                </div>

                {/* Top Clients et Taux de Paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Meilleurs Clients
                        </h3>
                        <ul className="list-disc pl-5 text-gray-800 dark:text-gray-200">
                            {topClients.map((client, index) => (
                                <li key={index}>
                                    {client.firstName} {client.lastName}{" "}
                                    {client.company ? `(${client.company})` : ""}: {client.total} €
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Taux de Paiement
                        </h3>
                        <Pie data={paymentStatusData} options={{ maintainAspectRatio: true }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevenueTracking;