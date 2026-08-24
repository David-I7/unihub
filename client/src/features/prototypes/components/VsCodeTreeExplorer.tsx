import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Video,
  ExternalLink,
  Download,
  Calendar,
  Award,
  AlertTriangle,
  Star,
  Search,
  Code2,
  FileCode,
  CheckCircle2,
  Copy,
  Terminal,
  Layers,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MockTreeItem,
  MockResource,
  MockCourseOffering,
} from "../data/mockAcademicData";
import { buildVsCodeTreeFromOffering } from "../data/mockAcademicData";

interface VsCodeTreeExplorerProps {
  offering: MockCourseOffering;
  onOpenResourceDetail: (resource: MockResource) => void;
}

export function VsCodeTreeExplorer({
  offering,
  onOpenResourceDetail,
}: VsCodeTreeExplorerProps) {
  const rootTree = buildVsCodeTreeFromOffering(offering);

  // Expanded folders state (all open by default)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    [rootTree.id]: true,
    ...(rootTree.children?.reduce((acc, c) => ({ ...acc, [c.id]: true }), {}) || {}),
  });

  // Selected file item
  const firstFile = rootTree.children?.[0]?.children?.[0];
  const [selectedItem, setSelectedItem] = useState<MockTreeItem | null>(firstFile || null);
  const [fileFilter, setFileFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isStarredFile, setIsStarredFile] = useState(selectedItem?.resource?.isStarred || false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleSelectItem = (item: MockTreeItem) => {
    if (item.type === "folder") {
      toggleFolder(item.id);
    } else {
      setSelectedItem(item);
      setIsStarredFile(item.resource?.isStarred || false);
    }
  };

  const handleCopySnippet = (code?: string) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Render tree node recursively
  const renderTreeItem = (item: MockTreeItem, depth = 0) => {
    const isFolder = item.type === "folder";
    const isExpanded = !!expandedFolders[item.id];
    const isSelected = selectedItem?.id === item.id;

    const matchesFilter = fileFilter
      ? item.name.toLowerCase().includes(fileFilter.toLowerCase()) ||
        item.children?.some((c) => c.name.toLowerCase().includes(fileFilter.toLowerCase()))
      : true;

    if (!matchesFilter && !isFolder) return null;

    return (
      <div key={item.id} className="select-none text-xs">
        <div
          onClick={() => handleSelectItem(item)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center gap-1.5 py-1 pr-2 cursor-pointer transition-colors ${
            isSelected
              ? "bg-primary/20 text-primary font-bold border-l-2 border-primary"
              : "hover:bg-muted/50 text-foreground"
          }`}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="size-3.5 text-amber-500 shrink-0" />
              ) : (
                <Folder className="size-3.5 text-amber-500 shrink-0" />
              )}
              <span className="truncate font-semibold">{item.name}</span>
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              {/* Specific File Type Icons */}
              {item.extension === "pdf" && (
                <FileText className="size-3.5 text-rose-500 shrink-0" />
              )}
              {item.extension === "asm" && (
                <FileCode className="size-3.5 text-blue-500 shrink-0" />
              )}
              {item.extension === "md" && (
                <Code2 className="size-3.5 text-emerald-500 shrink-0" />
              )}
              {item.extension === "video" && (
                <Video className="size-3.5 text-purple-500 shrink-0" />
              )}
              {item.extension === "assign" && (
                <Award className="size-3.5 text-amber-500 shrink-0" />
              )}
              {item.extension === "exam" && (
                <AlertTriangle className="size-3.5 text-rose-500 shrink-0" />
              )}
              {item.extension === "lec" && (
                <Calendar className="size-3.5 text-teal-500 shrink-0" />
              )}
              {!["pdf", "asm", "md", "video", "assign", "exam", "lec"].includes(
                item.extension || ""
              ) && <FileText className="size-3.5 text-muted-foreground shrink-0" />}

              <span className="truncate">{item.name}</span>

              {item.resource?.isStarred && (
                <Star className="size-2.5 fill-amber-500 text-amber-500 ml-auto shrink-0" />
              )}
            </>
          )}
        </div>

        {/* Children if folder is expanded */}
        {isFolder && isExpanded && item.children && (
          <div>
            {item.children.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedResource = selectedItem?.resource;

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden min-h-[580px]">
      {/* LEFT VS CODE SIDEBAR EXPLORER */}
      <div className="w-full lg:w-72 border-r bg-muted/20 flex flex-col shrink-0">
        {/* Explorer Header */}
        <div className="p-3 border-b flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Layers className="size-3.5 text-primary" /> Explorer
          </div>

          <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {offering.courseAbbr}
          </span>
        </div>

        {/* Quick Filter */}
        <div className="p-2 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-2 top-2 size-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className="w-full rounded-md border bg-muted/30 pl-7 pr-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto py-2 font-mono">
          {renderTreeItem(rootTree)}
        </div>

        {/* Tree Footer stats */}
        <div className="p-2.5 border-t bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>{offering.folders.length} directories</span>
          <span>
            {offering.folders.reduce((acc, f) => acc + f.resources.length, 0)} items
          </span>
        </div>
      </div>

      {/* RIGHT VS CODE MAIN FILE PREVIEW & INSPECTOR */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top VS Code Tab Bar */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 h-10">
          {selectedItem ? (
            <div className="flex items-center gap-2 bg-background border-t-2 border-primary px-3 h-full font-mono text-xs font-semibold text-foreground">
              {selectedItem.extension === "pdf" && (
                <FileText className="size-3.5 text-rose-500" />
              )}
              {selectedItem.extension === "asm" && (
                <FileCode className="size-3.5 text-blue-500" />
              )}
              {selectedItem.extension === "md" && (
                <Code2 className="size-3.5 text-emerald-500" />
              )}
              {selectedItem.extension === "video" && (
                <Video className="size-3.5 text-purple-500" />
              )}
              {selectedItem.extension === "assign" && (
                <Award className="size-3.5 text-amber-500" />
              )}
              {selectedItem.extension === "exam" && (
                <AlertTriangle className="size-3.5 text-rose-500" />
              )}
              <span>{selectedItem.name}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">No file selected</span>
          )}

          {/* Breadcrumbs on Right */}
          {selectedItem && (
            <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <span>{selectedItem.path}</span>
            </div>
          )}
        </div>

        {/* File Content Body */}
        {selectedItem && selectedResource ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header with Title & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {selectedResource.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Added by <strong>{selectedResource.ownerName}</strong> • {new Date(selectedResource.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant={isStarredFile ? "default" : "outline"}
                  onClick={() => setIsStarredFile(!isStarredFile)}
                  className="gap-1 shadow-xs"
                >
                  <Star className={`size-3.5 ${isStarredFile ? "fill-white text-white" : "text-amber-500"}`} />
                  <span>{isStarredFile ? "Starred" : "Star for Reminders"}</span>
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onOpenResourceDetail(selectedResource)}
                  className="gap-1"
                >
                  <Eye className="size-3.5" /> Full Modal
                </Button>
              </div>
            </div>

            {/* Description */}
            {selectedResource.description && (
              <div className="rounded-xl border bg-muted/20 p-4 text-xs text-foreground leading-relaxed">
                {selectedResource.description}
              </div>
            )}

            {/* Content Display based on Extension / Subtype */}

            {/* A. Code & Cheatsheet Snippet Viewer */}
            {selectedResource.fileData?.fileContentSnippet && (
              <div className="rounded-xl border bg-slate-950 text-slate-100 shadow-md overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-3.5 text-primary" />
                    <span>{selectedItem.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySnippet(selectedResource.fileData?.fileContentSnippet)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                <pre className="p-4 overflow-x-auto leading-relaxed text-slate-200">
                  {selectedResource.fileData.fileContentSnippet}
                </pre>
              </div>
            )}

            {/* B. GitHub Repository Link Box */}
            {selectedResource.type === "MATERIAL_LINK" && selectedResource.linkData?.linkType === "GITHUB" && (
              <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                      <Code2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified GitHub Repository</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {selectedResource.linkData.url}
                    </p>
                  </div>

                  <a
                    href={selectedResource.linkData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shrink-0"
                  >
                    <ExternalLink className="size-3.5" /> Open GitHub
                  </a>
                </div>
              </div>
            )}

            {/* C. YouTube Lecture Playlist */}
            {selectedResource.type === "MATERIAL_LINK" && selectedResource.linkData?.linkType === "VIDEO" && (
              <div className="rounded-xl border bg-rose-500/5 border-rose-500/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                      <Video className="size-4 text-rose-500" />
                      <span>Lecture Video Playlist</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {selectedResource.linkData.url}
                    </p>
                  </div>

                  <a
                    href={selectedResource.linkData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shrink-0"
                  >
                    <ExternalLink className="size-3.5" /> Watch on YouTube
                  </a>
                </div>
              </div>
            )}

            {/* D. Assignment Milestone Card */}
            {selectedResource.type === "ASSIGNMENT" && selectedResource.assignmentData && (
              <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-background border p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-amber-500" /> Due Date:
                    </span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {new Date(selectedResource.assignmentData.dueDate).toLocaleDateString()} at 18:00
                    </p>
                  </div>

                  <div className="rounded-lg bg-background border p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="size-3 text-amber-500" /> Grade Weight:
                    </span>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedResource.assignmentData.gradeWeight}% of Final Mark
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* E. Exam Milestone Card */}
            {selectedResource.type === "EXAM" && selectedResource.examData && (
              <div className="rounded-xl border bg-rose-500/5 border-rose-500/20 p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-background border p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-rose-500" /> Scheduled Date:
                    </span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {new Date(selectedResource.examData.scheduledDate).toLocaleDateString()} at 18:00
                    </p>
                  </div>

                  <div className="rounded-lg bg-background border p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="size-3 text-rose-500" /> Exam Weight:
                    </span>
                    <p className="font-bold text-sm text-rose-600 dark:text-rose-400 mt-0.5">
                      {selectedResource.examData.gradeWeight}% of Final Mark
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t text-xs">
              <span className="font-mono text-muted-foreground">
                Path: {selectedItem.path}
              </span>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" className="gap-1" onClick={() => alert("File download started!")}>
                  <Download className="size-3.5" /> Download
                </Button>
                <Button size="xs" onClick={() => onOpenResourceDetail(selectedResource)}>
                  Open Detailed Inspector
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs space-y-2">
            <Layers className="size-8 text-primary/40" />
            <p>Select a file from the VS Code explorer on the left to preview its content and metadata.</p>
          </div>
        )}
      </div>
    </div>
  );
}
