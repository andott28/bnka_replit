import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/nav-header";
import { Footer } from "@/components/footer";
import { Link } from "wouter";
import {
  CreditCard,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  // Assuming 'user' is available from context or props.  Replace with your actual implementation.
  const user = true; // Replace with your actual user authentication logic

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:500px_500px] animate-[gradient_15s_linear_infinite]"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-6 leading-tight bg-clip-text">
                Fremtidens bank i dag
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Opplev sømløs digital banking med rask lånesøknad og
                personlige finansielle løsninger.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="group">
                  Kom i gang
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Hvorfor velge BNKA?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <CreditCard className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Komplett banktjeneste</h3>
                <p className="text-gray-600">
                  Alt fra bankkontoer og kort til lån og betalinger i én plattform
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <Clock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Rask behandling</h3>
                <p className="text-gray-600">
                  Få svar på lånesøknader og andre tjenester raskt og effektivt
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Sikker plattform</h3>
                <p className="text-gray-600">
                  Din sikkerhet er vår prioritet med moderne beskyttelsesmetoder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Klar for å starte din finansielle reise?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Bli med tusenvis av fornøyde kunder som stoler på BNKA for sine banktjenester
              </p>
              <Link href="/auth">
                <Button size="lg" className="group">
                  Åpne konto nå
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}