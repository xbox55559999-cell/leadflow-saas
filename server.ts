import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage
let forms = [
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
    borderRadius: 16,
    padding: 32,
    maxWidth: 450,
    showShadow: true,
    animationType: "zoom",
    createdAt: new Date().toISOString(),
  }
];

let leads = [];
let settings = {
  bitrixWebhook: "",
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/forms", (req, res) => {
    res.json(forms);
  });

  app.post("/api/forms", (req, res) => {
    const newForm = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    forms.push(newForm);
    res.json(newForm);
  });

  app.put("/api/forms/:id", (req, res) => {
    const index = forms.findIndex(f => f.id === req.params.id);
    if (index !== -1) {
      forms[index] = { ...forms[index], ...req.body };
      res.json(forms[index]);
    } else {
      res.status(404).json({ error: "Form not found" });
    }
  });

  app.delete("/api/forms/:id", (req, res) => {
    forms = forms.filter(f => f.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/lead", async (req, res) => {
    const leadData = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body,
      timestamp: new Date().toISOString(),
    };

    leads.push(leadData);

    // Bitrix24 Integration
    if (settings.bitrixWebhook) {
      try {
        const bitrixData = {
          fields: {
            TITLE: `Заявка с сайта - ${leadData.model || 'Без модели'}`,
            NAME: leadData.name || 'Без имени',
            PHONE: [{ VALUE: leadData.phone, VALUE_TYPE: "WORK" }],
            EMAIL: leadData.email ? [{ VALUE: leadData.email, VALUE_TYPE: "WORK" }] : [],
            UTM_SOURCE: leadData.utm_source,
            UTM_MEDIUM: leadData.utm_medium,
            UTM_CAMPAIGN: leadData.utm_campaign,
            COMMENTS: `Источник: ${leadData.referrer}\nСтраница: ${leadData.page_url}\nМодель: ${leadData.model || '-'}`,
          }
        };
        await axios.post(`${settings.bitrixWebhook}/crm.lead.add.json`, bitrixData);
      } catch (error) {
        console.error("Bitrix24 integration error:", error.message);
      }
    }

    res.json({ success: true, lead_id: leadData.id });
  });

  app.get("/api/settings", (req, res) => {
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  // Serve widget.js dynamically to include the current host
  app.get("/widget.js", (req, res) => {
    const host = process.env.APP_URL || `http://localhost:${PORT}`;
    const script = `
(function() {
    const API_URL = "${host}";
    
    // UTM Tracking
    function getUTMs() {
        const params = new URLSearchParams(window.location.search);
        const utms = {
            utm_source: params.get('utm_source'),
            utm_medium: params.get('utm_medium'),
            utm_campaign: params.get('utm_campaign'),
            utm_content: params.get('utm_content'),
            utm_term: params.get('utm_term')
        };
        
        Object.keys(utms).forEach(key => {
            if (utms[key]) localStorage.setItem('lf_' + key, utms[key]);
        });
        
        Object.keys(utms).forEach(key => {
            if (!utms[key]) utms[key] = localStorage.getItem('lf_' + key);
        });
        
        return utms;
    }

    let sessionId = localStorage.getItem('lf_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substr(2, 9);
        localStorage.setItem('lf_session_id', sessionId);
    }

    let formsConfig = [];

    window.openLeadForm = async function(formId, extraData = {}) {
        const utms = getUTMs();
        
        // Always fetch the latest config to ensure real-time updates without page reload
        try {
            const res = await fetch(API_URL + '/api/forms');
            formsConfig = await res.json();
        } catch (e) {
            console.error('LeadFlow: Failed to fetch form config', e);
            return;
        }
        
        const config = formsConfig.find(f => f.id === formId);
        if (!config) return;

        const modal = document.createElement('div');
        modal.id = 'lf-modal';
        modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:sans-serif;backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s ease;";
        
        const shadow = config.showShadow ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none";
        
        const animations = {
            zoom: "transform:scale(0.9);",
            fade: "opacity:0;",
            slideUp: "transform:translateY(50px);",
            bounce: "transform:scale(0.5);"
        };
        
        const activeAnimations = {
            zoom: "transform:scale(1);",
            fade: "opacity:1;",
            slideUp: "transform:translateY(0);",
            bounce: "transform:scale(1);"
        };

        const animStyle = animations[config.animationType] || animations.zoom;
        const activeAnimStyle = activeAnimations[config.animationType] || activeAnimations.zoom;

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
                        \${config.fields.map(field => {
                            if (field.type === 'textarea') {
                                return \`
                                    <div style="margin-bottom:16px;">
                                        <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                        <textarea name="\${field.id}" placeholder="\${field.placeholder || ''}" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;min-height:100px;resize:vertical;"></textarea>
                                    </div>
                                \`;
                            }
                            return \`
                                <div style="margin-bottom:16px;">
                                    <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;opacity:0.8;">\${field.label}\${field.required ? ' *' : ''}</label>
                                    <input type="\${field.type}" name="\${field.id}" placeholder="\${field.placeholder || ''}" \${field.required ? 'required' : ''} style="width:100%;padding:12px;border:\${config.inputBorderWidth || 0}px solid \${config.inputBorderColor || 'transparent'};background:\${config.inputBackgroundColor};border-radius:8px;box-sizing:border-box;font-size:15px;color:inherit;outline:none;transition:border-color 0.2s ease;">
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
        
        setTimeout(() => {
            modal.style.opacity = '1';
            const container = document.getElementById('lf-container');
            if (config.animationType === 'fade') {
                container.style.opacity = '1';
            } else if (config.animationType === 'slideUp') {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            } else if (config.animationType === 'bounce') {
                container.style.transform = 'scale(1)';
            } else {
                container.style.transform = 'scale(1)';
            }
        }, 10);
        
        document.getElementById('lf-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                form_id: formId,
                session_id: sessionId,
                referrer: document.referrer,
                page_url: window.location.href,
                ...utms,
                ...extraData
            };
            
            config.fields.forEach(f => {
                data[f.id] = formData.get(f.id);
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
    };

    // Auto-init forms based on CSS selectors
    async function initUniversalCode() {
        try {
            const res = await fetch(API_URL + '/api/forms');
            formsConfig = await res.json();
            
            // Event delegation for dynamically added elements
            document.body.addEventListener('click', (e) => {
                formsConfig.forEach(form => {
                    if (form.cssSelector && form.cssSelector.trim() !== '') {
                        try {
                            const selectors = form.cssSelector.split(',').map(s => s.trim()).filter(s => s);
                            for (const selector of selectors) {
                                const target = e.target.closest(selector);
                                if (target) {
                                    e.preventDefault();
                                    window.openLeadForm(form.id);
                                    return; // Stop checking other selectors for this form
                                }
                            }
                        } catch(err) {
                            // Ignore invalid selectors
                        }
                    }
                });
            });
        } catch (e) {
            console.error('LeadFlow: Failed to initialize universal code', e);
        }
    }

    initUniversalCode();

    const style = document.createElement('style');
    style.innerHTML = \`
        @keyframes lf-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        #lf-form input:focus, #lf-form textarea:focus { border-color: rgba(0,0,0,0.3) !important; }
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
}

startServer();
