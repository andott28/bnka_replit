import { User, InsertUser, LoanApplication, InsertLoanApplication, BankAccount, Card, Transaction } from "@shared/schema";
import { users, loanApplications, bankAccounts, cards, transactions } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLoanApplication(loan: InsertLoanApplication & { userId: number }): Promise<LoanApplication>;
  getLoansByUserId(userId: number): Promise<LoanApplication[]>;
  getAllLoans(): Promise<LoanApplication[]>;
  updateLoanStatus(id: number, status: string): Promise<LoanApplication | undefined>;
  // Nye metoder for bankkontoer og kort
  createBankAccount(account: Partial<BankAccount>): Promise<BankAccount>;
  getBankAccountsByUserId(userId: number): Promise<BankAccount[]>;
  createCard(card: Partial<Card>): Promise<Card>;
  getCardsByUserId(userId: number): Promise<Card[]>;
  addTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createLoanApplication(loan: InsertLoanApplication & { userId: number }): Promise<LoanApplication> {
    const [application] = await db.insert(loanApplications).values(loan).returning();
    return application;
  }

  async getLoansByUserId(userId: number): Promise<LoanApplication[]> {
    return db.select().from(loanApplications).where(eq(loanApplications.userId, userId));
  }

  async getAllLoans(): Promise<LoanApplication[]> {
    return db.select().from(loanApplications);
  }

  async updateLoanStatus(id: number, status: string): Promise<LoanApplication | undefined> {
    const [loan] = await db
      .update(loanApplications)
      .set({ status })
      .where(eq(loanApplications.id, id))
      .returning();
    return loan;
  }

  async createBankAccount(account: Partial<BankAccount>): Promise<BankAccount> {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }

  async getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
    return db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
  }

  async createCard(card: Partial<Card>): Promise<Card> {
    const [newCard] = await db.insert(cards).values(card).returning();
    return newCard;
  }

  async getCardsByUserId(userId: number): Promise<Card[]> {
    return db.select().from(cards).where(eq(cards.userId, userId));
  }

  async addTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.bankAccountId, accountId));
  }
}

export const storage = new DatabaseStorage();