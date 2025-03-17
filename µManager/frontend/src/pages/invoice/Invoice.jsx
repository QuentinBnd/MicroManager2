import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); // Nouvel état pour le filtre par statut
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

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
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

    const getStatusInfo = (status) => {
        switch (status) {
            case "Draft":
                return {
                    color: "text-amber-600 dark:text-amber-400",
                    bgColor: "bg-amber-100 dark:bg-amber-900/30",
                    text: "Brouillon"
                };
            case "Sent":
                return {
                    color: "text-blue-600 dark:text-blue-400",
                    bgColor: "bg-blue-100 dark:bg-blue-900/30",
                    text: "Envoyée - En attente"
                };
            case "Paid":
                return {
                    color: "text-green-600 dark:text-green-400",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    text: "Payée"
                };
            default:
                return {
                    color: "text-gray-600 dark:text-gray-400",
                    bgColor: "bg-gray-100 dark:bg-gray-900/30",
                    text: "Statut inconnu"
                };
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
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
        return matchesSearch && matchesYear && matchesStatus;
    });

    // Données pour l'affichage des badges de statut dans le filtre
    const statusFilters = [
        { value: "all", text: "Tous les statuts" },
        { value: "Draft", text: "Brouillons", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
        { value: "Sent", text: "Envoyées - En attente", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
        { value: "Paid", text: "Payées", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" }
    ];

    // Stats du nombre de factures par statut
    const stats = {
        all: filteredInvoices.length,
        Draft: filteredInvoices.filter(i => i.status === "Draft").length,
        Sent: filteredInvoices.filter(i => i.status === "Sent").length,
        Paid: filteredInvoices.filter(i => i.status === "Paid").length
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar title="Factures" />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* En-tête avec titre et bouton d'ajout */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des factures</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez vos factures et suivez vos paiements</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => navigate("/create-invoice")}
                            className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Créer une facture
                        </button>
                    </div>
                </div>

                {/* Filtres de statut */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setStatusFilter(status.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                    statusFilter === status.value 
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-500 shadow-sm' 
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                } border`}
                            >
                                {status.value !== 'all' && (
                                    <span className={`inline-block w-3 h-3 rounded-full ${status.bgColor}`}></span>
                                )}
                                {status.text}
                                <span className="inline-flex items-center justify-center ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {stats[status.value] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barre de filtres et recherche */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Rechercher par client..."
                            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full py-3 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="appearance-none w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-full py-3 px-4 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Toutes les années</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={handleSortChange}
                        className="flex items-center justify-center gap-2 rounded-full shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === "asc" ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"} />
                        </svg>
                        Trier par date : {sortOrder === "asc" ? "Croissant" : "Décroissant"}
                    </button>
                </div>

                {/* Liste des factures */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => {
                            const statusInfo = getStatusInfo(invoice.status);
                            return (
                                <div
                                    key={invoice.invoiceId}
                                    className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                            <div className="mb-4 sm:mb-0">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    Facture #{invoice.invoiceId}
                                                    <span className={`text-sm px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                                    Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                                {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">
                                                        {invoice.client.name} {invoice.client.lastName}
                                                    </p>
                                                    {invoice.client.clientCompany && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                                            {invoice.client.clientCompany}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <div className="relative mr-4">
                                                    <select
                                                        value={invoice.status}
                                                        onChange={(e) => updateStatus(invoice.invoiceId, e.target.value)}
                                                        className={`appearance-none rounded-full px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition border ${statusInfo.bgColor} ${statusInfo.color} border-gray-200 dark:border-gray-600`}
                                                    >
                                                        <option value="Draft">Brouillon</option>
                                                        <option value="Sent">Envoyée - En attente</option>
                                                        <option value="Paid">Payée</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewInvoice(invoice.invoiceId)}
                                                        className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-1.5 px-4 text-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Consulter
                                                    </button>
                                                    {invoice.status === "Draft" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditInvoice(invoice.invoiceId)}
                                                                className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-1.5 px-4 text-sm"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                                Modifier
                                                            </button>
                                                            <button
                                                                onClick={() => deleteInvoice(invoice.invoiceId)}
                                                                className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-1.5 px-4 text-sm"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Supprimer
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Aucune facture trouvée</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Vous n'avez pas encore de factures ou aucune ne correspond à votre recherche.</p>
                            <button
                                onClick={() => navigate("/create-invoice")}
                                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Créer votre première facture
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Invoices;