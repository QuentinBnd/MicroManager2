import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ToastContainer";

function AddClient() {
  const [formData, setFormData] = useState({
    lastName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    clientRib: "",
    clientCompany: "",
  });

  const navigate = useNavigate();
  const { addToast } = useToast(); // Hook pour gérer les toasts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");

    try {
      const response = await fetch("http://localhost:3000/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, companyId }),
      });

      if (response.ok) {
        addToast("success", "Client ajouté avec succès !");
        navigate("/clients"); // Redirige vers la liste des clients
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de l'ajout du client :", errorData.message || response.statusText);
        addToast("error", `Erreur : ${errorData.message || "Ajout impossible."}`);
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
          Ajouter un nouveau client
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <div>
            <label className="block text-gray-800 dark:text-gray-200 mb-2">Nom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Nom du client"
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
              placeholder="Prénom du client"
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
              placeholder="Email du client"
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
              placeholder="Téléphone du client"
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
              placeholder="Adresse du client"
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
              placeholder="RIB du client"
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
            Ajouter le client
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

export default AddClient;