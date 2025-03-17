import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchContracts = async () => {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);

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
          setFilteredContracts(data);
        } else if (response.status === 404) {
          // L'entreprise n'a pas encore de contrats, c'est normal
          setContracts([]);
          setFilteredContracts([]);
          console.log("Aucun contrat trouvé pour cette entreprise.");
        } else {
          // Dans ce cas, c'est une vraie erreur
          addToast("error", "Erreur lors de la récupération des contrats");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    // On vérifie qu'on a bien un companyId avant de faire la requête
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      fetchContracts();
    } else {
      setIsLoading(false);
    }
    
  }, [addToast]); // On garde addToast comme dépendance pour éviter les warning React

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = contracts.filter(
      (contract) =>
        contract.description.toLowerCase().includes(query) ||
        (contract.endDate && contract.endDate.includes(query)) ||
        (contract.client &&
          `${contract.client.name} ${contract.client.lastName}`
            .toLowerCase()
            .includes(query))
    );
    setFilteredContracts(filtered);
  };

  // Reste du code inchangé...
  const handleAddContract = () => {
    navigate("/add-contract");
  };

  const handleDownloadContract = async (contractId) => {
    const contract = contracts.find((c) => c.contractId === contractId);

    if (!contract || !contract.pdfUrl) {
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
      
      addToast("success", "Téléchargement du contrat réussi");
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
        addToast("success", "Contrat supprimé avec succès");
      } else {
        addToast("error", "Erreur lors de la suppression du contrat");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      addToast("error", "Erreur réseau. Veuillez réessayer.");
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
        addToast("success", "Statut du contrat mis à jour");
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

  // Fonction pour obtenir la couleur du statut
  const getStatusTextColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 dark:text-green-400";
      case "Ended":
        return "text-blue-600 dark:text-blue-400";
      case "Archived":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar title="Contrats" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des contrats</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez tous vos contrats en un seul endroit</p>
          </div>

          <button
            onClick={handleAddContract}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2.5 px-5 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau contrat
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par description, date ou client..."
              className="w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
            {filteredContracts.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredContracts.map((contract) => (
                  <li
                    key={contract.contractId}
                    className="p-5 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-150"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          {contract.description}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Expiration :</span>{" "}
                            {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}
                          </p>
                          {contract.client && (
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Client :</span>{" "}
                              {contract.client.name}{" "}
                              {contract.client.lastName}{" "}
                              {contract.client.clientCompany && `- ${contract.client.clientCompany}`}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                              Statut :
                            </span>
                            <div className="relative">
                              <select
                                value={contract.status}
                                onChange={(e) =>
                                  updateStatus(contract.contractId, e.target.value)
                                }
                                className={`appearance-none rounded-full px-3 py-1 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600 transition bg-white dark:bg-gray-800 ${getStatusTextColor(
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
                                className="w-4 h-4 absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
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
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadContract(contract.contractId)}
                          className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 text-sm font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Télécharger
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract.contractId)}
                          className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-4 text-sm font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
                  Aucun contrat trouvé
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {searchQuery ? "Modifiez vos critères de recherche" : "Créez votre premier contrat en cliquant sur 'Nouveau contrat'"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractList;