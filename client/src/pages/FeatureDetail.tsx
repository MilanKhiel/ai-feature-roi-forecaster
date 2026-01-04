import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getLoginUrl } from "@/const";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvidenceFormSchema, type CreateEvidenceFormData } from "@shared/validation";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function FeatureDetail() {
  const [, params] = useRoute("/features/:id");
  const featureId = params?.id ? parseInt(params.id) : null;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedForecastId, setSelectedForecastId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: feature, isLoading: featureLoading } = trpc.features.getById.useQuery(
    { featureId: featureId! },
    { enabled: featureId !== null }
  );

  const { data: evidence, isLoading: evidenceLoading } = trpc.evidence.list.useQuery(
    { featureId: featureId! },
    { enabled: featureId !== null }
  );

  const { data: forecasts, isLoading: forecastsLoading } = trpc.forecasts.list.useQuery(
    { featureId: featureId! },
    { enabled: featureId !== null }
  );

  const { data: selectedForecast } = trpc.forecasts.getById.useQuery(
    { forecastId: selectedForecastId! },
    { enabled: selectedForecastId !== null }
  );

  const createEvidence = trpc.evidence.create.useMutation();
  const deleteEvidence = trpc.evidence.delete.useMutation();
  const generateForecast = trpc.forecasts.generate.useMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEvidenceFormData>({
    resolver: zodResolver(createEvidenceFormSchema),
  });

  const sourceType = watch("sourceType");

  if (authLoading || featureLoading) {
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

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Feature not found</p>
      </div>
    );
  }

  const onSubmitEvidence = async (data: CreateEvidenceFormData) => {
    try {
      await createEvidence.mutateAsync({
        featureId: featureId!,
        sourceType: data.sourceType,
        content: data.content,
        link: data.link,
      });

      toast.success("Evidence added");
      reset();
      utils.evidence.list.invalidate({ featureId: featureId! });
    } catch (error: any) {
      toast.error(error.message || "Failed to add evidence");
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    try {
      await deleteEvidence.mutateAsync({ evidenceId });
      toast.success("Evidence deleted");
      utils.evidence.list.invalidate({ featureId: featureId! });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete evidence");
    }
  };

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    try {
      const result = await generateForecast.mutateAsync({ featureId: featureId! });
      toast.success("Forecast generated successfully");
      utils.forecasts.list.invalidate({ featureId: featureId! });
      setSelectedForecastId(result.forecastId);
      setActiveTab("forecasts");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate forecast");
    } finally {
      setIsGenerating(false);
    }
  };

  const displayForecast = selectedForecast || (forecasts && forecasts.length > 0 ? forecasts[0] : null);

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
        <div className="container max-w-6xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Link>
          </Button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{feature.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{feature.type}</Badge>
                <span className="text-sm text-muted-foreground">
                  {feature.effortDays} days effort
                </span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleGenerateForecast}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="evidence">
                Evidence ({evidence?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="forecasts">
                Forecasts ({forecasts?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{feature.problem}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{feature.targetUsers}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Success Metric:</span>
                      <p className="text-muted-foreground">{feature.successMetric}</p>
                    </div>
                    {feature.constraints && (
                      <div>
                        <span className="text-sm font-medium">Constraints:</span>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {feature.constraints}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {feature.baselineMetrics && Object.keys(feature.baselineMetrics).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Baseline Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {feature.baselineMetrics.arpa !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm">ARPA:</span>
                          <span className="font-medium">${feature.baselineMetrics.arpa}</span>
                        </div>
                      )}
                      {feature.baselineMetrics.monthlyActiveAccounts !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Active Accounts:</span>
                          <span className="font-medium">
                            {feature.baselineMetrics.monthlyActiveAccounts}
                          </span>
                        </div>
                      )}
                      {feature.baselineMetrics.trialToPaid !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm">Trial to Paid:</span>
                          <span className="font-medium">
                            {feature.baselineMetrics.trialToPaid}%
                          </span>
                        </div>
                      )}
                      {feature.baselineMetrics.churnMonthly !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Churn:</span>
                          <span className="font-medium">
                            {feature.baselineMetrics.churnMonthly}%
                          </span>
                        </div>
                      )}
                      {feature.baselineMetrics.supportTicketsMonthly !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm">Support Tickets:</span>
                          <span className="font-medium">
                            {feature.baselineMetrics.supportTicketsMonthly}/mo
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Evidence</CardTitle>
                  <CardDescription>
                    Attach supporting data to strengthen your forecast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitEvidence)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceType">Source Type *</Label>
                      <Select
                        onValueChange={(value) => setValue("sourceType", value as any)}
                        value={sourceType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ticket">Support Ticket</SelectItem>
                          <SelectItem value="sales_call">Sales Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sourceType && (
                        <p className="text-sm text-destructive">{errors.sourceType.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Describe the evidence..."
                        rows={4}
                        {...register("content")}
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive">{errors.content.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link">Link (Optional)</Label>
                      <Input
                        id="link"
                        type="url"
                        placeholder="https://..."
                        {...register("link")}
                      />
                      {errors.link && (
                        <p className="text-sm text-destructive">{errors.link.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={createEvidence.isPending}>
                      {createEvidence.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Evidence
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {evidenceLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : evidence && evidence.length > 0 ? (
                <div className="space-y-4">
                  {evidence.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">
                              {item.sourceType}
                            </Badge>
                            <CardDescription className="whitespace-pre-wrap">
                              {item.content}
                            </CardDescription>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                              >
                                View source <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvidence(item.id)}
                            disabled={deleteEvidence.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No evidence added yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="forecasts" className="space-y-6">
              {forecastsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayForecast ? (
                <>
                  {forecasts && forecasts.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Forecast History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {forecasts.map((f) => (
                            <Button
                              key={f.id}
                              variant={selectedForecastId === f.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setSelectedForecastId(f.id)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {new Date(f.createdAt).toLocaleDateString()} - ROI: {f.roiScore}
                                </span>
                                <Badge variant="secondary">{f.confidence}</Badge>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">ROI Forecast</CardTitle>
                          <CardDescription>
                            Generated on {new Date(displayForecast.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-primary">
                            {displayForecast.roiScore}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {displayForecast.confidence} Confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Impact Ranges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Low
                          </div>
                          <div className="text-2xl font-bold">
                            {displayForecast.impactLow.value} {displayForecast.impactLow.unit}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {displayForecast.impactLow.explanation}
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 border-primary">
                          <div className="text-sm font-medium text-primary mb-1">Mid</div>
                          <div className="text-2xl font-bold text-primary">
                            {displayForecast.impactMid.value} {displayForecast.impactMid.unit}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {displayForecast.impactMid.explanation}
                          </p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            High
                          </div>
                          <div className="text-2xl font-bold">
                            {displayForecast.impactHigh.value} {displayForecast.impactHigh.unit}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {displayForecast.impactHigh.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Key Assumptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayForecast.assumptions.map((assumption, idx) => (
                          <div key={idx} className="border-l-2 border-primary pl-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{assumption.assumption}</span>
                              <Badge variant="outline">
                                {Math.round(assumption.probability * 100)}% likely
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {assumption.rationale}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Validate: </span>
                              {assumption.validation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayForecast.risks.map((risk, idx) => (
                          <div key={idx} className="border-l-2 border-destructive pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{risk.risk}</span>
                              <Badge variant="destructive">{risk.severity}</Badge>
                              <Badge variant="outline">{risk.likelihood} likelihood</Badge>
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">Mitigation: </span>
                              {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Cheaper Alternatives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayForecast.alternatives.map((alt, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{alt.alternative}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Why cheaper: </span>
                              {alt.whyCheaper}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Tradeoff: </span>
                              {alt.tradeoff}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Validation Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayForecast.validationPlan.map((plan, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{plan.experiment}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline">Time: {plan.timeCost}</Badge>
                                <Badge variant="outline">Cost: {plan.moneyCost}</Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">Steps:</span>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1">
                                  {plan.steps.map((step, stepIdx) => (
                                    <li key={stepIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                              <div>
                                <span className="text-sm font-medium">Success threshold: </span>
                                <span className="text-sm text-muted-foreground">
                                  {plan.successThreshold}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Decision Memo</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                      <Streamdown>{displayForecast.decisionMemoMd}</Streamdown>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No forecasts yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Generate your first forecast to see ROI predictions
                    </p>
                    <Button onClick={handleGenerateForecast} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Forecast
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
