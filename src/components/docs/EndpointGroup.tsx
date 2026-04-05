export function EndpointGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white">
      {title && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        </div>
      )}
      <div className="px-4">{children}</div>
    </div>
  );
}
