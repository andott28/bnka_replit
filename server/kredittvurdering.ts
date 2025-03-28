import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Utfører kredittvurdering basert på detaljerte brukerdata
 */
export async function kredittvurdering(
  navn: string,
  alder: number,
  bosted: string,
  jobbstatus: string,
  norsk_inntekt: number,
  global_inntekt: number,
  arbeidstilbud: string,
  utdanning: string,
  oppholdstid: number,
  gjeld: number,
  betalingshistorikk: string,
  språkkunnskaper: string,
  nettverk_i_norge: string
) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY er ikke konfigurert i miljøvariablene");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Beregn månedlig inntekt og DTI (Debt-to-Income Ratio)
  const månedlig_norsk_inntekt = norsk_inntekt / 12;
  const månedlig_global_inntekt = global_inntekt / 12;
  const total_månedlig_inntekt = månedlig_norsk_inntekt + månedlig_global_inntekt;
  
  // Anta at gjeld representerer månedlig gjeldsbetjening
  const dti = gjeld / total_månedlig_inntekt;

  // Lage en detaljert prompt til AI-modellen
  const prompt = `
    Analyser følgende finansielle og personlige data og gi en kredittscore (A, B, C, D, E, eller F) med detaljert forklaring.
    Analysen skal være positiv, empatisk og støttende i tonen, samtidig som den gir en realistisk vurdering.
    Bruk en vennlig og oppmuntrende kommunikasjonsstil, selv ved lavere score. 
    Fokuser på muligheter og fremtidspotensial fremfor mangler.

    Personopplysninger:
    - Navn: ${navn}
    - Alder: ${alder} år
    - Bosted i Norge: ${bosted}
    - Oppholdstid i Norge: ${oppholdstid} år

    Finansiell informasjon:
    - Jobbstatus: ${jobbstatus}
    - Norsk månedlig inntekt: ${månedlig_norsk_inntekt.toFixed(2)} NOK
    - Global månedlig inntekt: ${månedlig_global_inntekt.toFixed(2)} NOK
    - Total månedlig inntekt: ${total_månedlig_inntekt.toFixed(2)} NOK
    - Gjeldsbetjening per måned: ${gjeld} NOK
    - Gjeld-til-inntekt-forhold (DTI): ${dti.toFixed(2)}
    - Betalingshistorikk: ${betalingshistorikk}

    Kvalifikasjonsfaktorer:
    - Utdanningsnivå: ${utdanning}
    - Arbeidstilbud/jobbmuligheter: ${arbeidstilbud}
    - Språkkunnskaper: ${språkkunnskaper}
    - Nettverk i Norge: ${nettverk_i_norge}

    Legg vekt på:
    - Finansiell stabilitet (både innenlands og global inntekt)
    - Tilpasningsevne og potensial i arbeidsmarkedet
    - Langsiktig kredittverdig potensiale
    - Balanse mellom tradisjonelle kredittmetrikker og personlige faktorer
    - Oppmuntrende tone som fremhever styrker og muligheter
    - Konstruktive anbefalinger formulert på en støttende måte

    VIKTIG: Formuleringer skal være positive og ressursorienterte, ikke strenge eller negative.
    For lavere score (D-F), fokuser på det konkrete forbedringspotensial og muligheter for fremtiden,
    unngå kritiske eller nedsettende formuleringer.

    Formater svaret som JSON med følgende struktur:
    {
      "score": "A-F",
      "numerisk_score": 0-100,
      "forklaring": "Positiv og støttende forklaring av vurderingen som fokuserer på muligheter",
      "styrker": ["Liste med finansielle styrker og personlige ressurser"],
      "svakheter": ["Liste med forbedringsområder, positivt formulert som muligheter"],
      "anbefalinger": ["Oppmuntrende og spesifikke anbefalinger"],
      "faktorer": {
        "inntektsstabilitet": 0-10,
        "gjeldsbelastning": 0-10,
        "betalingshistorikk": 0-10,
        "tilpasningsevne": 0-10,
        "utdanningsrelevans": 0-10,
        "språkferdigheter": 0-10,
        "nettverk": 0-10
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    // Rengjør responsen hvis den er pakket inn i markdown kodeblokker
    let cleanedResponse = responseText;
    if (responseText.includes("```json")) {
      cleanedResponse = responseText.replace(/```json\n|\n```/g, "");
    } else if (responseText.includes("```")) {
      cleanedResponse = responseText.replace(/```\n|\n```/g, "");
    }
    
    // Parse JSON
    const creditAssessment = JSON.parse(cleanedResponse);
    
    return {
      score: creditAssessment.score,
      numerisk_score: creditAssessment.numerisk_score,
      forklaring: creditAssessment.forklaring,
      styrker: creditAssessment.styrker,
      svakheter: creditAssessment.svakheter,
      anbefalinger: creditAssessment.anbefalinger,
      faktorer: creditAssessment.faktorer
    };
  } catch (error) {
    console.error("Feil ved generering av kredittvurdering:", error);
    throw new Error("Kunne ikke generere kredittvurdering");
  }
}