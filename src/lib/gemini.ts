// Google Gemini AI Configuration & Client Setup
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// ============================================
// AUTO-FAILOVER API KEY SYSTEM
// ============================================
// Load all available API keys from environment
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.BACKUP_GEMINI_API_KEY_1,
  process.env.BACKUP_GEMINI_API_KEY_2,
].filter(Boolean) as string[];

// Track current active key index
let currentKeyIndex = 0;
let failedKeys = new Set<number>(); // Track which keys have failed

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

/**
 * Get currently active API key
 */
function getCurrentApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  
  // Find next working key
  while (failedKeys.has(currentKeyIndex) && failedKeys.size < API_KEYS.length) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }
  
  return API_KEYS[currentKeyIndex];
}

/**
 * Switch to next API key (on quota/rate limit error)
 */
function rotateToNextKey(): boolean {
  console.warn(`⚠️ API Key ${currentKeyIndex + 1} quota exhausted! Rotating...`);
  
  failedKeys.add(currentKeyIndex);
  
  // If all keys failed, reset and try again
  if (failedKeys.size >= API_KEYS.length) {
    console.warn('🔄 All keys exhausted! Resetting rotation (keys may have recovered)...');
    failedKeys.clear();
    currentKeyIndex = 0;
    return false; // All keys tried
  }
  
  // Move to next key
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`✅ Switched to API Key ${currentKeyIndex + 1}/${API_KEYS.length}`);
  
  return true;
}

/**
 * Initialize Gemini client with current key
 */
function initializeGeminiClient(): {
  genAI: GoogleGenerativeAI;
  generationModel: GenerativeModel;
  embeddingModel: GenerativeModel;
} {
  const apiKey = getCurrentApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const generationModel = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });
  
  const embeddingModel = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
  
  return { genAI, generationModel, embeddingModel };
}

// Initialize with first available key
let { genAI, generationModel, embeddingModel } = API_KEYS.length > 0 
  ? initializeGeminiClient() 
  : { genAI: null, generationModel: null, embeddingModel: null };

// ============================================
// GENERATION FUNCTIONS
// ============================================

/**
 * Generate content with Gemini Pro
 * Auto-retry with API key rotation on quota errors
 */
export const generateContent = async (prompt: string, retries = 3): Promise<string> => {
  if (!generationModel) {
    throw new Error('Gemini API is not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await generationModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      const is503 = error.message?.includes('503') || error.message?.includes('overloaded');
      const is429 = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      // If quota error, try rotating to next API key
      if (is429 && API_KEYS.length > 1) {
        const rotated = rotateToNextKey();
        
        if (rotated) {
          // Reinitialize client with new key
          const newClient = initializeGeminiClient();
          genAI = newClient.genAI;
          generationModel = newClient.generationModel;
          embeddingModel = newClient.embeddingModel;
          
          console.log('🔄 Retrying with new API key...');
          continue; // Retry immediately with new key
        }
      }
      
      // Last attempt or not a retryable error
      if (attempt === retries || (!is503 && !is429)) {
        console.error('❌ Error generating content:', error.message);
        
        // Try Flash model as last resort
        if ((is503 || is429) && flashModel) {
          console.warn('⚡ Falling back to Flash model...');
          try {
            const flashResult = await flashModel.generateContent(prompt);
            return flashResult.response.text();
          } catch (flashError) {
            throw new Error(`All models failed: ${error.message}`);
          }
        }
        
        throw new Error(`Gemini generation failed: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
      console.warn(`⏳ Retry ${attempt + 1}/${retries} after ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries exceeded');
};

/**
 * Generate structured JSON response
 */
export const generateJSON = async <T = any>(prompt: string): Promise<T> => {
  if (!generationModel) {
    throw new Error('Gemini API is not configured');
  }

  try {
    const result = await generationModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonText.trim());
  } catch (error: any) {
    console.error('Error generating JSON:', error);
    throw new Error(`Gemini JSON generation failed: ${error.message}`);
  }
};

/**
 * Generate with streaming (for real-time responses)
 */
export const generateContentStream = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!generationModel) {
    throw new Error('Gemini API is not configured');
  }

  try {
    const result = await generationModel.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      onChunk(text);
    }
  } catch (error: any) {
    console.error('Error streaming content:', error);
    throw new Error(`Gemini streaming failed: ${error.message}`);
  }
};

