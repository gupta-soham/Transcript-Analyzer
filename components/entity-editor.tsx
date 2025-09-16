"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Edit, Tag } from "lucide-react";
import { NamedEntity } from "@/lib/types";
import { toast } from "sonner";

interface EntityEditorProps {
  entity: NamedEntity;
  onUpdate: (updatedEntity: NamedEntity) => void;
  trigger?: React.ReactNode;
}

export function EntityEditor({ entity, onUpdate, trigger }: EntityEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedEntity, setEditedEntity] = useState<NamedEntity>({ ...entity });
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    onUpdate(editedEntity);
    setIsOpen(false);
    toast.success("Entity updated successfully");
  };

  const handleCancel = () => {
    setEditedEntity({ ...entity });
    setIsOpen(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editedEntity.tags?.includes(newTag.trim())) {
      setEditedEntity((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedEntity((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Edit Entity: {entity.name}
          </DialogTitle>
          <DialogDescription>
            Customize entity information, add tags, and notes for better
            organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Name</Label>
              <Input
                id="entity-name"
                value={editedEntity.name}
                onChange={(e) =>
                  setEditedEntity((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Entity name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-type">Type</Label>
              <Select
                value={editedEntity.type}
                onValueChange={(value) =>
                  setEditedEntity((prev) => ({
                    ...prev,
                    type: value as NamedEntity["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speaker">Speaker</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tone Assessment */}
          <div className="space-y-2">
            <Label htmlFor="entity-tone">Overall Tone</Label>
            <Select
              value={editedEntity.tone || "neutral"}
              onValueChange={(value) =>
                setEditedEntity((prev) => ({
                  ...prev,
                  tone: value as NamedEntity["tone"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedEntity.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="entity-notes">Notes</Label>
            <Textarea
              id="entity-notes"
              value={editedEntity.notes || ""}
              onChange={(e) =>
                setEditedEntity((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add notes about this entity..."
              rows={3}
            />
          </div>

          {/* Mentions Summary */}
          <div className="space-y-2">
            <Label>Mentions ({editedEntity.mentions.length})</Label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {editedEntity.mentions.slice(0, 3).map((mention, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    {mention.timestamp && (
                      <Badge variant="outline" className="text-xs">
                        {mention.timestamp}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {mention.content}
                  </p>
                </div>
              ))}
              {editedEntity.mentions.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... and {editedEntity.mentions.length - 3} more mentions
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
