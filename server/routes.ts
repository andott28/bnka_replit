import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertLoanApplicationSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, pool } from "./db";
import kredittvurderingRouter from "./routes/kredittvurdering";


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  
  // Registrer den forbedrede kredittvurderingsruten
  app.use(kredittvurderingRouter);

  // Mock BankID endpoints
  app.post("/api/mock-bankid/init", async (req, res) => {
    try {
      // Simuler oppstart av BankID-autentisering
      const referenceId = Math.random().toString(36).substring(7);
      res.json({
        referenceId,
        status: "pending",
        message: "Venter på BankID-autentisering"
      });
    } catch (error) {
      res.status(500).json({ error: "Kunne ikke starte BankID-autentisering" });
    }
  });

  app.post("/api/mock-bankid/status/:referenceId", async (req, res) => {
    try {
      const { referenceId } = req.params;
      // Simuler status-sjekk (i produksjon ville dette sjekket faktisk BankID-status)
      res.json({
        referenceId,
        status: "completed",
        personalNumber: "12345678901", // Test personnummer
        name: "Ola Nordmann"
      });
    } catch (error) {
      res.status(500).json({ error: "Kunne ikke hente BankID-status" });
    }
  });

  // Add the credit scoring endpoint
  app.post("/api/loans/credit-score", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Validate required fields
      const { loanApplicationId, income, employmentStatus, monthlyExpenses, outstandingDebt, assets } = req.body;
      
      if (!loanApplicationId) {
        return res.status(400).json({ error: "Manglende lånesøknad ID" });
      }
      
      if (!income || !employmentStatus || !monthlyExpenses || outstandingDebt === undefined || !assets) {
        return res.status(400).json({ error: "Manglende obligatoriske finansielle data for kredittvurdering" });
      }
      
      console.log("Credit score request for loan application:", loanApplicationId);
      
      // Initialize Google AI
      if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is not configured in the environment");
        return res.status(500).json({ error: "AI-tjenesten er ikke riktig konfigurert" });
      }
      
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Calculate debt-to-income ratio
      const monthlyIncome = income / 12;
      const dti = (monthlyExpenses + outstandingDebt) / monthlyIncome;

      const prompt = `
        Analyze the following financial data and provide a credit score grade (A, B, C, D, E, or F) with detailed explanation:

        Monthly Income: ${monthlyIncome} NOK
        Employment Status: ${employmentStatus}
        Monthly Expenses: ${monthlyExpenses} NOK
        Outstanding Debt: ${outstandingDebt} NOK
        Debt-to-Income Ratio: ${dti.toFixed(2)}
        Assets: ${assets}

        Please format the response as JSON with the following structure:
        {
          "grade": "A-F",
          "explanation": "Detailed explanation of the grade",
          "strengths": ["List of financial strengths"],
          "weaknesses": ["List of areas for improvement"],
          "recommendations": ["Specific recommendations"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      
      try {
        // Get the response text
        const responseText = response.text();
        console.log("Raw response:", responseText);
        
        // Clean up the response if it's wrapped in markdown code blocks
        let cleanedResponse = responseText;
        if (responseText.includes("```json")) {
          cleanedResponse = responseText.replace(/```json\n|\n```/g, "");
        } else if (responseText.includes("```")) {
          cleanedResponse = responseText.replace(/```\n|\n```/g, "");
        }
        
        // Parse the JSON
        const creditAssessment = JSON.parse(cleanedResponse);
        console.log("Credit assessment completed for loan:", loanApplicationId);

        // Store the credit score in the database
        await storage.updateLoanApplicationCreditScore(
          loanApplicationId,
          creditAssessment.grade,
          creditAssessment
        );

        res.json(creditAssessment);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", response.text());
        res.status(500).json({ error: "Kunne ikke tolke kredittscoreresultatet" });
      }
    } catch (error) {
      console.error("Error generating credit score:", error);
      res.status(500).json({ 
        error: "Kunne ikke generere kredittscore", 
        details: error instanceof Error ? error.message : "Ukjent feil" 
      });
    }
  });


  // Existing routes
  app.post("/api/loans/apply", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertLoanApplicationSchema.parse(req.body);
      const loanApplication = await storage.createLoanApplication({
        ...validatedData,
        userId: req.user.id
      });
      res.status(201).json(loanApplication);
    } catch (error) {
      res.status(400).json({ error: "Invalid loan application data" });
    }
  });

  app.get("/api/loans", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const loans = await storage.getLoansByUserId(req.user.id);
    res.json(loans);
  });
  
  // Endpoint to get the latest credit score for the user
  app.get("/api/loans/latest-credit-score", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get all loans for the user
      const loans = await storage.getLoansByUserId(req.user.id);
      
      if (!loans || loans.length === 0) {
        return res.status(404).json({ error: "Ingen lånesøknader funnet" });
      }
      
      // Find the latest loan with a credit score
      const loansWithCreditScore = loans
        .filter(loan => loan.creditScore && loan.creditScoreDetails)
        .sort((a, b) => {
          // Use submittedAt for sorting
          const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt);
          const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt);
          return dateB.getTime() - dateA.getTime();
        });
      
      if (loansWithCreditScore.length === 0) {
        return res.status(404).json({ error: "Ingen kredittvurdering funnet" });
      }
      
      // Return the credit details for the latest loan
      const latestLoan = loansWithCreditScore[0];
      
      // Ensure we return valid JSON for the credit score details
      if (typeof latestLoan.creditScoreDetails === 'string') {
        try {
          // If it's stored as a string, parse it
          res.json(JSON.parse(latestLoan.creditScoreDetails as string));
        } catch (parseError) {
          console.error("Error parsing credit score details:", parseError);
          res.json(latestLoan.creditScoreDetails);
        }
      } else {
        // Otherwise just return the object
        res.json(latestLoan.creditScoreDetails);
      }
    } catch (error) {
      console.error("Error fetching latest credit score:", error);
      res.status(500).json({ 
        error: "Kunne ikke hente kredittvurdering", 
        details: error instanceof Error ? error.message : "Ukjent feil" 
      });
    }
  });

  app.get("/api/loans/all", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const loans = await storage.getAllLoans();
    res.json(loans);
  });

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Delete loan application
  app.delete("/api/loans/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const loanId = parseInt(req.params.id);
    try {
      await pool.query('DELETE FROM loan_applications WHERE id = $1', [loanId]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loan:", error);
      res.status(500).json({ error: "Could not delete loan application" });
    }
  });

  app.patch("/api/loans/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const loanId = parseInt(req.params.id);
    const updated = await storage.updateLoanStatus(loanId, status);
    if (!updated) {
      return res.status(404).json({ error: "Loan application not found" });
    }
    res.json(updated);
  });

  app.patch("/api/users/:id/kyc", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const userId = parseInt(req.params.id);
    const updated = await storage.updateUserKycStatus(userId, status);
    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updated);
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    // Allow users to update their own info, or admins to update any user
    const userId = parseInt(req.params.id);
    if (!req.user.isAdmin && req.user.id !== userId) {
      return res.sendStatus(403);
    }

    const { firstName, lastName, phoneNumber, kycStatus } = req.body;

    try {
      const updatedUser = await storage.updateUserInfo(userId, {
        firstName,
        lastName,
        phoneNumber,
        kycStatus: req.user.isAdmin ? kycStatus : undefined // Only admins can update KYC status
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user information" });
    }
  });
  
  // Delete User (Admin only)
  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }
    
    const userId = parseInt(req.params.id);
    
    // Prevent deleting your own account while you're logged in
    if (userId === req.user.id) {
      return res.status(400).json({ 
        error: "Cannot delete your own admin account while logged in"
      });
    }
    
    try {
      // Step 1: Get all loans for this user
      const userLoans = await storage.getLoansByUserId(userId);
      
      // Step 2: Delete all loans for this user first (to maintain referential integrity)
      for (const loan of userLoans) {
        await pool.query(`DELETE FROM loan_applications WHERE id = $1;`, [loan.id]);
      }
      
      // Step 3: Delete the user
      const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id;`, [userId]);
      
      if (!result.rowCount || result.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, message: "User and associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ 
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // SQL Query endpoint for admin dashboard
  app.post("/api/admin/execute-sql", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ message: 'Ugyldig SQL spørring' });
    }
    
    // Basic security check to prevent destructive operations
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery.includes('drop table') || 
      lowerQuery.includes('truncate table') ||
      (lowerQuery.includes('delete') && !lowerQuery.includes('where')) ||
      (lowerQuery.includes('update') && !lowerQuery.includes('where'))
    ) {
      return res.status(403).json({ 
        message: 'Potensielt farlig SQL-spørring avvist. Sørg for at DELETE/UPDATE har WHERE-betingelser og at du ikke bruker DROP/TRUNCATE.' 
      });
    }

    try {
      console.log("Executing SQL query:", query);
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("SQL query error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Ukjent SQL-feil'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}