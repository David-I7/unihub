import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content?: string | null;
  className?: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-4 mb-2 first:mt-0 break-words">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground mt-3.5 mb-1.5 pb-1 border-b border-border/40 break-words">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground mt-3 mb-1 break-words">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-heading text-sm sm:text-base font-semibold text-foreground mt-2.5 mb-1 break-words">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="leading-relaxed text-foreground/90 my-2 break-words">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-muted-foreground">{children}</del>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 my-2 break-words">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 my-2 break-words">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-foreground/90">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/60 bg-muted/30 px-3.5 py-2 my-2.5 italic text-muted-foreground rounded-r-lg">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium break-all">
          {children}
        </code>
      );
    }
    return (
      <code className="block rounded-xl bg-muted/60 p-3.5 border border-border/60 font-mono text-xs overflow-x-auto text-foreground my-2.5 leading-relaxed whitespace-pre">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2.5 overflow-x-auto rounded-xl">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-3 w-full overflow-x-auto rounded-lg border border-border shadow-2xs">
      <table className="w-full text-left text-xs min-w-[280px]">
        {children}
      </table>
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
  tr: ({ children }) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3.5 py-2 font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2 text-foreground/90">{children}</td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium break-all"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-border/60" />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="rounded-xl max-w-full h-auto my-3 border border-border"
    />
  ),
  input: (props) => {
    if (props.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={props.checked}
          disabled
          className="mr-2 rounded accent-primary align-middle pointer-events-none"
        />
      );
    }
    return <input {...props} />;
  },
};

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={cn("text-xs sm:text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
