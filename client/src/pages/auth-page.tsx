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
        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 md:px-8">
          <Card className="w-full max-w-[94vw] sm:max-w-md">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Velkommen til Krivo</CardTitle>
              </div>
              <CardDescription className="text-base">
                Din pålitelige partner for rettferdig kredittvurdering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="login" 
                className="space-y-4"
                onValueChange={(value) => {
                  trackEvent(AnalyticsEvents.TOGGLE_PREFERENCE, {
                    preference_name: 'auth_tab',
                    value: value,
                    timestamp: new Date().toISOString()
                  });
                }}
              >
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
                      onSubmit={registerForm.handleSubmit((data) => {
                        // Spor registreringsforsøk
                        trackEvent(AnalyticsEvents.USER_REGISTER, {
                          timestamp: new Date().toISOString(),
                          email_domain: data.username.split('@')[1] || 'unknown', // Sporer kun domenet, ikke hele e-postadressen
                          has_phone: !!data.phoneNumber,
                          country_code: countryCode 
                        });
                        registerMutation.mutate(data);
                      })}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            {/* Material Design V3 stacked layout for smaller screens */}
                            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3">
                              {/* Country code selector with improved mobile-friendliness */}
                              <MuiFormControl 
                                sx={{ 
                                  width: { xs: '100%', sm: '40%' }, 
                                  maxWidth: { xs: '100%', sm: '120px' }
                                }}
                              >
                                <TextField
                                  label="Landskode"
                                  variant="outlined"
                                  value={countryCode}
                                  onClick={() => {
                                    const dialog = document.getElementById('country-selector-dialog') as HTMLDialogElement;
                                    dialog?.showModal();
                                  }}
                                  InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <div className="text-gray-500">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      cursor: 'pointer'
                                    }
                                  }}
                                  fullWidth
                                />
                              </MuiFormControl>
                              
                              {/* Native HTML dialog for country selection - better for mobile */}
                              <dialog 
                                id="country-selector-dialog" 
                                className="rounded-md shadow-lg border border-gray-200 p-0 w-[90vw] max-w-md"
                                onClick={(e) => {
                                  // Close when clicking outside the dialog content
                                  if (e.target === e.currentTarget) {
                                    (e.target as HTMLDialogElement).close();
                                  }
                                }}
                              >
                                <div className="p-4 border-b">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium">Velg landskode</h3>
                                    <button 
                                      className="text-gray-500 hover:text-gray-700"
                                      onClick={() => {
                                        const dialog = document.getElementById('country-selector-dialog') as HTMLDialogElement;
                                        dialog?.close();
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
                                  </div>
                                  <TextField
                                    size="small"
                                    placeholder="Søk land eller kode..."
                                    variant="outlined"
                                    fullWidth
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <div className="text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                          </div>
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto' }} className="p-1">
                                  {countryCodes
                                    .filter(item => {
                                      if (searchTerm === '') return true;
                                      return (
                                        item.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        item.code.includes(searchTerm)
                                      );
                                    })
                                    .map((item) => (
                                      <div 
                                        key={item.code}
                                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-md"
                                        onClick={() => {
                                          setCountryCode(item.code);
                                          if (phoneNumber) {
                                            registerForm.setValue('phoneNumber', `${item.code}${phoneNumber}`);
                                          }
                                          const dialog = document.getElementById('country-selector-dialog') as HTMLDialogElement;
                                          dialog?.close();
                                        }}
                                      >
                                        <div className="font-medium">{item.code}</div>
                                        <div className="ml-3 text-gray-600">{item.country}</div>
                                      </div>
                                    ))
                                  }
                                </div>
                              </dialog>
                              
                              <TextField
                                label="Telefonnummer"
                                variant="outlined"
                                fullWidth
                                value={phoneNumber}
                                onChange={handlePhoneNumberChange}
                                error={!!registerForm.formState.errors.phoneNumber}
                                helperText={registerForm.formState.errors.phoneNumber?.message?.toString()}
                                sx={{ flex: 1 }}
                                inputProps={{
                                  inputMode: 'numeric', // Viser numerisk tastatur på mobil
                                  pattern: '[0-9]*' // Bare tillater tall
                                }}
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
                        onClick={() => {
                          trackEvent(AnalyticsEvents.BUTTON_CLICK, {
                            button_name: 'foreign_phone_help',
                            page: 'register',
                            timestamp: new Date().toISOString()
                          });
                          setShowForeignDialog(true);
                        }}
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
            <h1 className="text-4xl font-bold">Rettferdig kredittvurdering for alle</h1>
            <div className="space-y-4">
              <p className="text-lg opacity-90">
                Opplev banebrytende kredittvurdering med Krivo. Vi tilbyr:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Alternative kredittvurderinger for innvandrere og studenter
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Tilgang til lån gjennom Solarisbank og andre partnere
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Kredittscore basert på utdanning, språk og nettverk
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Personlig veiledning for å forbedre din finansielle situasjon
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for foreign users */}
      <Dialog 
        open={showForeignDialog} 
        onOpenChange={(open) => {
          if (!open) {
            trackEvent(AnalyticsEvents.CLOSE_MODAL, {
              modal_name: 'foreign_registration',
              timestamp: new Date().toISOString()
            });
          }
          setShowForeignDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alternativ registrering</DialogTitle>
            <DialogDescription>
              Denne funksjonen er under utvikling og vil være tilgjengelig snart. 
              Vi jobber med å gjøre det mulig for kunder uten norsk telefonnummer å registrere seg.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              trackEvent(AnalyticsEvents.BUTTON_CLICK, {
                button_name: 'close_foreign_dialog',
                page: 'register',
                timestamp: new Date().toISOString()
              });
              setShowForeignDialog(false);
            }}>
              Tilbake til registrering
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}