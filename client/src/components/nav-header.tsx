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

export function NavHeader() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Button variant="link" className="p-0 h-auto">
            <img src="/attached_assets/bnkaLogo1.png" alt="BNKA" className="h-8" />
          </Button>
        </Link>

        {/* Hovedmeny */}
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            {user ? (
              <>
                {/* Hjem */}
                <NavigationMenuItem>
                  <Link href="/">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Hjem
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* Produkter og tjenester */}
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Produkter og tjenester
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* CTA - Søk om lån */}
                <NavigationMenuItem>
                  <Link href="/apply">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Søk om nytt lån
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* Brukermeny */}
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
                <NavigationMenuItem>
                  <Button
                    variant="outline"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Logg ut
                  </Button>
                </NavigationMenuItem>
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
                  <Link href="/auth">
                    <Button>Logg inn</Button>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}