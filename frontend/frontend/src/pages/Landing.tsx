import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center text-white"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay so text stays readable over the photo */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content sits above the overlay */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-5xl">
            AapdaSaarthi
          </h1>
          <p className="mt-3 max-w-md text-base font-medium text-slate-200 drop-shadow">
            Real-time disaster early-warning &amp; resource coordination platform.
            <br />
            <span className="text-sm text-slate-300">
              Bridging the gap between disaster information and disaster response.
            </span>
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/report"
            className="rounded-md bg-red-600 px-6 py-3 text-base font-semibold shadow-lg transition-colors hover:bg-red-700 active:scale-95"
          >
            Report an Emergency
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold shadow-lg backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-95"
          >
            Authority Dashboard
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Powered by NDRF &amp; District Disaster Management Authority
        </p>
      </div>
    </div>
  );
}
