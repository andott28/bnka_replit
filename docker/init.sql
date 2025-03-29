-- Opprett tabeller for Krivo-applikasjonen

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  "phoneNumber" VARCHAR(255),
  "kycStatus" VARCHAR(50) DEFAULT 'pending',
  role VARCHAR(50) DEFAULT 'user',
  "personalNumber" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS loan_applications (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  term INTEGER NOT NULL,
  purpose VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  "creditScore" VARCHAR(50),
  "creditScoreDetails" JSONB,
  "monthlyIncome" INTEGER,
  "monthlyExpenses" INTEGER,
  "employmentStatus" VARCHAR(255),
  "employmentSector" VARCHAR(255),
  "housingStatus" VARCHAR(255),
  "dependents" INTEGER,
  education VARCHAR(255),
  "residencyStatus" VARCHAR(255),
  "norwegianLanguageLevel" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "accountNumber" VARCHAR(255) NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0,
  "accountType" VARCHAR(255) DEFAULT 'checking',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "cardNumber" VARCHAR(255) NOT NULL UNIQUE,
  "expiryDate" VARCHAR(255) NOT NULL,
  "cardType" VARCHAR(255) DEFAULT 'debit',
  "accountId" INTEGER REFERENCES bank_accounts(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  "accountId" INTEGER NOT NULL REFERENCES bank_accounts(id),
  amount INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);

-- Opprett admin bruker
INSERT INTO users (username, password, email, "firstName", "lastName", role)
VALUES (
  'admin', 
  '$2b$10$FcE9xapfHMV2h1KPvlJx7eWQaIrWVTtpkIUL5w6okuEjNUFJW.qNC', -- 'password123'
  'admin@krivo.no',
  'Admin',
  'Bruker',
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- Opprett testbruker
INSERT INTO users (username, password, email, "firstName", "lastName", "phoneNumber", "personalNumber")
VALUES (
  'testbruker', 
  '$2b$10$FcE9xapfHMV2h1KPvlJx7eWQaIrWVTtpkIUL5w6okuEjNUFJW.qNC', -- 'password123'
  'test@krivo.no',
  'Test',
  'Bruker',
  '12345678',
  '12345678901'
) ON CONFLICT (username) DO NOTHING;

-- Opprett bankkonto for testbruker
INSERT INTO bank_accounts ("userId", "accountNumber", balance, "accountType")
SELECT id, '1234567890', 10000, 'checking' FROM users WHERE username = 'testbruker'
ON CONFLICT DO NOTHING;

-- Opprett noen eksempeltransaksjoner
INSERT INTO transactions ("accountId", amount, description, type)
SELECT ba.id, 5000, 'Lønn mars', 'inntekt'
FROM bank_accounts ba
JOIN users u ON ba."userId" = u.id
WHERE u.username = 'testbruker'
ON CONFLICT DO NOTHING;

INSERT INTO transactions ("accountId", amount, description, type)
SELECT ba.id, -1200, 'Dagligvarer', 'utgift'
FROM bank_accounts ba
JOIN users u ON ba."userId" = u.id
WHERE u.username = 'testbruker'
ON CONFLICT DO NOTHING;

-- Opprett et kort for testbrukeren
INSERT INTO cards ("userId", "cardNumber", "expiryDate", "cardType", "accountId")
SELECT u.id, '4111111111111111', '12/25', 'debit', ba.id
FROM users u
JOIN bank_accounts ba ON u.id = ba."userId"
WHERE u.username = 'testbruker'
ON CONFLICT DO NOTHING;