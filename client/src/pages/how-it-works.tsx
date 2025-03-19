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
              BNKA tilbyr et bredt spekter av finansielle tjenester designet for
              å møte dine behov. Vår digitale plattform gjør det enkelt å få
              tilgang til moderne bankløsninger.
            </p>
          </div>

          {/* Our Services - Endret seksjon */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Våre lånetjenester
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Forbrukslån</h3>
                <p className="text-sm text-gray-600 break-words">
                  Fleksible lån til personlige behov med konkurransedyktige
                  betingelser
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Refinansiering</h3>
                <p className="text-sm text-gray-600 break-words">
                  Samle dine lån og få bedre betingelser med vår
                  refinansieringsløsning
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Billån</h3>
                <p className="text-sm text-gray-600 break-words">
                  Attraktive betingelser for billån med rask behandling
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="pt-4 px-2 flex flex-col flex-grow">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Kredittkort</h3>
                <p className="text-sm text-gray-600 break-words">
                  Få tilgang til våre eksklusive kredittkort med fordeler
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Process Section - Uendret */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">
              Slik søker du
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-medium mb-1">Søk online</h3>
                <p className="text-sm text-gray-600">
                  Fyll ut søknaden på nett
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-medium mb-1">Verifisering</h3>
                <p className="text-sm text-gray-600">
                  Vi kontrollerer din informasjon
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-medium mb-1">Godkjenning</h3>
                <p className="text-sm text-gray-600">Svar innen 24 timer</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="font-medium mb-1">Utbetaling</h3>
                <p className="text-sm text-gray-600">
                  Pengene overføres til din konto
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section - Uendret */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Ofte stilte spørsmål
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Hvem kan søke om lån?</AccordionTrigger>
                <AccordionContent>
                  For å søke om lån må du være over 18 år, ha fast inntekt og
                  være bosatt i Norge. Det kreves også en årlig minsteinntekt på
                  200 000 kr.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Hvor mye kan jeg låne?</AccordionTrigger>
                <AccordionContent>
                  Du kan søke om lån fra 10 000 kr til 1 000 000 kr. Det
                  endelige lånebeløpet avhenger av din inntekt, utgifter og
                  kreditthistorikk.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Hvor lang tid tar behandlingen?
                </AccordionTrigger>
                <AccordionContent>
                  De fleste søknader behandles innen 24 timer. Når lånet er
                  godkjent, overføres pengene vanligvis samme dag.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Hvilke dokumenter trenger jeg?
                </AccordionTrigger>
                <AccordionContent>
                  Du trenger gyldig legitimasjon og dokumentasjon på inntekt
                  (lønnsslipp eller skattemelding). For selvstendig
                  næringsdrivende kreves også næringsoppgave.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Kan jeg betale ned lånet tidligere?
                </AccordionTrigger>
                <AccordionContent>
                  Ja, du kan når som helst gjøre ekstra innbetalinger eller
                  innfri lånet i sin helhet uten ekstra kostnader.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Section - Uendret */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Klar til å komme i gang?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Det tar kun noen få minutter å søke om lån
            </p>
            <Link href="/apply">
              <Button size="lg" className="group">
                Søk om lån nå
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
