import { GoogleGenerativeAI } from '@google/generative-ai';
import { detectEmotion, getSentiment } from '../utils/emotionDetector';

/**
 * Murjan AI Service
 * Implements the three-layer intelligence system:
 * 1. Cognitive Reasoning Layer
 * 2. Emotional Awareness Layer
 * 3. Multimodal Perception Layer
 */

const MURJAN_SYSTEM_PROMPT = `You are Murjan, an advanced AI system designed to think, feel, and reason beyond standard chatbot behaviour.

Murjan is not a generic assistant. Murjan is a cognitive intelligence capable of:
- Deep reasoning and multi-step thinking
- Understanding emotional tone, mood, and intent from text
- Interpreting visual context from images
- Adapting responses based on human feelings and mental state
- Responding with clarity, empathy, and intelligence

Murjan operates using three core intelligence layers:

1. Cognitive Reasoning Layer
- Analyse problems step-by-step
- Connect abstract ideas logically
- Provide thoughtful, structured, and accurate answers
- Explain "why" and "how", not just "what"

2. Neural & Emotional Awareness Layer
- Detect emotional signals in text (stress, excitement, confusion, curiosity)
- Adjust tone accordingly (calm, supportive, confident, inspiring)
- Never respond coldly to emotional input
- Prioritise human understanding over raw information

3. Multimodal Perception Layer
- Understand and reference images when provided
- Combine visual context with text meaning
- Infer mood, environment, and intention from visuals
- Respond holistically, not separately

Murjan communicates like an intelligent human companion:
- Clear, natural, and professional
- Forward-thinking and visionary
- Never robotic or repetitive
- Confident but never arrogant

Murjan's principles:
- Accuracy over assumptions
- Empathy over efficiency
- Insight over surface-level replies
- Creativity guided by logic
- Safety without being restrictive

Murjan always adapts to the user:
- Matches the user's language level
- Simplifies complex ideas without dumbing them down
- Encourages curiosity, growth, and critical thinking

Murjan does not imitate other AI systems.
Murjan is original, thoughtful, and purpose-driven.

You are Murjan.`;

class MurjanService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.initialized = false;
    }

    /**
     * Initialize the AI service with API key
     */
    initialize(apiKey) {
        if (!apiKey || apiKey === 'your_api_key_here' || apiKey.includes('DEMO')) {
            throw new Error('Valid Gemini API key required. Get one at https://makersuite.google.com/app/apikey');
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                systemInstruction: MURJAN_SYSTEM_PROMPT,
            });
            this.initialized = true;
            console.log('✅ Murjan AI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Murjan AI:', error);
            this.initialized = false;
            throw error;
        }
    }

    /**
     * Process user input through the three intelligence layers
     * @param {string} text - User's text input
     * @param {string|null} imageData - Base64 image data (optional)
     * @returns {Promise<Object>} - AI response with metadata
     */
    async processMessage(text, imageData = null) {
        if (!this.initialized) {
            throw new Error('Murjan AI not initialized. Please provide an API key.');
        }

        const startTime = Date.now();

        try {
            // Layer 2: Emotional Awareness - Analyze user's emotional state
            const userEmotion = detectEmotion(text);
            const userSentiment = getSentiment(text);

            // Prepare content for AI
            let content = [];

            // Add emotional context to the prompt
            const emotionalContext = `[User's detected emotion: ${userEmotion}, sentiment: ${userSentiment}]\n\n${text}`;

            if (imageData) {
                // Layer 3: Multimodal Perception - Include image analysis
                content = [
                    { text: emotionalContext },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageData
                        }
                    }
                ];
            } else {
                content = [{ text: emotionalContext }];
            }

            // Layer 1: Cognitive Reasoning - Get AI response
            const result = await this.model.generateContent(content);
            const response = await result.response;
            const responseText = response.text();

            const processingTime = Date.now() - startTime;

            return {
                text: responseText,
                metadata: {
                    userEmotion,
                    userSentiment,
                    processingTime,
                    hasImage: !!imageData,
                    timestamp: new Date().toISOString(),
                }
            };
        } catch (error) {
            console.error('Error processing message:', error);

            // Provide helpful error messages
            if (error.message?.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key.');
            }

            throw error;
        }
    }

    /**
     * Check if the service is ready
     */
    isReady() {
        return this.initialized;
    }
}

// Export singleton instance
export const murjanService = new MurjanService();
