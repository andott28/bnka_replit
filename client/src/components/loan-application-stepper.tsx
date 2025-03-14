import { useState } from 'react';
import { Stepper, Step, StepLabel, Paper, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PersonOutline, AccountBalanceWallet, VerifiedUser } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const steps = [
  {
    label: 'Personlig informasjon',
    icon: <PersonOutline />,
  },
  {
    label: 'Økonomisk informasjon',
    icon: <AccountBalanceWallet />,
  },
  {
    label: 'Verifisering',
    icon: <VerifiedUser />,
  },
];

interface LoanApplicationStepperProps {
  activeStep: number;
  handleNext: () => void;
  handleBack: () => void;
  children: React.ReactNode;
  isLastStep: boolean;
  isFormValid: boolean;
}

export function LoanApplicationStepper({
  activeStep,
  handleNext,
  handleBack,
  children,
  isLastStep,
  isFormValid,
}: LoanApplicationStepperProps) {
  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel StepIconComponent={() => step.icon}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <StyledPaper elevation={3}>
        {children}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Tilbake
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isFormValid}
          >
            {isLastStep ? 'Send søknad' : 'Neste'}
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}
