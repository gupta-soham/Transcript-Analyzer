import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../lib/gemini-service';
import { TranscriptEntry } from '../lib/types';

// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    text: () => JSON.stringify({
                        summary: 'Test summary',
                        highlights: [{ content: 'Test highlight', relevanceScore: 8 }],
                        lowlights: [{ content: 'Test lowlight', issueType: 'confusion' }],
                        namedEntities: [{ name: 'Speaker 1', type: 'speaker', mentions: [] }]
                    })
                }
            })
        })
    }))
}));

describe('GeminiService', () => {
    let service: GeminiService;
    const mockTranscript: TranscriptEntry[] = [
        {
            timestamp: '00:01:00',
            section: 'introduction',
            content: 'Hello, welcome to the interview.'
        },
        {
            timestamp: '00:02:00',
            section: 'questions',
            content: 'Can you tell me about yourself?'
        }
    ];

    beforeEach(() => {
        service = new GeminiService('test-api-key');
    });

    it('should create service with API key', () => {
        expect(service).toBeInstanceOf(GeminiService);
    });

    it('should throw error without API key', () => {
        expect(() => new GeminiService('')).toThrow('Gemini API key is required');
    });

    it('should analyze transcript successfully', async () => {
        const result = await service.analyzeTranscript(mockTranscript);

        expect(result).toHaveProperty('summary');
        expect(result).toHaveProperty('highlights');
        expect(result).toHaveProperty('lowlights');
        expect(result).toHaveProperty('namedEntities');
        expect(result).toHaveProperty('metadata');
        expect(result.metadata).toHaveProperty('totalDuration');
        expect(result.metadata).toHaveProperty('wordCount');
        expect(result.metadata).toHaveProperty('processedAt');
    });

    it('should throw error for empty transcript', async () => {
        await expect(service.analyzeTranscript([])).rejects.toThrow('Transcript cannot be empty');
    });

    it('should calculate total duration correctly', () => {
        const duration = (service as any).calculateTotalDuration(mockTranscript);
        expect(duration).toBe('00:02:00');
    });

    it('should calculate word count correctly', () => {
        const wordCount = (service as any).calculateWordCount(mockTranscript);
        expect(wordCount).toBeGreaterThan(0);
    });

    it('should validate API key format', () => {
        expect(GeminiService.validateApiKey('valid-key')).toBe(true);
        expect(GeminiService.validateApiKey('')).toBe(false);
        expect(GeminiService.validateApiKey('   ')).toBe(false);
    });
});