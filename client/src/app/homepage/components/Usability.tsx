import Image from "next/image";
import React, { type ReactElement, type ReactNode } from "react";

type UsabilityProps = {
  /** Put your screenshot in /public/images and update path if needed */
  dashboardSrc?: string;
  className?: string;
};

export default function Usability({
  dashboardSrc = "/images/usability-dashboard.png",
  className,
}: UsabilityProps): ReactElement {
  return (
    <section
      className={cn(
        "relative py-20 sm:py-28 md:py-32",
        // subtle dotted background outside the card
        "[background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-white",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main dark card */}
        <div className="relative overflow-visible rounded-[36px] bg-[#1f2344] px-6 py-14 text-white sm:px-10 sm:py-16 md:px-16 md:py-20 lg:py-24">
          {/* soft gradient decorations */}
          <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-400/20 via-indigo-400/10 to-transparent blur-3xl" />

          {/* Heading */}
          <h2 className="text-center font-semibold tracking-tight text-[1.875rem] leading-tight sm:text-4xl md:text-5xl">
            We made it superb
            <br className="hidden sm:block" />
            <span className="block sm:inline"> &amp; usability</span>
          </h2>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Pill icon={<IconCheck />} label="Easy to use" />
            <Pill icon={<IconUsers />} label="Collaborative" />
            <Pill icon={<IconActivity />} label="Activity Stream" />
          </div>

          {/* Screenshot overlap */}
          <div className="pointer-events-none absolute left-1/2 bottom-0 w-[calc(100%-1.5rem)] -translate-x-1/2 translate-y-1/2 sm:w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] lg:w-[calc(100%-8rem)]">
            <div className="pointer-events-auto rounded-2xl bg-white/5 p-1 shadow-2xl ring-1 ring-white/10 md:p-2">
              <div className="overflow-hidden rounded-xl bg-white">
                <Image
                  src={dashboardSrc}
                  width={1920}
                  height={1080}
                  alt="App dashboard preview"
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Spacer so overlap has room */}
          <div className="mt-64 sm:mt-72 md:mt-80" />
        </div>
      </div>
    </section>
  );
}

/* ----------------------- */
/* Reusable UI primitives  */
/* ----------------------- */

function Pill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}): ReactElement {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-medium ring-1 ring-inset ring-white/15 backdrop-blur-sm">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

/* ----------------------- */
/* Minimal inline SVG icons*/
/* ----------------------- */

function IconCheck(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconUsers(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="3" />
      <path d="M2 20a6 6 0 0 1 12 0" />
      <path d="M12.5 20a6 6 0 0 1 9.5-5" />
    </svg>
  );
}

function IconActivity(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h3l3-8 4 16 3-8h5" />
    </svg>
  );
}

/* ----------------------- */
/* tiny utility            */
/* ----------------------- */

function cn(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
