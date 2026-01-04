import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">ForecastForge</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Forecast ROI Before You Build
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Make data-driven decisions about which features to build next. ForecastForge combines deterministic scoring with AI-powered analysis to predict the return on investment for your SaaS feature ideas.
              </p>
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Get Started Free</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Deterministic Scoring</h3>
                <p className="text-muted-foreground">
                  Transparent scoring based on value potential, reach, evidence strength, effort, and risk factors.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Forecasts</h3>
                <p className="text-muted-foreground">
                  Get comprehensive ROI predictions with impact ranges, assumptions, risks, and validation plans.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Evidence-Based</h3>
                <p className="text-muted-foreground">
                  Attach tickets, sales calls, analytics, and other evidence to strengthen your forecasts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ForecastForge. Built with Manus.</p>
        </div>
      </footer>
    </div>
  );
}
