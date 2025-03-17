import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function EditClient() {
  const { clientId } = useParams(); // Récupérer l'ID du client à partir des paramètres de l'URL
  const [formData, setFormData] = useState({
    lastName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    clientRib: "",
    clientCompany: "",
  });
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:3000/clients/${clientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const clientData = await response.json();
          setFormData({
            name: clientData.name || "",
            lastName: clientData.lastName || "",
            email: clientData.email || "",
            phone: clientData.phone || "",
            address: clientData.address || "",
            clientRib: clientData.clientRib || "",
            clientCompany: clientData.clientCompany || "",
          });
        } else {
          addToast("error", "Erreur lors de la récupération des données du client.");
          navigate("/clients");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        addToast("error", "Erreur réseau lors de la récupération des données.");
        navigate("/clients");
      }
    };

    fetchClientData();
  }, [clientId, navigate, addToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const updates = Object.fromEntries(
      Object.entries(formData).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    try {
      const response = await fetch(`http://localhost:3000/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        addToast("success", "Client modifié avec succès !");
        navigate("/clients");
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la modification du client :", errorData.message || response.statusText);
        addToast("error", `Erreur : ${errorData.message || "Modification impossible."}`);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      addToast("error", "Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800`}>
      <Navbar title="Client" />

      <div className="flex-grow container mx-auto mt-10 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Modifier les informations du client
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Nom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Prénom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Téléphone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Adresse</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">RIB</label>
            <input
              type="text"
              name="clientRib"
              value={formData.clientRib}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Entreprise</label>
            <input
              type="text"
              name="clientCompany"
              value={formData.clientCompany}
              onChange={handleInputChange}
              placeholder="Nom de l'entreprise du client (facultatif)"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md transition"
          >
            Mettre à jour
          </button>
          <button
            onClick={(e) => {
              e.preventDefault(); // Empêche la soumission du formulaire
              navigate("/clients"); // Redirige vers la page des clients
            }}
            className="p-4 ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition"
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditClient;