import { useState } from "react";
import { useLocation, useRoute, useRouter } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { login, register, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match] = useRoute("/auth");

  // If already authenticated and on auth page, redirect to dashboard
  if (isAuthenticated && match) {
    // Use a setTimeout to avoid state updates during render
    setTimeout(() => {
      setLocation("/dashboard");
    }, 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login({ username, password });
    } else {
      await register({ username, password, fullName });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:order-2 bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isLogin ? "Logg inn" : "Opprett konto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  placeholder="din.epost@eksempel.no"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Fullt navn</Label>
                  <Input
                    id="name"
                    placeholder="Ola Nordmann"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" type="submit">
                {isLogin ? "Logg inn" : "Opprett konto"}
              </Button>

              <div className="text-center">
                <span className="text-sm">
                  {isLogin ? "Har ikke konto? " : "Har allerede konto? "}
                </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(!isLogin)}
                  type="button"
                >
                  {isLogin ? "Registrer deg" : "Logg inn"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="hidden lg:block p-8">
          <div className="h-full flex flex-col justify-between text-white">
            <div>
              <h1 className="text-4xl font-bold mb-4">Bankrevolusjon</h1>
              <p className="text-xl">
                Din trygge, enkle og moderne bankløsning
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Hvorfor velge oss?
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Ingen skjulte gebyrer
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Mobil- og nettbank med topp sikkerhet
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  Sikker kundeidentifikasjon
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}