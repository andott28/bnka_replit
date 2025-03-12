import { useQuery } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { LoanApplication } from "@shared/schema";

export default function Dashboard() {
  const { data: loans, isLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans"],
  });

  const formatNOK = (value: number) => {
    return new Intl.NumberFormat('nb-NO').format(value) + " NOK";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Min Konto</h1>
          <Link href="/apply">
            <Button>Søk om nytt lån</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {loans?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">
                  Du har ingen lånesøknader ennå.
                </p>
              </CardContent>
            </Card>
          ) : (
            loans?.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Lånesøknad #{loan.id}</CardTitle>
                    <Badge
                      variant={
                        loan.status === "approved"
                          ? "secondary"
                          : loan.status === "rejected"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {loan.status === "approved" ? "GODKJENT" : 
                       loan.status === "rejected" ? "AVSLÅTT" : 
                       loan.status === "pending" ? "UNDER BEHANDLING" : 
                       loan.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beløp:</span>
                      <span className="font-medium">
                        {formatNOK(loan.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formål:</span>
                      <span className="font-medium">{loan.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Innsendt:</span>
                      <span className="font-medium">
                        {new Date(loan.submittedAt).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}