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
                    addToast("error", "Erreur lors de la récupération des clients.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                addToast("error", "Erreur réseau, veuillez réessayer.");
            }
        };

        fetchClients();
    }, []);

    const validateQuantity = (value) => {
        // Permet uniquement les chiffres, un seul point ou une seule virgule
        return value.replace(/[^0-9.,]/g, "").replace(/[,\.](?=.*[,\.])/g, "");
    };

    const formatQuantityOnBlur = (value) => {
        // Si la valeur se termine par un point ou une virgule, on les supprime
        return value.replace(/[,\.]$/, "");
    };

    const validateUnitPrice = (value) => {
        // Permet uniquement les chiffres, un seul point ou une seule virgule
        return value.replace(/[^0-9.,]/g, "").replace(/[,\.](?=.*[,\.])/g, "");
    };

    const formatUnitPriceOnBlur = (value) => {
        // Ajoute .00 si aucune décimale n'est présente
        if (!value.includes(".")) {
            return `${value}.00`;
        }
        // Ajoute un seul chiffre après le point si nécessaire
        const parts = value.split(".");
        if (parts[1].length === 1) {
            return `${parts[0]}.${parts[1]}0`;
        }
        return value;
    };

    const handleLineChange = (index, field, value) => {
        const updatedLines = [...lines];
        updatedLines[index][field] =
            field === "quantity"
                ? validateQuantity(value)
                : field === "unitPrice"
                ? validateUnitPrice(value)
                : value;
        setLines(updatedLines);
    };

    const handleBlur = (index, field) => {
        const updatedLines = [...lines];
        if (field === "unitPrice") {
            updatedLines[index][field] = formatUnitPriceOnBlur(
                updatedLines[index][field]
            );
        }
        if (field === "quantity") {
            updatedLines[index][field] = formatQuantityOnBlur(
                updatedLines[index][field]
            );
        }
        setLines(updatedLines);
    };

    const handleAddLine = () => {
        setLines([...lines, { description: "", quantity: "1", unitPrice: "0.00" }]);
    };

    const handleRemoveLine = (index) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId");

        const total = lines.reduce(
            (sum, line) =>
                sum + parseFloat(line.quantity || 0) * parseFloat(line.unitPrice || 0),
            0
        );

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
                    lines,
                    issueDate,
                    dueDate,
                    status: "Draft",
                    total,
                }),
            });

            if (response.ok) {
                addToast("success", "Facture créée avec succès !");
                navigate("/invoices");
            } else {
                console.error("Erreur lors de la création de la facture.");
                addToast("error", "Erreur lors de la création de la facture.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            addToast("error", "Erreur réseau lors de la création de la facture.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <Navbar title="Facture" />

            <div className="container mx-auto mt-10 p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Créer une nouvelle facture
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
                >
                    <div>
                        <label className="block text-gray-800 dark:text-gray-200 mb-2">
                            Client
                        </label>
                        <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            required
                            className="appearance-none w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionnez un client</option>
                            {clients.map((client) => (
                                <option key={client.clientId} value={client.clientId}>
                                    {client.name} {client.lastName}
                                    {client.clientCompany && ` - ${client.clientCompany}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-800 dark:text-gray-200 mb-2">
                            Date d'émission
                        </label>
                        <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 dark:text-gray-200 mb-2">
                            Date d'échéance
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Lignes de facture
                        </h3>
                        {lines.map((line, index) => (
                            <div
                                key={index}
                                className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm"
                            >
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={line.description}
                                    onChange={(e) =>
                                        handleLineChange(index, "description", e.target.value)
                                    }
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                                />
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                            Quantité
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Quantité"
                                            value={line.quantity}
                                            onChange={(e) =>
                                                handleLineChange(index, "quantity", e.target.value)
                                            }
                                            onBlur={() => handleBlur(index, "quantity")}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                            Prix unitaire (€)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Prix unitaire"
                                            value={line.unitPrice}
                                            onChange={(e) =>
                                                handleLineChange(index, "unitPrice", e.target.value)
                                            }
                                            onBlur={() => handleBlur(index, "unitPrice")}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLine(index)}
                                        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-md"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddLine}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
                        >
                            Ajouter une ligne
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-md transition"
                    >
                        Créer la facture
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateInvoice;