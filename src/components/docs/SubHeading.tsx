export function SubHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="mb-4 mt-8 scroll-mt-24 text-xl font-semibold text-slate-900"
    >
      {children}
    </h3>
  );
}
