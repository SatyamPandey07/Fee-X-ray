import Link from "next/link";

/* ─── Static data ────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "🔗",
    title: "Connect your accounts",
    body: "Securely link your bank and payment processor in under two minutes via Plaid. We never store your login credentials.",
  },
  {
    step: "02",
    icon: "🔍",
    title: "We scan for waste",
    body: "Our analysis engine inspects every transaction — comparing processor rates, flagging zombie subscriptions, spotting unwaived bank fees, and catching undisputed chargebacks.",
  },
  {
    step: "03",
    icon: "📋",
    title: "You get a plain-English report",
    body: "Every finding includes the exact dollar amount you're losing, a one-sentence explanation of why, and a concrete suggested action you can take today.",
  },
  {
    step: "04",
    icon: "📈",
    title: "Track your savings over time",
    body: "As you act on findings, Fee X-ray tracks how much you've saved month over month. Your savings dashboard is the proof your team can rally around.",
  },
];

const FEATURES = [
  { icon: "💳", label: "Processor Rate Benchmarking", desc: "See if you're overpaying vs. interchange-plus" },
  { icon: "🧟", label: "Zombie Subscription Detection", desc: "Recurring charges with no activity in 90+ days" },
  { icon: "🏦", label: "Unwaived Bank Fee Alerts", desc: "Fees that most banks waive just for asking" },
  { icon: "⚡", label: "Chargeback Risk Alerts", desc: "Disputes without responses before windows close" },
  { icon: "🔐", label: "Bank-Grade Security", desc: "Plaid-powered connections, encrypted at rest" },
  { icon: "👥", label: "Team Access", desc: "Invite your CFO or bookkeeper with role-based access" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For founders just getting started",
    features: [
      "1 bank connection",
      "Manual analysis runs",
      "Plain-English fee reports",
      "30-day transaction history",
    ],
    cta: "Start for free",
    href: "/api/auth/login",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For businesses serious about saving",
    features: [
      "Unlimited bank connections",
      "Scheduled auto-analysis (hourly)",
      "Full transaction history",
      "Team member invites",
      "Stripe customer portal",
      "Priority email support",
    ],
    cta: "Start Pro trial",
    href: "/api/auth/login?plan=pro",
    highlight: true,
  },
];

const TESTIMONIALS = [
  {
    quote: "We found $840/month in zombie subscriptions on the first scan. Paid for itself in 4 days.",
    name: "Sarah K.",
    title: "Co-founder, Bloom Supply Co.",
    avatar: "SK",
  },
  {
    quote: "Our processor was charging 2.9% on interchange-eligible cards. Fee X-ray flagged it immediately.",
    name: "Marcus T.",
    title: "CFO, Terrano Logistics",
    avatar: "MT",
  },
  {
    quote: "I sent the report straight to my bank. They waived $320 in monthly fees without a fight.",
    name: "Priya R.",
    title: "Owner, Roshan Bakery",
    avatar: "PR",
  },
];

/* ─── Sub-components ─────────────────────────────────────────────── */

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5" id="main-nav">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span className="text-2xl">🔍</span>
          <span className="gradient-text">Fee X-ray</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="#how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
          <Link href="#features" className="hover:text-white transition-colors duration-150">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/api/auth/login"
            id="nav-login-btn"
            className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors duration-150 px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/api/auth/register"
            id="nav-cta-btn"
            className="btn-primary text-sm px-5 py-2.5"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen mesh-bg flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center overflow-hidden">
      {/* Decorative orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-semibold tracking-wider text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 animate-fade-slide-up">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now with automatic scheduled analysis for Pro users
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 animate-fade-slide-up animate-delay-100"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Stop losing money
          <br />
          <span className="gradient-text">to hidden fees.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-slide-up animate-delay-200">
          Fee X-ray connects to your bank and payment processor, automatically finds charges you&apos;re overpaying,
          explains each one in plain English, and tracks your savings over time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-slide-up animate-delay-300">
          <Link
            href="/api/auth/register"
            id="hero-cta-primary"
            className="btn-primary px-8 py-4 text-base font-semibold rounded-xl"
          >
            Sign up for free →
          </Link>
          <Link
            href="#how-it-works"
            id="hero-cta-secondary"
            className="px-8 py-4 text-base font-medium text-slate-300 rounded-xl border border-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-5 text-sm text-slate-600 animate-fade-slide-up animate-delay-400">
          Free to start · No credit card required · Connects in 2 minutes
        </p>

        {/* Hero mockup stat cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-slide-up animate-delay-500">
          {[
            { value: "$12,400", label: "avg. annual savings" },
            { value: "4 min", label: "to first insight" },
            { value: "100%", label: "encrypted connections" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl px-6 py-5 text-center card-hover">
              <div className="text-2xl font-black gradient-text" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4 block">Process</span>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            From connection to savings
            <br />
            in four steps
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            No accounting degree required. No spreadsheets. Just connect and let Fee X-ray do the work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="glass rounded-2xl p-8 card-hover relative overflow-hidden group"
            >
              <div className="absolute top-4 right-6 text-7xl font-black opacity-5 select-none group-hover:opacity-10 transition-opacity" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {item.step}
              </div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Step {item.step}</div>
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 mesh-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4 block">What we detect</span>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Six ways we find your
            <br />
            <span className="gradient-text">missing money</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.label} className="glass-light rounded-2xl p-6 card-hover group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {f.label}
              </h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Real savings, real businesses
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-7 card-hover flex flex-col">
              <div className="text-2xl text-indigo-400 mb-4 select-none">&ldquo;</div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 mesh-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4 block">Pricing</span>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400">Start free. Upgrade when you&apos;re ready to save more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col card-hover ${
                plan.highlight
                  ? "border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-950/60 to-purple-950/30"
                  : "glass"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm">/{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="text-indigo-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                id={`pricing-cta-${plan.name.toLowerCase()}`}
                className={`w-full py-3.5 rounded-xl font-semibold text-center text-sm transition-all duration-200 ${
                  plan.highlight
                    ? "btn-primary"
                    : "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.3) 0%, rgba(168,85,247,0.2) 100%)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 120%, rgba(99,102,241,0.25), transparent)" }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <h2
              className="text-4xl sm:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Ready to see what you&apos;re losing?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Connect your accounts in minutes. Your first fee report is free, forever.
            </p>
            <Link
              href="/api/auth/register"
              id="footer-cta-btn"
              className="btn-primary inline-block px-10 py-4 text-base font-bold rounded-xl"
            >
              Sign up to get your report →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/60 py-12 px-6" style={{ background: "var(--surface-0)" }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span>🔍</span>
          <span className="gradient-text">Fee X-ray</span>
        </div>
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Fee X-ray. Built to save small businesses money.
        </p>
        <div className="flex gap-6 text-sm text-slate-600">
          <Link href="#" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">Terms</Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">Security</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
