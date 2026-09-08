import * as z from "zod";
import { hasQuestionContent } from "@/lib/question-content";

const optionalMedia = z
  .union([
    z.literal(""),
    z.string().url("Enter a valid URL"),
    z.instanceof(File),
  ])
  .optional();

const requiredQuestionContent = z
  .string()
  .refine(hasQuestionContent, "Question content is required");

const baseQuestionSchema = z.object({
  id: z.string(),
  content: requiredQuestionContent,
  isScored: z.boolean(),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid 6-digit hex color"),
  blockColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid 6-digit hex color")
    .optional()
    .or(z.literal("")),
  explanation: z.string().trim().optional(),
  image: optionalMedia,
});

const requiredStringList = (minimum: number, message: string) =>
  z
    .array(z.string().trim())
    .transform((values) => values.filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(minimum, message));

const informationSchema = baseQuestionSchema.extend({
  type: z.literal("Information"),
});

const mcqSchema = baseQuestionSchema.extend({
  type: z.literal("MCQ"),
  options: requiredStringList(2, "Add at least two options"),
  correctAnswer: z.string().optional().default(""),
});

const swipeSchema = baseQuestionSchema.omit({ content: true }).extend({
  type: z.literal("Swipe"),
  content: z.string().optional().default(""),
  leftLabel: z.string().trim().min(1, "Left label is required"),
  rightLabel: z.string().trim().min(1, "Right label is required"),
  correctDirection: z.enum(["left", "right"]).optional(),
});

const orderingSchema = baseQuestionSchema.extend({
  type: z.literal("Ordering"),
  items: requiredStringList(2, "Add at least two ordering items"),
});

const chatScenarioSchema = baseQuestionSchema.omit({ content: true }).extend({
  type: z.literal("Chat Scenario"),
  messages: z
    .array(
      z.object({
        sender: z.string().trim(),
        text: z.string().trim(),
      }),
    )
    .transform((messages) =>
      messages.filter((message) => message.sender || message.text),
    )
    .pipe(
      z
        .array(
          z.object({
            sender: z.string().min(1, "Sender is required"),
            text: z.string().min(1, "Message is required"),
          }),
        )
        .min(1, "Add at least one message"),
    ),
  options: requiredStringList(2, "Add at least two response options"),
  correctAnswer: z.string().optional().default(""),
});

const videoSchema = baseQuestionSchema.extend({
  type: z.literal("Video"),
  videoUrl: z.union([
    z.string().url("Enter a valid video URL"),
    z.instanceof(File),
  ]),
  options: z
    .array(z.string().trim())
    .transform((values) => values.filter(Boolean))
    .refine((values) => values.length === 0 || values.length >= 2, {
      message: "Add at least two options or remove all options",
    })
    .optional(),
  correctAnswer: z.string().optional(),
});

const simulatedCallSchema = baseQuestionSchema.omit({ content: true }).extend({
  content: z.string().optional().default(""),
  type: z.literal("Simulated Call"),
  callerName: z.string().trim().min(1, "Caller name is required"),
  callerPhoto: optionalMedia,
  postCallVideoUrl: optionalMedia,
  postCallMessage: z.string().trim().optional(),
  isScored: z.boolean(),
});

const ratingSchema = baseQuestionSchema.extend({
  type: z.literal("Rating"),
  scale: z.coerce.number().int().min(2).max(10),
});

const freeInputSchema = baseQuestionSchema.extend({
  type: z.literal("Free Input"),
});

const questionUnionSchema = z.discriminatedUnion("type", [
  informationSchema,
  mcqSchema,
  swipeSchema,
  orderingSchema,
  chatScenarioSchema,
  videoSchema,
  simulatedCallSchema,
  ratingSchema,
  freeInputSchema,
]);

export const questionSchema = questionUnionSchema.superRefine((question, context) => {
  if (
    question.type === "Swipe" &&
    !hasQuestionContent(question.content) &&
    !question.image
  ) {
    context.addIssue({
      code: "custom",
      path: ["content"],
      message: "Add question content or an image for swipe questions",
    });
  }

  if (!question.isScored) return;

  if (
    (question.type === "MCQ" || question.type === "Chat Scenario") &&
    !question.correctAnswer?.trim()
  ) {
    context.addIssue({
      code: "custom",
      path: ["correctAnswer"],
      message: "Correct answer is required for scored questions",
    });
  }
});

export const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.instanceof(File).optional(),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type CreateModuleFormValues = z.infer<typeof createModuleSchema>;
export type QuestionDataSchemaType = z.infer<typeof questionSchema>;

export const getDefaultQuestionValues = (
  type: QuestionDataSchemaType["type"],
  id: string,
): QuestionDataSchemaType => {
  const base = {
    id,
    content: "",
    isScored: true,
    colorCode: "#E9308F",
    blockColor: "",
  };

  switch (type) {
    case "Information":
      return { ...base, type, isScored: false };
    case "MCQ":
      return {
        ...base,
        type,
        options: ["", "", "", ""],
        correctAnswer: "",
      };
    case "Swipe":
      return {
        ...base,
        type,
        leftLabel: "",
        rightLabel: "",
      };
    case "Ordering":
      return { ...base, type, items: ["", "", "", ""] };
    case "Chat Scenario":
      return {
        ...base,
        type,
        isScored: false,
        messages: [{ sender: "", text: "" }],
        options: ["", ""],
        correctAnswer: "",
      };
    case "Video":
      return {
        ...base,
        type,
        isScored: false,
        videoUrl: "",
        options: ["", ""],
        correctAnswer: "",
      };
    case "Simulated Call":
      return {
        ...base,
        type,
        isScored: false,
        callerName: "",
        callerPhoto: "",
        postCallVideoUrl: "",
        postCallMessage: "",
      };
    case "Rating":
      return { ...base, type, isScored: false, scale: 5 };
    case "Free Input":
      return { ...base, type, isScored: false };
  }
};
