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
    localStorage.setItem("redirectAfterLogin", "/loan-application");
    // Omdirigere til innloggingssiden
    setLocation("/auth-page");
  };

  // Sjekk ved lasting om det finnes en redirect etter innlogging
  useEffect(() => {
    if (user && location === "/auth-page") {
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

  const NavItems = () => (
    <>
      {user ? (
        <>
          <NavigationMenuItem>
            <Link href="/">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Hjem
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/how-it-works">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/how-it-works") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Tjenester
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/how-it-works") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/loan-application">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/loan-application") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Søk Lån
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/loan-application") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/dashboard">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Min side
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>

          {user.isAdmin && (
            <NavigationMenuItem>
              <Link href="/admin-dashboard">
                <span className={cn(
                  "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                  isActive("/admin-dashboard") ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}>
                  Administrasjon
                  <span className={cn(
                    "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                    isActive("/admin-dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}></span>
                </span>
              </Link>
            </NavigationMenuItem>
          )}
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <Link href="/">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Hjem
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/how-it-works">
              <span className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                isActive("/how-it-works") ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                Tjenester
                <span className={cn(
                  "absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300",
                  isActive("/how-it-works") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </span>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <span 
              className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                "text-muted-foreground hover:text-primary"
              )}
              onClick={handleLoanApplicationClick}
            >
              Søk Lån
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></span>
            </span>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/auth-page">
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

  const MobileNavItems = () => (
    <>
      {user ? (
        <div className="flex flex-col space-y-1">
          <Link href="/">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Hjem
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          <Link href="/how-it-works">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/how-it-works") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Tjenester
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/how-it-works") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          <Link href="/loan-application">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/loan-application") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Søk Lån
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/loan-application") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          <Link href="/dashboard">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/dashboard") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Min side
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/dashboard") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          {user.isAdmin && (
            <Link href="/admin-dashboard">
              <div className={cn(
                "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
                isActive("/admin-dashboard") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}>
                Administrasjon
                <span className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                  isActive("/admin-dashboard") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}></span>
              </div>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          <Link href="/">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Hjem
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          <Link href="/how-it-works">
            <div className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              isActive("/how-it-works") ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}>
              Tjenester
              <span className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full",
                isActive("/how-it-works") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></span>
            </div>
          </Link>
          
          <div 
            className={cn(
              "w-full px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer relative group",
              "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}
            onClick={handleLoanApplicationClick}
          >
            Søk Lån
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-primary transform transition-all duration-300 rounded-r-full opacity-0 group-hover:opacity-100"></span>
          </div>
          
          <Link href="/auth-page" className="mt-4">
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
          <Link href="/">
            <div className="h-8 font-bold text-xl flex items-center">
              <span className="text-primary">BNK</span>
              <span className="text-secondary">A</span>
            </div>
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