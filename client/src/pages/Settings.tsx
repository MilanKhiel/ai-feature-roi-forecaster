import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { BarChart3, Loader2, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-xl">ForecastForge</span>
            </a>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Settings Placeholder
              </CardTitle>
              <CardDescription>
                Team management and billing features coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page is reserved for future settings including team invites, role management, and billing configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
