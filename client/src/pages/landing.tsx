import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Code2, Paintbrush, Rocket, Languages, Infinity, DollarSign, Server,
  ArrowRight, CheckCircle2, Users, Zap, Shield, Star, ChevronRight, Monitor, Smartphone, Palette, Plus,
  HelpCircle, ChevronDown, Menu, X, LayoutDashboard, Phone
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import logoPath from "@assets/LA_Webservices_(512_x_512_px)_1773103951810.png";
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

function useTranslatedData() {
  const { t } = useI18n();

  const services = [
    { icon: Globe, title: t("svc.customWebsites"), description: t("svc.customWebsitesDesc") },
    { icon: Languages, title: t("svc.bilingual"), description: t("svc.bilingualDesc") },
    { icon: Code2, title: t("svc.customWidgets"), description: t("svc.customWidgetsDesc") },
    { icon: Palette, title: t("svc.nativeElements"), description: t("svc.nativeElementsDesc") },
    { icon: Rocket, title: t("svc.driveCustomers"), description: t("svc.driveCustomersDesc") },
    { icon: Infinity, title: t("svc.unlimitedEditing"), description: t("svc.unlimitedEditingDesc") },
    { icon: DollarSign, title: t("svc.fairPricing"), description: t("svc.fairPricingDesc") },
    { icon: Server, title: t("svc.managedHosting"), description: t("svc.managedHostingDesc") },
  ];

  const differentiators = [
    { title: t("why.smallTeam"), description: t("why.smallTeamDesc"), icon: Users },
    { title: t("why.notTemplate"), description: t("why.notTemplateDesc"), icon: Paintbrush },
    { title: t("why.fast"), description: t("why.fastDesc"), icon: Zap },
    { title: t("why.scale"), description: t("why.scaleDesc"), icon: Shield },
  ];

  const testimonials = [
    { name: t("testimonial.1.name"), company: t("testimonial.1.company"), text: t("testimonial.1.text"), rating: 5 },
    { name: t("testimonial.2.name"), company: t("testimonial.2.company"), text: t("testimonial.2.text"), rating: 5 },
    { name: t("testimonial.3.name"), company: t("testimonial.3.company"), text: t("testimonial.3.text"), rating: 5 },
  ];

  const pricingPlans = [
    {
      name: t("pricing.starter"),
      price: "$199",
      period: t("pricing.perMonth"),
      description: t("pricing.starterDesc"),
      features: [
        t("pricing.feat.customWebsite"), t("pricing.feat.hosting"), t("pricing.feat.ssl"),
        t("pricing.feat.mobileResponsive"), t("pricing.feat.contactForm"), t("pricing.feat.oneEdit"),
        t("pricing.feat.basicAnalytics"), t("pricing.feat.googleMaps"), t("pricing.feat.socialMedia"),
      ],
    },
    {
      name: t("pricing.growth"),
      price: "$299",
      period: t("pricing.perMonth"),
      description: t("pricing.growthDesc"),
      features: [
        t("pricing.feat.everythingStarter"), t("pricing.feat.unlimitedEdits"), t("pricing.feat.googleBusiness"),
        t("pricing.feat.speedOpt"), t("pricing.feat.seoBasics"), t("pricing.feat.prioritySupport"),
        t("pricing.feat.blog"), t("pricing.feat.newsletter"), t("pricing.feat.monthlyReport"),
      ],
      popular: true,
    },
    {
      name: t("pricing.pro"),
      price: "$499",
      period: t("pricing.perMonth"),
      description: t("pricing.proDesc"),
      features: [
        t("pricing.feat.everythingGrowth"), t("pricing.feat.conversionOpt"), t("pricing.feat.landingPages"),
        t("pricing.feat.advancedAnalytics"), t("pricing.feat.aiChatbot"), t("pricing.feat.marketingIntegrations"),
        t("pricing.feat.abTesting"), t("pricing.feat.crm"), t("pricing.feat.accountManager"),
      ],
    },
  ];

  const upgrades = [
    { name: t("addon.seo"), description: t("addon.seoDesc"), price: t("addon.seoPrice") },
    { name: t("addon.ads"), description: t("addon.adsDesc"), price: t("addon.adsPrice") },
    { name: t("addon.chatbot"), description: t("addon.chatbotDesc"), price: t("addon.chatbotPrice") },
    { name: t("addon.landing"), description: t("addon.landingDesc"), price: t("addon.landingPrice") },
    { name: t("addon.ecommerce"), description: t("addon.ecommerceDesc"), price: t("addon.ecommercePrice") },
    { name: t("addon.reputation"), description: t("addon.reputationDesc"), price: t("addon.reputationPrice") },
  ];

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
  ];

  return { services, differentiators, testimonials, pricingPlans, upgrades, faqs };
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
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

