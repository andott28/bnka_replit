import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Produkter og tjenester
            </NavigationMenuLink>
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Button variant="link" className="p-0 h-auto">
            <img src="/attached_assets/bnkaLogo1.png" alt="BNKA" className="h-8" />
          </Button>
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
              <NavItems />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}