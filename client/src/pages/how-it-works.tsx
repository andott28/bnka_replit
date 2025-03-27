import { Footer } from "@/components/footer";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  FileCheck,
  Clock,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 dark:text-white">
            Våre tjenester
          </h1>

          {/* Services Introduction */}
          <div className="text-center mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Styr AS tilbyr avansert kredittvurdering designet for å gi alle en
              rettferdig vurdering av deres lånemuligheter. Vår AI-drevne
              plattform gir deg bedre innsikt i din finansielle situasjon.
            </p>
          </div>

          {/* Our Services - Endret seksjon */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Våre kredittvurderingstjenester
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col dark:bg-gray-800 dark:border-gray-700 min-w-[200px]">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <FileCheck className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="font-semibold mb-2 text-base sm:text-lg dark:text-white">
                  Personlig kredittscore
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">
                  Få din kredittscore beregnet ved hjelp av vår avanserte
                  AI-teknologi
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col dark:bg-gray-800 dark:border-gray-700 min-w-[200px]">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="font-semibold mb-2 text-base sm:text-lg dark:text-white">
                  Forbedringsanalyse
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">
                  Personlige tips om hvordan du kan forbedre din kredittscore
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col dark:bg-gray-800 dark:border-gray-700 min-w-[200px]">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="font-semibold mb-2 text-base sm:text-lg dark:text-white">
                  Lånemuligheter
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">
                  Se hvilke lånetilbud du kan kvalifisere for gjennom våre
                  partnere
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col dark:bg-gray-800 dark:border-gray-700 min-w-[200px]">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="font-semibold mb-2 text-base sm:text-lg dark:text-white">
                  Kontinuerlig overvåking
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">
                  Vi gir deg beskjed når din kredittverdi endrer seg
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Process Section - Oppdatert */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Slik fungerer kredittvurderingen
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mb-2 sm:mb-3 text-sm sm:text-base">
                  1
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base dark:text-white">
                  Opprett konto
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Registrer deg på vår plattform
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mb-2 sm:mb-3 text-sm sm:text-base">
                  2
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base dark:text-white">
                  Verifisering
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Bekreft din identitet med BankID
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mb-2 sm:mb-3 text-sm sm:text-base">
                  3
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base dark:text-white">
                  AI-analyse
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Vi analyserer din finansielle profil
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mb-2 sm:mb-3 text-sm sm:text-base">
                  4
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base dark:text-white">
                  Resultater
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Få din kredittscore og personlige anbefalinger
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section - Oppdatert */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 dark:text-white">
              Ofte stilte spørsmål
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full dark:text-gray-200"
            >
              <AccordionItem value="item-1" className="dark:border-gray-700">
                <AccordionTrigger className="dark:text-gray-200 text-sm sm:text-base">
                  Hva er en kredittscore?
                </AccordionTrigger>
                <AccordionContent className="dark:text-gray-300 text-sm sm:text-base">
                  En kredittscore er et tall som representerer din
                  kredittverdighet, basert på din finansielle historikk. Jo
                  høyere score, jo bedre lånemuligheter og betingelser kan du
                  vanligvis oppnå hos långivere.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="dark:border-gray-700">
                <AccordionTrigger className="dark:text-gray-200 text-sm sm:text-base">
                  Hvordan beregnes min kredittscore hos Styr AS?
                </AccordionTrigger>
                <AccordionContent className="dark:text-gray-300 text-sm sm:text-base">
                  Vår AI-drevne teknologi analyserer flere datapunkter enn
                  tradisjonelle kredittvurderingssystemer. Vi ser på
                  inntektshistorikk, betalingshistorikk, gjeldsnivå,
                  kreditthistorie og andre relevante økonomiske faktorer for å
                  gi et mer helhetlig bilde av din finansielle situasjon.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="dark:border-gray-700">
                <AccordionTrigger className="dark:text-gray-200 text-sm sm:text-base">
                  Hvor lang tid tar en kredittvurdering?
                </AccordionTrigger>
                <AccordionContent className="dark:text-gray-300 text-sm sm:text-base">
                  Vårt AI-system gir deg din kredittscore og personlige
                  anbefalinger på bare noen få minutter etter at du har
                  bekreftet din identitet med BankID.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="dark:border-gray-700">
                <AccordionTrigger className="dark:text-gray-200 text-sm sm:text-base">
                  Er min informasjon trygg hos dere?
                </AccordionTrigger>
                <AccordionContent className="dark:text-gray-300 text-sm sm:text-base">
                  Ja, vi bruker banknivå sikkerhet og kryptering for å beskytte
                  all din personlige og finansielle informasjon. All data
                  behandles i samsvar med GDPR og norske personvernlover.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="dark:border-gray-700">
                <AccordionTrigger className="dark:text-gray-200 text-sm sm:text-base">
                  Hvordan kan jeg forbedre min kredittscore?
                </AccordionTrigger>
                <AccordionContent className="dark:text-gray-300 text-sm sm:text-base">
                  Vår plattform gir personlige anbefalinger basert på din unike
                  finansielle situasjon. Generelle tips inkluderer: betale
                  regninger i tide, redusere kredittkortsaldo, unngå å søke om
                  mye kreditt på kort tid, og ha et sunt forhold mellom inntekt
                  og gjeld.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Section - Oppdatert */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 dark:text-white">
              Klar til å få din kredittvurdering?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              Det tar kun noen få minutter å få din personlige kredittscore og
              anbefalinger
            </p>
            <Link href="/auth">
              <Button size="lg" className="group">
                Få din kredittscore nå
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
