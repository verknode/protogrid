export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-ink-shadow">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
