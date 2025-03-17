import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";


function AddContract() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Actif");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pdfBase64, setPdfBase64] = useState(null);
  const [clients, setClients] = useState([]); // Liste des clients
  const [selectedClientId, setSelectedClientId] = useState(""); // ID du client sélectionné
  const navigate = useNavigate();
  const { addToast } = useToast();


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
        } else {
          console.error("Erreur lors de la récupération des clients.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    fetchClients();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setPdfBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !description ||
      !status ||
      !startDate ||
      !endDate ||
      !pdfBase64 ||
      !selectedClientId
    ) {
      addToast("error", "Tous les champs doivent être remplis.");
      return;
    }

    const companyId = localStorage.getItem("companyId");
    if (!companyId) {
      addToast('error', 'Aucune entreprise sélectionnée. Veuillez vérifier votre session.');
      return;
    }

    const data = {
      companyId,
      clientId: selectedClientId, // Ajout de l'ID du client
      description,
      status,
      startDate,
      endDate,
      pdfUrl: pdfBase64,
    };

    try {
      const response = await fetch("http://localhost:3000/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addToast("success", "Contrat ajouté avec succès !");
        navigate("/contracts");
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de l'ajout du contrat :", errorData);
        addToast("error", `Erreur : ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau lors de l'ajout du contrat.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar title="Ajouter un contrat" />
      <div className="container mx-auto mt-10 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Ajouter un nouveau contrat
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
        >
          {/* Champ Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Entrez une description"
            />
          </div>

          {/* Champ Statut */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Statut
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Actif">Actif</option>
              <option value="Expiré">Expiré</option>
              <option value="En attente">En attente</option>
            </select>
          </div>

          {/* Champ Date de début */}
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Champ Date de fin */}
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Date d'expiration
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Champ Sélection de client */}
          <div className="mb-4">
            <label htmlFor="client" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Sélectionnez un client
            </label>
            <select
              id="client"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Sélectionner un client --</option>
              {clients.map((client) => (
                <option key={client.clientId} value={client.clientId}>
                  {client.name} {client.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Champ Fichier PDF */}
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Importer un contrat (PDF)
            </label>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Bouton Soumettre */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Ajouter le contrat
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddContract;