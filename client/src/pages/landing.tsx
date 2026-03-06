import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Code2, Paintbrush, Rocket, Languages, Infinity, DollarSign, Server,
  ArrowRight, CheckCircle2, Users, Zap, Shield, Star, ChevronRight, Monitor, Smartphone, Palette, Plus,
  HelpCircle, ChevronDown, Menu, X, Sparkles, ArrowUpRight
} from "lucide-react";
import logoPath from "@assets/la-webservices-logo.png";
import screenshotJcbb from "@assets/screenshot-1772753604831.png";
import screenshotTk from "@assets/screenshot-1772753624879.png";
import screenshotMining from "@assets/screenshot-1772753687145.png";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function StaggerGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useInView(0.1);
  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? children.map((child, i) => (
        <div
          key={i}
          className={`transition-all duration-600 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          {child}
        </div>
      )) : children}
    </div>
  );
}

const services = [
  {
    icon: Globe,
    title: "Custom Websites",
    description: "Tailored websites built from scratch to match your brand identity and business goals. No templates, no shortcuts.",
  },
  {
    icon: Languages,
    title: "Bilingual (EN/ES)",
    description: "Full English and Spanish support built into every project. Reach both markets seamlessly with native-level content.",
  },
  {
    icon: Code2,
    title: "Custom Widgets",
    description: "Interactive components, booking systems, calculators, and tools designed specifically for your business needs.",
  },
  {
    icon: Palette,
    title: "Native Web Elements",
    description: "Hand-crafted UI components using modern web standards. Fast, accessible, and built to last.",
  },
  {
    icon: Rocket,
    title: "Drive More Customers",
    description: "SEO-optimized, conversion-focused design that turns visitors into paying customers from day one.",
  },
  {
    icon: Infinity,
    title: "Unlimited Editing",
    description: "Need a change? We handle it. Unlimited content updates and design tweaks included with every plan.",
  },
  {
    icon: DollarSign,
    title: "Fair Pricing",
    description: "Transparent, honest pricing with no hidden fees. You know exactly what you're paying for before we start.",
  },
  {
    icon: Server,
    title: "Managed Hosting",
    description: "Fast, secure hosting included. We handle uptime, SSL certificates, backups, and performance so you don't have to.",
  },
];

const differentiators = [
  {
    title: "Small Local Team",
    description: "Work directly with the people building your site. No ticket systems, no waiting in queues, no getting passed around.",
    icon: Users,
  },
  {
    title: "Not Another Template",
    description: "Every site is built from the ground up. Your business is unique and your website should be too.",
    icon: Paintbrush,
  },
  {
    title: "Lightning Fast",
    description: "Optimized code, fast hosting, and modern architecture mean your site loads in under 2 seconds.",
    icon: Zap,
  },
  {
    title: "Built to Scale",
    description: "Start small, grow big. Our architecture scales with your business without costly rebuilds.",
    icon: Shield,
  },
];

const testimonials = [
  {
    name: "Maria G.",
    company: "Local Restaurant Owner",
    text: "They built our bilingual website and online ordering system. Our Spanish-speaking customers finally feel at home, and our orders went up 40% in the first month.",
    rating: 5,
  },
  {
    name: "David R.",
    company: "Home Services Business",
    text: "Working with a local team that actually picks up the phone makes all the difference. They built us a booking system that handles everything and the site has never gone down.",
    rating: 5,
  },
  {
    name: "Lisa M.",
    company: "Boutique Shop Owner",
    text: "The custom storefront they built for us replaced three different tools we were paying for. Simple, clean, and our customers love it. Best investment we made.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$1,000",
    period: "one-time + $95/mo hosting & maintenance",
    description: "Perfect for small businesses getting online",
    features: [
      "Custom designed website",
      "Mobile responsive design",
      "English or Spanish",
      "Contact form & lead capture",
      "Basic SEO setup",
      "Managed hosting included",
      "Ongoing maintenance",
      "Content updates",
    ],
  },
  {
    name: "Monthly",
    price: "$0",
    period: "upfront — $299/mo hosting & maintenance",
    description: "No upfront cost, everything included monthly",
    features: [
      "Custom designed website",
      "Mobile responsive design",
      "Bilingual (EN + ES)",
      "Custom widgets",
      "SEO optimization",
      "Managed hosting included",
      "Unlimited edits",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Custom",
    price: "Let's Talk",
    period: "tailored to your project",
    description: "For businesses with specific needs and goals",
    features: [
      "Fully custom build",
      "Bilingual (EN + ES)",
      "Custom integrations & APIs",
      "E-commerce ready",
      "Custom native elements",
      "Dedicated hosting",
      "Unlimited edits",
      "Dedicated support",
    ],
  },
];

const upgrades = [
  { name: "Bilingual Add-on", description: "Add full Spanish or English translation to your existing site", price: "+$300 one-time" },
  { name: "E-commerce Integration", description: "Online store with product listings, cart, and payment processing", price: "+$500 one-time" },
  { name: "Custom Booking System", description: "Appointment scheduling and reservation management", price: "+$400 one-time" },
  { name: "Analytics Dashboard", description: "Real-time visitor tracking, traffic reports, and performance insights", price: "+$150 one-time" },
  { name: "Custom Widgets", description: "Interactive calculators, configurators, or specialized tools", price: "From $200" },
  { name: "Logo & Brand Design", description: "Professional logo and brand identity package", price: "+$350 one-time" },
];

const faqs = [
  {
    question: "How much does a website cost in Los Angeles?",
    answer: "We offer transparent pricing starting at $1,000 one-time plus $95/month for the Starter package, or $0 upfront with $299/month for the all-inclusive Monthly plan. Custom projects are priced based on scope. All plans include managed hosting and maintenance.",
  },
  {
    question: "Do you build bilingual websites in English and Spanish?",
    answer: "Yes! Every website we build can be fully bilingual in English and Spanish. We create native-level content in both languages to help you reach English and Spanish-speaking customers in Los Angeles and beyond.",
  },
  {
    question: "How long does it take to build a website?",
    answer: "Most websites are delivered within a week. Custom projects with advanced features may take a bit longer depending on scope. We provide regular updates throughout the process and you can communicate directly with your development team.",
  },
  {
    question: "Do you provide website hosting?",
    answer: "Yes, managed hosting is included with every plan. We handle uptime monitoring, SSL certificates, backups, and performance optimization so you don't have to worry about any technical details.",
  },
  {
    question: "Can I make changes to my website after it's built?",
    answer: "Absolutely! All our plans include content updates. Our Monthly plan includes unlimited edits at no extra cost. Just tell us what you need changed and we'll handle it, usually same-day.",
  },
  {
    question: "Do you work with businesses outside of Los Angeles?",
    answer: "While we're based in LA and most of our clients are local businesses in the greater Los Angeles area, we work with businesses across Southern California and beyond. Our client portal makes remote collaboration seamless.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        data-testid={`faq-toggle-${question.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#why-us", label: "Why Us" },
    { href: "#our-work", label: "Our Work" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <nav className="sticky top-0 z-50 glass-strong transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group" data-testid="link-landing-logo">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-md">
                <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover scale-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight">LA</span>
                <span className="text-[10px] text-muted-foreground ml-1 tracking-[0.2em] uppercase">Webservices</span>
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-wide text-[13px]" data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[13px]" data-testid="link-nav-login">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 text-xs sm:text-sm" data-testid="link-nav-get-started">Get Started <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 glass">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </a>
              ))}
              <Link href="/login">
                <button className="block w-full text-left px-3 py-2.5 rounded-md text-sm text-primary font-medium sm:hidden" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-nav-signin">Sign In</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-chart-2/6 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl">
            <FadeIn>
              <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium tracking-wide">Small team. Big results.</span>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                <span className="font-serif italic text-primary">Websites</span> that
                <br />
                actually <span className="font-serif italic">work</span> for
                <br className="hidden sm:block" />
                <span className="text-primary">your business</span>
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 sm:mb-10 max-w-2xl">
                We're a small Los Angeles web design team that builds custom websites in English and Spanish.
                No offshore teams. No cookie-cutter templates. Just clean, fast websites that bring your local business more customers.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/login">
                  <Button size="lg" className="shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 text-sm h-12 px-8" data-testid="button-hero-start">
                    Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button size="lg" variant="secondary" className="glass transition-all duration-300 hover:scale-105 text-sm h-12 px-8" data-testid="button-hero-pricing">
                    View Pricing
                  </Button>
                </a>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={400}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14 max-w-3xl">
              {[
                { label: "Bilingual EN/ES", icon: Languages },
                { label: "Unlimited Edits", icon: Infinity },
                { label: "Hosting Included", icon: Server },
                { label: "Fair Pricing", icon: DollarSign },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <item.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs sm:text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="services" className="py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
              <span className="text-xs font-medium tracking-wide">What we do</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything your <span className="font-serif italic text-primary">business</span> needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              From design to deployment, we handle every aspect of your web presence so you can focus on running your business.
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <div key={service.title} className="glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/15 group-hover:shadow-md shadow-sm">
                  <service.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 tracking-tight">{service.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="why-us" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
                  <span className="text-xs font-medium tracking-wide">Why choose us</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                  Skip the <span className="font-serif italic text-primary">headaches</span>.
                  <br />Work with people who care.
                </h2>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                  We're not a faceless corporation or an overseas outsourcing shop. We're a small, skilled team right here
                  in your community. When you call, a real person answers.
                </p>
              </FadeIn>
              <FadeIn delay={200}>
                <div className="space-y-3 mb-6">
                  {[
                    "Direct communication with your development team",
                    "Same-day response on all requests",
                    "No contracts with hidden clauses or surprise fees",
                    "Your website, your data, your ownership",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-chart-2" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <StaggerGrid className="grid grid-cols-2 gap-4">
              {differentiators.map((diff) => (
                <div key={diff.title} className="glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <diff.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 tracking-tight">{diff.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{diff.description}</p>
                </div>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </section>

      <section id="our-work" className="py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
              <span className="text-xs font-medium tracking-wide">Our Work</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Projects we've <span className="font-serif italic text-primary">built</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Real websites for real businesses. Every project is custom-built to match the client's brand and goals.
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="https://jcbbconstruction.replit.app/" target="_blank" rel="noopener noreferrer" data-testid="link-work-1">
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotJcbb} alt="JCBB Construction website" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 glass rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">Construction</Badge>
                  <h3 className="font-semibold text-sm mb-1 tracking-tight">JCBB Construction</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Bilingual contractor website with project gallery, service pages, and lead capture. Built for LA local SEO with full English/Spanish support.</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />jcbbconstruction.com
                  </p>
                </div>
              </div>
            </a>

            <a href="https://timkazimirov.com/" target="_blank" rel="noopener noreferrer" data-testid="link-work-2">
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotTk} alt="Timothy Kazimirov personal website" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 glass rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">Personal</Badge>
                  <h3 className="font-semibold text-sm mb-1 tracking-tight">Timothy Kazimirov</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Clean, modern personal website with portfolio, blog, and live data integrations. Custom design with commodity ticker and project showcases.</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />timkazimirov.com
                  </p>
                </div>
              </div>
            </a>

            <a href="https://miningriskmodeler.replit.app/" target="_blank" rel="noopener noreferrer" data-testid="link-work-3">
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotMining} alt="Mining Risk Modeler web app" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 glass rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">Financial</Badge>
                  <h3 className="font-semibold text-sm mb-1 tracking-tight">Mining Risk Modeler</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Full-stack financial analytics platform with interactive risk heatmaps, jurisdiction rankings, AI analyst, and rate calculators.</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />miningriskmodeler.com
                  </p>
                </div>
              </div>
            </a>
          </StaggerGrid>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <FadeIn className="text-center mb-16">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
              <span className="text-xs font-medium tracking-wide">Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Simple, <span className="font-serif italic text-primary">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              No surprise fees. No hidden costs. Pick a plan that fits your business and we'll handle the rest.
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`glass-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative ${plan.popular ? "ring-2 ring-primary shadow-xl shadow-primary/10" : "shadow-lg"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full shadow-lg shadow-primary/30">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="p-6 sm:p-7">
                  <h3 className="font-bold text-lg mb-1 tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold font-serif">{plan.price}</span>
                    <p className="text-xs text-muted-foreground mt-1.5">{plan.period}</p>
                  </div>
                  <div className="space-y-3 mb-7">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-chart-2" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/login">
                    <Button
                      className={`w-full transition-all duration-300 hover:scale-[1.02] h-11 ${plan.popular ? "shadow-lg shadow-primary/20" : ""}`}
                      variant={plan.popular ? "default" : "secondary"}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.name === "Custom" ? "Contact Us" : "Get Started"} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </StaggerGrid>

          <FadeIn className="mt-20">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Available <span className="font-serif italic text-primary">Upgrades</span></h3>
              <p className="text-sm text-muted-foreground">Add these to any plan to extend your site's capabilities</p>
            </div>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgrades.map((upgrade) => (
              <div key={upgrade.name} className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-primary/15 shadow-sm">
                    <Plus className="w-3.5 h-3.5 text-primary transition-transform duration-300 group-hover:rotate-90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm tracking-tight">{upgrade.name}</h4>
                      <Badge variant="secondary" className="shrink-0 text-[11px] no-default-active-elevate">{upgrade.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{upgrade.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="testimonials" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-chart-4/5 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <FadeIn className="text-center mb-16">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
              <span className="text-xs font-medium tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What our <span className="font-serif italic text-primary">clients</span> say
            </h2>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default group">
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-chart-4 text-chart-4" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 font-serif italic text-muted-foreground">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="faq" className="py-16 sm:py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-12">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-md">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium tracking-wide">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently asked <span className="font-serif italic text-primary">questions</span>
            </h2>
            <p className="text-muted-foreground text-base">
              Common questions about our web design services in Los Angeles.
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-lg">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        </div>
        <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Ready to build something <span className="font-serif italic text-primary">great</span>?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-base">
            Let's talk about your project. No pressure, no obligations. Just a conversation about what you need
            and how we can help.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="lg" className="shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl h-12 px-8 text-sm" data-testid="button-cta-start">
                Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-border/30 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md">
                  <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover scale-[1.8]" />
                </div>
                <span className="font-bold text-sm tracking-tight">LA Webservices</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Custom bilingual web design and development for small businesses in Los Angeles, California.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 tracking-tight">Services</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#services" className="hover:text-foreground transition-colors">Custom Web Design</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Bilingual Websites (EN/ES)</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Custom Widgets & Apps</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">SEO Optimization</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Managed Hosting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 tracking-tight">Areas We Serve</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>Los Angeles, CA</li>
                <li>Hollywood & West Hollywood</li>
                <li>Santa Monica & Venice</li>
                <li>Downtown LA & East LA</li>
                <li>San Fernando Valley</li>
                <li>Long Beach & South Bay</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LA Webservices. Web design agency in Los Angeles, CA.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with care by a small team that loves the web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
