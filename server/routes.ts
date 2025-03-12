import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertLoanApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Loan application routes
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
  
  // Endpoint for updating user information
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const userId = parseInt(req.params.id);
    const { firstName, lastName, phoneNumber, kycStatus } = req.body;
    
    try {
      // Update user information
      const updatedUser = await storage.updateUserInfo(userId, {
        firstName,
        lastName,
        phoneNumber,
        kycStatus
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
