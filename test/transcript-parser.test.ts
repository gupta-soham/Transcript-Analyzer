import { describe, it, expect } from 'vitest';
import { TranscriptParser, TranscriptParseError } from '@/lib/transcript-parser';
import { ErrorCode } from '@/lib/types';

describe('TranscriptParser', () => {
    describe('isValidTimestamp', () => {
        it('should validate correct timestamp formats', () => {
            expect(TranscriptParser.isValidTimestamp('00:00:00')).toBe(true);
            expect(TranscriptParser.isValidTimestamp('12:34:56')).toBe(true);
            expect(TranscriptParser.isValidTimestamp('23:59:59')).toBe(true);
            expect(TranscriptParser.isValidTimestamp('1:23:45')).toBe(true);
            expect(TranscriptParser.isValidTimestamp('01:02:03')).toBe(true);
        });

        it('should reject invalid timestamp formats', () => {
            expect(TranscriptParser.isValidTimestamp('24:00:00')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('12:60:30')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('12:30:60')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('1:2:3')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('12:34')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('12:34:56:78')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('abc:def:ghi')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('')).toBe(false);
            expect(TranscriptParser.isValidTimestamp('12-34-56')).toBe(false);
        });

        it('should handle whitespace in timestamps', () => {
            expect(TranscriptParser.isValidTimestamp(' 12:34:56 ')).toBe(true);
            expect(TranscriptParser.isValidTimestamp('\t12:34:56\t')).toBe(true);
        });
    });

    describe('validateFormat', () => {
        it('should validate correct transcript format', () => {
            const validTranscript = `- 00:00:00 introduction Welcome to the meeting
- 00:01:30 agenda Today we will discuss the project status
- 00:05:00 discussion Let's start with the technical updates`;

            expect(TranscriptParser.validateFormat(validTranscript)).toBe(true);
        });

        it('should validate transcript with single valid line', () => {
            const singleLineTranscript = '- 00:00:00 introduction Welcome to the meeting';
            expect(TranscriptParser.validateFormat(singleLineTranscript)).toBe(true);
        });

        it('should reject invalid transcript formats', () => {
            expect(TranscriptParser.validateFormat('')).toBe(false);
            expect(TranscriptParser.validateFormat('   ')).toBe(false);
            expect(TranscriptParser.validateFormat('No timestamp here')).toBe(false);
            expect(TranscriptParser.validateFormat('00:00:00 introduction Missing dash')).toBe(false);
            expect(TranscriptParser.validateFormat('- 25:00:00 introduction Invalid timestamp')).toBe(false);
        });

        it('should handle null and undefined inputs', () => {
            expect(TranscriptParser.validateFormat(null as any)).toBe(false);
            expect(TranscriptParser.validateFormat(undefined as any)).toBe(false);
            expect(TranscriptParser.validateFormat(123 as any)).toBe(false);
        });

        it('should ignore empty lines and validate mixed content', () => {
            const mixedTranscript = `
      
- 00:00:00 introduction Welcome to the meeting

Some invalid line here
- 00:01:30 agenda Today we will discuss the project status

      `;

            expect(TranscriptParser.validateFormat(mixedTranscript)).toBe(true);
        });
    });

    describe('parseTranscript', () => {
        it('should parse valid transcript correctly', () => {
            const transcript = `- 00:00:00 introduction Welcome to the meeting
- 00:01:30 agenda Today we will discuss the project status
- 00:05:00 discussion Let's start with the technical updates`;

            const result = TranscriptParser.parseTranscript(transcript);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                timestamp: '00:00:00',
                section: 'introduction',
                content: 'Welcome to the meeting'
            });
            expect(result[1]).toEqual({
                timestamp: '00:01:30',
                section: 'agenda',
                content: 'Today we will discuss the project status'
            });
            expect(result[2]).toEqual({
                timestamp: '00:05:00',
                section: 'discussion',
                content: 'Let\'s start with the technical updates'
            });
        });

        it('should handle transcript with extra whitespace', () => {
            const transcript = `  - 00:00:00   introduction   Welcome to the meeting  
      
-   00:01:30 agenda    Today we will discuss the project status   `;

            const result = TranscriptParser.parseTranscript(transcript);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                timestamp: '00:00:00',
                section: 'introduction',
                content: 'Welcome to the meeting'
            });
            expect(result[1]).toEqual({
                timestamp: '00:01:30',
                section: 'agenda',
                content: 'Today we will discuss the project status'
            });
        });

        it('should throw error for invalid input types', () => {
            expect(() => TranscriptParser.parseTranscript(null as any)).toThrow(TranscriptParseError);
            expect(() => TranscriptParser.parseTranscript(undefined as any)).toThrow(TranscriptParseError);
            expect(() => TranscriptParser.parseTranscript(123 as any)).toThrow(TranscriptParseError);
            expect(() => TranscriptParser.parseTranscript('')).toThrow(TranscriptParseError);
        });

        it('should throw error when no valid entries found', () => {
            const invalidTranscript = `Invalid line 1
Another invalid line
No timestamps here`;

            expect(() => TranscriptParser.parseTranscript(invalidTranscript)).toThrow(TranscriptParseError);
        });

        it('should throw error for invalid timestamp format', () => {
            const invalidTranscript = '- 25:00:00 introduction Invalid timestamp';

            expect(() => TranscriptParser.parseTranscript(invalidTranscript)).toThrow(TranscriptParseError);
        });

        it('should throw error for missing section name', () => {
            const invalidTranscript = '- 00:00:00  Welcome to the meeting';

            expect(() => TranscriptParser.parseTranscript(invalidTranscript)).toThrow(TranscriptParseError);
        });

        it('should throw error for empty content', () => {
            const invalidTranscript = '- 00:00:00 introduction ';

            expect(() => TranscriptParser.parseTranscript(invalidTranscript)).toThrow(TranscriptParseError);
        });

        it('should handle content with multiple spaces and special characters', () => {
            const transcript = '- 00:00:00 introduction Welcome to the meeting! How are you doing today?';

            const result = TranscriptParser.parseTranscript(transcript);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                timestamp: '00:00:00',
                section: 'introduction',
                content: 'Welcome to the meeting! How are you doing today?'
            });
        });

        it('should handle single digit hours in timestamps', () => {
            const transcript = '- 1:23:45 discussion This is a test';

            const result = TranscriptParser.parseTranscript(transcript);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                timestamp: '1:23:45',
                section: 'discussion',
                content: 'This is a test'
            });
        });
    });

    describe('calculateDuration', () => {
        it('should calculate duration from transcript entries', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'intro', content: 'Start' },
                { timestamp: '00:05:30', section: 'middle', content: 'Middle' },
                { timestamp: '00:10:15', section: 'end', content: 'End' }
            ];

            const duration = TranscriptParser.calculateDuration(entries);
            expect(duration).toBe('00:10:15');
        });

        it('should return null for empty entries', () => {
            const duration = TranscriptParser.calculateDuration([]);
            expect(duration).toBeNull();
        });

        it('should handle single entry', () => {
            const entries = [
                { timestamp: '00:05:30', section: 'single', content: 'Only entry' }
            ];

            const duration = TranscriptParser.calculateDuration(entries);
            expect(duration).toBe('00:05:30');
        });

        it('should find maximum timestamp correctly', () => {
            const entries = [
                { timestamp: '00:10:00', section: 'middle', content: 'Middle' },
                { timestamp: '00:05:30', section: 'early', content: 'Early' },
                { timestamp: '00:15:45', section: 'late', content: 'Latest' },
                { timestamp: '00:02:15', section: 'start', content: 'Start' }
            ];

            const duration = TranscriptParser.calculateDuration(entries);
            expect(duration).toBe('00:15:45');
        });

        it('should handle hours correctly', () => {
            const entries = [
                { timestamp: '01:30:45', section: 'long', content: 'Long meeting' }
            ];

            const duration = TranscriptParser.calculateDuration(entries);
            expect(duration).toBe('01:30:45');
        });
    });

    describe('countWords', () => {
        it('should count words correctly', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'intro', content: 'Hello world' },
                { timestamp: '00:01:00', section: 'middle', content: 'This is a test' },
                { timestamp: '00:02:00', section: 'end', content: 'Goodbye' }
            ];

            const wordCount = TranscriptParser.countWords(entries);
            expect(wordCount).toBe(7); // "Hello world This is a test Goodbye"
        });

        it('should handle empty entries', () => {
            const wordCount = TranscriptParser.countWords([]);
            expect(wordCount).toBe(0);
        });

        it('should handle entries with extra whitespace', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'test', content: '  Hello   world  ' },
                { timestamp: '00:01:00', section: 'test2', content: '\tThis\nis\na\ttest\n' }
            ];

            const wordCount = TranscriptParser.countWords(entries);
            expect(wordCount).toBe(6); // "Hello world This is a test"
        });

        it('should handle empty content', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'empty', content: '' },
                { timestamp: '00:01:00', section: 'whitespace', content: '   ' },
                { timestamp: '00:02:00', section: 'valid', content: 'Hello world' }
            ];

            const wordCount = TranscriptParser.countWords(entries);
            expect(wordCount).toBe(2); // "Hello world"
        });
    });

    describe('getUniqueSections', () => {
        it('should return unique sections sorted alphabetically', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'introduction', content: 'Start' },
                { timestamp: '00:01:00', section: 'discussion', content: 'Middle' },
                { timestamp: '00:02:00', section: 'introduction', content: 'More intro' },
                { timestamp: '00:03:00', section: 'conclusion', content: 'End' },
                { timestamp: '00:04:00', section: 'discussion', content: 'More discussion' }
            ];

            const sections = TranscriptParser.getUniqueSections(entries);
            expect(sections).toEqual(['conclusion', 'discussion', 'introduction']);
        });

        it('should handle empty entries', () => {
            const sections = TranscriptParser.getUniqueSections([]);
            expect(sections).toEqual([]);
        });

        it('should handle single section', () => {
            const entries = [
                { timestamp: '00:00:00', section: 'only-section', content: 'Content' }
            ];

            const sections = TranscriptParser.getUniqueSections(entries);
            expect(sections).toEqual(['only-section']);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle very long content', () => {
            const longContent = 'A'.repeat(10000);
            const transcript = `- 00:00:00 test ${longContent}`;

            const result = TranscriptParser.parseTranscript(transcript);
            expect(result).toHaveLength(1);
            expect(result[0].content).toBe(longContent);
        });

        it('should handle special characters in section names', () => {
            const transcript = '- 00:00:00 section_with-special.chars Content here';

            const result = TranscriptParser.parseTranscript(transcript);
            expect(result).toHaveLength(1);
            expect(result[0].section).toBe('section_with-special.chars');
        });

        it('should handle unicode characters', () => {
            const transcript = '- 00:00:00 测试 This is a test with unicode: 你好世界 🌍';

            const result = TranscriptParser.parseTranscript(transcript);
            expect(result).toHaveLength(1);
            expect(result[0].section).toBe('测试');
            expect(result[0].content).toBe('This is a test with unicode: 你好世界 🌍');
        });

        it('should provide detailed error information', () => {
            const invalidTranscript = `- 00:00:00 intro Valid line
- 25:00:00 invalid Invalid timestamp
- 00:02:00 another Valid line`;

            try {
                TranscriptParser.parseTranscript(invalidTranscript);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(TranscriptParseError);
                expect((error as TranscriptParseError).code).toBe(ErrorCode.INVALID_FILE_FORMAT);
                expect((error as TranscriptParseError).message).toContain('Line 2');
            }
        });

        it('should handle mixed line endings', () => {
            const transcript = '- 00:00:00 intro First line\r\n- 00:01:00 middle Second line\n- 00:02:00 end Third line\r';

            const result = TranscriptParser.parseTranscript(transcript);
            expect(result).toHaveLength(3);
        });
    });
});