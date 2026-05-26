// src/pages/TermsOfService.jsx
import React from "react";
import { motion } from "framer-motion";
import { Brush, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: [
      {
        text: "By accessing or using PaintFlow AI (paintflowai.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.",
      },
    ],
  },
  {
    title: "2. Description of Service",
    content: [
      {
        text: "PaintFlow AI provides an AI-powered oil painting tutorial generator. Users upload a reference photo and our system generates a personalized, narrated step-by-step oil painting guide. The service is provided 'as is' and is intended for educational and creative purposes.",
      },
    ],
  },
  {
    title: "3. User Accounts & Eligibility",
    content: [
      {
        text: "You must be at least 13 years old to use PaintFlow AI. If you are under 18, you must have parental or guardian consent. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
      },
    ],
  },
  {
    title: "4. Payments & Subscriptions",
    content: [
      {
        subtitle: "Billing",
        text: "Paid plans are billed through Dodo Payments. By providing payment information, you authorize us to charge the applicable fees. All prices are listed in USD unless otherwise stated.",
      },
      {
        subtitle: "Refund Policy",
        text: "We offer a 7-day refund policy for new subscribers who have not generated more than 3 tutorials. To request a refund, contact us at support@paintflowai.com within 7 days of your purchase. Refunds are processed within 5–10 business days. We reserve the right to decline refund requests that show signs of abuse.",
      },
      {
        subtitle: "Cancellations",
        text: "You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access to the service until that date.",
      },
    ],
  },
  {
    title: "5. Acceptable Use",
    content: [
      {
        subtitle: "You may",
        text: "Use PaintFlow AI for personal, educational, and creative projects. Share tutorials and artwork you create using our guides.",
      },
      {
        subtitle: "You may not",
        text: "Upload photos you do not have rights to use. Upload illegal, harmful, offensive, or explicit content. Attempt to reverse-engineer, scrape, or exploit the service. Resell or redistribute generated tutorials without permission. Use the service for any unlawful purpose.",
      },
    ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      {
        subtitle: "Your content",
        text: "You retain ownership of the photos you upload. By uploading, you grant PaintFlow AI a limited license to process your photo solely for the purpose of generating your tutorial.",
      },
      {
        subtitle: "Our content",
        text: "The PaintFlow AI name, logo, website design, and underlying AI systems are the property of PaintFlow AI. The tutorials generated are provided for your personal use. You may not resell or redistribute them commercially without written permission.",
      },
    ],
  },
  {
    title: "7. Disclaimer of Warranties",
    content: [
      {
        text: "PaintFlow AI is provided 'as is' without warranties of any kind, either express or implied. We do not guarantee that tutorials will be error-free, suitable for your specific skill level, or that the service will be uninterrupted. AI-generated content should be verified and adapted using your own judgment.",
      },
    ],
  },
  {
    title: "8. Limitation of Liability",
    content: [
      {
        text: "To the fullest extent permitted by law, PaintFlow AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 30 days preceding the claim.",
      },
    ],
  },
  {
    title: "9. Privacy",
    content: [
      {
        text: "Your use of PaintFlow AI is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the service, you consent to our data practices as described in the Privacy Policy.",
      },
    ],
  },
  {
    title: "10. Governing Law",
    content: [
      {
        text: "These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved through good-faith negotiation first. If unresolved, disputes shall be submitted to the appropriate courts of the Philippines.",
      },
    ],
  },
  {
    title: "11. Contact",
    content: [
      {
        text: "For questions about these Terms of Service, please contact us at: legal@paintflowai.com",
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
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(200,121,58,0.08) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(122,154,181,0.05) 0%, transparent 65%)" }} />
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

export default function TermsOfService() {
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
            <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#7a9ab5" }}>Legal</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Terms of <em style={{ background: "linear-gradient(120deg, #e8b86d, #c8793a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Service</em>
            </h1>
            <GoldDivider />
            <p className="text-sm" style={{ color: "#6a5a4a" }}>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#8a7660" }}>
              Please read these Terms of Service carefully before using PaintFlow AI. These terms govern your access to and use of our service.
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
            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => navigate("/privacy")} style={{ color: "#4a3728" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c8793a"}
                onMouseLeave={e => e.currentTarget.style.color = "#4a3728"}>Privacy Policy</button>
              <span style={{ color: "#4a3728" }}>·</span>
              <button onClick={() => navigate("/terms")} style={{ color: "#c8793a" }}>Terms of Service</button>
            </div>
            <p className="text-xs" style={{ color: "#4a3728" }}>© {new Date().getFullYear()} PaintFlow AI · All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}