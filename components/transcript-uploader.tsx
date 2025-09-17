"use client";

import {
  useState,
  useRef,
  DragEvent,
  ChangeEvent,
  memo,
  useCallback,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, Music, Captions } from "lucide-react";
import { FileUploadState, FILE_CONSTRAINTS } from "@/lib/types";
import { toast } from "sonner";

interface TranscriptUploaderProps {
  onFileSelect: (file: File) => void;
  onSampleLoad: () => void;
  uploadState: FileUploadState;
  disabled?: boolean;
}

export const TranscriptUploader = memo(function TranscriptUploader({
  onFileSelect,
  onSampleLoad,
  uploadState,
  disabled = false,
}: TranscriptUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploadState.isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploadState.isUploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileValidation = useCallback(
    (file: File) => {
      // Validate file size
      if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
        toast.error(
          `File too large! Maximum size is ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB`,
          {
            description: `Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          }
        );
        return;
      }

      // Validate file type
      const isTextFile = FILE_CONSTRAINTS.TEXT_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isAudioFile = FILE_CONSTRAINTS.AUDIO_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isTextFile && !isAudioFile) {
        toast.error("Unsupported file type!", {
          description: "Please upload a text file or audio file)",
        });
        return;
      }

      // File is valid, proceed with upload
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleButtonClick = () => {
    if (disabled || uploadState.isUploading) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card
      className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20"
      role="region"
      aria-label="File upload area"
    >
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          Upload Transcript
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Upload a .txt file with timestamped transcript content or an audio
          file (.mp3, .wav, .ogg, .m4a) to transcribe and analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`
                        relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-500 ease-in-out overflow-hidden
                        ${
                          dragActive
                            ? "border-primary bg-gradient-to-br from-primary/8 via-primary/4 to-transparent scale-[1.02] shadow-2xl ring-2 ring-primary/20"
                            : "border-muted-foreground/30 hover:border-primary/40 hover:bg-primary/2"
                        }
                        ${disabled || uploadState.isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:scale-[1.01]"}
                    `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Animated Icons Container */}
            <div className="relative flex items-center justify-center w-32 h-16">
              {/* Main Upload Icon */}
              <Upload
                className={`h-10 w-10 sm:h-12 sm:w-12 transition-all duration-500 relative z-10 ${
                  dragActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground"
                } ${uploadState.isUploading ? "animate-bounce" : ""}`}
              />

              {/* Animated Music Icon (Moves to Left & Tilts Left) */}
              <div
                className={`absolute transition-all duration-700 ease-out ${
                  dragActive
                    ? "opacity-100 scale-90 -translate-x-12 -rotate-12"
                    : "opacity-0 scale-0 translate-x-0 rotate-0"
                }`}
              >
                <Music className="h-8 w-8 sm:h-8 sm:w-8 text-primary drop-shadow-lg transition-all duration-300" />
              </div>

              {/* Animated Captions Icon (Moves to Right & Tilts Right) */}
              <div
                className={`absolute transition-all duration-700 ease-out delay-150 ${
                  dragActive
                    ? "opacity-100 scale-90 translate-x-12 rotate-12"
                    : "opacity-0 scale-0 translate-x-0 rotate-0"
                }`}
              >
                <Captions className="h-8 w-8 sm:h-10 sm:w-10 text-primary drop-shadow-lg transition-all duration-300" />
              </div>
            </div>

            <div className="space-y-3">
              <p
                className={`text-xl font-semibold transition-all duration-300 ${
                  dragActive ? "text-primary scale-105" : "text-foreground"
                }`}
              >
                {dragActive
                  ? "🎯 Drop your file here"
                  : "📁 Drag & drop your transcript or audio file"}
              </p>
              <p className="text-sm text-muted-foreground/80">
                or click to browse files
              </p>
            </div>
            <Button
              variant="outline"
              disabled={disabled || uploadState.isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
              className={`transition-all duration-300 hover:scale-105 touch-manipulation w-full sm:w-auto border-2 ${
                dragActive
                  ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-lg"
                  : "hover:border-primary/60 hover:bg-primary/5"
              }`}
              aria-label="Choose transcript file to upload"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain,.mp3,audio/mpeg,.wav,audio/wav,.ogg,audio/ogg,.m4a,audio/mp4"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploadState.isUploading}
          />
        </div>

        {/* File Info */}
        {uploadState.file && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 animate-in slide-in-from-bottom-2 duration-300 hover:bg-primary/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {uploadState.file.name}
                </span>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadState.file.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="space-y-3 bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 animate-spin" />
                Uploading...
              </span>
              <span className="text-sm font-semibold text-primary">
                {uploadState.progress}%
              </span>
            </div>
            <Progress value={uploadState.progress} className="w-full h-2" />
          </div>
        )}

        {/* Error Display */}
        {uploadState.error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {uploadState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* File Constraints Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2 mb-6 border border-muted-foreground/10">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            File Requirements
          </h4>
          <div className="text-xs text-muted-foreground space-y-1 pl-6">
            <p>
              • Supported formats: .txt files or audio files (.mp3, .wav, .ogg,
              .m4a)
            </p>
            <p>• Maximum file size: {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</p>
            <p>• Text files expected format: - HH:MM:SS section content</p>
            <p>
              • Audio files will be automatically transcribed with timestamps
            </p>
          </div>
        </div>

        {/* Sample Option */}
        <div className="pt-4 border-t border-muted-foreground/20 animate-in slide-in-from-bottom-2 duration-500 delay-100 hover:bg-primary/2 transition-all rounded-lg p-4 -m-4 bg-gradient-to-r from-muted/20 to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Try Sample Transcript
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Load a pre-formatted sample transcript to test the analyzer
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={onSampleLoad}
              disabled={disabled || uploadState.isUploading}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md touch-manipulation w-full sm:w-auto bg-primary/10 hover:bg-primary/20 border-primary/30"
            >
              Load Sample
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
