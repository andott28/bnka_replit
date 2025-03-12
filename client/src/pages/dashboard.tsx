import { useQuery } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Settings, User, Lock, Trash2, Sun, Moon } from "lucide-react";
import { Link } from "wouter";
import type { LoanApplication } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";

export default function Dashboard() {
  const { data: loans, isLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans"],
  });
  const { logoutMutation, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

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

        <div className="grid gap-6">
          {/* Kontooversikt */}
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

          {/* Mine Lån */}
          <Card>
            <CardHeader>
              <CardTitle>Mine Lån</CardTitle>
            </CardHeader>
            <CardContent>
              {loans?.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Du har ingen lånesøknader ennå
                </p>
              ) : (
                <div className="space-y-4">
                  {loans?.map((loan) => (
                    <div 
                      key={loan.id} 
                      className="flex justify-between items-center border-b pb-4 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      onClick={() => setSelectedLoan(loan)}
                    >
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

          {/* Min Kredittvurdering */}
          <Card>
            <CardHeader>
              <CardTitle>Min Kredittvurdering</CardTitle>
              <CardDescription>Kommer snart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Kredittvurdering vil være tilgjengelig i neste oppdatering</p>
              </div>
            </CardContent>
          </Card>

          {/* Kredittkort */}
          <Card>
            <CardHeader>
              <CardTitle>Mine Kredittkort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600">Du har ingen kredittkort hos oss ennå</p>
                <Button className="w-full max-w-md">
                  Søk om kredittkort nå
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaksjoner */}
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

          {/* Innstillinger */}
          <Card>
            <CardHeader>
              <CardTitle>Innstillinger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    <span>Tema</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <span>Endre passord</span>
                  </div>
                  <Button variant="outline">Endre</Button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">Slett konto</span>
                  </div>
                  <Button variant="destructive">Slett</Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="w-full"
                >
                  {logoutMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Logg ut
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Lånedetaljer Modal */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lånedetaljer #{selectedLoan?.id}</DialogTitle>
            <DialogDescription>
              Søknad sendt {selectedLoan && new Date(selectedLoan.submittedAt).toLocaleDateString('nb-NO')}
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Lånebeløp</p>
                  <p className="font-medium">{formatNOK(selectedLoan.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={
                      selectedLoan.status === "approved"
                        ? "secondary"
                        : selectedLoan.status === "rejected"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {selectedLoan.status === "approved" ? "GODKJENT" : 
                     selectedLoan.status === "rejected" ? "AVSLÅTT" : 
                     selectedLoan.status === "pending" ? "UNDER BEHANDLING" : 
                     selectedLoan.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Formål</p>
                  <p className="font-medium">{selectedLoan.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oppgitt årsinntekt</p>
                  <p className="font-medium">{formatNOK(selectedLoan.income)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ansettelsesforhold</p>
                  <p className="font-medium">{selectedLoan.employmentStatus}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}