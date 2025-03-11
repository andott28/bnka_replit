import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/nav-header";
import { Link } from "wouter";
import { 
  CreditCard, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
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
                Smart Banking for a Better Future
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Experience seamless digital banking with quick loan approvals and
                personalized financial solutions.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="group">
                  Get Started
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
              Why Choose BNKA?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <CreditCard className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Easy Loan Application</h3>
                <p className="text-gray-600">
                  Apply for loans online with our simple and secure application process
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <Clock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Quick Approval</h3>
                <p className="text-gray-600">
                  Get loan decisions fast with our efficient evaluation system
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
                <p className="text-gray-600">
                  Your data is protected with industry-leading security measures
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
                Ready to Start Your Financial Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of satisfied customers who trust BNKA for their banking needs
              </p>
              <Link href="/auth">
                <Button size="lg" className="group">
                  Open Account Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About BNKA</h3>
              <p className="text-gray-400">
                Your trusted partner in digital banking and financial solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth">
                    <Button variant="link" className="text-gray-400 p-0 h-auto">Login</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/auth">
                    <Button variant="link" className="text-gray-400 p-0 h-auto">Register</Button>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Need help? Contact our support team.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BNKA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}