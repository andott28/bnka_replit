import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false)
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
