import type { JSONContent } from "@tiptap/core";
import {
  RICH_QUESTION_PREFIX,
  parseQuestionContent,
  serializeQuestionContent,
} from "./question-content";
import type {
  IChatStep,
  LearningModule,
  ModuleQuestion,
} from "./types/module.type";

function extractFromRichOrPlain(value?: string | null): string[] {
  if (!value || typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith(RICH_QUESTION_PREFIX)) {
    const doc = parseQuestionContent(trimmed);
    const collected: string[] = [];
    const walk = (node?: JSONContent) => {
      if (!node) return;
      if (
        node.type === "text" &&
        typeof node.text === "string" &&
        node.text.trim().length > 0
      ) {
        collected.push(node.text.trim());
      }
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          walk(child);
        }
      }
    };
    walk(doc);
    return collected;
  }

  return [trimmed];
}

function translateRichOrPlain(
  value: string | undefined,
  t: (text?: string | null) => string,
): string | undefined {
  if (!value || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (trimmed.startsWith(RICH_QUESTION_PREFIX)) {
    const doc = parseQuestionContent(trimmed);
    const translateNode = (node: JSONContent): JSONContent => {
      const cloned: JSONContent = { ...node };
      if (cloned.type === "text" && typeof cloned.text === "string") {
        cloned.text = t(cloned.text);
      }
      if (Array.isArray(cloned.content)) {
        cloned.content = cloned.content.map(translateNode);
      }
      return cloned;
    };
    const translatedDoc = translateNode(doc);
    return serializeQuestionContent(translatedDoc);
  }

  return t(value);
}

export function extractModuleTexts(module?: LearningModule | null): string[] {
  if (!module) return [];
  const texts = new Set<string>();

  const add = (val?: string | null) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.length > 0) {
        texts.add(trimmed);
      }
    }
  };

  const addContent = (val?: string | null) => {
    const extracted = extractFromRichOrPlain(val);
    for (const item of extracted) {
      add(item);
    }
  };

  add(module.title);
  add(module.description);

  if (Array.isArray(module.questions)) {
    for (const q of module.questions) {
      if (!q) continue;
      addContent(q.content);
      add(q.leftLabel);
      add(q.rightLabel);
      add(q.explanation);
      add(q.feedback);
      add(q.postCallMessage);

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          add(opt);
        }
      }

      if (Array.isArray(q.items)) {
        for (const item of q.items) {
          add(item);
        }
      }

      if (Array.isArray(q.messages)) {
        for (const msg of q.messages) {
          if (msg) add(msg.text);
        }
      }

      if (Array.isArray(q.chatSteps)) {
        for (const step of q.chatSteps) {
          if (!step) continue;
          if (Array.isArray(step.messages)) {
            for (const msg of step.messages) {
              if (msg) add(msg.text);
            }
          }
          if (Array.isArray(step.options)) {
            for (const opt of step.options) {
              if (opt) {
                add(opt.text);
                add(opt.feedback);
              }
            }
          }
        }
      }
    }
  }

  return Array.from(texts);
}

export interface TranslatedModuleData {
  module: LearningModule;
  translations: Record<string, string>;
  originalToTranslated: (text?: string | null) => string;
  translatedToOriginal: (text?: string | null) => string;
}

export function translateModuleData(
  module: LearningModule,
  translations: Record<string, string> = {},
): TranslatedModuleData {
  const t = (text?: string | null): string => {
    if (!text || typeof text !== "string") return text || "";
    const trimmed = text.trim();
    return translations[trimmed] || translations[text] || text;
  };

  const reverseMap = new Map<string, string>();
  for (const [orig, trans] of Object.entries(translations)) {
    if (trans && orig) {
      reverseMap.set(trans, orig);
      reverseMap.set(trans.trim(), orig.trim());
    }
  }

  const translatedQuestions: ModuleQuestion[] = (module.questions || []).map(
    (q) => {
      const cloned: ModuleQuestion = { ...q };

      if (q.content) {
        cloned.content = translateRichOrPlain(q.content, t);
      }
      if (q.leftLabel) cloned.leftLabel = t(q.leftLabel);
      if (q.rightLabel) cloned.rightLabel = t(q.rightLabel);
      if (q.explanation) cloned.explanation = t(q.explanation);
      if (q.feedback) cloned.feedback = t(q.feedback);
      if (q.postCallMessage) cloned.postCallMessage = t(q.postCallMessage);

      if (Array.isArray(q.options)) {
        cloned.options = q.options.map((opt) => t(opt));
      }

      if (Array.isArray(q.items)) {
        cloned.items = q.items.map((item) => t(item));
      }

      if (Array.isArray(q.messages)) {
        cloned.messages = q.messages.map((msg) => ({
          ...msg,
          text: t(msg.text),
        }));
      }

      if (Array.isArray(q.chatSteps)) {
        cloned.chatSteps = q.chatSteps.map((step) => {
          const clonedStep: IChatStep = {
            ...step,
            messages: (step.messages || []).map((msg) => ({
              ...msg,
              text: t(msg.text),
            })),
            options: (step.options || []).map((opt) => ({
              ...opt,
              text: t(opt.text),
              feedback: opt.feedback ? t(opt.feedback) : opt.feedback,
            })),
          };
          return clonedStep;
        });
      }

      return cloned;
    },
  );

  const translatedModule: LearningModule = {
    ...module,
    title: t(module.title),
    description: t(module.description),
    questions: translatedQuestions,
  };

  return {
    module: translatedModule,
    translations,
    originalToTranslated: (text?: string | null) => {
      if (!text) return "";
      return t(text);
    },
    translatedToOriginal: (text?: string | null) => {
      if (!text) return "";
      return reverseMap.get(text) || reverseMap.get(text.trim()) || text;
    },
  };
}
