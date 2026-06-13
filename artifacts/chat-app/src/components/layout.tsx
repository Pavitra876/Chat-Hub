import { useAuth } from "@workspace/replit-auth-web";
import { Link, useLocation, useRoute } from "wouter";
import { MessageSquare, Hash, LogOut, Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useListRooms, getListRoomsQueryKey } from "@workspace/api-client-react";
import { CreateRoomDialog } from "./create-room-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [match] = useRoute("/rooms/:id");
  const { data: rooms, isLoading: isLoadingRooms } = useListRooms({ query: { queryKey: getListRoomsQueryKey() } });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading) return null;
  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Chatter</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2 px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Channels</span>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {isLoadingRooms ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))
            ) : rooms?.length === 0 ? (
              <div className="px-2 text-sm text-muted-foreground">No channels yet</div>
            ) : (
              rooms?.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    match && window.location.pathname.endsWith(`/${room.id}`)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Hash className="w-4 h-4 opacity-70" />
                  <span className="truncate">{room.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}
              </div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-8 justify-start text-muted-foreground" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>

      <CreateRoomDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
