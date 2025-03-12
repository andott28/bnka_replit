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
        <Link href="/">
          <Button variant="link" className="text-2xl font-bold text-primary p-0">
            BNKA
          </Button>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/hvordan-det-fungerer">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Hvordan det fungerer
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
            {user ? (
              <>
                <NavigationMenuItem>
                  <Link href="/dashboard">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Oversikt
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/apply">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Søk om lån
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {user.isAdmin && (
                  <NavigationMenuItem>
                    <Link href="/admin">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
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
              <NavigationMenuItem>
                <Link href="/auth">
                  <Button>Logg inn</Button>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}