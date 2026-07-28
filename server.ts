import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini Client lazily or check API key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Auth Signup / Login mock-backed JWT simulation
app.post('/api/auth/signup', (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = {
    id: `usr-${Date.now()}`,
    email,
    displayName: displayName || email.split('@')[0],
    token: `jwt-mock-token-${Date.now()}`,
  };
  return res.json(user);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = {
    id: `usr-${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    token: `jwt-mock-token-${Date.now()}`,
  };
  return res.json(user);
});

// 2. Smart Reminder & Explainer Parser
app.post('/api/reminders/parse', async (req, res) => {
  try {
    const { rawText, forceIncomplete } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const ai = getAiClient();
    const textLower = rawText.toLowerCase();

    // Check for explicit fallback or vague trigger words
    if (forceIncomplete || textLower.includes('incomplete') || textLower.includes('vague')) {
      return res.json({
        title: 'Scanned Document Notice',
        amount: null,
        dueDate: null,
        category: 'Bills',
        description: rawText || 'Unclear text snippet from uploaded document.',
        incomplete: true,
        warningMessage: "COULDN'T READ EVERYTHING — CHECK THE FIELDS BELOW",
      });
    }

    if (!ai) {
      // Fallback heuristic if API key is not present
      const amountMatch = rawText.match(/\$?(\d+(?:\.\d{1,2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 115.0;
      const today = new Date();
      today.setDate(today.getDate() + 7);
      return res.json({
        title: rawText.substring(0, 40) + ' Notice',
        amount,
        dueDate: today.toISOString().split('T')[0],
        category: 'Bills',
        description: rawText,
        incomplete: false,
      });
    }

    const prompt = `You are an expert AI Life-Admin assistant. Analyze the following document text, bill, or receipt, and extract reminder information.
    
    Raw Text:
    """
    ${rawText}
    """
    
    Respond STRICTLY in JSON format with no markdown wrappers or code fences:
    {
      "title": "Clear concise reminder title (max 50 chars)",
      "amount": 120.50 (number or null if missing),
      "dueDate": "YYYY-MM-DD" (valid date string or null if not specified),
      "category": "Bills" | "Rent" | "Subscriptions" | "Insurance" | "Tax",
      "description": "Brief explanation or key details extracted",
      "incomplete": boolean (true if amount or dueDate is missing or text is ambiguous),
      "warningMessage": "Warning message if incomplete or unclear, else null"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || '';
    // Clean code fences if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output for reminder:', text);
      return res.json({
        title: 'Extracted Notice',
        amount: null,
        dueDate: null,
        category: 'Bills',
        description: rawText,
        incomplete: true,
        warningMessage: "COULDN'T READ EVERYTHING — CHECK THE FIELDS BELOW",
      });
    }
  } catch (err: any) {
    console.error('Error in /api/reminders/parse:', err);
    return res.status(500).json({ error: 'Failed to process reminder with AI' });
  }
});

