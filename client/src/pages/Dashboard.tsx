import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plus, BarChart3, Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [orgId, setOrgId] = useState<number | null>(null);

  const getOrCreateOrg = trpc.organizations.getOrCreate.useMutation();
  const { data: features, isLoading: featuresLoading } = trpc.features.list.useQuery(
    { orgId: orgId! },
    { enabled: orgId !== null }
  );

  useEffect(() => {
    if (isAuthenticated && !orgId) {
      getOrCreateOrg.mutate(undefined, {
        onSuccess: (data) => {
          setOrgId(data.orgId);
        },
      });
    }
  }, [isAuthenticated, orgId]);

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

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Feature Ideas</h1>
              <p className="text-muted-foreground mt-1">
                Manage and forecast ROI for your feature ideas
              </p>
            </div>
            <Button asChild>
              <Link href="/features/new">
                <a className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Feature
                </a>
              </Link>
            </Button>
          </div>

          {featuresLoading || !orgId ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : features && features.length > 0 ? (
            <div className="grid gap-4">
              {features.map((feature) => (
                <Link key={feature.id} href={`/features/${feature.id}`}>
                  <a>
                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {feature.problem.substring(0, 150)}
                              {feature.problem.length > 150 ? "..." : ""}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {feature.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Effort: {feature.effortDays} days</span>
                          <span>Target: {feature.targetUsers.substring(0, 50)}...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No feature ideas yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first feature idea to start forecasting ROI
                </p>
                <Button asChild>
                  <Link href="/features/new">
                    <a className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Feature
                    </a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
