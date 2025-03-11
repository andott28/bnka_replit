import { IStorage } from "./storage";
import { User, InsertUser, LoanApplication, InsertLoanApplication } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLoanApplication(loan: InsertLoanApplication & { userId: number }): Promise<LoanApplication>;
  getLoansByUserId(userId: number): Promise<LoanApplication[]>;
  getAllLoans(): Promise<LoanApplication[]>;
  updateLoanStatus(id: number, status: string): Promise<LoanApplication | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, LoanApplication>;
  public sessionStore: session.Store;
  private currentUserId: number;
  private currentLoanId: number;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.currentUserId = 1;
    this.currentLoanId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async createLoanApplication(loan: InsertLoanApplication & { userId: number }): Promise<LoanApplication> {
    const id = this.currentLoanId++;
    const loanApplication: LoanApplication = {
      ...loan,
      id,
      status: "pending",
      submittedAt: new Date()
    };
    this.loans.set(id, loanApplication);
    return loanApplication;
  }

  async getLoansByUserId(userId: number): Promise<LoanApplication[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.userId === userId
    );
  }

  async getAllLoans(): Promise<LoanApplication[]> {
    return Array.from(this.loans.values());
  }

  async updateLoanStatus(id: number, status: string): Promise<LoanApplication | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, status };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
}

export const storage = new MemStorage();
