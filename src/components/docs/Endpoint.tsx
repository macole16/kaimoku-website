const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800",
  POST: "bg-blue-100 text-blue-800",
  PUT: "bg-amber-100 text-amber-800",
  PATCH: "bg-orange-100 text-orange-800",
  DELETE: "bg-red-100 text-red-800",
};

export function Endpoint({
  method,
  path,
  desc,
  auth,
}: {
  method: string;
  path: string;
  desc?: string;
  auth?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span
        className={`inline-block w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${methodColors[method] ?? "bg-slate-100 text-slate-700"}`}
      >
        {method}
      </span>
      <div className="min-w-0">
        <code className="break-all text-sm text-slate-800">{path}</code>
        {desc && (
          <span className="ml-2 text-sm text-slate-500">— {desc}</span>
        )}
        {auth && (
          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
            {auth}
          </span>
        )}
      </div>
    </div>
  );
}
