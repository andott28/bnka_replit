import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/nav-header";
import { Footer } from "@/components/footer";
import { Link } from "wouter";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CreditCard,
  Shield,
  Clock,
  ArrowRight,
  Smartphone,
  Wallet,
  LineChart,
  Sparkles,
  BarChart4,
  GraduationCap,
  CheckCircle2
} from "lucide-react";

export default function HomePage() {
  const { trackEvent } = usePostHog();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Track page view
    trackEvent?.(AnalyticsEvents.PAGE_VIEW, {
      page: "home"
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />

      <main className="flex-1">
        {/* Hero Section - Material Design V3 Style */}
        <section className="relative bg-primary text-white py-20 md:py-28 overflow-hidden">
          {/* Dekorative elementer for visuell dybde - MD3 */}
          <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-white/10 hidden md:block"></div>
          <div className="absolute bottom-[-15%] left-[-10%] w-[250px] h-[250px] rounded-full bg-white/5"></div>
          
          {/* Subtil gradient bakgrunn for bevegelse og dybde */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)] bg-[length:500px_500px] animate-[gradient_20s_linear_infinite]"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                  Vi sier ja når{' '}
                  <span className="relative inline-block">
                    andre sier nei.
                    <span className="absolute bottom-1 left-0 w-full h-[3px] bg-secondary rounded-full"></span>
                  </span>
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 font-light leading-relaxed">
                  Opplev sømløs digital banking med rask lånesøknad og
                  personlige finansielle løsninger for din hverdag.
                </p>
                <Link href="/auth-page">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="group rounded-full px-8 py-6 text-[1.1rem] font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Kom i gang
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              
              {/* MD3-inspirert illustrasjon - Synlig på både mobil og desktop med responsive justeringer */}
              <div className="md:w-1/2 relative mt-12 md:mt-0 scale-[0.73] md:scale-100 -my-6 md:my-0">
                <div className="relative w-full h-[350px]">
                  {/* Kredittkort designelement - plassert delvis under telefonen */}
                  <div className="absolute top-[20%] left-[25%] md:left-[18%] w-[220px] h-[140px] rounded-xl bg-gradient-to-br from-secondary-900 to-secondary-600 transform -rotate-12 shadow-xl p-4 z-10 transition-all duration-300 hover:rotate-0">
                    <div className="flex justify-between">
                      <div className="text-white font-bold">BNKA</div>
                      <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-white/80 text-sm mb-1">**** **** **** 1234</div>
                      <div className="text-white/80 text-xs">VALID THRU 03/28</div>
                    </div>
                  </div>
                  
                  {/* Mobilapp design - justert for synlighet og kontrast */}
                  <div className="absolute top-[5%] right-[20%] md:right-[25%] w-[180px] h-[330px] rounded-3xl bg-white shadow-xl overflow-hidden border-8 border-gray-800 z-20">
                    <div className="h-[60px] bg-primary p-4">
                      <div className="text-white text-sm font-medium">BNKA App</div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500">Saldo</div>
                      <div className="text-xl font-bold mb-6 text-primary">24 560 kr</div>
                      
                      <div className="space-y-3">
                        <div className="h-3 w-4/5 bg-primary/10 rounded-full"></div>
                        <div className="h-3 w-full bg-primary/10 rounded-full"></div>
                        <div className="h-3 w-3/5 bg-primary/10 rounded-full"></div>
                        <div className="h-3 w-4/5 bg-primary/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Material Design V3 med runde kort og tydelige ikoner */}
        <section className="py-20 md:py-28 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Hvorfor velge BNKA?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Vi kombinerer markedsledende teknologi med personlig service for å gi deg en bedre bankopplevelse
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Komplett banktjeneste</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Alt fra bankkontoer og kort til lån og betalinger i én sømløs plattform
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Markedsledende renter</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Konkurransedyktige renter på sparing og lån tilpasset din økonomi
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Rask behandling</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Få svar på lånesøknader innen 24 timer med rask utbetaling
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sikker plattform</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Din sikkerhet er vår prioritet med BankID og moderne kryptering
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <Smartphone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mobilbanking</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Tilgang til alle banktjenester fra vår app, når og hvor som helst
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                  <BarChart4 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Økonomisk innsikt</h3>
                <p className="text-gray-600 leading-relaxed h-full">
                  Få oversikt over økonomien med personlige analyser og anbefalinger
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mellomliggende seksjon - Material Design V3 styling */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl relative overflow-hidden shadow-sm">
                  {/* Illustrative grafiske elementer */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-[350px]">
                    <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 transition-all hover:-translate-y-1 duration-300">
                      <div className="flex items-center gap-4 mb-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <div className="font-medium">Personlige tilbud</div>
                      </div>
                      <div className="h-2 bg-primary/10 rounded-full w-4/5 mb-2"></div>
                      <div className="h-2 bg-primary/10 rounded-full w-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg transition-all hover:-translate-y-1 duration-300">
                      <div className="flex items-center gap-4 mb-3">
                        <LineChart className="h-6 w-6 text-primary" />
                        <div className="font-medium">Økonomisk oversikt</div>
                      </div>
                      <div className="h-20 bg-primary/10 rounded-xl flex items-end p-2">
                        <div className="w-1/6 h-4/6 bg-primary/40 rounded-sm mx-1"></div>
                        <div className="w-1/6 h-3/6 bg-primary/40 rounded-sm mx-1"></div>
                        <div className="w-1/6 h-5/6 bg-primary/40 rounded-sm mx-1"></div>
                        <div className="w-1/6 h-2/6 bg-primary/40 rounded-sm mx-1"></div>
                        <div className="w-1/6 h-full bg-primary rounded-sm mx-1"></div>
                        <div className="w-1/6 h-3/6 bg-primary/40 rounded-sm mx-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                  Smidig bankopplevelse, skreddersydd for deg
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Vi har redesignet hele bankopplevelsen fra bunnen av med fokus på det som betyr mest: din tid, komfort og økonomiske trygghet.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Intelligente finansielle råd</h4>
                      <p className="text-gray-600">Få personlige anbefalinger basert på dine forbruksmønstre</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Fleksible betalingsløsninger</h4>
                      <p className="text-gray-600">Betal hvor som helst, når som helst med våre mobile betalingsløsninger</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/how-it-works">
                    <Button 
                      variant="outline" 
                      className="group rounded-full px-6 py-5 font-medium"
                    >
                      Lær mer om våre tjenester
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Modern blue gradient design */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-primary-900"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/20 via-transparent to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary-800/30 via-transparent to-transparent blur-3xl"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          
          {/* Additional light effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">
                Klar for å starte din finansielle reise?
              </h2>
              <p className="text-lg md:text-xl text-white mb-10 leading-relaxed">
                Registrer deg på under 5 minutter og få umiddelbar tilgang til 
                våre innovative banktjenester og personlige finansiell veiledning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth-page">
                  <Button 
                    size="lg" 
                    variant="default"
                    className="group w-full sm:w-auto bg-white text-primary-800 hover:bg-white/90 rounded-full px-8 py-6 text-[1.1rem] font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Opprett konto
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="group w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-[1.1rem] font-medium border-2 transition-all duration-300"
                  >
                    Kontakt oss
                  </Button>
                </Link>
              </div>
              
              {/* Liste med fordeler - Ekstra visuell styrke */}
              <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left max-w-4xl mx-auto">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-white text-sm md:text-base">
                    <p>Ingen skjulte gebyrer</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-white text-sm md:text-base">
                    <p>Sikker og trygg plattform</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-white text-sm md:text-base">
                    <p>Støtte 24/7 for alle kunder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}