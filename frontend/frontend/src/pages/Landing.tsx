import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand px-4 text-center text-white">
      <div>
        <h1 className="text-3xl font-bold">🚨 AapdaSaarthi</h1>
        <p className="mt-2 max-w-md text-sm text-slate-300">
          Real-time disaster early-warning &amp; resource coordination platform.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/report"
          className="rounded-md bg-red-600 px-6 py-3 text-base font-semibold hover:bg-red-700"
        >
          Report an Emergency
        </Link>
        <Link
          to="/dashboard"
          className="rounded-md bg-white/10 px-6 py-3 text-base font-semibold hover:bg-white/20"
        >
          Authority Dashboard
        </Link>
      </div>
    </div>
  );
}
