import express from 'express';
import { kredittvurdering } from '../kredittvurdering';
import { storage } from '../storage';

const router = express.Router();

/**
 * Endepunkt for forbedret kredittvurdering som tar hensyn til ytterligere faktorer
 * spesielt tilpasset innvandrere og utlendinger
 */
router.post('/api/kredittvurdering', async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const {
      loanApplicationId,
      navn,
      alder,
      bosted,
      jobbstatus,
      norsk_inntekt,
      global_inntekt,
      arbeidstilbud,
      utdanning,
      oppholdstid,
      gjeld,
      betalingshistorikk,
      språkkunnskaper,
      nettverk_i_norge
    } = req.body;

    // Valider input-parametre
    if (!loanApplicationId) {
      return res.status(400).json({ error: "Manglende lånesøknad ID" });
    }

    if (!navn || !alder || !bosted || !jobbstatus || !norsk_inntekt || !global_inntekt ||
        !arbeidstilbud || !utdanning || oppholdstid === undefined || gjeld === undefined ||
        !betalingshistorikk || !språkkunnskaper || !nettverk_i_norge) {
      return res.status(400).json({ error: "Manglende obligatoriske data for kredittvurdering" });
    }

    console.log("Forbedret kredittvurderingsforespørsel for lånesøknad:", loanApplicationId);

    try {
      // Kall kredittvurderingsfunksjonen
      const vurderingsResultat = await kredittvurdering(
        navn,
        alder,
        bosted,
        jobbstatus,
        parseFloat(norsk_inntekt),
        parseFloat(global_inntekt),
        arbeidstilbud,
        utdanning,
        parseInt(oppholdstid),
        parseFloat(gjeld),
        betalingshistorikk,
        språkkunnskaper,
        nettverk_i_norge
      );

      console.log("Kredittvurdering fullført for lån:", loanApplicationId);

      // Lagre kredittvurderingen i databasen
      await storage.updateLoanApplicationCreditScore(
        loanApplicationId,
        vurderingsResultat.score,
        vurderingsResultat
      );

      res.json(vurderingsResultat);
    } catch (error) {
      console.error("Feil ved generering av kredittvurdering:", error);
      res.status(500).json({ 
        error: "Kunne ikke generere kredittvurdering", 
        details: error instanceof Error ? error.message : "Ukjent feil" 
      });
    }
  } catch (error) {
    console.error("Feil i kredittvurderingsendepunkt:", error);
    res.status(500).json({ 
      error: "En feil oppsto ved behandling av forespørselen", 
      details: error instanceof Error ? error.message : "Ukjent feil" 
    });
  }
});

export default router;