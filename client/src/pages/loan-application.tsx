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
import * as z from 'zod';
import { DatePicker } from "@/components/ui/date-picker";
import { addYears, format, isAfter, isBefore, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { useState } from "react";
import { BankIDDialog } from "@/components/bankid-dialog";
import { LoanApplicationStepper } from "@/components/loan-application-stepper";
import { TextField } from "@mui/material";

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showBankID, setShowBankID] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(
      insertLoanApplicationSchema.extend({
        birthDate: insertLoanApplicationSchema.shape.birthDate
          .refine(
            (date) => {
              const parsedDate = parseISO(date);
              const eighteenYearsAgo = addYears(new Date(), -18);
              return isBefore(parsedDate, eighteenYearsAgo);
            },
            "Du må være minst 18 år for å søke om lån"
          ),
        street: z.string().min(5, "Vennligst oppgi en gyldig gateadresse"),
        postalCode: z.string().length(4, "Postnummer må være 4 siffer"),
        city: z.string().min(2, "Vennligst oppgi en gyldig by"),
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
      street: "",
      postalCode: "",
      city: "",
      monthlyExpenses: 0,
      outstandingDebt: 0,
      assets: "",
      additionalInfo: "",
      hasConsented: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const loanRes = await apiRequest("POST", "/api/loans/apply", data);
      const loanData = await loanRes.json();
      const creditRes = await apiRequest("POST", "/api/loans/credit-score", {
        ...data,
        loanApplicationId: loanData.id
      });
      return creditRes.json();
    },
    onSuccess: (creditScore) => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Søknad sendt",
        description: "Din lånesøknad er mottatt og vil bli behandlet.",
      });
      setLocation("/credit-score-result");
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Feil",
          description: "Filen er for stor. Maksimal størrelse er 10MB.",
          variant: "destructive",
        });
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Feil",
          description: "Ugyldig filformat. Kun PNG, JPG og PDF er tillatt.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleBankIDSuccess = (data: { personalNumber: string; name: string }) => {
    toast({
      title: "Identitet bekreftet",
      description: `Velkommen ${data.name}`,
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      form.handleSubmit((data) => mutation.mutate(data))();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const PersonalInfoStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fødselsdato *</FormLabel>
            <FormControl>
              <DatePicker
                date={field.value ? parseISO(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                disabled={(date) => isAfter(date, addYears(new Date(), -18))}
                locale={nb}
                captionLayout="dropdown"
                fromYear={1940}
                toYear={addYears(new Date(), -18).getFullYear()}
              />
            </FormControl>
            <FormDescription>
              Du må være minst 18 år for å søke om lån
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gateadresse *</FormLabel>
            <FormControl>
              <TextField
                {...field}
                fullWidth
                placeholder="F.eks. Storgata 1"
                error={!!form.formState.errors.street}
                helperText={form.formState.errors.street?.message}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postnummer *</FormLabel>
            <FormControl>
              <TextField
                {...field}
                fullWidth
                placeholder="1234"
                error={!!form.formState.errors.postalCode}
                helperText={form.formState.errors.postalCode?.message}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poststed *</FormLabel>
            <FormControl>
              <TextField
                {...field}
                fullWidth
                placeholder="F.eks. Oslo"
                error={!!form.formState.errors.city}
                helperText={form.formState.errors.city?.message}
              />
            </FormControl>
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
  );

  const FinancialInfoStep = () => (
    <div className="space-y-4">
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
  );

  const VerificationStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="idDocument"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last opp legitimasjon</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="id-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('id-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Last opp legitimasjon"}
                  </Button>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Forhåndsvisning:</p>
                    <div className="relative aspect-video w-full max-w-sm mx-auto border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Forhåndsvisning"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {selectedFile?.type === 'application/pdf' && (
                  <p className="text-sm text-muted-foreground">
                    PDF valgt: {selectedFile.name}
                  </p>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Aksepterte formater: PNG, JPG, PDF. Maks størrelse: 10MB
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            eller
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowBankID(true)}
      >
        <img
          src="/attached_assets/bankid-logo.svg"
          alt="BankID"
          className="mr-2 h-4"
        />
        Logg inn med BankID
      </Button>
      <BankIDDialog
        open={showBankID}
        onOpenChange={setShowBankID}
        onSuccess={handleBankIDSuccess}
      />
    </div>
  );

  const steps = [
    { component: PersonalInfoStep, isValid: true }, 
    { component: FinancialInfoStep, isValid: true },
    { component: VerificationStep, isValid: form.getValues("hasConsented") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <LoanApplicationStepper
              activeStep={activeStep}
              handleNext={handleNext}
              handleBack={handleBack}
              isLastStep={activeStep === steps.length - 1}
              isFormValid={steps[activeStep].isValid}
            >
              {steps[activeStep].component()}
            </LoanApplicationStepper>
          </form>
        </Form>
      </main>
    </div>
  );
}