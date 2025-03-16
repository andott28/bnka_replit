import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoanApplicationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@mui/material";
import {
  TextField,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
} from "@mui/material";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from 'zod';
import { DatePicker } from "@/components/ui/date-picker";
import { addYears, format, isAfter, isBefore, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { useState, useEffect } from "react";
import { BankIDDialog } from "@/components/bankid-dialog";
import { LoanApplicationStepper } from "@/components/loan-application-stepper";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";


// Helper functions for number formatting
const formatNumber = (value: string | number): string => {
  // If empty string or undefined, return empty string
  if (value === "" || value === undefined) return "";
  
  // Remove any non-digit characters except for a possible leading '-'
  const digitsOnly = value.toString().replace(/[^\d-]/g, '');
  
  // Remove any minus signs that aren't at the beginning
  const withProperMinus = digitsOnly.replace(/(?!^)-/g, '');
  
  // If empty after cleaning, return empty string
  if (withProperMinus === "" || withProperMinus === "-") return "";
  
  // Parse to number, format with spaces
  const num = parseInt(withProperMinus);
  return new Intl.NumberFormat('nb-NO').format(num);
};

// Format number for display only (not changing the actual value)
const formatNumberForDisplay = (value: string | number | undefined): string => {
  if (value === undefined || value === "") return "";
  
  // Remove any existing spaces
  const withoutSpaces = value.toString().replace(/\s/g, '');
  
  // Format with spaces for thousands
  return withoutSpaces.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent } = usePostHog();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showBankID, setShowBankID] = useState(false);
  const [isBankIDVerified, setIsBankIDVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    // Track page view when component loads
    trackEvent(AnalyticsEvents.PAGE_VIEW, {
      page: "loan_application"
    });
    
    // Track loan application start
    trackEvent(AnalyticsEvents.LOAN_APPLICATION_START);
  }, [trackEvent]);

  // State for assets, savings and student loan
  const [hasAssets, setHasAssets] = useState(false);
  const [hasSavings, setHasSavings] = useState(false);
  const [hasStudentLoan, setHasStudentLoan] = useState(false);
  const [isPayingStudentLoan, setIsPayingStudentLoan] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      insertLoanApplicationSchema.extend({
        birthDate: z.coerce.date()
          .refine(
            (date) => {
              const min18Years = addYears(new Date(), -18);
              return isBefore(date, min18Years);
            },
            { message: "Du må være minst 18 år gammel" }
          )
          .refine(
            (date) => {
              const max100Years = addYears(new Date(), -100);
              return isAfter(date, max100Years);
            },
            { message: "Ugyldig fødselsdato" }
          ),
        street: z.string().min(5, "Vennligst oppgi en gyldig gateadresse"),
        postalCode: z.string().length(4, "Postnummer må være 4 siffer"),
        city: z.string().min(2, "Vennligst oppgi en gyldig by"),
        amount: z.string() // Now a string to handle formatted input
          .transform((val) => parseInt(val.replace(/\s/g, ""))) // Transform to number for validation
          .pipe(z.number()
            .min(10000, "Minimum lånebeløp er 10 000 kr")
            .max(1000000, "Maksimalt lånebeløp er 1 000 000 kr")
          ),
        income: z.string() // Now a string to handle formatted input
          .transform((val) => parseInt(val.replace(/\s/g, ""))) // Transform to number for validation
          .pipe(z.number()
            .min(0, "Inntekt kan ikke være negativ")
          ),
        monthlyExpenses: z.string() // Now a string to handle formatted input
          .transform((val) => parseInt(val.replace(/\s/g, ""))) // Transform to number for validation
          .pipe(z.number()
            .min(0, "Månedlige utgifter kan ikke være negative")
          ),
        outstandingDebt: z.string() // Now a string to handle formatted input
          .transform((val) => parseInt(val.replace(/\s/g, ""))) // Transform to number for validation
          .pipe(z.number()
            .min(0, "Utestående gjeld kan ikke være negativ")
          ),
        hasConsented: z.boolean().refine((val) => val === true, "Du må godta vilkårene"),
        // Add new fields
        hasStudentLoan: z.boolean().optional(),
        isPayingStudentLoan: z.boolean().optional(),
        studentLoanAmount: z.string().optional()
          .transform((val) => val ? parseInt(val.replace(/\s/g, "")) : 0)
          .pipe(z.number().min(0, "Studielån kan ikke være negativt").optional()),
        hasSavings: z.boolean().optional(),
        savingsAmount: z.string().optional()
          .transform((val) => val ? parseInt(val.replace(/\s/g, "")) : 0)
          .pipe(z.number().min(0, "Sparepenger kan ikke være negativt").optional()),
        hasAssets: z.boolean().optional(),
      })
    ),
    defaultValues: {
      amount: "",
      purpose: "",
      income: "",
      employmentStatus: "",
      birthDate: undefined,
      street: "",
      postalCode: "",
      city: "",
      monthlyExpenses: "",
      outstandingDebt: "",
      assets: "",
      additionalInfo: "",
      hasConsented: false,
      idVerified: false,
      hasStudentLoan: false,
      isPayingStudentLoan: false,
      studentLoanAmount: "",
      hasSavings: false,
      savingsAmount: "",
      hasAssets: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("Sending loan application with data:", data);
        const loanRes = await apiRequest("POST", "/api/loans/apply", data);
        if (!loanRes.ok) {
          const errorData = await loanRes.json();
          throw new Error(errorData.error || "Feil ved innsending av lånesøknad");
        }
        
        const loanData = await loanRes.json();
        console.log("Loan application created with ID:", loanData.id);
        
        // Send credit score request
        const creditRes = await apiRequest("POST", "/api/loans/credit-score", {
          ...data,
          loanApplicationId: loanData.id
        });
        
        if (!creditRes.ok) {
          const errorData = await creditRes.json();
          throw new Error(errorData.error || "Feil ved beregning av kredittscoring");
        }
        
        return creditRes.json();
      } catch (error) {
        console.error("Error in loan application mutation:", error);
        throw error;
      }
    },
    onSuccess: (creditScore) => {
      // Track successful loan application
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_COMPLETE, {
        status: "success",
        creditGrade: creditScore?.grade,
        purpose: form.getValues().purpose
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Søknad sendt",
        description: "Din lånesøknad er mottatt og vil bli behandlet.",
      });
      setLocation("/credit-score-result");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      
      // Track error
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        error: error.message || "Unknown error",
        action: "submit_loan_application",
        context: "loan_application_mutation"
      });
      
      toast({
        title: "Feil ved innsending",
        description: error.message || "Det oppsto en feil ved innsending av lånesøknaden. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Track file upload attempt
      trackEvent(AnalyticsEvents.BUTTON_CLICK, {
        action: "upload_id_document",
        fileType: file.type,
        fileSize: Math.round(file.size / 1024) // Size in KB
      });
      
      if (file.size > 10 * 1024 * 1024) {
        // Track error
        trackEvent(AnalyticsEvents.FORM_ERROR, {
          errorType: "file_too_large",
          fileSize: Math.round(file.size / 1024),
          context: "loan_application_id_upload"
        });
        
        toast({
          title: "Feil",
          description: "Filen er for stor. Maksimal størrelse er 10MB.",
          variant: "destructive",
        });
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        // Track error
        trackEvent(AnalyticsEvents.FORM_ERROR, {
          errorType: "invalid_file_type",
          fileType: file.type,
          context: "loan_application_id_upload"
        });
        
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
          
          // Track successful image preview
          trackEvent(AnalyticsEvents.BUTTON_CLICK, {
            action: "preview_id_image",
            success: true
          });
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
        
        // Track PDF upload (no preview)
        trackEvent(AnalyticsEvents.BUTTON_CLICK, {
          action: "upload_id_pdf",
          success: true
        });
      }
    }
  };

  const handleBankIDSuccess = async (data: { personalNumber: string; name: string }) => {
    // Track successful BankID verification in PostHog
    if (trackEvent) {
      trackEvent(AnalyticsEvents.BANKID_SUCCESS, {
        from: "loan_application"
      });
    }
    
    // Set the hasConsented value to true to enable the submit button
    form.setValue("hasConsented", true, { shouldValidate: true });
    
    // Set idVerified in the form
    form.setValue("idVerified", true, { shouldValidate: true });
    
    // Update user's KYC status in the backend
    if (user?.id) {
      try {
        await apiRequest("PATCH", `/api/users/${user.id}`, {
          kycStatus: "verified"
        });
        // Update the query cache
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      } catch (error) {
        console.error("Failed to update KYC status:", error);
        
        // Track error in PostHog
        if (trackEvent) {
          trackEvent(AnalyticsEvents.FORM_ERROR, {
            action: "update_kyc_status",
            error: error instanceof Error ? error.message : "Unknown error",
            context: "loan_application"
          });
        }
      }
    }
    
    // Set verification state
    setIsBankIDVerified(true);
    setIsVerifying(false);
    
    toast({
      title: "Identitet bekreftet",
      description: `Velkommen ${data.name}`,
    });
  };

  // Validering av skjemafelt for hvert steg
  const validateStep = async (step: number) => {
    let valid = false;
    
    switch (step) {
      case 0: // PersonalInfoStep
        valid = await form.trigger(['birthDate', 'street', 'postalCode', 'city', 'employmentStatus']);
        break;
      case 1: // FinancialInfoStep
        // Valider alt i ett trinn med any - vi må unngå TypeScript-feil
        const fieldsToValidate = ['income', 'monthlyExpenses', 'outstandingDebt', 'amount', 'purpose'];
        
        // Legg til valgfrie felt hvis de er aktivert
        if (hasAssets) {
          fieldsToValidate.push('assets');
        }
        
        if (hasStudentLoan) {
          fieldsToValidate.push('studentLoanAmount');
        }
        
        if (hasSavings) {
          fieldsToValidate.push('savingsAmount');
        }
        
        valid = await form.trigger(fieldsToValidate as any);
        break;
      case 2: // VerificationStep
        valid = await form.trigger(['hasConsented', 'idVerified']);
        valid = valid && isBankIDVerified; // Må ha bekreftet BankID
        break;
      default:
        valid = true;
    }
    
    return valid;
  };

  const handleNext = async () => {
    // Siste steg - send inn søknaden
    if (activeStep === steps.length - 1) {
      // Track application submission attempt
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_STEP, {
        step: activeStep,
        action: "submit",
        status: "final_submit"
      });
      
      form.handleSubmit((data) => mutation.mutate(data))();
      return;
    }
    
    // Valider gjeldende steg før man kan gå videre
    const isStepValid = await validateStep(activeStep);
    
    if (isStepValid) {
      // Track successful step completion
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_STEP, {
        step: activeStep,
        action: "next",
        status: "success"
      });
      
      setActiveStep((prev) => prev + 1);
    } else {
      // Track validation failure
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        step: activeStep,
        errorType: "validation",
        context: "loan_application_step"
      });
      
      // Mer diskré feilmelding som vises i toast
      toast({
        title: 'Mangler informasjon',
        description: 'Vennligst fyll ut alle nødvendige felt markert med (*) før du fortsetter.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const PersonalInfoStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ position: "relative" }}>
        <DatePicker
          label="Fødselsdato *"
          date={form.watch("birthDate") ? new Date(form.watch("birthDate") as unknown as string) : undefined}
          onSelect={(date) => {
            if (date) {
              form.setValue("birthDate", date as any, { shouldValidate: true });
            }
          }}
          disabled={(date) => {
            // Må være minst 18 år gammel
            const today = new Date();
            const min18Years = addYears(today, -18);
            // Ikke eldre enn 100 år
            const max100Years = addYears(today, -100);
            return isAfter(date, min18Years) || isBefore(date, max100Years);
          }}
          fromYear={addYears(new Date(), -100).getFullYear()}
          toYear={addYears(new Date(), -18).getFullYear()}
          locale={nb}
          error={!!form.formState.errors.birthDate}
        />
        {form.formState.errors.birthDate && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.birthDate.message?.toString() || "Du må være minst 18 år gammel"}
          </p>
        )}
        {!form.formState.errors.birthDate && (
          <p className="text-gray-500 text-sm mt-1">
            Du må være minst 18 år gammel
          </p>
        )}
      </div>
      
      <TextField
        fullWidth
        label="Gateadresse *"
        placeholder="F.eks. Storgata 1"
        error={!!form.formState.errors.street}
        helperText={form.formState.errors.street?.message}
        {...form.register("street")}
        variant="outlined"
        InputProps={{
          sx: { 
            borderRadius: 2,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }
        }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Postnummer *"
          placeholder="1234"
          error={!!form.formState.errors.postalCode}
          helperText={form.formState.errors.postalCode?.message}
          {...form.register("postalCode")}
          variant="outlined"
          InputProps={{
            sx: { 
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }
          }}
        />

        <TextField
          fullWidth
          label="Poststed *"
          placeholder="F.eks. Oslo"
          error={!!form.formState.errors.city}
          helperText={form.formState.errors.city?.message}
          {...form.register("city")}
          variant="outlined"
          InputProps={{
            sx: { 
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }
          }}
        />
      </Box>

      <FormControl fullWidth variant="outlined">
        <InputLabel id="employment-status-label">Ansettelsesforhold *</InputLabel>
        <Select
          labelId="employment-status-label"
          label="Ansettelsesforhold *"
          error={!!form.formState.errors.employmentStatus}
          {...form.register("employmentStatus")}
          sx={{ 
            borderRadius: 2,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
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

  const FinancialInfoStep = () => {
    // Format values on blur - setter ren verdi i skjemaet
    const formatFieldValue = (field: any, value: string) => {
      // Fjern alle mellomrom før validering/lagring
      const cleanValue = value.replace(/\s/g, '');
      
      // Sett den rensede verdien i skjemaet for validering
      form.setValue(field as any, cleanValue, { shouldValidate: true });
    };
    
    // Forbedret tallformatering som bevarer markørposisjon
    // basert på https://stackoverflow.com/questions/6458990/how-to-format-a-number-1000-as-1-000
    const handleNumberChange = (field: string, value: string) => {
      // Hent det aktive input-elementet
      const input = document.activeElement as HTMLInputElement;
      if (!input) return;
      
      // Lagre markørposisjonen før vi gjør endringer
      const cursorPosition = input.selectionStart || 0;
      
      // Tell mellomrom før markøren for å justere posisjon senere
      const spacesBeforeCursor = (value.substring(0, cursorPosition).match(/ /g) || []).length;
      
      // Fjern alle tegn unntatt tall og eventuelt minustegn i begynnelsen
      const digitsOnly = value.replace(/[^\d-]/g, '');
      const withProperMinus = digitsOnly.replace(/(?!^)-/g, '');
      
      // Sett den rå numeriske verdien i form state
      form.setValue(field as any, withProperMinus, { shouldValidate: false });
      
      // Formater visningen med mellomrom (kun for visning)
      const formattedValue = formatNumberForDisplay(withProperMinus);
      
      // Manuell visning som unngår å miste fokus
      setTimeout(() => {
        // Sørg for at elementet fortsatt har fokus 
        if (document.activeElement === input) {
          // Tell nye mellomrom før markørposisjonen
          const newSpacesBeforeCursor = (formattedValue.substring(0, cursorPosition).match(/ /g) || []).length;
          const spaceDifference = newSpacesBeforeCursor - spacesBeforeCursor;
          
          // Sett input value direkte uten å gå via React for å unngå å miste fokus
          input.value = formattedValue;
          
          // Juster markørposisjonen basert på endring i antall mellomrom
          const newCursorPosition = cursorPosition + spaceDifference;
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    };

    // Effects to sync state with form fields
    useEffect(() => {
      // Set hasAssets state based on form value
      setHasAssets(form.getValues().hasAssets || false);
    }, [form.watch("hasAssets")]);

    useEffect(() => {
      // Set hasSavings state based on form value
      setHasSavings(form.getValues().hasSavings || false);
    }, [form.watch("hasSavings")]);

    useEffect(() => {
      // Set hasStudentLoan state based on form value
      setHasStudentLoan(form.getValues().hasStudentLoan || false);
    }, [form.watch("hasStudentLoan")]);

    useEffect(() => {
      // Set isPayingStudentLoan state based on form value
      setIsPayingStudentLoan(form.getValues().isPayingStudentLoan || false);
    }, [form.watch("isPayingStudentLoan")]);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Månedsinntekt (NOK) *"
            error={!!form.formState.errors.income}
            helperText={form.formState.errors.income?.message || "Oppgi din månedlige inntekt (0 eller høyere)"}
            {...form.register("income")}
            value={formatNumberForDisplay(form.watch("income"))}
            onChange={(e) => handleNumberChange("income", e.target.value)}
            onBlur={(e) => formatFieldValue("income", e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Månedlige utgifter (NOK) *"
            error={!!form.formState.errors.monthlyExpenses}
            helperText={form.formState.errors.monthlyExpenses?.message || "Gjennomsnittlige månedlige utgifter inkludert bolig, forbruk, etc."}
            {...form.register("monthlyExpenses")}
            value={formatNumberForDisplay(form.watch("monthlyExpenses"))}
            onChange={(e) => handleNumberChange("monthlyExpenses", e.target.value)}
            onBlur={(e) => formatFieldValue("monthlyExpenses", e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Utestående gjeld (NOK) *"
            error={!!form.formState.errors.outstandingDebt}
            helperText={form.formState.errors.outstandingDebt?.message || "Inkluder alle lån og kreditt (boliglån, billån, forbrukslån, etc.)"}
            {...form.register("outstandingDebt")}
            value={formatNumberForDisplay(form.watch("outstandingDebt"))}
            onChange={(e) => handleNumberChange("outstandingDebt", e.target.value)}
            onBlur={(e) => formatFieldValue("outstandingDebt", e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </FormControl>

        {/* Student Loan Section */}
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
              Studielån
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="hasStudentLoan"
                {...form.register("hasStudentLoan")}
                checked={hasStudentLoan}
                onChange={(e) => {
                  setHasStudentLoan(e.target.checked);
                  form.setValue("hasStudentLoan", e.target.checked, { shouldValidate: true });
                  if (!e.target.checked) {
                    form.setValue("studentLoanAmount", "", { shouldValidate: false });
                    form.setValue("isPayingStudentLoan", false, { shouldValidate: false });
                    setIsPayingStudentLoan(false);
                  }
                }}
              />
              <label htmlFor="hasStudentLoan">
                Jeg har studielån
              </label>
            </Box>
          </FormControl>

          {hasStudentLoan && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Studielån (NOK)"
                  error={!!form.formState.errors.studentLoanAmount}
                  helperText={form.formState.errors.studentLoanAmount?.message || "Oppgi totalt studielån"}
                  {...form.register("studentLoanAmount")}
                  value={formatNumberForDisplay(form.watch("studentLoanAmount"))}
                  onChange={(e) => handleNumberChange("studentLoanAmount", e.target.value)}
                  onBlur={(e) => formatFieldValue("studentLoanAmount", e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
              </FormControl>

              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    id="isPayingStudentLoan"
                    {...form.register("isPayingStudentLoan")}
                    checked={isPayingStudentLoan}
                    onChange={(e) => {
                      setIsPayingStudentLoan(e.target.checked);
                      form.setValue("isPayingStudentLoan", e.target.checked, { shouldValidate: true });
                    }}
                  />
                  <label htmlFor="isPayingStudentLoan">
                    Jeg betaler ned på studielånet mitt
                  </label>
                </Box>
              </FormControl>
            </>
          )}
        </Box>

        {/* Savings Section */}
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
              Sparepenger
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="hasSavings"
                {...form.register("hasSavings")}
                checked={hasSavings}
                onChange={(e) => {
                  setHasSavings(e.target.checked);
                  form.setValue("hasSavings", e.target.checked, { shouldValidate: true });
                  if (!e.target.checked) {
                    form.setValue("savingsAmount", "", { shouldValidate: false });
                  }
                }}
              />
              <label htmlFor="hasSavings">
                Jeg har sparepenger
              </label>
            </Box>
          </FormControl>

          {hasSavings && (
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="Sparepenger (NOK)"
                error={!!form.formState.errors.savingsAmount}
                helperText={form.formState.errors.savingsAmount?.message || "Oppgi totalt beløp i sparepenger"}
                {...form.register("savingsAmount")}
                value={formatNumberForDisplay(form.watch("savingsAmount"))}
                onChange={(e) => handleNumberChange("savingsAmount", e.target.value)}
                onBlur={(e) => formatFieldValue("savingsAmount", e.target.value)}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </FormControl>
          )}
        </Box>

        {/* Assets Section */}
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
              Eiendeler
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="hasAssets"
                {...form.register("hasAssets")}
                checked={hasAssets}
                onChange={(e) => {
                  setHasAssets(e.target.checked);
                  form.setValue("hasAssets", e.target.checked, { shouldValidate: true });
                  if (!e.target.checked) {
                    form.setValue("assets", "", { shouldValidate: false });
                  }
                }}
              />
              <label htmlFor="hasAssets">
                Jeg har andre eiendeler
              </label>
            </Box>
          </FormControl>

          {hasAssets && (
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="Beskriv dine eiendeler"
                multiline
                rows={3}
                placeholder="Beskriv dine eiendeler (eiendom, investeringer, etc.)"
                error={!!form.formState.errors.assets}
                helperText={form.formState.errors.assets?.message || "Beskriv din finansielle situasjon med eiendeler som kan være relevant for lånesøknaden"}
                {...form.register("assets")}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </FormControl>
          )}
        </Box>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Ønsket lånebeløp (NOK) *"
            error={!!form.formState.errors.amount}
            helperText={form.formState.errors.amount?.message || "Beløp mellom 10 000 kr og 1 000 000 kr"}
            {...form.register("amount")}
            value={formatNumberForDisplay(form.watch("amount"))}
            onChange={(e) => handleNumberChange("amount", e.target.value)}
            onBlur={(e) => formatFieldValue("amount", e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel id="purpose-label">Formål med lånet *</InputLabel>
          <Select
            labelId="purpose-label"
            label="Formål med lånet *"
            error={!!form.formState.errors.purpose}
            {...form.register("purpose")}
            sx={{ 
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="bolig">Boligkjøp</MenuItem>
            <MenuItem value="bil">Bilkjøp</MenuItem>
            <MenuItem value="renovering">Renovering</MenuItem>
            <MenuItem value="refinansiering">Refinansiering</MenuItem>
            <MenuItem value="annet">Annet</MenuItem>
          </Select>
          {form.formState.errors.purpose ? (
            <FormHelperText error>
              {form.formState.errors.purpose.message}
            </FormHelperText>
          ) : (
            <FormHelperText>
              Velg hovedformålet med lånet
            </FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Tilleggsinformasjon"
            multiline
            rows={3}
            placeholder="Oppgi eventuell tilleggsinformasjon om din økonomiske situasjon som kan være relevant for søknaden"
            {...form.register("additionalInfo")}
            variant="outlined"
            InputProps={{
              sx: { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
            helperText="Annen informasjon du mener er relevant for vurdering av din søknad (f.eks. planlagte endringer i inntekt/utgifter, særlige behov, osv.)"
          />
        </FormControl>
      </Box>
    );
  };

  const VerificationStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
        Bekreft din identitet ved hjelp av en av følgende metoder:
      </Typography>

      {/* BankID-knappen først */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant={isBankIDVerified ? "outlined" : "contained"}
          fullWidth
          onClick={() => {
            if (!isBankIDVerified && !isVerifying) {
              // Track BankID verification start
              trackEvent(AnalyticsEvents.BANKID_START, {
                from: "loan_application",
                step: activeStep
              });
              
              setIsVerifying(true);
              setShowBankID(true);
            }
          }}
          disabled={isVerifying || isBankIDVerified}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            height: '54px',
            fontSize: '1rem',
            boxShadow: isBankIDVerified ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontWeight: 'medium',
            transition: 'all 0.3s ease-in-out',
            bgcolor: isBankIDVerified ? 'success.light' : undefined,
            borderColor: isBankIDVerified ? 'success.main' : undefined,
            color: isBankIDVerified ? 'success.main' : undefined,
            '&:hover': {
              bgcolor: isBankIDVerified ? 'success.light' : undefined,
              borderColor: isBankIDVerified ? 'success.main' : undefined,
            },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
              <span>Verifiserer...</span>
            </div>
          ) : isBankIDVerified ? (
            <div className="flex items-center justify-center text-white px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Identitet bekreftet</span>
            </div>
          ) : (
            <>
              <img
                src="/attached_assets/bankid-logo.svg"
                alt="BankID"
                className="mr-3 h-5"
              />
              Verifiser med BankID
            </>
          )}
        </Button>
        <FormHelperText sx={{ textAlign: 'center', mt: 1, color: isBankIDVerified ? 'success.main' : 'primary.main' }}>
          {isBankIDVerified ? (
            <span><strong>Verifisert:</strong> Din identitet er bekreftet via BankID</span>
          ) : (
            <span><strong>Anbefalt:</strong> Raskere søknadsprosess og umiddelbar verifisering</span>
          )}
        </FormHelperText>
      </Box>

      <Box sx={{ 
        position: 'relative',
        textAlign: 'center',
        my: 1.5
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

      {/* Legitimasjonopplasting som alternativ */}
      <Box sx={{ mt: 1 }}>
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
            height: '48px',
            borderColor: 'divider',
            color: 'text.primary'
          }}
        >
          {selectedFile ? selectedFile.name : "Last opp legitimasjon"}
        </Button>
        <FormHelperText sx={{ mt: 0.5 }}>
          Aksepterte formater: PNG, JPG, PDF. Maks størrelse: 10MB.
          <br />Manuell behandling kan ta lengre tid.
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
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={previewUrl}
              alt="Forhåndsvisning"
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </Box>
        </Box>
      )}
      
      <BankIDDialog
        open={showBankID}
        onOpenChange={setShowBankID}
        onSuccess={handleBankIDSuccess}
      />
    </Box>
  );

  const steps = [
    { 
      component: PersonalInfoStep, 
      isValid: !form.formState.errors.birthDate && 
               !form.formState.errors.street && 
               !form.formState.errors.postalCode && 
               !form.formState.errors.city && 
               !form.formState.errors.employmentStatus &&
               form.getValues("birthDate") && 
               form.getValues("street") && 
               form.getValues("postalCode") && 
               form.getValues("city") && 
               form.getValues("employmentStatus")
    }, 
    { 
      component: FinancialInfoStep, 
      isValid: !form.formState.errors.income && 
               !form.formState.errors.monthlyExpenses && 
               !form.formState.errors.outstandingDebt && 
               !form.formState.errors.amount && 
               !form.formState.errors.purpose && 
               !form.formState.errors.assets &&
               form.getValues("income") && 
               form.getValues("monthlyExpenses") && 
               form.getValues("outstandingDebt") && 
               form.getValues("amount") && 
               form.getValues("purpose") && 
               form.getValues("assets") 
    },
    { 
      component: VerificationStep, 
      isValid: form.getValues("hasConsented") && isBankIDVerified && form.getValues("idVerified")
    },
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
            isFormValid={!!steps[activeStep].isValid}
          >
            {activeStep === 0 && <PersonalInfoStep />}
            {activeStep === 1 && <FinancialInfoStep />}
            {activeStep === 2 && <VerificationStep />}
          </LoanApplicationStepper>
        </form>
      </main>
    </div>
  );
}