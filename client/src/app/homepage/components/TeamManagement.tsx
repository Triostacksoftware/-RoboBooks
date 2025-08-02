'use client';

import { FC } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { SiHubspot, SiSlack, SiAirtable } from 'react-icons/si';

/* ────────── KPI Ring ────────── */
interface StatProps {
  value: number;
  label: string;
}
const StatRing: FC<StatProps> = ({ value, label }) => (
  <div className="relative aspect-square w-24 sm:w-28 md:w-36 lg:w-44 flex items-center justify-center">
    <div className="absolute inset-[6%] rounded-full bg-gray-200/40" />
    <div
      className="absolute inset-[6%] rounded-full"
      style={{
        background: `conic-gradient(#06b6d4 ${value * 3.6}deg, transparent 0deg)`,
      }}
      aria-hidden
    />
    <div className="relative z-10 flex aspect-square w-[68%] flex-col items-center justify-center rounded-full bg-white text-center">
      <span className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
        {value}%
      </span>
      <span className="mt-0.5 text-[10px] font-medium text-gray-500 sm:text-xs md:text-sm">
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
      'group relative overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-10',
      'bg-white/40 backdrop-blur-xl shadow-lg border border-slate-200/60',
      'before:absolute before:inset-0.5 before:-z-10 before:rounded-[calc(2rem-2px)]',
      'before:opacity-0 before:transition-opacity before:duration-300',
      accent,
      'hover:-translate-y-1.5 hover:shadow-2xl hover:before:opacity-100'
    )}
  >
    {children}
  </div>
);

/* ────────── Cards Data ────────── */
const cards = [
  {
      title: 'Integrate with all apps you need',
  desc: 'Great importancebut because, combined with a handful of model sentence structures,',
  accent: 'before:bg-gradient-to-r before:from-green-500 before:to-yellow-400',
  icons: [SiHubspot, SiSlack, SiAirtable],
  emojis: [
      {
        char: '🚀',
        class: 'hidden sm:block top-6 right-7 text-2xl motion-safe:animate-bounce',
      },
      {
        char: '✨',
        class: 'hidden sm:block bottom-8 left-8 text-xl motion-safe:animate-pulse',
      },
    ],
  },
  {
    title: 'Easy concept with best usability',
    desc: 'Great importancebut because, combined with a handful of model sentence structures,',
    accent: 'before:bg-gradient-to-r before:from-amber-400 before:to-pink-500',
    illus: '/illustrations/usability.png',
    emojis: [
      {
        char: '🎯',
        class: 'hidden sm:block top-8 right-8 text-2xl motion-safe:animate-bounce',
      },
      {
        char: '💡',
        class: 'hidden sm:block bottom-10 right-10 text-xl motion-safe:animate-spin',
      },
    ],
  },
];

/* ────────── Main Component ────────── */
export default function TeamManagement() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Top Grid */}
      <div className="grid gap-10 md:grid-cols-2 md:items-stretch">
        {/* Text */}
        <div className="flex flex-col justify-center">
          <p className="mb-3 inline-block bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-xs font-semibold uppercase tracking-widest text-transparent sm:text-sm">
            Team Management
          </p>

          <h2 className="mb-5 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl lg:text-5xl">
            Manage team, increase productivity
          </h2>

          <p className="mb-7 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg">
            We use as filler text for layouts, non-readability is of great
            importance but because those who do not know how to pursue pleasure
            rationally encounter consequences that are extremely painful.
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline sm:text-base"
          >
            View Case Studies
            <ArrowRightIcon className="h-4 w-4 stroke-2" />
          </a>
        </div>

        {/* Oval Video Cluster */}
        <div className="relative w-full h-full max-w-[640px] flex items-stretch">
          <div className="absolute inset-0 rounded-[45%] bg-purple-100/60" aria-hidden />

          {/* Oval Video */}
          <div className="relative z-10 w-full h-80 overflow-hidden rounded-[40%] shadow-lg">
            <video
              src="/images/teammanagement.mp4" // Update this path as needed
              className="w-full h-full object-cover rounded-[40%]"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          {/* Stat Badge */}
          <div className="absolute left-3 top-4 z-20 w-36 sm:left-5 sm:top-6 sm:w-44 md:w-56 rounded-br-[2rem] rounded-tl-md rounded-tr-md bg-white p-3 shadow-md sm:p-4">
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              40<span className="align-super text-sm sm:text-base">%</span>
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-600 sm:mt-1 sm:text-xs md:text-sm">
              Reduction in time
            </p>
            <span
              aria-hidden
              className="pointer-events-none absolute -right-3 top-6 hidden h-5 w-5 rotate-45 rounded-md bg-gradient-to-r from-blue-600 to-green-500 sm:block"
            />
          </div>

          {/* KPI Ring */}
          <div className="absolute -bottom-8 right-2 z-20 sm:-bottom-10 sm:right-4 md:right-6">
            <StatRing value={92} label="Success rate" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-10">
        {cards.map((c) => (
          <CardShell key={c.title} accent={c.accent}>
            {/* Emojis */}
            {c.emojis?.map(({ char, class: extra }) => (
              <span
                key={char + extra}
                className={clsx('pointer-events-none absolute select-none', extra)}
                aria-hidden
              >
                {char}
              </span>
            ))}

            {/* Title & Desc */}
            <h3 className="mb-3 max-w-xs bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-lg font-semibold leading-snug text-transparent sm:text-xl md:text-2xl">
              {c.title}
            </h3>
            <p className="mb-7 max-w-sm text-sm text-gray-700 sm:text-base">
              {c.desc}
            </p>

            {/* Icons or Illustration */}
            {c.icons && (
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {c.icons.map((Icon, idx) => (
                  <div
                    key={idx}
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-white p-2 shadow"
                    aria-hidden
                  >
                    <Icon className="h-full w-full text-blue-600" />
                  </div>
                ))}
              </div>
            )}

            {c.illus && (
              <img
                src={c.illus}
                alt=""
                className="pointer-events-none absolute bottom-0 right-0 w-1/2 translate-y-1/4 sm:w-2/5 md:w-1/3"
                aria-hidden
              />
            )}
          </CardShell>
        ))}
      </div>
    </section>
  );
}