// 3. Letter / Message Drafter
app.post('/api/drafts/generate', async (req, res) => {
  try {
    const { templateId, templateTitle, inputs } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        content: `FORMAL NOTICE\n\nDate: ${new Date().toLocaleDateString()}\n\nTo: ${
          inputs?.landlordName || inputs?.managerName || 'Recipient'
        }\n\nDear Sir/Madam,\n\nI am writing regarding ${
          inputs?.issueType || inputs?.reason || 'the matter discussed'
        }.\n\nSincerely,\nJane Doe`,
      });
    }

    const prompt = `You are a professional life-admin communication assistant. Draft a polished, formal, and effective letter or email based on the following template requirements and user inputs.

    Template: ${templateTitle || templateId}
    User Field Inputs: ${JSON.stringify(inputs, null, 2)}
    Current Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

    Guidelines:
    - Include subject/heading, proper formal salutation, well-structured paragraphs with clear line breaks, and a polite closing.
    - Write directly as the sender ("Jane Doe" or as specified).
    - Output ONLY the letter text with line breaks. Do not wrap in markdown quotes or extra meta commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const content = response.text?.trim() || 'Could not generate draft.';
    return res.json({ content });
  } catch (err: any) {
    console.error('Error in /api/drafts/generate:', err);
    return res.status(500).json({ error: 'Failed to generate letter draft with AI' });
  }
});

// 4. Expense Organizer Parser
app.post('/api/expenses/parse', async (req, res) => {
  try {
    const { rawText, month, existingItems } = req.body;

    const ai = getAiClient();
    if (!ai || !rawText || !rawText.trim()) {
      return res.json({
        items: existingItems || [],
        tip: 'NO NEW TEXT PROVIDED TO PARSE',
      });
    }

    const prompt = `You are an AI expense categorization system. Analyze the following raw text or receipt line items and extract each spending item.

    Input text:
    """
    ${rawText}
    """

    For each item found, extract:
    - title: item name
    - amount: numeric dollar value
    - category: MUST be one of ["Food", "Bills", "Travel", "Shopping/Other"]
    - date: YYYY-MM-DD (use today's date ${new Date().toISOString().split('T')[0]} if unspecified)

    Also generate a 1-sentence analytical tip in ALL CAPS (e.g., "FOOD ACCOUNTED FOR 45% OF NEW EXPENSES DETECTED").

    Respond STRICTLY in JSON format without markdown code block wrappers:
    {
      "items": [
        {
          "title": "Grocery Shopping",
          "amount": 85.50,
          "category": "Food",
          "date": "2026-07-28"
        }
      ],
      "tip": "ANALYTICAL TIP HERE"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || '';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      const parsedItems = (parsed.items || []).map((item: any, idx: number) => ({
        id: `parsed-ai-${Date.now()}-${idx}`,
        title: item.title || 'Expense',
        amount: typeof item.amount === 'number' ? item.amount : 0,
        category: ['Food', 'Bills', 'Travel', 'Shopping/Other'].includes(item.category)
          ? item.category
          : 'Shopping/Other',
        date: item.date || new Date().toISOString().split('T')[0],
      }));

      return res.json({
        items: parsedItems,
        tip: parsed.tip || 'EXPENSES SUCCESSFULLY PARSED AND CATEGORIZED',
      });
    } catch (parseError) {
      console.error('Failed to parse Gemini expense output:', text);
      return res.json({
        items: [],
        tip: 'UNABLE TO EXTRACT STRUCTURED EXPENSES',
      });
    }
  } catch (err: any) {
    console.error('Error in /api/expenses/parse:', err);
    return res.status(500).json({ error: 'Failed to process expenses with AI' });
  }
});

