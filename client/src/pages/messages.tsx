import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

export default function MessagesPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allMessages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 5000,
  });

  const { data: clients } = useQuery<SafeUser[]>({
    queryKey: ["/api/clients"],
    enabled: isAdmin,
  });

  const { data: adminUsers } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin-users"],
    enabled: !isAdmin,
  });

  const { data: conversation, isLoading: convLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content,
        projectId: null,
      });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send message", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (selectedUserId) {
      apiRequest("POST", `/api/messages/read/${selectedUserId}`).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    }
  }, [selectedUserId, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (!selectedUserId && !isAdmin && adminUsers && adminUsers.length > 0) {
      setSelectedUserId(adminUsers[0].id);
    }
  }, [selectedUserId, isAdmin, adminUsers]);

  const contactList: { id: string; name: string; company?: string | null; lastMessage?: string; unreadCount: number }[] = [];

  if (isAdmin && clients) {
    clients.forEach(c => {
      const msgs = allMessages?.filter(m =>
        (m.senderId === c.id && m.receiverId === user?.id) ||
        (m.senderId === user?.id && m.receiverId === c.id)
      ) || [];
      const unread = msgs.filter(m => m.senderId === c.id && !m.read).length;
      const lastMsg = [...msgs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      contactList.push({
        id: c.id,
        name: c.fullName,
        company: c.company,
        lastMessage: lastMsg?.content,
        unreadCount: unread,
      });
    });
  } else if (!isAdmin && adminUsers) {
    adminUsers.forEach(admin => {
      const msgs = allMessages?.filter(m =>
        (m.senderId === admin.id && m.receiverId === user?.id) ||
        (m.senderId === user?.id && m.receiverId === admin.id)
      ) || [];
      const unread = msgs.filter(m => m.senderId === admin.id && !m.read).length;
      const lastMsg = [...msgs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      contactList.push({
        id: admin.id,
        name: admin.fullName,
        company: admin.company,
        lastMessage: lastMsg?.content,
        unreadCount: unread,
      });
    });
  }

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    sendMutation.mutate(newMessage.trim());
  };

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? "Communicate with your clients" : "Send messages to the LA Webservices team"}
          </p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <Card className="w-72 shrink-0 flex flex-col">
            <CardContent className="p-3 flex-1 overflow-auto">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-2">Conversations</p>
              <div className="space-y-1">
                {contactList.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedUserId(contact.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedUserId === contact.id ? "bg-accent" : ""
                    }`}
                    data-testid={`button-conversation-${contact.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        {contact.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          {contact.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        {contact.company && <p className="text-[10px] text-muted-foreground">{contact.company}</p>}
                        {contact.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.lastMessage}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-sm">
                    {contactList.find(c => c.id === selectedUserId)?.name || "Conversation"}
                  </p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {convLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                      </div>
                    ) : (
                      conversation?.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] px-4 py-2.5 rounded-lg text-sm ${
                                isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent text-accent-foreground"
                              }`}
                              data-testid={`message-${msg.id}`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      data-testid="input-message"
                    />
                    <Button type="submit" size="icon" disabled={sendMutation.isPending || !newMessage.trim()} data-testid="button-send-message">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
