import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Check, Warning, TrendingUp, TrendingDown, Lightbulb } from "@mui/icons-material";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";

const gradeColors = {
  A: "#4CAF50",
  B: "#8BC34A",
  C: "#FFC107",
  D: "#FF9800",
  E: "#FF5722",
  F: "#F44336"
};

export default function CreditScoreResult() {
  const [, setLocation] = useLocation();
  
  const { data: creditScore, isLoading } = useQuery({
    queryKey: ["/api/loans/latest-credit-score"],
    queryFn: async () => {
      const res = await fetch("/api/loans/latest-credit-score");
      if (!res.ok) throw new Error("Failed to fetch credit score");
      return res.json();
    }
  });

  if (isLoading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Card sx={{ maxWidth: 800, margin: "0 auto" }}>
          <CardHeader 
            title="Din Kredittvurdering"
            subheader="Basert på din lånesøknad og økonomiske situasjon"
          />
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Typography variant="h1" sx={{ 
                fontSize: "4rem",
                fontWeight: "bold",
                color: gradeColors[creditScore.grade as keyof typeof gradeColors]
              }}>
                {creditScore.grade}
              </Typography>
              <Box sx={{ ml: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {creditScore.explanation}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Dine styrker</Typography>
              <List>
                {creditScore.strengths.map((strength: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Check color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Områder for forbedring</Typography>
              <List>
                {creditScore.weaknesses.map((weakness: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={weakness} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Anbefalinger</Typography>
              <List>
                {creditScore.recommendations.map((recommendation: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="info" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
