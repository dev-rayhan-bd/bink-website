import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import { format } from "date-fns";
import { toast } from "sonner";

// Success Toast
export const SuccessToast = (msg: string) => {
  toast.success(msg);
};

// Error Toast
export const ErrorToast = (msg: string) => {
  toast.error(msg);
};

// Warning Toast
export const WarningToast = (msg: string) => {
  toast.warning(msg);
};

// Info Toast
export const InfoToast = (msg: string) => {
  toast.info(msg);
};

// Get Initials
export const getInitials = (name: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "N";
  // const second = parts[1]?.[0] || parts[0]?.[1] || "A";
  return (first).toUpperCase();
};

// Format Date
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "dd MMM yyyy");
};

// Time Ago
export const timeAgo = (createdAt: string) => {
  if (!createdAt) return "";
  const s = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

// Generate Slug
export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with -
    .replace(/^-+|-+$/g, ""); // Always remove leading and trailing hyphens
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculates relative luminance to determine whether white or dark text offers better WCAG contrast.
 */
export const isDarkColor = (hexColor?: string): boolean => {
  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    return false;
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 140;
};

/**
 * Extracts a valid participant first name, ignoring generic placeholders like "User", "Guest", "Admin".
 */
export const getParticipantFirstName = (user?: {
  firstName?: string | null;
  fullName?: string | null;
  name?: string | null;
} | null): string => {
  if (!user) return "";
  const isGeneric = (name: string) =>
    /^(user|guest|admin|deelnemer|company)$/i.test(name.trim());

  const firstName = user.firstName?.trim();
  if (firstName && !isGeneric(firstName)) {
    return firstName;
  }

  const fullName = (user.fullName || user.name || "").trim();
  if (fullName && !isGeneric(fullName)) {
    const firstWord = fullName.split(/\s+/)[0];
    if (firstWord && !isGeneric(firstWord)) {
      return firstWord;
    }
  }

  return "";
};

/**
 * Formats a welcome greeting according to participant name and language.
 * If first name is missing/generic, it returns the greeting without a name.
 */
export const formatWelcomeGreeting = (
  firstName?: string,
  lang: "nl" | "en" = "nl"
): string => {
  const cleanName = firstName?.trim();
  if (lang === "en") {
    return cleanName
      ? `Hi ${cleanName}, welcome to the program`
      : "Hi, welcome to the program";
  }
  return cleanName
    ? `Hoi ${cleanName}, welkom bij het programma`
    : "Hoi, welkom bij het programma";
};

/**
 * Formats custom branding video titles, replacing placeholders like "{name}", "{firstName}", "Hi User", or "Hoi User".
 * If no participant name is available, generic phrases like "Hi User" / "Hoi User" are replaced without the name.
 */
export const formatBrandingVideoTitle = (
  title?: string | null,
  firstName?: string,
  lang: "nl" | "en" = "nl"
): string => {
  const cleanName = firstName?.trim();
  if (!title || !title.trim()) {
    return formatWelcomeGreeting(cleanName, lang);
  }

  let formatted = title.trim();

  if (cleanName) {
    formatted = formatted
      .replace(/\{(?:first_?name|name)\}/gi, cleanName)
      .replace(/\bHi\s+User\b/gi, `Hi ${cleanName}`)
      .replace(/\bHoi\s+User\b/gi, `Hoi ${cleanName}`);
  } else {
    formatted = formatted
      .replace(/\s*\{(?:first_?name|name)\}\s*,?/gi, "")
      .replace(/\bHi\s+User,\s*/gi, "Hi, ")
      .replace(/\bHi\s+User\b/gi, "Hi")
      .replace(/\bHoi\s+User,\s*/gi, "Hoi, ")
      .replace(/\bHoi\s+User\b/gi, "Hoi");
  }

  return formatted.trim();
};

