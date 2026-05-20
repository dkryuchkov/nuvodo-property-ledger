"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Building2 className="w-10 h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Nuvodo Property Ledger
            </CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to manage your property portfolio and financial reporting
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 text-base border-input hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center gap-3"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            Securely managed by Firebase & Google Cloud
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
