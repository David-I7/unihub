import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Edit3, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { EditCommunityReadmeModal } from "./EditCommunityReadmeModal";
import type { Community } from "../../api/types";

interface CommunityReadmeTabProps {
  community: Community;
}

export function CommunityReadmeTab({ community }: CommunityReadmeTabProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { canEditCommunity } = usePermissions(community.slug);

  const hasReadme = Boolean(community.readme && community.readme.trim().length > 0);

  return (
    <div className="max-w-4xl space-y-6 py-2">
      {/* Top Banner with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <h2 className="font-heading text-lg font-bold text-foreground">
            About {community.name}
          </h2>
        </div>

        {canEditCommunity && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditModalOpen(true)}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            <Edit3 className="size-3.5" />
            Edit Readme
          </Button>
        )}
      </div>

      {/* Brief Description Callout Card */}
      {community.description && (
        <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Info className="size-4" />
            <span>Community Summary</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed font-normal">
            {community.description}
          </p>
        </Card>
      )}

      {/* Main Markdown Readme Content */}
      {hasReadme ? (
        <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm md:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground mt-6 mb-3 pb-1 border-b border-border/40">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mt-5 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed text-foreground/90 my-3 text-sm md:text-base">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside pl-6 space-y-1.5 text-sm md:text-base text-foreground/90 my-3">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside pl-6 space-y-1.5 text-sm md:text-base text-foreground/90 my-3">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/60 bg-muted/30 px-4 py-2 my-4 italic text-muted-foreground rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block rounded-xl bg-muted/60 p-4 border border-border/60 font-mono text-xs overflow-x-auto text-foreground my-4 leading-relaxed">
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="my-6 w-full overflow-x-auto rounded-xl border border-border shadow-2xs">
                    <table className="w-full text-left text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/60 border-b border-border font-bold text-foreground">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border/60">{children}</tbody>
                ),
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-2.5 font-semibold text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2.5 text-foreground/90">{children}</td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-6 border-border/60" />,
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">
                    {children}
                  </strong>
                ),
              }}
            >
              {community.readme}
            </ReactMarkdown>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              No Readme Document Added Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              An expanded markdown document gives members an overview of study
              curriculums, resources, and guidelines.
            </p>
          </div>

          {canEditCommunity && (
            <Button
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="gap-1.5 font-semibold cursor-pointer"
            >
              <Plus className="size-4" />
              Write Community Readme
            </Button>
          )}
        </div>
      )}

      <EditCommunityReadmeModal
        community={community}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
