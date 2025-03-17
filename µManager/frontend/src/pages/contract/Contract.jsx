import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]); // Liste filtrée
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchContracts = async () => {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");

      try {
        const response = await fetch(
          `http://localhost:3000/contracts/company/${companyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setContracts(data);
          setFilteredContracts(data); // Initialisation de la liste filtrée
        } else {
          console.error("Erreur lors de la récupération des contrats.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    fetchContracts();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = contracts.filter(
      (contract) =>
        contract.description.toLowerCase().includes(query) ||
        contract.endDate.includes(query) || // Vérifie la date au format YYYY-MM-DD
        (contract.client &&
          `${contract.client.name} ${contract.client.lastName}`
            .toLowerCase()
            .includes(query))
    );
    setFilteredContracts(filtered);
  };

  const handleAddContract = () => {
    navigate("/add-contract");
  };

  const handleDownloadContract = async (contractId) => {
    const contract = contracts.find((c) => c.contractId === contractId);

    if (!contract || !contract.pdfUrl) {
      console.error("URL du contrat introuvable.");
      addToast("error", "Impossible de télécharger ce contrat.");
      return;
    }

    try {
      const byteCharacters = atob(contract.pdfUrl);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `contract_${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement du contrat :", error);
      addToast("error", "Erreur lors du téléchargement du contrat.");
    }
  };

  const handleDeleteContract = async (contractId) => {
    addToast("confirm", "Voulez-vous vraiment supprimer ce contrat ?", null, async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/contracts/${contractId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        setContracts((prevContracts) =>
          prevContracts.filter((contract) => contract.contractId !== contractId)
        );
        setFilteredContracts((prevContracts) =>
          prevContracts.filter((contract) => contract.contractId !== contractId)
        );
      } else {
        console.error("Erreur lors de la suppression du contrat.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
    });
  };

  const updateStatus = async (contractId, newStatus) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/contracts/${contractId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.contractId === contractId
              ? { ...contract, status: newStatus }
              : contract
          )
        );
        setFilteredContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.contractId === contractId
              ? { ...contract, status: newStatus }
              : contract
          )
        );
      } else {
        const errorData = await response.json();
        console.error(
          "Erreur lors de la mise à jour du statut :",
          errorData.message || response.statusText
        );
        addToast("error", `Erreur : ${errorData.message || "Mise à jour impossible."}`);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      addToast("error", "Erreur réseau. Veuillez réessayer.");
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Ended":
        return "text-red-600";
      case "Archived":
        return "text-gray-500";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar title="Contrats" />

      <div className="container mx-auto mt-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Liste des contrats
          </h2>
          <button
            onClick={handleAddContract}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Ajouter un contrat
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Rechercher par description, date ou client..."
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          {filteredContracts.length > 0 ? (
            <ul className="space-y-4">
              {filteredContracts.map((contract) => (
                <li
                  key={contract.contractId}
                  className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {contract.description}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expiration :{" "}
                        {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                      {contract.client && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Client : {contract.client.name}{" "}
                          {contract.client.lastName} -{" "}
                          {contract.client.clientCompany}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <strong className="mr-2 text-gray-800 dark:text-gray-200">
                          Statut :
                        </strong>
                        <div className="relative">
                          <select
                            value={contract.status}
                            onChange={(e) =>
                              updateStatus(contract.contractId, e.target.value)
                            }
                            className={`appearance-none rounded-md px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-100 dark:bg-gray-800 ${getStatusTextColor(
                              contract.status
                            )}`}
                          >
                            <option value="Active">Actif</option>
                            <option value="Ended">Terminé</option>
                            <option value="Archived">Archivé</option>
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
                        onClick={() => handleDownloadContract(contract.contractId)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition"
                      >
                        Télécharger
                      </button>
                      <button
                        onClick={() => handleDeleteContract(contract.contractId)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-800 dark:text-gray-200">
              Aucun contrat trouvé pour cette entreprise.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractList;