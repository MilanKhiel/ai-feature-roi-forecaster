import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BarChart3, Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFeatureFormSchema, type CreateFeatureFormData } from "@shared/validation";
import { toast } from "sonner";

export default function FeatureNew() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [orgId, setOrgId] = useState<number | null>(null);

  const getOrCreateOrg = trpc.organizations.getOrCreate.useMutation();
  const createFeature = trpc.features.create.useMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFeatureFormData>({
    resolver: zodResolver(createFeatureFormSchema),
    defaultValues: {
      pricingPlans: [],
    },
  });

  const featureType = watch("type");

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

  const onSubmit = async (data: CreateFeatureFormData) => {
    if (!orgId) {
      toast.error("Organization not found");
      return;
    }

    try {
      const result = await createFeature.mutateAsync({
        orgId,
        title: data.title,
        type: data.type,
        problem: data.problem,
        targetUsers: data.targetUsers,
        effortDays: data.effortDays,
        constraints: data.constraints,
        pricingPlans: data.pricingPlans,
        arpa: data.arpa,
        monthlyActiveAccounts: data.monthlyActiveAccounts,
        trialToPaid: data.trialToPaid,
        churnMonthly: data.churnMonthly,
        supportTicketsMonthly: data.supportTicketsMonthly,
      });

      toast.success("Feature created successfully");
      setLocation(`/features/${result.featureId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create feature");
    }
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
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create Feature Idea</CardTitle>
              <CardDescription>
                Describe your feature idea to generate an ROI forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced Analytics Dashboard"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Feature Type *</Label>
                  <Select
                    onValueChange={(value) => setValue("type", value as any)}
                    value={featureType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="activation">Activation</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="monetization">Monetization</SelectItem>
                      <SelectItem value="support_cost">Support Cost</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problem">Problem Description *</Label>
                  <Textarea
                    id="problem"
                    placeholder="What problem does this feature solve?"
                    rows={4}
                    {...register("problem")}
                  />
                  {errors.problem && (
                    <p className="text-sm text-destructive">{errors.problem.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetUsers">Target Users *</Label>
                  <Textarea
                    id="targetUsers"
                    placeholder="Who will benefit from this feature?"
                    rows={3}
                    {...register("targetUsers")}
                  />
                  {errors.targetUsers && (
                    <p className="text-sm text-destructive">{errors.targetUsers.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effortDays">Effort (Days) *</Label>
                  <Input
                    id="effortDays"
                    type="number"
                    placeholder="e.g., 14"
                    {...register("effortDays", { valueAsNumber: true })}
                  />
                  {errors.effortDays && (
                    <p className="text-sm text-destructive">{errors.effortDays.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints (Optional)</Label>
                  <Textarea
                    id="constraints"
                    placeholder="Any technical, security, or regulatory constraints?"
                    rows={3}
                    {...register("constraints")}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Baseline Metrics (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arpa">ARPA ($)</Label>
                      <Input
                        id="arpa"
                        type="number"
                        step="0.01"
                        placeholder="Average revenue per account"
                        {...register("arpa", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyActiveAccounts">Monthly Active Accounts</Label>
                      <Input
                        id="monthlyActiveAccounts"
                        type="number"
                        placeholder="Number of active accounts"
                        {...register("monthlyActiveAccounts", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trialToPaid">Trial to Paid (%)</Label>
                      <Input
                        id="trialToPaid"
                        type="number"
                        step="0.01"
                        placeholder="Conversion rate"
                        {...register("trialToPaid", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="churnMonthly">Monthly Churn (%)</Label>
                      <Input
                        id="churnMonthly"
                        type="number"
                        step="0.01"
                        placeholder="Monthly churn rate"
                        {...register("churnMonthly", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supportTicketsMonthly">Monthly Support Tickets</Label>
                      <Input
                        id="supportTicketsMonthly"
                        type="number"
                        placeholder="Number of tickets"
                        {...register("supportTicketsMonthly", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting || !orgId}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Feature"
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">
                      <a>Cancel</a>
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
