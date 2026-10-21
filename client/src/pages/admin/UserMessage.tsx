import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/lib/context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, Search, User, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type UserMessageStatus = "needs_contact" | "contacted" | "rejected";

type UserMessage = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: UserMessageStatus;
  createdAt: string;
};

const STATUS_LABELS: Record<UserMessageStatus, string> = {
  needs_contact: "Needs contact",
  contacted: "Contacted",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<UserMessageStatus, string> = {
  needs_contact: "border-amber-200 bg-amber-50 text-amber-800",
  contacted: "border-green-200 bg-green-50 text-green-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

export default function AdminUserMessage() {
  const { token } = useApp();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery<UserMessage[]>({
    queryKey: ["/api/admin/usermessages"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch("/api/admin/usermessages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user messages");
      }
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: UserMessageStatus;
    }) => {
      const response = await fetch(
        `/api/admin/usermessages/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not update message status");
      }
      return result;
    },
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/usermessages"] });
      toast({
        title: "Status updated",
        description: STATUS_LABELS[variables.status],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;

    return messages.filter((message) => {
      return (
        message.fullName.toLowerCase().includes(q) ||
        message.phone.toLowerCase().includes(q) ||
        (message.email ?? "").toLowerCase().includes(q) ||
        message.subject.toLowerCase().includes(q) ||
        message.message.toLowerCase().includes(q)
      );
    });
  }, [messages, search]);

  return (
    <AdminLayout>
      <div className="space-y-6 min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
              User Messages
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View and track contact messages submitted by users.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            Total: {messages.length}
          </Badge>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Search Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, subject, or message..."
              className="h-11"
              data-testid="input-search-user-messages"
            />
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading user messages...
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-200 bg-red-50/40 shadow-sm">
            <CardContent className="py-12 text-center text-red-600">
              Failed to fetch user messages. Please refresh and try again.
            </CardContent>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              No messages found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => {
              const status = message.status || "needs_contact";
              return (
                <Card
                  key={message.id}
                  className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-zinc-100 text-zinc-700 border-zinc-200"
                        >
                          <User className="mr-1 h-3.5 w-3.5" />
                          {message.fullName}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Phone className="mr-1 h-3.5 w-3.5" />
                          {message.phone || "No phone recorded"}
                        </Badge>
                        {message.email && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Mail className="mr-1 h-3.5 w-3.5" />
                            {message.email}
                          </Badge>
                        )}
                          <Badge
                            variant="outline"
                            className={STATUS_STYLES[status]}
                          >
                            {STATUS_LABELS[status]}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {message.subject}
                        </h3>
                      </div>

                      <Badge
                        variant="outline"
                        className="w-fit text-zinc-600 border-zinc-300"
                      >
                        <CalendarDays className="mr-1 h-3.5 w-3.5" />
                        {new Date(message.createdAt).toLocaleString()}
                      </Badge>
                    </div>

                    <ScrollArea className="mt-4 max-h-44 rounded-md border border-zinc-100 bg-zinc-50/70 p-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                        {message.message}
                      </p>
                    </ScrollArea>

                    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-zinc-600">
                        Follow-up status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "needs_contact" ? "default" : "outline"}
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: message.id,
                              status: "needs_contact",
                            })
                          }
                        >
                          Need to contact
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "contacted" ? "default" : "outline"}
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: message.id,
                              status: "contacted",
                            })
                          }
                        >
                          Mark contacted
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "rejected" ? "destructive" : "outline"}
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: message.id,
                              status: "rejected",
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
