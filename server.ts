import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const app = express();
const PORT = 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API ROUTES ---

// ФОРМЫ
app.get("/api/forms", async (req, res) => {
  const { data, error } = await supabase.from('forms').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/api/forms", async (req, res) => {
  const newForm = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isActive: true };
  const { error } = await supabase.from('forms').insert([newForm]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(newForm);
});

// ЛИДЫ
app.get("/api/leads", async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/api/lead", async (req, res) => {
  try {
    const leadData = { id: Math.random().toString(36).substr(2, 9), ...req.body, timestamp: new Date().toISOString(), status: 'new' };
    
    // Bitrix24 Integration
    const { data: settings } = await supabase.from('settings').select('*').single();
    if (settings?.bitrixWebhook?.includes("/rest/")) {
      try {
        await axios.post(`${settings.bitrixWebhook}/crm.lead.add.json`, {
          fields: { TITLE: "LeadFlow", NAME: leadData.name || 'Без имени', PHONE: [{ VALUE: leadData.phone, VALUE_TYPE: "WORK" }] }
        });
      } catch (e) { console.error("Bitrix error", e); }
    }

    await supabase.from('leads').insert([leadData]);
    res.json({ success: true, lead_id: leadData.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// НАСТРОЙКИ
app.get("/api/settings", async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*').single();
  res.json(data || {});
});

app.post("/api/settings", async (req, res) => {
  const { error } = await supabase.from('settings').upsert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json(req.body);
});

// --- СТАТИЧЕСКИЕ ФАЙЛЫ И VITE ---
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist/index.html")));
}

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
