import React, { useState, useRef, useEffect } from "react";
import { useToast } from "./ToastContainer";
import ReactMarkdown from "react-markdown";

function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    // États pour le redimensionnement
    const [widgetSize, setWidgetSize] = useState({ width: 360, height: 500 });
    const [isResizing, setIsResizing] = useState(false);

    const { addToast } = useToast();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const widgetRef = useRef(null);
    const resizeRef = useRef({ 
        startX: 0, 
        startY: 0,
        startWidth: 360, 
        startHeight: 500,
        width: 360, 
        height: 500 
    });

    const suggestions = [
        "Quelles sont les obligations fiscales d'un auto-entrepreneur ?",
        "Comment facturer un client étranger ?",
        "Quand dois-je déclarer mon chiffre d'affaires ?",
        "Quelle est la différence entre AE et EIRL ?",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // -- Envoi du message
    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!message.trim()) return;

        const userMessage = message;
        setConversation([...conversation, { role: "user", content: userMessage }]);
        setMessage("");
        setIsLoading(true);

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:3000/api/chatbot/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationId: conversationId
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du message");
            }

            const data = await response.json();
            setConversationId(data.conversationId);
            setConversation((prev) => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            addToast("error", error.message || "Erreur de communication avec l'assistant");
            setConversation((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Désolé, je rencontre des difficultés à répondre. Veuillez réessayer ultérieurement.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // -- Suggestion de texte à injecter
    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion);
        inputRef.current?.focus();
    };

    // -- Bouton d'ouverture/fermeture
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // -- Bouton d'infos
    const toggleInfo = () => {
        setShowInfo(!showInfo);
    };

    // -- Début du redimensionnement - version améliorée
    const startResizing = (event, direction) => {
        event.preventDefault();
        setIsResizing(true);

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = widgetRef.current.offsetWidth;
        const startHeight = widgetRef.current.offsetHeight;
        
        // Stocker les dimensions initiales dans la référence
        resizeRef.current = {
            startX,
            startY,
            startWidth,
            startHeight,
            width: startWidth,
            height: startHeight
        };

        function handleMouseMove(e) {
            // Utiliser requestAnimationFrame pour limiter les mises à jour du DOM
            requestAnimationFrame(() => {
                const dx = e.clientX - resizeRef.current.startX;
                const dy = e.clientY - resizeRef.current.startY;
                
                let newWidth = resizeRef.current.startWidth;
                let newHeight = resizeRef.current.startHeight;

                // Gestion des différentes directions de redimensionnement
                if (direction.includes("left")) {
                    newWidth = Math.max(300, resizeRef.current.startWidth - dx);
                } else if (direction.includes("right")) {
                    newWidth = Math.max(300, resizeRef.current.startWidth + dx);
                }

                if (direction.includes("top")) {
                    newHeight = Math.max(300, resizeRef.current.startHeight - dy);
                } else if (direction.includes("bottom")) {
                    newHeight = Math.max(300, resizeRef.current.startHeight + dy);
                }

                // Mettre à jour la référence pour la position CSS
                resizeRef.current.width = newWidth;
                resizeRef.current.height = newHeight;
                
                // Appliquer directement au DOM pour une mise à jour plus fluide
                if (widgetRef.current) {
                    widgetRef.current.style.width = `${newWidth}px`;
                    widgetRef.current.style.height = `${newHeight}px`;
                }
            });
        }

        function handleMouseUp() {
            // Mettre à jour l'état React une seule fois à la fin du redimensionnement
            setWidgetSize({ 
                width: resizeRef.current.width, 
                height: resizeRef.current.height 
            });
            setIsResizing(false);
            
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // -- Formatage du texte (markdown)
    const formatMessage = (content) => {
        return (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-3 prose-ul:my-2 prose-li:my-1 prose-headings:mt-4">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Bouton principal */}
            <button
                onClick={toggleChat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-200"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div
                    ref={widgetRef}
                    className={`absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col ${isResizing ? 'transition-none' : 'transition-all duration-300'}`}
                    style={{ 
                        width: `${widgetSize.width}px`, 
                        height: `${widgetSize.height}px`,
                    }}
                >
                    {/* Handlers de redimensionnement - Tous les bords et coins */}
                    {/* Top */}
                    <div
                        className="absolute top-0 left-0 w-full h-3 bg-transparent cursor-ns-resize z-10 "
                        onMouseDown={(e) => startResizing(e, "top")}
                    />
                    {/* Left */}
                    <div
                        className="absolute top-0 left-0 w-3 h-full bg-transparent cursor-ew-resize z-10 "
                        onMouseDown={(e) => startResizing(e, "left")}
                    />
                    
                    {/* Corners */}
                    <div
                        className="absolute top-0 left-0 w-6 h-6 bg-transparent cursor-nwse-resize z-20 "
                        onMouseDown={(e) => startResizing(e, "top-left")}
                    />
                   

                    {/* Indicateur visuel de redimensionnement */}
                    {isResizing && (
                        <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none z-30"></div>
                    )}

                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                        <h3 className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                            Assistant µManager
                        </h3>

                        {/* Bouton pour afficher/masquer l'info */}
                        <button onClick={toggleInfo} className="text-white hover:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Info-bulle */}
                    {showInfo && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800">
                            <h4 className="font-medium text-sm mb-2 text-indigo-700 dark:text-indigo-300">
                                Capacités de l'assistant
                            </h4>
                            <ul className="text-xs text-indigo-600 dark:text-indigo-200 space-y-1 list-disc pl-4">
                                <li>Réponse aux questions sur la gestion de micro-entreprise</li>
                                <li>Aide sur les obligations fiscales et déclaratives</li>
                                <li>Conseils sur la facturation et la comptabilité</li>
                                <li>Explications des différents statuts juridiques</li>
                                <li>Information sur les cotisations sociales</li>
                            </ul>
                            <p className="text-xs text-indigo-500 dark:text-indigo-300 mt-2 italic">
                                Cet assistant utilise l'IA pour vous fournir des informations générales. 
                                Pour des conseils personnalisés, veuillez consulter un professionnel.
                            </p>
                        </div>
                    )}

                    {/* Zone de messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        {conversation.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="mb-4">
                                    Bonjour ! Je suis votre assistant virtuel spécialisé en gestion de micro-entreprise.
                                </p>
                                <p>Comment puis-je vous aider aujourd'hui ?</p>
                            </div>
                        ) : (
                            conversation.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-4 ${
                                            msg.role === "user"
                                                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        {formatMessage(msg.content)}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Indicateur "typing..." */}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions seulement si conversation vide */}
                    {conversation.length === 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Suggestions :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full px-3 py-1 text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Formulaire d'envoi de message */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center">
                            <input
                                type="text"
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 rounded-l-lg border-r-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !message.trim()}
                                className="rounded-r-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white p-2 px-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatbotWidget;