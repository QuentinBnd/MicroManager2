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
          setIssueDate(
            data.issueDate
              ? new Date(data.issueDate).toISOString().split("T")[0]
              : ""
          );
          setDueDate(
            data.dueDate
              ? new Date(data.dueDate).toISOString().split("T")[0]
              : ""
          );
          setLines(
            data.lines.map((line) => ({
              description: line.description,
              quantity: line.quantity.toString(),
              unitPrice: parseFloat(line.unitPrice || 0).toFixed(2),
            }))
          );
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
  }, [invoiceId, addToast]);

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
        navigate(`/view-invoice/${invoiceId}`);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar title="Modifier une facture" />

      <div className="w-11/12 max-w-7xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Modifier la facture #{invoiceId}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Mettez à jour les détails de la facture et les lignes de facturation
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden p-6"
        >
          {/* Section client et dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium">
                Client
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
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
                      {client.name} {client.lastName}
                      {client.clientCompany && ` - ${client.clientCompany}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

            <div>
              <label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium">
                Date d'émission
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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
              <label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium">
                Date d'échéance
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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

          {/* Lignes de facture */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Lignes de facture
            </h3>
            {lines.map((line, index) => {
              const lineTotal =
                (parseFloat(line.quantity) || 0) *
                (parseFloat(line.unitPrice) || 0);

              return (
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
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium">
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
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium">
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
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 font-medium"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Ajouter une ligne
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Total:</span>
                  <span>
                    {lines
                      .reduce(
                        (sum, line) =>
                          sum +
                          parseFloat(line.quantity || 0) *
                            parseFloat(line.unitPrice || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons de soumission */}
          <div className="pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-gray-200 dark:border-gray-600 mt-6">
            <button
              type="button"
              onClick={() => navigate(`/view-invoice/${invoiceId}`)}
              className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 px-5 font-medium"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Annuler
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2.5 px-6 font-medium"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mettre à jour la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditInvoice;