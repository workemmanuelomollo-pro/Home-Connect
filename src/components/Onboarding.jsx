import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const steps = ["account", "role", "provider", "verification", "complete"];

function Logo() {
  return (
    <div className="flex items-center">
      <img
        src="/logo.png"
        alt="Home Service Connect"
        className="h-12 w-auto object-contain sm:h-14"
      />
    </div>
  );
}

export default function Onboarding({ onExplore }) {
  const [step, setStep] = useState("account");
  const [mode, setMode] = useState("signup");
  const [verificationMethod, setVerificationMethod] = useState("email");
  const [message, setMessage] = useState("");

  const stepIndex = steps.indexOf(step);
  const handleAccountSubmit = (event) => {
    event.preventDefault();
    if (mode === "signin") {
      setMessage("Sign-in is a preview only. No account has been authenticated.");
      return;
    }

    setMessage("");
    setStep("role");
  };

  const handleProviderSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setStep("verification");
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-100 bg-brand-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <button
            type="button"
            onClick={onExplore}
            className="rounded-full border border-brand-200 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-white"
          >
            Explore services
          </button>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16">
        <section className="relative overflow-hidden rounded-3xl bg-[#163f3f] px-7 py-10 text-white shadow-xl shadow-brand-900/10 sm:px-10 sm:py-14">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#163f3f] via-[#163f3f]/90 to-brand-700/70" />
          </div>
          <div className="relative">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100/20 bg-brand-100/10 px-3 py-1.5 text-sm font-medium text-slate-100">
              <ShieldCheck size={16} className="text-brand-200" />
              Local help, built on trust
            </span>
            <h1 className="max-w-lg text-4xl font-extrabold leading-tight sm:text-5xl">
              Home help starts with the right connection.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-200">
              Find a trusted local professional, or take the first steps toward
              joining our provider community.
            </p>
            <div className="mt-9 space-y-4 text-sm text-slate-200">
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-brand-200" />
                Browse services by neighborhood
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-brand-200" />
                Choose whether to join as a client or a provider
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-brand-200" />
                Provider verification steps are shown before onboarding ends
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl justify-self-center rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/10 sm:p-9">
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
            <strong>Prototype mode:</strong> Google sign-in, email/WhatsApp
            codes, and ID uploads are not connected. Nothing is saved, sent,
            uploaded, or verified.
          </div>

          {step !== "account" && (
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Account setup</span>
                <span>Step {stepIndex + 1} of 4</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${(Math.min(stepIndex, 4) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === "account" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === "signup" ? "Get started" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {mode === "signup"
                    ? "Create an account preview, then choose how you want to use HomeConnect."
                    : "Sign-in will be available when authentication is connected."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "Google sign-in is not connected yet. Configure an authentication provider to enable it."
                  )
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <span className="text-lg font-bold text-brand-600">G</span>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or use email
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {mode === "signup" && (
                  <label className="block text-sm font-medium text-slate-700">
                    Full name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="Your name"
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-slate-700">
                  Email address
                  <span className="relative mt-1.5 block">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="you@example.com"
                    />
                  </span>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <input
                    type="password"
                    name="password"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={8}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="At least 8 characters"
                  />
                </label>
                {message && (
                  <p role="status" className="text-sm text-amber-800">
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700"
                >
                  {mode === "signup" ? "Continue with email" : "Sign in"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                {mode === "signup"
                  ? "Already have an account?"
                  : "New to HomeConnect?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setMessage("");
                  }}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {mode === "signup" ? "Sign in" : "Create an account"}
                </button>
              </p>
            </>
          )}

          {step === "role" && (
            <>
              <button
                type="button"
                onClick={() => setStep("account")}
                className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                How will you use HomeConnect?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Clients can browse and book. Choose provider only if you want to
                offer services.
              </p>
              <div className="mt-6 grid gap-4">
                <button
                  type="button"
                  onClick={onExplore}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 text-left transition hover:border-brand-500"
                >
                  <span className="rounded-xl bg-white p-3 text-brand-600 shadow-sm">
                    <UserRound size={24} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-slate-900">
                      I need a service
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      Continue as a client and explore local pros.
                    </span>
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-brand-600 transition group-hover:translate-x-1"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setStep("provider")}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-brand-300 hover:bg-slate-50"
                >
                  <span className="rounded-xl bg-slate-100 p-3 text-slate-700">
                    <BriefcaseBusiness size={24} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-slate-900">
                      I want to offer services
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      Continue to provider details and verification preview.
                    </span>
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600"
                  />
                </button>
              </div>
            </>
          )}

          {step === "provider" && (
            <>
              <button
                type="button"
                onClick={() => setStep("role")}
                className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                Provider details
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                These are preview fields only. Do not enter real ID details
                until secure submission is set up.
              </p>
              <form onSubmit={handleProviderSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Legal name
                  <input
                    name="legalName"
                    autoComplete="name"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="Name as shown on your ID"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Phone number (WhatsApp or mobile)
                  <span className="relative mt-1.5 block">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </span>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Services you provide
                  <select
                    name="service"
                    required
                    defaultValue=""
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Cleaning</option>
                    <option>Repairs and maintenance</option>
                    <option>Other home services</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  ID card image or document
                  <input
                    type="file"
                    name="identityDocument"
                    accept="image/*,.pdf"
                    required
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    File selection stays in this browser preview and is not
                    uploaded.
                  </span>
                </label>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700"
                >
                  Continue to verification
                  <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}

          {step === "verification" && (
            <>
              <button
                type="button"
                onClick={() => setStep("provider")}
                className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={16} /> Back to details
              </button>
              <span className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                <BadgeCheck size={24} />
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Verify your contact
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                A real onboarding flow sends a one-time code to confirm your
                contact before a provider application is reviewed.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationMethod("email")}
                  className={`rounded-xl border p-4 text-left ${verificationMethod === "email" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-700"}`}
                >
                  <Mail size={20} className="mb-2" />
                  <span className="block font-semibold">Email code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod("whatsapp")}
                  className={`rounded-xl border p-4 text-left ${verificationMethod === "whatsapp" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-700"}`}
                >
                  <Phone size={20} className="mb-2" />
                  <span className="block font-semibold">WhatsApp code</span>
                </button>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                One-time verification code
                <input
                  type="text"
                  disabled
                  placeholder="Code entry activates after backend setup"
                  className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                />
              </label>
              <p role="status" className="mt-3 text-sm text-amber-800">
                {verificationMethod === "email" ? "Email" : "WhatsApp"} delivery
                is not connected. No code will be sent or verified.
              </p>
              <button
                type="button"
                onClick={() => setStep("complete")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Finish preview only
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === "complete" && (
            <div className="py-5 text-center">
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <ShieldCheck size={28} />
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Provider flow preview complete
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                No account was created, contact verified, or ID document
                uploaded. Connect secure authentication and storage before
                collecting real provider information. Package tiers and pricing
                can be added later.
              </p>
              <button
                type="button"
                onClick={onExplore}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Explore services
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
