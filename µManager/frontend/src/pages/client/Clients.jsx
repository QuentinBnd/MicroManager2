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
  }, [addToast]);

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
          console.error("Erreur lors de la suppression du client.");
          addToast("error", "Erreur lors de la suppression du client.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau, veuillez réessayer.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar title="Clients" />

      <div className="container mx-auto mt-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Liste des clients
          </h2>
          <button
            onClick={handleAddClient}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Ajouter un client
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Rechercher par nom, prénom ou entreprise..."
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          {filteredClients.length > 0 ? (
            <ul className="space-y-4">
              {filteredClients.map((client) => (
                <li
                  key={client.clientId}
                  className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md cursor-pointer"
                  onClick={() => toggleClientDetails(client.clientId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-6 h-6 text-gray-800 dark:text-gray-200 transform transition-transform duration-300 ${
                          expandedClientId === client.clientId ? "rotate-90" : ""
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {client.name} {client.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {client.email} | {client.phone}
                        </p>
                        {client.clientCompany && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Entreprise : {client.clientCompany}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-client/${client.clientId}`);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.clientId);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {expandedClientId === client.clientId && (
                    <div className="mt-4 text-gray-800 dark:text-gray-200">
                      <p>
                        <strong>Adresse :</strong> {client.address}
                      </p>
                      <p>
                        <strong>RIB :</strong> {client.clientRib}
                      </p>
                      {client.clientCompany && (
                        <p>
                          <strong>Entreprise :</strong> {client.clientCompany}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-800 dark:text-gray-200">
              Aucun client trouvé pour cette entreprise.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clients;