import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  AlertTriangle, 
  BadgeInfo
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Definere typer for kredittscore-data
interface CreditScoreData {
  score?: string;
  grade?: string;
  numerisk_score?: number;
  forklaring?: string;
  styrker?: string[];
  svakheter?: string[];
  anbefalinger?: string[];
  faktorer?: {
    inntektsstabilitet: number;
    gjeldsbelastning: number;
    betalingshistorikk: number;
    tilpasningsevne: number;
    utdanningsrelevans: number;
    språkferdigheter: number;
    nettverk: number;
  };
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-800",
  B: "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800",
  C: "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-800",
  D: "bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-800",
  E: "bg-rose-100 text-rose-800 hover:bg-rose-200 hover:text-rose-800",
  F: "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-800"
};

const gradeDescriptions: Record<string, string> = {
  A: "Utmerket kredittverdighet",
  B: "Veldig god kredittverdighet",
  C: "God kredittverdighet",
  D: "Middels kredittverdighet",
  E: "Svak kredittverdighet",
  F: "Lav kredittverdighet"
};

export function CreditScoreWidget() {
  const { data: creditScore, isLoading, error } = useQuery<CreditScoreData>({
    queryKey: ["/api/loans/latest-credit-score"],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !creditScore) {
    return (
      <div className="text-center py-4 space-y-2">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
        <p className="text-gray-500 dark:text-gray-400">
          Kunne ikke hente kredittvurdering. Prøv igjen senere.
        </p>
      </div>
    );
  }
  
  // Sikre at vi bruker riktig feltnavn (score, ikke grade)
  const grade = creditScore.score || creditScore.grade || "C";

  return (
    <Card className="border-none shadow-none bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div 
            className="flex items-center justify-center w-20 h-20 rounded-full relative"
            style={{
              background: `conic-gradient(
                ${getGradeColor(grade, true)} ${creditScore.numerisk_score}%,
                #e5e5e5 0%
              )`
            }}
          >
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: getGradeColor(grade) }}>
                {grade}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={gradeColors[grade] || "bg-gray-100 text-gray-800"}>
                {gradeDescriptions[grade] || "Ukjent kredittverdighet"}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {creditScore.numerisk_score}/100 poeng
              </span>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
              {creditScore.forklaring || "Din kredittvurdering er basert på en helhetlig analyse av din økonomiske situasjon."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                  {creditScore.styrker && creditScore.styrker.length > 0 
                    ? creditScore.styrker[0] 
                    : "Ingen spesifikke styrker identifisert"}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                  {creditScore.svakheter && creditScore.svakheter.length > 0 
                    ? creditScore.svakheter[0] 
                    : "Ingen spesifikke svakheter identifisert"}
                </span>
              </div>
              
              <div className="flex items-start gap-2 md:col-span-2">
                <BadgeInfo className="h-4 w-4 text-blue-600 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                  {creditScore.anbefalinger && creditScore.anbefalinger.length > 0 
                    ? creditScore.anbefalinger[0] 
                    : "Ingen spesifikke anbefalinger tilgjengelig"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hjelpefunksjon for å få farge basert på karakter
function getGradeColor(grade: string, isHex: boolean = false): string {
  const colorMap: Record<string, string> = {
    A: isHex ? "#10b981" : "text-emerald-600", // Emerald (Grønn)
    B: isHex ? "#22c55e" : "text-green-600",   // Grønn
    C: isHex ? "#f59e0b" : "text-amber-600",   // Amber (Gul)
    D: isHex ? "#f97316" : "text-orange-600",  // Oransje
    E: isHex ? "#e11d48" : "text-rose-600",    // Rose (Rosa-Rød)
    F: isHex ? "#ef4444" : "text-red-600"      // Rød
  };

  return colorMap[grade] || (isHex ? "#6b7280" : "text-gray-600");
}