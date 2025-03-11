import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileCheck, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">Slik fungerer det</h1>
          
          {/* Process Steps */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">1. Søk online</h3>
                <p className="text-sm text-gray-600">
                  Fyll ut vår enkle online-søknad med personlig informasjon
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">2. Verifisering</h3>
                <p className="text-sm text-gray-600">
                  Vi verifiserer din identitet og kreditthistorikk
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">3. Rask behandling</h3>
                <p className="text-sm text-gray-600">
                  Få svar på søknaden innen 24 timer
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">4. Utbetaling</h3>
                <p className="text-sm text-gray-600">
                  Pengene overføres direkte til din konto
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Ofte stilte spørsmål</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Hvem kan søke om lån?</AccordionTrigger>
                <AccordionContent>
                  For å søke om lån må du være over 18 år, ha fast inntekt og være bosatt i Norge. Det kreves også en årlig minsteinntekt på 200 000 kr.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Hvor mye kan jeg låne?</AccordionTrigger>
                <AccordionContent>
                  Du kan søke om lån fra 10 000 kr til 1 000 000 kr. Det endelige lånebeløpet avhenger av din inntekt, utgifter og kreditthistorikk.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Hvor lang tid tar behandlingen?</AccordionTrigger>
                <AccordionContent>
                  De fleste søknader behandles innen 24 timer. Når lånet er godkjent, overføres pengene vanligvis samme dag.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Hvilke dokumenter trenger jeg?</AccordionTrigger>
                <AccordionContent>
                  Du trenger gyldig legitimasjon og dokumentasjon på inntekt (lønnsslipp eller skattemelding). For selvstendig næringsdrivende kreves også næringsoppgave.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Kan jeg betale ned lånet tidligere?</AccordionTrigger>
                <AccordionContent>
                  Ja, du kan når som helst gjøre ekstra innbetalinger eller innfri lånet i sin helhet uten ekstra kostnader.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Klar til å komme i gang?</h2>
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
