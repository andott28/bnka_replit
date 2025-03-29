import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoanApplicationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/use-auth";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  FormControl,
  FormHelperText,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { addYears, isAfter, isBefore } from "date-fns";
import { nb } from "date-fns/locale";
import { useState, useMemo } from "react";
import { BankIDDialog } from "@/components/bankid-dialog";
import { LoanApplicationStepper } from "@/components/loan-application-stepper";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";
import { useTheme as useThemeHook } from "@/hooks/use-theme";

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent } = usePostHog();
  const { theme: appTheme } = useThemeHook();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showBankID, setShowBankID] = useState(false);
  const [isBankIDVerified, setIsBankIDVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Create a MUI theme that respects our app's theme (light/dark)
  const muiTheme = useMemo(() => 
    createTheme({
      palette: {
        mode: appTheme === 'dark' ? 'dark' : 'light',
        primary: {
          main: '#3B82F6', // Material Design V3 primary blue
        },
        secondary: {
          main: '#10B981', // Material Design V3 secondary green
        },
        background: {
          default: appTheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          paper: appTheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
        },
        text: {
          primary: appTheme === 'dark' ? '#FFFFFF' : '#000000',
          secondary: appTheme === 'dark' ? '#AAAAAA' : '#666666',
        },
        error: {
          main: '#EF4444', // Material Design V3 error red
        },
      },
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              backgroundColor: appTheme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: appTheme === 'dark' ? '#3B82F6' : '#3B82F6',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3B82F6',
              },
              '& input:-webkit-autofill': {
                WebkitBoxShadow: appTheme === 'dark' 
                  ? '0 0 0 100px #1A365D inset' // Mørkere blå i dark mode
                  : '0 0 0 100px #EBF8FF inset', // Lysere blå i light mode
                WebkitTextFillColor: appTheme === 'dark' ? '#FFFFFF' : '#000000',
              },
              '& input:-webkit-autofill:focus': {
                WebkitBoxShadow: appTheme === 'dark' 
                  ? '0 0 0 100px #1E40AF inset' // Mørkere blå focus i dark mode
                  : '0 0 0 100px #EBF8FF inset', // Lysere blå focus i light mode
              },
            },
            notchedOutline: {
              borderColor: appTheme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
          },
        },
        MuiFormLabel: {
          styleOverrides: {
            root: {
              color: appTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              '&.Mui-focused': {
                color: '#3B82F6',
              },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: appTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
        MuiCheckbox: {
          styleOverrides: {
            root: {
              color: appTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
          },
        },
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: 'var(--font-sans)',
        button: {
          textTransform: 'none',
        },
      },
    }),
    [appTheme]
  );

  const form = useForm({
    resolver: zodResolver(
      insertLoanApplicationSchema.extend({
        birthDate: z.coerce
          .date()
          .refine(
            (date) => {
              const min18Years = addYears(new Date(), -18);
              return isBefore(date, min18Years);
            },
            { message: "Du må være minst 18 år gammel" },
          )
          .refine(
            (date) => {
              const max100Years = addYears(new Date(), -100);
              return isAfter(date, max100Years);
            },
            { message: "Ugyldig fødselsdato" },
          ),
        street: z.string().min(5, "Vennligst oppgi en gyldig gateadresse"),
        postalCode: z.string().length(4, "Postnummer må være 4 siffer"),
        city: z.string().min(2, "Vennligst oppgi en gyldig by"),
        amount: z
          .string()
          .transform((val) => parseInt(val.replace(/\s/g, "")))
          .pipe(
            z
              .number()
              .min(10000, "Minimum lånebeløp er 10 000 kr")
              .max(1000000, "Maksimalt lånebeløp er 1 000 000 kr"),
          ),
        income: z
          .string()
          .transform((val) => parseInt(val.replace(/\s/g, "")))
          .pipe(z.number().min(0, "Inntekt kan ikke være negativ")),
        monthlyExpenses: z
          .string()
          .transform((val) => parseInt(val.replace(/\s/g, "")))
          .pipe(z.number().min(0, "Månedlige utgifter kan ikke være negative")),
        outstandingDebt: z
          .string()
          .transform((val) => parseInt(val.replace(/\s/g, "")))
          .pipe(z.number().min(0, "Utestående gjeld kan ikke være negativ")),
        hasConsented: z
          .boolean()
          .refine((val) => val === true, "Du må godta vilkårene"),
        hasStudentLoan: z.boolean().optional(),
        isPayingStudentLoan: z.boolean().optional(),
        studentLoanAmount: z
          .string()
          .optional()
          .transform((val) => (val ? parseInt(val.replace(/\s/g, "")) : 0))
          .pipe(
            z.number().min(0, "Studielån kan ikke være negativt").optional(),
          ),
        hasSavings: z.boolean().optional(),
        savingsAmount: z
          .string()
          .optional()
          .transform((val) => (val ? parseInt(val.replace(/\s/g, "")) : 0))
          .pipe(
            z.number().min(0, "Sparepenger kan ikke være negativt").optional(),
          ),
        hasAssets: z.boolean().optional(),
      }),
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
        
        // Sjekk og sett standardverdier for påkrevde felt
        if (!data.assets || data.assets.trim() === '') {
          data.assets = "Ingen eiendeler oppgitt";
        }
        
        // Sett studentlån til 0 hvis brukeren ikke betaler det ned
        if (data.hasStudentLoan && !data.isPayingStudentLoan) {
          data.studentLoanAmount = 0;
        }
        
        let loanRes;
        if (selectedFile) {
          const formData = new FormData();
          for (const key in data) {
            formData.append(key, data[key]);
          }
          formData.append("idDocument", selectedFile);
          loanRes = await apiRequest(
            "POST",
            "/api/loans/apply",
            formData
          );
        } else {
          loanRes = await apiRequest(
            "POST",
            "/api/loans/apply",
            data
          );
        }

        if (!loanRes.ok) {
          const errorData = await loanRes.json();
          throw new Error(
            errorData.error || "Feil ved innsending av lånesøknad",
          );
        }

        const loanData = await loanRes.json();
        console.log("Loan application created with ID:", loanData.id);

        // Besørg at vi sender alle påkrevde data til kredittscoreendepunktet
        const creditData = {
          loanApplicationId: loanData.id,
          income: data.income,
          employmentStatus: data.employmentStatus,
          monthlyExpenses: data.monthlyExpenses,
          outstandingDebt: data.outstandingDebt || 0, // Sørg for at dette aldri er udefinert
          assets: data.assets || "Ingen eiendeler oppgitt" // Sørg for at dette aldri er tomt
        };
        
        console.log("Sending credit score request with data:", creditData);
        
        const creditRes = await apiRequest(
          "POST",
          "/api/loans/credit-score",
          creditData
        );

        if (!creditRes.ok) {
          const errorData = await creditRes.json();
          throw new Error(
            errorData.error || "Feil ved beregning av kredittscoring",
          );
        }

        return creditRes.json();
      } catch (error) {
        console.error("Error in loan application mutation:", error);
        throw error;
      }
    },
    onSuccess: (creditScore) => {
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_COMPLETE, {
        status: "success",
        creditGrade: creditScore?.score,
        purpose: form.getValues().purpose,
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
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        error: error.message || "Unknown error",
        action: "submit_loan_application",
        context: "loan_application_mutation",
      });
      toast({
        title: "Feil ved innsending",
        description:
          error.message ||
          "Det oppsto en feil ved innsending av lånesøknaden. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      trackEvent(AnalyticsEvents.BUTTON_CLICK, {
        action: "upload_id_document",
        fileType: file.type,
        fileSize: Math.round(file.size / 1024),
      });

      if (file.size > 10 * 1024 * 1024) {
        trackEvent(AnalyticsEvents.FORM_ERROR, {
          errorType: "file_too_large",
          fileSize: Math.round(file.size / 1024),
          context: "loan_application_id_upload",
        });
        toast({
          title: "Feil",
          description: "Filen er for stor. Maksimal størrelse er 10MB.",
          variant: "destructive",
        });
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        trackEvent(AnalyticsEvents.FORM_ERROR, {
          errorType: "invalid_file_type",
          fileType: file.type,
          context: "loan_application_id_upload",
        });
        toast({
          title: "Feil",
          description: "Ugyldig filformat. Kun PNG, JPG og PDF er tillatt.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          trackEvent(AnalyticsEvents.BUTTON_CLICK, {
            action: "preview_id_image",
            success: true,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
        trackEvent(AnalyticsEvents.BUTTON_CLICK, {
          action: "upload_id_pdf",
          success: true,
        });
      }
    }
  };

  const handleBankIDSuccess = async (data: {
    personalNumber: string;
    name: string;
  }) => {
    if (trackEvent) {
      trackEvent(AnalyticsEvents.BANKID_SUCCESS, {
        from: "loan_application",
      });
    }

    form.setValue("idVerified", true, { shouldValidate: true });

    if (user?.id) {
      try {
        await apiRequest(
          "PATCH",
          `/api/users/${user.id}`,
          {
            kycStatus: "verified",
          }
        );
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      } catch (error) {
        console.error("Failed to update KYC status:", error);
        if (trackEvent) {
          trackEvent(AnalyticsEvents.FORM_ERROR, {
            action: "update_kyc_status",
            error: error instanceof Error ? error.message : "Unknown error",
            context: "loan_application",
          });
        }
      }
    }

    setIsBankIDVerified(true);
    setIsVerifying(false);

    toast({
      title: "Identitet bekreftet",
      description: `Velkommen ${data.name}`,
    });
  };

  const validateStep = async (step: number) => {
    let valid = false;

    switch (step) {
      case 0:
        valid = await form.trigger([
          "birthDate",
          "street",
          "postalCode",
          "city",
          "employmentStatus",
        ]);
        break;
      case 1:
        const fieldsToValidate = [
          "income",
          "monthlyExpenses",
          "outstandingDebt",
          "amount",
          "purpose",
        ];
        if (form.getValues("hasAssets")) {
          fieldsToValidate.push("assets");
        }
        if (form.getValues("hasStudentLoan")) {
          fieldsToValidate.push("studentLoanAmount");
        }
        if (form.getValues("hasSavings")) {
          fieldsToValidate.push("savingsAmount");
        }
        valid = await form.trigger(fieldsToValidate as any);
        break;
      case 2:
        valid = await form.trigger(["hasConsented"]);
        valid = valid && (isBankIDVerified || selectedFile !== null);
        break;
      default:
        valid = true;
    }

    return valid;
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_STEP, {
        step: activeStep,
        action: "submit",
        status: "final_submit",
      });
      form.handleSubmit((data) => mutation.mutate(data))();
      return;
    }

    const isStepValid = await validateStep(activeStep);

    if (isStepValid) {
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_STEP, {
        step: activeStep,
        action: "next",
        status: "success",
      });
      setActiveStep((prev) => prev + 1);
    } else {
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        step: activeStep,
        errorType: "validation",
        context: "loan_application_step",
      });
      toast({
        title: "Mangler informasjon",
        description:
          "Vennligst fyll ut alle nødvendige felt markert med (*) før du fortsetter.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const PersonalInfoStep = () => (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 3,
      '& p.text-gray-500': {
        color: appTheme === 'dark' ? 'rgba(209, 213, 219, 0.8)' : '',
      },
      '& p.text-red-500': {
        color: '#EF4444',
      }
    }}>
      <div style={{ position: "relative" }}>
        <DatePicker
          label="Fødselsdato *"
          date={
            form.watch("birthDate")
              ? new Date(form.watch("birthDate") as unknown as string)
              : undefined
          }
          onSelect={(date) => {
            if (date) {
              form.setValue("birthDate", date as any, { shouldValidate: true });
            }
          }}
          disabled={(date) => {
            const today = new Date();
            const min18Years = addYears(today, -18);
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
            {form.formState.errors.birthDate.message?.toString() ||
              "Du må være minst 18 år gammel"}
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
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          },
        }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
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
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
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
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      </Box>

      <FormControl fullWidth variant="outlined">
        <InputLabel id="employment-status-label">
          Ansettelsesforhold *
        </InputLabel>
        <Select
          labelId="employment-status-label"
          label="Ansettelsesforhold *"
          error={!!form.formState.errors.employmentStatus}
          defaultValue={form.getValues("employmentStatus") || ""}
          {...form.register("employmentStatus")}
          sx={{
            borderRadius: 2,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
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
    const hasAssets = form.watch("hasAssets");
    const hasSavings = form.watch("hasSavings");
    const hasStudentLoan = form.watch("hasStudentLoan");
    const isPayingStudentLoan = form.watch("isPayingStudentLoan");

    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 3,
        '& .MuiBox-root': {
          border: appTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e0e0e0',
          backgroundColor: appTheme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        },
        '& .MuiTypography-root': {
          color: appTheme === 'dark' ? '#fff' : 'inherit',
        },
        '& .MuiFormControlLabel-label': {
          color: appTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
        }
      }}>
        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Lønn per måned (NOK) *"
            error={!!form.formState.errors.income}
            helperText={
              form.formState.errors.income?.message ||
              "Din brutto inntekt per måned (før skatt)"
            }
            {...form.register("income")}
            inputMode="numeric"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Faste kostnader (NOK) *"
            error={!!form.formState.errors.monthlyExpenses}
            helperText={
              form.formState.errors.monthlyExpenses?.message ||
              "Sum av alle regelmessige utgifter (bolig, bil, strøm, osv.)"
            }
            {...form.register("monthlyExpenses")}
            inputMode="numeric"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Utestående gjeld (NOK) *"
            error={!!form.formState.errors.outstandingDebt}
            helperText={
              form.formState.errors.outstandingDebt?.message ||
              "Inkluder alle lån og kreditt (boliglån, billån, forbrukslån, etc.)"
            }
            {...form.register("outstandingDebt")}
            inputMode="numeric"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </FormControl>

        <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: appTheme === 'dark' ? 'rgba(45, 45, 45, 0.5)' : 'rgba(245, 245, 245, 0.5)',
            border: appTheme === 'dark' ? '1px solid rgba(90, 90, 90, 0.5)' : '1px solid #e0e0e0',
            mb: 3
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "medium" }}
            >
              Studielån
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  id="hasStudentLoan"
                  checked={hasStudentLoan}
                  {...form.register("hasStudentLoan")}
                  onChange={(e) => {
                    form.setValue("hasStudentLoan", e.target.checked, {
                      shouldValidate: true,
                    });
                    if (!e.target.checked) {
                      form.setValue("studentLoanAmount", "", {
                        shouldValidate: false,
                      });
                      form.setValue("isPayingStudentLoan", false, {
                        shouldValidate: false,
                      });
                    }
                  }}
                  sx={{
                    "&.Mui-checked": { color: "primary.main" },
                    borderRadius: "4px",
                  }}
                />
              }
              label="Jeg har studielån"
              sx={{
                width: "100%",
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  fontWeight: "normal",
                  fontSize: "0.9rem",
                },
              }}
            />
          </FormControl>

          <Box
            sx={{
              display: hasStudentLoan ? "block" : "none",
              mb: 2,
            }}
          >
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    id="isPayingStudentLoan"
                    checked={isPayingStudentLoan}
                    {...form.register("isPayingStudentLoan")}
                    onChange={(e) => {
                      form.setValue("isPayingStudentLoan", e.target.checked, {
                        shouldValidate: true,
                      });
                      
                      // Sett studentlån til 0 hvis ikke betalende
                      if (!e.target.checked) {
                        form.setValue("studentLoanAmount", "0", {
                          shouldValidate: true,
                        });
                      }
                    }}
                    sx={{
                      "&.Mui-checked": { color: "primary.main" },
                      borderRadius: "4px",
                    }}
                  />
                }
                label="Jeg blir å betale ned på studielånet mitt i løpet av denne perioden"
                sx={{
                  width: "100%",
                  margin: 0,
                  "& .MuiFormControlLabel-label": {
                    fontWeight: "normal",
                    fontSize: "0.9rem",
                  },
                }}
              />
            </FormControl>
            <FormControl
              fullWidth
              sx={{ display: isPayingStudentLoan ? "block" : "none" }}
            >
              <TextField
                fullWidth
                label="Studielån (NOK)"
                error={!!form.formState.errors.studentLoanAmount}
                helperText={
                  form.formState.errors.studentLoanAmount?.message ||
                  "Oppgi totalt studielån"
                }
                {...form.register("studentLoanAmount")}
                inputMode="numeric"
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: appTheme === 'dark' ? 'rgba(45, 45, 45, 0.5)' : 'rgba(245, 245, 245, 0.5)',
            border: appTheme === 'dark' ? '1px solid rgba(90, 90, 90, 0.5)' : '1px solid #e0e0e0',
            mb: 3
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "medium" }}
            >
              Sparepenger
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  id="hasSavings"
                  checked={hasSavings}
                  {...form.register("hasSavings")}
                  onChange={(e) => {
                    form.setValue("hasSavings", e.target.checked, {
                      shouldValidate: true,
                    });
                    if (!e.target.checked) {
                      form.setValue("savingsAmount", "", {
                        shouldValidate: false,
                      });
                    }
                  }}
                  sx={{
                    "&.Mui-checked": { color: "primary.main" },
                    borderRadius: "4px",
                  }}
                />
              }
              label="Jeg har sparepenger"
              sx={{
                width: "100%",
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  fontWeight: "normal",
                  fontSize: "0.9rem",
                },
              }}
            />
          </FormControl>

          <Box
            sx={{
              display: hasSavings ? "block" : "none",
              mt: 2,
            }}
          >
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="Sparepenger (NOK)"
                error={!!form.formState.errors.savingsAmount}
                helperText={
                  form.formState.errors.savingsAmount?.message ||
                  "Oppgi totalt beløp i sparepenger"
                }
                {...form.register("savingsAmount")}
                inputMode="numeric"
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: appTheme === 'dark' ? 'rgba(45, 45, 45, 0.5)' : 'rgba(245, 245, 245, 0.5)',
            border: appTheme === 'dark' ? '1px solid rgba(90, 90, 90, 0.5)' : '1px solid #e0e0e0',
            mb: 3
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "medium" }}
            >
              Eiendeler
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  id="hasAssets"
                  checked={hasAssets}
                  {...form.register("hasAssets")}
                  onChange={(e) => {
                    form.setValue("hasAssets", e.target.checked, {
                      shouldValidate: true,
                    });
                    if (!e.target.checked) {
                      form.setValue("assets", "", { shouldValidate: false });
                    }
                  }}
                  sx={{
                    "&.Mui-checked": { color: "primary.main" },
                    borderRadius: "4px",
                  }}
                />
              }
              label="Jeg har andre eiendeler"
              sx={{
                width: "100%",
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  fontWeight: "normal",
                  fontSize: "0.9rem",
                },
              }}
            />
          </FormControl>

          <Box
            sx={{
              display: hasAssets ? "block" : "none",
              mt: 2,
            }}
          >
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="Beskriv dine eiendeler"
                multiline
                rows={3}
                placeholder="Beskriv dine eiendeler (eiendom, investeringer, etc.)"
                error={!!form.formState.errors.assets}
                helperText={
                  form.formState.errors.assets?.message ||
                  "Beskriv din finansielle situasjon med eiendeler som kan være relevant for lånesøknaden"
                }
                {...form.register("assets")}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </FormControl>
          </Box>
        </Box>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label="Ønsket lånebeløp (NOK) *"
            error={!!form.formState.errors.amount}
            helperText={
              form.formState.errors.amount?.message ||
              "Beløp mellom 10 000 kr og 1 000 000 kr"
            }
            {...form.register("amount")}
            inputMode="numeric"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel id="purpose-label">Formål med lånet *</InputLabel>
          <Select
            labelId="purpose-label"
            label="Formål med lånet *"
            error={!!form.formState.errors.purpose}
            defaultValue={form.getValues("purpose") || ""}
            {...form.register("purpose")}
            sx={{
              borderRadius: 2,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
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
            <FormHelperText>Velg hovedformålet med lånet</FormHelperText>
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
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
            helperText="Annen informasjon du mener er relevant for vurdering av din søknad (f.eks. planlagte endringer i inntekt/utgifter, særlige behov, osv.)"
          />
        </FormControl>
      </Box>
    );
  };

  const VerificationStep = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 1 }}>
        Bekreft din identitet ved hjelp av en av følgende metoder:
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant={isBankIDVerified ? "outlined" : "contained"}
          fullWidth
          onClick={() => {
            if (!isBankIDVerified && !isVerifying) {
              trackEvent(AnalyticsEvents.BANKID_START, {
                from: "loan_application",
                step: activeStep,
              });
              setIsVerifying(true);
              setShowBankID(true);
            }
          }}
          disabled={isVerifying || isBankIDVerified}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            height: "54px",
            fontSize: "1rem",
            boxShadow: isBankIDVerified
              ? "none"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            fontWeight: "medium",
            transition: "all 0.3s ease-in-out",
            bgcolor: isBankIDVerified ? "success.light" : undefined,
            borderColor: isBankIDVerified ? "success.main" : undefined,
            color: isBankIDVerified ? "success.main" : undefined,
            "&:hover": {
              bgcolor: isBankIDVerified ? "success.light" : undefined,
              borderColor: isBankIDVerified ? "success.main" : undefined,
            },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
              <span>Verifiserer...</span>
            </div>
          ) : isBankIDVerified ? (
            <div className="flex items-center justify-center text-white px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
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
        <FormHelperText
          sx={{
            textAlign: "center",
            mt: 1,
            color: isBankIDVerified ? "success.main" : "primary.main",
          }}
        >
          {isBankIDVerified ? (
            <span>
              <strong>Verifisert:</strong> Din identitet er bekreftet via BankID
            </span>
          ) : (
            <span>
              <strong>Anbefalt:</strong> Raskere søknadsprosess og umiddelbar
              verifisering
            </span>
          )}
        </FormHelperText>
      </Box>

      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          my: 1.5,
        }}
      >
        <Box
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "absolute",
            width: "100%",
            top: "50%",
          }}
        />
        <Box
          component="span"
          sx={{
            bgcolor: "background.paper",
            px: 2,
            position: "relative",
            color: "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          eller
        </Box>
      </Box>

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
          onClick={() => document.getElementById("id-upload")?.click()}
          startIcon={<Upload />}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            height: "48px",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          {selectedFile ? selectedFile.name : "Last opp legitimasjon"}
        </Button>
        <FormHelperText sx={{ mt: 0.5 }}>
          Aksepterte formater: PNG, JPG, PDF. Maks størrelse: 10MB.
          <br />
          Manuell behandling kan ta lengre tid.
        </FormHelperText>
      </Box>

      {previewUrl && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              aspectRatio: "16/9",
              maxWidth: "sm",
              mx: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={previewUrl}
              alt="Forhåndsvisning"
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.watch("hasConsented")}
              onChange={(e) =>
                form.setValue("hasConsented", e.target.checked, {
                  shouldValidate: true,
                })
              }
            />
          }
          label={
            <span>
              Jeg godtar{" "}
              <a
                href="/terms"
                target="_blank"
                style={{ color: "#1976d2", textDecoration: "underline" }}
              >
                vilkårene og betingelsene
              </a>{" "}
              for lånesøknaden
            </span>
          }
        />
        {form.formState.errors.hasConsented && (
          <FormHelperText error>
            {form.formState.errors.hasConsented.message}
          </FormHelperText>
        )}
      </Box>

      <BankIDDialog
        open={showBankID}
        onOpenChange={setShowBankID}
        onSuccess={handleBankIDSuccess}
      />
    </Box>
  );

  const steps = [
    {
      component: VerificationStep,
      isValid:
        form.getValues("hasConsented") &&
        (isBankIDVerified || selectedFile !== null),
    },
    {
      component: PersonalInfoStep,
      isValid:
        !form.formState.errors.birthDate &&
        !form.formState.errors.street &&
        !form.formState.errors.postalCode &&
        !form.formState.errors.city &&
        !form.formState.errors.employmentStatus &&
        form.getValues("birthDate") &&
        form.getValues("street") &&
        form.getValues("postalCode") &&
        form.getValues("city") &&
        form.getValues("employmentStatus"),
    },
    {
      component: FinancialInfoStep,
      isValid:
        !form.formState.errors.income &&
        !form.formState.errors.monthlyExpenses &&
        !form.formState.errors.outstandingDebt &&
        !form.formState.errors.amount &&
        !form.formState.errors.purpose &&
        !form.formState.errors.assets &&
        form.getValues("income") &&
        form.getValues("monthlyExpenses") &&
        form.getValues("outstandingDebt") &&
        form.getValues("amount") &&
        form.getValues("purpose"),
    },
  ];

  return (
    <div className={`min-h-screen ${appTheme === 'dark' ? 'bg-gray-900' : 'bg-background'}`}>
      <NavHeader />
      <ThemeProvider theme={muiTheme}>
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className={`text-2xl font-bold mb-2 ${appTheme === 'dark' ? 'text-white' : ''}`}>Søk om lån</h1>
            <p className={`${appTheme === 'dark' ? 'text-gray-300' : 'text-slate-500'}`}>
              Fyll ut skjemaet under for å søke om lån. Vi behandler søknaden så raskt som mulig.
            </p>
          </div>
          <div className={`${appTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} shadow-sm rounded-lg p-6`}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
              <LoanApplicationStepper
                activeStep={activeStep}
                handleNext={handleNext}
                handleBack={handleBack}
                isLastStep={activeStep === steps.length - 1}
                isFormValid={!!steps[activeStep].isValid}
              >
                {activeStep === 0 && <VerificationStep />}
                {activeStep === 1 && <PersonalInfoStep />}
                {activeStep === 2 && <FinancialInfoStep />}
              </LoanApplicationStepper>
            </form>
          </div>
        </main>
      </ThemeProvider>
      
      <BankIDDialog
        open={showBankID}
        onOpenChange={setShowBankID}
        onSuccess={handleBankIDSuccess}
      />
    </div>
  );
}
