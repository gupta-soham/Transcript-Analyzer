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
import { Upload, FileText, AlertCircle } from "lucide-react";
import { FileUploadState, FILE_CONSTRAINTS } from "@/lib/types";

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
        return;
      }

      // Validate file type
      const isValidType =
        FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as "text/plain") ||
        FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );

      if (!isValidType) {
        return;
      }

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
      className="w-full max-w-2xl mx-auto"
      role="region"
      aria-label="File upload area"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Transcript
        </CardTitle>
        <CardDescription>
          Upload a .txt file with timestamped transcript content or try our
          sample
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`
                        relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                        ${disabled || uploadState.isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
                    `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload
              className={`h-12 w-12 ${dragActive ? "text-primary" : "text-muted-foreground"}`}
            />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {dragActive
                  ? "Drop your file here"
                  : "Drag & drop your transcript file"}
              </p>
              <p className="text-sm text-muted-foreground">
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
              aria-label="Choose transcript file to upload"
            >
              Choose File
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploadState.isUploading}
          />
        </div>

        {/* File Info */}
        {uploadState.file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                {uploadState.file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatFileSize(uploadState.file.size)})
              </span>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadState.progress}%</span>
            </div>
            <Progress value={uploadState.progress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {uploadState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadState.error}</AlertDescription>
          </Alert>
        )}

        {/* File Constraints Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supported format: .txt files only</p>
          <p>• Maximum file size: {FILE_CONSTRAINTS.MAX_SIZE_MB}MB</p>
          <p>• Expected format: - HH:MM:SS section content</p>
        </div>

        {/* Sample Option */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                Try Sample Transcript
              </Label>
              <p className="text-xs text-muted-foreground">
                Load a pre-formatted sample transcript to test the analyzer
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={onSampleLoad}
              disabled={disabled || uploadState.isUploading}
            >
              Load Sample
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
