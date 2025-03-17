import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "../../components/ToastContainer";

function ViewInvoice() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [company, setCompany] = useState(null); // Stocke les informations de l'entreprise
    const pdfRef = useRef(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchInvoice = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInvoice(data);
                } else {
                    console.error("Erreur lors de la récupération de la facture.");
                    addToast("error", "Erreur lors de la récupération de la facture.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                addToast("error", "Erreur réseau, veuillez réessayer.");
            }
        };

        const fetchCompany = async () => {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId");

            try {
                const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCompany(data);
                } else {
                    console.error("Erreur lors de la récupération des informations de l'entreprise.");
                    addToast("error", "Erreur lors de la récupération des informations de l'entreprise.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                addToast("error", "Erreur réseau, veuillez réessayer.");
            }
        };

        fetchInvoice();
        fetchCompany();
    }, [invoiceId]);

    const generatePDF = async () => {
        if (!pdfRef.current) return;

        const canvas = await html2canvas(pdfRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4"); // Format A4 en millimètres

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth; // Largeur complète de la page
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight); // Ajustement pour remplir la page A4
        pdf.save(`facture_${invoiceId}.pdf`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
            <Navbar title="Visualiser une facture" />

            <div className="container mx-auto mt-10 p-6">
                <button
                    onClick={() => navigate("/invoices")}
                    className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                    Retour
                </button>

                {invoice && company ? (
                    <>
                        <div
                            ref={pdfRef}
                            className="bg-white p-6 rounded-lg shadow-lg text-black"
                            style={{
                                width: "210mm", // Largeur A4
                                minHeight: "297mm", // Hauteur A4
                                margin: "0 auto",
                                padding: "20mm", // Marges pour le contenu
                                boxSizing: "border-box",
                                fontSize: "12px", // Police adaptée pour une page A4
                            }}
                        >
                            {/* En-tête entreprise */}
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">{company.name}</h2>
                                    <p>SIRET : {company.siret}</p>
                                    <p>{company.address}</p>
                                    <p>{company.postalCode}, {company.city}</p>
                                    <p>Téléphone : {company.phone}</p>
                                    <p>Email : {company.email}</p>
                                    <p>RIB : {company.rib}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Date :</strong> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                                    <p><strong>N° Facture :</strong> {invoice.invoiceId}</p>
                                </div>
                            </div>

                            {/* Infos client */}
                            <div className="mt-6">
                                <h3 className="text-lg font-bold">FACTURER À :</h3>
                                <p>{invoice.client.name} {invoice.client.lastName}</p>
                                {invoice.client.clientCompany && <p>{invoice.client.clientCompany}</p>}
                                <p>{invoice.client.address}</p>
                            </div>

                            {/* Lignes de facture */}
                            <div className="mt-6">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border p-2">Description</th>
                                            <th className="border p-2 text-right">Quantité</th>
                                            <th className="border p-2 text-right">Prix Unitaire (€)</th>
                                            <th className="border p-2 text-right">Total (€)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lines.map((line, index) => (
                                            <tr key={index}>
                                                <td className="border p-2">{line.description}</td>
                                                <td className="border p-2 text-right">{line.quantity}</td>
                                                <td className="border p-2 text-right">
                                                    {parseFloat(line.unitPrice).toFixed(2)}
                                                </td>
                                                <td className="border p-2 text-right">
                                                    {(line.quantity * line.unitPrice).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total */}
                            <p className="mt-4 text-right text-gray-800  text-lg font-bold">
                                <strong>Total :</strong> {parseFloat(invoice.total || 0).toFixed(2)} €
                            </p>
                        </div>
                        <button
                            onClick={generatePDF}
                            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-md"
                        >
                            Télécharger en PDF
                        </button>
                    </>
                ) : (
                    <p className="text-gray-800 dark:text-gray-200">Chargement des données...</p>
                )}
            </div>
        </div>
    );
}

export default ViewInvoice;