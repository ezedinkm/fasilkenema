import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Search,
  Send,
  Users,
  UserMinus,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

type SubscriberStatus = "all" | "active" | "unsubscribed";

interface NewsletterSubscriber {
  id: number;
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface SubscriberResponse {
  subscribers: NewsletterSubscriber[];
  page: number;
  pageSize: number;
  total: number;
  activeCount: number;
  unsubscribedCount: number;
}

async function readJsonResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof result.error === "string" ? result.error : "Request failed.",
    );
  }
  return result;
}

export default function AdminNewsletter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<SubscriberStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const subscribersQuery = useQuery<SubscriberResponse>({
    queryKey: ["newsletterSubscribers", page, status, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        status,
        search: debouncedSearch,
      });
      const response = await fetchWithAuth(
        `/api/admin/newsletter/subscribers?${params.toString()}`,
      );
      return readJsonResponse(response) as Promise<SubscriberResponse>;
    },
  });

  const subscribers = subscribersQuery.data?.subscribers ?? [];
  const activeVisibleIds = useMemo(
    () =>
      subscribers
        .filter((subscriber) => subscriber.status === "active")
        .map((subscriber) => subscriber.id),
    [subscribers],
  );
  const allVisibleSelected =
    activeVisibleIds.length > 0 &&
    activeVisibleIds.every((id) => selectedIds.has(id));
  const pageCount = Math.max(
    1,
    Math.ceil((subscribersQuery.data?.total ?? 0) / (subscribersQuery.data?.pageSize ?? 50)),
  );

  const unsubscribeMutation = useMutation({
    mutationFn: async (subscriberIds: number[]) => {
      const response = await fetchWithAuth("/api/admin/newsletter/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ subscriberIds }),
      });
      return readJsonResponse(response) as Promise<{ updated: number }>;
    },
    onSuccess: (result) => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["newsletterSubscribers"] });
      toast({
        title: "Subscribers updated",
        description: `${result.updated} active subscriber${result.updated === 1 ? "" : "s"} unsubscribed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Could not update subscribers",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (input: {
      subscriberIds: number[];
      subject: string;
      body: string;
    }) => {
      const response = await fetchWithAuth("/api/admin/newsletter/send", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return readJsonResponse(response) as Promise<{
        sent: number;
        failed: number;
        skipped: number;
      }>;
    },
    onSuccess: (result) => {
      setSelectedIds(new Set());
      setSubject("");
      setMessage("");
      toast({
        title: result.failed ? "Email sent with some failures" : "Email sent",
        description: `${result.sent} sent${result.failed ? `, ${result.failed} failed` : ""}${result.skipped ? `, ${result.skipped} no longer active` : ""}.`,
        variant: result.failed ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Could not send email",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleSubscriber = (id: number, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleVisibleSubscribers = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      activeVisibleIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const sendSelectedMessage = () => {
    if (!subject.trim() || !message.trim() || selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Send this email to ${selectedIds.size} selected active subscriber(s)?`,
      )
    ) {
      return;
    }
    sendMutation.mutate({
      subscriberIds: Array.from(selectedIds),
      subject: subject.trim(),
      body: message.trim(),
    });
  };

  const unsubscribeSelected = () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Unsubscribe ${selectedIds.size} selected subscriber(s)? They will remain in the list as unsubscribed.`,
      )
    ) {
      return;
    }
    unsubscribeMutation.mutate(Array.from(selectedIds));
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const changeStatus = (value: SubscriberStatus) => {
    setStatus(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-red-700">
              Email communication
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Newsletter subscribers
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review signups, choose recipients, and send a message. Emails go out individually and include an unsubscribe link.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedIds(new Set());
              setSearch("");
              setStatus("all");
              setPage(1);
              subscribersQuery.refetch();
            }}
            disabled={subscribersQuery.isFetching}
          >
            {subscribersQuery.isFetching && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Refresh list
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-xl bg-red-50 p-3 text-red-700">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Total subscribers</p>
                <p className="text-2xl font-bold">
                  {subscribersQuery.data
                    ? subscribersQuery.data.activeCount +
                      subscribersQuery.data.unsubscribedCount
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{subscribersQuery.data?.activeCount ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-xl bg-zinc-100 p-3 text-zinc-600">
                <UserMinus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Unsubscribed</p>
                <p className="text-2xl font-bold">{subscribersQuery.data?.unsubscribedCount ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-red-700" />
              Compose a message
            </CardTitle>
            <CardDescription>
              {selectedIds.size
                ? `${selectedIds.size} subscriber(s) selected`
                : "Select active subscribers below to choose who receives this email."}
              {" "}Each recipient receives a separate email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-subject">Subject</Label>
              <Input
                id="newsletter-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={180}
                placeholder="A message from Fasil Kenema S.C."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newsletter-message">Message</Label>
              <Textarea
                id="newsletter-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={10000}
                placeholder="Write your message to subscribers…"
                className="min-h-36"
              />
              <p className="text-right text-xs text-muted-foreground">
                {message.length}/10,000
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
                disabled={selectedIds.size === 0 || sendMutation.isPending}
              >
                Clear selection
              </Button>
              <Button
                onClick={sendSelectedMessage}
                disabled={
                  selectedIds.size === 0 ||
                  !subject.trim() ||
                  !message.trim() ||
                  sendMutation.isPending
                }
              >
                {sendMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to {selectedIds.size || "selected"} subscribers
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Subscriber list</CardTitle>
                <CardDescription className="mt-1">
                  Only active subscribers can be selected for email.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={search}
                    onChange={(event) => changeSearch(event.target.value)}
                    placeholder="Search subscriber email"
                    className="pl-9 pr-16"
                    aria-label="Search subscribers by email"
                  />
                  {search.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2"
                      onClick={() => changeSearch("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Select
                  value={status}
                  onValueChange={(value) => changeStatus(value as SubscriberStatus)}
                >
                  <SelectTrigger aria-label="Filter subscribers by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-zinc-50 p-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(checked) =>
                    toggleVisibleSubscribers(checked === true)
                  }
                  disabled={activeVisibleIds.length === 0}
                />
                Select active subscribers on this page
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={unsubscribeSelected}
                disabled={
                  selectedIds.size === 0 ||
                  unsubscribeMutation.isPending ||
                  sendMutation.isPending
                }
              >
                {unsubscribeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="mr-2 h-4 w-4" />
                )}
                Unsubscribe selected
              </Button>
            </div>

            {subscribersQuery.isLoading ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : subscribersQuery.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {subscribersQuery.error instanceof Error
                  ? subscribersQuery.error.message
                  : "Could not load subscribers."}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                No subscribers match this filter yet.
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(subscriber.id)}
                        disabled={subscriber.status !== "active"}
                        onCheckedChange={(checked) =>
                          toggleSubscriber(subscriber.id, checked === true)
                        }
                        aria-label={`Select ${subscriber.email}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">
                          {subscriber.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        subscriber.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {subscriber.status === "active" ? "Active" : "Unsubscribed"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {subscribersQuery.data?.total ?? 0} result(s) · Page {page} of {pageCount}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || subscribersQuery.isFetching}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page >= pageCount || subscribersQuery.isFetching}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
