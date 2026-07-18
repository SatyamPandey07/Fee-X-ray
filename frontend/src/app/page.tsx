import React from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[#0F172A] text-slate-100 font-sans">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-slate-900/80 backdrop-blur-2xl pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-900/30 lg:p-4">
          🔍 Fee X-ray Scaffolding (PR #1)
        </p>
      </div>

      <div className="relative flex place-items-center flex-col text-center my-16">
        <span className="px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-blue-400 bg-blue-950/50 border border-blue-900 rounded-full">
          ✦ NEXT.JS 14 FRONTEND PLACEHOLDER
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Stop Losing Money to Hidden Fees
        </h1>
        <p className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed">
          Welcome to the initial monorepo scaffolding for Fee X-ray. The core services, analysis engines, and databases are wired together. Business logic and full dashboard modules are coming in the next phases.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="#docs"
            className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Read Roadmap
          </a>
          <a
            href="http://localhost:8081/actuator/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition"
          >
            Core Service Health
          </a>
          <a
            href="http://localhost:8000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition"
          >
            Analysis Engine Health
          </a>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-6">
        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Java Core Service{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Powered by Spring Boot 3 & Gradle. Port 8081.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Python Engine{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Powered by FastAPI & Poetry. Port 8000.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Identity / Keycloak{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            RBAC OAuth2 provider via Keycloak Cloud/Docker.
          </p>
        </div>
      </div>
    </main>
  );
}
