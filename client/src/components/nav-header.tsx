import { Link } from "wouter";
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

export function NavHeader() {
  const { user } = useAuth();

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
            <Link href="/hvordan-det-fungerer">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Hvordan Det Fungerer
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
          <Link href="/hvordan-det-fungerer">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Hvordan Det Fungerer
            </Button>
          </Link>
          <Link href="/kontakt">
            <Button fullWidth variant="text" sx={{ justifyContent: 'start' }}>
              Kontakt
            </Button>
          </Link>
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