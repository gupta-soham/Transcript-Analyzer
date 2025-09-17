import { NextRequest, NextResponse } from 'next/server';
import { TranscriptParser } from '@/lib/transcript-parser';
import { GeminiService } from '@/lib/gemini-service';
import { ErrorCode, FILE_CONSTRAINTS, ApiResponse, ApiErrorResponse, TranscriptionResult, TranscriptEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                error: {
                    code: ErrorCode.INVALID_FILE_FORMAT,
                    message: 'No file provided',
                },
                timestamp: new Date().toISOString(),
            } as ApiErrorResponse, { status: 400 });
        }

        // Validate file size
        if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
            return NextResponse.json({
                success: false,
                error: {
                    code: ErrorCode.FILE_TOO_LARGE,
                    message: `File size exceeds ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB limit`,
                },
                timestamp: new Date().toISOString(),
            } as ApiErrorResponse, { status: 400 });
        }

        // Validate file type
        const isTextFile = FILE_CONSTRAINTS.TEXT_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
        const isAudioFile = FILE_CONSTRAINTS.AUDIO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isTextFile && !isAudioFile) {
            return NextResponse.json({
                success: false,
                error: {
                    code: ErrorCode.INVALID_FILE_FORMAT,
                    message: 'Only .txt files or audio files (.mp3, .wav, .ogg, .m4a) are supported',
                },
                timestamp: new Date().toISOString(),
            } as ApiErrorResponse, { status: 400 });
        }

        // Handle audio files - transcribe first
        let transcript: TranscriptEntry[] = [];
        let transcriptionResult: TranscriptionResult | null = null;

        if (isAudioFile) {
            // Transcribe audio file
            let geminiService;
            try {
                geminiService = GeminiService.fromEnvironment();
            } catch {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: ErrorCode.API_KEY_MISSING,
                        message: 'Gemini API key not configured',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiErrorResponse, { status: 500 });
            }

            try {
                transcriptionResult = await geminiService.transcribeAudio(file);
                // Parse the transcribed text into transcript entries
                transcript = TranscriptParser.parseTranscriptFromText(transcriptionResult.transcript);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
                let errorCode = ErrorCode.API_REQUEST_FAILED;

                if (errorMessage.includes(ErrorCode.RATE_LIMIT_EXCEEDED)) {
                    errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
                } else if (errorMessage.includes(ErrorCode.API_KEY_MISSING)) {
                    errorCode = ErrorCode.API_KEY_MISSING;
                } else if (errorMessage.includes(ErrorCode.NETWORK_ERROR)) {
                    errorCode = ErrorCode.NETWORK_ERROR;
                }

                return NextResponse.json({
                    success: false,
                    error: {
                        code: errorCode,
                        message: errorMessage.replace(/^[A-Z_]+:\s*/, ''),
                    },
                    timestamp: new Date().toISOString(),
                } as ApiErrorResponse, { status: 500 });
            }
        } else {
            // Handle text files - existing logic
            // Read file content
            const fileContent = await file.text();

            if (!fileContent.trim()) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: ErrorCode.PARSING_ERROR,
                        message: 'File is empty',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiErrorResponse, { status: 400 });
            }

            // Parse transcript
            try {
                transcript = TranscriptParser.parseTranscript(fileContent);
            } catch (error: unknown) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: ErrorCode.PARSING_ERROR,
                        message: error instanceof Error ? error.message : 'Failed to parse transcript',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiErrorResponse, { status: 400 });
            }
        }

        // Analyze with Gemini API
        let geminiService;
        try {
            geminiService = GeminiService.fromEnvironment();
        } catch {
            return NextResponse.json({
                success: false,
                error: {
                    code: ErrorCode.API_KEY_MISSING,
                    message: 'Gemini API key not configured',
                },
                timestamp: new Date().toISOString(),
            } as ApiErrorResponse, { status: 500 });
        }

        let analysisResult;
        try {
            analysisResult = await geminiService.analyzeTranscript(transcript);
        } catch (error: unknown) {
            // Extract error code from error message if present
            const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
            let errorCode = ErrorCode.API_REQUEST_FAILED;

            if (errorMessage.includes(ErrorCode.RATE_LIMIT_EXCEEDED)) {
                errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
            } else if (errorMessage.includes(ErrorCode.API_KEY_MISSING)) {
                errorCode = ErrorCode.API_KEY_MISSING;
            } else if (errorMessage.includes(ErrorCode.NETWORK_ERROR)) {
                errorCode = ErrorCode.NETWORK_ERROR;
            }

            return NextResponse.json({
                success: false,
                error: {
                    code: errorCode,
                    message: errorMessage.replace(/^[A-Z_]+:\s*/, ''), // Remove error code prefix
                },
                timestamp: new Date().toISOString(),
            } as ApiErrorResponse, { status: 500 });
        }

        // Return successful response with transcription info if applicable
        const responseData = {
            ...analysisResult,
            transcriptEntries: transcript,
            transcription: transcriptionResult ? {
                originalFile: file.name,
                transcript: transcriptionResult.transcript,
                duration: transcriptionResult.duration,
                wordCount: transcriptionResult.wordCount,
            } : null,
        };

        return NextResponse.json({
            success: true,
            data: responseData,
            timestamp: new Date().toISOString(),
        } as ApiResponse<typeof responseData>, { status: 200 });

    } catch (error: unknown) {
        console.error('Unexpected error in analyze-transcript API:', error);

        return NextResponse.json({
            success: false,
            error: {
                code: ErrorCode.UNKNOWN_ERROR,
                message: 'An unexpected error occurred',
            },
            timestamp: new Date().toISOString(),
        } as ApiErrorResponse, { status: 500 });
    }
}