import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoanApplicationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@mui/material";
import {
  TextField,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Box,
} from "@mui/material";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from 'zod';
import { DatePicker } from "@/components/ui/date-picker";
import { addYears, format, isAfter, isBefore, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { useState } from "react";
import { BankIDDialog } from "@/components/bankid-dialog";
import { LoanApplicationStepper } from "@/components/loan-application-stepper";


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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl fullWidth>
        <DatePicker
          date={form.watch("birthDate") ? parseISO(form.watch("birthDate")) : undefined}
          onSelect={(date) => form.setValue("birthDate", date ? format(date, 'yyyy-MM-dd') : '')}
          disabled={(date) => isAfter(date, addYears(new Date(), -18))}
          locale={nb}
          captionLayout="dropdown"
          fromYear={1940}
          toYear={addYears(new Date(), -18).getFullYear()}
          label="Fødselsdato *"
          error={!!form.formState.errors.birthDate}
          helperText={form.formState.errors.birthDate?.message?.toString()}
        />
        <FormHelperText>
          Du må være minst 18 år for å søke om lån
        </FormHelperText>
      </FormControl>

      <TextField
        fullWidth
        label="Gateadresse *"
        placeholder="F.eks. Storgata 1"
        error={!!form.formState.errors.street}
        helperText={form.formState.errors.street?.message}
        {...form.register("street")}
      />

      <TextField
        fullWidth
        label="Postnummer *"
        placeholder="1234"
        error={!!form.formState.errors.postalCode}
        helperText={form.formState.errors.postalCode?.message}
        {...form.register("postalCode")}
      />

      <TextField
        fullWidth
        label="Poststed *"
        placeholder="F.eks. Oslo"
        error={!!form.formState.errors.city}
        helperText={form.formState.errors.city?.message}
        {...form.register("city")}
      />

      <FormControl fullWidth>
        <InputLabel id="employment-status-label">Ansettelsesforhold *</InputLabel>
        <Select
          labelId="employment-status-label"
          label="Ansettelsesforhold *"
          error={!!form.formState.errors.employmentStatus}
          {...form.register("employmentStatus")}
        >
          <MenuItem value="fast">Fast ansatt</MenuItem>
          <MenuItem value="midlertidig">Midlertidig ansatt</MenuItem>
          <MenuItem value="selvstendig">Selvstendig næringsdrivende</MenuItem>
          <MenuItem value="pensjonist">Pensjonist</MenuItem>
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="arbeidsledig">Arbeidsledig</MenuItem>
        </Select>
        {form.formState.errors.employmentStatus && (
          <FormHelperText error>
            {form.formState.errors.employmentStatus.message}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );

  const FinancialInfoStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        fullWidth
        label="Årsinntekt (NOK) *"
        type="number"
        error={!!form.formState.errors.income}
        helperText={form.formState.errors.income?.message}
        {...form.register("income")}
      />
      <FormHelperText>Minimum årsinntekt: 200 000 kr</FormHelperText>

      <TextField
        fullWidth
        label="Månedlige utgifter (NOK) *"
        type="number"
        error={!!form.formState.errors.monthlyExpenses}
        helperText={form.formState.errors.monthlyExpenses?.message}
        {...form.register("monthlyExpenses")}
      />

      <TextField
        fullWidth
        label="Utestående gjeld (NOK) *"
        type="number"
        error={!!form.formState.errors.outstandingDebt}
        helperText={form.formState.errors.outstandingDebt?.message}
        {...form.register("outstandingDebt")}
      />
      <FormHelperText>Inkluder alle lån og kreditt</FormHelperText>

      <TextField
        fullWidth
        label="Eiendeler *"
        multiline
        rows={4}
        placeholder="Beskriv dine eiendeler (eiendom, sparepenger, investeringer, etc.)"
        error={!!form.formState.errors.assets}
        helperText={form.formState.errors.assets?.message}
        {...form.register("assets")}
      />

      <TextField
        fullWidth
        label="Ønsket lånebeløp (NOK) *"
        type="number"
        error={!!form.formState.errors.amount}
        helperText={form.formState.errors.amount?.message}
        {...form.register("amount")}
      />
      <FormHelperText>Beløp mellom 10 000 kr og 1 000 000 kr</FormHelperText>

      <FormControl fullWidth>
        <InputLabel id="purpose-label">Formål med lånet *</InputLabel>
        <Select
          labelId="purpose-label"
          label="Formål med lånet *"
          error={!!form.formState.errors.purpose}
          {...form.register("purpose")}
        >
          <MenuItem value="bolig">Boligkjøp</MenuItem>
          <MenuItem value="bil">Bilkjøp</MenuItem>
          <MenuItem value="renovering">Renovering</MenuItem>
          <MenuItem value="refinansiering">Refinansiering</MenuItem>
          <MenuItem value="annet">Annet</MenuItem>
        </Select>
        {form.formState.errors.purpose && (
          <FormHelperText error>
            {form.formState.errors.purpose.message}
          </FormHelperText>
        )}
      </FormControl>

      <TextField
        fullWidth
        label="Tilleggsinformasjon"
        multiline
        rows={4}
        placeholder="Oppgi eventuell tilleggsinformasjon om din økonomiske situasjon"
        {...form.register("additionalInfo")}
      />
    </Box>
  );

  const VerificationStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="id-upload"
        />
        <Button
          variant="outlined"
          fullWidth
          onClick={() => document.getElementById('id-upload')?.click()}
          startIcon={<Upload />}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            height: '48px'
          }}
        >
          {selectedFile ? selectedFile.name : "Last opp legitimasjon"}
        </Button>
        <FormHelperText>
          Aksepterte formater: PNG, JPG, PDF. Maks størrelse: 10MB
        </FormHelperText>
      </Box>

      {previewUrl && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            aspectRatio: '16/9',
            maxWidth: 'sm',
            mx: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <img
              src={previewUrl}
              alt="Forhåndsvisning"
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ 
        position: 'relative',
        textAlign: 'center',
        my: 2
      }}>
        <Box sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'absolute',
          width: '100%',
          top: '50%'
        }} />
        <Box component="span" sx={{ 
          bgcolor: 'background.paper',
          px: 2,
          position: 'relative',
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}>
          eller
        </Box>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={() => setShowBankID(true)}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          height: '48px',
          borderWidth: '2px',
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'primary.main',
            color: 'white'
          }
        }}
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
    </Box>
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
      </main>
    </div>
  );
}