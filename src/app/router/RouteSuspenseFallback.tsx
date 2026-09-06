export default function RouteSuspenseFallback() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </section>
  );
}
