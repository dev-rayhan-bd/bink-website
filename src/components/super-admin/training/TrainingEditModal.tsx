"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Training, TrainingAuthType } from "@/lib/types/training.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { updateTraining } from "@/services/training.service";

const authTypes: TrainingAuthType[] = [
  "passcode",
  "email",
  "employeeId",
  "guest",
];

export function TrainingEditModal({ training }: { training: Training }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [authType, setAuthType] = useState<TrainingAuthType>(
    training.authType || "passcode",
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(
    training.thumbnailImage,
  );
  const [objectPreview, setObjectPreview] = useState<string>();

  useEffect(() => {
    return () => {
      if (objectPreview) URL.revokeObjectURL(objectPreview);
    };
  }, [objectPreview]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setAuthType(training.authType || "passcode");
      setThumbnailPreview(training.thumbnailImage);
    }
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setObjectPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      const next = file ? URL.createObjectURL(file) : undefined;
      setThumbnailPreview(next || training.thumbnailImage);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const passcode = String(formData.get("passcode") || "").trim();
    const thumbnail = formData.get("thumbnail");

    if (!title || !description) {
      ErrorToast("Title and description are required");
      return;
    }

    if (authType === "passcode" && !passcode) {
      ErrorToast("Passcode is required for passcode auth");
      return;
    }

    setIsPending(true);
    try {
      const response = await updateTraining<Training>(training._id, {
        title,
        description,
        authType,
        ...(authType === "passcode" ? { passcode } : {}),
        thumbnailImage:
          thumbnail instanceof File && thumbnail.size > 0
            ? thumbnail
            : undefined,
      });

      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Training updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Unable to update training",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Pencil /> Edit Training
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col p-6 sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Training</DialogTitle>
          <DialogDescription>
            Update the training details and thumbnail. Company/team assignment
            stays separate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
            <Field>
              <FieldLabel htmlFor={`edit-training-title-${training._id}`}>
                Title
              </FieldLabel>
              <Input
                id={`edit-training-title-${training._id}`}
                name="title"
                defaultValue={training.title}
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor={`edit-training-description-${training._id}`}
              >
                Description
              </FieldLabel>
              <Textarea
                id={`edit-training-description-${training._id}`}
                name="description"
                defaultValue={training.description || ""}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Auth Type</FieldLabel>
                <Select
                  value={authType}
                  onValueChange={(value) =>
                    setAuthType(value as TrainingAuthType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor={`edit-training-passcode-${training._id}`}>
                  Passcode
                </FieldLabel>
                <Input
                  id={`edit-training-passcode-${training._id}`}
                  name="passcode"
                  defaultValue={training.passcode || ""}
                  disabled={authType !== "passcode"}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`edit-training-thumbnail-${training._id}`}>
                Thumbnail
              </FieldLabel>
              <Input
                id={`edit-training-thumbnail-${training._id}`}
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1280 × 720 px (16:9), JPG or PNG. Keep important
                content near the centre because cards may crop the edges.
              </p>
              {thumbnailPreview && (
                <div className="mt-3 overflow-hidden rounded-md border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt="Training thumbnail preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}
            </Field>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save /> {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
