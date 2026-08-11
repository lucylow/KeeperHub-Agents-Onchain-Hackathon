import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, CheckCircle, FileText, HelpCircle, History as HistoryIcon, LayoutDashboard, Loader2, Play, Settings, ShieldCheck, SlidersHorizontal, Wallet, ClipboardCheck } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { DCAExecution } from "@shared/types";
import { useLocation } from "wouter";

function GuestResultsPreview() {
  const previewRows = [
    { time: "Today, 12:00", strategy: "ETH DCA Agent", amount: "$100 USDC", status: "Verified", hash: "0x8a4f...2c91" },
    { time: "Yesterday, 12:00", strategy: "ETH DCA Agent", amount: "$100 USDC", status: "Verified", hash: "0x3db1...7e20" },
    { time: "Aug 08, 12:00", strategy: "ETH DCA Agent", amount: "$100 USDC", status: "Verified", hash: "0x9ef2...1a44" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></div><div><div className="font-semibold">KeeperHub Guard Bot</div><div className="text-xs text-muted-foreground">Public results preview</div></div></div>
          <Button onClick={() => startLogin()} className="rounded-full bg-primary px-5 text-primary-foreground">Sign in for live data</Button>
        </div>
      </header>
      <main className="mx-auto max-w-[1220px] space-y-6 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-[0.2em] text-primary">Public preview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">KeeperHub execution results</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">A read-only product preview. Sign in to connect your own wallet, configure DCA, and execute protected workflows.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" />Illustrative preview data</span></div>
        <div className="grid gap-4 md:grid-cols-3"><Card className="border-border/70 bg-card/90"><CardHeader><CardTitle className="text-sm font-medium">Agent status</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2 text-2xl font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(105,214,153,0.9)]" />Ready</div><p className="mt-1 text-xs text-muted-foreground">KeeperHub workflow available</p></CardContent></Card><Card className="border-border/70 bg-card/90"><CardHeader><CardTitle className="text-sm font-medium">Executions</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">24</div><p className="mt-1 text-xs text-primary">+12.4% strategy completion</p></CardContent></Card><Card className="border-border/70 bg-card/90"><CardHeader><CardTitle className="text-sm font-medium">Tracked volume</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">$2,400</div><p className="mt-1 text-xs text-muted-foreground">Illustrative DCA activity</p></CardContent></Card></div>
        <Card className="border-border/70 bg-card/90"><CardHeader><CardTitle>Recent execution results</CardTitle><CardDescription>Read-only examples of the results view available after authentication.</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Strategy</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Transaction</TableHead></TableRow></TableHeader><TableBody>{previewRows.map((row) => <TableRow key={row.hash}><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{row.time}</TableCell><TableCell>{row.strategy}</TableCell><TableCell>{row.amount}</TableCell><TableCell><Badge className="border-primary/30 bg-primary/10 text-primary">{row.status}</Badge></TableCell><TableCell className="text-right font-mono text-xs text-primary">{row.hash}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><Card className="border-border/70 bg-card/90"><CardHeader><CardTitle>Guarded execution flow</CardTitle><CardDescription>From strategy trigger to audit record.</CardDescription></CardHeader><CardContent><div className="space-y-4">{["Strategy validated", "Gas estimate calculated", "MEV-protected route selected", "Transaction submitted", "ERC-8004 audit record created"].map((step, index) => <div key={step} className="flex items-center gap-3 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs text-primary">{index + 1}</span><span>{step}</span><CheckCircle className="ml-auto h-4 w-4 text-primary" /></div>)}</div></CardContent></Card><Card className="border-primary/25 bg-primary/[0.06]"><CardHeader><CardTitle>Want your live results?</CardTitle><CardDescription>Protected execution and account-specific data remain behind authentication.</CardDescription></CardHeader><CardContent><Button onClick={() => startLogin()} className="w-full rounded-full bg-primary text-primary-foreground">Continue to private workspace <ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div>
      </main>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const [location] = useLocation();
  const utils = trpc.useUtils();

  const [selectedExecution, setSelectedExecution] = useState<DCAExecution | null>(null);
  const [activeTab, setActiveTab] = useState(location.includes("history") ? "history" : location.includes("configuration") ? "config" : location.includes("audit-trail") ? "audit" : "dashboard");

  React.useEffect(() => {
    if (location.includes("history")) setActiveTab("history");
    else if (location.includes("configuration")) setActiveTab("config");
    else if (location.includes("audit-trail")) setActiveTab("audit");
    else if (location.includes("dashboard") || location === "/app") setActiveTab("dashboard");
  }, [location]);

  // Queries
  const { data: status } = trpc.dca.status.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });
  const { data: config } = trpc.dca.config.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: history, isLoading: historyLoading } = trpc.dca.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: wallet, isLoading: walletLoading } = trpc.dca.wallet.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: auditTrail } = trpc.dca.auditTrail.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: onboarding } = trpc.dca.onboarding.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const updateConfigMutation = trpc.dca.config.update.useMutation({
    onSuccess: () => {
      toast.success("Configuration updated successfully");
      utils.dca.config.get.invalidate();
      utils.dca.status.invalidate();
    },
    onError: (err: { message: string }) => {
      toast.error(`Failed to update config: ${err.message}`);
    },
  });

  const executeMutation = trpc.dca.execute.useMutation({
    onSuccess: (res: { response: { success: boolean; error?: string } }) => {
      if (res.response.success) {
        toast.success("DCA Execution landed successfully!");
      } else {
        toast.error(`Execution failed: ${res.response.error}`);
      }
      utils.dca.history.invalidate();
      utils.dca.wallet.invalidate();
      utils.dca.onboarding.status.invalidate();
    },
    onError: (err: { message: string }) => {
      toast.error(`Execution error: ${err.message}`);
    },
  });

  const resetOnboardingMutation = trpc.dca.onboarding.reset.useMutation({
    onSuccess: () => {
      toast.success("Onboarding status reset");
      utils.dca.onboarding.status.invalidate();
    },
  });

  // Local form state for config
  const [amount, setAmount] = useState<string>("25");
  const [tokenOut, setTokenOut] = useState<string>("WETH");
  const [frequency, setFrequency] = useState<"hourly" | "daily" | "weekly">("daily");
  const [slippageBps, setSlippageBps] = useState<string>("50");
  const [maxGasGwei, setMaxGasGwei] = useState<string>("20");
  const [paused, setPaused] = useState<boolean>(false);

  React.useEffect(() => {
    if (config) {
      setAmount(String(config.amount));
      setTokenOut(config.tokenOut);
      setFrequency(config.frequency);
      setSlippageBps(String(config.slippageBps));
      setMaxGasGwei(String(config.maxGasGwei));
      setPaused(config.paused);
    }
  }, [config]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate({
      amount: parseFloat(amount) || 25,
      tokenOut,
      frequency,
      slippageBps: parseInt(slippageBps, 10) || 50,
      maxGasGwei: parseFloat(maxGasGwei) || 20,
      paused,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GuestResultsPreview />;
  }

  // Chart data preparation
  const successCount = (history || []).filter((item: DCAExecution) => item.status === "success").length;
  const failedCount = (history || []).filter((item: DCAExecution) => item.status !== "success").length;
  const totalInvested = (history || []).reduce((sum: number, item: DCAExecution) => sum + Number(item.amount || 0), 0);

  const chartData = (history || [])
    .slice()
    .reverse()
    .map((item: DCAExecution, index: number) => ({
      index: index + 1,
      price: item.executedPrice,
      timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

  const pageMeta = activeTab === "history"
    ? { eyebrow: "Execution records", title: "Execution history", description: "Every DCA cycle the agent has run, with on-chain transaction proof." }
    : activeTab === "config"
      ? { eyebrow: "Strategy controls", title: "Configuration", description: "Adjust the parameters the keeper uses for every DCA cycle." }
      : activeTab === "audit"
        ? { eyebrow: "ERC-8004 observability", title: "Audit trail", description: "Verifiable records for every successful and failed agent action." }
        : { eyebrow: "KGB dashboard", title: "Good morning, operator.", description: "Monitor your KeeperHub DCA agent status and executions." };

  return (
    <div className="min-h-screen flex bg-background/40">
      <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-card/50 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border/70 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_22px_rgba(105,214,153,0.22)]"><ShieldCheck className="h-5 w-5" /></div>
          <div><div className="font-semibold tracking-tight">KeeperHub</div><div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Guard Bot</div></div>
        </div>
        <div className="flex items-center gap-2 px-5 py-5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(105,214,153,0.9)]" />Agent running</div>
        <nav className="space-y-1 px-3 text-sm">
          {[["dashboard", "Dashboard", LayoutDashboard], ["history", "Executions", HistoryIcon], ["audit", "Audit Trail", ClipboardCheck], ["config", "Configuration", SlidersHorizontal]].map(([value, label, Icon]) => <button key={value as string} onClick={() => setActiveTab(value as string)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeTab === value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}><Icon className="h-4 w-4" />{label as string}</button>)}
        </nav>
        <div className="mt-6 border-t border-border/70 px-3 pt-5 text-sm">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"><Settings className="h-4 w-4" />Settings</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"><FileText className="h-4 w-4" />Documentation</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"><HelpCircle className="h-4 w-4" />Help</button>
        </div>
        <div className="mt-auto border-t border-border/70 p-4"><div className="rounded-xl bg-muted/60 p-3"><div className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-primary" />KeeperHub Agent</div><div className="mt-1 text-xs text-muted-foreground font-mono truncate">0x3e73...e6Fc</div><div className="mt-1 text-[10px] text-primary">MCP: app.keeperhub.com/mcp</div></div></div>
      </aside>
      <div className="min-w-0 flex-1 flex flex-col">
      {/* Top Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 min-h-16 py-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_22px_rgba(105,214,153,0.22)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="truncate font-bold text-sm sm:text-lg leading-none">KeeperHub Guard Bot</h1>
            <span className="hidden text-xs text-muted-foreground sm:block">Autonomous DCA & guarded onchain execution</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${status?.isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="font-medium text-xs">{status?.isRunning ? "Agent Active" : "Agent Paused"}</span>
          </div>

          <Button
            onClick={() => executeMutation.mutate()}
            disabled={executeMutation.isPending || status?.isRunning === false}
            size="sm"
            className="gap-2 px-3 font-semibold sm:px-4"
          >
            {executeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            <span className="hidden sm:inline">Execute DCA Now</span>
            <span className="sm:hidden">Run</span>
          </Button>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Onboarding & Wallet Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance (Base)</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${walletLoading ? "..." : wallet?.baseUSDC?.toFixed(2) ?? "0.00"} <span className="text-xs text-muted-foreground font-normal">USDC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ETH for gas: {wallet?.baseETH?.toFixed(4) ?? "0.0000"} ETH {wallet?.gasSponsored && <span className="text-primary font-medium">(Sponsored)</span>}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Status</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={onboarding?.step === "firstTxLanded" ? "default" : "secondary"}>
                  {onboarding?.step?.toUpperCase() ?? "FUNDING"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {onboarding?.step === "funding" ? "Fund USDC & ETH to enable execution" : "Ready for automated DCA intervals"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execution Metrics</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{history?.length ?? 0} <span className="text-xs text-muted-foreground font-normal">Swaps Executed</span></div><p className="text-xs text-muted-foreground mt-1">Frequency: {config?.frequency ?? "daily"} &bull; Amount: ${config?.amount ?? 25}</p></CardContent>
          </Card>
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Successful</CardTitle><ShieldCheck className="h-4 w-4 text-primary" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{successCount}</div><p className="text-xs text-primary mt-1">Verified outcomes</p></CardContent>
          </Card>
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Failed</CardTitle><Activity className="h-4 w-4 text-destructive" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{failedCount}</div><p className="text-xs text-muted-foreground mt-1">Requires review</p></CardContent>
          </Card>
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total invested</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">${totalInvested.toFixed(0)}</div><p className="text-xs text-muted-foreground mt-1">Persisted DCA volume</p></CardContent>
          </Card>
        </div>

        <div className="mb-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{pageMeta.eyebrow}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{pageMeta.title}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{pageMeta.description}</p></div>
          {activeTab === "dashboard" && <Button onClick={() => executeMutation.mutate()} disabled={executeMutation.isPending || status?.isRunning === false} className="gap-2 self-start rounded-full bg-primary px-5 text-primary-foreground sm:self-auto"><Play className="h-4 w-4 fill-current" /> Execute now</Button>}
        </div>
        {/* Tabs for Dashboard, History, Config, Audit Trail */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex w-full max-w-full overflow-x-auto bg-card/80 border border-border/70 p-1 lg:hidden">
            <TabsTrigger className="min-w-fit flex-1" value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger className="min-w-fit flex-1" value="history">History</TabsTrigger>
            <TabsTrigger className="min-w-fit flex-1" value="config">Configuration</TabsTrigger>
            <TabsTrigger className="min-w-fit flex-1" value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Execution Chart */}
              <Card className="lg:col-span-2 border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base">Execution activity</CardTitle>
                  <CardDescription>Historical DCA execution prices for {config?.tokenOut || "WETH"} on Base</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} width={34} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" }} />
                        <Area type="monotone" dataKey="price" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Guard telemetry is ready</p>
                        <p className="mt-1 text-xs">Trigger a DCA execution to populate onchain activity.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Config & Controls */}
              <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
                <CardHeader>
                  <CardTitle>Agent Control</CardTitle>
                  <CardDescription>Quick status and manual overrides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div>
                      <div className="font-medium text-sm">Agent Status</div>
                      <div className="text-xs text-muted-foreground">{paused ? "Paused (No cron ticks)" : "Active & Running"}</div>
                    </div>
                    <Switch
                      checked={!paused}
                      onCheckedChange={(checked) => {
                        setPaused(!checked);
                        updateConfigMutation.mutate({ paused: !checked });
                      }}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-sm font-medium">Active Strategy</div>
                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg space-y-1">
                      <div>Target Token: <span className="font-semibold">{config?.tokenOut}</span></div>
                      <div>Amount: <span className="font-semibold">${config?.amount} USDC</span></div>
                      <div>Frequency: <span className="font-semibold capitalize">{config?.frequency}</span></div>
                      <div>Slippage: <span className="font-semibold">{config?.slippageBps ? config.slippageBps / 100 : 0.5}%</span></div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => resetOnboardingMutation.mutate()}
                  >
                    Reset Onboarding Demo State
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history">
            <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Complete log of automated and manual DCA swap executions</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : history && history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Gas Used</TableHead>
                        <TableHead className="text-right">Tx / Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((item: DCAExecution) => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedExecution(item)}>
                          <TableCell className="text-xs">{new Date(item.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "success" ? "default" : "destructive"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${item.amount} USDC</TableCell>
                          <TableCell>{item.tokenOut}</TableCell>
                          <TableCell>${item.executedPrice?.toLocaleString()}</TableCell>
                          <TableCell>{item.gasUsed ? `${item.gasUsed.toLocaleString()} gas` : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            {item.txHash ? (
                              <a
                                href={`https://basescan.org/tx/${item.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline text-xs font-mono"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">{item.error || "Failed"}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No execution records found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONFIGURATION TAB */}
          <TabsContent value="config">
            <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>DCA Strategy Configuration</CardTitle>
                <CardDescription>Adjust swap parameters, frequency, and safety limits</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">DCA Amount (USDC)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenOut">Target Token</Label>
                    <Select value={tokenOut} onValueChange={setTokenOut}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WETH">WETH (Wrapped Ether)</SelectItem>
                        <SelectItem value="cbBTC">cbBTC (Coinbase Wrapped BTC)</SelectItem>
                        <SelectItem value="AERO">AERO (Aerodrome)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Execution Frequency</Label>
                    <Select value={frequency} onValueChange={(v: "hourly" | "daily" | "weekly") => setFrequency(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slippage">Slippage Tolerance (BPS)</Label>
                      <Input
                        id="slippage"
                        type="number"
                        value={slippageBps}
                        onChange={(e) => setSlippageBps(e.target.value)}
                        required
                      />
                      <span className="text-xs text-muted-foreground">50 BPS = 0.5%</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxGas">Max Gas Price (Gwei)</Label>
                      <Input
                        id="maxGas"
                        type="number"
                        value={maxGasGwei}
                        onChange={(e) => setMaxGasGwei(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Pause Agent</Label>
                      <div className="text-xs text-muted-foreground">Temporarily halt automated cron execution</div>
                    </div>
                    <Switch checked={paused} onCheckedChange={setPaused} />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={updateConfigMutation.isPending}>
                    {updateConfigMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save Configuration
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUDIT TRAIL TAB */}
          <TabsContent value="audit">
            <Card className="border-border/70 bg-card/90 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/30">
              <CardHeader>
                <CardTitle>ERC-8004 Audit Trail</CardTitle>
                <CardDescription>Verifiable on-chain audit records logging every agent action and simulation result</CardDescription>
              </CardHeader>
              <CardContent>
                {auditTrail && auditTrail.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead className="text-right">Tx / Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditTrail.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-xs">{new Date(record.timestamp).toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-xs">{record.action}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === "success" ? "outline" : "destructive"}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{record.trigger || "SYSTEM"}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {record.txHash ? record.txHash.slice(0, 10) + "..." : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No audit records found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Execution Detail Modal */}
      <Dialog open={!!selectedExecution} onOpenChange={(open) => !open && setSelectedExecution(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>ID: {selectedExecution?.id}</DialogDescription>
          </DialogHeader>
          {selectedExecution && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-medium">{new Date(selectedExecution.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={selectedExecution.status === "success" ? "default" : "destructive"}>
                  {selectedExecution.status}
                </Badge>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Amount Swapped:</span>
                <span className="font-medium">${selectedExecution.amount} USDC</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Target Token:</span>
                <span className="font-medium">{selectedExecution.tokenOut}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Executed Price:</span>
                <span className="font-medium">${selectedExecution.executedPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Gas Used:</span>
                <span className="font-medium">{selectedExecution.gasUsed?.toLocaleString()} units</span>
              </div>
              {selectedExecution.txHash && (
                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-muted-foreground text-xs">Transaction Hash:</span>
                  <a
                    href={`https://basescan.org/tx/${selectedExecution.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-mono text-xs break-all"
                  >
                    {selectedExecution.txHash}
                  </a>
                </div>
              )}
              {selectedExecution.error && (
                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-destructive text-xs font-semibold">Error Message:</span>
                  <p className="text-xs bg-destructive/10 text-destructive p-2 rounded font-mono">
                    {selectedExecution.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
