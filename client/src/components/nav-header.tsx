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
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()} 
              onClick={() => setLocation("/")}
            >
              Hjem
            </NavigationMenuLink>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={() => setLocation("/tjenester")}
            >
              Tjenester
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={() => setLocation("/apply")}
            >
              Søk Lån
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={() => setLocation("/dashboard")}
            >
              Min side
            </NavigationMenuLink>
          </NavigationMenuItem>

          {user.isAdmin && (
            <NavigationMenuItem>
              <NavigationMenuLink 
                className={navigationMenuTriggerStyle()}
                onClick={() => setLocation("/admin")}
              >
                Administrasjon
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={() => setLocation("/")}
            >
              Hjem
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={() => setLocation("/tjenester")}
            >
              Tjenester
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              onClick={handleLoanApplicationClick}
            >
              Søk Lån
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setLocation("/auth")}
            >
              Logg inn
            </Button>
          </NavigationMenuItem>
        </>
      )}
    </>
  );

  const MobileNavItems = () => (
    <>
      {user ? (
        <>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/")}
          >
            Hjem
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/tjenester")}
          >
            Tjenester
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/apply")}
          >
            Søk Lån
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/dashboard")}
          >
            Min side
          </Button>
          {user.isAdmin && (
            <Button 
              fullWidth 
              variant="text" 
              sx={{ justifyContent: 'start' }}
              onClick={() => setLocation("/admin")}
            >
              Administrasjon
            </Button>
          )}
        </>
      ) : (
        <>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/")}
          >
            Hjem
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={() => setLocation("/tjenester")}
          >
            Tjenester
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ justifyContent: 'start' }}
            onClick={handleLoanApplicationClick}
          >
            Søk Lån
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            color="primary"
            onClick={() => setLocation("/auth")}
          >
            Logg inn
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo - Til venstre */}
        <div className="flex-shrink-0">
          <img 
            src="/images/logo.png" 
            alt="BNKA" 
            className="h-8 cursor-pointer" 
            style={{ 
              objectFit: 'contain',
              maxWidth: '140px'
            }} 
            onClick={() => setLocation("/")}
          />
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