/**
 * Emotion Detector Utility
 * Analyzes text to detect emotional tone and sentiment
 */

const emotionKeywords = {
    stressed: ['stressed', 'overwhelmed', 'anxious', 'worried', 'pressure', 'exhausted', 'tired'],
    excited: ['excited', 'amazing', 'awesome', 'great', 'fantastic', 'wonderful', 'love', '!'],
    sad: ['sad', 'depressed', 'upset', 'unhappy', 'disappointed', 'down'],
    confused: ['confused', 'lost', 'unclear', 'don\'t understand', 'help', '?'],
    curious: ['how', 'why', 'what', 'when', 'where', 'curious', 'wonder', 'interesting'],
    calm: ['calm', 'peaceful', 'relaxed', 'ok', 'fine', 'good'],
    angry: ['angry', 'frustrated', 'annoyed', 'mad', 'furious'],
};

/**
 * Detects the primary emotion in a text
 * @param {string} text - The text to analyze
 * @returns {string} - The detected emotion
 */
export function detectEmotion(text) {
    if (!text) return 'neutral';

    const lowerText = text.toLowerCase();
    const emotionScores = {};

    // Score each emotion based on keyword presence
    Object.keys(emotionKeywords).forEach(emotion => {
        emotionScores[emotion] = 0;
        emotionKeywords[emotion].forEach(keyword => {
            if (lowerText.includes(keyword)) {
                emotionScores[emotion]++;
            }
        });
    });

    // Find emotion with highest score
    let maxEmotion = 'neutral';
    let maxScore = 0;

    Object.entries(emotionScores).forEach(([emotion, score]) => {
        if (score > maxScore) {
            maxScore = score;
            maxEmotion = emotion;
        }
    });

    return maxEmotion;
}

/**
 * Gets sentiment polarity (positive, negative, neutral)
 * @param {string} text - The text to analyze
 * @returns {string} - The sentiment polarity
 */
export function getSentiment(text) {
    if (!text) return 'neutral';

    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'love', 'wonderful', 'amazing', 'fantastic', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'hate', 'horrible', 'worst', 'frustrated', 'disappointed'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

/**
 * Gets the emotion color for UI display
 * @param {string} emotion - The emotion
 * @returns {string} - Tailwind CSS color class
 */
export function getEmotionColor(emotion) {
    const colors = {
        stressed: 'text-orange-500',
        excited: 'text-yellow-500',
        sad: 'text-blue-500',
        confused: 'text-purple-500',
        curious: 'text-green-500',
        calm: 'text-teal-500',
        angry: 'text-red-500',
        neutral: 'text-gray-500',
    };

    return colors[emotion] || colors.neutral;
}

/**
 * Gets the emotion emoji for UI display
 * @param {string} emotion - The emotion
 * @returns {string} - Emoji representation
 */
export function getEmotionEmoji(emotion) {
    const emojis = {
        stressed: '😰',
        excited: '🎉',
        sad: '😢',
        confused: '🤔',
        curious: '💡',
        calm: '😌',
        angry: '😠',
        neutral: '💬',
    };

    return emojis[emotion] || emojis.neutral;
}
