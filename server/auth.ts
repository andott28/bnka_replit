import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Sjekk om vi er i produksjon for å endre cookie-innstillinger
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Konfigurer session dynamisk basert på miljø og request origin
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'krivo-session-secret', // Fallback hvis ingen miljøvariabel
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    proxy: true, // Viktig for proxy-miljøer som Netlify
    cookie: {
      // I produksjon, tillat kun sikre cookies hvis vi er bak HTTPS
      secure: isProduction,
      // Tillat cookies på tvers av domener (for Netlify)
      sameSite: isProduction ? 'none' : 'lax',
      // Max alder på 7 dager
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // HttpOnly er false slik at klienten kan se cookies for debugging
      httpOnly: false,
      // La nettleseren håndtere domene automatisk
      domain: undefined
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    // Logger innloggingsforsøk
    console.log(`Innloggingsforsøk for: ${req.body.username}`);
    
    passport.authenticate("local", function(err: any, user: Express.User | false, info: any) {
      if (err) {
        console.error("Autentiseringsfeil:", err);
        return next(err);
      }
      
      if (!user) {
        console.log(`Innlogging mislyktes for: ${req.body.username}`);
        return res.status(401).json({ 
          message: "Feil brukernavn eller passord" 
        });
      }
      
      req.login(user, function(loginErr) {
        if (loginErr) {
          console.error("Session-feil ved innlogging:", loginErr);
          return next(loginErr);
        }
        
        console.log(`Innlogging vellykket for: ${user.username} (ID: ${user.id})`);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Uautorisert forsøk på å få brukerinfo");
      return res.status(401).json({ message: "Ikke pålogget" });
    }
    console.log(`Brukerinfo forespurt for bruker: ${req.user?.id}`);
    res.json(req.user);
  });
}
