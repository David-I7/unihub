import { z } from "zod";
import type { MaterialLinkType } from "../api/types";

export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MEDIA_TYPES: Record<string, number> = {
  "application/pdf": MAX_PDF_SIZE_BYTES,
  "image/png": MAX_IMAGE_SIZE_BYTES,
  "image/jpeg": MAX_IMAGE_SIZE_BYTES,
  "image/webp": MAX_IMAGE_SIZE_BYTES,
};

export const GITHUB_DOMAINS = [
  "github.com",
  "gist.github.com",
  "raw.githubusercontent.com",
  "gitlab.com",
  "bitbucket.org",
  "codeberg.org",
];

export const DRIVE_DOMAINS = [
  "drive.google.com",
  "docs.google.com",
  "onedrive.live.com",
  "1drv.ms",
  "onedrive.com",
  "sharepoint.com",
];

export const VIDEO_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  "loom.com",
  "www.loom.com",
  "dailymotion.com",
  "www.dailymotion.com",
  "twitch.tv",
  "www.twitch.tv",
];

export function detectLinkType(
  rawUrl: string,
): MaterialLinkType {
  try {
    const url = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? new URL(rawUrl)
      : new URL(`https://${rawUrl}`);

    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (
      GITHUB_DOMAINS.includes(host) ||
      host.endsWith(".github.com") ||
      host.endsWith(".github.io") ||
      host.endsWith(".gitlab.com") ||
      host.endsWith(".gitlab.io") ||
      host.endsWith(".bitbucket.org") ||
      host.endsWith(".codeberg.org")
    ) {
      return "GITHUB";
    }

    if (
      DRIVE_DOMAINS.includes(host) ||
      host.endsWith(".drive.google.com") ||
      host.endsWith(".docs.google.com") ||
      host.endsWith(".onedrive.live.com") ||
      host.endsWith(".onedrive.com") ||
      host.endsWith(".sharepoint.com") ||
      host === "1drv.ms"
    ) {
      return "DRIVE";
    }

    if (
      VIDEO_DOMAINS.includes(host) ||
      host.endsWith(".youtube.com") ||
      host.endsWith(".vimeo.com") ||
      host.endsWith(".loom.com") ||
      host.endsWith(".dailymotion.com") ||
      host.endsWith(".twitch.tv")
    ) {
      return "VIDEO";
    }

    if (pathname.endsWith(".docx") || pathname.endsWith(".doc")) {
      return "DOCX";
    }

    return "OTHER";
  } catch {
    return "OTHER";
  }
}

export function validateLinkDomain(urlStr: string, linkType: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    if (linkType === "GITHUB") {
      return (
        GITHUB_DOMAINS.includes(host) ||
        host.endsWith(".github.com") ||
        host.endsWith(".github.io") ||
        host.endsWith(".gitlab.com") ||
        host.endsWith(".gitlab.io") ||
        host.endsWith(".bitbucket.org") ||
        host.endsWith(".codeberg.org")
      );
    }
    if (linkType === "DRIVE") {
      return (
        DRIVE_DOMAINS.includes(host) ||
        host.endsWith(".drive.google.com") ||
        host.endsWith(".docs.google.com") ||
        host.endsWith(".onedrive.live.com") ||
        host.endsWith(".onedrive.com") ||
        host.endsWith(".sharepoint.com") ||
        host === "1drv.ms"
      );
    }
    if (linkType === "VIDEO") {
      return (
        VIDEO_DOMAINS.includes(host) ||
        host.endsWith(".youtube.com") ||
        host.endsWith(".vimeo.com") ||
        host.endsWith(".loom.com") ||
        host.endsWith(".dailymotion.com") ||
        host.endsWith(".twitch.tv")
      );
    }
    return true;
  } catch {
    return false;
  }
}

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name must not exceed 100 characters"),
});

export type CreateFolderFormData = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name must not exceed 100 characters"),
});

export type UpdateFolderFormData = z.infer<typeof updateFolderSchema>;

export const uploadFileSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  file: z.custom<File>(
    (val) => typeof File !== "undefined" && val instanceof File,
    "File is required",
  ),
});

export type UploadFileFormData = z.infer<typeof uploadFileSchema>;

export const createLinkSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters"),
    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),
    url: z
      .string()
      .trim()
      .min(1, "URL is required")
      .url("Must be a valid URL")
      .refine((val) => val.startsWith("https://"), {
        message: "Only HTTPS URLs are allowed",
      }),
    linkType: z.enum(["VIDEO", "DRIVE", "GITHUB", "DOCS", "DOCX", "OTHER"]),
  })
  .refine((data) => validateLinkDomain(data.url, data.linkType), {
    message: "URL domain does not match the selected link type",
    path: ["url"],
  });

export type CreateLinkFormData = z.infer<typeof createLinkSchema>;

export const updateMaterialSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters")
      .optional(),
    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),
    url: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .refine((val) => val.startsWith("https://"), {
        message: "Only HTTPS URLs are allowed",
      })
      .optional()
      .or(z.literal("")),
    linkType: z
      .enum(["VIDEO", "DRIVE", "GITHUB", "DOCS", "DOCX", "OTHER"])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.url && data.linkType) {
        return validateLinkDomain(data.url, data.linkType);
      }
      return true;
    },
    {
      message: "URL domain does not match the selected link type",
      path: ["url"],
    },
  );

export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
