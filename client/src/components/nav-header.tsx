import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@mui/material";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect } from "react";

export function NavHeader() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Funksjon for å håndtere klikk på "Søk Lån" når man ikke er innlogget
  const handleLoanApplicationClick = () => {
    // Lagre informasjon om at brukeren ønsket å søke om lån
    localStorage.setItem("redirectAfterLogin", "/apply");
    // Omdirigere til innloggingssiden
    setLocation("/auth");
  };

  // Sjekk ved lasting om det finnes en redirect etter innlogging
  useEffect(() => {
    if (user && location === "/auth") {
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        setLocation(redirectPath);
      }
    }
  }, [user, location, setLocation]);

  const NavItems = () => (
    <>
      {user ? (
        <>
          <NavigationMenuItem>
            <Link href="/">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Hjem
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/tjenester">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Tjenester
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/apply">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Søk Lån
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/dashboard">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Min side
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          {user.isAdmin && (
            <NavigationMenuItem>
              <Link href="/admin">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Administrasjon
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <Link href="/">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Hjem
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/tjenester">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Tjenester
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/kontakt">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Kontakt
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <button onClick={handleLoanApplicationClick}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Søk Lån
              </NavigationMenuLink>
            </button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/auth">
              <Button variant="contained" color="primary">Logg inn</Button>
            </Link>
          </NavigationMenuItem>
        </>
      )}
    </>
  );

  const MobileNavItems = () => (
    <>
      {user ? (
        <>
          <Link href="/">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Hjem
            </Button>
          </Link>
          <Link href="/tjenester">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Tjenester
            </Button>
          </Link>
          <Link href="/apply">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Søk Lån
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Min side
            </Button>
          </Link>
          {user.isAdmin && (
            <Link href="/admin">
              <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
                Administrasjon
              </Button>
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Hjem
            </Button>
          </Link>
          <Link href="/tjenester">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Tjenester
            </Button>
          </Link>
          <Link href="/kontakt">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Kontakt
            </Button>
          </Link>
          <button onClick={handleLoanApplicationClick} className="w-full text-left">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Søk Lån
            </Button>
          </button>
          <Link href="/auth">
            <Button fullWidth variant="contained" color="primary">Logg inn</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo - Til venstre */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img 
              src="/images/logo.png" 
              alt="BNKA" 
              className="h-8" 
              style={{ 
                objectFit: 'contain',
                maxWidth: '140px'
              }} 
            />
          </Link>
        </div>

        {/* Desktop Navigation - Til høyre, KUN synlig på desktop */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavItems />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation - KUN synlig på mobil/nettbrett */}
        <div className="block md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="text" sx={{ minWidth: 'auto' }}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Meny</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-4">
                <MobileNavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}