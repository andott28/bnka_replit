
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
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">
            Våre tjenester
          </h1>

          {/* Services Introduction */}
          <div className="text-center mb-12">
            <p className="text-lg text-gray-700 mb-4">
              Styr AS tilbyr avansert kredittvurdering designet for å gi alle en
              rettferdig vurdering av deres lånemuligheter. Vår AI-drevne plattform
              gir deg bedre innsikt i din finansielle situasjon.
            </p>
          </div>

          {/* Our Services - Endret seksjon */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Våre kredittvurderingstjenester
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Personlig kredittscore</h3>
                <p className="text-sm text-gray-600 break-words">
                  Få din kredittscore beregnet ved hjelp av vår avanserte AI-teknologi
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Forbedringsanalyse</h3>
                <p className="text-sm text-gray-600 break-words">
                  Personlige tips om hvordan du kan forbedre din kredittscore
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Lånemuligheter</h3>
                <p className="text-sm text-gray-600 break-words">
                  Se hvilke lånetilbud du kan kvalifisere for gjennom våre partnere
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Kontinuerlig overvåking</h3>
                <p className="text-sm text-gray-600 break-words">
                  Vi gir deg beskjed når din kredittverdi endrer seg
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Process Section - Oppdatert */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">
              Slik fungerer kredittvurderingen
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-medium mb-1">Opprett konto</h3>
                <p className="text-sm text-gray-600">
                  Registrer deg på vår plattform
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-medium mb-1">Verifisering</h3>
                <p className="text-sm text-gray-600">
                  Bekreft din identitet med BankID
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-medium mb-1">AI-analyse</h3>
                <p className="text-sm text-gray-600">Vi analyserer din finansielle profil</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="font-medium mb-1">Resultater</h3>
                <p className="text-sm text-gray-600">
                  Få din kredittscore og personlige anbefalinger
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section - Oppdatert */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Ofte stilte spørsmål
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Hva er en kredittscore?</AccordionTrigger>
                <AccordionContent>
                  En kredittscore er et tall som representerer din kredittverdighet,
                  basert på din finansielle historikk. Jo høyere score, jo bedre lånemuligheter
                  og betingelser kan du vanligvis oppnå hos långivere.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Hvordan beregnes min kredittscore hos Styr AS?</AccordionTrigger>
                <AccordionContent>
                  Vår AI-drevne teknologi analyserer flere datapunkter enn tradisjonelle 
                  kredittvurderingssystemer. Vi ser på inntektshistorikk, betalingshistorikk, 
                  gjeldsnivå, kreditthistorie og andre relevante økonomiske faktorer for å gi 
                  et mer helhetlig bilde av din finansielle situasjon.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Hvor lang tid tar en kredittvurdering?
                </AccordionTrigger>
                <AccordionContent>
                  Vårt AI-system gir deg din kredittscore og personlige anbefalinger på bare 
                  noen få minutter etter at du har bekreftet din identitet med BankID.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Er min informasjon trygg hos dere?
                </AccordionTrigger>
                <AccordionContent>
                  Ja, vi bruker banknivå sikkerhet og kryptering for å beskytte all din 
                  personlige og finansielle informasjon. All data behandles i samsvar med 
                  GDPR og norske personvernlover.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Hvordan kan jeg forbedre min kredittscore?
                </AccordionTrigger>
                <AccordionContent>
                  Vår plattform gir personlige anbefalinger basert på din unike finansielle 
                  situasjon. Generelle tips inkluderer: betale regninger i tide, redusere 
                  kredittkortsaldo, unngå å søke om mye kreditt på kort tid, og ha et sunt 
                  forhold mellom inntekt og gjeld.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Section - Oppdatert */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Klar til å få din kredittvurdering?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Det tar kun noen få minutter å få din personlige kredittscore og anbefalinger
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
