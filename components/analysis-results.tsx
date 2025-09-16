"use client";

import { useState, useCallback, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Copy,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  Calendar,
  Edit,
  Tag,
} from "lucide-react";
import {
  AnalysisResult,
  HighlightItem,
  LowlightItem,
  NamedEntity,
} from "@/lib/types";
import { EntityEditor } from "./entity-editor";
import { toast } from "sonner";

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
  onResultUpdate?: (updatedResult: AnalysisResult) => void;
}

export const AnalysisResults = memo(function AnalysisResults({
  result,
  isLoading = false,
  onResultUpdate,
}: AnalysisResultsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Analysis Results
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your transcript content
        </CardDescription>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 pt-2">
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
            Processed: {new Date(result.metadata.processedAt).toLocaleString()}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="highlights">
              Highlights ({result.highlights.length})
            </TabsTrigger>
            <TabsTrigger value="lowlights">
              Lowlights ({result.lowlights.length})
            </TabsTrigger>
            <TabsTrigger value="entities">
              Entities ({result.namedEntities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <SummarySection
              summary={result.summary}
              onCopy={(text) => copyToClipboard(text, "Summary")}
            />
          </TabsContent>

          <TabsContent value="highlights" className="mt-6">
            <HighlightsSection
              highlights={result.highlights}
              openSections={openSections}
              onToggleSection={toggleSection}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="lowlights" className="mt-6">
            <LowlightsSection
              lowlights={result.lowlights}
              openSections={openSections}
              onToggleSection={toggleSection}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="entities" className="mt-6">
            <EntitiesSection
              entities={result.namedEntities}
              openSections={openSections}
              onToggleSection={toggleSection}
              onCopy={copyToClipboard}
              onEntityUpdate={handleEntityUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
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

function SummarySection({
  summary,
  onCopy,
}: {
  summary: string;
  onCopy: (text: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Executive Summary</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onCopy(summary)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
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
  onCopy,
}: {
  highlights: HighlightItem[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onCopy: (text: string, label: string) => void;
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
          <Card key={index}>
            <Collapsible
              open={isOpen}
              onOpenChange={() => onToggleSection(sectionId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <TrendingUp className="h-4 w-4 text-green-600" />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(highlight.content, "Highlight");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <p className="text-sm leading-relaxed">{highlight.content}</p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
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
  onCopy,
}: {
  lowlights: LowlightItem[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onCopy: (text: string, label: string) => void;
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
            <Collapsible
              open={isOpen}
              onOpenChange={() => onToggleSection(sectionId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <TrendingDown className="h-4 w-4 text-red-600" />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(lowlight.content, "Lowlight");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <p className="text-sm leading-relaxed">{lowlight.content}</p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

function EntitiesSection({
  entities,
  openSections,
  onToggleSection,
  onCopy,
  onEntityUpdate,
}: {
  entities: NamedEntity[];
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onCopy: (text: string, label: string) => void;
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
            <Collapsible
              open={isOpen}
              onOpenChange={() => onToggleSection(sectionId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const entityText = `${entity.name} (${entity.type})\n${entity.mentions.map((m) => `- ${m.content}`).join("\n")}`;
                          onCopy(entityText, "Entity");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
