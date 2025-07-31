// src/app/contact/components/contactform.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Default hero image if gallery is empty */
  imageSrc?: string;
  onSubmit?: (data: {
    name: string;
    email: string;
    phone?: string;
    website?: string;
    message: string;
    images?: File[];
  }) => Promise<void> | void;
};

export default function ContactForm({
  imageSrc = "/images/contact-support.jpg",
  onSubmit,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hoverXY, setHoverXY] = useState({ x: 0, y: 0 });

  /** Create & cleanup object URLs for previews */
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const mainImage = useMemo(() => previews[0] ?? imageSrc, [previews, imageSrc]);

  const handleAddClick = () => inputRef.current?.click();

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const accepted = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (accepted.length) setFiles((prev) => [...prev, ...accepted].slice(0, 8)); // cap at 8
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        website: String(fd.get("website") || ""),
        message: String(fd.get("message") || ""),
        images: files,
      };
      try {
        if (onSubmit) {
          await onSubmit(payload);
        } else {
          // Replace with your /api/contact call if needed
          console.info("Contact payload:", payload);
          alert("Thanks! Your message has been sent.");
        }
        (e.currentTarget as HTMLFormElement).reset();
        setFiles([]);
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      }
    },
    [files, onSubmit]
  );

  return (
    <section
      id="contact-form"
      className="relative overflow-hidden scroll-mt-28 md:scroll-mt-32"
      style={{
        // Single, blended background (no seams)
        backgroundImage:
          "radial-gradient(60% 60% at 0% 0%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(45% 45% at 100% 100%, rgba(59,130,246,0.18) 0%, transparent 60%), linear-gradient(180deg, #F7FBFF 0%, #FFFFFF 100%)",
        // avoid fixed on tiny devices; mobile browsers often ignore it anyway
        backgroundAttachment: "scroll",
      }}
    >
      {/* enable fixed attachment from md+ for nicer parallax */}
      <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block md:bg-fixed" />

      {/* subtle grain to avoid banding */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 py-12 sm:py-14 md:py-18 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT: Image block + gallery uploader */}
        <div
          className="relative"
          onMouseMove={(e) => {
            const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            setHoverXY({ x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 });
          }}
        >
          <div className="group relative mx-auto w-full max-w-[680px] overflow-hidden rounded-3xl bg-white/70 p-0 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition duration-500 hover:shadow-2xl">
            {/* hero image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={mainImage}
                alt="Robo Books support"
                fill
                priority
                sizes="(min-width:1024px) 680px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
              />

              {/* floating accent (parallax) */}
              <div
                className="absolute left-4 top-4 hidden select-none md:left-6 md:top-6 lg:block"
                style={{
                  transform: `translate3d(${hoverXY.x * 0.01}px, ${hoverXY.y * 0.01}px, 0)`,
                }}
              >
                <BadgeLarge />
              </div>

              <div
                className="absolute bottom-4 left-4 hidden select-none md:bottom-6 md:left-6 lg:block"
                style={{
                  transform: `translate3d(${hoverXY.x * 0.02}px, ${hoverXY.y * 0.02}px, 0)`,
                }}
              >
                <BadgeSmall />
              </div>

              {/* soft curved mask in the corner */}
              <div className="pointer-events-none absolute -bottom-2 -right-2 h-[40%] w-[42%] rounded-tl-[120px] bg-white/85 shadow-[0_-24px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm [clip-path:polygon(0%_0%,100%_0%,100%_100%,26%_100%)]" />
            </div>

            {/* Gallery: thumbnails + add button / dropzone */}
            <div
              className="relative flex items-center gap-3 overflow-x-auto border-t border-white/40 bg-gradient-to-r from-white/70 to-white/50 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <button
                type="button"
                onClick={handleAddClick}
                className="group inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-md transition hover:shadow-lg"
                title="Add images"
                aria-label="Add images"
              >
                <PlusIcon className="h-6 w-6 transition group-hover:rotate-90" />
              </button>

              {/* Thumbs */}
              {previews.map((src, idx) => (
                <div key={src} className="relative flex-none">
                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="absolute -right-2 -top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white shadow ring-1 ring-white/50 backdrop-blur hover:bg-black/80"
                    title="Remove"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    ×
                  </button>
                  <div className="relative h-12 w-20 overflow-hidden rounded-lg ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="h-full w-full object-cover transition hover:brightness-105"
                      onClick={() => {
                        // Swap clicked thumb to first (as main)
                        setFiles((prev) => {
                          const n = [...prev];
                          [n[0], n[idx]] = [n[idx], n[0]];
                          return n;
                        });
                      }}
                    />
                  </div>
                </div>
              ))}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* animated border sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-2 ring-transparent transition duration-700 group-hover:opacity-100 group-hover:[animation:spin_6s_linear_infinite] group-hover:[background:conic-gradient(from_0deg,rgba(16,185,129,0.35),rgba(59,130,246,0.35),rgba(16,185,129,0.35))] group-hover:[mask:linear-gradient(#000_0_0)content-box,linear-gradient(#000_0_0)] p-[3px] [mask-composite:exclude]" />
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Say Hello!
          </p>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            We’d love to hear from you
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Your Name *">
                <Input name="name" type="text" placeholder="e.g. Roe Smith" required />
              </Field>
              <Field label="Email Address *">
                <Input name="email" type="email" placeholder="e.g. example@mail.com" required />
              </Field>
              <Field label="Phone Number">
                <Input name="phone" type="tel" placeholder="e.g. +55 695 6965" />
              </Field>
              <Field label="Website">
                <Input name="website" type="url" placeholder="e.g. website.com" />
              </Field>
            </div>

            <Field label="Message *">
              <Textarea name="message" placeholder="Type your message" required />
            </Field>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-300 hover:shadow-blue-500/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 sm:w-auto"
              >
                <span className="relative z-10">Submit Message</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.35),transparent)] transition duration-500 group-hover:translate-x-full" />
                <ArrowRight className="relative z-10 h-5 w-5 -translate-x-0.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* scoped keyframes */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(1turn);
          }
        }
      `}</style>
    </section>
  );
}

/* ---------- Subcomponents ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/40 via-emerald-400/0 to-blue-500/40 opacity-0 blur transition duration-300 group-hover:opacity-100" />
      <input
        {...props}
        className={[
          "peer w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3",
          "text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "hover:border-slate-300",
          "focus:border-transparent focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-white",
        ].join(" ")}
      />
      <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 transition-all duration-300 peer-focus:w-full" />
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/40 via-emerald-400/0 to-blue-500/40 opacity-0 blur transition duration-300 group-hover:opacity-100" />
      <textarea
        rows={6}
        {...props}
        className={[
          "peer w-full resize-y rounded-2xl border border-slate-200 bg-white/90 px-4 py-3",
          "text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "hover:border-slate-300",
          "focus:border-transparent focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-2 focus:ring-offset-white",
        ].join(" ")}
      />
      <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 transition-all duration-300 peer-focus:w-full" />
    </div>
  );
}

/* ----- Decorative badges & icons ----- */

function BadgeLarge() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-white/40 blur-xl" />
      <div className="rounded-full bg-[conic-gradient(from_90deg,rgba(16,185,129,0.6),rgba(59,130,246,0.6),rgba(16,185,129,0.6))] p-[3px] shadow-md">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cyan-100">
          <MailIcon className="h-10 w-10 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function BadgeSmall() {
  return (
    <div className="rounded-full bg-white p-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-white shadow-lg transition duration-300 hover:scale-105">
        <PhoneIcon className="h-7 w-7" />
      </div>
    </div>
  );
}

/* Icons */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.92.33 1.82.63 2.68a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.49-1.29a2 2 0 0 1 2.1-.45c.86.3 1.76.51 2.68.63A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <rect x="8" y="10" width="32" height="24" rx="6" />
      <path d="M11 14l13 9 13-9" />
    </svg>
  );
}
