import { detectEmotion, getSentiment } from '../utils/emotionDetector';

/**
 * Murjan AI Service
 * Implements the three-layer intelligence system:
 * 1. Cognitive Reasoning Layer
 * 2. Emotional Awareness Layer
 * 3. Multimodal Perception Layer
 *
 * Powered by NVIDIA API
 * - Fast queries  → meta/llama-3.1-8b-instruct  (small, instant)
 * - Complex queries → qwen/qwen3.5-122b-a10b    (deep reasoning + thinking)
 */

// Proxied through Vite (dev) or Vercel Edge Function (production) to avoid CORS
const NVIDIA_API_URL = '/api/nvidia';

// Model routing
const MODELS = {
    fast: 'meta/llama-3.1-8b-instruct',  // ~1-2s — used for short/simple queries
    powerful: 'qwen/qwen3.5-122b-a10b',     // ~5-15s — used for complex/image queries
};

/**
 * Pick the right model based on query complexity.
 * Fast model: short text, no image, simple words.
 * Powerful model: long text, image present, or technical/complex content.
 */
function selectModel(text, hasImage) {
    if (hasImage) return MODELS.powerful;
    const wordCount = (text || '').trim().split(/\s+/).length;
    const complexPatterns = /explain|analyze|compare|write|code|debug|translate|summarize|essay|report|calculate|why|how does|what is the difference/i;
    if (wordCount > 30 || complexPatterns.test(text)) return MODELS.powerful;
    return MODELS.fast;
}

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
        this.apiKey = null;
        this.initialized = false;
    }

    /**
     * Initialize the AI service with API key
     */
    initialize(apiKey) {
        if (!apiKey || apiKey.includes('DEMO') || apiKey === 'your_api_key_here') {
            throw new Error('Valid NVIDIA API key required. Get one at https://integrate.api.nvidia.com/');
        }
        this.apiKey = apiKey;
        this.initialized = true;
        console.log('✅ Murjan AI (NVIDIA/Qwen) initialized successfully');
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

        // Layer 2: Emotional Awareness
        const userEmotion = detectEmotion(text);
        const userSentiment = getSentiment(text);

        // Build the user message content
        const emotionalContext = `[User's detected emotion: ${userEmotion}, sentiment: ${userSentiment}]\n\n${text}`;

        let userContent;
        if (imageData) {
            // Layer 3: Multimodal — include image as base64 URL
            userContent = [
                { type: 'text', text: emotionalContext },
                {
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${imageData}` }
                }
            ];
        } else {
            userContent = emotionalContext;
        }

        const chosenModel = selectModel(text, !!imageData);
        const isFast = chosenModel === MODELS.fast;

        console.log(`🤖 Routing to: ${chosenModel} (${isFast ? 'fast' : 'powerful'} mode)`);

        const payload = {
            model: chosenModel,
            messages: [
                { role: 'system', content: MURJAN_SYSTEM_PROMPT },
                { role: 'user', content: userContent }
            ],
            max_tokens: isFast ? 2048 : 16384,
            temperature: 0.60,
            top_p: 0.95,
            stream: true,
            // Only enable extended thinking for the powerful model
            ...(isFast ? {} : { chat_template_kwargs: { enable_thinking: true } }),
        };

        try {
            const response = await fetch(NVIDIA_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`NVIDIA API error ${response.status}: ${errText}`);
            }

            // Stream the response and accumulate text
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const delta = json?.choices?.[0]?.delta?.content;
                        if (delta) fullText += delta;
                    } catch {
                        // skip malformed SSE lines
                    }
                }
            }

            // Strip <think>...</think> blocks from the final response
            const cleanText = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

            const processingTime = Date.now() - startTime;

            return {
                text: cleanText || fullText.trim(),
                metadata: {
                    userEmotion,
                    userSentiment,
                    processingTime,
                    hasImage: !!imageData,
                    model: chosenModel,
                    timestamp: new Date().toISOString(),
                }
            };
        } catch (error) {
            console.error('Error processing message:', error);

            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                throw new Error('Invalid NVIDIA API key. Please check your API key.');
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
