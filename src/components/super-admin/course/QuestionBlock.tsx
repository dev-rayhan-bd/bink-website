import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/custom/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateModuleFormValues,
  QuestionDataSchemaType,
} from "@/lib/validations/course";
import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";

interface QuestionBlockProps {
  question: QuestionDataSchemaType;
  index: number;
  onChangeType: (
    id: string,
    newType: QuestionDataSchemaType["type"],
  ) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const questionTypes: QuestionDataSchemaType["type"][] = [
  "Information",
  "MCQ",
  "Swipe",
  "Ordering",
  "Chat Scenario",
  "Video",
  "Simulated Call",
  "Rating",
  "Free Input",
];

export function QuestionBlock({
  question,
  index,
  onChangeType,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: QuestionBlockProps) {
  const blockId = useId();
  const { control, register, setValue } =
    useFormContext<CreateModuleFormValues>();
  const currentQuestion = useWatch({
    control,
    name: `questions.${index}`,
  }) as QuestionDataSchemaType;
  // const supportsCorrectAnswer = ![
  //   "Free Input",
  //   "Rating",
  //   "Information",
  //   "Simulated Call",
  //   "Swipe",
  // ].includes(currentQuestion.type);
  const supportsQuestionImage =
    currentQuestion.type !== "Video" &&
    currentQuestion.type !== "Simulated Call";

  const getMediaLabel = (value: unknown) => {
    if (value instanceof File) return value.name;
    if (typeof value === "string" && value) return "Existing media selected";
    return "No file chosen";
  };

  const setMediaValue = (
    field: "image" | "videoUrl" | "callerPhoto" | "postCallVideoUrl",
    file?: File,
  ) => {
    const value = file ?? "";
    if (field === "image") {
      setValue(`questions.${index}.image`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (field === "videoUrl") {
      setValue(`questions.${index}.videoUrl`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (field === "callerPhoto") {
      setValue(`questions.${index}.callerPhoto`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (field === "postCallVideoUrl") {
      setValue(`questions.${index}.postCallVideoUrl`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const renderMediaInput = ({
    field,
    label,
    accept,
    hint,
  }: {
    field: "image" | "videoUrl" | "callerPhoto" | "postCallVideoUrl";
    label: string;
    accept: string;
    hint?: string;
  }) => {
    const value = currentQuestion[field as keyof typeof currentQuestion];

    return (
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Input
          type="file"
          accept={accept}
          onChange={(event) => setMediaValue(field, event.target.files?.[0])}
        />
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <p className="text-xs text-muted-foreground">{getMediaLabel(value)}</p>
      </Field>
    );
  };

  const addOption = () => {
    if (currentQuestion.type !== "MCQ" && currentQuestion.type !== "Video")
      return;
    setValue(
      `questions.${index}.options`,
      [...(currentQuestion.options || []), ""],
      { shouldDirty: true },
    );
  };

  const removeOption = (optionIndex: number) => {
    if (currentQuestion.type !== "MCQ" && currentQuestion.type !== "Video") return;
    
    if (
      currentQuestion.type === "MCQ" &&
      (currentQuestion.options || []).length <= 2
    ) {
      return;
    }
    const removed = currentQuestion.options?.[optionIndex];
    setValue(
      `questions.${index}.options`,
      (currentQuestion.options || []).filter(
        (_, itemIndex) => itemIndex !== optionIndex,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
    if (currentQuestion.correctAnswer === removed) {
      setValue(`questions.${index}.correctAnswer`, "", { shouldDirty: true });
    }
  };

  const addOrderingItem = () => {
    if (currentQuestion.type !== "Ordering") return;
    setValue(
      `questions.${index}.items`,
      [...currentQuestion.items, ""],
      { shouldDirty: true },
    );
  };

  const removeOrderingItem = (itemIndex: number) => {
    if (
      currentQuestion.type !== "Ordering" ||
      currentQuestion.items.length <= 2
    )
      return;
    setValue(
      `questions.${index}.items`,
      currentQuestion.items.filter(
        (_, indexToKeep) => indexToKeep !== itemIndex,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const addChatOption = () => {
    if (currentQuestion.type !== "Chat Scenario") return;
    setValue(
      `questions.${index}.options`,
      [...currentQuestion.options, ""],
      { shouldDirty: true },
    );
  };

  const removeChatOption = (optionIndex: number) => {
    if (
      currentQuestion.type !== "Chat Scenario" ||
      currentQuestion.options.length <= 2
    )
      return;
    const removed = currentQuestion.options?.[optionIndex];
    setValue(
      `questions.${index}.options`,
      (currentQuestion.options || []).filter(
        (_, itemIndex) => itemIndex !== optionIndex,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
    if (currentQuestion.correctAnswer === removed) {
      setValue(`questions.${index}.correctAnswer`, "", { shouldDirty: true });
    }
  };

  const bgColors = ["bg-card", "bg-primary/5", "bg-secondary/10"];
  const bgColor = bgColors[index % bgColors.length];

  return (
    <div
      className={cn(
        "space-y-6 rounded-md border border-border p-6 shadow-sm transition-colors duration-300",
        bgColor,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </div>
          <h3 className="font-semibold">{currentQuestion.type}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-start">
        {currentQuestion.type !== "Chat Scenario" &&
          currentQuestion.type !== "Simulated Call" && (
          <Field>
            <FieldLabel>Content</FieldLabel>
            <RichTextEditor
              value={currentQuestion.content ?? ""}
              placeholder={
                currentQuestion.type === "Swipe"
                  ? "Optional when the swipe uses only an image..."
                  : "Question or instruction"
              }
              onChange={(value) =>
                setValue(`questions.${index}.content`, value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {currentQuestion.type === "Swipe" && (
              <p className="text-xs text-muted-foreground">
                Swipe content is optional when an image is provided. Leave it
                empty for an image-only swipe card.
              </p>
            )}
          </Field>
        )}
        <div
          className={cn(
            "space-y-4",
            ["Chat Scenario", "Simulated Call"].includes(currentQuestion.type) &&
              "sm:col-start-2",
          )}
        >
          <Field>
            <FieldLabel>Question Type</FieldLabel>
            <Select
              value={currentQuestion.type}
              onValueChange={(value) =>
                onChangeType(
                  question.id,
                  value as QuestionDataSchemaType["type"],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`question-color-${blockId}`}>
              Background Color
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id={`question-color-${blockId}`}
                type="color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(currentQuestion.colorCode || "")
                    ? currentQuestion.colorCode
                    : "#E9308F"
                }
                className="size-9 shrink-0 cursor-pointer p-1"
                onChange={(event) =>
                  setValue(
                    `questions.${index}.colorCode`,
                    event.target.value.toUpperCase(),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              />
              <Input
                aria-label="Question background hex color"
                maxLength={7}
                placeholder="#E9308F"
                className="font-mono uppercase"
                {...register(`questions.${index}.colorCode`)}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor={`question-block-color-${blockId}`}>
              Block Color
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id={`question-block-color-${blockId}`}
                type="color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(currentQuestion.blockColor || "")
                    ? currentQuestion.blockColor
                    : "#FFFFFF"
                }
                className="size-9 shrink-0 cursor-pointer p-1"
                onChange={(event) =>
                  setValue(
                    `questions.${index}.blockColor`,
                    event.target.value.toUpperCase(),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              />
              <Input
                aria-label="Question block hex color"
                maxLength={7}
                placeholder="#FFFFFF"
                className="font-mono uppercase"
                {...register(`questions.${index}.blockColor`)}
              />
            </div>
          </Field>
        </div>
      </div>

      {(currentQuestion.type === "MCQ" ||
        currentQuestion.type === "Video") && (
        <FieldGroup>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Options</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus /> Add Option
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(currentQuestion.options || []).map((_, optionIndex) => (
              <Field key={optionIndex}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Option {optionIndex + 1}</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                    onClick={() => removeOption(optionIndex)}
                    disabled={
                      currentQuestion.type === "Video"
                        ? false
                        : (currentQuestion.options || []).length <= 2
                    }
                    aria-label={`Remove option ${optionIndex + 1}`}
                  >
                    <X />
                  </Button>
                </div>
                <Input
                  {...register(
                    `questions.${index}.options.${optionIndex}` as const,
                  )}
                />
              </Field>
            ))}
          </div>
          <Field>
            <FieldLabel>Correct Answer</FieldLabel>
            <Controller
              control={control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(currentQuestion.options || [])
                      .filter(Boolean)
                      .map((option, selectIndex) => (
                        <SelectItem
                          key={`${option}-${selectIndex}`}
                          value={option}
                        >
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </FieldGroup>
      )}

      {currentQuestion.type === "Swipe" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Left Label</FieldLabel>
              <Input {...register(`questions.${index}.leftLabel`)} />
            </Field>
            <Field>
              <FieldLabel>Right Label</FieldLabel>
              <Input {...register(`questions.${index}.rightLabel`)} />
            </Field>
          </div>
          {currentQuestion.isScored && (
            <Field>
              <FieldLabel>Correct Direction</FieldLabel>
              <Controller
                control={control}
                name={`questions.${index}.correctDirection`}
                render={({ field }) => (
                  <Select
                    value={field.value || "left"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">
                        Left ({currentQuestion.leftLabel || "Left"})
                      </SelectItem>
                      <SelectItem value="right">
                        Right ({currentQuestion.rightLabel || "Right"})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          )}
        </div>
      )}

      {currentQuestion.type === "Ordering" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Ordering Items</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOrderingItem}
            >
              <Plus /> Add Item
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currentQuestion.items.map((_, itemIndex) => (
              <Field key={itemIndex}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Item {itemIndex + 1}</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                    onClick={() => removeOrderingItem(itemIndex)}
                    disabled={currentQuestion.items.length <= 2}
                    aria-label={`Remove item ${itemIndex + 1}`}
                  >
                    <X />
                  </Button>
                </div>
                <Input
                  {...register(
                    `questions.${index}.items.${itemIndex}` as const,
                  )}
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      {currentQuestion.type === "Chat Scenario" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Message</FieldLabel>
          </div>
          <div className="grid gap-4 rounded-md border p-3 sm:grid-cols-[1fr_2fr]">
            <Field>
              <FieldLabel>Sender</FieldLabel>
              <Input
                {...register(
                  `questions.${index}.messages.0.sender` as const,
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Message</FieldLabel>
              <Input
                {...register(`questions.${index}.messages.0.text` as const)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <FieldLabel>Response Options</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChatOption}
            >
              <Plus /> Add Response
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((_, optionIndex) => (
              <Field key={optionIndex}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Response {optionIndex + 1}</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                    disabled={currentQuestion.options.length <= 2}
                    onClick={() => removeChatOption(optionIndex)}
                    aria-label={`Remove response ${optionIndex + 1}`}
                  >
                    <X />
                  </Button>
                </div>
                <Input
                  {...register(
                    `questions.${index}.options.${optionIndex}` as const,
                  )}
                />
              </Field>
            ))}
          </div>
          <Field>
            <FieldLabel>Correct Answer</FieldLabel>
            <Controller
              control={control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct response" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options
                      .filter(Boolean)
                      .map((option, selectIndex) => (
                        <SelectItem
                          key={`${option}-${selectIndex}`}
                          value={option}
                        >
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      )}

      {currentQuestion.type === "Video" &&
        renderMediaInput({
          field: "videoUrl",
          label: "Video",
          accept: "video/*",
        })}

      {currentQuestion.type === "Simulated Call" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Caller Name</FieldLabel>
            <Input
              placeholder="John Doe"
              {...register(`questions.${index}.callerName`)}
            />
          </Field>
          {renderMediaInput({
            field: "callerPhoto",
            label: "Caller Photo",
            accept: "image/*",
            hint:
              "Recommended: 512 × 512 px square, JPG or PNG. Use a clear, centred portrait.",
          })}
          {renderMediaInput({
            field: "postCallVideoUrl",
            label: "Post-call Video",
            accept: "video/*",
          })}
          <Field>
            <FieldLabel>Post-call Message</FieldLabel>
            <Input
              placeholder="Good job staying calm."
              {...register(`questions.${index}.postCallMessage`)}
            />
          </Field>
        </div>
      )}

      {currentQuestion.type === "Rating" && (
        <Field>
          <FieldLabel>Rating Scale</FieldLabel>
          <Input
            type="number"
            min={2}
            max={10}
            {...register(`questions.${index}.scale`, { valueAsNumber: true })}
          />
        </Field>
      )}

      {currentQuestion.explanation !== undefined && (
        <Field className="rounded-md border border-border bg-muted/30 p-4">
          <FieldLabel>Feedback</FieldLabel>
          <Textarea
            placeholder="Explain the correct answer or add feedback"
            {...register(`questions.${index}.explanation`)}
          />
        </Field>
      )}

      {supportsQuestionImage &&
        currentQuestion.image !== undefined &&
        renderMediaInput({
          field: "image",
          label: "Question Image",
          accept: "image/*",
          hint:
            "Recommended: 1080 x 1440 px (3:4 portrait), JPG or PNG. Other ratios fill the frame and may be cropped.",
        })}

      <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-5">
          <Field orientation="horizontal">
            <Controller
              control={control}
              name={`questions.${index}.isScored`}
              render={({ field }) => (
                <Checkbox
                  id={`scored-${blockId}`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <FieldLabel htmlFor={`scored-${blockId}`}>
              Scored question
            </FieldLabel>
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id={`explanation-${blockId}`}
              checked={currentQuestion.explanation !== undefined}
              onCheckedChange={(checked) =>
                setValue(
                  `questions.${index}.explanation`,
                  checked === true ? "" : undefined,
                  { shouldDirty: true },
                )
              }
            />
            <FieldLabel htmlFor={`explanation-${blockId}`}>
              Add feedback
            </FieldLabel>
          </Field>

          {supportsQuestionImage && (
            <Field orientation="horizontal">
              <Checkbox
                id={`image-${blockId}`}
                checked={currentQuestion.image !== undefined}
                onCheckedChange={(checked) =>
                  setValue(
                    `questions.${index}.image`,
                    checked === true ? "" : undefined,
                    { shouldDirty: true },
                  )
                }
              />
              <FieldLabel htmlFor={`image-${blockId}`}>Add image</FieldLabel>
            </Field>
          )}
        </div>
      </div>
    </div>
  );
}
