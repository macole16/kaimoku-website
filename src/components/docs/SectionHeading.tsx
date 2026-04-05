export function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="mb-6 scroll-mt-24 text-2xl font-bold text-primary">
      {children}
    </h2>
  );
}
