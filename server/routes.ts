import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertMemberSchema, insertMembershipPaymentSchema, insertDonationSchema, insertPostSchema, insertPageSchema, insertSmsTemplateSchema, insertSmsLogSchema, insertSettingSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, admin: { id: admin.id, email: admin.email, fullName: admin.fullName } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await storage.createAdmin({ email, password: hashedPassword, fullName });
      res.json({ id: admin.id, email: admin.email, fullName: admin.fullName });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.get("/api/members", authenticateToken, async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  });

  app.get("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const member = await storage.getMemberById(parseInt(req.params.id));
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch member' });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validation = insertMemberSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const member = await storage.createMember(validation.data);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create member' });
    }
  });

  app.patch("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const member = await storage.updateMember(parseInt(req.params.id), req.body);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update member' });
    }
  });

  app.delete("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteMember(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete member' });
    }
  });

  app.get("/api/payments", authenticateToken, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validation = insertMembershipPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const payment = await storage.createPayment(validation.data);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });

  app.patch("/api/payments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(parseInt(req.params.id), status);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  });

  app.get("/api/donations", authenticateToken, async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch donations' });
    }
  });

  app.post("/api/donations", async (req, res) => {
    try {
      const validation = insertDonationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const donation = await storage.createDonation(validation.data);
      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create donation' });
    }
  });

  app.patch("/api/donations/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const donation = await storage.updateDonationStatus(parseInt(req.params.id), status);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update donation status' });
    }
  });

  app.post("/api/donations/initialize-payment", async (req, res) => {
    let donation: any = null;
    try {
      const { amount, currency, firstName, lastName, email, phone, isAnonymous } = req.body;
      
      if (!amount || !firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum <= 0 || !Number.isInteger(amountNum)) {
        return res.status(400).json({ error: 'Invalid amount - must be a positive whole number' });
      }

      const txRef = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const donationCurrency = currency || 'ETB';
      
      const donationData = {
        transactionId: txRef,
        donorName: `${firstName} ${lastName}`,
        donorEmail: email,
        amount: amountNum,
        currency: donationCurrency,
        isAnonymous: isAnonymous || false,
        paymentMethod: 'chapa',
        status: 'pending' as const,
      };

      const validation = insertDonationSchema.safeParse(donationData);
      if (!validation.success) {
        console.error('Donation validation failed:', fromZodError(validation.error).message);
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      donation = await storage.createDonation(validation.data);

      const chapaPayload = {
        amount: amountNum.toString(),
        currency: donationCurrency,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        tx_ref: txRef,
        callback_url: `${req.protocol}://${req.get('host')}/api/chapa/callback`,
        return_url: `${req.protocol}://${req.get('host')}/donate/success`,
        customization: {
          title: 'Fasil Kenema FC Donation',
          description: 'Support The Emperors',
          logo: 'https://your-logo-url.com/logo.png'
        }
      };

      const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapaPayload)
      });

      if (!chapaResponse.ok) {
        const errorText = await chapaResponse.text();
        console.error('Chapa API error:', errorText);
        await storage.updateDonationStatus(donation.id, 'failed');
        return res.status(500).json({ error: 'Failed to initialize payment with Chapa' });
      }

      const chapaData = await chapaResponse.json();

      if (chapaData.status === 'success' && chapaData.data?.checkout_url) {
        res.json({
          success: true,
          checkoutUrl: chapaData.data.checkout_url,
          donationId: donation.id,
          txRef: txRef
        });
      } else {
        console.error('Chapa returned non-success status:', chapaData);
        await storage.updateDonationStatus(donation.id, 'failed');
        res.status(500).json({ error: 'Failed to initialize payment with Chapa' });
      }
    } catch (error) {
      console.error('Chapa initialization error:', error);
      if (donation?.id) {
        await storage.updateDonationStatus(donation.id, 'failed');
      }
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

  app.post("/api/chapa/callback", async (req, res) => {
    try {
      const { trx_ref, status } = req.body;
      
      if (status === 'success') {
        const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${trx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`
          }
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.status === 'success' && verifyData.data.status === 'success') {
          const donation = await storage.getDonationByTransactionId(trx_ref);
          
          if (donation) {
            const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
            const chapaCurrency = verifyData.data.currency;
            
            if (chapaAmount === donation.amount && chapaCurrency === donation.currency) {
              await storage.updateDonationStatus(donation.id, 'completed');
            } else {
              console.error('Amount/currency mismatch:', { chapaAmount, chapaCurrency, donation });
            }
          }
        }
      }

      res.json({ message: 'Callback received' });
    } catch (error) {
      console.error('Chapa callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  });

  app.get("/api/chapa/verify/:txRef", async (req, res) => {
    try {
      const { txRef } = req.params;

      const donation = await storage.getDonationByTransactionId(txRef);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.status !== 'success') {
        return res.status(400).json({ error: 'Verification failed', status: 'failed' });
      }

      if (verifyData.data.status === 'success') {
        const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
        const chapaCurrency = verifyData.data.currency;
        
        if (chapaAmount === donation.amount && chapaCurrency === donation.currency) {
          await storage.updateDonationStatus(donation.id, 'completed');
          
          res.json({
            success: true,
            status: 'success',
            donation: donation
          });
        } else {
          console.error('Amount/currency mismatch:', { chapaAmount, chapaCurrency, donation });
          res.status(400).json({ 
            error: 'Payment amount or currency does not match',
            status: 'failed'
          });
        }
      } else {
        res.json({
          success: false,
          status: verifyData.data.status,
          donation: donation
        });
      }
    } catch (error) {
      console.error('Chapa verification error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const post = await storage.createPost(validation.data);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.patch("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const post = await storage.updatePost(parseInt(req.params.id), req.body);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deletePost(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });

  app.get("/api/sms-templates", authenticateToken, async (req, res) => {
    try {
      const templates = await storage.getSmsTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SMS templates' });
    }
  });

  app.post("/api/sms-templates", authenticateToken, async (req, res) => {
    try {
      const validation = insertSmsTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const template = await storage.createSmsTemplate(validation.data);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create SMS template' });
    }
  });

  app.patch("/api/sms-templates/:id", authenticateToken, async (req, res) => {
    try {
      const template = await storage.updateSmsTemplate(parseInt(req.params.id), req.body);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update SMS template' });
    }
  });

  app.delete("/api/sms-templates/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteSmsTemplate(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete SMS template' });
    }
  });

  app.get("/api/sms-logs", authenticateToken, async (req, res) => {
    try {
      const logs = await storage.getSmsLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SMS logs' });
    }
  });

  app.post("/api/sms-logs", authenticateToken, async (req, res) => {
    try {
      const validation = insertSmsLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const log = await storage.createSmsLog(validation.data);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create SMS log' });
    }
  });

  app.get("/api/settings", authenticateToken, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });

  app.post("/api/settings", authenticateToken, async (req, res) => {
    try {
      const validation = insertSettingSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      const setting = await storage.upsertSetting(validation.data);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save setting' });
    }
  });

  app.delete("/api/settings/:key", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteSetting(req.params.key);
      if (!success) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete setting' });
    }
  });

  app.get("/api/stats/revenue", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getRevenueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch revenue stats' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
