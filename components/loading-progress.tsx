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
import {
  Loader2,
  FileText,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AnalysisState } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";

interface LoadingProgressProps {
  analysisState: AnalysisState;
}

export function LoadingProgress({ analysisState }: LoadingProgressProps) {
  const getStageInfo = (stage: AnalysisState["stage"]) => {
    // Special case for finalizing stage (95% progress)
    if (analysisState.progress === 95 && analysisState.isAnalyzing) {
      return {
        icon: <Sparkles className="h-4 w-4" />,
        title: "Finalizing Analysis",
        description: "Almost done! Preparing your results...",
        color: "text-emerald-600",
      };
    }

    switch (stage) {
      case "parsing":
        return {
          icon: <FileText className="h-4 w-4" />,
          title: "Parsing Transcript",
          description: "Reading and validating your transcript file...",
          color: "text-blue-600",
        };
      case "analyzing":
        return {
          icon: <Brain className="h-4 w-4" />,
          title: "Analyzing Content",
          description:
            "AI is processing your transcript and extracting insights...",
          color: "text-purple-600",
        };
      case "formatting":
        return {
          icon: <Sparkles className="h-4 w-4" />,
          title: "Formatting Results",
          description: "Organizing analysis results for display...",
          color: "text-emerald-600",
        };
      case "complete":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          title: "Analysis Complete",
          description: "Your transcript has been successfully analyzed!",
          color: "text-green-600",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Analysis Error",
          description: "An error occurred during analysis.",
          color: "text-red-600",
        };
      default:
        return {
          icon: <Loader2 className="h-4 w-4" />,
          title: "Processing",
          description: "Please wait...",
          color: "text-muted-foreground",
        };
    }
  };

  const stageInfo = getStageInfo(analysisState.stage);

  if (!analysisState.isAnalyzing && analysisState.stage !== "error") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <motion.div
              animate={analysisState.isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`${stageInfo.color}`}
            >
              {stageInfo.icon}
            </motion.div>
            <span className="text-lg font-semibold">{stageInfo.title}</span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {stageInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Progress</span>
              <motion.span
                key={analysisState.progress}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-sm"
              >
                {analysisState.progress}%
              </motion.span>
            </div>
            <Progress value={analysisState.progress} className="h-2" />
          </div>

          {/* Stage Indicators */}
          <div className="space-y-2">
            <StageIndicator
              stage="parsing"
              currentStage={analysisState.stage}
              isAnalyzing={analysisState.isAnalyzing}
              label="Parse Transcript"
            />
            <StageIndicator
              stage="analyzing"
              currentStage={analysisState.stage}
              isAnalyzing={analysisState.isAnalyzing}
              label="AI Analysis"
            />
            <StageIndicator
              stage="formatting"
              currentStage={analysisState.stage}
              isAnalyzing={analysisState.isAnalyzing}
              label="Format Results"
            />
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {analysisState.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error occurred
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {analysisState.error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Skeleton Preview */}
          <AnimatePresence>
            {analysisState.isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-4 pt-4 border-t border-border/50"
              >
                <p className="text-sm text-muted-foreground font-medium">
                  Preview of results structure:
                </p>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StageIndicatorProps {
  stage: AnalysisState["stage"];
  currentStage: AnalysisState["stage"];
  isAnalyzing: boolean;
  label: string;
}

function StageIndicator({
  stage,
  currentStage,
  isAnalyzing,
  label,
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
          dot: "bg-green-600 border-green-600",
          text: "text-green-700 dark:text-green-300",
          icon: <CheckCircle2 className="h-3 w-3 text-white" />,
        };
      case "active":
        return {
          dot: "bg-blue-600 border-blue-600",
          text: "text-blue-700 dark:text-blue-300",
          icon: <Loader2 className="h-3 w-3 animate-spin text-white" />,
        };
      case "error":
        return {
          dot: "bg-red-600 border-red-600",
          text: "text-red-700 dark:text-red-300",
          icon: <AlertCircle className="h-3 w-3 text-white" />,
        };
      default:
        return {
          dot: "bg-muted border-muted",
          text: "text-muted-foreground",
          icon: <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-3"
    >
      <motion.div
        className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center ${styles.dot}`}
        animate={status === "active" ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {styles.icon}
      </motion.div>
      <span className={`text-sm font-medium ${styles.text}`}>{label}</span>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center"
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-muted-foreground`}
      />
    </motion.div>
  );
}

/**
 * Loading state for the entire analysis results section
 */
export function AnalysisLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-64" />

          {/* Metadata skeleton */}
          <div className="flex flex-wrap gap-4 pt-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {[20, 24, 20, 22].map((width, index) => (
                <Skeleton
                  key={index}
                  className={`h-8 w-${width} rounded-md`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              {[1, 2].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
