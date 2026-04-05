export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}
