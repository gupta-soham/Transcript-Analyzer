import { TranscriptEntry } from './types';

/**
 * Regular expression patterns for transcript validation
 */
export const VALIDATION_PATTERNS = {
    // Matches timestamp format: HH:MM:SS (e.g., "01:23:45")
    TIMESTAMP: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,

    // Matches transcript line format: "- HH:MM:SS section_name content"
    TRANSCRIPT_LINE: /^-\s+([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s+(\w+)\s+(.+)$/,

    // Matches section name (alphanumeric and underscores)
    SECTION_NAME: /^[a-zA-Z0-9_]+$/,
} as const;

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates timestamp format (HH:MM:SS)
 */
export function validateTimestamp(timestamp: string): boolean {
    return VALIDATION_PATTERNS.TIMESTAMP.test(timestamp);
}

/**
 * Validates section name format
 */
export function validateSectionName(sectionName: string): boolean {
    return VALIDATION_PATTERNS.SECTION_NAME.test(sectionName) && sectionName.length > 0;
}

/**
 * Validates a single transcript entry
 */
export function validateTranscriptEntry(entry: TranscriptEntry): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate timestamp
    if (!validateTimestamp(entry.timestamp)) {
        errors.push(`Invalid timestamp format: "${entry.timestamp}". Expected HH:MM:SS format.`);
    }

    // Validate section name
    if (!validateSectionName(entry.section)) {
        errors.push(`Invalid section name: "${entry.section}". Must contain only alphanumeric characters and underscores.`);
    }

    // Validate content
    if (!entry.content || entry.content.trim().length === 0) {
        errors.push('Content cannot be empty.');
    }

    // Warning for very short content
    if (entry.content && entry.content.trim().length < 10) {
        warnings.push(`Very short content in section "${entry.section}": "${entry.content}"`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates an array of transcript entries
 */
export function validateTranscriptEntries(entries: TranscriptEntry[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    if (entries.length === 0) {
        allErrors.push('Transcript must contain at least one entry.');
        return {
            isValid: false,
            errors: allErrors,
            warnings: allWarnings,
        };
    }

    // Validate each entry
    entries.forEach((entry, index) => {
        const result = validateTranscriptEntry(entry);

        // Add line number context to errors and warnings
        result.errors.forEach(error => {
            allErrors.push(`Line ${index + 1}: ${error}`);
        });

        result.warnings.forEach(warning => {
            allWarnings.push(`Line ${index + 1}: ${warning}`);
        });
    });

    // Check for duplicate timestamps
    const timestamps = entries.map(entry => entry.timestamp);
    const duplicateTimestamps = timestamps.filter((timestamp, index) =>
        timestamps.indexOf(timestamp) !== index
    );

    if (duplicateTimestamps.length > 0) {
        allWarnings.push(`Duplicate timestamps found: ${[...new Set(duplicateTimestamps)].join(', ')}`);
    }

    // Check chronological order
    for (let i = 1; i < entries.length; i++) {
        const prevTime = timeToSeconds(entries[i - 1].timestamp);
        const currTime = timeToSeconds(entries[i].timestamp);

        if (prevTime > currTime) {
            allWarnings.push(`Timestamps not in chronological order: ${entries[i - 1].timestamp} comes after ${entries[i].timestamp}`);
        }
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
    };
}

/**
 * Validates raw transcript text format
 */
export function validateTranscriptFormat(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content || content.trim().length === 0) {
        errors.push('Transcript content cannot be empty.');
        return { isValid: false, errors, warnings };
    }

    const lines = content.split('\n').filter(line => line.trim().length > 0);

    if (lines.length === 0) {
        errors.push('Transcript must contain at least one valid line.');
        return { isValid: false, errors, warnings };
    }

    // Validate each line format
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (!VALIDATION_PATTERNS.TRANSCRIPT_LINE.test(trimmedLine)) {
            errors.push(`Line ${index + 1}: Invalid format. Expected "- HH:MM:SS section_name content" but got: "${trimmedLine}"`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Helper function to convert HH:MM:SS to seconds for comparison
 */
function timeToSeconds(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}