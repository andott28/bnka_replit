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
                Søk om nytt lån
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
              <Button>Logg inn</Button>
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
            <Button variant="ghost" className="w-full justify-start">
              Hjem
            </Button>
          </Link>
          <Link href="/apply">
            <Button variant="ghost" className="w-full justify-start">
              Søk om nytt lån
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              Min side
            </Button>
          </Link>
          {user.isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                Administrasjon
              </Button>
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              Hjem
            </Button>
          </Link>
          <Link href="/hvordan-det-fungerer">
            <Button variant="ghost" className="w-full justify-start">
              Hvordan Det Fungerer
            </Button>
          </Link>
          <Link href="/kontakt">
            <Button variant="ghost" className="w-full justify-start">
              Kontakt
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="w-full">Logg inn</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            <NavItems />
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
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
    </header>
  );
}