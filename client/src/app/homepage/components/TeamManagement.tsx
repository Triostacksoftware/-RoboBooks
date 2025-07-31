"use client";

import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";       // 👉  npm i clsx
import { FC } from "react";

/* --------------------------------------------------------------------- */
/*  ── Small utility: circular stat ring                                */
/* --------------------------------------------------------------------- */
interface StatProps {
  value: number;
  label: string;
}

const StatRing: FC<StatProps> = ({ value, label }) => (
  <div className="relative flex h-48 w-48 items-center justify-center">
    {/* grey track */}
    <div className="absolute inset-0 rounded-full bg-gray-200/40" />
    {/* conic-fill */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `conic-gradient(#06b6d4 ${value * 3.6}deg, transparent 0deg)`,
      }}
    />
    {/* centre */}
    <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center">
      <span className="text-3xl font-semibold text-gray-900">{value}%</span>
      <span className="mt-1 text-sm font-medium text-gray-500">{label}</span>
    </div>
  </div>
);

/* --------------------------------------------------------------------- */
/*  ── Card shell component (glass, accent gradient, hover lift)         */
/* --------------------------------------------------------------------- */
const CardShell: FC<{ accent: string; children: React.ReactNode }> = ({
  accent,
  children,
}) => (
  <div
    className={clsx(
      "group relative overflow-hidden rounded-[2rem] p-10 transition-all duration-300",
      "bg-white/40 backdrop-blur-xl shadow-lg ring-1 ring-inset ring-white/20",
      // animated gradient border
      "before:absolute before:inset-px before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300",
      accent,
      // interaction
      "hover:-translate-y-1.5 hover:shadow-2xl hover:before:opacity-100"
    )}
  >
    {children}
  </div>
);

/* --------------------------------------------------------------------- */
/*  ── Data for cards                                                    */
/* --------------------------------------------------------------------- */
const cards = [
  {
    title: "Integrate with all apps you need",
    desc: "Great importancebut because, combined with a handful of model sentence structures,",
    accent:
      "before:bg-gradient-to-br before:from-blue-500/70 before:to-green-500/70",
    icons: ["/icons/hubspot.svg", "/icons/slack.svg", "/icons/airtable.svg"],
    emojis: [
      { char: "🚀", class: "top-6 right-7 text-3xl animate-bounce" },
      { char: "✨", class: "bottom-8 left-8 text-2xl animate-pulse" },
    ],
  },
  {
    title: "Easy concept with best usability",
    desc: "Great importancebut because, combined with a handful of model sentence structures,",
    accent:
      "before:bg-gradient-to-br before:from-amber-400/70 before:to-pink-500/70",
    illus: "/illustrations/usability.png",
    emojis: [
      { char: "🎯", class: "top-8 left-8 text-3xl animate-float" },
      { char: "💡", class: "bottom-10 right-10 text-2xl animate-spin" },
    ],
  },
];

/* --------------------------------------------------------------------- */
/*  ── Main component                                                    */
/* --------------------------------------------------------------------- */
export default function TeamManagement() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* ──────────────────────────────────────────────────────────── */}
      {/*  Top grid: text + image cluster                            */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* left column */}
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text">
            Team Management
          </p>
          <h2 className="mb-6 text-4xl font-extrabold leading-snug text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text sm:text-5xl">
            Manage team increase productivity
          </h2>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-700">
            We use as filler text for layouts, non-readability is of great importance but because
            those who do not know how to pursue pleasure rationally encounter consequences that are
            extremely painful. Nor again is there anyone who loves or pursues or desires to obtain.
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-base font-medium text-blue-600 hover:underline"
          >
            View Case Studies
            <ArrowRightIcon className="h-4 w-4 stroke-2" />
          </a>
        </div>

        {/* right column */}
        <div className="relative mx-auto w-full max-w-lg">
          {/* lavender ellipse background */}
          <div className="absolute inset-0 rounded-[45%] bg-purple-100/60" />

          {/* main team image */}
          <Image
            src="/images/team.jpg"
            alt="Team working together"
            width={800}
            height={560}
            className="relative z-10 rounded-[40%] object-cover shadow-lg"
            priority
          />

          {/* stat badge */}
          <div className="absolute left-6 top-8 z-20 w-56 rounded-br-[3rem] rounded-tl-md rounded-tr-md bg-white p-5 shadow-md">
            <p className="text-3xl font-bold text-gray-900">
              40<span className="align-super text-xl">%</span>
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Reduction in time
            </p>
            {/* diamond accent */}
            <span className="pointer-events-none absolute -right-4 top-8 hidden h-6 w-6 rotate-45 rounded-md bg-gradient-to-r from-blue-600 to-green-500 sm:block" />
          </div>

          {/* circular KPI */}
          <div className="absolute -bottom-10 right-6 z-20">
            <StatRing value={92} label="Success rate" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/*  Feature cards grid                                         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="mt-24 grid gap-10 sm:grid-cols-2">
        {cards.map((c) => (
          <CardShell key={c.title} accent={c.accent}>
            {/* decorative emojis */}
            {c.emojis?.map(({ char, class: extra }) => (
              <span
                key={char + extra}
                className={clsx(
                  "pointer-events-none absolute select-none",
                  extra
                )}
              >
                {char}
              </span>
            ))}

            {/* heading & desc */}
            <h3 className="mb-4 max-w-xs text-2xl font-semibold leading-snug text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
              {c.title}
            </h3>
            <p className="mb-8 max-w-sm text-base text-gray-700">{c.desc}</p>

            {/* logos or illustration */}
            {c.icons && (
              <div className="flex gap-6">
                {c.icons.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full bg-white p-3 shadow"
                  />
                ))}
              </div>
            )}

            {c.illus && (
              <Image
                src={c.illus}
                alt=""
                width={420}
                height={280}
                className="absolute bottom-0 right-0 w-2/3 translate-y-1/3 sm:w-1/2"
              />
            )}
          </CardShell>
        ))}
      </div>
    </section>
  );
}
