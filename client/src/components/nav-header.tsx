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
import { cn } from "@/lib/utils"; // Import cn utility
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
    localStorage.setItem("redirectAfterLogin", routes.loanApplication);
    // Omdirigere til innloggingssiden
    setLocation(routes.auth);
  };

  // Sjekk ved lasting om det finnes en redirect etter innlogging
  useEffect(() => {
    if (user && location === routes.auth) {
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        setLocation(redirectPath);
      }
    }
  }, [user, location, setLocation]);

  // Funksjon for å sjekke om en rute er aktiv
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Korrekte rutenavn fra App.tsx
  const routes = {
    home: "/",
    tjenester: "/tjenester",
    loanApplication: "/apply",
    dashboard: "/dashboard",
    admin: "/admin",
    auth: "/auth"
  };

  // Lager en unik NavLink-komponent for å unngå duplisering
  const NavLink = ({ 
    href, 
    label, 
    active, 
    onClick 
  }: { 
    href?: string, 
    label: string, 
    active: boolean, 
    onClick?: () => void 
  }) => {
    const content = (
      <span className={cn(
        "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
        active ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}>
        {label}
        <span className={cn(
          "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}></span>
      </span>
    );

    if (href) {
      return (
        <NavigationMenuItem className="relative">
          <Link href={href}>
            {content}
          </Link>
        </NavigationMenuItem>
      );
    }
    
    return (
      <NavigationMenuItem className="relative">
        <div onClick={onClick}>
          {content}
        </div>
      </NavigationMenuItem>
    );
  };

  const NavItems = () => (
    <>
      {user ? (
        <>
          <NavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <NavLink href={routes.tjenester} label="Tjenester" active={isActive(routes.tjenester)} />
          <NavLink href={routes.loanApplication} label="Søk Lån" active={isActive(routes.loanApplication)} />
          <NavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <NavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
        </>
      ) : (
        <>
          <NavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <NavLink href={routes.tjenester} label="Tjenester" active={isActive(routes.tjenester)} />
          <NavLink label="Søk Lån" active={false} onClick={handleLoanApplicationClick} />
          
          <NavigationMenuItem>
            <Link href={routes.auth}>
              <Button 
                variant="contained" 
                color="primary"
                className="rounded-full px-4 py-2 font-medium text-sm"
              >
                Logg inn
              </Button>
            </Link>
          </NavigationMenuItem>
        </>
      )}
    </>
  );

  // Lager en unik MobileNavLink-komponent for å unngå duplisering
  const MobileNavLink = ({ 
    href, 
    label, 
    active, 
    onClick 
  }: { 
    href?: string, 
    label: string, 
    active: boolean, 
    onClick?: () => void 
  }) => {
    const content = (
      <div className={cn(
        "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
        active ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
      )}>
        {label}
        <span className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}></span>
      </div>
    );

    if (href) {
      return (
        <Link href={href}>
          {content}
        </Link>
      );
    }
    
    return (
      <div onClick={onClick}>
        {content}
      </div>
    );
  };

  const MobileNavItems = () => (
    <>
      {user ? (
        <div className="flex flex-col space-y-1">
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink href={routes.loanApplication} label="Søk Lån" active={isActive(routes.loanApplication)} />
          <MobileNavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <MobileNavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink label="Søk Lån" active={false} onClick={handleLoanApplicationClick} />
          
          <Link href={routes.auth} className="mt-4">
            <Button 
              fullWidth 
              variant="contained" 
              color="primary"
              className="rounded-full py-2 font-medium text-sm"
            >
              Logg inn
            </Button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Til venstre */}
        <div className="flex-shrink-0">
          <Link href={routes.home}>
            <img 
              src="/images/logo.png" 
              alt="BNKA" 
              className="h-8 cursor-pointer" 
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
              <Button 
                variant="text" 
                sx={{ minWidth: 'auto' }}
                className="text-primary"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Meny</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col mt-6">
                <MobileNavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}