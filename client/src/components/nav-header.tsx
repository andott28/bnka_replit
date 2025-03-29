import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button as MUIButton } from "@mui/material";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils"; // Import cn utility
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

export function NavHeader() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  
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
        active ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-primary dark:text-[#E0E0E0] dark:hover:text-primary"
      )}>
        {label}
        <span className={cn(
          "absolute left-0 right-0 bottom-0 h-[2px] bg-primary dark:bg-primary transform origin-left transition-transform duration-300",
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
          <NavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <NavLink href={routes.loanApplication} label="Kredittvurdering" active={isActive(routes.loanApplication)} />
          <NavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <NavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
        </>
      ) : (
        <>
          <NavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <NavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <NavLink label="Kredittvurdering" active={false} onClick={handleLoanApplicationClick} />
          
          <NavigationMenuItem>
            <Link href={routes.auth}>
              <MUIButton 
                variant="contained" 
                color="primary"
                className="rounded-full px-4 py-2 font-medium text-sm"
              >
                Logg inn
              </MUIButton>
            </Link>
          </NavigationMenuItem>
        </>
      )}
    </>
  );

  // Lager en unik MobileNavLink-komponent for å unngå duplisering i dropdown-menyen
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
        "w-full px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center",
        active ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted hover:text-primary"
      )}>
        {label}
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>}
      </div>
    );

    if (href) {
      return (
        <DropdownMenuItem asChild className="p-0 focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
          <Link href={href} className="w-full">
            {content}
          </Link>
        </DropdownMenuItem>
      );
    }
    
    return (
      <DropdownMenuItem className="p-0 focus:bg-transparent" onSelect={onClick}>
        {content}
      </DropdownMenuItem>
    );
  };

  const MobileNavItems = () => (
    <>
      {user ? (
        <>
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink href={routes.loanApplication} label="Kredittvurdering" active={isActive(routes.loanApplication)} />
          <MobileNavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <MobileNavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
        </>
      ) : (
        <>
          <div className="mb-1 px-3 py-1 text-xs font-medium text-gray-500 uppercase">Meny</div>
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink label="Kredittvurdering" active={false} onClick={handleLoanApplicationClick} />
          
          <div className="border-t my-2"></div>
          
          <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Konto</div>
          <DropdownMenuItem className="p-0 focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
            <Link href={routes.auth} className="w-full">
              <div className="w-full px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center text-primary">
                Logg inn
              </div>
            </Link>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-[#121212] backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Til venstre */}
        <div className="flex-shrink-0">
          <Link href={routes.home}>
            <img 
              src={theme === 'dark' ? "/images/Krivo_White.svg" : "/images/Krivo_Black.svg"} 
              alt="Krivo" 
              className="h-8 cursor-pointer" 
              style={{ 
                objectFit: 'contain',
                maxWidth: '140px'
              }}
              loading="lazy"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Til høyre, KUN synlig på desktop */}
        <div className="hidden md:flex items-center gap-4">          
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavItems />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation - KUN synlig på mobil/nettbrett */}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MUIButton 
                variant="text" 
                sx={{ minWidth: 'auto', padding: '10px' }}
                className="text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10 rounded-full"
              >
                <Menu className="h-8 w-8" />
              </MUIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 py-2">
              <nav className="flex flex-col">
                <MobileNavItems />
              </nav>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}