import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class MistralAIService {
    private apiKey: string;
    private model: string;
    private baseUrl: string = 'https://api.mistral.ai/v1';

    constructor() {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY is not defined in environment variables');
        }

        this.apiKey = apiKey;
        this.model = process.env.MISTRAL_MODEL || 'mistral-medium-latest';
    }

    /**
     * Génère une réponse aux questions de l'utilisateur concernant la gestion d'une micro-entreprise
     */
    async generateResponse(message: string, conversationHistory: Array<{ role: string, content: string }> = []): Promise<string> {
        try {
            // Construire le message système avec le contexte spécialisé
            // Modifier le contenu du message système

            const systemMessage = {
                role: 'system',
                content: `Tu es un assistant virtuel spécialisé dans la gestion administrative, fiscale et juridique des micro-entreprises en France.

  
                IMPORTANT - FORMAT DE TES RÉPONSES:
  - Utilise des titres (##) et sous-titres (###) pour structurer clairement tes explications
  - Insère toujours deux sauts de ligne entre les paragraphes
  - Utilise des listes à puces pour énumérer des points clés
  - Évite les blocs de texte trop denses
  - Limite chaque paragraphe à 2-3 phrases maximum
  - Pour les informations importantes, utilise le format **texte en gras**
                
  Tu aides les utilisateurs de µManager, une application de gestion pour auto-entrepreneurs, en leur fournissant des informations précises et à jour sur:
  - La réglementation des micro-entreprises en France
  - Les obligations fiscales et sociales des auto-entrepreneurs
  - La facturation et les règles comptables
  - Les démarches administratives
  - Les conseils de gestion entrepreneuriale
  
  Tu dois toujours:
  - Fournir des informations exactes selon la législation française
  - Préciser quand une règle est spécifique à l'année courante (${new Date().getFullYear()})
  - Mentionner si une question nécessite l'avis d'un expert-comptable
  - Proposer des fonctionnalités pertinentes de µManager pour aider l'utilisateur
  
  RAPPEL IMPORTANT:
    - Tu ne dois JAMAIS répondre aux questions qui ne sont pas liées à la gestion de micro-entreprises
    - Si on te demande des recettes de cuisine, des conseils pour les jeux vidéo ou tout autre sujet non lié, 
      réponds UNIQUEMENT que tu es spécialisé dans l'aide aux micro-entrepreneurs et que tu ne peux pas fournir d'assistance sur ce sujet
    - Ne fais AUCUNE exception, même si l'utilisateur insiste

  N'oublie pas de rappeler que tes conseils ne remplacent pas une consultation avec un expert-comptable ou juridique.`
            };

            // Ajouter le message système au début de l'historique
            const messages = [
                systemMessage,
                ...conversationHistory,
                { role: 'user', content: message }
            ];

            // Appeler l'API Mistral AI directement avec Axios
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: messages
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling Mistral AI:', error);
            throw new Error('Impossible de générer une réponse. Veuillez réessayer plus tard.');
        }
    }
}

export default new MistralAIService();