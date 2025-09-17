// Core data models and interfaces for Transcript Analyzer

/**
 * Represents a single entry in a timestamped transcript
 */
export interface TranscriptEntry {
    timestamp: string; // Format: "HH:MM:SS"
    section: string; // Section name (e.g., "introduction")
    content: string; // Transcript content
}

/**
 * Represents a highlight item extracted from the transcript
 */
export interface HighlightItem {
    content: string;
    timestamp?: string;
    relevanceScore?: number;
}

/**
 * Represents a lowlight item (issues/problems) identified in the transcript
 */
export interface LowlightItem {
    content: string;
    timestamp?: string;
    issueType: string;
}

/**
 * Represents a mention of a named entity in the transcript
 */
export interface EntityMention {
    content: string;
    timestamp?: string;
    context: string;
}

/**
 * Represents a named entity (speaker, organization, etc.) identified in the transcript
 */
export interface NamedEntity {
    id: string; // Unique identifier for the entity
    name: string; // e.g., "Speaker 1", "Speaker 2"
    type: "speaker" | "organization" | "location" | "other";
    mentions: EntityMention[];
    tags?: string[]; // User-defined tags for the entity
    tone?: "positive" | "neutral" | "negative" | "mixed"; // Overall tone assessment
    notes?: string; // User notes about the entity
}

/**
 * Complete analysis result returned by the Gemini API
 */
export interface AnalysisResult {
    summary: string;
    highlights: HighlightItem[];
    lowlights: LowlightItem[];
    namedEntities: NamedEntity[];
    transcriptEntries?: TranscriptEntry[]; // Parsed transcript entries for timeline display
    metadata: {
        totalDuration: string;
        wordCount: number;
        processedAt: string;
    };
}
/**
 
* Standard error response format for API endpoints
 */
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

/**
 * Success response wrapper for API endpoints
 */
export interface ApiResponse<T> {
    success: true;
    data: T;
    timestamp: string;
}

/**
 * Error response wrapper for API endpoints
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

/**
 * Union type for all API responses
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**

 * File upload related types
 */
export interface FileUploadState {
    file: File | null;
    isUploading: boolean;
    progress: number;
    error: string | null;
    fileType: 'text' | 'audio' | null;
}

/**
 * Analysis state for UI components
 */
export interface AnalysisState {
    isAnalyzing: boolean;
    progress: number;
    stage: 'parsing' | 'analyzing' | 'formatting' | 'complete' | 'error';
    result: AnalysisResult | null;
    error: string | null;
}

/**
 * Transcription result from audio processing
 */
export interface TranscriptionResult {
    transcript: string; // Raw transcript text with timestamps
    duration: string; // Total duration in HH:MM:SS format
    wordCount: number;
    processedAt: string;
}

/**
 * Gemini API request configuration
 */
export interface GeminiRequestConfig {
    model: string;
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: string;
}

/**
 * Default Gemini configuration
 */
export const DEFAULT_GEMINI_CONFIG: GeminiRequestConfig = {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.1,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
} as const;

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
    INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    PARSING_ERROR = 'PARSING_ERROR',
    API_KEY_MISSING = 'API_KEY_MISSING',
    API_REQUEST_FAILED = 'API_REQUEST_FAILED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * File constraints
 */
export const FILE_CONSTRAINTS = {
    MAX_SIZE_MB: 20, // Increased for audio files
    MAX_SIZE_BYTES: 20 * 1024 * 1024, // 20MB for audio files
    ALLOWED_TYPES: ['text/plain', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'] as const,
    ALLOWED_EXTENSIONS: ['.txt', '.mp3', '.wav', '.ogg', '.m4a'] as const,
    TEXT_EXTENSIONS: ['.txt'] as const,
    AUDIO_EXTENSIONS: ['.mp3', '.wav', '.ogg', '.m4a'] as const,
} as const;