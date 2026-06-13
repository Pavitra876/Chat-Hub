import { useListRooms, getListRoomsQueryKey, useGetRoomsSummary, getGetRoomsSummaryQueryKey, useListOnlineUsers, getListOnlineUsersQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Hash, Users, MessageSquareText, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RoomsList() {
  const { data: rooms, isLoading: isLoadingRooms } = useListRooms({ query: { queryKey: getListRoomsQueryKey() } });
  const { data: summary, isLoading: isLoadingSummary } = useGetRoomsSummary({ query: { queryKey: getGetRoomsSummaryQueryKey() } });
  const { data: onlineUsers, isLoading: isLoadingUsers } = useListOnlineUsers({ query: { queryKey: getListOnlineUsersQueryKey() } });

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl font-bold mb-6">Directory</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Channels</p>
                <p className="text-2xl font-bold">
                  {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : summary?.totalRooms || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Messages</p>
                <p className="text-2xl font-bold">
                  {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : summary?.totalMessages?.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Online Users</p>
                <p className="text-2xl font-bold">
                  {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : summary?.onlineUsers || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            Available Channels
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoadingRooms ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : rooms?.length === 0 ? (
              <div className="col-span-2 text-center p-8 bg-muted/20 border border-dashed border-border rounded-xl">
                <Hash className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No channels exist yet. Create one from the sidebar.</p>
              </div>
            ) : (
              rooms?.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer shadow-sm group">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center gap-1 group-hover:text-primary transition-colors">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        {room.name}
                      </CardTitle>
                      {room.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {room.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquareText className="w-3.5 h-3.5" />
                        {room.messageCount} msgs
                      </span>
                      {room.lastMessageAt && (
                        <span>Last active {new Date(room.lastMessageAt).toLocaleDateString()}</span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            Who's Online
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {isLoadingUsers ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))
            ) : onlineUsers?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No one else is online.</p>
            ) : (
              onlineUsers?.map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm border border-border">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-background">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate max-w-[120px]">
                    {user.firstName ? `${user.firstName}` : user.email?.split("@")[0]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
