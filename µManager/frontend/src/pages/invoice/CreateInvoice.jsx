import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function CreateInvoice() {
    const [clients, setClients] = useState([]);
    const [lines, setLines] = useState([
        { description: "", quantity: "1", unitPrice: "0.00" },
    ]);
    const [selectedClient, setSelectedClient] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId");

            try {
                const response = await fetch(
                    `http://localhost:3000/clients/company/${companyId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    console.error("Erreur lors de la récupération des clients.");
                    addToast("error", "Erreur lors de la récupération des clients");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                addToast("error", "Erreur réseau. Veuillez réessayer.");
            }
        };

        fetchClients();
    }, [addToast]);

    const handleAddLine = () => {
        setLines([...lines, { description: "", quantity: "1", unitPrice: "0.00" }]);
    };

    const handleRemoveLine = (index) => {
        const newLines = [...lines];
        newLines.splice(index, 1);
        setLines(newLines);
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...lines];
        newLines[index][field] = value;
        setLines(newLines);
    };

    const calculateSubtotal = () => {
        return lines.reduce((total, line) => {
            const quantity = parseFloat(line.quantity) || 0;
            const unitPrice = parseFloat(line.unitPrice) || 0;
            return total + quantity * unitPrice;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!selectedClient) {
            addToast("error", "Veuillez sélectionner un client");
            setIsLoading(false);
            return;
        }

        if (lines.length === 0 || lines.some(line => !line.description.trim())) {
            addToast("error", "Veuillez ajouter au moins une ligne avec une description");
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId");

        try {
            const response = await fetch("http://localhost:3000/invoices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientId: selectedClient,
                    companyId,
                    issueDate,
                    dueDate,
                    lines: lines.map(line => ({
                        description: line.description,
                        quantity: parseFloat(line.quantity),
                        unitPrice: parseFloat(line.unitPrice)
                    })),
                    status: "Draft"
                }),
            });

            if (response.ok) {
                const data = await response.json();
                addToast("success", "Facture créée avec succès");
                navigate(`/invoices`);
            } else {
                const error = await response.json();
                console.error("Erreur lors de la création de la facture :", error.message);
                addToast("error", `Erreur : ${error.message || "Création de facture impossible"}`);
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            addToast("error", "Erreur réseau. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar title="Créer une facture" />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Créer une nouvelle facture</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Ajoutez les détails de la facture et les lignes de facturation
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section informations client et dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                    Client
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <select
                                        value={selectedClient}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                        required
                                        className="w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 appearance-none"
                                    >
                                        <option value="">Sélectionnez un client</option>
                                        {clients.map((client) => (
                                            <option key={client.clientId} value={client.clientId}>
                                                {client.name} {client.lastName} {client.clientCompany && `- ${client.clientCompany}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-1 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                        Date d'émission
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="date"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                        Date d'échéance
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section lignes de facturation */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Lignes de facturation
                            </h2>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                                            <th className="pb-3 font-medium">Description</th>
                                            <th className="pb-3 font-medium w-24">Quantité</th>
                                            <th className="pb-3 font-medium w-32">Prix unitaire</th>
                                            <th className="pb-3 font-medium w-28">Total</th>
                                            <th className="pb-3 font-medium w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, index) => {
                                            const lineTotal = (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0);
                                            
                                            return (
                                                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                                    <td className="py-2">
                                                        <input
                                                            type="text"
                                                            value={line.description}
                                                            onChange={(e) => handleLineChange(index, "description", e.target.value)}
                                                            placeholder="Description du produit ou service"
                                                            required
                                                            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                        />
                                                    </td>
                                                    <td className="py-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineChange(index, "quantity", e.target.value)}
                                                            required
                                                            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                        />
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 dark:text-gray-400">€</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={line.unitPrice}
                                                                onChange={(e) => handleLineChange(index, "unitPrice", e.target.value)}
                                                                required
                                                                className="w-full pl-6 p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-gray-700 dark:text-gray-300 font-medium">
                                                        {lineTotal.toFixed(2)} €
                                                    </td>
                                                    <td className="py-2">
                                                        {lines.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveLine(index)}
                                                                className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={handleAddLine}
                                    className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Ajouter une ligne
                                </button>
                            </div>
                            
                            {/* Résumé des montants */}
                            <div className="mt-6 flex flex-col items-end">
                                <div className="w-full max-w-xs space-y-2">
                                    
                                    <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white  pt-2">
                                        <span>Total:</span>
                                        <span>{calculateTotal().toFixed(2)} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons de soumission */}
                        <div className="pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-gray-200 dark:border-gray-600 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/invoices")}
                                className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 px-5 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Annuler
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2.5 px-6 font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Créer la facture
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateInvoice;