
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 bg-muted">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">Hurtiglenker</h3>
          <div className="flex flex-col gap-2">
            <Link href="/kontakt" className="text-muted-foreground hover:text-foreground">
              Kontakt oss
            </Link>
            <p className="text-sm text-muted-foreground">© 2023 BNKA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
