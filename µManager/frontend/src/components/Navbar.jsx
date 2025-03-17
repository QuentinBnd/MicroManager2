import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar({ title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const [userCompanies, setUserCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchUserCompanies = async () => {
            const token = localStorage.getItem("token");
            const userId = parseInt(localStorage.getItem("userId"));
            const currentCompanyId = localStorage.getItem("companyId");

            if (!token || !userId) {
                setLoading(false);
                return;
            }

            try {
                // Vérifier si le token est valide
                const userResponse = await fetch(`http://localhost:3000/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!userResponse.ok) {
                    console.error("Token invalide ou expiré - redirection vers login");
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                // Récupération des entreprises
                const response = await fetch("http://localhost:3000/companies", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    const userCompanies = data.filter(
                        (company) => company.user && company.user.userId.toString() === userId.toString()
                    );

                    setUserCompanies(userCompanies);
                    
                    if (currentCompanyId) {
                        setSelectedCompany(currentCompanyId);
                    } else if (userCompanies.length > 0) {
                        setSelectedCompany(userCompanies[0].companyId);
                        localStorage.setItem("companyId", userCompanies[0].companyId);
                    }
                } else if (response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des entreprises:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserCompanies();
    }, [navigate]);

    const handleCompanyChange = (e) => {
        const newCompanyId = e.target.value;
        localStorage.setItem("companyId", newCompanyId);
        setSelectedCompany(newCompanyId);
        window.location.reload();
    };

    // Trouver le nom de l'entreprise sélectionnée
    const selectedCompanyName = userCompanies.find(
        (company) => company.companyId.toString() === selectedCompany.toString()
    )?.name || "";

    return (
        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 shadow-md">
            <nav className="w-11/12 max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo et Titre */}
                <div className="flex items-center space-x-2">
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-xl">µ</div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 hidden sm:block">
                        {title}
                    </h1>
                </div>

                {/* Menu de navigation central */}
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 rounded-full shadow-sm px-2 py-1.5">
                    {/* Dashboard */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ${isActive("/dashboard")
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                        title="Tableau de bord"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="w-5 h-5 sm:w-5 sm:h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                    </button>

                    {/* Clients */}
                    <button
                        onClick={() => navigate("/clients")}
                        className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ${isActive("/clients")
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                        title="Clients"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </button>

                    {/* Factures */}
                    <button
                        onClick={() => navigate("/invoices")}
                        className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ${isActive("/invoices")
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                        title="Factures"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>

                    {/* Contrats */}
                    <button
                        onClick={() => navigate("/contracts")}
                        className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ${isActive("/contracts")
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                        title="Contrats"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button>
                </div>

                {/* Zone droite : Sélecteur d'entreprise et paramètres */}
                <div className="flex items-center space-x-3">
                    {/* Sélecteur d'entreprise stylisé */}
                    {!loading && userCompanies.length > 0 && (
                        <div className="relative inline-block">
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                                    {selectedCompanyName}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-100 dark:border-gray-700">
                                    {userCompanies.map((company) => (
                                        <div 
                                            key={company.companyId} 
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 
                                                ${company.companyId.toString() === selectedCompany.toString() 
                                                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                                    : 'text-gray-700 dark:text-gray-300'}`}
                                            onClick={() => {
                                                localStorage.setItem("companyId", company.companyId);
                                                setSelectedCompany(company.companyId);
                                                setIsDropdownOpen(false);
                                                window.location.reload();
                                            }}
                                        >
                                            {company.name}
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    <div 
                                        className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                        onClick={() => {
                                            navigate("/create-company");
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Nouvelle entreprise
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bouton Paramètres */}
                    <button
                        onClick={() => navigate("/settings")}
                        className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ${
                            isActive("/settings")
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700"
                        }`}
                        title="Paramètres"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;