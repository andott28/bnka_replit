import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/nav-header";
import { Link } from "wouter";
import { 
  CreditCard, 
  Shield, 
  Clock,
  CheckCircle 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-6">
                Smart Banking for a Better Future
              </h1>
              <p className="text-xl mb-8">
                Experience seamless digital banking with quick loan approvals and
                personalized financial solutions.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose BNKA?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Easy Loan Application</h3>
                <p className="text-gray-600">
                  Apply for loans online with our simple and secure application process
                </p>
              </div>
              <div className="text-center p-6">
                <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Quick Approval</h3>
                <p className="text-gray-600">
                  Get loan decisions fast with our efficient evaluation system
                </p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-gray-600">
                  Your data is protected with industry-leading security measures
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied customers who trust BNKA for their banking needs
            </p>
            <Link href="/auth">
              <Button size="lg">Open Account Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 BNKA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
