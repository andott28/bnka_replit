import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoanApplicationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from 'zod'; // Added import for z.boolean()

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(
      insertLoanApplicationSchema.extend({
        birthDate: insertLoanApplicationSchema.shape.birthDate
          .refine((date) => new Date(date) < new Date(), "Fødselsdato må være i fortiden"),
        address: insertLoanApplicationSchema.shape.address
          .min(5, "Vennligst oppgi en gyldig adresse"),
        amount: insertLoanApplicationSchema.shape.amount
          .min(10000, "Minimum lånebeløp er 10 000 kr")
          .max(1000000, "Maksimalt lånebeløp er 1 000 000 kr"),
        income: insertLoanApplicationSchema.shape.income
          .min(200000, "Minimum årsinntekt er 200 000 kr"),
        monthlyExpenses: insertLoanApplicationSchema.shape.monthlyExpenses
          .min(0, "Månedlige utgifter kan ikke være negative"),
        outstandingDebt: insertLoanApplicationSchema.shape.outstandingDebt
          .min(0, "Utestående gjeld kan ikke være negativ"),
        hasConsented: z.boolean().refine((val) => val === true, "Du må godta vilkårene"),
      })
    ),
    defaultValues: {
      amount: 0,
      purpose: "",
      income: 0,
      employmentStatus: "",
      birthDate: "",
      address: "",
      monthlyExpenses: 0,
      outstandingDebt: 0,
      assets: "",
      additionalInfo: "",
      hasConsented: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/loans/apply", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Søknad sendt",
        description: "Din lånesøknad er mottatt og vil bli behandlet.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatNOK = (value: number) => {
    return new Intl.NumberFormat('nb-NO').format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Kredittvurdering</CardTitle>
            <CardDescription className="space-y-4 mt-4">
              <p>
                Takk for at du søker om lån hos oss. For å behandle søknaden din, trenger vi informasjon om din økonomiske situasjon. 
                Vennligst oppgi nøyaktig og fullstendig informasjon etter beste evne.
              </p>
              <p className="text-sm text-muted-foreground">
                Alle felt markert med * er obligatoriske
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personlig informasjon</h3>

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fødselsdato *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Gate, postnummer og sted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ansettelsesforhold *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg ansettelsesforhold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fast">Fast ansatt</SelectItem>
                            <SelectItem value="midlertidig">Midlertidig ansatt</SelectItem>
                            <SelectItem value="selvstendig">Selvstendig næringsdrivende</SelectItem>
                            <SelectItem value="pensjonist">Pensjonist</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="arbeidsledig">Arbeidsledig</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Økonomisk informasjon</h3>

                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Årsinntekt (NOK) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum årsinntekt: 200 000 kr
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Månedlige utgifter (NOK) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outstandingDebt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utestående gjeld (NOK) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormDescription>
                          Inkluder alle lån og kreditt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eiendeler *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Beskriv dine eiendeler (eiendom, sparepenger, investeringer, etc.)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ønsket lånebeløp (NOK) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormDescription>
                          Beløp mellom 10 000 kr og 1 000 000 kr
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formål med lånet *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg formål" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bolig">Boligkjøp</SelectItem>
                            <SelectItem value="bil">Bilkjøp</SelectItem>
                            <SelectItem value="renovering">Renovering</SelectItem>
                            <SelectItem value="refinansiering">Refinansiering</SelectItem>
                            <SelectItem value="annet">Annet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tilleggsinformasjon</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Oppgi eventuell tilleggsinformasjon om din økonomiske situasjon"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verifisering</h3>

                  <div className="space-y-4">
                    <Button type="button" className="w-full" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Last opp legitimasjon
                    </Button>

                    <Button type="button" className="w-full" variant="outline">
                      Logg inn med BankID
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="hasConsented"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Jeg bekrefter at informasjonen jeg har oppgitt er korrekt *
                        </FormLabel>
                        <FormDescription>
                          Ved å huke av denne boksen bekrefter jeg at all informasjon jeg har oppgitt er korrekt og fullstendig.
                          Jeg forstår at å oppgi feilaktig informasjon kan føre til at søknaden blir avvist.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send søknad
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ved å sende inn søknaden godtar du våre vilkår og personvernserklæring.
                    Dine data vil kun bli brukt til å behandle søknaden din.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}