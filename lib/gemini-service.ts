import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    TranscriptEntry,
    AnalysisResult,
    NamedEntity,
    TranscriptionResult,
    DEFAULT_GEMINI_CONFIG,
    ErrorCode,
} from './types';

/**
 * Service class for interacting with Google's Gemini API
 * Handles transcript analysis and structured response parsing
 */
export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Analyzes a transcript using Gemini API and returns structured results
     * @param transcript Array of transcript entries with timestamps and content
     * @returns Promise resolving to structured analysis results
     * @throws Error for API failures, rate limiting, or invalid responses
     */
    async analyzeTranscript(transcript: TranscriptEntry[]): Promise<AnalysisResult> {
        if (!transcript || transcript.length === 0) {
            throw new Error('Transcript cannot be empty');
        }

        try {
            const prompt = this.buildAnalysisPrompt(transcript);



            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: DEFAULT_GEMINI_CONFIG.temperature,
                    maxOutputTokens: DEFAULT_GEMINI_CONFIG.maxOutputTokens,
                    responseMimeType: 'application/json',
                }
            });

            const result = await model.generateContent(prompt);



            if (!result.response) {
                throw new Error('No response received from Gemini API');
            }

            const responseText = result.response.text();
            if (!responseText) {
                throw new Error('Empty response from Gemini API');
            }

            // Parse the JSON response
            let analysisData;
            try {
                analysisData = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`Failed to parse Gemini API response: ${parseError}`);
            }

            // Add metadata and IDs to the response
            const analysisResult: AnalysisResult = {
                ...analysisData,
                namedEntities: analysisData.namedEntities?.map((entity: NamedEntity, index: number) => ({
                    ...entity,
                    id: `entity-${index}-${Date.now()}`, // Generate unique ID
                })) || [],
                metadata: {
                    totalDuration: this.calculateTotalDuration(transcript),
                    wordCount: this.calculateWordCount(transcript),
                    processedAt: new Date().toISOString(),
                },
            };

            return analysisResult;

        } catch (error: unknown) {
            // Handle specific Gemini API errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                throw new Error(`${ErrorCode.RATE_LIMIT_EXCEEDED}: API rate limit exceeded. Please try again later.`);
            }

            if (errorMessage.includes('API key')) {
                throw new Error(`${ErrorCode.API_KEY_MISSING}: Invalid or missing API key.`);
            }

            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                throw new Error(`${ErrorCode.NETWORK_ERROR}: Network error occurred while contacting Gemini API.`);
            }

            // Re-throw with error code prefix for consistent error handling
            throw new Error(`${ErrorCode.API_REQUEST_FAILED}: ${errorMessage}`);
        }
    }

    /**
     * Transcribes an audio file using Gemini API and returns timestamped text
     * @param audioFile The audio file to transcribe
     * @returns Promise resolving to transcription result
     * @throws Error for API failures, rate limiting, or invalid responses
     */
    async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
        if (!audioFile) {
            throw new Error('Audio file cannot be empty');
        }

        // Validate file size (20MB limit for Gemini)
        if (audioFile.size > 20 * 1024 * 1024) {
            throw new Error('Audio file size exceeds 20MB limit');
        }

        // Validate file type
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
        if (!allowedTypes.includes(audioFile.type)) {
            throw new Error('Unsupported audio format. Supported: MP3, WAV, OGG, M4A');
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 8192,
                    responseMimeType: 'text/plain',
                }
            });

            // Convert File to base64 for Gemini API
            const arrayBuffer = await audioFile.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');

            const prompt = `Please transcribe this audio file and provide the transcript with timestamps in the following EXACT format:

Format each line as: [HH:MM:SS] Speaker: Content

IMPORTANT FORMATTING RULES:
1. Use square brackets [] around timestamps
2. Format: [HH:MM:SS] Speaker: Content
3. Use HH:MM:SS format (e.g., [00:01:23] Interviewer: Hello)
4. Identify speakers clearly (e.g., Interviewer, Candidate, Speaker 1, etc.)
5. Each line should contain one complete thought or sentence
6. Do NOT include any headers, footers, or additional text
7. Do NOT number the lines
8. Start directly with the first timestamped line

Example output:
[00:00:05] Interviewer: Welcome to the interview.
[00:00:12] Candidate: Thank you for having me.
[00:00:18] Interviewer: Can you tell me about your experience?

Please return ONLY the transcript lines in the exact format shown above.`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: audioFile.type,
                    },
                },
            ]);

            if (!result.response) {
                throw new Error('No response received from Gemini API');
            }

            const transcriptText = result.response.text();
            if (!transcriptText) {
                throw new Error('Empty response from Gemini API');
            }

            // Calculate word count and estimate duration
            const wordCount = this.calculateWordCountFromText(transcriptText);
            const estimatedDuration = this.estimateDurationFromWordCount(wordCount);

            const transcriptionResult: TranscriptionResult = {
                transcript: transcriptText,
                duration: estimatedDuration,
                wordCount: wordCount,
                processedAt: new Date().toISOString(),
            };

            return transcriptionResult;

        } catch (error: unknown) {
            // Handle specific Gemini API errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                throw new Error(`${ErrorCode.RATE_LIMIT_EXCEEDED}: API rate limit exceeded. Please try again later.`);
            }

            if (errorMessage.includes('API key')) {
                throw new Error(`${ErrorCode.API_KEY_MISSING}: Invalid or missing API key.`);
            }

            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                throw new Error(`${ErrorCode.NETWORK_ERROR}: Network error occurred while contacting Gemini API.`);
            }

            // Re-throw with error code prefix for consistent error handling
            throw new Error(`${ErrorCode.API_REQUEST_FAILED}: ${errorMessage}`);
        }
    }

    /**
     * Builds the analysis prompt for Gemini API
     * @param transcript Array of transcript entries
     * @returns Formatted prompt string
     */
    private buildAnalysisPrompt(transcript: TranscriptEntry[]): string {
        const transcriptText = transcript
            .map(entry => `[${entry.timestamp}] ${entry.section}: ${entry.content}`)
            .join('\n');

        return `
You are analyzing an interview or conversation transcript. Please provide structured insights with special attention to tone, communication dynamics, and interview-specific patterns:

TRANSCRIPT:
${transcriptText}

ANALYSIS REQUIREMENTS:

1. SUMMARY: Provide a concise overview focusing on:
   - Main topics discussed and key outcomes
   - Overall tone and communication dynamics
   - Interview flow and participant engagement levels
   - Key decisions or conclusions reached

2. HIGHLIGHTS: Identify positive, valuable, or successful moments including:
   - Strong responses or insightful comments
   - Good rapport building or connection moments
   - Clear explanations or demonstrations of expertise
   - Positive emotional tone or enthusiasm
   - Successful problem-solving or creative thinking
   - Assign relevance scores (0-10) and include timestamps

3. LOWLIGHTS: Identify concerning areas, weaker moments, or improvement opportunities:
   - Communication breakdowns or misunderstandings
   - Awkward pauses, interruptions, or flow issues
   - Unclear responses or lack of specificity
   - Signs of discomfort, nervousness, or negative tone
   - Missed opportunities or incomplete answers
   - Technical difficulties or external disruptions
   - Categorize by type: 'communication', 'technical', 'content', 'tone', 'flow'

4. NAMED ENTITIES: Identify and analyze participants:
   - For speakers: Use "Interviewer", "Candidate", "Speaker 1", "Speaker 2", etc.
   - Analyze their communication style and tone throughout
   - Note their level of engagement and contribution
   - Include organizations, companies, technologies, or locations mentioned
   - Provide context for each mention and assess the speaker's familiarity/expertise

TONE AND COMMUNICATION ANALYSIS:
- Pay special attention to emotional undertones, confidence levels, and engagement
- Note any shifts in tone or energy throughout the conversation
- Identify moments of strong connection or disconnect between participants
- Consider cultural communication patterns and professional dynamics

INTERVIEW-SPECIFIC CONSIDERATIONS:
- This appears to be an interview or professional conversation
- Focus on candidate performance, interviewer effectiveness, and overall interaction quality
- Highlight moments that reveal competency, personality, or cultural fit
- Note any red flags or particularly impressive responses

IMPORTANT GUIDELINES:
- Use exact timestamps from the transcript (HH:MM:SS format)
- Be specific and actionable in your analysis
- Focus on insights valuable for interview evaluation or feedback
- Maintain professional objectivity while noting subjective elements like tone
- Consider both verbal content and implied communication dynamics

REQUIRED JSON OUTPUT FORMAT:
{
  "summary": "A comprehensive summary as a single string covering main topics, key outcomes, overall tone, communication dynamics, interview flow, participant engagement, and key decisions",
  "highlights": [
    {
      "content": "Description of the highlight",
      "timestamp": "HH:MM:SS",
      "relevanceScore": 8
    }
  ],
  "lowlights": [
    {
      "content": "Description of the issue or concern",
      "timestamp": "HH:MM:SS", 
      "issueType": "communication|technical|content|tone|flow"
    }
  ],
  "namedEntities": [
    {
      "name": "Entity name (e.g., Interviewer, Candidate, Company Name)",
      "type": "speaker|organization|location|other",
      "mentions": [
        {
          "content": "The specific mention or quote",
          "timestamp": "HH:MM:SS",
          "context": "Context around this mention"
        }
      ]
    }
  ]
}

Please return ONLY the JSON response with no additional text or formatting.
        `.trim();
    }

    /**
     * Calculates total duration from transcript timestamps
     * @param transcript Array of transcript entries
     * @returns Duration string in HH:MM:SS format
     */
    private calculateTotalDuration(transcript: TranscriptEntry[]): string {
        if (transcript.length === 0) return '00:00:00';

        const lastEntry = transcript[transcript.length - 1];
        return lastEntry.timestamp;
    }

    /**
     * Calculates total word count from transcript content
     * @param transcript Array of transcript entries
     * @returns Total word count
     */
    private calculateWordCount(transcript: TranscriptEntry[]): number {
        return transcript.reduce((total, entry) => {
            const words = entry.content.trim().split(/\s+/).filter(word => word.length > 0);
            return total + words.length;
        }, 0);
    }

    /**
     * Calculates word count from raw text
     * @param text Raw text content
     * @returns Word count
     */
    private calculateWordCountFromText(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Estimates duration based on word count (rough approximation: ~150 words per minute)
     * @param wordCount Total word count
     * @returns Estimated duration in HH:MM:SS format
     */
    private estimateDurationFromWordCount(wordCount: number): string {
        const wordsPerMinute = 150;
        const totalMinutes = wordCount / wordsPerMinute;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.floor((totalMinutes % 1) * 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Validates API key format (basic validation)
     * @param apiKey The API key to validate
     * @returns boolean indicating if the key format is valid
     */
    static validateApiKey(apiKey: string): boolean {
        return typeof apiKey === 'string' && apiKey.length > 0 && apiKey.trim().length > 0;
    }

    /**
     * Creates a GeminiService instance with environment variable API key
     * @returns GeminiService instance
     * @throws Error if API key is not found in environment
     */
    static fromEnvironment(): GeminiService {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error(`${ErrorCode.API_KEY_MISSING}: GEMINI_API_KEY environment variable is not set`);
        }

        if (!this.validateApiKey(apiKey)) {
            throw new Error(`${ErrorCode.API_KEY_MISSING}: Invalid GEMINI_API_KEY format`);
        }

        return new GeminiService(apiKey);
    }
}