function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className="text-xs font-medium gap-1.5 px-2"
      data-testid="button-lang-toggle"
    >
      <Languages className="w-3.5 h-3.5" />
      {lang === "en" ? "ES" : "EN"}
    </Button>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const { services, differentiators, testimonials, pricingPlans, upgrades, faqs } = useTranslatedData();

  const navLinks = [
    { href: "#services", label: t("nav.services"), id: "services" },
    { href: "#why-us", label: t("nav.whyUs"), id: "why-us" },
    { href: "#our-work", label: t("nav.ourWork"), id: "our-work" },
    { href: "#pricing", label: t("nav.pricing"), id: "pricing" },
    { href: "#testimonials", label: t("nav.testimonials"), id: "testimonials" },
    { href: "#faq", label: t("nav.faq"), id: "faq" },
  ];

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group" data-testid="link-landing-logo">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110">
                <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover" />
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200" data-testid={`link-nav-${link.id}`}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm" data-testid="link-nav-dashboard">
                  <LayoutDashboard className="w-3 h-3 mr-1.5" />{t("nav.dashboard")}
                </Button>
              </Link>
            )}
            <Link href="/call">
              <Button size="sm" className="transition-transform duration-200 hover:scale-105 text-xs sm:text-sm" data-testid="link-nav-contact">
                <Phone className="w-3 h-3 mr-1.5" />{t("nav.contactUs")}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-nav-${link.id}`}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <Link href="/dashboard">
                  <button className="block w-full text-left px-3 py-2.5 rounded-md text-sm text-primary font-medium sm:hidden" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-nav-dashboard">{t("nav.dashboard")}</button>
                </Link>
              )}
              <Link href="/call">
                <button className="block w-full text-left px-3 py-2.5 rounded-md text-sm text-primary font-medium sm:hidden" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-nav-contact">{t("nav.contactUs")}</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative py-10 sm:py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 no-default-active-elevate">
                <Zap className="w-3 h-3 mr-1" /> {t("hero.badge")}
              </Badge>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
                {t("hero.title1")}
                <br />
                <span className="text-primary">{t("hero.title2")}</span>
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                {t("hero.desc")}
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/call">
                  <Button size="lg" className="transition-transform duration-200 hover:scale-105" data-testid="button-hero-contact">
                    <Phone className="w-4 h-4 mr-2" /> {t("hero.cta")}
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button size="lg" variant="secondary" className="transition-transform duration-200 hover:scale-105" data-testid="button-hero-pricing">
                    {t("hero.pricing")}
                  </Button>
                </a>
              </div>
              <div className="mt-4">
                <Link href="/login">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-hero-signin">
                    {t("hero.signin")} <span className="underline font-medium">{t("hero.signinLink")}</span>
                  </span>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>{t("hero.check1")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>{t("hero.check2")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>{t("hero.check3")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span>{t("hero.check4")}</span>
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
                  <span className="text-[10px] font-medium">{t("hero.desktop")}</span>
                  <Smartphone className="w-3 h-3 text-chart-2 ml-2" />
                  <span className="text-[10px] font-medium">{t("hero.mobile")}</span>
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

      <section id="services" className="py-12 sm:py-16 md:py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">{t("services.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("services.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("services.desc")}
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

      <section id="why-us" className="py-12 sm:py-16 md:py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <Badge variant="secondary" className="mb-4 no-default-active-elevate">{t("why.badge")}</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("why.title1")}<br />{t("why.title2")}
                </h2>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t("why.desc")}
                </p>
              </FadeIn>
              <FadeIn delay={200}>
                <div className="space-y-3 mb-6">
                  {[t("why.check1"), t("why.check2"), t("why.check3"), t("why.check4")].map((item, i) => (
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

      <section id="our-work" className="py-12 sm:py-16 md:py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">{t("work.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("work.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("work.desc")}
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="https://jcbbconstruction.replit.app/" target="_blank" rel="noopener noreferrer" data-testid="link-work-1">
              <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotJcbb} alt="JCBB Construction website" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">{t("work.jcbb.tag")}</Badge>
                  <h3 className="font-semibold text-sm mb-1">{t("work.jcbb.title")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t("work.jcbb.desc")}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />jcbbconstruction.com
                  </p>
                </CardContent>
              </Card>
            </a>

            <a href="https://timkazimirov.com/" target="_blank" rel="noopener noreferrer" data-testid="link-work-2">
              <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotTk} alt="Timothy Kazimirov personal website" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">{t("work.tk.tag")}</Badge>
                  <h3 className="font-semibold text-sm mb-1">{t("work.tk.title")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t("work.tk.desc")}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />timkazimirov.com
                  </p>
                </CardContent>
              </Card>
            </a>

            <a href="https://miningriskmodeler.replit.app/" target="_blank" rel="noopener noreferrer" data-testid="link-work-3">
              <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screenshotMining} alt="Mining Risk Modeler web app" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] no-default-active-elevate">{t("work.mining.tag")}</Badge>
                  <h3 className="font-semibold text-sm mb-1">{t("work.mining.title")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t("work.mining.desc")}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                    <Globe className="w-3 h-3" />miningriskmodeler.com
                  </p>
                </CardContent>
              </Card>
            </a>
          </StaggerGrid>
        </div>
      </section>

      <section id="pricing" className="py-12 sm:py-16 md:py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">{t("pricing.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricing.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("pricing.desc")}
            </p>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.popular ? "border-primary relative" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="no-default-active-elevate animate-pulse">{t("pricing.mostPopular")}</Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-chart-2 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/call" className="mt-6">
                    <Button
                      className="w-full transition-transform duration-200 hover:scale-105"
                      variant={plan.popular ? "default" : "secondary"}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {t("pricing.contactUs")} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>

          <FadeIn className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">{t("pricing.addons")}</h3>
              <p className="text-sm text-muted-foreground">{t("pricing.addonsDesc")}</p>
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

      <section id="testimonials" className="py-12 sm:py-16 md:py-20 bg-card/50 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">{t("testimonials.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("testimonials.title")}</h2>
          </FadeIn>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tl) => (
              <Card key={tl.name} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: tl.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-chart-4 text-chart-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4">"{tl.text}"</p>
                  <div>
                    <p className="text-sm font-medium">{tl.name}</p>
                    <p className="text-xs text-muted-foreground">{tl.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section id="faq" className="py-12 sm:py-16 md:py-20 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 no-default-active-elevate">
              <HelpCircle className="w-3 h-3 mr-1" /> {t("faq.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("faq.title")}</h2>
            <p className="text-muted-foreground">
              {t("faq.desc")}
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <Card>
              <CardContent className="p-6">
                {faqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 border-t border-border/50">
        <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("cta.desc")}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/call">
              <Button size="lg" className="transition-transform duration-200 hover:scale-105" data-testid="button-cta-contact">
                <Phone className="w-4 h-4 mr-2" /> {t("cta.button")}
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/login">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-cta-signin">
                {t("hero.signin")} <span className="underline font-medium">{t("hero.signinLink")}</span>
              </span>
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-border py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                  <img src={logoPath} alt="LA Webservices" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm">LA Webservices</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("footer.bilingualDesc")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("footer.services")}</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><a href="#services" className="hover:text-foreground transition-colors">{t("footer.customWebDesign")}</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">{t("footer.bilingualWebsites")}</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">{t("footer.customWidgets")}</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">{t("footer.seoOptimization")}</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">{t("footer.managedHosting")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("footer.areasTitle")}</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>{t("footer.area1")}</li>
                <li>{t("footer.area2")}</li>
                <li>{t("footer.area3")}</li>
                <li>{t("footer.area4")}</li>
                <li>{t("footer.area5")}</li>
                <li>{t("footer.area6")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
