// src/app/contact/components/contact-details.tsx
"use client";

import { useMemo, useState } from "react";

type Phone = { label: string; number: string };
type Email = { label: string; address: string };

type Props = {
  className?: string;

  /** Left column (HQ card) */
  hqTitle?: string;
  addressLines?: string[];

  /** Call & email rows */
  phones?: Phone[];
  emails?: Email[];

  /** Optional right column content */
  showMap?: boolean;
  /** Used to build a privacy-friendly Google Maps embed link */
  placeQuery?: string;

  /** Shows a responsive WhatsApp CTA row when provided */
  whatsAppNumber?: string; // e.g. "+1 555 123 4567"
};

export default function ContactDetails({
  className = "",
  hqTitle = "Robo Books HQ",
  addressLines = ["Stact Inc, 06 Highley St, Victoria,", "New York"],
  phones = [
    { label: "Mobile", number: "(+61) 1990 6886" },
    { label: "Hotline", number: "1800 1102" },
  ],
  emails = [
    { label: "Info", address: "info@robobooks.com" },
    { label: "Support", address: "support@robobooks.com" },
  ],
  showMap = true,
  placeQuery = "Robo Books HQ New York",
  whatsAppNumber,
}: Props) {
  const waLink = useMemo(() => {
    if (!whatsAppNumber) return "";
    const digits = whatsAppNumber.replace(/[^\d]/g, "");
    const text = encodeURIComponent("Hello Robo Books! I’d like to know more.");
    return `https://wa.me/${digits}?text=${text}`;
  }, [whatsAppNumber]);

  return (
    <section
      id="contact-details"
      className={[
        // keep section visible below any sticky navbar when scrolled
        "scroll-mt-28 md:scroll-mt-32",
        "relative overflow-hidden",
        // Single blended background: no visible seams on any viewport
        "bg-[radial-gradient(60%_60%_at_0%_10%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(45%_45%_at_100%_100%,rgba(59,130,246,0.12),transparent_60%),linear-gradient(180deg,#ffffff,#f7fbff)]",
        className,
      ].join(" ")}
    >
      {/* Ambient glows (auto scales; hidden on very small screens for perf) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 hidden h-[420px] w-[420px] rounded-full bg-emerald-400/20 blur-3xl sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-16 hidden h-[520px] w-[520px] rounded-full bg-blue-400/20 blur-3xl md:block"
      />
      {/* Subtle grain to avoid banding on large screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section title (responsive & compact on phones) */}
        <div className="flex flex-col items-start gap-3 py-8 sm:py-10 lg:py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
            <Dot className="h-2 w-2 text-emerald-500" />
            Contact Details
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Visit, call, or drop us a line
          </h2>
        </div>

        {/* Content grid: stacks on mobile, 5/7 split from md+ */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT — Details list */}
          <div className="lg:col-span-5">
            <ul className="space-y-7 sm:space-y-8">
              <InfoBlock
                icon={<IconLocation className="h-5 w-5 sm:h-6 sm:w-6" />}
                title={hqTitle}
                body={
                  <div className="leading-relaxed text-slate-600">
                    {addressLines.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                }
              />

              <InfoBlock
                icon={<IconPhone className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Call Us"
                body={
                  <div className="space-y-1.5 text-slate-600">
                    {phones.map((p) => (
                      <CopyRow
                        key={p.label + p.number}
                        label={`${p.label}:`}
                        value={p.number}
                        copyValue={p.number}
                        href={`tel:${p.number.replace(/[^\d+]/g, "")}`}
                      />
                    ))}
                  </div>
                }
              />

              <InfoBlock
                icon={<IconMail className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Mail Us"
                body={
                  <div className="space-y-1.5 text-slate-600">
                    {emails.map((m) => (
                      <CopyRow
                        key={m.label + m.address}
                        label={`${m.label}:`}
                        value={m.address}
                        copyValue={m.address}
                        href={`mailto:${m.address}`}
                      />
                    ))}
                  </div>
                }
              />
            </ul>

            {/* Quick actions — wraps nicely on small screens */}
            <div className="mt-8 flex flex-wrap gap-3">
              {whatsAppNumber && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-blue-500/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                >
                  <IconWhatsApp className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              )}
              <a
                href={`mailto:${emails[1]?.address ?? emails[0]?.address ?? "support@robobooks.com"}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow"
              >
                <IconMail className="h-5 w-5" />
                Email Support
              </a>
            </div>
          </div>

          {/* RIGHT — Map / info card (kept responsive & optional) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur-md sm:p-6 md:p-8">
              {/* Conic rim (subtle on retina; scales with container) */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl [background:conic-gradient(from_180deg,rgba(16,185,129,0.18),rgba(59,130,246,0.18),rgba(16,185,129,0.18))] [mask:linear-gradient(#000_0_0)content-box,linear-gradient(#000_0_0)] p-[2px] [mask-composite:exclude]" />

              <div className="relative z-10">
                {showMap ? (
                  <MapEmbed placeQuery={placeQuery} />
                ) : (
                  <RightStatsFallback />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing (breath) */}
        <div className="py-8 sm:py-12" />
      </div>
    </section>
  );
}

/* -------------------- Subcomponents -------------------- */

function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="group relative flex items-start gap-4">
      {/* Icon bubble — scales down on phones */}
      <div className="mt-0.5">
        <div className="relative">
          <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-emerald-400/20 blur-lg" />
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-11 sm:w-11">
            {icon}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
        <div className="mt-1 text-[15px]">{body}</div>
      </div>
    </li>
  );
}

function CopyRow({
  label,
  value,
  copyValue,
  href,
}: {
  label: string;
  value: string;
  copyValue: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group inline-flex flex-wrap items-center gap-2">
      <span className="text-slate-500">{label}</span>
      <a
        href={href}
        className="break-all rounded-md px-1 font-medium text-slate-800 underline decoration-emerald-300/60 underline-offset-4 transition hover:text-slate-900 hover:decoration-blue-400"
      >
        {value}
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(copyValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          } catch {
            /* ignore */
          }
        }}
        title="Copy"
        className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition hover:scale-105 hover:text-slate-700"
      >
        <IconCopy className="h-3.5 w-3.5" />
        <span
          className={[
            "pointer-events-none absolute -top-7 translate-y-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs text-white opacity-0 transition",
            copied ? "translate-y-0 opacity-100" : "",
          ].join(" ")}
        >
          Copied
        </span>
      </button>
    </div>
  );
}

function MapEmbed({ placeQuery }: { placeQuery: string }) {
  // Privacy-friendly embed (no API key required)
  const src = `https://www.google.com/maps?q=${encodeURIComponent(
    placeQuery
  )}&output=embed`;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm font-medium text-slate-700">
          Find us on the map
        </div>
        <a
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow"
          target="_blank"
          rel="noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            placeQuery
          )}`}
        >
          Open in Maps
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Responsive map: keeps ratio on phones, grows on desktop */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 sm:aspect-[16/9] lg:aspect-[21/9]">
        <iframe
          title="Map"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Little stats / reassurance row for huge screens; wraps on small */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <Tag>Wheelchair friendly</Tag>
        <Tag>Visitor parking</Tag>
        <Tag>Public transit 3 min</Tag>
      </div>
    </div>
  );
}

function RightStatsFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MiniStat label="Avg. response" value="1h 45m" />
      <MiniStat label="Satisfaction" value="98%" />
      <MiniStat label="Issues solved" value="24k+" />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-center shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow">
      <div className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
        {label}
      </div>
    </div>
  );
}

/* -------------------- Icons -------------------- */

function Dot({ className = "" }: { className?: string }) {
  return <span className={["inline-block rounded-full bg-current", className].join(" ")} />;
}

function ArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCopy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="1.6" />
      <rect x="2" y="2" width="13" height="13" rx="2" strokeWidth="1.6" />
    </svg>
  );
}

function IconLocation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" strokeWidth="1.8" />
    </svg>
  );
}

function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.33 2 2 0 0 1 4.11 2h3A2 2 0 0 1 9.1 3.72c.12.92.33 1.82.63 2.68a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.49-1.29a2 2 0 0 1 2.1-.45c.86.3 1.76.51 2.68.63A2 2 0 0 1 22 16.92z"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconMail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" strokeWidth="1.8" />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.5 3.5A11 11 0 0 0 3.2 18.9L2 22l3.2-1.2A11 11 0 1 0 20.5 3.5ZM12 20.1a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-2.5.9.9-2.4-.2-.3A8.2 8.2 0 1 1 12 20.1Zm4.7-6.3c-.3-.2-1.7-.8-2-.9s-.5-.2-.7.2-.8.9-1 1-.4.2-.7 0a6.6 6.6 0 0 1-1.9-1.2 7.1 7.1 0 0 1-1.3-1.7c-.1-.3 0-.5.2-.7l.5-.6c.2-.2.2-.3.3-.5a.6.6 0 0 0 0-.5C9.9 7 9 5.1 8.7 4.4c-.1-.4-.5-.3-.7-.3a1.4 1.4 0 0 0-1 .5l-.3.7a2.6 2.6 0 0 0 .2 2.3 9.4 9.4 0 0 0 3.8 4.6 10.5 10.5 0 0 0 2.5 1.1c.3.1.6.1.8.1s.5 0 .7-.3.9-1 .9-1.3 0-.3-.2-.4Z" />
    </svg>
  );
}
