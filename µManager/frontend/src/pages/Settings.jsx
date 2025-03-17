import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import Navbar from "../components/Navbar";

import { useToast } from "../components/ToastContainer";

function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("user"); // Gestion de l'onglet actif
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "", // Le mot de passe peut être vide pour éviter un affichage non sécurisé
    });
    const [companyData, setCompanyData] = useState({
        name: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        email: "",
        rib: "",
        siret: "",
    });
    const { addToast } = useToast();

    // Charger les données utilisateur et entreprise lors du montage
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            try {
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setFormData({
                        firstName: userData.name || "",
                        lastName: userData.lastName || "",
                        email: userData.email || "",
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            }
        };

        const fetchCompanyData = async () => {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId"); // Assurez-vous que l'ID de l'entreprise est stocké

            try {
                const response = await fetch(
                    `http://localhost:3000/companies/${companyId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.ok) {
                    const companyData = await response.json();
                    setCompanyData({
                        name: companyData.name || "",
                        address: companyData.address || "",
                        city: companyData.city || "",
                        postalCode: companyData.postalCode || "",
                        phone: companyData.phone || "",
                        email: companyData.email || "",
                        rib: companyData.rib || "",
                        siret: companyData.siret || "",
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données entreprise :", error);
            }
        };

        fetchUserData();
        fetchCompanyData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyData({ ...companyData, [name]: value });
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
      
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
      
        try {
          const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData), // Envoie les données utilisateur
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log("Utilisateur mis à jour :", data);
            addToast("success", "Utilisateur mis à jour avec succès !");
          } else {
            const errorData = await response.json();
            console.error("Erreur lors de la mise à jour de l'utilisateur :", errorData.message || response.statusText);
            addToast("error", `Erreur : ${errorData.message || "Mise à jour impossible."}`);
          }
        } catch (error) {
          console.error("Erreur réseau :", error);
          addToast("error", "Erreur réseau. Veuillez réessayer.");
        }
      };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId");
      
        try {
          const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(companyData),
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log("Entreprise mise à jour :", data);
            addToast("success", "Entreprise mise à jour avec succès !");
          } else {
            const errorData = await response.json();
            console.error("Erreur lors de la mise à jour de l'entreprise :", errorData.message || response.statusText);
            addToast("error", `Erreur : ${errorData.message || "Mise à jour impossible."}`);
          }
        } catch (error) {
          console.error("Erreur réseau :", error);
          addToast("error", "Erreur réseau. Veuillez réessayer.");
        }
      };

    return (
        <div className={`min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800`}>
            <Navbar title={"Paramètres"} />

            <div className="flex-grow container mx-auto mt-10 p-6">
                <div className="flex justify-center mb-6">
                    <div className="flex bg-white dark:bg-gray-900 rounded-full shadow-lg">
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`px-6 py-3 rounded-full ${activeTab === "user"
                                ? "bg-blue-500 text-white"
                                : "text-gray-800 dark:text-gray-200"
                                } transition`}
                        >
                            Utilisateur
                        </button>
                        <button
                            onClick={() => setActiveTab("company")}
                            className={`px-6 py-3 rounded-full ${activeTab === "company"
                                ? "bg-blue-500 text-white"
                                : "text-gray-800 dark:text-gray-200"
                                } transition`}
                        >
                            Entreprise
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                    {activeTab === "user" ? (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Paramètres Utilisateur
                            </h2>
                            <form onSubmit={handleUserSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    onClick={handleUserSubmit}
                                    className="p-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md transition"
                                >
                                    Mettre à jour
                                </button>
                            </form>
                            {/*Disconnect button */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("userId");
                                    localStorage.removeItem("companyId");
                                    navigate('/');
                                }}
                                className="p-4 mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition"
                            >
                                Déconnection
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Paramètres Entreprise
                            </h2>
                            <form onSubmit={handleCompanySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Nom de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={companyData.name}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2">
                                        Adresse de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={companyData.address}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        Ville de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={companyData.city}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        Code postal de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={companyData.postalCode}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={companyData.phone}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={companyData.email}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        RIB de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="rib"
                                        value={companyData.rib}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="block text-gray-800 dark:text-gray-200 mb-2 mt-2">
                                        SIRET de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        name="siret"
                                        value={companyData.siret}
                                        onChange={handleCompanyChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit" // Important : type="submit" pour déclencher le onSubmit
                                    className="p-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md transition"
                                >
                                    Mettre à jour
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;