import { useQuery } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { LoanApplication } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { data: loans, isLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans"],
  });
  const { logoutMutation } = useAuth();

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
        <h1 className="text-3xl font-bold mb-8">Min Side</h1>

        {/* Kontooversikt */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontooversikt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500">Total Saldo</h3>
                  <p className="text-2xl font-semibold text-green-600">0 NOK</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Tilgjengelig Kreditt</h3>
                  <p className="text-2xl font-semibold">0 NOK</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Neste Forfallsdato</h3>
                  <p className="text-2xl font-semibold">Ingen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaksjonslogg */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksjonslogg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-500 text-center py-4">
                  Ingen transaksjoner å vise
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lånesøknader */}
          <Card>
            <CardHeader>
              <CardTitle>Mine Lånesøknader</CardTitle>
            </CardHeader>
            <CardContent>
              {loans?.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Du har ingen lånesøknader ennå
                </p>
              ) : (
                <div className="space-y-4">
                  {loans?.map((loan) => (
                    <div key={loan.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">Lånesøknad #{loan.id}</p>
                        <p className="text-sm text-gray-500">{formatNOK(loan.amount)}</p>
                      </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logg ut knapp */}
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="mt-4"
          >
            {logoutMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Logg ut
          </Button>
        </div>
      </main>
    </div>
  );
}