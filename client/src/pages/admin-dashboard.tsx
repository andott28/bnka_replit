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
import { 
  Loader2, 
  Search, 
  Users, 
  CreditCard, 
  BarChart, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Wallet, 
  BarChart3, 
  AreaChart,
  PieChart,
  Activity
} from "lucide-react";
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

// Recharts imports for graphs
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  BarChart as RBarChart,
  Bar
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFullPassword, setShowFullPassword] = useState<Record<number, boolean>>({});
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    kycStatus: 'pending'
  });
  
  // SQL Query states
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlLoading, setSqlLoading] = useState<boolean>(false);
  const [sqlError, setSqlError] = useState<string | null>(null);
  
  // Loan detail states
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [loanDetailsOpen, setLoanDetailsOpen] = useState<boolean>(false);
  const [updateLoanStatus, setUpdateLoanStatus] = useState<string>("");
  const [updateLoanLoading, setUpdateLoanLoading] = useState<boolean>(false);

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

  const handleEditUser = (userData: User) => {
    setEditingUser(userData);
    setEditFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      kycStatus: userData.kycStatus || 'pending'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowFullPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;
    
    try {
      // API request to update user information
      const response = await axios.patch(`/api/users/${editingUser.id}`, editFormData);

      // Update users state with the new information
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, ...editFormData as any } : u
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
      <div className="min-h-screen dark:bg-gray-900">
        <NavHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin dark:text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Administrasjonspanel</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[700px] grid-cols-4 dark:bg-gray-800">
            <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-700">Oversikt</TabsTrigger>
            <TabsTrigger value="loans" className="dark:data-[state=active]:bg-gray-700">Lånesøknader</TabsTrigger>
            <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700">Brukere</TabsTrigger>
            <TabsTrigger value="analytics" className="dark:data-[state=active]:bg-gray-700">Analyser</TabsTrigger>
          </TabsList>

          {/* OVERSIKT DASHBORD */}
          <TabsContent value="overview">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">KPI Oversikt</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Nøkkeltall og statistikk for plattformen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Totalt antall brukere
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">{users.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Totalt antall lån
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">{loans.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Gjennomsnittlig lånebeløp
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        {loans.length
                          ? `${Math.round(
                              loans.reduce((acc, loan) => acc + loan.amount, 0) /
                                loans.length
                            )} NOK`
                          : "0 NOK"}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Godkjennelsesrate
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        {loans.length
                          ? `${Math.round(
                              (loans.filter(loan => loan.status === 'approved').length / 
                              loans.length) * 100
                            )}%`
                          : "0%"}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Totalt lånebeløp
                      </CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        {loans.length
                          ? `${loans.reduce((acc, loan) => acc + loan.amount, 0)} NOK`
                          : "0 NOK"}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-white">
                        Gj.snitt behandlingstid
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">24 timer</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Loan Applications Distribution Graph */}
                <div className="grid gap-4 md:grid-cols-2 mt-8">
                  <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Lånesøknader etter status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPieChart>
                          <Pie
                            data={[
                              { name: 'Pending', value: loans.filter(l => l.status === 'pending').length || 0, color: '#F59E0B' },
                              { name: 'Approved', value: loans.filter(l => l.status === 'approved').length || 0, color: '#10B981' },
                              { name: 'Rejected', value: loans.filter(l => l.status === 'rejected').length || 0, color: '#EF4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent, x, y}) => {
                              return (
                                <text 
                                  x={x} 
                                  y={y} 
                                  fill={document.documentElement.classList.contains('dark') ? "#CCC" : "#888"}
                                  textAnchor={x > 200 ? "start" : "end"}
                                  dominantBaseline="middle"
                                >
                                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                          >
                            {[
                              { name: 'Pending', color: '#F59E0B' },
                              { name: 'Approved', color: '#10B981' },
                              { name: 'Rejected', color: '#EF4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartTooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid #666', color: '#FFF' }} />
                          <Legend formatter={(value) => <span style={{ color: document.documentElement.classList.contains('dark') ? '#DDD' : '#666' }}>{value}</span>} />
                        </RPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Lånebeløpsfordeling</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RBarChart
                          data={[
                            { range: '0-50k', count: loans.filter(l => l.amount <= 50000).length },
                            { range: '50k-100k', count: loans.filter(l => l.amount > 50000 && l.amount <= 100000).length },
                            { range: '100k-200k', count: loans.filter(l => l.amount > 100000 && l.amount <= 200000).length },
                            { range: '200k+', count: loans.filter(l => l.amount > 200000).length },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "#444" : "#ccc"} />
                          <XAxis dataKey="range" tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                          <YAxis tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                          <RechartTooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid #666', color: '#FFF' }} />
                          <Bar dataKey="count" fill="#8884d8" name="Antall lån" />
                        </RBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOANS TAB */}
          <TabsContent value="loans">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Lånesøknader</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Oversikt over alle lånesøknader i systemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-700">Alle statuser</SelectItem>
                        <SelectItem value="pending" className="dark:text-white dark:focus:bg-gray-700">Venter</SelectItem>
                        <SelectItem value="approved" className="dark:text-white dark:focus:bg-gray-700">Godkjent</SelectItem>
                        <SelectItem value="rejected" className="dark:text-white dark:focus:bg-gray-700">Avslått</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Søk..."
                      className="pl-8 w-[250px] dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border overflow-x-auto dark:border-gray-700">
                  <Table className="min-w-[900px]">
                    <TableHeader className="dark:bg-gray-800">
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="w-[60px] dark:text-gray-300">ID</TableHead>
                        <TableHead className="w-[200px] dark:text-gray-300">Bruker</TableHead>
                        <TableHead className="w-[120px] dark:text-gray-300">Beløp</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">Formål</TableHead>
                        <TableHead className="w-[120px] dark:text-gray-300">Kredittscore</TableHead>
                        <TableHead className="w-[100px] dark:text-gray-300">Status</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">Dato</TableHead>
                        <TableHead className="w-[100px] dark:text-gray-300">Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans
                        .filter(
                          (loan) =>
                            (statusFilter === "all" || loan.status === statusFilter) &&
                            (search === "" ||
                              loan.purpose?.toLowerCase().includes(search.toLowerCase()) ||
                              String(loan.amount).includes(search))
                        )
                        .map((loan) => (
                          <TableRow 
                            key={loan.id} 
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setLoanDetailsOpen(true);
                              setUpdateLoanStatus(loan.status);
                            }}
                          >
                            <TableCell>#{loan.id}</TableCell>
                            <TableCell>
                              {users.find(u => u.id === loan.userId)?.username || `Bruker #${loan.userId}`}
                            </TableCell>
                            <TableCell>{loan.amount} NOK</TableCell>
                            <TableCell className="hidden md:table-cell">{loan.purpose}</TableCell>
                            <TableCell>
                              {loan.creditScore ? (
                                <Badge variant="outline">{loan.creditScore}</Badge>
                              ) : (
                                "Ikke vurdert"
                              )}
                            </TableCell>
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
                                 loan.status === "pending" ? "VENTER" :
                                 loan.status?.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {new Date(loan.submittedAt).toLocaleDateString('nb-NO', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLoan(loan);
                                    setLoanDetailsOpen(true);
                                    setUpdateLoanStatus(loan.status);
                                  }}
                                >
                                  Detaljer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Brukeroversikt</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Administrer brukere og se deres status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto dark:border-gray-700">
                  <Table className="min-w-[900px]">
                    <TableHeader className="dark:bg-gray-800">
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="w-[60px] dark:text-gray-300">ID</TableHead>
                        <TableHead className="w-[200px] dark:text-gray-300">E-post</TableHead>
                        <TableHead className="w-[180px] dark:text-gray-300">Navn</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">Telefon</TableHead>
                        <TableHead className="w-[100px] dark:text-gray-300">KYC Status</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">Passord</TableHead>
                        <TableHead className="hidden md:table-cell dark:text-gray-300">Registrert</TableHead>
                        <TableHead className="w-[120px] dark:text-gray-300">Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => (
                        <TableRow key={userData.id} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                          <TableCell>#{userData.id}</TableCell>
                          <TableCell>{userData.username}</TableCell>
                          <TableCell>
                            {userData.firstName} {userData.lastName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{userData.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                userData.kycStatus === "approved"
                                  ? "secondary"
                                  : userData.kycStatus === "rejected"
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
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <code 
                                className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-1 rounded cursor-pointer dark:text-gray-200"
                                onClick={() => togglePasswordVisibility(userData.id)}
                              >
                                {showFullPassword[userData.id] ? 
                                  userData.password : 
                                  userData.password?.substring(0, 20) + "..."}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(userData.createdAt).toLocaleDateString('nb-NO')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleEditUser(userData)}
                              >
                                Rediger
                              </Button>
                              
                              {userData.id !== user?.id && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    if (window.confirm(`Er du sikker på at du vil slette brukeren ${userData.username}? Dette vil også slette alle brukerens lånesøknader.`)) {
                                      axios.delete(`/api/users/${userData.id}`)
                                        .then(() => {
                                          setUsers(users.filter(u => u.id !== userData.id));
                                          toast({
                                            title: "Bruker slettet",
                                            description: "Brukeren ble slettet permanent",
                                            variant: "default",
                                          });
                                        })
                                        .catch(err => {
                                          console.error("Error deleting user:", err);
                                          toast({
                                            title: "Feil",
                                            description: "Kunne ikke slette brukeren",
                                            variant: "destructive",
                                          });
                                        });
                                    }
                                  }}
                                >
                                  Slett
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Avanserte analyser</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Dybdeanalyse av lånesøknader og kredittvurderinger
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Credit Score Distribution */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg dark:text-white">Kredittscore fordeling</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RBarChart
                          data={[
                            { grade: 'A', count: loans.filter(l => l.creditScore === 'A').length },
                            { grade: 'B', count: loans.filter(l => l.creditScore === 'B').length },
                            { grade: 'C', count: loans.filter(l => l.creditScore === 'C').length },
                            { grade: 'D', count: loans.filter(l => l.creditScore === 'D').length },
                            { grade: 'E', count: loans.filter(l => l.creditScore === 'E').length },
                            { grade: 'F', count: loans.filter(l => l.creditScore === 'F').length },
                            { grade: 'N/A', count: loans.filter(l => !l.creditScore).length }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "#444" : "#ccc"} />
                          <XAxis dataKey="grade" tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                          <YAxis tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                          <RechartTooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid #666', color: '#FFF' }} />
                          <Bar dataKey="count" name="Antall" fill="#3B82F6" />
                        </RBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Income vs. Loan Amount */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg dark:text-white">Inntekt vs. lånebeløp</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={loans
                            .filter(loan => loan.income && loan.amount)
                            .map(loan => ({
                              id: loan.id,
                              income: loan.income,
                              amount: loan.amount
                            }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "#444" : "#ccc"} />
                          <XAxis 
                            dataKey="income" 
                            name="Inntekt" 
                            label={{ value: "Inntekt (NOK)", position: "insideBottom", offset: -5, fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} 
                            tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }}
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <YAxis 
                            label={{ value: "Lånebeløp (NOK)", angle: -90, position: "insideLeft", fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }}
                            tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }}
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <RechartTooltip 
                            contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid #666', color: '#FFF' }}
                            formatter={(value, name) => [`${value} NOK`, name === 'amount' ? 'Lånebeløp' : 'Inntekt']}
                            labelFormatter={(income) => `Inntekt: ${income} NOK`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#10B981" 
                            name="Lånebeløp"
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Applications Over Time */}
                <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">Lånesøknader over tid</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          // Group by month and year and convert to array
                          Object.values(
                            loans.reduce((acc: Record<string, {month: string, count: number, totalAmount: number}>, loan) => {
                              const date = new Date(loan.submittedAt);
                              const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                              
                              if (!acc[monthYear]) {
                                acc[monthYear] = {
                                  month: monthYear,
                                  count: 0,
                                  totalAmount: 0
                                };
                              }
                              
                              acc[monthYear].count += 1;
                              acc[monthYear].totalAmount += loan.amount || 0;
                              
                              return acc;
                            }, {})
                          )
                        }
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "#444" : "#ccc"} />
                        <XAxis dataKey="month" tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                        <YAxis yAxisId="left" tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: document.documentElement.classList.contains('dark') ? "#CCC" : "#666" }} />
                        <RechartTooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid #666', color: '#FFF' }} />
                        <Legend formatter={(value) => <span style={{ color: document.documentElement.classList.contains('dark') ? '#DDD' : '#666' }}>{value}</span>} />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8884d8" 
                          name="Antall søknader"
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="totalAmount" 
                          stroke="#82ca9d" 
                          name="Totalt søknadsbeløp"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* SQL Query Interface card */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Database Query</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Kjør egendefinerte SQL-spørringer mot databasen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Eksempel spørringer:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-200"
                          onClick={() => setSqlQuery("SELECT * FROM loan_applications ORDER BY amount DESC LIMIT 10;")}
                        >
                          SELECT * FROM loan_applications ORDER BY amount DESC LIMIT 10;
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-200"
                          onClick={() => setSqlQuery("SELECT status, COUNT(*) FROM loan_applications GROUP BY status;")}
                        >
                          SELECT status, COUNT(*) FROM loan_applications GROUP BY status;
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-200"
                          onClick={() => setSqlQuery("SELECT u.username, COUNT(l.id) AS loan_count FROM users u LEFT JOIN loan_applications l ON u.id = l.user_id GROUP BY u.username ORDER BY loan_count DESC;")}
                        >
                          Brukere per antall lån (topp til bunn)
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-200"
                          onClick={() => setSqlQuery("SELECT AVG(amount) AS gjennomsnitt, MAX(amount) AS maksimum, MIN(amount) AS minimum FROM loan_applications;")}
                        >
                          Lånebeløp statistikk
                        </Button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full p-2 border rounded h-32 font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-400" 
                      placeholder="Skriv din SQL spørring her..."
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={async () => {
                          if (!sqlQuery.trim()) return;
                          
                          setSqlLoading(true);
                          setSqlError(null);
                          setSqlResults(null);
                          
                          try {
                            const response = await axios.post('/api/admin/execute-sql', { query: sqlQuery });
                            setSqlResults(response.data);
                            toast({
                              title: "Spørring fullført",
                              description: `Spørringen returnerte ${response.data.length} rad(er)`,
                              variant: "default",
                            });
                          } catch (error: any) {
                            setSqlError(error.response?.data?.message || "Feil ved utføring av spørring");
                            toast({
                              title: "SQL-feil",
                              description: error.response?.data?.message || "Feil ved utføring av spørring",
                              variant: "destructive",
                            });
                          } finally {
                            setSqlLoading(false);
                          }
                        }}
                        disabled={sqlLoading}
                      >
                        {sqlLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kjører...
                          </>
                        ) : 'Kjør spørring'}
                      </Button>
                    </div>
                    
                    {sqlError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
                        <p className="font-medium">Feil ved utføring av spørring:</p>
                        <p className="text-sm">{sqlError}</p>
                      </div>
                    )}
                    
                    {sqlResults && sqlResults.length > 0 && (
                      <div className="mt-4 rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(sqlResults[0]).map(key => (
                                <TableHead key={key}>{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sqlResults.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {Object.values(row).map((value: unknown, valIndex) => {
                                  const displayValue = value === null ? 'NULL' : 
                                      typeof value === 'object' ? JSON.stringify(value) : 
                                      String(value);
                                  
                                  return (
                                    <TableCell key={valIndex}>
                                      {displayValue}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog for editing user */}
        {/* Loan Details Dialog */}
        {selectedLoan && (
          <Dialog open={loanDetailsOpen} onOpenChange={setLoanDetailsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lånesøknad #{selectedLoan.id}</DialogTitle>
                <DialogDescription>
                  Detaljert informasjon om lånesøknaden
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">Søknadsinformasjon</h3>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Beløp:</span>
                    <span className="text-sm col-span-2">{selectedLoan.amount} NOK</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Formål:</span>
                    <span className="text-sm col-span-2">{selectedLoan.purpose}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm col-span-2">
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
                         selectedLoan.status === "pending" ? "VENTER" :
                         selectedLoan.status?.toUpperCase()}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Søknadsdato:</span>
                    <span className="text-sm col-span-2">
                      {new Date(selectedLoan.submittedAt).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">Kredittinformasjon</h3>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Kredittscore:</span>
                    <span className="text-sm col-span-2">
                      {selectedLoan.creditScore ? (
                        <Badge variant="outline">{selectedLoan.creditScore}</Badge>
                      ) : (
                        "Ikke vurdert"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Inntekt:</span>
                    <span className="text-sm col-span-2">
                      {selectedLoan.income ? `${selectedLoan.income} NOK/år` : "Ikke spesifisert"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Ansettelse:</span>
                    <span className="text-sm col-span-2">{selectedLoan.employmentStatus || "Ikke spesifisert"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Månedlige utgifter:</span>
                    <span className="text-sm col-span-2">
                      {selectedLoan.monthlyExpenses ? `${selectedLoan.monthlyExpenses} NOK` : "Ikke spesifisert"}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedLoan.creditScoreDetails && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium mb-2">Kredittvurdering</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {(() => {
                        try {
                          if (typeof selectedLoan.creditScoreDetails === 'string') {
                            const parsed = JSON.parse(selectedLoan.creditScoreDetails);
                            return JSON.stringify(parsed, null, 2);
                          } 
                          if (selectedLoan.creditScoreDetails && typeof selectedLoan.creditScoreDetails === 'object') {
                            return JSON.stringify(selectedLoan.creditScoreDetails, null, 2);
                          }
                          return String(selectedLoan.creditScoreDetails || '');
                        } catch (e) {
                          if (selectedLoan.creditScoreDetails) {
                            return String(selectedLoan.creditScoreDetails);
                          }
                          return '';
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Oppdater lånestatus</h3>
                <div className="flex space-x-2 mb-4">
                  <Select value={updateLoanStatus} onValueChange={setUpdateLoanStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Venter</SelectItem>
                      <SelectItem value="approved">Godkjenner</SelectItem>
                      <SelectItem value="rejected">Avslår</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={async () => {
                      if (updateLoanStatus === selectedLoan.status) return;
                      
                      setUpdateLoanLoading(true);
                      try {
                        await axios.patch(`/api/loans/${selectedLoan.id}/status`, {
                          status: updateLoanStatus
                        });
                        
                        // Update local state
                        setLoans(prevLoans => prevLoans.map(loan => 
                          loan.id === selectedLoan.id ? { ...loan, status: updateLoanStatus } : loan
                        ));
                        
                        setSelectedLoan(prev => prev ? { ...prev, status: updateLoanStatus } : null);
                        
                        toast({
                          title: "Status oppdatert",
                          description: `Lånesøknad #${selectedLoan.id} er nå ${updateLoanStatus === 'approved' ? 'godkjent' : 
                                         updateLoanStatus === 'rejected' ? 'avslått' : 'under vurdering'}`,
                          variant: "default",
                        });
                      } catch (error) {
                        console.error("Error updating loan status:", error);
                        toast({
                          title: "Feil",
                          description: "Kunne ikke oppdatere lånestatus",
                          variant: "destructive",
                        });
                      } finally {
                        setUpdateLoanLoading(false);
                      }
                    }}
                    disabled={updateLoanLoading || updateLoanStatus === selectedLoan.status}
                  >
                    {updateLoanLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Oppdaterer...
                      </>
                    ) : 'Oppdater status'}
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2 text-destructive">Fare sone</h3>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    const confirmed = window.confirm("Er du sikker på at du vil slette denne lånesøknaden? Dette kan ikke angres.");
                    if (!confirmed) return;
                    
                    try {
                      await axios.delete(`/api/loans/${selectedLoan.id}`);
                      setLoanDetailsOpen(false);
                      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== selectedLoan.id));
                      toast({
                        title: "Lånesøknad slettet",
                        description: `Lånesøknad #${selectedLoan.id} er nå slettet`,
                        variant: "default",
                      });
                    } catch (error) {
                      toast({
                        title: "Feil",
                        description: "Kunne ikke slette lånesøknaden",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Slett lånesøknad
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLoanDetailsOpen(false)}>
                  Lukk
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* User edit dialog */}
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