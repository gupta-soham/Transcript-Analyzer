"use client";

import { useState, useCallback } from "react";
import { TranscriptUploader } from "@/components/transcript-uploader";
import { AnalysisResults } from "@/components/analysis-results";
import { LoadingProgress } from "@/components/loading-progress";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  FileUploadState,
  AnalysisState,
  AnalysisResult,
  ApiResult,
  FILE_CONSTRAINTS,
} from "@/lib/types";
import { TranscriptEntry } from "@/lib/types";
import { createSampleTranscriptFile } from "@/lib/sample-data";
import { TranscriptParser } from "@/lib/transcript-parser";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "@/components/logo";

export default function Home() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    progress: 0,
    error: null,
    fileType: null,
  });

  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    []
  );

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    stage: "parsing",
    result: null,
    error: null,
  });

  const analyzeTranscript = useCallback(async (file: File) => {
    try {
      // Set initial analysis state
      setAnalysisState({
        isAnalyzing: true,
        progress: 0,
        stage: "parsing",
        result: null,
        error: null,
      });

      // Parse transcript entries for timeline
      let parsedEntries: TranscriptEntry[] = [];
      if (
        FILE_CONSTRAINTS.TEXT_EXTENSIONS.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        )
      ) {
        // For text files, parse immediately
        const content = await file.text();
        parsedEntries = TranscriptParser.parseTranscript(content);
        setTranscriptEntries(parsedEntries);
      }

      // Smooth progress to parsing start
      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 5 }));
      }, 100);

      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 15 }));
      }, 300);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Update progress - analyzing stage
      setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          progress: 25,
          stage: "analyzing",
        }));
      }, 500);

      // Continue smooth progress during analysis
      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 35 }));
      }, 800);

      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 45 }));
      }, 1200);

      // Make API request
      const response = await fetch("/api/analyze-transcript", {
        method: "POST",
        body: formData,
      });

      // Update progress - formatting stage
      setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          progress: 65,
          stage: "formatting",
        }));
      }, 100);

      // Continue smooth progress during formatting
      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 75 }));
      }, 300);

      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 85 }));
      }, 500);

      const result: ApiResult<AnalysisResult> = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      // Extract transcript entries from the API response
      if (
        result.data.transcriptEntries &&
        result.data.transcriptEntries.length > 0
      ) {
        setTranscriptEntries(result.data.transcriptEntries);
      } else if (!parsedEntries.length && result.data.metadata.wordCount > 0) {
        // Fallback: create basic entries from analysis result for audio files
        parsedEntries = createBasicTranscriptEntries(result.data);
        setTranscriptEntries(parsedEntries);
      }

      // Progress to near completion
      setTimeout(() => {
        setAnalysisState((prev) => ({ ...prev, progress: 95 }));
      }, 200);

      // Wait 2 seconds to show completion visual cue
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Complete analysis with final progress
      setAnalysisState({
        isAnalyzing: false,
        progress: 100,
        stage: "complete",
        result: result.data,
        error: null,
      });

      toast.success("Transcript analyzed successfully!");
    } catch (error: unknown) {
      console.error("Analysis failed:", error);

      setAnalysisState({
        isAnalyzing: false,
        progress: 0,
        stage: "error",
        result: null,
        error:
          error instanceof Error
            ? error.message
            : "Analysis failed. Please try again.",
      });

      setUploadState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Analysis failed. Please try again.",
      }));

      toast.error("Analysis failed. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => {
            if (uploadState.file) {
              analyzeTranscript(uploadState.file);
            }
          },
        },
      });
    }
  }, []);

  // Helper function to create basic transcript entries from analysis result
  const createBasicTranscriptEntries = (
    result: AnalysisResult
  ): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];

    // Create entries from highlights and lowlights
    result.highlights.forEach((highlight, index) => {
      if (highlight.timestamp) {
        entries.push({
          timestamp: highlight.timestamp,
          section: "Interviewer", // Assume interviewer for highlights
          content: highlight.content,
        });
      }
    });

    result.lowlights.forEach((lowlight, index) => {
      if (lowlight.timestamp) {
        entries.push({
          timestamp: lowlight.timestamp,
          section: "Candidate", // Assume candidate for lowlights
          content: lowlight.content,
        });
      }
    });

    // Sort by timestamp
    return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Reset states
      setUploadState({
        file,
        isUploading: false,
        progress: 0,
        error: null,
        fileType: FILE_CONSTRAINTS.TEXT_EXTENSIONS.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        )
          ? "text"
          : "audio",
      });

      setAnalysisState({
        isAnalyzing: false,
        progress: 0,
        stage: "parsing",
        result: null,
        error: null,
      });

      // Start analysis immediately
      await analyzeTranscript(file);
    },
    [analyzeTranscript]
  );

  const handleSampleLoad = useCallback(async () => {
    const sampleFile = createSampleTranscriptFile();
    await handleFileSelect(sampleFile);
  }, [handleFileSelect]);

  const handleRetry = useCallback(() => {
    if (uploadState.file) {
      analyzeTranscript(uploadState.file);
    }
  }, [uploadState.file, analyzeTranscript]);

  const resetToInitialState = useCallback(() => {
    setAnalysisState({
      isAnalyzing: false,
      progress: 0,
      stage: "parsing",
      result: null,
      error: null,
    });
    setUploadState({
      file: null,
      isUploading: false,
      progress: 0,
      error: null,
      fileType: null,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            <Logo size="lg" showText={true} />

            <div className="flex items-center gap-2 sm:gap-4">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ErrorBoundary>
        <TooltipProvider>
          <main
            className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8"
            role="main"
            aria-label="Transcript analysis application"
          >
            {/* Upload Section */}
            {!analysisState.result && (
              <TranscriptUploader
                onFileSelect={handleFileSelect}
                onSampleLoad={handleSampleLoad}
                uploadState={uploadState}
                disabled={analysisState.isAnalyzing}
              />
            )}

            {/* Loading Progress */}
            {analysisState.isAnalyzing && (
              <LoadingProgress analysisState={analysisState} />
            )}

            {/* Error State with Retry */}
            {analysisState.error && !analysisState.isAnalyzing && (
              <div className="w-full max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Analysis Failed
                  </h3>
                  <p className="text-red-700 mb-4">{analysisState.error}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleRetry}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-md w-full sm:w-auto touch-manipulation"
                          aria-label="Retry analysis with the same file"
                        >
                          Try Again
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Retry analysis with the same transcript file</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={resetToInitialState}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-md w-full sm:w-auto touch-manipulation"
                          aria-label="Reset and upload a new file"
                        >
                          Upload New File
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset and upload a different transcript file</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {analysisState.result && (
              <div className="space-y-6 sm:space-y-8">
                <AnalysisResults
                  result={analysisState.result}
                  isLoading={analysisState.isAnalyzing}
                  onResultUpdate={(updatedResult) => {
                    setAnalysisState((prev) => ({
                      ...prev,
                      result: updatedResult,
                    }));
                  }}
                  transcriptEntries={transcriptEntries}
                />

                {/* New Analysis Button */}
                <div className="text-center pt-4 sm:pt-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={resetToInitialState}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium"
                        aria-label="Start a new transcript analysis"
                      >
                        Analyze Another Transcript
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start a new analysis with a different transcript</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </main>
        </TooltipProvider>
      </ErrorBoundary>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by Google Gemini AI • Upload .txt or audio files (.mp3,
            .wav, .ogg, .m4a)
          </p>
        </div>
      </footer>
    </div>
  );
}
