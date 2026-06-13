import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetRoom, getGetRoomQueryKey, 
  useListMessages, getListMessagesQueryKey, 
  useSendMessage, useDeleteRoom 
} from "@workspace/api-client-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@workspace/replit-auth-web";
import { Hash, Send, Settings, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function RoomView() {
  const { id } = useParams();
  const roomId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: room, isLoading: isLoadingRoom, error } = useGetRoom(roomId, { query: { queryKey: getGetRoomQueryKey(roomId), enabled: !!roomId } });
  
  // We use the hook to fetch initial messages. The websocket hook will also listen.
  const { data: initialMessages, isLoading: isLoadingMessages } = useListMessages(roomId, { query: { queryKey: getListMessagesQueryKey(roomId), enabled: !!roomId } });
  
  const { messages: wsMessages, onlineCount, isConnected } = useWebSocket(roomId);
  const sendMessage = useSendMessage();
  const deleteRoom = useDeleteRoom();

  // Combine initial messages + WS messages, deduped by ID
  const messages = useMemo(() => {
    const all = [...(initialMessages || []), ...wsMessages];
    const unique = new Map();
    all.forEach(m => unique.set(m.id, m));
    return Array.from(unique.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [initialMessages, wsMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Channel not found</div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessage.mutate(
      { roomId, data: { content: content.trim() } },
      {
        onSuccess: () => {
          setContent("");
        },
        onError: () => {
          toast({ title: "Failed to send message", variant: "destructive" });
        }
      }
    );
  };

  const handleDeleteRoom = () => {
    deleteRoom.mutate({ roomId }, {
      onSuccess: () => {
        toast({ title: "Channel deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
        setLocation("/rooms");
      },
      onError: () => {
        toast({ title: "Failed to delete channel", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-bold text-base leading-tight truncate">
              {isLoadingRoom ? <Skeleton className="h-5 w-32" /> : room?.name}
            </h2>
            {room?.description && (
              <p className="text-xs text-muted-foreground truncate leading-tight">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/50">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {onlineCount} {onlineCount === 1 ? 'user' : 'users'}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoadingMessages ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-12" /></div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium text-foreground">Welcome to #{room?.name}</p>
            <p className="text-sm">This is the start of the channel.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showHeader = index === 0 || messages[index - 1].userId !== msg.userId || new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 5 * 60 * 1000;
            
            return (
              <div key={msg.id} className={`group flex gap-4 ${showHeader ? 'mt-6' : 'mt-1'}`}>
                {showHeader ? (
                  <Avatar className="w-10 h-10 mt-0.5 border border-border shadow-sm">
                    <AvatarImage src={msg.user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {msg.user.firstName?.[0] || msg.user.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 flex-shrink-0 text-right opacity-0 group-hover:opacity-100 select-none">
                    <span className="text-[10px] text-muted-foreground pr-1">{format(new Date(msg.createdAt), "HH:mm")}</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {msg.user.firstName ? `${msg.user.firstName} ${msg.user.lastName || ''}` : msg.user.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  )}
                  <div className="text-[15px] leading-relaxed break-words text-foreground/90 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-border flex-shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end bg-card border border-border shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-xl overflow-hidden transition-all">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={room ? `Message #${room.name}` : "Type a message..."}
            className="border-0 focus-visible:ring-0 rounded-none bg-transparent shadow-none px-4 py-3 h-auto min-h-[52px]"
            disabled={sendMessage.isPending || !isConnected}
          />
          <div className="p-2 flex-shrink-0">
            <Button 
              type="submit" 
              size="icon" 
              disabled={!content.trim() || sendMessage.isPending || !isConnected}
              className={`h-9 w-9 rounded-lg transition-all ${content.trim() ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <div className="px-1 pt-2 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <span>{isConnected ? "Connected" : "Reconnecting..."}</span>
          <span>Press Enter to send</span>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{room?.name}</strong> channel and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
