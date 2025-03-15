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
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Personlig lånefinansiering
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        Enkelt, trygt og tilpasset dine behov
      </Typography>

      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{
          '& .MuiStepLabel-root .Mui-completed': {
            color: 'primary.main',
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: 'primary.main',
          },
          mb: 4
        }}
      >
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel 
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep >= steps.indexOf(step) ? 'primary.main' : 'grey.300',
                    color: activeStep >= steps.indexOf(step) ? 'white' : 'grey.700',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <StyledPaper elevation={3}>
        {children}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 3
              }}
            >
              Tilbake
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 4,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: isFormValid ? 'shine 1.5s infinite' : 'none'
                },
                '@keyframes shine': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            >
              {isLastStep ? 'Send søknad' : 'Neste'}
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </Box>
  );
}