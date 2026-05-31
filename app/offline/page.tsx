export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f7e1cd] p-8 text-center text-[#4a3b2f]">
      <h1 className="font-serif text-3xl">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-[#7d5a3c]">
        It looks like you&apos;ve lost connection. Please reconnect to view the
        invitation again.
      </p>
    </main>
  );
}
