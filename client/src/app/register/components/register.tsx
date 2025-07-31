"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type FormData = {
  companyName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  password: string;
  country: string;
  state: string;
  agree: boolean;
};

const statesOfIndia = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh"
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    companyName: "",
    email: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    password: "",
    country: "India",
    state: "Uttar Pradesh",
    agree: false,
  });

  const onChange =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as never }));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Very light validation (extend as needed)
    if (!form.companyName.trim()) return alert("Please enter your company name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return alert("Please enter a valid email.");
    if (!form.phoneNumber.trim()) return alert("Please enter your mobile number.");
    if (form.password.length < 6) return alert("Password must be at least 6 characters.");
    if (!form.agree) return alert("You must agree to the Terms of Service and Privacy Policy.");

    try {
      setLoading(true);
      // TODO: replace with your server action / API call
      // await fetch("/api/register", { method: "POST", body: JSON.stringify(form) });
      console.log("Submitting form:", form);
      alert("Account created (demo). Wire this up to your API/server action.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If using NextAuth or your own providers, these redirects will work with /api/auth/signin/<provider>
  const handleSocial = (provider: "google" | "azure-ad" | "linkedin" | "apple" | "github") => {
    // For NextAuth default route:
    window.location.href = `/api/auth/signin/${provider}`;
    // If you use custom routes, update this accordingly.
  };

  return (
    <main className="min-h-screen w-full bg-neutral-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 lg:px-8">
        {/* LEFT: testimonial / marketing panel */}
        <section className="hidden w-1/2 flex-col justify-between rounded-2xl bg-blue-700 p-8 text-white lg:flex">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Trusted by <br /> businesses and CAs
            </h2>
          </div>

          <article className="mt-12 rounded-xl bg-blue-800/50 p-6">
            <div className="text-6xl leading-none">“</div>
            <p className="mt-4 text-lg leading-relaxed">
              With Robo Books, we save time, money, and retain customer satisfaction—seeing a
              measurable boost in year-over-year growth.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20" />
              <div>
                <p className="font-semibold">CA Sanjeev Archak</p>
                <p className="text-sm text-blue-100">Integrabooks – Proprietor</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="h-1 w-6 rounded bg-white/70" />
              <span className="h-1 w-3 rounded bg-white/40" />
              <span className="h-1 w-3 rounded bg-white/40" />
            </div>
          </article>

          <div className="mt-auto grid grid-cols-4 gap-4 pt-8 opacity-90">
            <div className="rounded-lg bg-blue-800/40 p-3 text-center text-sm">Capterra ★★★★☆</div>
            <div className="rounded-lg bg-blue-800/40 p-3 text-center text-sm">G2 ★★★★☆</div>
            <div className="rounded-lg bg-blue-800/40 p-3 text-center text-sm">App Store ★★★★☆</div>
            <div className="rounded-lg bg-blue-800/40 p-3 text-center text-sm">Play ★★★★☆</div>
          </div>
        </section>

        {/* RIGHT: form card */}
        <section className="w-full lg:w-1/2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
            {/* Brand */}
            <div className="mb-6 flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-xl font-bold leading-tight">Robo Books</p>
                <p className="text-sm text-gray-500">Let&apos;s get started.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={onChange("companyName")}
                  placeholder="e.g., Robo Innovations Pvt Ltd"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="flex">
                  <select
                    aria-label="Country code"
                    value={form.phoneCountryCode}
                    onChange={onChange("phoneCountryCode")}
                    className="w-28 rounded-l-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {/* Add more as needed */}
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    aria-label="Mobile number"
                    value={form.phoneNumber}
                    onChange={onChange("phoneNumber")}
                    placeholder="98765 43210"
                    className="w-full rounded-r-lg border border-l-0 border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Country & State */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={onChange("country")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>United Arab Emirates</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={onChange("state")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {statesOfIndia.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={onChange("agree")}
                  className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-yellow-500 px-4 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating your account..." : "Create my account"}
              </button>

              <p className="mt-1 text-[12px] text-gray-500">*No credit card required</p>
            </form>

            {/* Social sign up */}
            <div className="mt-8">
              <div className="mb-3 text-sm font-medium text-gray-700">Sign up using</div>
              <div className="flex flex-wrap gap-3">
                <SocialButton label="Google" onClick={() => handleSocial("google")}>
                  <GoogleIcon />
                </SocialButton>
                <SocialButton label="Microsoft" onClick={() => handleSocial("azure-ad")}>
                  <MicrosoftIcon />
                </SocialButton>
                <SocialButton label="LinkedIn" onClick={() => handleSocial("linkedin")}>
                  <LinkedInIcon />
                </SocialButton>
                <SocialButton label="Apple" onClick={() => handleSocial("apple")}>
                  <AppleIcon />
                </SocialButton>
                <SocialButton label="GitHub" onClick={() => handleSocial("github")}>
                  <GitHubIcon />
                </SocialButton>
              </div>
            </div>

            {/* Login link */}
            <div className="mt-8 text-center text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------- UI Bits ------------------------------- */

function SocialButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      aria-label={`Continue with ${label}`}
      title={`Continue with ${label}`}
    >
      <span className="size-5">{children}</span>
      <span>{label}</span>
    </button>
  );
}

function LogoMark() {
  return (
    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white">
      {/* Simple book glyph */}
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path d="M5 4h9a3 3 0 0 1 3 3v11.5a.5.5 0 0 1-.8.4l-1.9-1.5a3 3 0 0 0-1.8-.6H5V4Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 18.5h7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ------------------------------ Brand SVGs ----------------------------- */
/* Inline SVGs so you don't need extra icon libraries */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.8h5.4c-.2 1.4-1.6 4-5.4 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.6l2.7-2.6C16.6 3 14.5 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.5 0 9-4.6 9-7 0-.5-.1-.9-.1-1.2H12Z"/>
      <path fill="#34A853" d="M3.6 7.3 6.6 9.5C7.4 7.4 9.5 6 12 6c1.9 0 3.2.8 4 1.6l2.7-2.6C16.6 3 14.5 2 12 2 8.6 2 5.7 3.7 3.6 7.3Z" opacity=".9"/>
      <path fill="#FBBC05" d="M12 20.4c3.8 0 5.2-2.6 5.4-4H12v-3.8h9c.1.3.1.7.1 1.2 0 2.4-2.5 7-9 7-4.5 0-8.3-2.9-9.2-6.8l3.1-2.4c.7 2.8 3.3 4.8 6.1 4.8Z" opacity=".9"/>
      <path fill="#4285F4" d="M3.6 15.2c-.3-.8-.5-1.7-.5-2.6s.2-1.8.5-2.6l3.1 2.4c-.1.3-.2.7-.2 1.1s.1.8.2 1.1l-3.1 2.4Z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#0A66C2"/>
      <circle cx="7.5" cy="8" r="1.5" fill="#fff"/>
      <rect x="6.5" y="10" width="2" height="8" fill="#fff"/>
      <path d="M11.5 10h2v1.1c.5-.8 1.4-1.3 2.5-1.3 2 0 3.5 1.3 3.5 4v4.2h-2v-3.8c0-1.4-.6-2.2-1.8-2.2-1.1 0-1.8.7-1.8 2.1v3.9h-2V10Z" fill="#fff"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 13.1c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.5-1.7-3-1.7-1.3-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2.1-1.4 2.4-.4 5.9 1 7.9.7 1 1.6 2.1 2.7 2.1 1-.1 1.3-.7 2.6-.7s1.6.7 2.6.6c1.1 0 1.8-1 2.5-2 0 0 1-1.5 1.5-3.5-1.7-.7-2.9-2.3-2.9-3.5Z"
      />
      <path
        fill="currentColor"
        d="M14.8 6.2c.6-.7 1-1.7.9-2.7-1 .1-2 .6-2.6 1.3-.6.7-1 1.7-.9 2.6 1 0 2-.5 2.6-1.2Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.6-1.2 2.5-1.2.4-.6.9-1 .9-1.9-2.7-.3-5.6-1.4-5.6-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.8 11.8 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.6.3 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.6-2.9 5.6-5.6 5.9.9.8 1 1.6 1 2.6v3.8c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  );
}
