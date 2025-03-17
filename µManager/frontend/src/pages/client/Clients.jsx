import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function Clients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");
      try {
        const response = await fetch(
          `http://localhost:3000/clients/company/${companyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setClients(data);
          setFilteredClients(data);
        } else if (response.status === 404) {
          // Si 404, l'entreprise n'a pas de clients, c'est normal
          setClients([]);
          setFilteredClients([]);
        } else {
          console.error(`Erreur serveur: ${response.status}`);
          addToast("error", "Erreur serveur, veuillez réessayer plus tard.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau, veuillez réessayer.");
      }
    };
    fetchClients();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        (client.clientCompany &&
          client.clientCompany.toLowerCase().includes(query))
    );
    setFilteredClients(filtered);
  };

  const toggleClientDetails = (clientId) => {
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));
  };

  const handleAddClient = () => {
    navigate("/add-client");
  };

  const handleDeleteClient = async (clientId) => {
    const token = localStorage.getItem("token");
    addToast("confirm", "Voulez-vous vraiment supprimer ce client ?", null, async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/clients/${clientId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setClients((prev) => prev.filter((client) => client.clientId !== clientId));
          setFilteredClients((prev) => prev.filter((client) => client.clientId !== clientId));
          addToast("success", "Client supprimé avec succès !");
        } else {
          console.error(`Erreur lors de la suppression du client: ${response.status}`);
          addToast("error", "Erreur lors de la suppression du client.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau, veuillez réessayer.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar title="Clients" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête avec titre et bouton d'ajout */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des clients</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez vos clients et leurs informations</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleAddClient}
              className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter un client
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par nom, prénom ou entreprise..."
              className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full py-3 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des clients */}
        <div className="grid grid-cols-1 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client.clientId}
                className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleClientDetails(client.clientId)}
                    >
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {client.name} {client.lastName}
                          </h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-5 h-5 ml-2 text-gray-500 dark:text-gray-300 transform transition-transform duration-300 ${
                              expandedClientId === client.clientId ? "rotate-180" : ""
                            }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-gray-500 dark:text-gray-300 mt-1">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {client.phone}
                          </div>
                          {client.clientCompany && (
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {client.clientCompany}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-client/${client.clientId}`);
                        }}
                        className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-1.5 px-4 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.clientId);
                        }}
                        className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-1.5 px-4 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                  
                  {/* Détails supplémentaires lorsqu'ils sont développés */}
                  {expandedClientId === client.clientId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">Adresse:</span>
                          </div>
                          <p className="pl-7 mb-3">{client.address || "Non spécifiée"}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-medium">RIB:</span>
                          </div>
                          <p className="pl-7 mb-3 font-mono">{client.clientRib || "Non spécifié"}</p>
                        </div>
                        
                        {client.clientCompany && (
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="font-medium">Entreprise:</span>
                            </div>
                            <p className="pl-7">{client.clientCompany}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Aucun client trouvé</p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Vous n'avez pas encore de clients ou aucun ne correspond à votre recherche.</p>
              <button
                onClick={handleAddClient}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter votre premier client
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clients;