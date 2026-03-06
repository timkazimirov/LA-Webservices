import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ArrowLeft, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/la-webservices-logo.svg";

export default function CallPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={logoPath} alt="LA Webservices" className="h-8" data-testid="img-logo" />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-page-title">Call Us</h1>
            <p className="text-muted-foreground text-lg">Ready to start your project? Give us a call and let's talk about your vision.</p>
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
                    <p className="font-medium text-foreground">Business Hours</p>
                    <p>Mon - Fri: 9am - 6pm PST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Location</p>
                    <p>Los Angeles, California</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Prefer email? Reach us at{" "}
            <a href="mailto:admin@lawebservices.com" className="text-primary underline" data-testid="link-email">admin@lawebservices.com</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LA Webservices. All rights reserved.</p>
      </footer>
    </div>
  );
}
