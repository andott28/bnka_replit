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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

export function NavHeader() {
  const { user, logoutMutation } = useAuth();
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
          <NavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <NavLink href={routes.loanApplication} label="Kredittvurdering" active={isActive(routes.loanApplication)} />
          <NavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <NavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
          
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group text-muted-foreground hover:text-primary">
                <div className="w-5 h-5 rounded-full bg-primary/10 mr-2 flex items-center justify-center text-primary font-medium text-xs">
                  {user.firstName?.charAt(0) || user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span>{user.firstName || user.username}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 py-2">
                <DropdownMenuItem className="p-0 focus:bg-transparent" onSelect={() => logoutMutation.mutate()}>
                  <div className="w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 flex items-center cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logg ut
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </>
      ) : (
        <>
          <NavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <NavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <NavLink label="Kredittvurdering" active={false} onClick={handleLoanApplicationClick} />
          
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
          <div className="mx-3 mb-2 flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 mr-2 flex items-center justify-center text-primary font-medium text-sm">
              {user.firstName?.charAt(0) || user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.firstName || user.username}</span>
              <span className="text-xs text-muted-foreground">Innlogget</span>
            </div>
          </div>
          
          <div className="px-3 border-t border-border my-2"></div>
          
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">NAVIGASJON</div>
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink href={routes.loanApplication} label="Kredittvurdering" active={isActive(routes.loanApplication)} />
          <MobileNavLink href={routes.dashboard} label="Min side" active={isActive(routes.dashboard)} />
          {user.isAdmin && (
            <MobileNavLink href={routes.admin} label="Administrasjon" active={isActive(routes.admin)} />
          )}
          
          <div className="px-3 border-t border-border my-2"></div>
          
          <DropdownMenuItem className="p-0 focus:bg-transparent" onSelect={() => logoutMutation.mutate()}>
            <div className="w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 flex items-center cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Logg ut
            </div>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">NAVIGASJON</div>
          <MobileNavLink href={routes.home} label="Hjem" active={isActive(routes.home)} />
          <MobileNavLink href={routes.tjenester} label="Våre tjenester" active={isActive(routes.tjenester)} />
          <MobileNavLink label="Kredittvurdering" active={false} onClick={handleLoanApplicationClick} />
          
          <div className="px-3 pt-3 pb-1 border-t border-border mt-2"></div>
          
          <DropdownMenuItem className="p-0 mt-1" asChild>
            <Link href={routes.auth} className="w-full">
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                className="rounded-md py-2 font-medium text-sm w-full mx-2"
                sx={{ textTransform: 'none', width: 'calc(100% - 16px)' }}
              >
                Logg inn
              </Button>
            </Link>
          </DropdownMenuItem>
        </>
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
              alt="Styr AS" 
              className="h-8 cursor-pointer" 
              style={{ 
                objectFit: 'contain',
                maxWidth: '140px'
              }} 
            />
          </Link>
        </div>

        {/* Desktop Navigation - Til høyre, KUN synlig på desktop */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavItems />
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Theme toggle knapp */}
          <Button
            variant="text"
            sx={{ minWidth: 'auto', padding: '8px' }}
            className="ml-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
            title={theme === "dark" ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation - KUN synlig på mobil/nettbrett */}
        <div className="block md:hidden">
          <div className="flex items-center gap-2">
            {/* Theme toggle knapp for mobil */}
            <Button
              variant="text"
              sx={{ minWidth: 'auto', padding: '8px' }}
              className="text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {/* Hamburger menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="text" 
                  sx={{ minWidth: 'auto', padding: '10px' }}
                  className="text-primary hover:bg-primary/10 rounded-full"
                >
                  <Menu className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 py-2">
                <nav className="flex flex-col">
                  <MobileNavItems />
                </nav>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}