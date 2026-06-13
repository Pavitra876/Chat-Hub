import { useAuth } from "@workspace/replit-auth-web";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Activity } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/rooms" />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Chatter</h1>
          <p className="text-xl text-muted-foreground font-medium">
            Clean, focused communication.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <Zap className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Real-time WebSocket sync</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-semibold">High Signal</h3>
            <p className="text-sm text-muted-foreground">Dense, readable terminal UI</p>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <Button 
            size="lg" 
            className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all"
            onClick={() => login()}
          >
            Enter Chatter
          </Button>
        </div>
      </div>
    </div>
  );
}
