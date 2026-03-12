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
// Fallback endpoint (e.g., Ollama local server) for when NVIDIA fails
const FALLBACK_API_URL = '/api/ollama';

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

// Simple fallback model (Ollama's llama3) used when NVIDIA returns 500
const FALLBACK_MODEL = 'ollama/llama3';

// Custom Chat Template (ChatML format)
const CUSTOM_CHAT_TEMPLATE = `{%- for message in messages %}
    {%- if loop.first and messages[0]['role'] != 'system' %}
        {{- '<|im_start|>system\\nYou are a helpful assistant.<|im_end|>\\n' }}
    {%- endif %}
    {{- '<|im_start|>' + message['role'] + '\\n' + message['content'] + '<|im_end|>\\n' }}
{%- endfor %}
{%- if add_generation_prompt %}
    {{- '<|im_start|>assistant\\n' }}
{%- endif %}`;

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
        // Do not throw an error if uninitialized; we will route to the local fallback automatically.
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

        let chosenModel = selectModel(text, !!imageData);
        let isFast = chosenModel === MODELS.fast;

        let attempt = this.initialized ? 0 : 1; // Start at attempt 1 (Local fallback) if missing NVIDIA key
        const maxAttempts = 2; // 0 = NVIDIA, 1 = fallback
        let payload;

        if (!this.initialized) {
            console.warn("NVIDIA key missing. Automatically routing to local fallback (Ollama).");
        }

        while (attempt < maxAttempts) {
            const apiUrl = attempt === 0 ? NVIDIA_API_URL : FALLBACK_API_URL;
            const model = attempt === 0 ? chosenModel : FALLBACK_MODEL;

            console.log(`🤖 Attempt ${attempt + 1}: routing to ${model} via ${apiUrl}`);

            payload = {
                model,
                messages: [
                    { role: 'system', content: MURJAN_SYSTEM_PROMPT },
                    { role: 'user', content: userContent }
                ],
                max_tokens: 2048, // Reduced from 16384 to guarantee much faster completion caps
                temperature: 0.60,
                top_p: 0.95,
                stream: true,
            };

            try {
                const response = await fetch(apiUrl, {
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

                    // If NVIDIA returns 500 or 503, fall back on next iteration
                    if (attempt === 0 && response.status >= 500) {
                        console.warn(`NVIDIA API ${response.status} – falling back to local Ollama`);
                        attempt++;
                        continue;
                    }

                    // Specialized error handling
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Invalid NVIDIA API key. Please check your API key.');
                    }

                    throw new Error(`API error ${response.status}: ${errText}`);
                }

                // Successful response – break loop
                return await this._processStream(response, {
                    startTime,
                    userEmotion,
                    userSentiment,
                    hasImage: !!imageData,
                    model
                });
            } catch (err) {
                if (attempt === 0 && (err.message.includes('500') || err.message.includes('503') || err.name === 'TypeError')) {
                    console.warn(`Encountered error (${err.message}), will retry with fallback model`);
                    attempt++;
                    continue;
                }
                throw err;
            }
        }

        // If we exit loop without returning, throw generic error
        throw new Error('Both primary and fallback AI services failed. Please check your network, API key, or try a different model.');
    }

    /**
     * Consume the Server-Sent Events stream from the API
     */
    async _processStream(response, context) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]') continue;
                if (!trimmed.startsWith('data: ')) continue;

                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const delta = json?.choices?.[0]?.delta?.content;
                    if (delta) fullText += delta;
                } catch {
                    // continue on malformed chunks
                }
            }
        }

        const cleanText = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const processingTime = Date.now() - context.startTime;

        return {
            text: cleanText || fullText.trim(),
            metadata: {
                userEmotion: context.userEmotion,
                userSentiment: context.userSentiment,
                processingTime,
                hasImage: context.hasImage,
                model: context.model,
                timestamp: new Date().toISOString(),
            }
        };
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
