import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Send,
  History,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getMembershipTiers } from "@/lib/membershipTiers";
import {
  getAdminSmsAudiences,
  getAdminSmsBroadcasts,
  getAdminSmsStats,
  type AdminSmsSendStats,
  queueAdminSmsBroadcast,
} from "@/lib/api";

type SmsAudienceTier = {
  tierId: string;
  count: number;
};

type SmsAudienceSummary = {
  totalRecipients: number;
  expiredRecipients: number;
  tiers: SmsAudienceTier[];
};

type SmsBroadcastJob = {
  id: number;
  targetType: "all" | "tier" | "expired";
  targetValue: string | null;
  message: string;
  status: string;
  totalRecipients: number;
  processedCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
};

const QUICK_TEMPLATES: Record<string, string> = {
  custom: "",
  welcome:
    "Hello {{name}}, welcome to Fasil Kenema FC. Your membership ID is {{membership_id}}.",
  renewal:
    "Hello {{name}}, your {{tier}} membership is due for renewal soon. Please renew on time.",
  update:
    "Hello {{name}}, important club update for {{tier}} members. Thank you for supporting Fasil Kenema FC.",
  event:
    "Hello {{name}}, you are invited to the upcoming club event as a {{tier}} member. Show membership ID {{membership_id}} at entry.",
};

function formatTierName(tierId: string): string {
  return tierId
    .replace(/-level$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTemplateMessage(
  templateKey: string,
  tierLabelForTemplate: string,
): string {
  const base = QUICK_TEMPLATES[templateKey] ?? "";
  if (!base) return "";
  return base.replace(/\{\{tier\}\}/gi, tierLabelForTemplate);
}

function broadcastTargetLabel(
  job: SmsBroadcastJob,
  tierNameById: Record<string, string>,
): string {
  if (job.targetType === "all") return "All active members";
  if (job.targetType === "expired") return "Expired members";
  return (
    tierNameById[String(job.targetValue)] ??
    formatTierName(String(job.targetValue ?? ""))
  );
}

function broadcastStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("failed")) return "text-red-700 border-red-200 bg-red-50";
  if (s.includes("processing") || s.includes("queued"))
    return "text-amber-800 border-amber-200 bg-amber-50";
  if (s.includes("completed"))
    return "text-green-700 border-green-200 bg-green-50";
  return "text-zinc-700 border-zinc-200 bg-zinc-50";
}

export default function AdminSMS() {
  const [targetType, setTargetType] = useState<"all" | "tier" | "expired">(
    "all",
  );
  const [targetTier, setTargetTier] = useState<string>("");
  const [template, setTemplate] = useState<string>("custom");
  const [message, setMessage] = useState<string>("");
  const [audiences, setAudiences] = useState<SmsAudienceSummary>({
    totalRecipients: 0,
    expiredRecipients: 0,
    tiers: [],
  });
  const [broadcasts, setBroadcasts] = useState<SmsBroadcastJob[]>([]);
  const [tierNameById, setTierNameById] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [smsStats, setSmsStats] = useState<AdminSmsSendStats | null>(null);

  const selectedAudienceCount = useMemo(() => {
    if (targetType === "all") {
      return audiences.totalRecipients;
    }
    if (targetType === "expired") {
      return audiences.expiredRecipients;
    }
    return audiences.tiers.find((t) => t.tierId === targetTier)?.count ?? 0;
  }, [audiences, targetTier, targetType]);

  const selectedTierLabel = useMemo(() => {
    if (targetType === "tier" && targetTier) {
      return tierNameById[targetTier] ?? formatTierName(targetTier);
    }
    return "your membership tier";
  }, [targetTier, targetType, tierNameById]);

  const previewMessage = useMemo(() => {
    return message
      .replace(/\{\{name\}\}/gi, "Abebe Kebede")
      .replace(/\{\{membership_id\}\}/gi, "FK-000123")
      .replace(/\{\{tier\}\}/gi, selectedTierLabel);
  }, [message, selectedTierLabel]);

  const characterCount = message.length;

  async function loadData() {
    setError("");
    try {
      const [audienceData, jobs, tiers, stats] = await Promise.all([
        getAdminSmsAudiences(),
        getAdminSmsBroadcasts(),
        getMembershipTiers(),
        getAdminSmsStats(),
      ]);
      setAudiences({
        totalRecipients: Number(audienceData?.totalRecipients ?? 0),
        expiredRecipients: Number(audienceData?.expiredRecipients ?? 0),
        tiers: Array.isArray(audienceData?.tiers) ? audienceData.tiers : [],
      });
      setBroadcasts(Array.isArray(jobs) ? jobs : []);
      if (stats && typeof stats.delivered === "number") {
        setSmsStats(stats);
      } else {
        setSmsStats(null);
      }
      if (Array.isArray(tiers)) {
        const map: Record<string, string> = {};
        for (const tier of tiers) {
          map[tier.id] = tier.name || formatTierName(String(tier.id));
        }
        setTierNameById(map);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load SMS data",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => {
      void loadData();
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (template !== "custom") {
      setMessage(buildTemplateMessage(template, selectedTierLabel));
    }
  }, [template, selectedTierLabel]);

  async function handleQueueBroadcast() {
    setError("");
    setSuccess("");

    if (!message.trim()) {
      setError("Message body is required.");
      return;
    }
    if (targetType === "tier" && !targetTier) {
      setError("Please select a membership tier.");
      return;
    }
    if (selectedAudienceCount <= 0) {
      setError("No members found in the selected audience.");
      return;
    }

    setIsSending(true);
    try {
      const response = await queueAdminSmsBroadcast({
        targetType,
        targetValue: targetType === "tier" ? targetTier : undefined,
        message: message.trim(),
      });

      if (response?.error) {
        setError(String(response.error));
        return;
      }

      setSuccess(
        `Broadcast queued successfully for ${selectedAudienceCount} recipient(s).`,
      );
      setTemplate("custom");
      setMessage("");
      await loadData();
    } catch (queueError) {
      setError(
        queueError instanceof Error
          ? queueError.message
          : "Failed to queue broadcast",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
              SMS & Communications
            </h1>
            <p className="text-muted-foreground">
              Broadcast to members and view delivery totals from the SMS log.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <Card className="border-zinc-200 bg-zinc-50/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              SMS delivered (all time)
            </CardTitle>
            <CardDescription>
              Total messages the gateway accepted successfully — OTP, new-member
              welcome, donation thanks, office payment alerts, and broadcasts —
              each success is one row in{" "}
              <span className="font-mono text-xs">sms_logs</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {smsStats ? (
              <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm max-w-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Delivered
                </p>
                <p className="mt-2 text-4xl font-bold font-mono tabular-nums text-green-700">
                  {smsStats.delivered}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Failed attempts are not included here; only confirmed sends
                  are counted.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Could not load SMS statistics. Refresh to try again.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3 min-w-0">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Broadcast
                </CardTitle>
                <CardDescription>
                  Send SMS updates to member segments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {success ? (
                  <p className="text-sm text-green-700">{success}</p>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={
                      targetType === "all"
                        ? "all"
                        : targetType === "expired"
                          ? "expired"
                          : `tier:${targetTier}`
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setTargetType("all");
                        return;
                      }
                      if (value === "expired") {
                        setTargetType("expired");
                        setTargetTier("");
                        return;
                      }
                      const selectedTierId = value.replace("tier:", "");
                      setTargetType("tier");
                      setTargetTier(selectedTierId);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Active Members ({audiences.totalRecipients})
                      </SelectItem>
                      <SelectItem value="expired">
                        All Expired Members ({audiences.expiredRecipients})
                      </SelectItem>
                      {audiences.tiers.map((tier) => (
                        <SelectItem
                          key={tier.tierId}
                          value={`tier:${tier.tierId}`}
                        >
                          {tierNameById[tier.tierId] ??
                            formatTierName(tier.tierId)}{" "}
                          ({tier.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Estimated recipients:{" "}
                    <span className="font-medium">{selectedAudienceCount}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Message Template
                  </label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Message</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="renewal">Renewal Notice</SelectItem>
                      <SelectItem value="update">Club Update</SelectItem>
                      <SelectItem value="event">Event Invitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Message Body</label>
                    <span className="text-xs text-muted-foreground">
                      {characterCount}/459 characters
                    </span>
                  </div>
                  <Textarea
                    placeholder="Type your message here... Use {{name}} for personalization."
                    className="min-h-[120px]"
                    value={message}
                    maxLength={459}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables:{" "}
                    {"{{name}}, {{membership_id}}, {{tier}}"}
                  </p>
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-medium text-zinc-700 mb-1">
                      Live Preview (sample member)
                    </p>
                    <p className="text-xs text-zinc-600 whitespace-pre-wrap">
                      {previewMessage ||
                        "Your personalized preview will appear here."}
                    </p>
                    <p className="mt-2 text-[11px] text-zinc-500">
                      At send time, each recipient gets their own real name,
                      membership ID, and tier.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 font-display uppercase tracking-wider"
                    disabled={isSending || isLoading}
                    onClick={() => void handleQueueBroadcast()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Queueing..." : "Queue Broadcast"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent broadcasts
                </CardTitle>
                <CardDescription>
                  Queued jobs and how many messages were delivered to members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {broadcasts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    No broadcasts yet.
                  </p>
                ) : (
                  broadcasts.map((job) => {
                    const delivered = Number(job.sentCount ?? 0);
                    const total = Number(job.totalRecipients ?? 0);
                    const preview = String(job.message ?? "")
                      .trim()
                      .replace(/\s+/g, " ");
                    const shortPreview =
                      preview.length > 120
                        ? `${preview.slice(0, 117)}…`
                        : preview;
                    return (
                      <div
                        key={job.id}
                        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm space-y-2"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-zinc-900">
                              #{job.id} ·{" "}
                              {broadcastTargetLabel(job, tierNameById)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(job.createdAt).toLocaleString(
                                undefined,
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                },
                              )}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={broadcastStatusBadgeClass(job.status)}
                          >
                            {job.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        {shortPreview ? (
                          <p className="text-sm text-zinc-600 leading-snug border-l-2 border-zinc-200 pl-3">
                            {shortPreview}
                          </p>
                        ) : null}
                        <p className="text-sm font-medium text-green-700 tabular-nums">
                          {delivered} delivered
                          {total > 0 ? ` of ${total} recipients` : ""}
                          {job.status.toLowerCase().includes("processing") ||
                          job.status.toLowerCase().includes("queued")
                            ? " (in progress)"
                            : ""}
                        </p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-white">
              <CardHeader>
                <CardTitle className="text-white">Audience Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold font-mono mb-2">
                  {audiences.totalRecipients}
                </div>
                <p className="text-white/80 text-sm">
                  Active members with valid phones
                </p>
                <p className="text-white/80 text-xs mt-1">
                  Expired members: {audiences.expiredRecipients}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audiences.tiers.map((tier) => (
                  <div
                    key={tier.tierId}
                    className="flex items-center justify-between p-2 rounded border border-zinc-100"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {tierNameById[tier.tierId] ??
                          formatTierName(tier.tierId)}
                      </span>
                    </div>
                    <Badge variant="secondary">{tier.count}</Badge>
                  </div>
                ))}
                {audiences.tiers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tier audience data.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
