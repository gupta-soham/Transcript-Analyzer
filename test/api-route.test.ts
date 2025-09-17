import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/analyze-transcript/route';

// Mock the dependencies
vi.mock('../lib/transcript-parser', () => ({
    TranscriptParser: {
        parseTranscript: vi.fn().mockReturnValue([
            { timestamp: '00:01:00', section: 'test', content: 'Test content' }
        ])
    }
}));

vi.mock('../lib/gemini-service', () => ({
    GeminiService: {
        fromEnvironment: vi.fn().mockReturnValue({
            analyzeTranscript: vi.fn().mockResolvedValue({
                summary: 'Test summary',
                highlights: [],
                lowlights: [],
                namedEntities: [],
                metadata: {
                    totalDuration: '00:01:00',
                    wordCount: 2,
                    processedAt: new Date().toISOString()
                }
            })
        })
    }
}));

describe('/api/analyze-transcript', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-key';
    });

    it('should return 400 for missing file', async () => {
        const formData = new FormData();
        const request = new NextRequest('http://localhost:3000/api/analyze-transcript', {
            method: 'POST',
            body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('INVALID_FILE_FORMAT');
    });

    it('should return 400 for invalid file type', async () => {
        const formData = new FormData();
        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        formData.append('file', file);

        const request = new NextRequest('http://localhost:3000/api/analyze-transcript', {
            method: 'POST',
            body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('INVALID_FILE_FORMAT');
    });

    it('should return 400 for file too large', async () => {
        const formData = new FormData();
        const largeContent = 'x'.repeat(25 * 1024 * 1024); // 25MB (larger than 20MB limit)
        const file = new File([largeContent], 'test.txt', { type: 'text/plain' });
        formData.append('file', file);

        const request = new NextRequest('http://localhost:3000/api/analyze-transcript', {
            method: 'POST',
            body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('FILE_TOO_LARGE');
    });

    it('should process valid file successfully', async () => {
        const formData = new FormData();
        const file = new File(['- 00:01:00 test Valid transcript content'], 'test.txt', { type: 'text/plain' });
        formData.append('file', file);

        const request = new NextRequest('http://localhost:3000/api/analyze-transcript', {
            method: 'POST',
            body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('summary');
        expect(data.data).toHaveProperty('metadata');
    });
});