"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AnalysisResult,
  HighlightItem,
  LowlightItem,
  NamedEntity,
  TranscriptEntry,
} from "@/lib/types";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  Hash,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { CopyButton } from "./copy-button";
import { EntityEditor } from "./entity-editor";
import { motion, AnimatePresence } from "motion/react";

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
  onResultUpdate?: (updatedResult: AnalysisResult) => void;
  transcriptEntries?: TranscriptEntry[];
}

export const AnalysisResults = memo(function AnalysisResults({
  result,
  isLoading = false,
  onResultUpdate,
  transcriptEntries = [],
}: AnalysisResultsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleEntityUpdate = useCallback(
    (updatedEntity: NamedEntity) => {
      if (!result || !onResultUpdate) return;

      const updatedEntities = result.namedEntities.map((entity) =>
        entity.id === updatedEntity.id ? updatedEntity : entity
      );

      const updatedResult = {
        ...result,
        namedEntities: updatedEntities,
      };

      onResultUpdate(updatedResult);
    },
    [result, onResultUpdate]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!result) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            Analysis Results
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Comprehensive analysis of your transcript content
          </CardDescription>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-3 sm:pt-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Duration: {result.metadata.totalDuration}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              Words: {result.metadata.wordCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Processed:{" "}
              {new Date(result.metadata.processedAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 gap-1 sm:gap-0">
              <TabsTrigger
                value="summary"
                className="text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Timeline ({transcriptEntries.length})
              </TabsTrigger>
              <TabsTrigger
                value="highlights"
                className="text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Highlights ({result.highlights.length})
              </TabsTrigger>
              <TabsTrigger
                value="lowlights"
                className="text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Lowlights ({result.lowlights.length})
              </TabsTrigger>
              <TabsTrigger
                value="entities"
                className="text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Entities ({result.namedEntities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <SummarySection summary={result.summary} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <TimelineSection
                transcriptEntries={transcriptEntries}
                highlights={result.highlights}
                lowlights={result.lowlights}
                entities={result.namedEntities}
              />
            </TabsContent>

            <TabsContent value="highlights" className="mt-6">
              <HighlightsSection
                highlights={result.highlights}
                openSections={openSections}
                onToggleSection={toggleSection}
              />
            </TabsContent>

            <TabsContent value="lowlights" className="mt-6">
              <LowlightsSection
                lowlights={result.lowlights}
                openSections={openSections}
                onToggleSection={toggleSection}
              />
            </TabsContent>

            <TabsContent value="entities" className="mt-6">
              <EntitiesSection
                entities={result.namedEntities}
                openSections={openSections}
                onToggleSection={toggleSection}
                onEntityUpdate={handleEntityUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function SummarySection({ summary }: { summary: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Executive Summary</CardTitle>
          <CopyButton text={summary} label="Summary" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HighlightsSection({
  highlights,
  openSections,
  onToggleSection,
}: {
  highlights: HighlightItem[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
}) {
  if (highlights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No highlights identified in this transcript.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {highlights.map((highlight, index) => {
        const sectionId = `highlight-${index}`;
        const isOpen = openSections[sectionId];

        return (
          <Card
            key={index}
            className="group transition-all duration-200 hover:shadow-md"
          >
            <motion.div
              layout
              className="cursor-pointer transition-all duration-200"
              onClick={() => onToggleSection(sectionId)}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div className="flex items-center gap-2">
                      {highlight.timestamp && (
                        <Badge variant="secondary" className="text-xs">
                          {highlight.timestamp}
                        </Badge>
                      )}
                      {highlight.relevanceScore && (
                        <Badge variant="outline" className="text-xs">
                          Score: {highlight.relevanceScore}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CopyButton
                    text={highlight.content}
                    label="Highlight"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </div>
              </CardHeader>
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <p className="text-sm leading-relaxed">
                      {highlight.content}
                    </p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

function LowlightsSection({
  lowlights,
  openSections,
  onToggleSection,
}: {
  lowlights: LowlightItem[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
}) {
  if (lowlights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No lowlights identified in this transcript.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {lowlights.map((lowlight, index) => {
        const sectionId = `lowlight-${index}`;
        const isOpen = openSections[sectionId];

        return (
          <Card key={index}>
            <motion.div
              layout
              className="cursor-pointer transition-colors"
              onClick={() => onToggleSection(sectionId)}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <div className="flex items-center gap-2">
                      {lowlight.timestamp && (
                        <Badge variant="secondary" className="text-xs">
                          {lowlight.timestamp}
                        </Badge>
                      )}
                      <Badge variant="destructive" className="text-xs">
                        {lowlight.issueType}
                      </Badge>
                    </div>
                  </div>
                  <CopyButton text={lowlight.content} label="Lowlight" />
                </div>
              </CardHeader>
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <p className="text-sm leading-relaxed">
                      {lowlight.content}
                    </p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

function TimelineSection({
  transcriptEntries,
  highlights,
  lowlights,
  entities,
}: {
  transcriptEntries: TranscriptEntry[];
  highlights: HighlightItem[];
  lowlights: LowlightItem[];
  entities: NamedEntity[];
}) {
  if (transcriptEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No timeline data available for this transcript.</p>
          <p className="text-sm mt-2">
            Timeline is available for text transcripts and processed audio
            files.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Create a map of timestamps to analysis items for quick lookup
  const timestampMap = new Map<
    string,
    {
      highlights: HighlightItem[];
      lowlights: LowlightItem[];
      entities: NamedEntity[];
    }
  >();

  // Populate the map with highlights
  highlights.forEach((highlight) => {
    if (highlight.timestamp) {
      if (!timestampMap.has(highlight.timestamp)) {
        timestampMap.set(highlight.timestamp, {
          highlights: [],
          lowlights: [],
          entities: [],
        });
      }
      timestampMap.get(highlight.timestamp)!.highlights.push(highlight);
    }
  });

  // Populate the map with lowlights
  lowlights.forEach((lowlight) => {
    if (lowlight.timestamp) {
      if (!timestampMap.has(lowlight.timestamp)) {
        timestampMap.set(lowlight.timestamp, {
          highlights: [],
          lowlights: [],
          entities: [],
        });
      }
      timestampMap.get(lowlight.timestamp)!.lowlights.push(lowlight);
    }
  });

  // Populate the map with entities
  entities.forEach((entity) => {
    entity.mentions.forEach((mention) => {
      if (mention.timestamp) {
        if (!timestampMap.has(mention.timestamp)) {
          timestampMap.set(mention.timestamp, {
            highlights: [],
            lowlights: [],
            entities: [],
          });
        }
        timestampMap.get(mention.timestamp)!.entities.push(entity);
      }
    });
  });

  const scrollToTab = (tabValue: string) => {
    // Find the tab trigger and click it
    const tabTrigger = document.querySelector(
      `[value="${tabValue}"]`
    ) as HTMLElement;
    if (tabTrigger) {
      tabTrigger.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transcript Timeline
        </CardTitle>
        <CardDescription>
          Visual timeline of the transcript with clickable timestamps. Click on
          timestamps to jump to related analysis items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline visualization */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

            {/* Timeline entries */}
            <div className="space-y-6">
              {transcriptEntries.map((entry, index) => {
                const analysisItems = timestampMap.get(entry.timestamp);
                const hasHighlights = analysisItems?.highlights.length ?? 0 > 0;
                const hasLowlights = analysisItems?.lowlights.length ?? 0 > 0;
                const hasEntities = analysisItems?.entities.length ?? 0 > 0;

                return (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        entry.section === "Interviewer"
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-green-100 border-green-300 text-green-700"
                      }`}
                    >
                      {entry.section.toLocaleLowerCase() === "interviewer"
                        ? "I"
                        : "C"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.timestamp}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {entry.section}
                        </Badge>
                        {hasHighlights !== 0 && (
                          <Badge
                            className="text-xs bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                            onClick={() => scrollToTab("highlights")}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Highlight
                          </Badge>
                        )}
                        {hasLowlights !== 0 && (
                          <Badge
                            className="text-xs bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
                            onClick={() => scrollToTab("lowlights")}
                          >
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Lowlight
                          </Badge>
                        )}
                        {hasEntities !== 0 && (
                          <Badge
                            className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                            onClick={() => scrollToTab("entities")}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Entity
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {entry.content}
                      </div>

                      {/* Show analysis items for this timestamp */}
                      {analysisItems && (
                        <div className="mt-3 space-y-2">
                          {analysisItems.highlights.map((highlight, hIndex) => (
                            <div
                              key={`h-${hIndex}`}
                              className="p-2 bg-green-50 border border-green-200 rounded text-xs"
                            >
                              <div className="font-medium text-green-800 mb-1">
                                Highlight:
                              </div>
                              <div className="text-green-700">
                                {highlight.content}
                              </div>
                            </div>
                          ))}
                          {analysisItems.lowlights.map((lowlight, lIndex) => (
                            <div
                              key={`l-${lIndex}`}
                              className="p-2 bg-red-50 border border-red-200 rounded text-xs"
                            >
                              <div className="font-medium text-red-800 mb-1">
                                Lowlight:
                              </div>
                              <div className="text-red-700">
                                {lowlight.content}
                              </div>
                            </div>
                          ))}
                          {analysisItems.entities.map((entity, eIndex) => (
                            <div
                              key={`e-${eIndex}`}
                              className="p-2 bg-purple-50 border border-purple-200 rounded text-xs"
                            >
                              <div className="font-medium text-purple-800 mb-1">
                                Entity: {entity.name}
                              </div>
                              <div className="text-purple-700">
                                {
                                  entity.mentions.find(
                                    (m) => m.timestamp === entry.timestamp
                                  )?.content
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntitiesSection({
  entities,
  openSections,
  onToggleSection,
  onEntityUpdate,
}: {
  entities: NamedEntity[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onEntityUpdate?: (entity: NamedEntity) => void;
}) {
  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No named entities identified in this transcript.</p>
        </CardContent>
      </Card>
    );
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "speaker":
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case "speaker":
        return "bg-blue-100 text-blue-800";
      case "organization":
        return "bg-purple-100 text-purple-800";
      case "location":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {entities.map((entity, index) => {
        const sectionId = `entity-${index}`;
        const isOpen = openSections[sectionId];

        return (
          <Card key={index}>
            <motion.div
              layout
              className="cursor-pointer transition-colors"
              onClick={() => onToggleSection(sectionId)}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                    {getEntityIcon(entity.type)}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{entity.name}</span>
                      <Badge
                        className={`text-xs ${getEntityColor(entity.type)}`}
                      >
                        {entity.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entity.mentions.length} mentions
                      </Badge>
                      {entity.tone && (
                        <Badge
                          variant={
                            entity.tone === "positive"
                              ? "default"
                              : entity.tone === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {entity.tone}
                        </Badge>
                      )}
                      {entity.tags?.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onEntityUpdate && (
                      <EntityEditor
                        entity={entity}
                        onUpdate={onEntityUpdate}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                    )}
                    <CopyButton
                      text={`${entity.name} (${entity.type})\n${entity.mentions.map((m) => `- ${m.content}`).join("\n")}`}
                      label="Entity"
                    />
                  </div>
                </div>
              </CardHeader>
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />

                    {entity.notes && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {entity.notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Mentions</h4>
                      {entity.mentions.map((mention, mentionIndex) => (
                        <div
                          key={mentionIndex}
                          className="border-l-2 border-muted pl-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {mention.timestamp && (
                              <Badge variant="secondary" className="text-xs">
                                {mention.timestamp}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{mention.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {mention.context}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
