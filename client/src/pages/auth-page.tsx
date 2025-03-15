import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Lock, UserPlus, Mail, Phone, User } from "lucide-react";
import { NavHeader } from "@/components/nav-header";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Box, 
  InputAdornment, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl as MuiFormControl,
  FormHelperText
} from "@mui/material";

// Liste over vanlige landskoder
const countryCodes = [
  { code: "+47", country: "Norge" },
  { code: "+46", country: "Sverige" },
  { code: "+45", country: "Danmark" },
  { code: "+358", country: "Finland" },
  { code: "+49", country: "Tyskland" },
  { code: "+44", country: "Storbritannia" },
  { code: "+1", country: "USA/Canada" },
];

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForeignDialog, setShowForeignDialog] = useState(false);
  const [countryCode, setCountryCode] = useState("+47"); // Default til Norge
  const [phoneNumber, setPhoneNumber] = useState("");

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  
  // Funksjon for å håndtere endring av landskode
  const handleCountryCodeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCountryCode(event.target.value as string);
  };
  
  // Funksjon for å håndtere endring av telefonnummer
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
    // Oppdater verdien i registerForm med kombinert landskode og nummer
    registerForm.setValue('phoneNumber', `${countryCode}${event.target.value}`);
  };

  if (user) {
    // Sjekk om det finnes en redirect etter innlogging
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      localStorage.removeItem("redirectAfterLogin");
      setLocation(redirectPath);
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from" style={{ background: 'linear-gradient(to bottom right, hsl(216, 71%, 95%), white)' }}>
      <NavHeader />
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Velkommen til BNKA</CardTitle>
              </div>
              <CardDescription className="text-base">
                Din pålitelige partner for digital bankvirksomhet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Logg inn
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Registrer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((data) =>
                        loginMutation.mutate(data)
                      )}
                      className="space-y-6"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <TextField
                              label="E-post"
                              variant="outlined"
                              type="email"
                              fullWidth
                              error={!!loginForm.formState.errors.username}
                              helperText={loginForm.formState.errors.username?.message?.toString()}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <TextField
                              label="Passord"
                              variant="outlined"
                              type="password"
                              fullWidth
                              error={!!loginForm.formState.errors.password}
                              helperText={loginForm.formState.errors.password?.message?.toString()}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full rounded-md bg-primary py-3 text-white font-medium hover:bg-primary/90 transition-colors"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Logg inn
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) =>
                        registerMutation.mutate(data)
                      )}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <TextField
                                label="Fornavn"
                                variant="outlined"
                                fullWidth
                                error={!!registerForm.formState.errors.firstName}
                                helperText={registerForm.formState.errors.firstName?.message?.toString()}
                                {...field}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <TextField
                                label="Etternavn"
                                variant="outlined"
                                fullWidth
                                error={!!registerForm.formState.errors.lastName}
                                helperText={registerForm.formState.errors.lastName?.message?.toString()}
                                {...field}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <TextField
                              label="E-post"
                              variant="outlined"
                              type="email"
                              fullWidth
                              error={!!registerForm.formState.errors.username}
                              helperText={registerForm.formState.errors.username?.message?.toString()}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start space-x-2">
                              <MuiFormControl sx={{ width: '40%' }}>
                                <Select
                                  value={countryCode}
                                  onChange={(e) => {
                                    setCountryCode(e.target.value);
                                    // Oppdater telefonnummer i skjemaet med ny landskode
                                    if (phoneNumber) {
                                      registerForm.setValue('phoneNumber', `${e.target.value}${phoneNumber}`);
                                    }
                                  }}
                                  displayEmpty
                                  variant="outlined"
                                >
                                  {countryCodes.map((item) => (
                                    <MenuItem key={item.code} value={item.code}>
                                      {item.code} ({item.country})
                                    </MenuItem>
                                  ))}
                                </Select>
                              </MuiFormControl>
                              
                              <TextField
                                label="Telefonnummer"
                                variant="outlined"
                                fullWidth
                                value={phoneNumber}
                                onChange={handlePhoneNumberChange}
                                error={!!registerForm.formState.errors.phoneNumber}
                                helperText={registerForm.formState.errors.phoneNumber?.message?.toString()}
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <TextField
                              label="Passord"
                              variant="outlined"
                              type="password"
                              fullWidth
                              error={!!registerForm.formState.errors.password}
                              helperText={registerForm.formState.errors.password?.message?.toString()}
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full rounded-md bg-primary py-3 text-white font-medium hover:bg-primary/90 transition-colors"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Opprett konto
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-gray-500"
                        onClick={() => setShowForeignDialog(true)}
                      >
                        Har du ikke et norsk telefonnummer? Klikk her
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
          <div className="max-w-lg text-white space-y-6">
            <h1 className="text-4xl font-bold">Smart bank for fremtiden</h1>
            <div className="space-y-4">
              <p className="text-lg opacity-90">
                Opplev sømløs digital banking med BNKA. Vi tilbyr:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Digitale bankkontoer med IBAN
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Debet- og kredittkort
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Raske betalinger via SEPA
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Sikker kundeidentifikasjon
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for foreign users */}
      <Dialog open={showForeignDialog} onOpenChange={setShowForeignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alternativ registrering</DialogTitle>
            <DialogDescription>
              Denne funksjonen er under utvikling og vil være tilgjengelig snart. 
              Vi jobber med å gjøre det mulig for kunder uten norsk telefonnummer å registrere seg.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowForeignDialog(false)}>
              Tilbake til registrering
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}