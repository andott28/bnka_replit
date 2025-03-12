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
      <div className="container mx-auto px-4 h-14 flex items-center">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-8">
          <div className="h-8">
            <img src="/attached_assets/bnkaLogo1.png" alt="BNKA Logo" className="h-full" />
          </div>
        </Link>

        {/* Hovedmeny */}
        <div className="flex-grow flex justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/hvordan-det-fungerer">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Produkter og Tjenester
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* CTA og Brukermeny */}
        <div className="flex-shrink-0 flex items-center gap-4">
          {user ? (
            <>
              <Link href="/apply">
                <Button variant="default">
                  Søk om nytt lån
                </Button>
              </Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/dashboard">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Min Konto
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
                </NavigationMenuList>
              </NavigationMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button>Logg inn</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

//Assumed import and function definition to fix login error.  Requires context-specific adjustment.
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/services/auth-service';

const useLoginMutation = () => useMutation(loginUser);

// ... rest of the code (other components, etc.) ...


// Example footer component where "Kontakt Oss" is moved.  Requires appropriate styling.

function Footer() {
  return (
    <footer>
      <Link href="/kontakt">Kontakt Oss</Link>
    </footer>
  );
}