import { TranscriptEntry, ErrorCode } from './types';

/**
 * Error thrown when transcript parsing fails
 */
export class TranscriptParseError extends Error {
    constructor(
        message: string,
        public code: ErrorCode = ErrorCode.PARSING_ERROR,
        public line?: number
    ) {
        super(message);
        this.name = 'TranscriptParseError';
    }
}

/**
 * Utility class for parsing and validating timestamped transcript files
 */
export class TranscriptParser {
    // Regex pattern for timestamp validation (HH:MM:SS format)
    private static readonly TIMESTAMP_PATTERN = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

    // Regex pattern for transcript line format: - HH:MM:SS section_name content
    private static readonly TRANSCRIPT_LINE_PATTERN = /^-\s+(\d{1,2}:\d{2}:\d{2})\s+(\S+)\s+(.+)$/;

    // Minimum content length for a valid transcript entry
    private static readonly MIN_CONTENT_LENGTH = 1;

    /**
     * Validates if a timestamp string matches the HH:MM:SS format
     * @param timestamp - The timestamp string to validate
     * @returns true if valid, false otherwise
     */
    static isValidTimestamp(timestamp: string): boolean {
        return this.TIMESTAMP_PATTERN.test(timestamp.trim());
    }

    /**
     * Validates if the transcript content follows the expected format
     * @param content - The raw transcript content to validate
     * @returns true if valid, false otherwise
     */
    static validateFormat(content: string): boolean {
        if (!content || typeof content !== 'string') {
            return false;
        }

        const lines = content.trim().split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            return false;
        }

        // Check if at least one line matches the expected format
        let hasValidLine = false;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines
            if (!trimmedLine) {
                continue;
            }

