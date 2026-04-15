import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
path.dirname(__filename);

import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data.json");

let data = {
  forms: [
    {
      id: "default-form",
      name: "Основная форма",
      title: "Оставить заявку",
      subtitle: "Мы свяжемся с вами в течение 15 минут",
      fields: [
        { id: "name", label: "Имя", type: "text", required: true, placeholder: "Ваше имя" },
        { id: "phone", label: "Телефон", type: "tel", required: true, placeholder: "+7 (___) ___-__-__" },
      ],
      backgroundColor: "#ffffff",
      textColor: "#111111",
      buttonColor: "#000000",
      buttonTextColor: "#ffffff",
      inputBackgroundColor: "#f3f4f6",
      inputBorderColor: "transparent",
      inputBorderWidth: 0,
      layout: "standard",
      formWidth: "default",
      borderRadius: 16,
      padding: 32,
      maxWidth: 450,
      showShadow: true,
      animationType: "zoom",
      cssSelector: ".btn-call, .btn-order, .btn-consult",
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  ],
  leads: [],
  deals: [],
  dealers: {} as Record<string, Array<{ name: string, enabled: boolean }>>,
  settings: {
    bitrixWebhook: "",
    yandexMetricaId: "",
    yandexMetricaToken: "",
    yandexMetricaEnabled: false,
  },
  models: {} as Record<string, Array<{ name: string, enabled: boolean }>>,
  events: [] as Array<{
    id: string;
    payload: any;
    status: 'new' | 'processed' | 'error';
    created_at: string;
    error_message?: string;
    retry_count?: number;
  }>,
  costs: [] as Array<{
    id: string;
    date: string;
    source_normalized: string;
    campaign_normalized: string;
    cost: number;
  }>
};

// Migration for costs structure
async function migrateCosts() {
  if (!data.costs) {
    data.costs = [];
    await saveData();
  }
}

// Migration for events structure
async function migrateEvents() {
  if (!data.events) {
    data.events = [];
    await saveData();
  }
}

// Migration for models structure
async function migrateModels() {
  let changed = false;
  for (const category in data.models) {
    if (Array.isArray(data.models[category])) {
      data.models[category] = data.models[category].map((item: any) => {
        if (typeof item === 'string') {
          changed = true;
          return { name: item, enabled: true };
        }
        return item;
      });
    }
  }
  if (changed) await saveData();
}

// Migration for dealers structure
async function migrateDealers() {
  if (Array.isArray(data.dealers)) {
    const grouped: Record<string, Array<{ name: string, enabled: boolean }>> = {};
    data.dealers.forEach((d: any) => {
      const city = d.city || "Другие";
      if (!grouped[city]) grouped[city] = [];
      grouped[city].push({ name: d.name, enabled: true });
    });
    data.dealers = grouped;
    await saveData();
  }
}

// Load initial data
async function loadInitialData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
      if (fileContent.trim()) {
        const parsed = JSON.parse(fileContent);
        data = { ...data, ...parsed };
        // Ensure arrays are initialized
        if (!data.events) data.events = [];
        if (!data.costs) data.costs = [];
        if (!data.forms) data.forms = [];
        if (!data.leads) data.leads = [];
        if (!data.deals) data.deals = [];
        
        await migrateModels();
        await migrateDealers();
        await migrateEvents();
        await migrateCosts();
      }
    } catch (err) {
      console.error("Error reading data.json:", err);
    }
  } else {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    } catch (err) {
      console.error("Error creating initial data.json:", err);
    }
  }
}

async function saveData() {
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving data.json:", err);
  }
}

function normalizeSource(source_raw: string): string {
  if (!source_raw) return "Other";
  const s = source_raw.toLowerCase();
  if (s.includes("yandex")) return "Yandex";
  if (s.includes("google")) return "Google";
  if (s.includes("instagram") || s === "ig") return "Instagram";
  if (s.includes("vk")) return "VK";
  if (s.includes("facebook")) return "Facebook";
  return "Other";
}

function normalizeCampaign(campaign_raw: string): string {
  if (!campaign_raw) return "Other";
  const c = campaign_raw.toLowerCase();
  if (c.includes("brand")) return "Brand";
  if (c.includes("retarget")) return "Retargeting";
  if (c.includes("promo") || c.includes("sale")) return "Promo";
  return "Other";
}

