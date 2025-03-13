import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertLoanApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}