import type {
  ModuleAnswerValue,
  ModuleQuestion,
} from "@/lib/types/module.type";

export type AnswerValue = ModuleAnswerValue;
export type MediaValue = string | File;

export type AnswerRendererProps = {
  question: ModuleQuestion;
  answer: AnswerValue | null;
  disabled: boolean;
  onAnswer: (answer: AnswerValue) => void;
  onSwipe: (direction: "left" | "right") => void;
  correctAnswer?: AnswerValue;
  isSubmitted?: boolean;
};