async function syncBitrixDeals() {
  if (!data.settings.bitrixWebhook || !data.settings.bitrixWebhook.includes("/rest/")) {
    return;
  }

  try {
    const response = await axios.get(`${data.settings.bitrixWebhook}/crm.deal.list.json`);
    const bitrixDeals = response.data.result;

    if (!Array.isArray(bitrixDeals)) {
      return;
    }

    let changed = false;
    for (const bDeal of bitrixDeals) {
      // Find local deal by Bitrix ID
      const dealIndex = data.deals.findIndex((d: any) => d.bitrix_deal_id == bDeal.ID);
      
      if (dealIndex !== -1) {
        const localDeal = data.deals[dealIndex];
        const newAmount = parseFloat(bDeal.OPPORTUNITY) || 0;
        let newStatus: 'new' | 'in_progress' | 'won' | 'lost' = localDeal.status;

        // Map Bitrix STAGE_ID to LeadFlow status
        if (bDeal.STAGE_ID === 'WON') {
          newStatus = 'won';
        } else if (bDeal.STAGE_ID === 'LOSE') {
          newStatus = 'lost';
        } else {
          // If it's not WON/LOSE, it's in progress
          newStatus = 'in_progress';
        }

        // Only update if something changed
        if (localDeal.amount !== newAmount || localDeal.status !== newStatus) {
          data.deals[dealIndex] = {
            ...localDeal,
            amount: newAmount,
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          
          // Handle closed_at timestamp
          if (newStatus === 'won' || newStatus === 'lost') {
            if (!data.deals[dealIndex].closed_at) {
              data.deals[dealIndex].closed_at = new Date().toISOString();
            }
          } else {
            data.deals[dealIndex].closed_at = null;
          }
          
          changed = true;
        }
      }
    }

    if (changed) {
      await saveData();
      console.log(`[Bitrix Sync] ${new Date().toISOString()} - Updated deals from Bitrix24`);
    }
  } catch (error: any) {
    console.error("Bitrix24 sync error:", error.message);
  }
}

async function syncBitrixLeads() {
  if (!data.settings.bitrixWebhook || !data.settings.bitrixWebhook.includes("/rest/")) {
    return;
  }

  try {
    const response = await axios.get(`${data.settings.bitrixWebhook}/crm.lead.list.json`);
    const bitrixLeads = response.data.result;

    if (!Array.isArray(bitrixLeads)) {
      return;
    }

    let changed = false;
    for (const bLead of bitrixLeads) {
      const bitrixId = bLead.ID;
      const leadIndex = data.leads.findIndex((l: any) => l.bitrix_lead_id == bitrixId);
      
      const comments = bLead.COMMENTS || '';
      const utms: any = {};
      const sourceMatch = comments.match(/Источник:\s*([^\n]+)/);
      const mediumMatch = comments.match(/Medium:\s*([^\n]+)/);
      const campaignMatch = comments.match(/Campaign:\s*([^\n]+)/);
      
      if (sourceMatch) utms.utm_source = sourceMatch[1].trim();
      if (mediumMatch) utms.utm_medium = mediumMatch[1].trim();
      if (campaignMatch) utms.utm_campaign = campaignMatch[1].trim();

      const phone = Array.isArray(bLead.PHONE) && bLead.PHONE[0] ? bLead.PHONE[0].VALUE : '';
      
      const leadData = {
        bitrix_lead_id: bitrixId,
        name: bLead.NAME || 'Без имени',
        phone: phone,
        timestamp: bLead.DATE_CREATE || new Date().toISOString(),
        status: bLead.STATUS_ID === 'CONVERTED' ? 'closed' : 'new',
        notes: comments,
        ...utms,
        source_raw: utms.utm_source || 'Direct',
        source_normalized: normalizeSource(utms.utm_source || 'Direct')
      };

      let currentLeadId = '';

      if (leadIndex !== -1) {
        // Update existing lead
        const existingLead = data.leads[leadIndex];
        currentLeadId = existingLead.id;
        
        // Only update if something meaningful changed (simplified check)
        if (existingLead.status !== leadData.status || existingLead.name !== leadData.name) {
          data.leads[leadIndex] = {
            ...existingLead,
            ...leadData
          };
          changed = true;
        }
      } else {
        // Create new lead
        const newLead = {
          id: Math.random().toString(36).substr(2, 9),
          ...leadData,
          type: 'form'
        };
        data.leads.push(newLead);
        currentLeadId = newLead.id;
        changed = true;
      }

      // Link deals with this bitrix_lead_id to this lead
      if (currentLeadId) {
        data.deals.forEach((deal: any, idx: number) => {
          if (deal.bitrix_lead_id == bitrixId && deal.lead_id !== currentLeadId) {
            data.deals[idx].lead_id = currentLeadId;
            changed = true;
          }
        });
      }
    }

    if (changed) {
      await saveData();
      console.log(`[Bitrix Sync] ${new Date().toISOString()} - Updated leads from Bitrix24`);
    }
  } catch (error: any) {
    console.error("Bitrix24 leads sync error:", error.message);
  }
}

let isProcessingEvents = false;

async function processEventQueue() {
  if (isProcessingEvents) return;
  isProcessingEvents = true;

  try {
    const eventsToProcess = data.events.filter(e => e.status === 'new' || e.status === 'error');
    if (eventsToProcess.length === 0) {
      isProcessingEvents = false;
      return;
    }

    console.log(`Processing ${eventsToProcess.length} events from queue...`);

    for (const event of eventsToProcess) {
      try {
        const { 
          type, name, phone, email, 
          utm_source, utm_campaign, utm_medium, 
          source, comment 
        } = event.payload;

        const leadData = {
          id: Math.random().toString(36).substr(2, 9),
          name: name || 'Без имени',
          phone: phone,
          email: email || '',
          timestamp: new Date().toISOString(),
          status: 'new',
          type: type === 'call' ? 'call' : 'form',
          notes: comment || '',
          utm_source: utm_source || source || 'Direct',
          utm_medium: utm_medium || '',
          utm_campaign: utm_campaign || '',
          source: source || utm_source || 'Direct',
          source_raw: utm_source || source || 'Direct',
          source_normalized: normalizeSource(utm_source || source || 'Direct'),
          campaign_raw: utm_campaign || '',
          campaign_normalized: normalizeCampaign(utm_campaign || '')
        };

        // Bitrix24 Integration
        if (isBitrixWebhookValid(data.settings.bitrixWebhook)) {
          const bitrixData = {
            fields: {
              TITLE: "LeadFlow (Event Queue)",
              NAME: leadData.name,
              PHONE: [{ VALUE: leadData.phone, VALUE_TYPE: "WORK" }],
              EMAIL: leadData.email ? [{ VALUE: leadData.email, VALUE_TYPE: "WORK" }] : [],
              UTM_SOURCE: leadData.utm_source,
              UTM_MEDIUM: leadData.utm_medium,
              UTM_CAMPAIGN: leadData.utm_campaign,
              COMMENTS: `Тип: ${leadData.type === 'call' ? 'Звонок' : 'Заявка'}\nИсточник: ${leadData.source || 'Direct'}\nКомментарий: ${leadData.notes}\nMedium: ${leadData.utm_medium || '-'}\nCampaign: ${leadData.utm_campaign || '-'}`
            }
          };
          const response = await axios.post(`${data.settings.bitrixWebhook}/crm.lead.add.json`, bitrixData);
          if (response.data && response.data.result) {
            leadData.bitrix_lead_id = response.data.result;
          }
        }

        data.leads.push(leadData);
        event.status = 'processed';
        delete event.error_message;
      } catch (error: any) {
        console.error(`Error processing event ${event.id}:`, error.message);
        event.status = 'error';
        event.error_message = error.message;
        event.retry_count = (event.retry_count || 0) + 1;
      }
    }

    await saveData();
  } catch (error: any) {
    console.error("Event queue processing error:", error.message);
  } finally {
    isProcessingEvents = false;
  }
}

async function startServer() {
  await loadInitialData();
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Logger middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/forms", (req, res) => {
    res.json(data.forms);
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const newForm = {
        id: Math.random().toString(36).substr(2, 9),
        ...req.body,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      data.forms.push(newForm);
      await saveData();
      res.json(newForm);
    } catch {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const index = data.forms.findIndex((f: any) => f.id === req.params.id);
      if (index !== -1) {
        data.forms[index] = { ...data.forms[index], ...req.body };
        await saveData();
        res.json(data.forms[index]);
      } else {
        res.status(404).json({ error: "Form not found" });
      }
    } catch {
      res.status(500).json({ error: "Failed to update data" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      data.forms = data.forms.filter((f: any) => f.id !== req.params.id);
      await saveData();
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete data" });
    }
  });

  app.post("/api/leads/import", async (req, res) => {
    try {
      const { leads: newLeads, type } = req.body;
      
      if (!Array.isArray(newLeads)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      const importedLeads = newLeads.map((lead: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        ...lead,
        timestamp: lead.timestamp || new Date().toISOString(),
        status: lead.status || 'new',
        type: type || lead.type || 'form',
        source_raw: lead.utm_source || 'Direct',
        source_normalized: normalizeSource(lead.utm_source || 'Direct')
      }));

      data.leads.push(...importedLeads);
      await saveData();
      res.json({ success: true, count: importedLeads.length });
    } catch {
      res.status(500).json({ error: "Failed to import leads" });
    }
  });

  const isBitrixWebhookValid = (url: string) => {
    return url && url.includes("/rest/");
  };

  app.get("/api/leads", (req, res) => {
    res.json(data.leads);
  });

  app.get("/api/analytics/metrica", async (req, res) => {
    if (!data.settings.yandexMetricaEnabled || !data.settings.yandexMetricaId || !data.settings.yandexMetricaToken) {
      return res.status(400).json({ error: "Yandex Metrica is not configured or enabled" });
    }

    const { date1, date2 } = req.query;
    const startDate = (date1 as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = (date2 as string) || new Date().toISOString().split('T')[0];

    const rawToken = data.settings.yandexMetricaToken || "";
    const token = rawToken.trim().replace(/^"|"$/g, '');

    try {
      console.log(`[Metrica] Fetching data for ID: ${data.settings.yandexMetricaId}, range: ${startDate} to ${endDate}`);
      
      // Fetch traffic by source
      const response = await axios.get(
        `https://api-metrika.yandex.net/stat/v1/data?ids=${data.settings.yandexMetricaId}&metrics=ym:s:visits,ym:s:users,ym:s:bounceRate,ym:s:pageDepth,ym:s:avgVisitDurationSeconds,ym:s:anyGoalReaches,ym:s:ecommerceRevenue,ym:s:anyGoalConversionRate&dimensions=ym:s:trafficSource,ym:s:sourceEngine&date1=${startDate}&date2=${endDate}&attribution=lastsign&lang=ru&limit=1000&accuracy=full`,
        {
          headers: {
            'Authorization': `OAuth ${token}`
          }
        }
      );

      const responseData = response.data;

      // Fetch daily traffic by source and engine
      const dailyResponse = await axios.get(
        `https://api-metrika.yandex.net/stat/v1/data/bytime?ids=${data.settings.yandexMetricaId}&metrics=ym:s:visits&dimensions=ym:s:trafficSource,ym:s:sourceEngine&group=day&date1=${startDate}&date2=${endDate}&attribution=lastsign&lang=ru&limit=1000&accuracy=full`,
        {
          headers: {
            'Authorization': `OAuth ${token}`
          }
        }
      );

      const dailyData = dailyResponse.data;
      
      console.log(`[Metrica] Daily data fetched. Rows: ${dailyData.data?.length || 0}`);
      if (dailyData.data && dailyData.data.length > 0) {
        console.log(`[Metrica] Sample daily row:`, JSON.stringify(dailyData.data[0].dimensions));
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.json({
        data: responseData,
        daily: dailyData
      });
    } catch (error: any) {
      const errorResponse = error.response?.data;
      console.error("Yandex Metrica API error detail:", JSON.stringify(errorResponse || error.message));
      
      let errorMessage = "Failed to fetch data from Yandex Metrica";
      if (errorResponse) {
        if (typeof errorResponse === 'object') {
          if (errorResponse.errors?.[0]?.message) {
            errorMessage = `Yandex Metrica Error: ${errorResponse.errors[0].message}`;
          } else if (errorResponse.message) {
            errorMessage = `Yandex Metrica Error: ${errorResponse.message}`;
          }
        } else {
          errorMessage = `Yandex Metrica Error: ${String(errorResponse).substring(0, 100)}`;
        }
        
        if (error.response?.status === 403 || error.response?.status === 401) {
          errorMessage = "Yandex Metrica Error: Invalid or expired OAuth token. Please re-authorize in Settings.";
        }
      } else {
        errorMessage = `Yandex Metrica Error: ${error.message}`;
      }
      
      console.log(`[Metrica] Sending error response: ${error.response?.status || 400} - ${errorMessage}`);
      res.setHeader('Content-Type', 'application/json');
      res.status(error.response?.status || 400).json({ error: errorMessage });
    }
  });

  app.get("/api/analytics/metrica/check", async (req, res) => {
    const rawToken = (req.query.token as string) || data.settings.yandexMetricaToken || "";
    
    if (!rawToken) {
      return res.status(400).json({ error: "Token is required" });
    }

    const token = rawToken.trim().replace(/^"|"$/g, '');

    try {
      // GET https://api-metrika.yandex.net/management/v1/counters
      const response = await axios.get(
        "https://api-metrika.yandex.net/management/v1/counters",
        {
          headers: {
            'Authorization': `OAuth ${token}`
          }
        }
      );

      const responseData = response.data;

      console.log(`[Metrica Check] Connection successful for token: ${token.substring(0, 5)}...`);
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        status: "ok", 
        message: "Connection successful", 
        counters: responseData.counters.map((c: any) => ({ id: c.id, name: c.name }))
      });
    } catch (error: any) {
      const errorResponse = error.response?.data;
      console.error("Yandex Metrica Check error detail:", JSON.stringify(errorResponse || error.message));
      
      let errorMessage = "Connection failed";
      if (errorResponse) {
        if (typeof errorResponse === 'object') {
          if (errorResponse.errors?.[0]?.message) {
            errorMessage = `Yandex Metrica Error: ${errorResponse.errors[0].message}`;
          } else if (errorResponse.message) {
            errorMessage = `Yandex Metrica Error: ${errorResponse.message}`;
          }
        } else {
          errorMessage = `Yandex Metrica Error: ${String(errorResponse).substring(0, 100)}`;
        }

        if (error.response?.status === 403 || error.response?.status === 401) {
          errorMessage = "Yandex Metrica Error: Invalid or expired OAuth token. Please re-authorize.";
        }
      } else {
        errorMessage = `Yandex Metrica Error: ${error.message}`;
      }
      
      console.log(`[Metrica Check] Sending error response: ${error.response?.status || 400} - ${errorMessage}`);
      res.setHeader('Content-Type', 'application/json');
      res.status(error.response?.status || 400).json({ error: errorMessage });
    }
  });

  app.get("/api/models", async (req, res) => {
    if (Array.isArray(data.models)) {
      data.models = { "Мотоциклы": data.models, "Квадроциклы": [] };
      await saveData();
    } else if (!data.models) {
      data.models = { "Мотоциклы": [], "Квадроциклы": [] };
    }
    res.json(data.models);
  });

  app.post("/api/models", async (req, res) => {
    if (typeof req.body === 'object' && !Array.isArray(req.body)) {
      data.models = req.body;
      await saveData();
      res.json({ success: true, models: data.models });
    } else {
      res.status(400).json({ error: "Invalid models format" });
    }
  });

  app.get("/api/dealers", (req, res) => {
    if (!data.dealers) {
      data.dealers = { "Москва": [], "Санкт-Петербург": [] };
    }
    res.json(data.dealers);
  });

  app.post("/api/dealers", async (req, res) => {
    if (typeof req.body === 'object' && !Array.isArray(req.body)) {
      data.dealers = req.body;
      await saveData();
      res.json({ success: true, dealers: data.dealers });
    } else {
      res.status(400).json({ error: "Invalid dealers format" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const index = data.leads.findIndex((l: any) => l.id === req.params.id);
      if (index !== -1) {
        const updatedLead = { ...data.leads[index], ...req.body };
        if (req.body.utm_source) {
          updatedLead.source_raw = req.body.utm_source;
          updatedLead.source_normalized = normalizeSource(req.body.utm_source);
        }
        if (req.body.utm_campaign) {
          updatedLead.campaign_raw = req.body.utm_campaign;
          updatedLead.campaign_normalized = normalizeCampaign(req.body.utm_campaign);
        }
        data.leads[index] = updatedLead;
        await saveData();
        res.json(data.leads[index]);
      } else {
        res.status(404).json({ error: "Lead not found" });
      }
    } catch {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.post("/api/cost", async (req, res) => {
    try {
      const { date, source_normalized, campaign_normalized, cost } = req.body;
      if (!date || !source_normalized || cost === undefined) {
        return res.status(400).json({ error: "Date, source_normalized and cost are required" });
      }

      const newCost = {
        id: Math.random().toString(36).substr(2, 9),
        date,
        source_normalized,
        campaign_normalized: campaign_normalized || "Other",
        cost: Number(cost)
      };

      data.costs.push(newCost);
      await saveData();
      res.json(newCost);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save cost" });
    }
  });

  app.get("/api/costs", (req, res) => {
    res.json(data.costs || []);
  });

  app.get("/api/events/stats", (req, res) => {
    const stats = {
      new: data.events.filter(e => e.status === 'new').length,
      processed: data.events.filter(e => e.status === 'processed').length,
      error: data.events.filter(e => e.status === 'error').length
    };
    res.json(stats);
  });

  app.post("/api/event", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone is required" });
      }

      const event = {
        id: Math.random().toString(36).substr(2, 9),
        payload: req.body,
        status: 'new' as const,
        created_at: new Date().toISOString()
      };

      data.events.push(event);
      await saveData();

      res.json({ success: true, event_id: event.id, status: 'queued' });
    } catch (error: any) {
      console.error("Event endpoint error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/lead", async (req, res) => {
    try {
      const leadData = {
        id: Math.random().toString(36).substr(2, 9),
        ...req.body,
        timestamp: new Date().toISOString(),
        status: 'new',
        type: req.body.type || 'form',
        notes: '',
        source_raw: req.body.utm_source || 'Direct',
        source_normalized: normalizeSource(req.body.utm_source || 'Direct'),
        campaign_raw: req.body.utm_campaign || '',
        campaign_normalized: normalizeCampaign(req.body.utm_campaign || '')
      };

      // Bitrix24 Integration
      if (isBitrixWebhookValid(data.settings.bitrixWebhook)) {
        try {
          const bitrixData = {
            fields: {
              TITLE: "LeadFlow",
              NAME: leadData.name || 'Без имени',
              PHONE: [{ VALUE: leadData.phone, VALUE_TYPE: "WORK" }],
              EMAIL: leadData.email ? [{ VALUE: leadData.email, VALUE_TYPE: "WORK" }] : [],
              UTM_SOURCE: leadData.utm_source,
              UTM_MEDIUM: leadData.utm_medium,
              UTM_CAMPAIGN: leadData.utm_campaign,
              COMMENTS: `Источник: ${leadData.utm_source || 'Direct'}\nMedium: ${leadData.utm_medium || '-'}\nCampaign: ${leadData.utm_campaign || '-'}\nReferrer: ${leadData.referrer || '-'}\nPage: ${leadData.page_url || '-'}\nМодель: ${leadData.model || leadData.product || '-'}`
            }
          };
          const response = await axios.post(`${data.settings.bitrixWebhook}/crm.lead.add.json`, bitrixData);
          if (response.data && response.data.result) {
            leadData.bitrix_lead_id = response.data.result;
          }
        } catch (error: any) {
          console.error("Bitrix24 integration error:", error.message);
        }
      }

      data.leads.push(leadData);
      await saveData();

      // Yandex Metrica Integration (Offline Conversions)
      if (data.settings.yandexMetricaEnabled && data.settings.yandexMetricaId && data.settings.yandexMetricaToken && leadData.ym_uid) {
        try {
          const timestamp = Math.floor(Date.now() / 1000);
          const metricaData = {
            conversions: [
              {
                client_id: leadData.ym_uid,
                target: leadData.type === 'call' ? 'CALL' : 'FORM_GOAL',
                date_time: timestamp,
                price: 0,
                currency: 'RUB'
              }
            ]
          };
          
          const token = (data.settings.yandexMetricaToken || "").trim().replace(/^"|"$/g, '');
          
          await axios.post(
            `https://api-metrika.yandex.net/management/v1/counter/${data.settings.yandexMetricaId}/offline_conversions/upload`,
            metricaData,
            {
              headers: {
                'Authorization': `OAuth ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (error: any) {
          console.error("Yandex Metrica integration error:", error.response?.data || error.message);
        }
      }

      res.json({ success: true, lead_id: leadData.id });
    } catch {
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/settings", (req, res) => {
    res.json(data.settings);
  });

  app.get("/api/deals", (req, res) => {
    res.json(data.deals || []);
  });

  app.post("/api/deals", async (req, res) => {
    try {
      if (!data.deals) data.deals = [];
      const newDeal = {
        id: Math.random().toString(36).substr(2, 9),
        ...req.body,
        status: req.body.status || 'new',
        amount: req.body.amount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.deals.push(newDeal);
      
      // Bitrix24 Deal Integration
      if (isBitrixWebhookValid(data.settings.bitrixWebhook) && newDeal.lead_id) {
        const lead = data.leads.find((l: any) => l.id === newDeal.lead_id);
        if (lead && lead.bitrix_lead_id) {
          try {
            const bitrixDealData = {
              fields: {
                TITLE: "Сделка LeadFlow",
                OPPORTUNITY: newDeal.amount,
                LEAD_ID: lead.bitrix_lead_id
              }
            };
            const response = await axios.post(`${data.settings.bitrixWebhook}/crm.deal.add.json`, bitrixDealData);
            if (response.data && response.data.result) {
              newDeal.bitrix_deal_id = response.data.result;
            }
          } catch (error: any) {
            console.error("Bitrix24 Deal integration error:", error.message);
          }
        }
      }

      await saveData();
      res.json(newDeal);
    } catch {
      res.status(500).json({ error: "Failed to save deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      if (!data.deals) data.deals = [];
      const index = data.deals.findIndex((d: any) => d.id === req.params.id);
      if (index !== -1) {
        data.deals[index] = { 
          ...data.deals[index], 
          ...req.body,
          updated_at: new Date().toISOString()
        };
        if (req.body.status === 'won' || req.body.status === 'lost') {
            if (!data.deals[index].closed_at) {
                data.deals[index].closed_at = new Date().toISOString();
            }
        } else {
            data.deals[index].closed_at = null;
        }

        // Bitrix24 Deal Update
        if (isBitrixWebhookValid(data.settings.bitrixWebhook) && req.body.amount !== undefined && data.deals[index].bitrix_deal_id) {
          try {
            const bitrixUpdateData = {
              id: data.deals[index].bitrix_deal_id,
              fields: {
                OPPORTUNITY: req.body.amount
              }
            };
            await axios.post(`${data.settings.bitrixWebhook}/crm.deal.update.json`, bitrixUpdateData);
          } catch (error: any) {
            console.error("Bitrix24 Deal update error:", error.message);
          }
        }

        await saveData();
        res.json(data.deals[index]);
      } else {
        res.status(404).json({ error: "Deal not found" });
      }
    } catch {
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      data.settings = { ...data.settings, ...req.body };
      await saveData();
      res.json(data.settings);
    } catch {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Test Page for LeadFlow
  app.get("/test-leadflow", (req, res) => {
    const host = process.env.APP_URL || `http://localhost:3000`;
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тестовая страница LeadFlow</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .hero-gradient { background: radial-gradient(circle at 50% 50%, #f8fafc 0%, #f1f5f9 100%); }
    </style>
    <!-- LeadFlow Widget -->
    <script src="${host}/widget.js?v=${Date.now()}" async></script>
</head>
<body class="bg-slate-50 text-slate-900">
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <div class="w-5 h-5 bg-white rounded-full"></div>
                </div>
                <span class="text-xl font-extrabold tracking-tight">MySite</span>
            </div>
            <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <a href="#" class="hover:text-black transition-colors">Продукты</a>
                <a href="#" class="hover:text-black transition-colors">Цены</a>
                <a href="#" class="hover:text-black transition-colors">О нас</a>
                <button class="bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-black/10 btn-call">
                    Заказать звонок
                </button>
            </div>
        </div>
    </nav>

    <main>
        <section class="hero-gradient py-24 px-6 overflow-hidden">
            <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div class="space-y-8">
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Тестовая страница
                    </div>
                    <h1 class="text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.9]">
                        Проверьте работу <span class="text-blue-600">LeadFlow</span> прямо здесь.
                    </h1>
                    <p class="text-xl text-slate-500 leading-relaxed max-w-lg">
                        Эта страница имитирует ваш реальный сайт. Нажмите на кнопки ниже, чтобы увидеть, как открываются ваши формы.
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <button class="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-black/20 btn-order">
                            Оставить заявку
                        </button>
                        <button class="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors btn-consult">
                            Консультация
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <div class="w-full aspect-square bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 flex flex-col justify-center items-center text-center gap-6">
                        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl">🚀</div>
                        <h3 class="text-2xl font-bold">Готовы к тесту?</h3>
                        <p class="text-slate-400">Попробуйте кликнуть на любую кнопку на этой странице. Если вы настроили CSS селекторы в админке, формы откроются автоматически.</p>
                    </div>
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>
            </div>
        </section>

        <section class="py-24 px-6 bg-white">
            <div class="max-w-7xl mx-auto text-center space-y-16">
                <div class="max-w-2xl mx-auto space-y-4">
                    <h2 class="text-4xl font-bold tracking-tight">Как это работает?</h2>
                    <p class="text-slate-500">Мы добавили на эту страницу несколько кнопок с разными классами. Вы можете использовать их для настройки селекторов.</p>
                </div>
                
                <div class="grid md:grid-cols-4 gap-8">
                    <div class="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-4">
                        <code class="text-blue-600 font-bold">.btn-call</code>
                        <h4 class="text-xl font-bold">Кнопка в шапке</h4>
                        <p class="text-sm text-slate-500">Идеально подходит для форм обратного звонка.</p>
                        <button class="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors btn-call">Тест .btn-call</button>
                    </div>
                    <div class="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-4">
                        <code class="text-blue-600 font-bold">.btn-order</code>
                        <h4 class="text-xl font-bold">Главная кнопка</h4>
                        <p class="text-sm text-slate-500">Для сбора основных заявок на продукт.</p>
                        <button class="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors btn-order">Тест .btn-order</button>
                    </div>
                    <div class="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-4">
                        <code class="text-blue-600 font-bold">.btn-consult</code>
                        <h4 class="text-xl font-bold">Кнопка консультации</h4>
                        <p class="text-sm text-slate-500">Для уточняющих вопросов.</p>
                        <button class="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors btn-consult">Тест .btn-consult</button>
                    </div>
                    <div class="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-4">
                        <code class="text-blue-600 font-bold">JS API</code>
                        <h4 class="text-xl font-bold">Карточка дилера</h4>
                        <p class="text-sm text-slate-500">Вызов формы через JS с передачей дилера.</p>
                        <button onclick="window.openLeadForm('dealer-form', { dealer: 'VOGE LONCIN MEGAMOTO', dealer_id: 'megamoto_msk' })" class="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">Тест JS API</button>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        &copy; 2026 MySite. Все права защищены. Тестовая страница LeadFlow.
    </footer>
</body>
</html>
    `;
    res.send(html);
  });

  app.get("/dealers.json", (req, res) => {
    res.json(data.dealers || {});
  });

  app.get("/widget.js", (req, res) => {
    const host = process.env.APP_URL || `http://localhost:${PORT}`;
    const script = `
(function() {
    const API_URL = "${host}";
    let formsConfig = [];
    
    function getUTMs() {
        const params = new URLSearchParams(window.location.search);
        const utms = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
            const val = params.get(key);
            if (val) {
                utms[key] = val;
                localStorage.setItem('lf_' + key, val);
            } else {
                const stored = localStorage.getItem('lf_' + key);
                if (stored) utms[key] = stored;
            }
        });
        return utms;
    }

    function getYmUid() {
        try {
            const match = document.cookie.match(/_ym_uid=([^;]+)/);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    }

    let sessionId = localStorage.getItem('lf_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substr(2, 9);
        localStorage.setItem('lf_session_id', sessionId);
    }

    window.openLeadForm = async function(formId, extraData = {}) {
        try {
            if (document.getElementById('lf-modal')) return;
            
            const utms = getUTMs();
            const ymUid = getYmUid();
            
            // Track visit event
            fetch(API_URL + "/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: ymUid || "anon",
                    source: utms.utm_source || "direct",
                    event: "visit",
                }),
            }).catch(() => {});

            let dealers = [];
            let cities = [];
            let modelsData = {};
            
            try {
                const [dealersRes, modelsRes, formsRes] = await Promise.all([
                    fetch(API_URL + '/dealers.json'),
                    fetch(API_URL + '/api/models'),
                    fetch(API_URL + '/api/forms')
                ]);
                
                if (dealersRes.ok) {
                    dealers = await dealersRes.json();
                    // dealers is now an object { City: [{name: '...', enabled: true}, ...] }
                    cities = Object.keys(dealers).sort();
                }
                
                if (modelsRes.ok) {
                    modelsData = await modelsRes.json();
                }

                if (formsRes.ok) {
                    formsConfig = await formsRes.json();
                }
            } catch (e) {
                console.error('LeadFlow: Failed to fetch data', e);
            }
            
            const config = formsConfig.find(f => f.id === formId);
            if (!config || config.isActive === false) return;

            const modal = document.createElement('div');
            modal.id = 'lf-modal';
            modal.setAttribute('style', "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:sans-serif;backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s ease;");
            
            const shadow = config.showShadow ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none";
            
            const animations = {
                zoom: "transform:scale(0.9);",
                fade: "opacity:0;",
                slideUp: "transform:translateY(50px);",
                bounce: "transform:scale(0.5);"
            };
            
            const animStyle = animations[config.animationType] || animations.zoom;

            const isSplit = config.layout === 'split-left' || config.layout === 'split-right';
            const flexDirection = config.layout === 'split-left' ? 'row' : (config.layout === 'split-right' ? 'row-reverse' : 'column');
            const containerWidth = config.formWidth === 'custom' ? \`\${config.customWidth}px\` : (isSplit ? '800px' : \`\${config.maxWidth}px\`);
            const hasImage = config.layout !== 'standard' && config.imageUrl;

            modal.innerHTML = \`
                <div id="lf-container" class="lf-layout-\${config.layout || 'standard'}" style="background:\${config.backgroundColor};color:\${config.textColor};border-radius:\${config.borderRadius}px;width:90%;max-width:\${containerWidth};position:relative;box-shadow:\${shadow};\${animStyle}transition:transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;display:flex;flex-direction:\${flexDirection};overflow:hidden;">
                    <button onclick="document.getElementById('lf-modal').style.opacity='0';setTimeout(()=>document.getElementById('lf-modal').remove(),300)" style="position:absolute;top:15px;right:15px;border:none;background:none;font-size:24px;cursor:pointer;color:\${config.textColor};opacity:0.5;padding:5px;z-index:10;">&times;</button>
                    
                    \${hasImage ? \`
                        <div class="lf-image-container \${config.hideImageOnMobile ? 'lf-hide-mobile' : ''}" style="flex:1;background-image:url('\${config.imageUrl}');background-size:\${config.imageFit || 'cover'};background-position:center;background-repeat:no-repeat;background-color:#f3f4f6;min-height:200px;"></div>
                    \` : ''}

                    <div style="flex:1;padding:\${config.padding}px;">
                        <h3 style="margin:0 0 8px 0;font-size:24px;font-weight:700;line-height:1.2;">\${config.title}</h3>
                        <p style="margin:0 0 24px 0;font-size:15px;opacity:0.7;line-height:1.5;">\${config.subtitle}</p>
                        <form id="lf-form">
                            \${(config.fields || []).map(field => {
                                if (field.type === 'city-dealer') {
                                    return \`
                                        <div style="margin-bottom:16px;">
                                            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                            <select id="lf-city" name="city" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;margin-bottom:8px;">
                                                <option value="">Выберите город</option>
                                                \${cities.map(city => '<option value="' + city + '">' + city + '</option>').join('')}
                                            </select>
                                            <select id="lf-dealer" name="dealer" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;">
                                                <option value="">Выберите дилера</option>
                                            </select>
                                        </div>
                                    \`;
                                }
                                if (field.type === 'model-select') {
                                    const enabledModels = {};
                                    Object.keys(modelsData || {}).forEach(cat => {
                                        const models = (modelsData[cat] || []).filter(m => m.enabled).map(m => m.name);
                                        if (models.length > 0) {
                                            enabledModels[cat] = models;
                                        }
                                    });
                                    const categories = Object.keys(enabledModels);
                                    return \`
                                        <div style="margin-bottom:16px;">
                                            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                            <select id="lf-category" name="category" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;appearance:none;background-image:url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');background-repeat:no-repeat;background-position:right%2012px%20center;background-size:16px;margin-bottom:8px;">
                                                <option value="">Выберите категорию</option>
                                                \${categories.map(cat => '<option value="' + cat + '">' + cat + '</option>').join('')}
                                            </select>
                                            <select id="lf-model" name="model" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;appearance:none;background-image:url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');background-repeat:no-repeat;background-position:right%2012px%20center;background-size:16px;">
                                                <option value="">Выберите модель</option>
                                            </select>
                                        </div>
                                    \`;
                                }
                                if (field.type === 'textarea') {
                                    return \`
                                        <div style="margin-bottom:16px;">
                                            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                            <textarea name="\${field.id}" placeholder="\${field.placeholder || ''}" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;min-height:100px;resize:vertical;">\${extraData[field.id] || ''}</textarea>
                                        </div>
                                    \`;
                                }
                                if (field.type === 'dealer-readonly') {
                                    const val = extraData.dealer || extraData[field.id] || '';
                                    return \`
                                        <div style="margin-bottom:16px;">
                                            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}</label>
                                            <input type="text" name="\${field.id}" value="\${val}" readonly style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;opacity:0.7;cursor:not-allowed;">
                                        </div>
                                    \`;
                                }
                                return \`
                                    <div style="margin-bottom:16px;">
                                        <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                        <input type="\${field.type}" name="\${field.id}" placeholder="\${field.placeholder || ''}" \${field.required ? 'required' : ''} value="\${extraData[field.id] || ''}" style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;">
                                    </div>
                                \`;
                            }).join('')}
                            <button type="submit" style="width:100%;padding:14px;background:\${config.buttonColor};color:\${config.buttonTextColor};border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;margin-top:8px;transition:transform 0.1s active, opacity 0.2s hover;">Отправить</button>
                            <p style="text-align:center;font-size:10px;opacity:0.4;margin-top:16px;letter-spacing:0.5px;text-transform:uppercase;">Powered by LeadFlow</p>
                        </form>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
            
            // Add city filtering logic
            const citySelect = document.getElementById('lf-city');
            const dealerSelect = document.getElementById('lf-dealer');
            if (citySelect && dealerSelect) {
                citySelect.onchange = (e) => {
                    const city = e.target.value;
                    dealerSelect.innerHTML = '<option value="">Выберите дилера</option>';
                    if (city && dealers[city]) {
                        dealers[city].filter(d => d.enabled).forEach(d => {
                            const option = document.createElement('option');
                            option.value = d.name;
                            option.textContent = d.name;
                            dealerSelect.appendChild(option);
                        });
                    }
                };
            }

            // Add category/model filtering logic
            const categorySelect = document.getElementById('lf-category');
            const modelSelect = document.getElementById('lf-model');
            if (categorySelect && modelSelect) {
                const enabledModels = {};
                Object.keys(modelsData || {}).forEach(cat => {
                    const models = (modelsData[cat] || []).filter(m => m.enabled).map(m => m.name);
                    if (models.length > 0) {
                        enabledModels[cat] = models;
                    }
                });
                categorySelect.onchange = (e) => {
                    const category = e.target.value;
                    modelSelect.innerHTML = '<option value="">Выберите модель</option>';
                    if (category && enabledModels[category]) {
                        enabledModels[category].forEach(m => {
                            const option = document.createElement('option');
                            option.value = m;
                            option.textContent = m;
                            modelSelect.appendChild(option);
                        });
                    }
                };
            }
            
            setupCustomSelect('lf-city', 'Выберите город');
            setupCustomSelect('lf-dealer', 'Выберите дилера');
            setupCustomSelect('lf-category', 'Выберите категорию');
            setupCustomSelect('lf-model', 'Выберите модель');
            
            setTimeout(() => {
                modal.style.opacity = '1';
                const container = document.getElementById('lf-container');
                if (container) container.style.transform = 'scale(1)';
            }, 10);
            
            document.getElementById('lf-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const productName = document.querySelector('h1')?.innerText || '';
                const utms = getUTMs();
                const ymUid = getYmUid();
                const data = {
                    form_id: formId,
                    session_id: sessionId,
                    referrer: document.referrer,
                    page_url: window.location.href,
                    product: productName,
                    ym_uid: ymUid,
                    ...utms,
                    ...extraData
                };
                
                (config.fields || []).forEach(f => {
                    if (f.type === 'city-dealer') {
                        data['city'] = document.getElementById('lf-city')?.value || '';
                        data['dealer'] = document.getElementById('lf-dealer')?.value || '';
                    } else if (f.type === 'model-select') {
                        data['category'] = document.getElementById('lf-category')?.value || '';
                        data['model'] = document.getElementById('lf-model')?.value || '';
                    } else {
                        data[f.id] = formData.get(f.id);
                    }
                });
                
                const btn = e.target.querySelector('button');
                const originalText = btn.innerText;
                btn.disabled = true;
                btn.innerText = 'Отправка...';
                
                try {
                    const res = await fetch(API_URL + '/api/lead', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    // Track lead event
                    fetch(API_URL + "/track", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: ymUid || "anon",
                            source: utms.utm_source || "direct",
                            event: "lead",
                        }),
                    }).catch(() => {});

                    if (res.ok) {
                        document.getElementById('lf-container').innerHTML = \`
                            <div style="text-align:center;padding:20px 0;">
                                <div style="font-size:56px;margin-bottom:24px;animation:lf-bounce 0.5s ease;">✅</div>
                                <h3 style="margin:0 0 12px 0;font-size:24px;font-weight:700;">Спасибо!</h3>
                                <p style="opacity:0.7;margin:0 0 32px 0;line-height:1.5;">Ваша заявка успешно отправлена.<br>Мы свяжемся с вами в ближайшее время.</p>
                                <button onclick="document.getElementById('lf-modal').style.opacity='0';setTimeout(()=>document.getElementById('lf-modal').remove(),300)" style="padding:12px 32px;background:\${config.buttonColor};color:\${config.buttonTextColor};border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:transform 0.1s active;">Закрыть</button>
                            </div>
                        \`;
                    }
                } catch (err) {
                    alert('Ошибка при отправке. Попробуйте позже.');
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            };
        } catch (err) {
            console.error('LeadFlow: Fatal error opening form', err);
        }
    };

    async function initUniversalCode() {
        try {
            const res = await fetch(API_URL + '/api/forms');
            formsConfig = await res.json();
            
            document.body.addEventListener('click', (e) => {
                formsConfig.forEach(form => {
                    if (form.isActive !== false && form.cssSelector && form.cssSelector.trim() !== '') {
                        try {
                            const selectors = form.cssSelector.split(',').map(s => s.trim()).filter(s => s);
                            for (const selector of selectors) {
                                const target = e.target.closest(selector);
                                if (target) {
                                    e.preventDefault();
                                    window.openLeadForm(form.id);
                                    return;
                                }
                            }
                        } catch(err) {}
                    }
                });
            });
        } catch (e) {
            console.error('LeadFlow: Failed to initialize universal code', e);
        }
    }

    initUniversalCode();

    function setupCustomSelect(selectId, placeholder) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'lf-select-wrapper';
        
        const custom = document.createElement('div');
        custom.className = 'lf-select-custom';
        custom.style.background = select.style.background;
        custom.style.border = select.style.border;
        custom.style.color = select.style.color;
        custom.innerText = placeholder;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'lf-select-dropdown';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'lf-select-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск...';
        searchContainer.appendChild(searchInput);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'lf-options-container';
        
        dropdown.appendChild(searchContainer);
        dropdown.appendChild(optionsContainer);
        wrapper.appendChild(custom);
        wrapper.appendChild(dropdown);
        
        select.parentNode.insertBefore(wrapper, select);
        select.style.display = 'none';
        
        function updateOptions() {
            optionsContainer.innerHTML = '';
            const options = Array.from(select.options).filter(opt => opt.value !== "");
            
            if (options.length > 10) {
                searchContainer.style.display = 'block';
            } else {
                searchContainer.style.display = 'none';
            }

            options.forEach(opt => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'lf-select-option';
                if (select.value === opt.value) optionDiv.classList.add('selected');
                optionDiv.innerText = opt.text;
                optionDiv.onclick = (e) => {
                    e.stopPropagation();
                    select.value = opt.value;
                    custom.innerText = opt.text;
                    select.dispatchEvent(new Event('change'));
                    wrapper.classList.remove('active');
                };
                optionsContainer.appendChild(optionDiv);
            });
            
            if (options.length === 0) {
                optionsContainer.innerHTML = '<div class="lf-select-option" style="opacity:0.5;cursor:default;">Нет доступных вариантов</div>';
            }
        }

        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const options = optionsContainer.querySelectorAll('.lf-select-option');
            options.forEach(opt => {
                if (opt.innerText.toLowerCase().includes(term)) {
                    opt.style.display = 'block';
                } else {
                    opt.style.display = 'none';
                }
            });
        };

        custom.onclick = (e) => {
            e.stopPropagation();
            const wasActive = wrapper.classList.contains('active');
            document.querySelectorAll('.lf-select-wrapper').forEach(w => w.classList.remove('active'));
            if (!wasActive) {
                wrapper.classList.add('active');
                if (searchContainer.style.display !== 'none') {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        };

        const observer = new MutationObserver(() => {
            updateOptions();
            const selectedOpt = Array.from(select.options).find(o => o.value === select.value);
            custom.innerText = selectedOpt ? selectedOpt.text : placeholder;
        });
        observer.observe(select, { childList: true });

        updateOptions();
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.lf-select-wrapper').forEach(w => w.classList.remove('active'));
    });

    const style = document.createElement('style');
    style.innerHTML = \`
        @keyframes lf-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        #lf-form input:focus, #lf-form textarea:focus { border-color: rgba(0,0,0,0.3) !important; }
        
        /* Custom Select Styles */
        .lf-select-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 8px;
        }
        .lf-select-custom {
            width: 100%;
            padding: 12px 40px 12px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            position: relative;
            transition: all 0.2s ease;
            user-select: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
        }
        .lf-select-custom:after {
            content: "";
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            width: 10px;
            height: 6px;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'10'%20height%3D'6'%20viewBox%3D'0%200%2010%206'%20fill%3D'none'%3E%3Cpath%20d='M1%201L5%205L9%201'%20stroke='%236B7280'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'%2F%3E%3C%2Fsvg%3E");
            background-repeat: no-repeat;
            background-position: center;
            transition: transform 0.2s ease;
        }
        .lf-select-wrapper.active .lf-select-custom:after {
            transform: translateY(-50%) rotate(180deg);
        }
        .lf-select-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 250px;
            overflow-y: auto;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .lf-select-wrapper.active .lf-select-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .lf-select-option {
            padding: 12px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s ease;
            color: #374151;
        }
        .lf-select-option:hover {
            background: #f3f4f6;
        }
        .lf-select-option.selected {
            background: #eff6ff;
            color: #2563eb;
            font-weight: 600;
        }
        .lf-select-search {
            padding: 8px;
            border-bottom: 1px solid #f3f4f6;
            position: sticky;
            top: 0;
            background: #fff;
            z-index: 1;
        }
        .lf-select-search input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 13px;
            outline: none;
        }
        .lf-select-search input:focus {
            border-color: #3b82f6;
        }
        @media (max-width: 768px) {
            .lf-layout-split-left, .lf-layout-split-right { flex-direction: column !important; }
            .lf-image-container { min-height: 150px !important; }
            .lf-hide-mobile { display: none !important; }
        }
    \`;
    document.head.appendChild(style);
})();
    `;
    res.setHeader("Content-Type", "application/javascript");
    res.send(script);
  });

  // --- EVENTS STORAGE (без БД) ---
  const events: any[] = [];

  // --- TRACK EVENT ---
  app.post("/track", (req, res) => {
    try {
      const event = {
        id: Date.now(),
        user_id: req.body.user_id || "anon",
        source: req.body.source || "unknown",
        event: req.body.event, // "visit" | "lead"
        timestamp: Date.now(),
      };

      events.push(event);

      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- DEBUG (можно удалить потом) ---
  app.get("/events", (req, res) => {
    res.json(events);
  });

  app.get("/analytics-v2", (req, res) => {
    const result: Record<string, { visits: number; leads: number; users: Set<string> }> = {};

    for (const e of events) {
      if (!result[e.source]) {
        result[e.source] = {
          visits: 0,
          leads: 0,
          users: new Set(),
        };
      }

      if (e.event === "visit") {
        result[e.source].visits++;
      }

      if (e.event === "lead") {
        result[e.source].leads++;
      }

      result[e.source].users.add(e.user_id);
    }

    // финализация
    const formatted = Object.entries(result).map(([source, data]) => {
      const usersCount = data.users.size;

      return {
        source,
        visits: data.visits,
        users: usersCount,
        leads: data.leads,
        conversion:
          data.visits > 0
            ? ((data.leads / data.visits) * 100).toFixed(2)
            : 0,
      };
    });

    res.json(formatted);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler caught:", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Start Bitrix24 background sync (every 5 minutes)
  setInterval(syncBitrixDeals, 5 * 60 * 1000);
  setInterval(syncBitrixLeads, 5 * 60 * 1000);
  // Start event queue processing (every 20 seconds)
  setInterval(processEventQueue, 20 * 1000);
  
  // Initial sync after 10 seconds
  setTimeout(() => {
    syncBitrixDeals();
    syncBitrixLeads();
    processEventQueue();
  }, 10000);
}

startServer();
