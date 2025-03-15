import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { usePostHog, AnalyticsEvents } from "@/lib/posthog-provider";
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
import { useState, useEffect } from "react";
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
  { code: "+33", country: "Frankrike" },
  { code: "+34", country: "Spania" },
  { code: "+39", country: "Italia" },
  { code: "+31", country: "Nederland" },
  { code: "+32", country: "Belgia" },
  { code: "+41", country: "Sveits" },
  { code: "+43", country: "Østerrike" },
  { code: "+351", country: "Portugal" },
  { code: "+30", country: "Hellas" },
  { code: "+48", country: "Polen" },
  { code: "+420", country: "Tsjekkia" },
  { code: "+36", country: "Ungarn" },
  { code: "+386", country: "Slovenia" },
  { code: "+421", country: "Slovakia" },
  { code: "+385", country: "Kroatia" },
  { code: "+40", country: "Romania" },
  { code: "+359", country: "Bulgaria" },
  { code: "+370", country: "Litauen" },
  { code: "+371", country: "Latvia" },
  { code: "+372", country: "Estland" },
  { code: "+353", country: "Irland" },
  { code: "+352", country: "Luxembourg" },
  { code: "+356", country: "Malta" },
  { code: "+357", country: "Kypros" },
  { code: "+354", country: "Island" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "Sør-Korea" },
  { code: "+86", country: "Kina" },
  { code: "+91", country: "India" },
  { code: "+7", country: "Russland" },
  { code: "+27", country: "Sør-Afrika" },
  { code: "+55", country: "Brasil" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+62", country: "Indonesia" },
  { code: "+60", country: "Malaysia" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
];

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForeignDialog, setShowForeignDialog] = useState(false);
  const [countryCode, setCountryCode] = useState("+47"); // Default til Norge
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { trackEvent } = usePostHog();
  
  // Effect for å filtrere land basert på søkeord
  useEffect(() => {
    const searchElement = document.getElementById('country-search');
    if (!searchElement) return;
    
    const term = searchTerm.toLowerCase();
    const menuItems = searchElement.querySelectorAll('[data-country], [data-code]');
    
    menuItems.forEach((item: Element) => {
      const country = item.getAttribute('data-country') || '';
      const code = item.getAttribute('data-code') || '';
      
      if (country.includes(term) || code.includes(term) || term === '') {
        (item as HTMLElement).style.display = '';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  }, [searchTerm]);

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
                      onSubmit={loginForm.handleSubmit((data) => {
                        // Spor innloggingsforsøk
                        trackEvent(AnalyticsEvents.USER_LOGIN, {
                          timestamp: new Date().toISOString(),
                          email_domain: data.username.split('@')[1] || 'unknown' // Sporer kun domenet, ikke hele e-postadressen
                        });
                        loginMutation.mutate(data);
                      })}
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
                                  renderValue={(value) => <>{value}</>}
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 300
                                      }
                                    }
                                  }}
                                >
                                  <Box px={2} py={1}>
                                    <TextField
                                      size="small"
                                      autoFocus
                                      placeholder="Søk land..."
                                      fullWidth
                                      value={searchTerm}
                                      InputProps={{
                                        sx: { fontSize: 14 }
                                      }}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      onKeyDown={(e) => {
                                        // Hindre at Enter-tasten lukker dropdown-menyen
                                        if (e.key === 'Enter') {
                                          e.stopPropagation();
                                          e.preventDefault();
                                        }
                                      }}
                                    />
                                  </Box>
                                  <div id="country-search" data-search="" style={{ overflow: 'auto', maxHeight: '250px' }}>
                                    {countryCodes.map((item) => (
                                      <MenuItem 
                                        key={item.code} 
                                        value={item.code}
                                        style={{
                                          display: 'block'
                                        }}
                                        sx={{
                                          '&.MuiMenuItem-root': {
                                            display: 'flex'
                                          },
                                          '&.MuiButtonBase-root': {
                                            display: 'flex'
                                          }
                                        }}
                                        data-country={item.country.toLowerCase()}
                                        data-code={item.code.substring(1).toLowerCase()}
                                      >
                                        <span>{item.code}</span> <span style={{ marginLeft: 5, color: '#666', fontSize: '0.85em' }}>({item.country})</span>
                                      </MenuItem>
                                    ))}
                                  </div>
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