// src/pages/PrivacyPolicy.jsx
import React from "react";
import { motion } from "framer-motion";
import { Brush, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Information you provide",
        text: "When you use PaintFlow AI, we collect the photos you upload for tutorial generation, your email address if you create an account or make a purchase, and payment information processed securely through Dodo Payments (we do not store your card details).",
      },
      {
        subtitle: "Information collected automatically",
        text: "We automatically collect usage data such as the features you use, the techniques you select, and general interaction patterns. We also collect standard log data including IP address, browser type, and device information.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "To provide the service",
        text: "Your uploaded photos are sent to our AI model to generate personalized oil painting tutorials. Photos are processed and are not stored permanently beyond what is necessary to generate your tutorial.",
      },
      {
        subtitle: "To improve PaintFlow AI",
        text: "Aggregated, anonymized usage data helps us understand which techniques are most useful and how to improve tutorial quality. We do not use your personal photos for AI training without explicit consent.",
      },
      {
        subtitle: "To process payments",
        text: "Payment information is handled entirely by Dodo Payments, our payment processor. We receive confirmation of payment but do not access or store your financial details.",
      },
    ],
  },
  {
    title: "3. Data Sharing",
    content: [
      {
        text: "We do not sell, rent, or trade your personal information to third parties. We share information only with: (a) our AI service provider to generate tutorials, (b) Dodo Payments to process transactions, and (c) hosting providers necessary to operate the service. All third-party providers are contractually required to protect your data.",
      },
    ],
  },
  {
    title: "4. Data Retention",
    content: [
      {
        text: "Uploaded photos are retained only for the duration of your session and are deleted within 24 hours. Account information is retained while your account is active. You may request deletion of your data at any time by contacting us.",
      },
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      {
        text: "You have the right to access, correct, or delete your personal data. You may also request that we restrict processing or object to processing in certain circumstances. To exercise these rights, contact us at the email below.",
      },
    ],
  },
  {
    title: "6. Cookies",
    content: [
      {
        text: "We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes. You may disable cookies in your browser settings, though this may affect service functionality.",
      },
    ],
  },
  {
    title: "7. Security",
    content: [
      {
        text: "We implement industry-standard security measures including HTTPS encryption for all data in transit. While we take security seriously, no internet transmission is 100% secure. Please use the service responsibly.",
      },
    ],
  },
  {
    title: "8. Children's Privacy",
    content: [
      {
        text: "PaintFlow AI is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.",
      },
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the site. Continued use of PaintFlow AI after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      {
        text: "If you have any questions about this Privacy Policy or how we handle your data, please contact us at: privacy@paintflowai.com",
      },
    ],
  },
];

function AtelierBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "#0c0907" }} />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(200,121,58,0.08) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(80,100,130,0.05) 0%, transparent 65%)" }} />
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(200,121,58,0.3))" }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#c8793a" }} />
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(200,121,58,0.3))" }} />
    </div>
  );
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "#f2e8d8", fontFamily: "'DM Sans', sans-serif" }}>
      <AtelierBackground />

      <div className="relative z-10">
        {/* NAV */}
        <header className="sticky top-0 z-20 border-b"
          style={{ borderColor: "rgba(200,121,58,0.12)", background: "rgba(12,9,7,0.85)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: "#8a7660" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f2e8d8"}
              onMouseLeave={e => e.currentTarget.style.color = "#8a7660"}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="ml-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #c8793a, #8b4513)" }}>
                <Brush className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                PaintFlow <span style={{ color: "#c8793a" }}>AI</span>
              </span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="max-w-4xl mx-auto px-5 py-16 space-y-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="space-y-4">
            <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#c8793a" }}>Legal</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Privacy <em style={{ background: "linear-gradient(120deg, #e8b86d, #c8793a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Policy</em>
            </h1>
            <GoldDivider />
            <p className="text-sm" style={{ color: "#6a5a4a" }}>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#8a7660" }}>
              PaintFlow AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service at paintflowai.com.
            </p>
          </motion.div>

          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <motion.div key={section.title}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                className="rounded-2xl p-6 space-y-4"
                style={{ border: "1px solid rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.03)" }}>
                <h2 className="text-base font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8", fontSize: "1.1rem" }}>
                  {section.title}
                </h2>
                {section.content.map((item, j) => (
                  <div key={j} className="space-y-1.5">
                    {item.subtitle && (
                      <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#c8793a" }}>
                        {item.subtitle}
                      </h3>
                    )}
                    <p className="text-sm leading-relaxed" style={{ color: "#8a7660" }}>{item.text}</p>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t py-8 mt-8" style={{ borderColor: "rgba(200,121,58,0.10)" }}>
          <div className="max-w-4xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #c8793a, #8b4513)" }}>
                <Brush className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium" style={{ color: "#4a3728" }}>PaintFlow AI</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: "#4a3728" }}>
              <button onClick={() => navigate("/privacy")} style={{ color: "#c8793a" }}>Privacy Policy</button>
              <span>·</span>
              <button onClick={() => navigate("/terms")} style={{ color: "#4a3728" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c8793a"}
                onMouseLeave={e => e.currentTarget.style.color = "#4a3728"}>Terms of Service</button>
            </div>
            <p className="text-xs" style={{ color: "#4a3728" }}>© {new Date().getFullYear()} PaintFlow AI · All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}