// 5. Notice Simplifier Parser
app.post('/api/notices/parse', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        id: `notice-${Date.now()}`,
        title: 'Official Notice Summary',
        date: new Date().toISOString().split('T')[0],
        source: 'Official Authority',
        summaryParagraph: 'KEY SUMMARY: The document contains regulatory policy updates requiring user compliance.',
        actionPoints: [
          { id: `ap-1`, text: 'Review notice details and verify reference numbers', completed: false },
          { id: `ap-2`, text: 'Submit required response before specified deadline', completed: false },
        ],
        rawText,
      });
    }

    const prompt = `You are an AI Notice Simplifier. Translate complex legal, municipal, housing, or official administrative notices into plain English.

    Notice Content:
    """
    ${rawText}
    """

    Respond STRICTLY in JSON format without markdown code blocks:
    {
      "title": "Clear 4-8 word title describing the notice",
      "source": "Issuing organization or authority name",
      "summaryParagraph": "KEY SUMMARY: A 2-3 sentence plain English summary highlighting main impact and urgency.",
      "actionPoints": [
        "Actionable task item 1",
        "Actionable task item 2",
        "Actionable task item 3"
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || '';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      const today = new Date().toISOString().split('T')[0];
      const actionPoints = (parsed.actionPoints || []).map((apStr: string, idx: number) => ({
        id: `ap-${Date.now()}-${idx}`,
        text: apStr,
        completed: false,
      }));

      return res.json({
        id: `notice-${Date.now()}`,
        title: parsed.title || 'Official Notice Summary',
        date: today,
        source: parsed.source || 'Official Authority',
        summaryParagraph: parsed.summaryParagraph || 'KEY SUMMARY: Official regulatory notice requires attention.',
        actionPoints,
        rawText,
      });
    } catch (parseError) {
      console.error('Failed to parse Gemini notice output:', text);
      return res.status(500).json({ error: 'Failed to simplify notice' });
    }
  } catch (err: any) {
    console.error('Error in /api/notices/parse:', err);
    return res.status(500).json({ error: 'Failed to process notice with AI' });
  }
});

// 6. Differentiator: Due Date Clustering Alert Endpoint
app.post('/api/reminders/alerts', (req, res) => {
  const { reminders } = req.body;
  if (!Array.isArray(reminders)) {
    return res.json({ hasAlert: false, alertMessage: null });
  }

  const today = new Date();
  const nextSevenDays = new Date();
  nextSevenDays.setDate(today.getDate() + 7);

  const upcomingReminders = reminders.filter((r) => {
    if (r.status === 'PAID') return false;
    if (!r.dueDate) return false;
    const due = new Date(r.dueDate);
    return due >= today && due <= nextSevenDays;
  });

  if (upcomingReminders.length >= 2) {
    const total = upcomingReminders.reduce((sum, r) => sum + (r.amount || 0), 0);
    return res.json({
      hasAlert: true,
      count: upcomingReminders.length,
      totalAmount: total,
      alertMessage: `CLUSTER ALERT: ${upcomingReminders.length} bills totaling $${total.toFixed(
        2
      )} are due within the next 7 days!`,
    });
  }

  return res.json({ hasAlert: false, alertMessage: null });
});

// 7. Assistant Route Classifier for Voice / Automated Layer
app.post('/api/assistant/route', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      // Heuristic fallback
      const lower = text.toLowerCase();
      let module = 'reminder';
      if (lower.includes('spent') || lower.includes('paid') || lower.includes('grocery') || lower.includes('expense')) {
        module = 'expense';
      } else if (lower.includes('draft') || lower.includes('letter') || lower.includes('email') || lower.includes('complain')) {
        module = 'draft';
      } else if (lower.includes('notice') || lower.includes('circular') || lower.includes('summary') || lower.includes('policy')) {
        module = 'notice';
      }
      return res.json({ module, explanation: `Heuristically routed to ${module}` });
    }

    const prompt = `You are an AI Life-Admin Assistant Classifier. Determine which module best handles the following user request or voice command:
    User Input: "${text}"

    Modules available:
    - "reminder": For bills, payment due dates, rent notices, subscription renewals, tax deadlines.
    - "expense": For logged past spending, receipts, itemized purchases, meal/travel logs.
    - "notice": For official circulars, property notices, long policy updates, school/society advisories.
    - "draft": For drafting letters, formal emails, complaint notices, leave requests, landlord communication.

    Respond STRICTLY in JSON format without markdown code block wrappers:
    {
      "module": "reminder" | "expense" | "notice" | "draft",
      "explanation": "Short 1-sentence reason for this classification"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let raw = response.text || '';
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(raw);
      return res.json({
        module: ['reminder', 'expense', 'notice', 'draft'].includes(parsed.module) ? parsed.module : 'reminder',
        explanation: parsed.explanation || 'Routed based on request intent.',
      });
    } catch {
      return res.json({ module: 'reminder', explanation: 'Defaulted to reminder' });
    }
  } catch (err: any) {
    console.error('Error in /api/assistant/route:', err);
    return res.status(500).json({ error: 'Failed to route assistant prompt' });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
