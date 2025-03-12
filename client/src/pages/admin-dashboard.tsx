import { useQuery, useMutation } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users, CreditCard, BarChart } from "lucide-react";
import type { LoanApplication, User } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: loans = [], isLoading: loansLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans/all"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      loanId,
      status,
    }: {
      loanId: number;
      status: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/loans/${loanId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans/all"] });
      toast({
        title: "Status oppdatert",
        description: "Lånesøknadens status er oppdatert.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredLoans = loans?.filter((loan) => {
    const matchesSearch =
      search === "" ||
      loan.purpose.toLowerCase().includes(search.toLowerCase()) ||
      loan.id.toString().includes(search);

    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loansLoading || usersLoading) {
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
        <h1 className="text-3xl font-bold mb-6">Administrasjonspanel</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Totalt antall lånesøknader
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loans.length}</div>
              <p className="text-xs text-muted-foreground">
                {loans.filter(l => l.status === "pending").length} under behandling
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registrerte brukere
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.kycStatus === "pending").length} venter på KYC
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total lånesum
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('nb-NO').format(
                  loans.reduce((sum, loan) => sum + loan.amount, 0)
                )} NOK
              </div>
              <p className="text-xs text-muted-foreground">
                Fordelt på {loans.length} søknader
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="loans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="loans">Lånesøknader</TabsTrigger>
            <TabsTrigger value="users">Brukere</TabsTrigger>
          </TabsList>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Administrasjon av lånesøknader</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Søk på ID eller formål..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer på status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statuser</SelectItem>
                      <SelectItem value="pending">Under behandling</SelectItem>
                      <SelectItem value="approved">Godkjent</SelectItem>
                      <SelectItem value="rejected">Avslått</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Bruker</TableHead>
                        <TableHead>Beløp</TableHead>
                        <TableHead>Formål</TableHead>
                        <TableHead>Inntekt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Innsendt</TableHead>
                        <TableHead>Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans?.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>#{loan.id}</TableCell>
                          <TableCell>
                            {users.find(u => u.id === loan.userId)?.username}
                          </TableCell>
                          <TableCell>{new Intl.NumberFormat('nb-NO').format(loan.amount)} NOK</TableCell>
                          <TableCell>{loan.purpose}</TableCell>
                          <TableCell>{new Intl.NumberFormat('nb-NO').format(loan.income)} NOK</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            {new Date(loan.submittedAt).toLocaleDateString('nb-NO')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    loanId: loan.id,
                                    status: "approved",
                                  })
                                }
                                disabled={
                                  loan.status === "approved" ||
                                  updateStatusMutation.isPending
                                }
                              >
                                Godkjenn
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    loanId: loan.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={
                                  loan.status === "rejected" ||
                                  updateStatusMutation.isPending
                                }
                              >
                                Avslå
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredLoans?.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="h-24 text-center text-gray-500"
                          >
                            Ingen lånesøknader funnet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Brukeroversikt</CardTitle>
                <CardDescription>
                  Administrer brukere og se deres status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>E-post</TableHead>
                        <TableHead>Navn</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead>Registrert</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>#{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.kycStatus === "approved"
                                  ? "secondary"
                                  : user.kycStatus === "rejected"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {user.kycStatus === "approved" ? "GODKJENT" :
                               user.kycStatus === "rejected" ? "AVSLÅTT" :
                               user.kycStatus === "pending" ? "VENTER" :
                               user.kycStatus?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('nb-NO')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}