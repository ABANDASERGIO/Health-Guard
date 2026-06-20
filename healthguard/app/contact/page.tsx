import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

const EMAIL = "abandaserGio429@gmail.com";
const WHATSAPP_NUMBER = "651990391"; // without +

export default function ContactPage() {
  const mailto = `mailto:${EMAIL}`;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted">
            Contact
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Get in touch</h1>
          <p className="mt-3 max-w-2xl text-muted">
            For questions, access requests, or demo support, reach us using the buttons below.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <h2 className="text-lg font-semibold">Email</h2>
            <p className="mt-2 text-sm text-muted">Click the email icon to open your mail client.</p>

            <div className="mt-5 flex items-center gap-4">
              <Link
                href={mailto}
                className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary/15"
                aria-label="Email"
              >
                <Mail className="size-6" />
              </Link>

            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <h2 className="text-lg font-semibold">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted">Click the WhatsApp icon to start a chat.</p>

            <div className="mt-5 flex items-center gap-4">
              <Link
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary/15"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-6" />
              </Link>

            </div>
          </div>
        </div>

        <div className="mt-10 text-sm text-muted">
          Prefer the quickest response? Use WhatsApp for access and onboarding support.
        </div>
      </section>
    </div>
  );
}




