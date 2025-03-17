import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from "../components/ToastContainer";

function Settings() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState("user");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
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
    // États pour la suppression de compte
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deleteIsLoading, setDeleteIsLoading] = useState(false);

    const { addToast } = useToast();

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
                        password: "",
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            }
        };

        const fetchCompanyData = async () => {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId");

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
        e.preventDefault();
      
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
      
        try {
          const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
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

    const handleLogout = () => {
        addToast("confirm", "Êtes-vous sûr de vouloir vous déconnecter ?", null, () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("companyId");
            navigate('/');
            addToast("success", "Vous avez été déconnecté avec succès");
        });
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDeleteIsLoading(true);
        
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: confirmPassword }),
            });

            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("companyId");
                
                addToast("success", "Votre compte a été supprimé avec succès");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                const error = await response.json();
                addToast("error", `Erreur : ${error.message || "Mot de passe incorrect ou problème serveur"}`);
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            addToast("error", "Erreur réseau. Veuillez réessayer.");
        } finally {
            setDeleteIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar title="Paramètres" />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* En-tête avec titre */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Paramètres du compte</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Gérez vos informations personnelles et les détails de votre entreprise
                    </p>
                </div>

                {/* Onglets */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-white dark:bg-gray-700 rounded-full shadow-md p-1">
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`px-6 py-2.5 rounded-full transition-all duration-200 ${
                                activeTab === "user"
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Utilisateur
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("company")}
                            className={`px-6 py-2.5 rounded-full transition-all duration-200 ${
                                activeTab === "company"
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Entreprise
                            </div>
                        </button>
                    </div>
                </div>

                {/* Contenu de l'onglet actif */}
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
                    {activeTab === "user" ? (
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Informations personnelles
                            </h2>
                            <form onSubmit={handleUserSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="votre.email@exemple.com"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Laisser vide pour ne pas changer"
                                        />
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Laissez ce champ vide si vous ne souhaitez pas modifier votre mot de passe.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Enregistrer les modifications
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 px-6 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Déconnexion
                                    </button>
                                </div>
                                
                                {/* Section de suppression de compte */}
                                <div className="pt-8 mt-8 border-t-2 border-red-200 dark:border-red-800">
                                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">Zone de danger</h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        Cette action est irréversible et supprimera définitivement votre compte, ainsi que toutes vos données.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 py-2.5 px-5 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Supprimer mon compte
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Informations de votre entreprise
                            </h2>
                            
                            <form onSubmit={handleCompanySubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Nom de l'entreprise
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={companyData.name}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Nom de votre entreprise"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={companyData.address}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Adresse de l'entreprise"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Ville
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={companyData.city}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Ville"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Code postal
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={companyData.postalCode}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Code postal"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Téléphone
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={companyData.phone}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Numéro de téléphone"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            Email professionnel
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={companyData.email}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="email@entreprise.fr"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            RIB
                                        </label>
                                        <input
                                            type="text"
                                            name="rib"
                                            value={companyData.rib}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="RIB de l'entreprise"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                            SIRET
                                        </label>
                                        <input
                                            type="text"
                                            name="siret"
                                            value={companyData.siret}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            placeholder="Numéro SIRET"
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Enregistrer les modifications
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full max-w-md p-6 m-4 animate-fadeIn">
                        <div className="text-center mb-4">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                                Attention : Suppression de compte
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-3">
                                Vous êtes sur le point de supprimer définitivement votre compte et toutes les données associées. Cette action est <span className="font-bold">irréversible</span>.
                            </p>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Entrez votre mot de passe pour confirmer la suppression
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Votre mot de passe"
                                        className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setConfirmPassword("");
                                    }}
                                    className="py-2.5 px-4 flex-1 rounded-full transition-all duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteIsLoading}
                                    className="py-2.5 px-4 flex-1 rounded-full transition-all duration-200 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium flex items-center justify-center gap-2"
                                >
                                    {deleteIsLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Supprimer définitivement
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;