            // Check if line matches the expected format
            const match = this.TRANSCRIPT_LINE_PATTERN.exec(trimmedLine);
            if (match) {
                const [, timestamp] = match;
                if (this.isValidTimestamp(timestamp)) {
                    hasValidLine = true;
                    break;
                }
            }
        }

        return hasValidLine;
    }

    /**
     * Parses a transcript string into structured TranscriptEntry objects
     * @param content - The raw transcript content to parse
     * @returns Array of TranscriptEntry objects
     * @throws TranscriptParseError if parsing fails
     */
    static parseTranscript(content: string): TranscriptEntry[] {
        if (!content || typeof content !== 'string') {
            throw new TranscriptParseError(
                'Invalid input: content must be a non-empty string',
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        const lines = content.trim().split('\n');
        const entries: TranscriptEntry[] = [];
        const errors: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNumber = i + 1;

            // Skip empty lines
            if (!line) {
                continue;
            }

            try {
                const entry = this.parseLine(line, lineNumber);
                if (entry) {
                    entries.push(entry);
                }
            } catch (error) {
                if (error instanceof TranscriptParseError) {
                    errors.push(`Line ${lineNumber}: ${error.message}`);
                } else {
                    errors.push(`Line ${lineNumber}: Unexpected error during parsing`);
                }
            }
        }

        // If we have any parsing errors, throw an error with detailed information
        if (errors.length > 0) {
            throw new TranscriptParseError(
                `Failed to parse transcript. Errors found:\n${errors.join('\n')}`,
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        // If we have no valid entries, throw an error
        if (entries.length === 0) {
            throw new TranscriptParseError(
                'No valid transcript entries found. Expected format: - HH:MM:SS section_name content',
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        return entries;
    }

    /**
     * Parses a single line of transcript content
     * @param line - The line to parse
     * @param lineNumber - The line number for error reporting
     * @returns TranscriptEntry object or null if line should be skipped
     * @throws TranscriptParseError if line format is invalid
     */
    private static parseLine(line: string, lineNumber: number): TranscriptEntry | null {


        // Match the expected format: - HH:MM:SS section_name content
        const match = this.TRANSCRIPT_LINE_PATTERN.exec(line);

        if (!match) {
            throw new TranscriptParseError(
                `Invalid line format. Expected: - HH:MM:SS section_name content`,
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        const [, timestamp, section, content] = match;

        // Validate timestamp format
        if (!this.isValidTimestamp(timestamp)) {
            throw new TranscriptParseError(
                `Invalid timestamp format: ${timestamp}. Expected HH:MM:SS`,
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        // Validate section name (should not be empty and should be lowercase)
        if (!section || section.trim().length === 0) {
            throw new TranscriptParseError(
                'Section name cannot be empty',
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        // Section names should be lowercase (to distinguish from content that starts with capital letters)
        if (section !== section.toLowerCase()) {
            throw new TranscriptParseError(
                'Section name should be lowercase. This might indicate a missing section name.',
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        // Validate content (should not be empty)
        if (!content || content.trim().length < this.MIN_CONTENT_LENGTH) {
            throw new TranscriptParseError(
                'Content cannot be empty',
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        return {
            timestamp: timestamp.trim(),
            section: section.trim(),
            content: content.trim()
        };
    }

    /**
     * Calculates the total duration of the transcript based on timestamps
     * @param entries - Array of TranscriptEntry objects
     * @returns Duration string in HH:MM:SS format or null if cannot be calculated
     */
    static calculateDuration(entries: TranscriptEntry[]): string | null {
        if (entries.length === 0) {
            return null;
        }

        try {
            // Find the latest timestamp
            let maxSeconds = 0;

            for (const entry of entries) {
                const seconds = this.timestampToSeconds(entry.timestamp);
                if (seconds > maxSeconds) {
                    maxSeconds = seconds;
                }
            }

            return this.secondsToTimestamp(maxSeconds);
        } catch {
            return null;
        }
    }

    /**
     * Converts timestamp string to total seconds
     * @param timestamp - Timestamp in HH:MM:SS format
     * @returns Total seconds
     */
    private static timestampToSeconds(timestamp: string): number {
        const [hours, minutes, seconds] = timestamp.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    /**
     * Converts total seconds to timestamp string
     * @param totalSeconds - Total seconds
     * @returns Timestamp in HH:MM:SS format
     */
    private static secondsToTimestamp(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Counts total words in all transcript entries
     * @param entries - Array of TranscriptEntry objects
     * @returns Total word count
     */
    static countWords(entries: TranscriptEntry[]): number {
        return entries.reduce((total, entry) => {
            const words = entry.content.trim().split(/\s+/).filter(word => word.length > 0);
            return total + words.length;
        }, 0);
    }

    /**
     * Parses a transcript string from Gemini transcription output
     * Expected format: [HH:MM:SS] Speaker: Content
     * @param content - The raw transcript content from Gemini
     * @returns Array of TranscriptEntry objects
     * @throws TranscriptParseError if parsing fails
     */
    static parseTranscriptFromText(content: string): TranscriptEntry[] {
        if (!content || typeof content !== 'string') {
            throw new TranscriptParseError(
                'Invalid input: content must be a non-empty string',
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        // console.log('DEBUG: Raw Gemini output:', content.substring(0, 500)); // Debug first 500 chars

        const lines = content.trim().split('\n');
        const entries: TranscriptEntry[] = [];
        const errors: string[] = [];

        // console.log(`DEBUG: Total lines: ${lines.length}`);
        // console.log('DEBUG: First 10 lines:', lines.slice(0, 10));

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNumber = i + 1;

            // Skip empty lines
            if (!line) {
                continue;
            }

            try {
                const entry = this.parseGeminiLine(line, lineNumber);
                if (entry) {
                    entries.push(entry);
                }
            } catch (error) {
                if (error instanceof TranscriptParseError) {
                    errors.push(`Line ${lineNumber}: ${error.message}`);
                } else {
                    errors.push(`Line ${lineNumber}: Unexpected error during parsing`);
                }
            }
        }

        // If we have any parsing errors, try fallback parsing
        if (errors.length > 0 && errors.length < lines.length * 0.8) { // Less than 80% errors
            // console.log('DEBUG: Trying fallback parsing for partial success');
            // Try to parse what we can and create entries for the rest
            const fallbackEntries = this.parseTranscriptFallback(content);
            if (fallbackEntries.length > 0) {
                // console.log(`DEBUG: Fallback parsing successful, created ${fallbackEntries.length} entries`);
                return [...entries, ...fallbackEntries];
            }
        }

        // If we have any parsing errors, throw an error with detailed information
        if (errors.length > 0) {
            // console.log('DEBUG: Parsing errors:', errors.slice(0, 5)); // Debug first 5 errors
            throw new TranscriptParseError(
                `Failed to parse transcript. Errors found:\n${errors.join('\n')}`,
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        // If we have no valid entries, throw an error
        if (entries.length === 0) {
            throw new TranscriptParseError(
                'No valid transcript entries found. Expected format: [HH:MM:SS] Speaker: Content',
                ErrorCode.INVALID_FILE_FORMAT
            );
        }

        return entries;
    }

    /**
     * Parses a single line from Gemini transcription output
     * Handles multiple possible formats that Gemini might return
     * @param line - The line to parse
     * @param lineNumber - The line number for error reporting
     * @returns TranscriptEntry object or null if line should be skipped
     * @throws TranscriptParseError if line format is invalid
     */
    private static parseGeminiLine(line: string, lineNumber: number): TranscriptEntry | null {
        // console.log(`DEBUG: Parsing line ${lineNumber}: "${line}"`);

        // Skip lines that are clearly not transcript content
        if (line.length < 5 || /^\d+\.$/.test(line) || line.toLowerCase().includes('transcript')) {
            // console.log(`DEBUG: Skipping line ${lineNumber} - appears to be header/metadata`);
            return null;
        }

        // Pattern 1: [HH:MM:SS] Speaker: Content
        const bracketPattern = /^\[(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)$/;
        let match = line.match(bracketPattern);
        if (match) {
            const [, timestamp, speaker, content] = match;
            // console.log(`DEBUG: Matched bracket pattern for line ${lineNumber}`);
            return this.createTranscriptEntry(timestamp, speaker, content, lineNumber);
        }

        // Pattern 2: HH:MM:SS Speaker: Content (no brackets)
        const noBracketPattern = /^(\d{1,2}:\d{2}:\d{2})\s+([^:]+):\s*(.+)$/;
        match = line.match(noBracketPattern);
        if (match) {
            const [, timestamp, speaker, content] = match;
            // console.log(`DEBUG: Matched no-bracket pattern for line ${lineNumber}`);
            return this.createTranscriptEntry(timestamp, speaker, content, lineNumber);
        }

        // Pattern 3: Speaker: [HH:MM:SS] Content
        const speakerFirstPattern = /^([^:]+):\s*\[(\d{1,2}:\d{2}:\d{2})\]\s*(.+)$/;
        match = line.match(speakerFirstPattern);
        if (match) {
            const [, speaker, timestamp, content] = match;
            // console.log(`DEBUG: Matched speaker-first pattern for line ${lineNumber}`);
            return this.createTranscriptEntry(timestamp, speaker, content, lineNumber);
        }

        // Pattern 4: HH:MM:SS - Speaker: Content
        const dashPattern = /^(\d{1,2}:\d{2}:\d{2})\s*-\s*([^:]+):\s*(.+)$/;
        match = line.match(dashPattern);
        if (match) {
            const [, timestamp, speaker, content] = match;
            // console.log(`DEBUG: Matched dash pattern for line ${lineNumber}`);
            return this.createTranscriptEntry(timestamp, speaker, content, lineNumber);
        }

        // Pattern 5: Just content with timestamp somewhere (fallback)
        const timestampInContent = line.match(/(\d{1,2}:\d{2}:\d{2})/);
        if (timestampInContent) {
            const timestamp = timestampInContent[1];
            // Extract content after timestamp
            const contentAfterTimestamp = line.substring(line.indexOf(timestamp) + timestamp.length).trim();
            if (contentAfterTimestamp.length > 10) { // Minimum content length
                // console.log(`DEBUG: Matched fallback pattern for line ${lineNumber}`);
                return this.createTranscriptEntry(timestamp, 'unknown_speaker', contentAfterTimestamp, lineNumber);
            }
        }

        // Pattern 6: Plain text without timestamps (use sequential timestamps)
        if (line.length > 20 && !line.includes(':') && /^[A-Z]/.test(line)) {
            // This might be plain text content, assign a sequential timestamp
            const sequentialTimestamp = this.generateSequentialTimestamp(lineNumber - 1);
            // console.log(`DEBUG: Matched plain text pattern for line ${lineNumber}`);
            return this.createTranscriptEntry(sequentialTimestamp, 'speaker', line, lineNumber);
        }

        // console.log(`DEBUG: No pattern matched for line ${lineNumber}`);
        throw new TranscriptParseError(
            `Invalid line format. Line content: "${line}". Supported formats: [HH:MM:SS] Speaker: Content, HH:MM:SS Speaker: Content, Speaker: [HH:MM:SS] Content, HH:MM:SS - Speaker: Content`,
            ErrorCode.INVALID_FILE_FORMAT,
            lineNumber
        );
    }

    /**
     * Fallback parser for when Gemini returns unstructured text
     * Creates sequential timestamps for plain text content
     * @param content - The raw transcript content
     * @returns Array of TranscriptEntry objects
     */
    private static parseTranscriptFallback(content: string): TranscriptEntry[] {
        const lines = content.trim().split('\n');
        const entries: TranscriptEntry[] = [];
        let currentTimestamp = 0;
        const secondsPerLine = 8; // Assume 8 seconds per line for fallback

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines or very short lines
            if (!line || line.length < 5) {
                continue;
            }

            // Skip lines that look like headers or metadata
            if (line.toLowerCase().includes('transcript') ||
                line.toLowerCase().includes('generated') ||
                /^\d+\.$/.test(line)) {
                continue;
            }

            const timestamp = this.secondsToTimestamp(currentTimestamp);
            entries.push({
                timestamp: timestamp,
                section: 'transcript',
                content: line
            });

            currentTimestamp += secondsPerLine;
        }

        return entries;
    }

    /**
     * Generates a sequential timestamp based on line number
     * @param lineIndex - The line index (0-based)
     * @returns Timestamp string in HH:MM:SS format
     */
    private static generateSequentialTimestamp(lineIndex: number): string {
        // Assume ~10 seconds per line for plain text without timestamps
        const totalSeconds = lineIndex * 10;
        return this.secondsToTimestamp(totalSeconds);
    }

    /**
     * Creates a TranscriptEntry from parsed components
     * @param timestamp - The timestamp string
     * @param speaker - The speaker identifier
     * @param content - The content text
     * @param lineNumber - Line number for error reporting
     * @returns TranscriptEntry object
     * @throws TranscriptParseError if validation fails
     */
    private static createTranscriptEntry(timestamp: string, speaker: string, content: string, lineNumber: number): TranscriptEntry {
        // Validate timestamp format
        if (!this.isValidTimestamp(timestamp)) {
            throw new TranscriptParseError(
                `Invalid timestamp format: ${timestamp}. Expected HH:MM:SS`,
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        // Validate speaker (should not be empty)
        if (!speaker || speaker.trim().length === 0) {
            throw new TranscriptParseError(
                'Speaker cannot be empty',
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        // Validate content (should not be empty)
        if (!content || content.trim().length < this.MIN_CONTENT_LENGTH) {
            throw new TranscriptParseError(
                'Content cannot be empty',
                ErrorCode.INVALID_FILE_FORMAT,
                lineNumber
            );
        }

        return {
            timestamp: timestamp.trim(),
            section: speaker.trim().toLowerCase().replace(/\s+/g, '_'), // Convert speaker to section format
            content: content.trim()
        };
    }

    /**
     * Gets unique section names from transcript entries, sorted alphabetically
     * @param entries - Array of TranscriptEntry objects
     * @returns Array of unique section names sorted alphabetically
     */
    static getUniqueSections(entries: TranscriptEntry[]): string[] {
        const sections = new Set<string>();

        for (const entry of entries) {
            sections.add(entry.section);
        }

        return Array.from(sections).sort();
    }
}