import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Code2, Paintbrush, Rocket, Languages, Infinity, DollarSign, Server,
  ArrowRight, CheckCircle2, Users, Zap, Shield, Star, ChevronRight, Monitor, Smartphone, Palette
} from "lucide-react";

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
    name: "Sarah Chen",
    company: "Bloom Floral Co.",
    text: "They redesigned our entire online shop and our conversion rate doubled in the first month. The bilingual support was exactly what we needed to reach our Spanish-speaking customers.",
    rating: 5,
  },
  {
    name: "James Rivera",
    company: "NorthPeak Outdoors",
    text: "Working with a local team that actually picks up the phone makes all the difference. Our booking platform handles thousands of reservations and has never gone down.",
    rating: 5,
  },
  {
    name: "Emma Wilson",
    company: "Artisan Bake House",
    text: "The custom ordering system they built for us replaced three different tools we were paying for. Simple, clean, and our customers love it.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$1,500",
    period: "one-time + $49/mo hosting",
    description: "Perfect for small businesses getting online",
    features: [
      "Up to 5 pages",
      "Mobile responsive design",
      "English or Spanish",
      "Contact form",
      "Basic SEO setup",
      "Managed hosting",
      "30 days of edits",
    ],
  },
  {
    name: "Growth",
    price: "$4,500",
    period: "one-time + $79/mo hosting",
    description: "For businesses ready to scale online",
    features: [
      "Up to 15 pages",
      "Bilingual (EN + ES)",
      "Custom widgets",
      "Analytics dashboard",
      "Advanced SEO",
      "Managed hosting",
      "Unlimited edits",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored to your needs",
    description: "Full-scale web platform for larger operations",
    features: [
      "Unlimited pages",
      "Bilingual (EN + ES)",
      "Custom integrations",
      "E-commerce ready",
      "Custom native elements",
      "Dedicated hosting",
      "Unlimited edits",
      "24/7 support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-landing-logo">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight">WebForge</span>
                <span className="text-[10px] text-muted-foreground ml-1 tracking-widest uppercase">Studio</span>
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="text-muted-foreground transition-colors" data-testid="link-nav-services">Services</a>
            <a href="#why-us" className="text-muted-foreground transition-colors" data-testid="link-nav-why">Why Us</a>
            <a href="#pricing" className="text-muted-foreground transition-colors" data-testid="link-nav-pricing">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground transition-colors" data-testid="link-nav-testimonials">Testimonials</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="link-nav-login">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" data-testid="link-nav-get-started">Get Started <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 no-default-active-elevate">
              <Zap className="w-3 h-3 mr-1" /> Small team. Big results.
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Websites that actually
              <br />
              <span className="text-primary">work for your business</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              We're a small local team that builds custom websites in English and Spanish.
              No offshore teams. No cookie-cutter templates. No overpriced agencies.
              Just clean, fast websites that bring you more customers.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/login">
                <Button size="lg" data-testid="button-hero-start">
                  Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="lg" variant="secondary" data-testid="button-hero-pricing">
                  View Pricing
                </Button>
              </a>
            </div>
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
          </div>
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-80">
            <div className="relative">
              <div className="w-64 h-48 rounded-lg bg-card border border-card-border p-4 rotate-3 shadow-lg">
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
              <div className="absolute -bottom-6 -left-6 w-48 h-32 rounded-lg bg-card border border-card-border p-3 -rotate-6 shadow-lg">
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
          </div>
        </div>
      </section>

      <section id="services" className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">What we do</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your business website needs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From design to deployment, we handle every aspect of your web presence so you can focus on running your business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <Card key={service.title}>
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <service.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{service.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 no-default-active-elevate">Why choose us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Skip the headaches.<br />Work with people who care.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We're not a faceless corporation or an overseas outsourcing shop. We're a small, skilled team right here
                in your community. When you call, a real person answers. When you need a change, it happens fast.
                Your success is our success.
              </p>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              {differentiators.map((diff) => (
                <Card key={diff.title}>
                  <CardContent className="p-5">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <diff.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{diff.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diff.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No surprise fees. No hidden costs. Pick a plan that fits your business and we'll handle the rest.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary relative" : ""}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="no-default-active-elevate">Most Popular</Badge>
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
                      className="w-full"
                      variant={plan.popular ? "default" : "secondary"}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      Get Started <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
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
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build something great?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's talk about your project. No pressure, no obligations. Just a conversation about what you need
            and how we can help.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="lg" data-testid="button-cta-start">
                Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">WebForge Studio</span>
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
