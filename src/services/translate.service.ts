"use server";

import { nextServerFetch } from "@/lib/nextServerFetch";
import type { ApiResponse } from "@/lib/types/api.type";

export type TranslateScreenPayload = {
  screen?: string;
  targetLang?: string;
  texts: string[];
};

export type TranslateScreenResponseData = {
  translations: Record<string, string>;
  screen: string;
  targetLang: string;
  stats?: {
    totalRequested: number;
    servedFromCache: number;
    fetchedFromApi: number;
  };
};

export const translateScreenTexts = async (
  texts: string[],
  screen = "quiz_screen",
  targetLang = "nl",
): Promise<Record<string, string>> => {
  if (!Array.isArray(texts) || texts.length === 0) return {};

  const uniqueTexts = Array.from(
    new Set(
      texts
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0),
    ),
  );

  if (uniqueTexts.length === 0) return {};

  try {
    const response = await nextServerFetch<ApiResponse<TranslateScreenResponseData>>(
      "/translate/screen",
      {
        method: "POST",
        body: {
          screen,
          targetLang,
          texts: uniqueTexts,
        },
        auth: "optional",
        cache: "no-store",
      },
    );

    if (response?.success && response.data?.translations) {
      return response.data.translations;
    }
    return {};
  } catch {
    return {};
  }
};
