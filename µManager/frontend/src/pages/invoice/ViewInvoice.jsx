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
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const pdfRef = useRef(null);
    const { addToast } = useToast();

    // Ajout d'un état pour contrôler le zoom de la prévisualisation
    const [previewScale, setPreviewScale] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchInvoice(),
                    fetchCompanyData()
                ]);
                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
                setIsLoading(false);
                addToast("error", "Impossible de charger les données de la facture");
            }
        };

        fetchData();
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInvoice(data);
            } else {
                addToast("error", "Erreur lors de la récupération de la facture");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            addToast("error", "Erreur réseau lors de la récupération de la facture");
        }
    };

    const fetchCompanyData = async () => {
        try {
            const token = localStorage.getItem("token");
            const companyId = localStorage.getItem("companyId");

            const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCompany(data);
            } else {
                addToast("error", "Erreur lors de la récupération des données de l'entreprise");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            addToast("error", "Erreur réseau lors de la récupération des données de l'entreprise");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const generatePDF = async () => {
        if (!pdfRef.current) return;

        try {
            addToast("info", "Génération du PDF en cours...");

            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`facture_${invoiceId}.pdf`);

            addToast("success", "PDF téléchargé avec succès");
        } catch (error) {
            console.error("Erreur lors de la génération du PDF :", error);
            addToast("error", "Erreur lors de la génération du PDF");
        }
    };

    const sendInvoiceByEmail = async () => {
        if (!invoice?.client?.email) {
            addToast("error", "Adresse email du client non disponible");
            return;
        }
    
        try {
            const token = localStorage.getItem("token");
            
            // Affichage d'un toast de chargement
            addToast("info", "Envoi de la facture en cours...");
            
            // Générer le PDF (utiliser la même méthode que pour le téléchargement)
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Envoyer la requête au backend
            const response = await fetch(`http://localhost:3000/invoices/${invoiceId}/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pdfData: imgData,
                    clientEmail: invoice.client.email,
                    clientName: `${invoice.client.name} ${invoice.client.lastName}`
                }),
            });
            
            if (response.ok) {
                // Mettre à jour le statut de la facture à "Sent"
                const updateResponse = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "Sent" }),
                });
                
                if (updateResponse.ok) {
                    // Mettre à jour l'interface utilisateur
                    setInvoice(prev => ({ ...prev, status: "Sent" }));
                    addToast("success", `Facture envoyée avec succès à ${invoice.client.email}`);
                } else {
                    addToast("warning", "Facture envoyée mais le statut n'a pas pu être mis à jour");
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || "Erreur lors de l'envoi de l'email");
            }
        } catch (error) {
            console.error("Erreur d'envoi:", error);
            addToast("error", `Échec de l'envoi: ${error.message}`);
        }
    };

    // Fonction pour ajuster le zoom de prévisualisation
    const handleZoomChange = (e) => {
        setPreviewScale(parseFloat(e.target.value));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar title="Détails de la facture" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Facture #{invoiceId}</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Visualisez les détails de votre facture
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                        <button
                            onClick={() => navigate(`/edit-invoice/${invoiceId}`)}
                            className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 text-sm font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Modifier
                        </button>

                        <button
                            onClick={() => navigate("/invoices")}
                            className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 text-sm font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour aux factures
                        </button>
                    </div>
                </div>

                {/* Contrôle de zoom pour la prévisualisation */}
                <div className="mb-4 flex items-center justify-end">
                    <label htmlFor="zoom" className="mr-2 text-sm text-gray-600 dark:text-gray-300">Zoom:</label>
                    <input
                        type="range"
                        id="zoom"
                        name="zoom"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={previewScale}
                        onChange={handleZoomChange}
                        className="w-32 accent-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{Math.round(previewScale * 100)}%</span>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        {/* Conteneur de prévisualisation au format A4 */}
                        <div 
                            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-[80vh]"
                            style={{ maxWidth: '100%' }}
                        >
                            {/* La feuille A4 elle-même */}
                            <div 
                                className="bg-white rounded shadow mx-auto overflow-hidden"
                                style={{
                                    width: `${210 * previewScale}mm`,  // Largeur A4
                                    height: `${297 * previewScale}mm`, // Hauteur A4
                                    maxWidth: '100%',
                                    transform: `scale(${previewScale})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                {invoice ? (
                                    <div ref={pdfRef} className="p-8" style={{ width: '210mm', height: '297mm' }}>
                                        {/* En-tête de facture */}
                                        <div className="flex flex-col md:flex-row justify-between mb-8">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                                    FACTURE
                                                </h2>
                                                <div className="mt-4 space-y-1">
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">N° de facture:</span> {invoice.invoiceId}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Date d'émission:</span> {formatDate(invoice.issueDate)}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Date d'échéance:</span> {formatDate(invoice.dueDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            {company && (
                                                <div className="mt-6 md:mt-0 text-right">
                                                    <h3 className="text-lg font-bold text-gray-700">
                                                        {company.name}
                                                    </h3>
                                                    <div className="mt-1 text-gray-600 text-sm space-y-1">
                                                        <p>{company.address}</p>
                                                        <p>{company.postalCode} {company.city}</p>
                                                        <p>{company.email}</p>
                                                        <p>{company.phone}</p>
                                                        <p>SIRET: {company.siret || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Informations client */}
                                        {invoice.client && (
                                            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                    Client
                                                </h3>
                                                <div className="text-gray-700">
                                                    <p className="font-medium">{invoice.client.name} {invoice.client.lastName}</p>
                                                    {invoice.client.clientCompany && <p>{invoice.client.clientCompany}</p>}
                                                    <p>{invoice.client.address}</p>
                                                    <p>{invoice.client.postalCode} {invoice.client.city}</p>
                                                    <p>{invoice.client.email}</p>
                                                    <p>{invoice.client.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tableau des lignes de facture */}
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Détails de la facture
                                            </h3>

                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                            Description
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                                            Quantité
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                                            Prix unitaire
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {invoice.lines && invoice.lines.map((line, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                                {line.description}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-center text-gray-700">
                                                                {line.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-center text-gray-700">
                                                                {parseFloat(line.unitPrice).toFixed(2)} €
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-800">
                                                                {parseFloat(line.totalPrice).toFixed(2)} €
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Total */}
                                            <div className="mt-6 flex justify-end">
                                                <div className="w-64 space-y-2 pt-4">
                                                    <div className="flex justify-between text-lg font-bold text-gray-800 border-t border-gray-200 pt-2">
                                                        <span>Total:</span>
                                                        <span>{parseFloat(invoice.total || 0).toFixed(2)} €</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-800 text-lg font-medium">
                                            Facture introuvable
                                        </p>
                                        <p className="text-gray-600 mt-1">
                                            Cette facture n'existe pas ou a été supprimée
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Boutons d'action */}
                {invoice && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={generatePDF}
                            className="flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 px-6 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Télécharger en PDF
                        </button>

                        <button
                            onClick={sendInvoiceByEmail}
                            disabled={!invoice?.client?.email || invoice?.status === "Sent" || invoice?.status === "Paid"}
                            className={`flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 ${!invoice?.client?.email || invoice?.status === "Sent" || invoice?.status === "Paid"
                                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-100 dark:text-gray-400"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                } py-2.5 px-6 font-medium`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Envoyer par email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewInvoice;