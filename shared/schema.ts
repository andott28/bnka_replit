import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  bankAccountId: text("bank_account_id"),
  kycStatus: text("kyc_status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  purpose: text("purpose").notNull(),
  income: integer("income").notNull(),
  employmentStatus: text("employment_status").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow()
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  solarisId: text("solaris_id").notNull(),
  iban: text("iban").notNull(),
  balance: integer("balance").notNull().default(0),
  status: text("status").notNull().default("active"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankAccountId: integer("bank_account_id").notNull(),
  solarisId: text("solaris_id").notNull(),
  type: text("type").notNull(), // debit/credit
  status: text("status").notNull().default("pending"),
  lastFourDigits: text("last_four_digits"),
  expiryDate: text("expiry_date"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  bankAccountId: integer("bank_account_id").notNull(),
  type: text("type").notNull(), // credit/debit
  amount: integer("amount").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  solarisId: text("solaris_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).pick({
  amount: true,
  purpose: true,
  income: true,
  employmentStatus: true
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  solarisId: true,
  iban: true
});

export const insertCardSchema = createInsertSchema(cards).pick({
  userId: true,
  bankAccountId: true,
  solarisId: true,
  type: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;