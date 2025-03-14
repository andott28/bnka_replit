import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
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
  birthDate: date("birth_date"), // Gjort frivillig
  street: text("street").notNull(),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  monthlyExpenses: integer("monthly_expenses").notNull(),
  outstandingDebt: integer("outstanding_debt").notNull(),
  assets: text("assets").notNull(),
  additionalInfo: text("additional_info"),
  hasConsented: boolean("has_consented").notNull().default(false),
  idVerified: boolean("id_verified").notNull().default(false),
  creditScore: text("credit_score"),
  creditScoreDetails: json("credit_score_details"),
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
  creditLimit: integer("credit_limit"),
  monthlyIncome: integer("monthly_income"),
  employmentType: text("employment_type"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).pick({
  amount: true,
  purpose: true,
  income: true,
  employmentStatus: true,
  birthDate: true,
  street: true,
  postalCode: true,
  city: true,
  monthlyExpenses: true,
  outstandingDebt: true,
  assets: true,
  additionalInfo: true,
  hasConsented: true
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
  type: true,
  creditLimit: true,
  monthlyIncome: true,
  employmentType: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;