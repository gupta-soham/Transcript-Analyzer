import {
    TranscriptEntry,
    AnalysisResult,
    HighlightItem,
    LowlightItem,
    NamedEntity,
    EntityMention,
    ApiResponse,
    ApiErrorResponse
} from './types';

/**
 * Type guard to check if an object is a valid TranscriptEntry
 */
export function isTranscriptEntry(obj: unknown): obj is TranscriptEntry {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        typeof record.timestamp === 'string' &&
        typeof record.section === 'string' &&
        typeof record.content === 'string'
    );
}

/**
 * Type guard to check if an object is a valid HighlightItem
 */
export function isHighlightItem(obj: unknown): obj is HighlightItem {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        typeof record.content === 'string' &&
        (record.timestamp === undefined || typeof record.timestamp === 'string') &&
        (record.relevanceScore === undefined || typeof record.relevanceScore === 'number')
    );
}

/**
 * Type guard to check if an object is a valid LowlightItem
 */
export function isLowlightItem(obj: unknown): obj is LowlightItem {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        typeof record.content === 'string' &&
        typeof record.issueType === 'string' &&
        (record.timestamp === undefined || typeof record.timestamp === 'string')
    );
}

/**
 * Type guard to check if an object is a valid EntityMention
 */
export function isEntityMention(obj: unknown): obj is EntityMention {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        typeof record.content === 'string' &&
        typeof record.context === 'string' &&
        (record.timestamp === undefined || typeof record.timestamp === 'string')
    );
}

/**
 * Type guard to check if an object is a valid NamedEntity
 */
export function isNamedEntity(obj: unknown): obj is NamedEntity {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        typeof record.name === 'string' &&
        typeof record.type === 'string' &&
        ['speaker', 'organization', 'location', 'other'].includes(record.type as string) &&
        Array.isArray(record.mentions) &&
        record.mentions.every(isEntityMention)
    );
}

/**
 * Type guard to check if an object is a valid AnalysisResult
 */
export function isAnalysisResult(obj: unknown): obj is AnalysisResult {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    const metadata = record.metadata as Record<string, unknown>;
    return (
        typeof record.summary === 'string' &&
        Array.isArray(record.highlights) &&
        record.highlights.every(isHighlightItem) &&
        Array.isArray(record.lowlights) &&
        record.lowlights.every(isLowlightItem) &&
        Array.isArray(record.namedEntities) &&
        record.namedEntities.every(isNamedEntity) &&
        typeof metadata === 'object' &&
        metadata !== null &&
        typeof metadata.totalDuration === 'string' &&
        typeof metadata.wordCount === 'number' &&
        typeof metadata.processedAt === 'string'
    );
}

/**
 * Type guard to check if a response is a success response
 */
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return (
        record.success === true &&
        'data' in record &&
        typeof record.timestamp === 'string'
    );
}

/**
 * Type guard to check if a response is an error response
 */
export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    const error = record.error as Record<string, unknown>;
    return (
        record.success === false &&
        typeof error === 'object' &&
        error !== null &&
        typeof error.code === 'string' &&
        typeof error.message === 'string' &&
        typeof record.timestamp === 'string'
    );
}

/**
 * Helper function to safely parse JSON with type checking
 */
export function parseAnalysisResult(jsonString: string): AnalysisResult | null {
    try {
        const parsed = JSON.parse(jsonString);
        return isAnalysisResult(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Helper function to create a properly formatted error response
 */
export function createErrorResponse(code: string, message: string, details?: unknown): ApiErrorResponse {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Helper function to create a properly formatted success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
}