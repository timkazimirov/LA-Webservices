import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Code2, Paintbrush, Rocket, Languages, Infinity, DollarSign, Server,
  ArrowRight, CheckCircle2, Users, Zap, Shield, Star, ChevronRight, Monitor, Smartphone, Palette, Plus
} from "lucide-react";
import logoPath from "@assets/la-webservices-logo.png";

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group" data-testid="link-landing-logo">
              <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110">
                <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover scale-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight">LA</span>
                <span className="text-[10px] text-muted-foreground ml-1 tracking-widest uppercase">Webservices</span>
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors duration-200" data-testid="link-nav-services">Services</a>
            <a href="#why-us" className="text-muted-foreground hover:text-foreground transition-colors duration-200" data-testid="link-nav-why">Why Us</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-200" data-testid="link-nav-pricing">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors duration-200" data-testid="link-nav-testimonials">Testimonials</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="link-nav-login">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="transition-transform duration-200 hover:scale-105" data-testid="link-nav-get-started">Get Started <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 no-default-active-elevate">
                <Zap className="w-3 h-3 mr-1" /> Small team. Big results.
              </Badge>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Websites that actually
                <br />
                <span className="text-primary">work for your business</span>
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                We're a small local team that builds custom websites in English and Spanish.
                No offshore teams. No cookie-cutter templates. No overpriced agencies.
                Just clean, fast websites that bring you more customers.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/login">
                  <Button size="lg" className="transition-transform duration-200 hover:scale-105" data-testid="button-hero-start">
                    Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button size="lg" variant="secondary" className="transition-transform duration-200 hover:scale-105" data-testid="button-hero-pricing">
                    View Pricing
                  </Button>
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>Bilingual EN/ES</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>Unlimited edits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>Hosting included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>Fair pricing</span>
                </div>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={300} className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-80">
            <div className="relative">
              <div className="w-64 h-48 rounded-lg bg-card border border-card-border p-4 rotate-3 shadow-lg transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-4/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-2/60" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-primary/15 w-3/4" />
                  <div className="h-3 rounded bg-muted w-full" />
                  <div className="h-3 rounded bg-muted w-5/6" />
                  <div className="h-8 rounded bg-primary/10 w-1/3 mt-3" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-32 rounded-lg bg-card border border-card-border p-3 -rotate-6 shadow-lg transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-medium">Desktop</span>
                  <Smartphone className="w-3 h-3 text-chart-2 ml-2" />
                  <span className="text-[10px] font-medium">Mobile</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-16 rounded bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-primary/30" />
                  </div>
                  <div className="w-8 h-16 rounded bg-chart-2/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-chart-2/30" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="services" className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">What we do</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your business website needs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From design to deployment, we handle every aspect of your web presence so you can focus on running your business.
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <Card key={service.title} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                    <service.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{service.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="why-us" className="py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <Badge variant="secondary" className="mb-4 no-default-active-elevate">Why choose us</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Skip the headaches.<br />Work with people who care.
                </h2>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We're not a faceless corporation or an overseas outsourcing shop. We're a small, skilled team right here
                  in your community. When you call, a real person answers. When you need a change, it happens fast.
                  Your success is our success.
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
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-chart-2 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <StaggerGrid className="grid grid-cols-2 gap-4">
              {differentiators.map((diff) => (
                <Card key={diff.title} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                  <CardContent className="p-5">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <diff.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{diff.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diff.description}</p>
                  </CardContent>
                </Card>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No surprise fees. No hidden costs. Pick a plan that fits your business and we'll handle the rest.
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={`transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.popular ? "border-primary relative" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="no-default-active-elevate animate-pulse">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <p className="text-xs text-muted-foreground mt-1">{plan.period}</p>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-chart-2 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/login">
                    <Button
                      className="w-full transition-transform duration-200 hover:scale-105"
                      variant={plan.popular ? "default" : "secondary"}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.name === "Custom" ? "Contact Us" : "Get Started"} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>

          <FadeIn className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">Available Upgrades</h3>
              <p className="text-sm text-muted-foreground">Add these to any plan to extend your site's capabilities</p>
            </div>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgrades.map((upgrade) => (
              <Card key={upgrade.name} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 hover:rotate-90">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{upgrade.name}</h4>
                      <Badge variant="secondary" className="shrink-0 text-[11px] no-default-active-elevate">{upgrade.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{upgrade.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our clients say</h2>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-chart-4 text-chart-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <FadeIn className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build something great?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's talk about your project. No pressure, no obligations. Just a conversation about what you need
            and how we can help.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="lg" className="transition-transform duration-200 hover:scale-105" data-testid="button-cta-start">
                Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover scale-[1.8]" />
              </div>
              <span className="font-bold text-sm">LA Webservices</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with care by a small team that loves the web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
