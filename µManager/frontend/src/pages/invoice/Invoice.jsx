import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";


function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const navigate = useNavigate();
    const { addToast } = useToast();


    useEffect(() => {
        const fetchInvoices = async () => {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId");

            try {
                const response = await fetch(
                    `http://localhost:3000/invoices/company/${companyId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setInvoices(sortByDate(data, "desc"));
                } else {
                    console.error("Erreur lors de la récupération des factures.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
            }
        };

        fetchInvoices();
    }, []);

    const sortByDate = (invoices, order) => {
        return [...invoices].sort((a, b) => {
            const dateA = new Date(a.issueDate);
            const dateB = new Date(b.issueDate);
            return order === "asc" ? dateA - dateB : dateB - dateA;
        });
    };

    const handleSortChange = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);
        setInvoices((prevInvoices) => sortByDate(prevInvoices, newOrder));
    };

    const updateStatus = async (invoiceId, newStatus) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setInvoices((prevInvoices) =>
                    prevInvoices.map((invoice) =>
                        invoice.invoiceId === invoiceId ? { ...invoice, status: newStatus } : invoice
                    )
                );
            } else {
                const errorData = await response.json();
                console.error("Erreur lors de la mise à jour du statut :", errorData.message || response.statusText);
                addToast("error", "Erreur lors de la mise à jour du statut.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            addToast("error", "Erreur réseau, veuillez réessayer.");
        }
    };

    const deleteInvoice = async (invoiceId) => {
        const token = localStorage.getItem("token");

        addToast("confirm", "Voulez-vous vraiment supprimer cette facture ?", null, async () => {

        try {
            const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setInvoices((prevInvoices) =>
                    prevInvoices.filter((invoice) => invoice.invoiceId !== invoiceId)
                );
                addToast("success", "Facture supprimée avec succès !");
            } else {
                console.error("Erreur lors de la suppression de la facture.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
        }
    });
    };

    const handleEditInvoice = (invoiceId) => {
        navigate(`/edit-invoice/${invoiceId}`);
    };

    const handleViewInvoice = (invoiceId) => {
        navigate(`/view-invoice/${invoiceId}`);
    };

    const getTextColor = (status) => {
        switch (status) {
            case "Draft":
            case "Sent":
                return "text-orange-600";
            case "Paid":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const availableYears = Array.from(
        new Set(invoices.map((i) => new Date(i.issueDate).getFullYear()))
    ).sort();

    const filteredInvoices = invoices.filter((invoice) => {
        const fullName = `${invoice.client.name} ${invoice.client.lastName}`.toLowerCase();
        const clientCompany = invoice.client.clientCompany
            ? invoice.client.clientCompany.toLowerCase()
            : "";
        const search = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(search) || clientCompany.includes(search);
        const year = new Date(invoice.issueDate).getFullYear();
        const matchesYear = selectedYear === "all" || year.toString() === selectedYear;
        return matchesSearch && matchesYear;
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <Navbar title="Factures" />

            <div className="container mx-auto mt-10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Liste des factures
                    </h2>
                    <button
                        onClick={() => navigate("/create-invoice")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
                    >
                        Créer une facture
                    </button>
                </div>

                {/* Section alignée pour la recherche, le filtre par année et le tri par date */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Rechercher par client..."
                            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        />
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="appearance-none rounded-md px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-gray-200"
                        >
                            <option className="text-gray-800 dark:text-gray-200" value="all">
                                Toutes les années
                            </option>
                            {availableYears.map((year) => (
                                <option key={year} className="text-gray-800 dark:text-gray-200" value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 9.75L12 13.5l3.75-3.75"
                            />
                        </svg>
                    </div>
                    <button
                        onClick={handleSortChange}
                        className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                        Trier par date : {sortOrder === "asc" ? "Croissant" : "Décroissant"}
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                    {filteredInvoices.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredInvoices.map((invoice) => (
                                <li
                                    key={invoice.invoiceId}
                                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-800 dark:text-gray-200">
                                                <strong>Date :</strong>{" "}
                                                {new Date(invoice.issueDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-gray-800 dark:text-gray-200">
                                                <strong>Client :</strong> {invoice.client.name} {invoice.client.lastName}
                                                {invoice.client.clientCompany && (
                                                    <> - {invoice.client.clientCompany}</>
                                                )}
                                            </p>
                                            <p className="text-gray-800 dark:text-gray-200">
                                                <strong>Montant :</strong> {invoice.total} €
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <strong className="mr-2 text-gray-800 dark:text-gray-200">
                                                    Statut :
                                                </strong>
                                                <div className="relative">
                                                    <select
                                                        value={invoice.status}
                                                        onChange={(e) =>
                                                            updateStatus(invoice.invoiceId, e.target.value)
                                                        }
                                                        className={`appearance-none rounded-md px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-100 dark:bg-gray-800 ${getTextColor(invoice.status)}`}
                                                    >
                                                        <option className="text-orange-600" value="Draft">
                                                            Brouillon
                                                        </option>
                                                        <option className="text-orange-600" value="Sent">
                                                            Envoyée - En attente
                                                        </option>
                                                        <option className="text-green-600" value="Paid">
                                                            Payée
                                                        </option>
                                                    </select>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5 absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8.25 9.75L12 13.5l3.75-3.75"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewInvoice(invoice.invoiceId)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
                                            >
                                                Consulter
                                            </button>
                                            {invoice.status === "Draft" && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditInvoice(invoice.invoiceId)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => deleteInvoice(invoice.invoiceId)}
                                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200">
                            Aucune facture trouvée pour cette entreprise.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Invoices;