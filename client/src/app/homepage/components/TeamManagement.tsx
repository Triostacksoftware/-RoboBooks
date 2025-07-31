"use client";

import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { FC } from "react";

/* ────────── KPI Ring (responsive) ────────── */
interface StatProps {
  value: number;
  label: string;
}
const StatRing: FC<StatProps> = ({ value, label }) => (
  <div className="relative flex h-32 px-10 w-32 items-center justify-center md:h-40 md:w-40 lg:h-48 lg:w-48">
    <div className="absolute inset-0 rounded-full bg-gray-200/40" />
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `conic-gradient(#06b6d4 ${value * 3.6}deg, transparent 0deg)`,
      }}
    />
    <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center md:h-28 md:w-28 lg:h-36 lg:w-36">
      <span className="text-2xl font-semibold text-gray-900 md:text-3xl">
        {value}%
      </span>
      <span className="mt-0.5 text-xs font-medium text-gray-500 md:mt-1 md:text-sm">
        {label}
      </span>
    </div>
  </div>
);

/* ────────── Card Shell ────────── */
const CardShell: FC<{ accent: string; children: React.ReactNode }> = ({
  accent,
  children,
}) => (
  <div
    className={clsx(
      "group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 sm:p-8 lg:p-10",
      "bg-white/40 backdrop-blur-xl shadow-lg border border-slate-200/60",
      "before:absolute before:inset-0.5 before:-z-10 before:rounded-[calc(2rem-2px)]",
      "before:opacity-0 before:transition-opacity before:duration-300",
      accent,
      "hover:-translate-y-1.5 hover:shadow-2xl hover:before:opacity-100"
    )}
  >
    {children}
  </div>
);

/* ────────── Cards Data ────────── */
const cards = [
  {
    title: "Integrate with all apps you need",
    desc: "Great importancebut because, combined with a handful of model sentence structures,",
    accent: "before:bg-gradient-to-r before:from-blue-500 before:to-green-500",
    icons: ["/icons/hubspot.svg", "/icons/slack.svg", "/icons/airtable.svg"],
    emojis: [
      { char: "🚀", class: "hidden sm:block top-6 right-7 text-2xl animate-bounce" },
      { char: "✨", class: "hidden sm:block bottom-8 left-8 text-xl animate-pulse" },
    ],
  },
  {
    title: "Easy concept with best usability",
    desc: "Great importancebut because, combined with a handful of model sentence structures,",
    accent: "before:bg-gradient-to-r before:from-amber-400 before:to-pink-500",
    illus: "/illustrations/usability.png",
    emojis: [
      { char: "🎯", class: "hidden sm:block top-8 left-8 text-2xl animate-float" },
      { char: "💡", class: "hidden sm:block bottom-10 right-10 text-xl animate-spin" },
    ],
  },
];

/* ────────── Main Component ────────── */
export default function TeamManagement() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Top Grid */}
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        {/* Text */}
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text">
            Team Management
          </p>
          <h2 className="mb-6 text-3xl font-bold leading-tight text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text sm:text-4xl lg:text-5xl">
            Manage team increase productivity
          </h2>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-700 md:text-lg">
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

        {/* Image Cluster */}
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
          <div className="absolute inset-0 rounded-[45%] bg-purple-100/60" />
          <Image
            src="/images/team.jpg"
            alt="Team working together"
            width={800}
            height={560}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 520px"
            className="relative z-10 rounded-[40%] object-cover shadow-lg"
            priority
          />

          {/* Stat Badge */}
          <div className="absolute left-4 top-6 z-20 w-44 sm:left-6 sm:top-8 sm:w-56 rounded-br-[2.5rem] rounded-tl-md rounded-tr-md bg-white p-4 shadow-md sm:p-5">
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              40<span className="align-super text-base sm:text-xl">%</span>
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-600 sm:mt-1 sm:text-sm">
              Reduction in time
            </p>
            <span className="pointer-events-none absolute -right-3 top-6 hidden h-5 w-5 rotate-45 rounded-md bg-gradient-to-r from-blue-600 to-green-500 sm:block" />
          </div>

          {/* KPI Ring */}
          <div className="absolute -bottom-8 right-4 z-20 sm:-bottom-10 sm:right-6">
            <StatRing value={92} label="Success rate" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-20 grid gap-8 sm:grid-cols-2 sm:gap-10">
        {cards.map((c) => (
          <CardShell key={c.title} accent={c.accent}>
            {/* Emojis */}
            {c.emojis?.map(({ char, class: extra }) => (
              <span
                key={char + extra}
                className={clsx("pointer-events-none absolute select-none", extra)}
              >
                {char}
              </span>
            ))}

            {/* Title & Desc */}
            <h3 className="mb-4 max-w-xs text-xl font-semibold leading-snug text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text sm:text-2xl">
              {c.title}
            </h3>
            <p className="mb-8 max-w-sm text-sm text-gray-700 sm:text-base">
              {c.desc}
            </p>

            {/* Icons / Illustration */}
            {c.icons && (
              <div className="flex gap-6">
                {c.icons.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full bg-white p-2 shadow sm:h-14 sm:w-14 sm:p-3"
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
                sizes="(max-width: 640px) 60vw, 260px"
                className="absolute bottom-0 right-0 w-2/3 translate-y-1/3 sm:w-1/2"
              />
            )}
          </CardShell>
        ))}
      </div>
    </section>
  );
}
