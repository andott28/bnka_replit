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
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showFullPassword, setShowFullPassword] = useState({});
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    kycStatus: 'pending'
  });

  // Redirect non-admin users and non-authorized users
  if (!user?.isAdmin || user.username !== "andreas.ottem@icloud.com") {
    return <Redirect to="/dashboard" />;
  }

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get('/api/loans/all');
        setLoans(response.data);
        setLoansLoading(false);
      } catch (error) {
        console.error('Error fetching loans:', error);
        setLoansLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setUsersLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsersLoading(false);
      }
    };

    fetchLoans();
    fetchUsers();
  }, []);

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setEditFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      kycStatus: userData.kycStatus || 'pending'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (userId) => {
    setShowFullPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const saveUserChanges = async () => {
    try {
      // API request to update user information
      const response = await axios.patch(`/api/users/${editingUser.id}`, editFormData);

      // Update users state with the new information
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, ...editFormData } : u
      );
      setUsers(updatedUsers);

      setEditingUser(null);
      toast({
        title: "Bruker oppdatert",
        description: "Brukerinformasjonen ble oppdatert",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere brukerinformasjon",
        variant: "destructive",
      });
    }
  };

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="overview">Oversikt</TabsTrigger>
            <TabsTrigger value="users">Brukere</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Oversikt</CardTitle>
                <CardDescription>
                  Se statistikk og nøkkeltall for plattformen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Totalt antall brukere
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Totalt antall lån
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loans.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Gjennomsnittlig lånebeløp
                      </CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loans.length
                          ? `${Math.round(
                              loans.reduce((acc, loan) => acc + loan.amount, 0) /
                                loans.length
                            )} NOK`
                          : "0 NOK"}
                      </div>
                    </CardContent>
                  </Card>
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
                        <TableHead>Kryptert Passord</TableHead>
                        <TableHead>Registrert</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => (
                        <TableRow key={userData.id}>
                          <TableCell>#{userData.id}</TableCell>
                          <TableCell>{userData.username}</TableCell>
                          <TableCell>
                            {userData.firstName} {userData.lastName}
                          </TableCell>
                          <TableCell>{userData.phoneNumber}</TableCell>
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
                              {userData.kycStatus === "approved" ? "GODKJENT" :
                               userData.kycStatus === "rejected" ? "AVSLÅTT" :
                               userData.kycStatus === "pending" ? "VENTER" :
                               userData.kycStatus?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code 
                                className="text-xs break-all bg-gray-100 p-1 rounded cursor-pointer"
                                onClick={() => togglePasswordVisibility(userData.id)}
                              >
                                {showFullPassword[userData.id] ? 
                                  userData.password : 
                                  userData.password?.substring(0, 20) + "..."}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(userData.createdAt).toLocaleDateString('nb-NO')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(userData)}
                            >
                              Rediger
                            </Button>
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

        {/* Dialog for editing user */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Rediger bruker</DialogTitle>
                <DialogDescription>
                  Endre brukerinformasjon for {editingUser.username}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="firstName" className="text-right">
                    Fornavn
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    className="col-span-3 p-2 border rounded"
                    value={editFormData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="lastName" className="text-right">
                    Etternavn
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    className="col-span-3 p-2 border rounded"
                    value={editFormData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="phoneNumber" className="text-right">
                    Telefon
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    className="col-span-3 p-2 border rounded"
                    value={editFormData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="kycStatus" className="text-right">
                    KYC Status
                  </label>
                  <select
                    id="kycStatus"
                    name="kycStatus"
                    className="col-span-3 p-2 border rounded"
                    value={editFormData.kycStatus}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Venter</option>
                    <option value="approved">Godkjent</option>
                    <option value="rejected">Avslått</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Avbryt
                </Button>
                <Button onClick={saveUserChanges}>
                  Lagre endringer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}