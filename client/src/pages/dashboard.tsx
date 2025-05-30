import { useQuery, useMutation } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Settings, User, Lock, Trash2, Sun, Moon } from "lucide-react";
import { Link } from "wouter";
import type { LoanApplication } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePostHog, AnalyticsEvents } from "@/lib/posthog-provider";
import { CreditScoreWidget } from "@/components/credit-score-widget";

export default function Dashboard() {
  const { data: loans, isLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans"],
  });
  const { logoutMutation, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { trackEvent } = usePostHog();
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: typeof userInfo) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil oppdatert",
        description: "Din brukerinformasjon har blitt oppdatert",
      });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere brukerinformasjon",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-[#FAFAFA]">Min Side</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Verifiseringsstatus */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Identitetsverifisering</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {user?.kycStatus === 'verified' ? (
                  <>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                      Verifisert med BankID
                    </Badge>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Din identitet er bekreftet via BankID</p>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">Ikke verifisert</Badge>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Du kan verifisere din identitet ved å søke om lån eller gå til kontoinnstillinger
                    </p>
                    <Link to="/loan-application">
                      <Button variant="outline" size="sm">
                        Verifiser nå
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Kontooversikt */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Kontooversikt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Saldo</h3>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-500">0 NOK</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Tilgjengelig Kreditt</h3>
                  <p className="text-2xl font-semibold dark:text-white">0 NOK</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Neste Forfallsdato</h3>
                  <p className="text-2xl font-semibold dark:text-white">Ingen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mine Lån */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mine Lån</CardTitle>
              {loans?.length === 0 && <CardDescription>Du har ingen aktive lån</CardDescription>}
              {loans && loans.length > 0 && <CardDescription>Dine lånesøknader ({loans.length})</CardDescription>}
            </CardHeader>
            <CardContent className={loans && loans.length > 0 ? "max-h-[400px] overflow-y-auto" : ""}>
              {loans?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Du har ingen lånesøknader ennå
                  </p>
                  <Link to="/loan-application">
                    <Button>
                      Søk om lån
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans?.map((loan) => (
                    <div 
                      key={loan.id} 
                      className="flex justify-between items-center border-b pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      <div>
                        <p className="font-medium dark:text-white">Lånesøknad #{loan.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatNOK(loan.amount)}</p>
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

          {/* Konto-informasjon */}
          <Card>
            <CardHeader>
              <CardTitle>Konto-informasjon</CardTitle>
              <CardDescription>Rediger din personlige informasjon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">E-post</label>
                  <Input
                    value={user?.username}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">Fornavn</label>
                  <Input
                    name="firstName"
                    value={userInfo.firstName}
                    onChange={handleInputChange}
                    placeholder="Ditt fornavn"
                    className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">Etternavn</label>
                  <Input
                    name="lastName"
                    value={userInfo.lastName}
                    onChange={handleInputChange}
                    placeholder="Ditt etternavn"
                    className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">Telefonnummer</label>
                  <Input
                    name="phoneNumber"
                    value={userInfo.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Ditt telefonnummer"
                    className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder:text-gray-500"
                  />
                </div>
                <Button 
                  onClick={() => updateUserMutation.mutate(userInfo)}
                  disabled={!hasChanges || updateUserMutation.isPending}
                  className="w-full"
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Oppdater informasjon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Min Kredittvurdering */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Min Kredittvurdering</CardTitle>
              <CardDescription>Din siste kredittvurdering basert på lånesøknader</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !loans || loans.length === 0 ? (
                <div className="text-center space-y-4 py-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    Du har ingen kredittvurdering ennå. Søk om lån for å få en analyse av din kredittverdighet.
                  </p>
                  <Link to="/loan-application">
                    <Button>
                      Søk om lån nå
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <CreditScoreWidget />
                  <div className="text-right">
                    <Link to="/credit-score-result">
                      <Button variant="outline" size="sm">
                        Se full rapport
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kredittkort */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mine Kredittkort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
                <p className="text-gray-600 dark:text-gray-400">Du har ingen kredittkort hos oss ennå</p>
                <Button className="w-full max-w-md">
                  Søk om kredittkort nå
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaksjoner */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaksjonslogg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
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
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 dark:text-gray-300" />
                    <span className="dark:text-gray-300">Tema</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 dark:text-gray-300" />
                    <span className="dark:text-gray-300">Endre passord</span>
                  </div>
                  <Button variant="outline">Endre</Button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div 
                    className="flex items-center gap-2 cursor-pointer w-full" 
                    onClick={() => {
                      setShowDeleteDialog(true);
                      trackEvent(AnalyticsEvents.OPEN_MODAL, {
                        modal_type: 'delete_account',
                        user_id: user?.id
                      });
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Slett konto</span>
                  </div>
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

      {/* Slett konto dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Slett konto</DialogTitle>
            <DialogDescription>
              Dette er en permanent handling. Alle dine data vil bli slettet fra våre systemer og kan ikke gjenopprettes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 border-t border-b my-4">
            <h3 className="font-medium mb-2">Før du fortsetter, vær oppmerksom på:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-red-100 p-1 mt-0.5">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <span>Alle dine personlige data vil bli permanent slettet</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-red-100 p-1 mt-0.5">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <span>Du vil miste all tilgang til dine bankkontoer og tjenester</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-red-100 p-1 mt-0.5">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <span>Eventuelle utestående betalinger eller overføringer må fullføres før sletting</span>
              </li>
            </ul>
          </div>
          
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                trackEvent(AnalyticsEvents.BUTTON_CLICK, {
                  action: 'cancel_account_deletion',
                  user_id: user?.id
                });
              }}
              className="sm:flex-1"
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Utfør slettingen (implementeres senere)
                toast({
                  title: "Konto sletting",
                  description: "Denne funksjonaliteten er ikke implementert ennå.",
                });
                
                // Spor slettingsforsøket i analyse
                trackEvent(AnalyticsEvents.BUTTON_CLICK, {
                  action: 'confirm_account_deletion',
                  user_id: user?.id
                });
                
                setShowDeleteDialog(false);
              }}
              className="sm:flex-1"
            >
              Bekreft sletting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}