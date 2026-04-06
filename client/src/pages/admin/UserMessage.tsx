import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/lib/context";
import { useQuery } from "@tanstack/react-query";
import { Mail, Search, User, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

type UserMessage = {
  id: number;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminUserMessage() {
  const { token } = useApp();
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

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;

    return messages.filter((message) => {
      return (
        message.fullName.toLowerCase().includes(q) ||
        message.email.toLowerCase().includes(q) ||
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
              placeholder="Search by name, email, subject, or message..."
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
            {filteredMessages.map((message) => (
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
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Mail className="mr-1 h-3.5 w-3.5" />
                          {message.email}
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
