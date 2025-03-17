import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function EditInvoice() {
    const { invoiceId } = useParams(); // Récupère l'ID de la facture depuis l'URL
    const [clients, setClients] = useState([]);
    const [lines, setLines] = useState([]);
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

        const fetchInvoice = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(
                    `http://localhost:3000/invoices/${invoiceId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.ok) {
                    const data = await response.json();
                    setSelectedClient(data.client.clientId);
                    setIssueDate(data.issueDate);
                    setDueDate(data.dueDate);
                    setLines(data.lines.map((line) => ({
                        description: line.description,
                        quantity: line.quantity.toString(),
                        unitPrice: parseFloat(line.unitPrice || 0).toFixed(2), // Assure que unitPrice est un nombre avant d'utiliser toFixed
                    })));
                } else {
                    console.error("Erreur lors de la récupération de la facture.");
                    addToast("error", "Erreur lors de la récupération de la facture.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                addToast("error", "Erreur réseau, veuillez réessayer.");
            }
        };

        fetchClients();
        fetchInvoice();
    }, [invoiceId]);

    const validateQuantity = (value) => {
        return value.replace(/[^0-9.,]/g, "").replace(/[,\.](?=.*[,\.])/g, "");
    };

    const formatQuantityOnBlur = (value) => {
        return value.replace(/[,\.]$/, "");
    };

    const validateUnitPrice = (value) => {
        return value.replace(/[^0-9.,]/g, "").replace(/[,\.](?=.*[,\.])/g, "");
    };

    const formatUnitPriceOnBlur = (value) => {
        if (!value.includes(".")) {
            return `${value}.00`;
        }
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
    
        const total = lines.reduce(
            (sum, line) =>
                sum + parseFloat(line.quantity || 0) * parseFloat(line.unitPrice || 0),
            0
        );
    
        try {
            // Mettre à jour les lignes de facture
            const lineResponse = await fetch(
                `http://localhost:3000/invoices/${invoiceId}/lines`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ lines }),
                }
            );
    
            if (!lineResponse.ok) {
                console.error("Erreur lors de la mise à jour des lignes.");
                addToast("error", "Erreur lors de la mise à jour des lignes.");
                return;
            }
    
            // Mettre à jour les détails de la facture
            const invoiceResponse = await fetch(
                `http://localhost:3000/invoices/${invoiceId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        clientId: selectedClient,
                        issueDate,
                        dueDate,
                        status: "Draft",
                        total,
                    }),
                }
            );
    
            if (invoiceResponse.ok) {
                addToast("success", "Facture mise à jour avec succès !");
                navigate("/invoices");
            } else {
                console.error("Erreur lors de la mise à jour de la facture.");
                addToast("error", "Erreur lors de la mise à jour de la facture.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            addToast("error", "Erreur réseau, veuillez réessayer.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <Navbar title="Modifier une facture" />

            <div className="container mx-auto mt-10 p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Modifier la facture
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
                        Mettre à jour la facture
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditInvoice;