import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePostHog, AnalyticsEvents } from "@/lib/posthog-provider";

interface BankIDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: { personalNumber: string; name: string }) => void;
}

export function BankIDDialog({ open, onOpenChange, onSuccess }: BankIDDialogProps) {
  const [status, setStatus] = useState<"idle" | "pending" | "completed" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const { toast } = useToast();
  const { trackEvent } = usePostHog();

  useEffect(() => {
    let statusInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!referenceId || status !== "pending") return;

      try {
        const response = await fetch(`/api/mock-bankid/status/${referenceId}`, {
          method: "POST",
        });
        const data = await response.json();

        if (data.status === "completed") {
          setStatus("completed");
          onSuccess(data);
          toast({
            title: "BankID Verifisert",
            description: "Din identitet er nå bekreftet",
          });
          onOpenChange(false);
        }
      } catch (error) {
        console.error("Error checking BankID status:", error);
        setStatus("error");
        toast({
          title: "Feil",
          description: "Kunne ikke verifisere BankID",
          variant: "destructive",
        });
      }
    };

    if (status === "pending") {
      statusInterval = setInterval(checkStatus, 2000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [referenceId, status, onSuccess, onOpenChange, toast]);

  const handleInitiateBankID = async () => {
    setStatus("pending");
    
    // Spor BankID-oppstart
    trackEvent(AnalyticsEvents.BANKID_START, {
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    });
    
    try {
      const response = await fetch("/api/mock-bankid/init", {
        method: "POST",
      });
      const data = await response.json();
      setReferenceId(data.referenceId);
    } catch (error) {
      console.error("Error initiating BankID:", error);
      setStatus("error");
      
      // Spor BankID-feil
      trackEvent(AnalyticsEvents.BANKID_FAILURE, {
        error_type: 'initialization_error',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Feil",
        description: "Kunne ikke starte BankID-pålogging",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>BankID Pålogging</DialogTitle>
          <DialogDescription>
            Start BankID-pålogging på din mobil eller med kodebrikke
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {status === "idle" && (
            <Button onClick={handleInitiateBankID} className="w-full">
              Start BankID
            </Button>
          )}

          {status === "pending" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                Venter på BankID-bekreftelse...
              </p>
              <p className="text-xs text-muted-foreground">
                Følg instruksjonene på din mobil eller bruk kodebrikke
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">
                Det oppstod en feil med BankID-påloggingen
              </p>
              <Button onClick={handleInitiateBankID} variant="outline">
                Prøv igjen
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
