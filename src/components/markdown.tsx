import ReactMarkdown from "react-markdown";

/** Shared markdown renderer with app typography (no prose plugin needed). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="font-display text-xl font-semibold" {...props} />,
          h2: (props) => <h2 className="mt-5 font-display text-lg font-semibold" {...props} />,
          h3: (props) => (
            <h3 className="mt-4 font-display text-base font-semibold text-primary" {...props} />
          ),
          h4: (props) => <h4 className="mt-3 text-sm font-semibold" {...props} />,
          p: (props) => <p className="leading-relaxed" {...props} />,
          ul: (props) => <ul className="ml-5 list-disc space-y-1" {...props} />,
          ol: (props) => <ol className="ml-5 list-decimal space-y-1" {...props} />,
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          em: (props) => <em className="italic text-muted-foreground" {...props} />,
          hr: () => <hr className="my-4 border-border" />,
          blockquote: (props) => (
            <blockquote className="border-l-2 border-clay pl-3 text-muted-foreground" {...props} />
          ),
          a: (props) => <a className="text-primary underline" {...props} />,
          code: (props) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border-b border-border px-2 py-1.5 font-semibold" {...props} />
          ),
          td: (props) => <td className="border-b border-border/60 px-2 py-1.5 align-top" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
