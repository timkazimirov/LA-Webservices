import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ArrowLeft, Clock, MapPin, Languages } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import logoPath from "@assets/LA_Webservices_(512_x_512_px)_1773103951810.png";

export default function CallPage() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={logoPath} alt="LA Webservices" className="h-8" data-testid="img-logo" />
          </Link>
          <div className="flex items-center gap-2">
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
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />{t("call.backHome")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-page-title">{t("call.title")}</h1>
            <p className="text-muted-foreground text-lg">{t("call.desc")}</p>
          </div>

          <Card className="border-2">
            <CardContent className="p-8 space-y-6">
              <a href="tel:+17754095052" className="block">
                <Button size="lg" className="w-full text-xl py-7 font-semibold" data-testid="button-call">
                  <Phone className="w-6 h-6 mr-3" />(775) 409-5052
                </Button>
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{t("call.businessHours")}</p>
                    <p>{t("call.hours")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{t("call.location")}</p>
                    <p>{t("call.locationValue")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            {t("call.emailPref")}{" "}
            <a href="mailto:admin@lawebservices.com" className="text-primary underline" data-testid="link-email">admin@lawebservices.com</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {t("call.rights")}</p>
      </footer>
    </div>
  );
}
