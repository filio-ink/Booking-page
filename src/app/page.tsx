import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { Calendar, Clock, Globe, Mail, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Google Calendar sync",
    description:
      "Connect your Google Calendar and we automatically block off your busy times.",
  },
  {
    icon: Globe,
    title: "Timezone-aware",
    description:
      "Your guests see available slots in their local timezone — no confusion.",
  },
  {
    icon: Clock,
    title: "Multiple meeting types",
    description:
      "Create 15-min calls, 30-min demos, 1-hour consultations — anything you need.",
  },
  {
    icon: Mail,
    title: "Email confirmations",
    description:
      "Both you and your guest receive instant confirmation emails with all the details.",
  },
  {
    icon: Zap,
    title: "One shareable link",
    description:
      "Share yourdomain.com/your-name and let guests pick from your event types.",
  },
  {
    icon: Shield,
    title: "No double-bookings",
    description:
      "Real-time conflict checking prevents two guests from booking the same slot.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Calendar className="h-4 w-4" />
            Scheduling made simple
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your personal booking page,{" "}
            <span className="text-primary">in minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Connect your Google Calendar, set your availability, and share a
            link. Guests book meetings that automatically appear in your calendar
            — no back-and-forth needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg" className="gap-2 px-8">
                <Calendar className="h-5 w-5" />
                Get started free
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            No credit card required · Sign in with Google
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect your calendar",
                desc: "Sign in with Google and we sync your Google Calendar automatically.",
              },
              {
                step: "2",
                title: "Set your availability",
                desc: "Choose which days and hours you're open for meetings.",
              },
              {
                step: "3",
                title: "Share your link",
                desc: "Send guests to bookingpage.app/you and they book in seconds.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to simplify your scheduling?</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
          Join thousands of professionals who use BookingPage to save time and
          delight their guests.
        </p>
        <Link href="/sign-in">
          <Button size="lg" variant="secondary" className="gap-2 px-8">
            <Calendar className="h-5 w-5" />
            Create your booking page
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 font-semibold text-foreground mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          BookingPage
        </div>
        <p>© {new Date().getFullYear()} BookingPage. Built with Next.js.</p>
      </footer>
    </div>
  );
}
