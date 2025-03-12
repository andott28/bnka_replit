
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
          <p className="text-sm text-gray-500">© 2023 BNKA. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/kontakt" className="text-gray-500 hover:text-gray-900">
              Kontakt oss
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
