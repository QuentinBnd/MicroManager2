import { useState, useEffect, useContext } from "react";

function CreateCompany() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rib, setRib] = useState("");
  const [siret, setSiret] = useState("");
  const [userName, setUserName] = useState("Utilisateur inconnu");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name); // Met à jour le nom de l'utilisateur
        } else {
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur :",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    if (userId) fetchUserName();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, address,city, postalCode,phone, email,rib, userId, siret }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setStatusMessage("Entreprise créée avec succès !");
        setName("");
        setAddress("");
        localStorage.setItem("companyId", (await response.json()).companyId);
        console.log("companyId", localStorage.getItem("companyId"));
        setTimeout(() => (window.location.href = "/dashboard"), 2000); // Redirige après 2 secondes
      } else {
        const errorData = await response.json();
        setIsSuccess(false);
        setStatusMessage(
          `Erreur lors de la création de l'entreprise : ${errorData.error || "Inconnue"}`
        );
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage("Erreur réseau lors de la création de l'entreprise.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Bonjour {userName}, renseignez les détails de votre entreprise
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Adresse de l'entreprise"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Ville de l'entreprise"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Code postal de l'entreprise"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Téléphone de l'entreprise"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email de l'entreprise"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="RIB de l'entreprise"
            value={rib}
            onChange={(e) => setRib(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="SIRET de l'entreprise"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-md transition"
          >
            Créer l'entreprise
          </button>
        </form>
        {statusMessage && (
          <p
            className={`mt-4 text-center ${
              isSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateCompany;