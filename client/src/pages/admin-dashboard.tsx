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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import type { LoanApplication } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: loans, isLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loans/all"],
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
                    <TableHead>Beløp</TableHead>
                    <TableHead>Formål</TableHead>
                    <TableHead>Inntekt</TableHead>
                    <TableHead>Ansettelse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Innsendt</TableHead>
                    <TableHead>Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans?.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>#{loan.id}</TableCell>
                      <TableCell>{new Intl.NumberFormat('nb-NO').format(loan.amount)} NOK</TableCell>
                      <TableCell>{loan.purpose}</TableCell>
                      <TableCell>{new Intl.NumberFormat('nb-NO').format(loan.income)} NOK</TableCell>
                      <TableCell>{loan.employmentStatus}</TableCell>
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
      </main>
    </div>
  );
}