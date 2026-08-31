import {
  FileText,
  Globe,
  FileCode,
  FileArchive,
  Image,
  GitBranch,
} from "@/components/ui/icons";

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileCategory(mediaType: string): string {
  const mt = mediaType.toLowerCase();
  if (mt.includes("pdf")) return "PDF Document";
  if (mt.includes("image")) return "Image";
  if (mt.includes("video")) return "Video";
  if (mt.includes("audio")) return "Audio";
  if (
    mt.includes("zip") ||
    mt.includes("tar") ||
    mt.includes("rar") ||
    mt.includes("7z") ||
    mt.includes("compressed")
  )
    return "Archive";
  if (
    mt.includes("javascript") ||
    mt.includes("typescript") ||
    mt.includes("json") ||
    mt.includes("python") ||
    mt.includes("java") ||
    mt.includes("cpp") ||
    mt.includes("c") ||
    mt.includes("html") ||
    mt.includes("css") ||
    mt.includes("xml")
  )
    return "Source Code";
  if (mt.includes("word") || mt.includes("document") || mt.includes("text"))
    return "Document";
  if (mt.includes("presentation") || mt.includes("powerpoint"))
    return "Presentation";
  if (mt.includes("sheet") || mt.includes("excel") || mt.includes("csv"))
    return "Spreadsheet";
  return "File";
}

export function getFileIcon(mediaType: string, className = "size-4 shrink-0") {
  const mt = mediaType.toLowerCase();
  if (mt.includes("pdf"))
    return <FileText className={`${className} text-rose-500`} />;
  if (mt.includes("image"))
    return <Image className={`${className} text-blue-500`} />;
  if (
    mt.includes("zip") ||
    mt.includes("tar") ||
    mt.includes("rar") ||
    mt.includes("7z") ||
    mt.includes("compressed")
  )
    return <FileArchive className={`${className} text-amber-500`} />;
  if (
    mt.includes("javascript") ||
    mt.includes("typescript") ||
    mt.includes("json") ||
    mt.includes("python") ||
    mt.includes("java") ||
    mt.includes("cpp") ||
    mt.includes("c") ||
    mt.includes("html") ||
    mt.includes("css")
  )
    return <FileCode className={`${className} text-emerald-500`} />;
  return <FileText className={`${className} text-muted-foreground`} />;
}

export function getLinkIcon(linkType: string, className = "size-4 shrink-0") {
  if (linkType.toUpperCase() === "GITHUB")
    return <GitBranch className={`${className} text-foreground`} />;
  return <Globe className={`${className} text-primary`} />;
}
