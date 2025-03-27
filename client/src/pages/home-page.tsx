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
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const { trackEvent } = usePostHog();
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    trackEvent?.(AnalyticsEvents.PAGE_VIEW, {
      page: "home",
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />

      <main className="flex-1 dark:bg-[#121212]">
        {/* Hero Section */}
        <section className="relative bg-primary dark:bg-primary text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-white/10 hidden md:block"></div>
          <div className="absolute bottom-[-15%] left-[-10%] w-[250px] h-[250px] rounded-full bg-white/5"></div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)] bg-[length:500px_500px] animate-[gradient_20s_linear_infinite]"></div>

          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight text-[#FAFAFA]">
                  Rettferdig kreditt for{" "}
                  <span className="font-extrabold">ALLE</span>
                </h1>
                <p className="text-lg md:text-xl mb-8 text-[#E0E0E0] font-light leading-relaxed">
                  Vår innovative AI-baserte kredittvurdering gir deg muligheten
                  til bedre finansielle løsninger, uansett bakgrunn og
                  livssituasjon.
                </p>
                <Link href="/auth">
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

              <div className="md:w-1/2 relative mt-12 md:mt-0 scale-[0.73] md:scale-90 lg:scale-100 -my-6 md:my-0">
                <div className="relative w-full h-[350px] mx-auto max-w-[400px]">
                  {/* Kredittkort */}
                  <div
                    className="absolute top-[20%] left-[10%] sm:left-[15%] md:left-[10%] lg:left-[15%] xl:left-[18%] w-[220px] h-[140px] 
                    rounded-xl bg-gradient-to-br from-secondary-900 to-secondary-600 transform -rotate-12 shadow-xl p-4 z-10 
                    transition-all duration-300 hover:rotate-0"
                  >
                    <div className="flex justify-between">
                      <div className="text-white font-bold">Styr AS</div>
                      <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-white/80 text-sm mb-1">
                        **** **** **** 1234
                      </div>
                      <div className="text-white/80 text-xs">
                        VALID THRU 03/28
                      </div>
                    </div>
                  </div>

                  {/* Mobiltelefon */}
                  <div
                    className="absolute top-[5%] right-[5%] sm:right-[15%] md:right-[15%] lg:right-[20%] xl:right-[25%] w-[180px] h-[330px] 
                    rounded-3xl bg-white dark:bg-[#1E1E1E] shadow-xl overflow-hidden border-8 border-gray-800 z-20"
                  >
                    <div className="h-[60px] bg-primary p-4">
                      <div className="text-white text-sm font-medium">
                        Styr App
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Kredittscore
                      </div>
                      <div className="text-xl font-bold mb-6 text-primary dark:text-primary">
                        785{" "}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / 900
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-4/5 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                        <div className="h-3 w-full bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                        <div className="h-3 w-3/5 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                        <div className="h-3 w-4/5 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#1E1E1E]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight dark:text-[#FAFAFA]">
                Hvorfor velge Styr AS?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Vi kombinerer markedsledende AI-teknologi med personlig service
                for å gi deg en bedre kredittvurdering
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[CreditCard, Wallet, Clock, Shield, Smartphone, BarChart4].map(
                (Icon, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#232323] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-[#2A2A2A] transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col"
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-6 text-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 dark:text-[#E0E0E0]">
                      {
                        [
                          "AI-drevet kredittvurdering",
                          "Rettferdige lånemuligheter",
                          "Rask behandling",
                          "Sikker plattform",
                          "Digital tilgjengelighet",
                          "Økonomisk innsikt",
                        ][index]
                      }
                    </h3>
                    <p className="text-gray-600 dark:text-[#B0B0B0] leading-relaxed h-full">
                      {
                        [
                          "Vår avanserte AI analyserer flere datapunkter enn tradisjonelle kredittsystemer",
                          "Vi hjelper deg å oppnå bedre lånebetingelser gjennom våre partnere",
                          "Få kredittscoren din og anbefalinger innen minutter, ikke dager",
                          "Din sikkerhet er vår prioritet med BankID og moderne kryptering",
                          "Enkel tilgang til din kredittvurdering og anbefalinger via vår app",
                          "Få detaljert innsikt i faktorene som påvirker din kredittscore, med personlige forbedringstips",
                        ][index]
                      }
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Middle Section */}
        <section className="py-20 bg-white dark:bg-[#121212]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary/20 dark:to-primary/10 rounded-3xl relative overflow-hidden shadow-sm">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-[350px]">
                    <div className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg mb-4 transition-all hover:-translate-y-1 duration-300">
                      <div className="flex items-center gap-4 mb-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <div className="font-medium dark:text-[#E0E0E0]">
                          Personlig kredittscore
                        </div>
                      </div>
                      <div className="h-2 bg-primary/10 dark:bg-primary/20 rounded-full w-4/5 mb-2"></div>
                      <div className="h-2 bg-primary/10 dark:bg-primary/20 rounded-full w-full"></div>
                    </div>
                    <div className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg transition-all hover:-translate-y-1 duration-300">
                      <div className="flex items-center gap-4 mb-3">
                        <LineChart className="h-6 w-6 text-primary" />
                        <div className="font-medium dark:text-[#E0E0E0]">
                          Forbedringsmuligheter
                        </div>
                      </div>
                      <div className="h-20 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-end p-2">
                        {[4, 3, 5, 2, 6, 3].map((height, i) => (
                          <div
                            key={i}
                            className={`w-1/6 h-${height}/6 ${i === 4 ? "bg-primary" : "bg-primary/40"} rounded-sm mx-1`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight dark:text-[#FAFAFA]">
                  Revolusjonerende kredittvurdering, skreddersydd for deg
                </h2>
                <p className="text-lg text-gray-600 dark:text-[#B0B0B0] mb-6 leading-relaxed">
                  Vi har utviklet en helhetlig tilnærming til kredittvurdering
                  med fokus på det som betyr mest: rettferdighet,
                  tilgjengelighet og økonomiske muligheter for alle.
                </p>

                <div className="space-y-4">
                  {[GraduationCap, Wallet].map((Icon, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 dark:text-[#E0E0E0]">
                          {index === 0
                            ? "AI-drevet kredittvurdering"
                            : "Tilgang til bedre lånetilbud"}
                        </h4>
                        <p className="text-gray-600 dark:text-[#B0B0B0]">
                          {index === 0
                            ? "Få personlige analyser og forbedringstips basert på din unike finansielle situasjon"
                            : "Vår kredittvurdering gir deg tilgang til konkurransedyktige lånetilbud fra våre partnere"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href="/how-it-works">
                    <Button
                      variant="outline"
                      className="group rounded-full px-6 py-5 font-medium dark:border-white dark:text-white dark:hover:bg-white/10"
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

        {/* CTA Section */}
        <section className="relative bg-primary text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-white/10 hidden md:block"></div>
          <div className="absolute bottom-[-15%] left-[-10%] w-[250px] h-[250px] rounded-full bg-white/5"></div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)] bg-[length:500px_500px] animate-[gradient_20s_linear_infinite]"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-[#FAFAFA]">
                Klar for bedre finansielle muligheter?
              </h2>
              <p className="text-lg md:text-xl text-[#E0E0E0] mb-10 leading-relaxed">
                Registrer deg på under 5 minutter og få umiddelbar tilgang til
                vår innovative kredittvurdering og personlige finansielle
                rådgivning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="default"
                    className="group w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-[1.1rem] font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Opprett konto
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/kontakt">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group w-full sm:w-auto border-white text-white bg-transparent hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-[1.1rem] font-medium border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Kontakt oss
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left max-w-4xl mx-auto">
                {[
                  "Ingen skjulte gebyrer",
                  "Sikker og trygg plattform",
                  "Støtte 24/7 for alle kunder",
                ].map((text, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-[#FAFAFA] text-sm md:text-base">
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