// ============================================
// EMBEDDING FUNCTIONS
// ============================================

/**
 * Generate embedding for text
 * Returns 768-dimensional vector (text-embedding-004)
 * Auto-rotates API keys on quota errors
 */
export const embedText = async (text: string, retries = 2): Promise<number[]> => {
  if (!embeddingModel) {
    throw new Error('Gemini Embedding API is not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error: any) {
      const is429 = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      // If quota error, try rotating to next API key
      if (is429 && API_KEYS.length > 1 && attempt < retries) {
        const rotated = rotateToNextKey();
        
        if (rotated) {
          // Reinitialize client with new key
          const newClient = initializeGeminiClient();
          genAI = newClient.genAI;
          generationModel = newClient.generationModel;
          embeddingModel = newClient.embeddingModel;
          
          console.log('🔄 Retrying embedding with new API key...');
          continue; // Retry immediately with new key
        }
      }
      
      console.error('❌ Error generating embedding:', error.message);
      throw new Error(`Gemini embedding failed: ${error.message}`);
    }
  }
  
  throw new Error('Max embedding retries exceeded');
};

/**
 * Batch embed multiple texts
 * More efficient than calling embedText multiple times
 */
export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured');
  }

  try {
    const embeddings = await Promise.all(texts.map(text => embedText(text)));
    return embeddings;
  } catch (error: any) {
    console.error('Error batch embedding:', error);
    throw new Error(`Gemini batch embedding failed: ${error.message}`);
  }
};

// ============================================
// RATE LIMITING HELPERS
// ============================================

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 30000; // 30 seconds for 2 req/min

/**
 * Wait for rate limit if needed
 */
export const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limit: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

/**
 * Generate with automatic rate limiting
 */
export const generateWithRateLimit = async (prompt: string): Promise<string> => {
  await waitForRateLimit();
  return generateContent(prompt);
};

/**
 * Check if Gemini is configured
 */
export const isGeminiConfigured = (): boolean => {
  return Boolean(API_KEYS.length > 0 && generationModel);
};

// ============================================
// FALLBACK TO FLASH MODEL
// ============================================

let flashModel: GenerativeModel | null = null;

if (genAI) {
  flashModel = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
}

/**
 * Generate with automatic fallback to Flash on rate limit
 */
export const generateWithFallback = async (prompt: string): Promise<string> => {
  try {
    return await generateContent(prompt);
  } catch (error: any) {
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.warn('Rate limited on Pro, falling back to Flash model');
      
      if (!flashModel) {
        throw new Error('Flash model not available');
      }
      
      const result = await flashModel.generateContent(prompt);
      return result.response.text();
    }
    throw error;
  }
};

// ============================================
// CUSTOM API KEY SUPPORT (Self-Hosted)
// ============================================

/**
 * Create custom Gemini client with provided API key
 * For self-hosted deployments with custom AI configuration
 */
export const createCustomGeminiClient = (apiKey: string, model: string = 'gemini-1.5-flash') => {
  const customGenAI = new GoogleGenerativeAI(apiKey);
  const customModel = customGenAI.getGenerativeModel({ 
    model,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });
  
  return { genAI: customGenAI, model: customModel };
};

/**
 * Get AI config from localStorage (client-side only)
 * Returns null if not found or if running on server
 */
export const getStoredAIConfig = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('ai_config');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse AI config:', error);
    return null;
  }
};

/**
 * Generate content with custom or default client
 * Checks localStorage for custom AI config first
 */
export const generateWithCustomConfig = async (
  prompt: string,
  customApiKey?: string,
  customModel?: string
): Promise<string> => {
  // Try custom config first
  if (customApiKey && customModel) {
    const { model } = createCustomGeminiClient(customApiKey, customModel);
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  
  // Fall back to default
  return generateContent(prompt);
};

// Export instances
export { genAI, generationModel, embeddingModel, flashModel };

