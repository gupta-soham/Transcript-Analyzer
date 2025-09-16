import { describe, it, expect } from 'vitest';
import {
    isTranscriptEntry,
    isHighlightItem,
    isLowlightItem,
    isEntityMention,
    isNamedEntity,
    isAnalysisResult
} from '../lib/type-guards';

describe('Type Guards', () => {
    describe('isTranscriptEntry', () => {
        it('should return true for valid transcript entry', () => {
            const validEntry = {
                timestamp: '00:01:00',
                section: 'introduction',
                content: 'Hello world'
            };
            expect(isTranscriptEntry(validEntry)).toBe(true);
        });

        it('should return false for invalid transcript entry', () => {
            expect(isTranscriptEntry(null)).toBe(false);
            expect(isTranscriptEntry({})).toBe(false);
            expect(isTranscriptEntry({ timestamp: '00:01:00' })).toBe(false);
            expect(isTranscriptEntry({ timestamp: 123, section: 'test', content: 'test' })).toBe(false);
        });
    });

    describe('isHighlightItem', () => {
        it('should return true for valid highlight item', () => {
            const validHighlight = {
                content: 'Great response',
                timestamp: '00:01:00',
                relevanceScore: 8
            };
            expect(isHighlightItem(validHighlight)).toBe(true);
        });

        it('should return true for highlight without optional fields', () => {
            const minimalHighlight = {
                content: 'Great response'
            };
            expect(isHighlightItem(minimalHighlight)).toBe(true);
        });

        it('should return false for invalid highlight item', () => {
            expect(isHighlightItem(null)).toBe(false);
            expect(isHighlightItem({})).toBe(false);
            expect(isHighlightItem({ timestamp: '00:01:00' })).toBe(false);
        });
    });

    describe('isLowlightItem', () => {
        it('should return true for valid lowlight item', () => {
            const validLowlight = {
                content: 'Unclear response',
                issueType: 'confusion',
                timestamp: '00:01:00'
            };
            expect(isLowlightItem(validLowlight)).toBe(true);
        });

        it('should return false for invalid lowlight item', () => {
            expect(isLowlightItem(null)).toBe(false);
            expect(isLowlightItem({})).toBe(false);
            expect(isLowlightItem({ content: 'test' })).toBe(false);
        });
    });

    describe('isEntityMention', () => {
        it('should return true for valid entity mention', () => {
            const validMention = {
                content: 'John mentioned this',
                context: 'During the introduction',
                timestamp: '00:01:00'
            };
            expect(isEntityMention(validMention)).toBe(true);
        });

        it('should return false for invalid entity mention', () => {
            expect(isEntityMention(null)).toBe(false);
            expect(isEntityMention({})).toBe(false);
            expect(isEntityMention({ content: 'test' })).toBe(false);
        });
    });

    describe('isNamedEntity', () => {
        it('should return true for valid named entity', () => {
            const validEntity = {
                id: 'entity-1',
                name: 'John Doe',
                type: 'speaker' as const,
                mentions: [{
                    content: 'John said this',
                    context: 'During introduction'
                }]
            };
            expect(isNamedEntity(validEntity)).toBe(true);
        });

        it('should return false for invalid named entity', () => {
            expect(isNamedEntity(null)).toBe(false);
            expect(isNamedEntity({})).toBe(false);
            expect(isNamedEntity({ name: 'John', type: 'invalid' })).toBe(false);
        });
    });

    describe('isAnalysisResult', () => {
        it('should return true for valid analysis result', () => {
            const validResult = {
                summary: 'Test summary',
                highlights: [],
                lowlights: [],
                namedEntities: [],
                metadata: {
                    totalDuration: '00:01:00',
                    wordCount: 10,
                    processedAt: new Date().toISOString()
                }
            };
            expect(isAnalysisResult(validResult)).toBe(true);
        });

        it('should return false for invalid analysis result', () => {
            expect(isAnalysisResult(null)).toBe(false);
            expect(isAnalysisResult({})).toBe(false);
            expect(isAnalysisResult({ summary: 'test' })).toBe(false);
        });
    });
});