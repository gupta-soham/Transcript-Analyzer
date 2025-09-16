"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, FileText, Brain, Sparkles } from "lucide-react";
import { AnalysisState } from "@/lib/types";

interface LoadingProgressProps {
  analysisState: AnalysisState;
}

export function LoadingProgress({ analysisState }: LoadingProgressProps) {
  const getStageInfo = (stage: AnalysisState["stage"]) => {
    switch (stage) {
      case "parsing":
        return {
          icon: <FileText className="h-5 w-5" />,
          title: "Parsing Transcript",
          description: "Reading and validating your transcript file...",
          color: "text-slate-600",
        };
      case "analyzing":
        return {
          icon: <Brain className="h-5 w-5" />,
          title: "Analyzing Content",
          description:
            "AI is processing your transcript and extracting insights...",
          color: "text-slate-700",
        };
      case "formatting":
        return {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Formatting Results",
          description: "Organizing analysis results for display...",
          color: "text-slate-600",
        };
      case "complete":
        return {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Analysis Complete",
          description: "Your transcript has been successfully analyzed!",
          color: "text-slate-600",
        };
      case "error":
        return {
          icon: <FileText className="h-5 w-5" />,
          title: "Analysis Error",
          description: "An error occurred during analysis.",
          color: "text-slate-600",
        };
      default:
        return {
          icon: <Loader2 className="h-5 w-5" />,
          title: "Processing",
          description: "Please wait...",
          color: "text-slate-500",
        };
    }
  };

  const stageInfo = getStageInfo(analysisState.stage);

  if (!analysisState.isAnalyzing && analysisState.stage !== "error") {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className={`${stageInfo.color} ${analysisState.isAnalyzing ? "animate-pulse" : ""}`}
          >
            {stageInfo.icon}
          </div>
          {stageInfo.title}
        </CardTitle>
        <CardDescription>{stageInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{analysisState.progress}%</span>
          </div>
          <Progress value={analysisState.progress} className="w-full" />
        </div>

        {/* Stage Indicators */}
        <div className="space-y-3">
          <StageIndicator
            stage="parsing"
            currentStage={analysisState.stage}
            isAnalyzing={analysisState.isAnalyzing}
            label="Parse Transcript"
            delay={0}
          />
          <StageIndicator
            stage="analyzing"
            currentStage={analysisState.stage}
            isAnalyzing={analysisState.isAnalyzing}
            label="AI Analysis"
            delay={100}
          />
          <StageIndicator
            stage="formatting"
            currentStage={analysisState.stage}
            isAnalyzing={analysisState.isAnalyzing}
            label="Format Results"
            delay={200}
          />
        </div>

        {/* Error Display */}
        {analysisState.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{analysisState.error}</p>
          </div>
        )}

        {/* Loading Skeleton Preview */}
        {analysisState.isAnalyzing && (
          <div className="space-y-4 pt-4 border-t animate-in slide-in-from-bottom-2 duration-500 delay-300">
            <p className="text-sm text-muted-foreground">
              Preview of results structure:
            </p>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 animate-pulse" />
              <Skeleton
                className="h-4 w-1/2 animate-pulse"
                style={{ animationDelay: "0.1s" }}
              />
              <Skeleton
                className="h-20 w-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div className="flex gap-2">
                <Skeleton
                  className="h-6 w-16 animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
                <Skeleton
                  className="h-6 w-20 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                <Skeleton
                  className="h-6 w-14 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StageIndicatorProps {
  stage: AnalysisState["stage"];
  currentStage: AnalysisState["stage"];
  isAnalyzing: boolean;
  label: string;
  delay?: number;
}

function StageIndicator({
  stage,
  currentStage,
  isAnalyzing,
  label,
  delay = 0,
}: StageIndicatorProps) {
  const getStageStatus = () => {
    const stageOrder = ["parsing", "analyzing", "formatting", "complete"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stage);

    if (currentStage === "error") {
      return stageIndex === 0 ? "error" : "pending";
    }

    if (stageIndex < currentIndex) {
      return "completed";
    } else if (stageIndex === currentIndex && isAnalyzing) {
      return "active";
    } else if (stageIndex === currentIndex && !isAnalyzing) {
      return "completed";
    } else {
      return "pending";
    }
  };

  const status = getStageStatus();

  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return {
          dot: "bg-green-600",
          text: "text-green-600",
          icon: "✓",
        };
      case "active":
        return {
          dot: "bg-blue-600 animate-pulse",
          text: "text-blue-600",
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
        };
      case "error":
        return {
          dot: "bg-red-600",
          text: "text-red-600",
          icon: "✗",
        };
      default:
        return {
          dot: "bg-gray-300",
          text: "text-gray-400",
          icon: "○",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`flex items-center gap-3 animate-in slide-in-from-left-2 duration-300`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${styles.dot}`}
      >
        {typeof styles.icon === "string" ? styles.icon : styles.icon}
      </div>
      <span className={`text-sm font-medium ${styles.text}`}>{label}</span>
    </div>
  );
}

/**
 * Simple loading spinner component for general use
 */
export function LoadingSpinner({
  size = "default",
}: {
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
    </div>
  );
}

/**
 * Loading state for the entire analysis results section
 */
export function AnalysisLoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 animate-pulse" />
          <Skeleton className="h-6 w-48 animate-pulse" />
        </div>
        <Skeleton className="h-4 w-64 animate-pulse" />

        {/* Metadata skeleton */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Skeleton className="h-4 w-24 animate-pulse" />
          <Skeleton
            className="h-4 w-20 animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <Skeleton
            className="h-4 w-32 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Skeleton className="h-8 w-20 animate-pulse" />
            <Skeleton
              className="h-8 w-24 animate-pulse"
              style={{ animationDelay: "0.1s" }}
            />
            <Skeleton
              className="h-8 w-20 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <Skeleton
              className="h-8 w-22 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <Card className="animate-in slide-in-from-left-2 duration-300 delay-200">
              <CardHeader>
                <Skeleton className="h-5 w-32 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full animate-pulse" />
                  <Skeleton
                    className="h-4 w-3/4 animate-pulse"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <Skeleton
                    className="h-4 w-5/6 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-left-2 duration-300 delay-400">
              <CardHeader>
                <Skeleton className="h-5 w-40 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full animate-pulse" />
                  <Skeleton
                    className="h-16 w-full animate-pulse"
                    style={{ animationDelay: "0.1s" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
