/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import type { LearningModule, ModuleData } from "@/lib/types/module.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import {
  createModuleSchema,
  type CreateModuleFormValues,
} from "@/lib/validations/course";
import { createModule, updateModule } from "@/services/module.service";
import { ModuleBasicInfo } from "./ModuleBasicInfo";
import { QuestionnaireSection } from "./QuestionnaireSection";
import { ModulePreview } from "./ModulePreview";

const mediaFields = [
  "image",
  "videoUrl",
  "callerPhoto",
  "postCallVideoUrl",
] as const;

const isFileValue = (value: unknown): value is File => value instanceof File;

const prepareModulePayload = (values: CreateModuleFormValues) => {
  const questionFiles: Record<string, File> = {};
  const questions = values.questions.map((question, index) => {
    const cleanQuestion = { ...question } as Record<string, unknown>;

    if (
      ["Free Input", "Rating", "Information", "Simulated Call"].includes(
        String(cleanQuestion.type),
      )
    ) {
      delete cleanQuestion.correctAnswer;
    }

    mediaFields.forEach((field) => {
      const value = cleanQuestion[field];
      if (isFileValue(value)) {
        questionFiles[`questions[${index}].${field}`] = value;
        cleanQuestion[field] = "";
      }
    });

    return cleanQuestion as ModuleData["questions"][number];
  });

  return {
    data: {
      title: values.title,
      description: values.description,
      questions,
    },
    questionFiles,
  };
};

export function ModuleEditor({ module }: { module?: LearningModule }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isEditing = Boolean(module);

  const methods = useForm<CreateModuleFormValues>({
    resolver: zodResolver(createModuleSchema as any),
    defaultValues: {
      title: module?.title || "",
      description: module?.description || "",
      questions:
        (module?.questions.map((question) => {
          const questionWithColor = {
            ...question,
            colorCode: question.colorCode || "#E9308F",
            blockColor: question.blockColor || "",
          };
          if (question.type === "MCQ") {
            const options = question.options || [];
            return {
              ...questionWithColor,
              options:
                options.length >= 4
                  ? options
                  : [...options, ...Array(4 - options.length).fill("")],
            };
          }

          if (question.type === "Ordering") {
            const items = question.items || [];
            return {
              ...questionWithColor,
              items:
                items.length >= 4
                  ? items
                  : [...items, ...Array(4 - items.length).fill("")],
            };
          }

          if (question.type === "Chat Scenario") {
            const options = question.options || [];
            return {
              ...questionWithColor,
              options:
                options.length >= 2
                  ? options
                  : [...options, ...Array(2 - options.length).fill("")],
              correctAnswer: question.correctAnswer || "",
            };
          }

          return questionWithColor;
        }) as CreateModuleFormValues["questions"]) || [],
    },
  });

  const onSubmit = async (values: CreateModuleFormValues) => {
    const thumbnailImage = isFileValue(values.thumbnail)
      ? values.thumbnail
      : undefined;

    if (!isEditing && !thumbnailImage) {
      ErrorToast("Thumbnail image is required");
      return;
    }

    const { data, questionFiles } = prepareModulePayload(values);

    setIsPending(true);

    try {
      const response = module
        ? await updateModule(module._id, {
            ...data,
            thumbnailImage,
            questionFiles,
          })
        : await createModule({
            data,
            thumbnailImage: thumbnailImage as File,
            questionFiles,
          });

      if (!response.success) throw new Error(response.message);
      SuccessToast(
        response.message ||
          (isEditing
            ? "Module updated successfully"
            : "Module created successfully"),
      );
      router.replace("/super-admin/course");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : `Unable to ${isEditing ? "update" : "create"} module`,
      );
    } finally {
      setIsPending(false);
    }
  };

  const onInvalid = (errors: FieldErrors<CreateModuleFormValues>) => {
    let firstErrorMessage = "Please complete all required module fields";
    let firstErrorElementId: string | null = null;

    if (errors.title?.message) {
      firstErrorMessage = `Module Title: ${errors.title.message}`;
      firstErrorElementId = "module-title";
    } else if (errors.description?.message) {
      firstErrorMessage = `Module Description: ${errors.description.message}`;
      firstErrorElementId = "module-desc";
    } else if (errors.thumbnail?.message) {
      firstErrorMessage = `Thumbnail Image: ${errors.thumbnail.message}`;
      firstErrorElementId = "module-thumbnail";
    } else if (errors.questions) {
      if (typeof errors.questions.message === "string") {
        firstErrorMessage = errors.questions.message;
      } else if ((errors.questions as any).root?.message) {
        firstErrorMessage = (errors.questions as any).root.message;
      } else if (typeof errors.questions === "object" && errors.questions !== null) {
        const entries = Object.entries(errors.questions);
        for (const [key, qErr] of entries) {
          if (qErr && typeof qErr === "object") {
            const index = Number(key);
            if (!Number.isNaN(index)) {
              firstErrorElementId = `question-block-${index}`;
            }
            const findFirstMsg = (val: unknown): string | undefined => {
              if (!val || typeof val !== "object") return undefined;
              if ("message" in val && typeof (val as any).message === "string") {
                return (val as any).message;
              }
              for (const nested of Object.values(val)) {
                const msg = findFirstMsg(nested);
                if (msg) return msg;
              }
              return undefined;
            };
            const innerMsg = findFirstMsg(qErr);
            const questionNum = !Number.isNaN(index)
              ? `Question ${index + 1}: `
              : "";
            firstErrorMessage = `${questionNum}${innerMsg || "Please fill in required fields"}`;
            break;
          }
        }
      }
    }

    ErrorToast(firstErrorMessage);

    setTimeout(() => {
      let targetElement: HTMLElement | null = null;
      if (firstErrorElementId) {
        targetElement = document.getElementById(firstErrorElementId);
      }
      if (!targetElement) {
        targetElement = document.querySelector(
          "[aria-invalid='true'], [data-invalid='true'], .border-destructive",
        ) as HTMLElement | null;
      }

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        if (
          typeof (targetElement as HTMLInputElement).focus === "function" &&
          targetElement.tagName !== "DIV"
        ) {
          (targetElement as HTMLInputElement).focus();
        }
      }
    }, 100);
  };

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)}>
            <Button asChild variant="outline" className="mb-4">
              <Link href="/super-admin/course">
                <ArrowLeft /> Back to Directory
              </Link>
            </Button>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7 xl:col-span-8 pb-10">
                <ModuleBasicInfo existingThumbnail={module?.thumbnailImage} />
                <QuestionnaireSection />

                <div className="pt-8 border-t">
                  <Button
                    type="submit"
                    disabled={isPending}
                    size="lg"
                    className="w-full sm:w-auto font-bold text-md shadow-md px-10"
                  >
                    {isEditing ? (
                      <Save className="mr-2" />
                    ) : (
                      <Upload className="mr-2" />
                    )}
                    {isPending
                      ? "Saving..."
                      : isEditing
                        ? "Save Module"
                        : "Create Module"}
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-6">
                  <ModulePreview existingThumbnail={module?.thumbnailImage} />
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </DashboardPageLayout>
    </div>
  );
}
