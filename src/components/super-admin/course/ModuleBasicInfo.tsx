import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CreateModuleFormValues } from "@/lib/validations/course";

export function ModuleBasicInfo({
  existingThumbnail,
}: {
  existingThumbnail?: string;
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateModuleFormValues>();
  const [preview, setPreview] = useState<string | null>(
    existingThumbnail || null,
  );
  const [objectPreview, setObjectPreview] = useState<string>();

  useEffect(() => {
    return () => {
      if (objectPreview) URL.revokeObjectURL(objectPreview);
    };
  }, [objectPreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPreview = URL.createObjectURL(file);

    setObjectPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreview;
    });
    setPreview(nextPreview);
    setValue("thumbnail", file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6 rounded-md border border-secondary/20 bg-secondary/30 p-6">
      <Field data-invalid={Boolean(errors.title)}>
        <FieldLabel htmlFor="module-title">
          Module Title <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="module-title"
          placeholder="Course Title"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title?.message && (
          <FieldError>{errors.title.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel htmlFor="module-desc">
          Description <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="module-desc"
          placeholder="Course Description"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description?.message && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={Boolean(errors.thumbnail)}>
        <FieldLabel htmlFor="module-thumbnail">Thumbnail Image</FieldLabel>
        <label
          htmlFor="module-thumbnail"
          className={cn(
            "relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-background/50 transition-colors hover:bg-background",
            errors.thumbnail
              ? "border-destructive ring-1 ring-destructive/30"
              : "border-secondary/40",
          )}
        >
          <input
            id="module-thumbnail"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Module thumbnail preview"
                className="h-full w-full object-contain"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-center text-xs font-medium text-white">
                Click to replace thumbnail
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-5" />
                <span className="text-sm font-medium">Upload thumbnail</span>
              </div>
            </div>
          )}
        </label>
        {errors.thumbnail?.message && (
          <FieldError>{errors.thumbnail.message}</FieldError>
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 1280 × 720 px (16:9), JPG or PNG. Keep important content
          near the centre for consistent module cards.
        </p>
      </Field>
    </div>
  );
}
