import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Copy, 
  Trash2, 
  ExternalLink,
  BarChart3,
  TrendingUp,
  MousePointer2,
  Check,
  X,
  Settings2,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  LayoutTemplate,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Target,
  CheckCircle,
  FlaskConical,
  ArrowUpRight,
  AlertCircle,
  Activity,
  AlertTriangle,
  Package,
  List,
  MapPin,
  Upload,
  Filter,
  RotateCcw,
  Search,
  HelpCircle,
  User,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DateRangePicker } from './components/DateRangePicker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function normalizeSource(source_raw?: string): string {
  if (!source_raw) return "Other";
  const s = source_raw.toLowerCase();
  if (s.includes("yandex")) return "Yandex";
  if (s.includes("google")) return "Google";
  if (s.includes("instagram") || s === "ig") return "Instagram";
  if (s.includes("vk")) return "VK";
  if (s.includes("facebook")) return "Facebook";
  return "Other";
}

function normalizeCampaign(campaign_raw?: string): string {
  if (!campaign_raw) return "Other";
  const c = campaign_raw.toLowerCase();
  if (c.includes("brand")) return "Brand";
  if (c.includes("retarget")) return "Retargeting";
  if (c.includes("promo") || c.includes("sale")) return "Promo";
  return "Other";
}

// --- Types ---
interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface Form {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  fields: FormField[];
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  inputBackgroundColor: string;
  inputBorderWidth: number;
  inputBorderColor: string;
  borderRadius: number;
  padding: number;
  maxWidth: number;
  showShadow: boolean;
  animationType: string;
  cssSelector?: string;
  layout?: 'standard' | 'split-left' | 'split-right' | 'image-top';
  imageUrl?: string;
  imageFit?: 'cover' | 'contain';
  hideImageOnMobile?: boolean;
  formWidth?: 'auto' | 'custom';
  customWidth?: number;
  footerText?: string;
  successTitle?: string;
  successSubtitle?: string;
  createdAt: string;
  isActive: boolean;
}

interface Lead {
  id: string;
  form_id: string;
  name: string;
  phone: string;
  email?: string;
  timestamp: string;
  utm_source?: string;
  source_raw?: string;
  source_normalized?: string;
  utm_campaign?: string;
  campaign_raw?: string;
  campaign_normalized?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  page_url?: string;
  model?: string;
  status: 'new' | 'in-progress' | 'closed' | 'rejected';
  type: 'form' | 'call';
  notes?: string;
  bitrix_lead_id?: string;
  [key: string]: any;
}

interface Cost {
  id: string;
  date: string;
  source_normalized: string;
  campaign_normalized: string;
  cost: number;
}

interface Deal {
  id: string;
  tenant_id: string;
  lead_id: string;
  status: 'new' | 'in_progress' | 'won' | 'lost';
  amount: number;
  model_id?: string;
  dealer_id?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  loss_reason?: 'price' | 'no_stock' | 'competitor' | 'no_response' | 'other';
  bitrix_deal_id?: string;
}

interface Settings {
  bitrixWebhook: string;
  yandexMetricaId: string;
  yandexMetricaToken: string;
  yandexMetricaEnabled: boolean;
  yandexMetricaClientId?: string;
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (t: string) => void, isOpen: boolean, setIsOpen: (o: boolean) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'forms', label: 'Формы', icon: FileText },
    { id: 'leads', label: 'Лиды', icon: Users },
    { id: 'deals', label: 'Сделки', icon: Target },
    { id: 'dealers', label: 'Дилеры', icon: MapPin },
    { id: 'models', label: 'Модели', icon: Layers },
    { id: 'installation', label: 'Установка', icon: ExternalLink },
    { id: 'test-page', label: 'Тест-драйв', icon: FlaskConical },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">LeadFlow</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-gray-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-black text-white shadow-lg shadow-black/10" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@leadflow.io</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const VisitorStats = ({ settings }: { settings: Settings }) => {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const now = new Date();
    const date1 = new Date();
    if (period === 'hour') date1.setHours(now.getHours() - 24);
    else if (period === 'day') date1.setDate(now.getDate() - 7);
    else if (period === 'week') date1.setDate(now.getDate() - 30);
    else if (period === 'month') date1.setMonth(now.getMonth() - 3);

    try {
      const res = await fetch(`/api/analytics/metrica?date1=${date1.toISOString().split('T')[0]}&date2=${now.toISOString().split('T')[0]}`);
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch analytics");
        }
        setStats(data);
      } else {
        const text = await res.text();
        console.error("[VisitorStats] Received non-JSON response:", text.substring(0, 100));
        if (res.status === 403) {
          throw new Error("Доступ запрещен (403). Проверьте OAuth-токен в настройках.");
        }
        throw new Error(`Ошибка сервера (${res.status}): Некорректный формат ответа`);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Use settings to avoid unused warning
  const metricaEnabled = settings.yandex_metrica_enabled;
  if (!metricaEnabled) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Посетители</h3>
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="text-xs font-bold bg-gray-50 rounded-lg px-2 py-1">
          <option value="hour">Часы</option>
          <option value="day">Дни</option>
          <option value="week">Недели</option>
          <option value="month">Месяцы</option>
        </select>
      </div>
      {loading ? <div className="h-40 flex items-center justify-center">Загрузка...</div> : error ? (
        <div className="h-40 flex flex-col items-center justify-center text-red-500 text-sm p-4 text-center">
          <p>{error}</p>
          <p className="mt-2">Пожалуйста, проверьте настройки Яндекс.Метрики в разделе "Настройки".</p>
        </div>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.daily?.data || []}>
              <XAxis dataKey="date" hide />
              <Tooltip />
              <Bar dataKey="metrics[0]" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ leads, deals, settings, eventStats }: { leads: Lead[], deals: Deal[], forms: Form[], settings: Settings, eventStats: { new: number, processed: number, error: number } }) => {
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const callsCount = leads.filter(l => l.type === 'call').length;
  const formsCount = leads.filter(l => l.type === 'form').length;

  // Loss calculations
  const unprocessedLeads = leads.filter(lead => {
    const deal = deals.find(d => d.lead_id === lead.id);
    return !deal || deal.status === 'new';
  });

  const lostDeals = deals.filter(d => d.status === 'lost');
  const wonDeals = deals.filter(d => d.status === 'won');
  const averageWonAmount = wonDeals.length > 0 
    ? wonDeals.reduce((acc, d) => acc + d.amount, 0) / wonDeals.length 
    : 0;
  
  const potentialLoss = unprocessedLeads.length * averageWonAmount;
  
  // Stats by source
  const sourceData = leads.reduce((acc: any, lead) => {
    const source = lead.source_normalized || normalizeSource(lead.utm_source || 'Direct');
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const typeData = [
    { name: 'Звонки', value: callsCount, color: '#3b82f6' },
    { name: 'Формы', value: formsCount, color: '#10b981' }
  ];

  const chartData = Object.keys(sourceData).map(name => ({
    name,
    value: sourceData[name]
  }));

  const COLORS = ['#000000', '#444444', '#888888', '#CCCCCC', '#EEEEEE'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Всего лидов</p>
          <h2 className="text-3xl font-bold">{totalLeads}</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              <Phone className="w-3 h-3 mr-1" /> {callsCount} звонков
            </div>
            <div className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-wider">
              <MessageSquare className="w-3 h-3 mr-1" /> {formsCount} форм
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Новые лиды</p>
          <h2 className="text-3xl font-bold text-blue-600">{newLeads}</h2>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            Требуют обработки
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Закрытые сделки</p>
          <h2 className="text-3xl font-bold text-green-600">{closedLeads}</h2>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            Успешные продажи
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Конверсия (ср.)</p>
          <h2 className="text-3xl font-bold">4.2%</h2>
        </div>
      </div>

      {/* Problems Block */}
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
        <div className="flex items-center gap-2 text-red-700 font-bold mb-4">
          <AlertCircle className="w-5 h-5" />
          Проблемы и потери
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Необработанные лиды</p>
            <h3 className="text-2xl font-bold text-red-700">{unprocessedLeads.length}</h3>
            <p className="text-[10px] text-red-500 mt-1">Нет сделки или статус "Новая"</p>
          </div>
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Потерянные сделки</p>
            <h3 className="text-2xl font-bold text-red-700">{lostDeals.length}</h3>
            <p className="text-[10px] text-red-500 mt-1">Статус сделки "Отказ"</p>
          </div>
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Потенциальные потери</p>
            <h3 className="text-2xl font-bold text-red-700">
              {potentialLoss.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[10px] text-red-500 mt-1">Необработанные × ср. чек ({averageWonAmount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽)</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status Block */}
        <div className={`p-8 rounded-2xl border transition-all ${
          (eventStats.error > 0 && (eventStats.error / (eventStats.new + eventStats.processed + eventStats.error || 1)) > 0.1)
            ? 'bg-red-50 border-red-100' 
            : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 font-bold ${
              (eventStats.error > 0 && (eventStats.error / (eventStats.new + eventStats.processed + eventStats.error || 1)) > 0.1)
                ? 'text-red-700' 
                : 'text-gray-700'
            }`}>
              <Activity className="w-5 h-5" />
              Состояние системы
            </div>
            {eventStats.error > 0 && (eventStats.error / (eventStats.new + eventStats.processed + eventStats.error || 1)) > 0.1 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-100 px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Внимание: высокий уровень ошибок
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50/50 p-3 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Новые события</p>
              <p className="text-xl font-bold text-gray-900">{eventStats.new}</p>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Обработано</p>
              <p className="text-xl font-bold text-green-600">{eventStats.processed}</p>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Ошибки</p>
              <p className={`text-xl font-bold ${eventStats.error > 0 ? 'text-red-600' : 'text-gray-400'}`}>{eventStats.error}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-medium">Очередь событий активна • Обновление каждые 30с</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Типы лидов</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Распределение трафика</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <VisitorStats settings={settings} />
    </div>
  );
};

const Forms = ({ forms, onAddForm, onDeleteForm, onUpdateForm }: { 
  forms: Form[], 
  onAddForm: (f: any) => void, 
  onDeleteForm: (id: string) => void,
  onUpdateForm: (id: string, f: any) => void
}) => {
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  const defaultNewForm = {
    name: "Новая форма",
    title: "Оставить заявку",
    subtitle: "Мы свяжемся с вами в ближайшее время",
    fields: [
      { id: 'name', label: 'Имя', type: 'text', required: true, placeholder: 'Ваше имя' },
      { id: 'phone', label: 'Телефон', type: 'tel', required: true, placeholder: '+7 (___) ___-__-__' },
    ],
    backgroundColor: "#ffffff",
    textColor: "#111111",
    buttonColor: "#000000",
    buttonTextColor: "#ffffff",
    inputBackgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 32,
    maxWidth: 450,
    showShadow: true,
    animationType: "zoom"
  };

  const handleCreate = async () => {
    await onAddForm(defaultNewForm);
    setIsCreating(false);
  };

  if (editingForm) {
    return (
      <FormBuilder 
        form={editingForm} 
        onSave={(updated) => {
          onUpdateForm(editingForm.id, updated);
          setEditingForm(null);
        }} 
        onCancel={() => setEditingForm(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ваши формы</h2>
        <button 
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать новую
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <div key={form.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group hover:border-black/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{form.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{form.id}</p>
                    <div className={cn("w-1.5 h-1.5 rounded-full", form.isActive !== false ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {form.isActive !== false ? 'Активна' : 'Выключена'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isActive !== false}
                    onChange={(e) => onUpdateForm(form.id, { ...form, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
                </label>
                <button 
                  onClick={() => onDeleteForm(form.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setEditingForm(form)}
                className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Конструктор
              </button>
              <button 
                onClick={() => {
                  const host = window.location.origin;
                  const code = `<script src="${host}/widget.js"></script>\n<button onclick="window.openLeadForm('${form.id}')">Оставить заявку</button>`;
                  navigator.clipboard.writeText(code);
                  alert('Код скопирован!');
                }}
                className="px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FormBuilder = ({ form, onSave, onCancel }: { form: Form, onSave: (f: Form) => void, onCancel: () => void }) => {
  const [localForm, setLocalForm] = useState<Form>({
    id: form.id || '',
    name: form.name || '',
    title: form.title || '',
    subtitle: form.subtitle || '',
    fields: form.fields || [],
    backgroundColor: form.backgroundColor || '#ffffff',
    textColor: form.textColor || '#111111',
    buttonColor: form.buttonColor || '#000000',
    buttonTextColor: form.buttonTextColor || '#ffffff',
    inputBackgroundColor: form.inputBackgroundColor || '#f3f4f6',
    inputBorderWidth: form.inputBorderWidth ?? 0,
    inputBorderColor: form.inputBorderColor || '#e5e7eb',
    borderRadius: form.borderRadius ?? 16,
    padding: form.padding ?? 32,
    maxWidth: form.maxWidth ?? 450,
    showShadow: form.showShadow ?? true,
    animationType: form.animationType || 'zoom',
    cssSelector: form.cssSelector || '',
    layout: form.layout || 'standard',
    imageUrl: form.imageUrl || '',
    imageFit: form.imageFit || 'cover',
    hideImageOnMobile: form.hideImageOnMobile ?? false,
    formWidth: form.formWidth || 'auto',
    customWidth: form.customWidth ?? 800,
    footerText: form.footerText || 'Powered by LeadFlow',
    successTitle: form.successTitle || 'Спасибо!',
    successSubtitle: form.successSubtitle || 'Ваша заявка успешно отправлена.\nМы свяжемся с вами в ближайшее время.',
    createdAt: form.createdAt || '',
    isActive: form.isActive ?? true,
  });
  const [activePanel, setActivePanel] = useState<'content' | 'style' | 'fields' | 'layout'>('content');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...localForm.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setLocalForm({ ...localForm, fields: newFields });
  };

  const addField = () => {
    const id = 'field_' + Math.random().toString(36).substr(2, 5);
    setLocalForm({
      ...localForm,
      fields: [...localForm.fields, { id, label: 'Новое поле', type: 'text', required: false, placeholder: '' }]
    });
  };

  const removeField = (index: number) => {
    const newFields = localForm.fields.filter((_, i) => i !== index);
    setLocalForm({ ...localForm, fields: newFields });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-2" />
          <h2 className="font-bold text-lg">{localForm.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave(localForm)}
            className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Сохранить изменения
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-white overflow-y-auto">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActivePanel('content')}
              className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all", activePanel === 'content' ? "border-black text-black" : "border-transparent text-gray-400")}
            >
              Контент
            </button>
            <button 
              onClick={() => setActivePanel('style')}
              className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all", activePanel === 'style' ? "border-black text-black" : "border-transparent text-gray-400")}
            >
              Стиль
            </button>
            <button 
              onClick={() => setActivePanel('layout')}
              className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all", activePanel === 'layout' ? "border-black text-black" : "border-transparent text-gray-400")}
            >
              Макет
            </button>
            <button 
              onClick={() => setActivePanel('fields')}
              className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all", activePanel === 'fields' ? "border-black text-black" : "border-transparent text-gray-400")}
            >
              Поля
            </button>
          </div>

          <div className="p-6 space-y-8">
            {activePanel === 'content' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Название (внутр.)</label>
                  <input 
                    type="text" 
                    value={localForm.name}
                    onChange={(e) => setLocalForm({ ...localForm, name: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Заголовок формы</label>
                  <input 
                    type="text" 
                    value={localForm.title}
                    onChange={(e) => setLocalForm({ ...localForm, title: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Подзаголовок</label>
                  <textarea 
                    value={localForm.subtitle}
                    onChange={(e) => setLocalForm({ ...localForm, subtitle: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 h-24 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Текст в подвале</label>
                  <input 
                    type="text" 
                    value={localForm.footerText || ''}
                    onChange={(e) => setLocalForm({ ...localForm, footerText: e.target.value })}
                    placeholder="Powered by LeadFlow"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Заголовок после отправки</label>
                  <input 
                    type="text" 
                    value={localForm.successTitle || ''}
                    onChange={(e) => setLocalForm({ ...localForm, successTitle: e.target.value })}
                    placeholder="Спасибо!"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Текст после отправки</label>
                  <textarea 
                    value={localForm.successSubtitle || ''}
                    onChange={(e) => setLocalForm({ ...localForm, successSubtitle: e.target.value })}
                    placeholder="Ваша заявка успешно отправлена."
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 h-24 resize-none"
                  />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={localForm.isActive}
                        onChange={(e) => setLocalForm({ ...localForm, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Форма активна</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    CSS Селектор (Триггер)
                    <span className="text-[10px] font-normal text-gray-400 normal-case" title="Класс или ID элемента на сайте, при клике на который откроется форма (например: .open-modal или #callback-btn)">?</span>
                  </label>
                  <input 
                    type="text" 
                    value={localForm.cssSelector || ''}
                    onChange={(e) => setLocalForm({ ...localForm, cssSelector: e.target.value })}
                    placeholder=".my-button, #callback"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 font-mono"
                  />
                </div>
              </div>
            )}

            {activePanel === 'style' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Фон</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.backgroundColor} onChange={(e) => setLocalForm({ ...localForm, backgroundColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.backgroundColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Текст</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.textColor} onChange={(e) => setLocalForm({ ...localForm, textColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.textColor}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Кнопка</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.buttonColor} onChange={(e) => setLocalForm({ ...localForm, buttonColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.buttonColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Текст кн.</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.buttonTextColor} onChange={(e) => setLocalForm({ ...localForm, buttonTextColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.buttonTextColor}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Фон полей</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.inputBackgroundColor} onChange={(e) => setLocalForm({ ...localForm, inputBackgroundColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.inputBackgroundColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Цвет обводки</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={localForm.inputBorderColor} onChange={(e) => setLocalForm({ ...localForm, inputBorderColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                      <span className="text-xs font-mono">{localForm.inputBorderColor}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Толщина обводки</label>
                    <span className="text-[10px] font-bold">{localForm.inputBorderWidth}px</span>
                  </div>
                  <input type="range" min="0" max="5" value={localForm.inputBorderWidth} onChange={(e) => setLocalForm({ ...localForm, inputBorderWidth: parseInt(e.target.value) })} className="w-full accent-black" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Скругление</label>
                      <span className="text-[10px] font-bold">{localForm.borderRadius}px</span>
                    </div>
                    <input type="range" min="0" max="40" value={localForm.borderRadius} onChange={(e) => setLocalForm({ ...localForm, borderRadius: parseInt(e.target.value) })} className="w-full accent-black" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Отступы</label>
                      <span className="text-[10px] font-bold">{localForm.padding}px</span>
                    </div>
                    <input type="range" min="16" max="64" value={localForm.padding} onChange={(e) => setLocalForm({ ...localForm, padding: parseInt(e.target.value) })} className="w-full accent-black" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Макс. ширина</label>
                      <span className="text-[10px] font-bold">{localForm.maxWidth}px</span>
                    </div>
                    <input type="range" min="300" max="800" value={localForm.maxWidth} onChange={(e) => setLocalForm({ ...localForm, maxWidth: parseInt(e.target.value) })} className="w-full accent-black" />
                  </div>
                </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Анимация</label>
                    <select 
                      value={localForm.animationType}
                      onChange={(e) => setLocalForm({ ...localForm, animationType: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-black/5"
                    >
                      <option value="zoom">Zoom</option>
                      <option value="fade">Fade</option>
                      <option value="slideUp">Slide Up</option>
                      <option value="bounce">Bounce</option>
                    </select>
                  </div>
                </div>
            )}

            {activePanel === 'layout' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Тип макета</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setLocalForm({ ...localForm, layout: 'standard' })}
                      className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", localForm.layout === 'standard' ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200")}
                    >
                      <LayoutTemplate className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Стандартный</span>
                    </button>
                    <button 
                      onClick={() => setLocalForm({ ...localForm, layout: 'split-left' })}
                      className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", localForm.layout === 'split-left' ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200")}
                    >
                      <div className="flex gap-1">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <LayoutTemplate className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Картинка слева</span>
                    </button>
                    <button 
                      onClick={() => setLocalForm({ ...localForm, layout: 'split-right' })}
                      className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", localForm.layout === 'split-right' ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200")}
                    >
                      <div className="flex gap-1">
                        <LayoutTemplate className="w-5 h-5 text-gray-400" />
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Картинка справа</span>
                    </button>
                    <button 
                      onClick={() => setLocalForm({ ...localForm, layout: 'image-top' })}
                      className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", localForm.layout === 'image-top' ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200")}
                    >
                      <div className="flex flex-col gap-1 items-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <LayoutTemplate className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Картинка сверху</span>
                    </button>
                  </div>
                </div>

                {localForm.layout !== 'standard' && (
                  <div className="space-y-6 p-4 bg-gray-50 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Картинки</label>
                      <input 
                        type="text" 
                        value={localForm.imageUrl || ''}
                        onChange={(e) => setLocalForm({ ...localForm, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Заполнение картинки</label>
                      <select 
                        value={localForm.imageFit || 'cover'}
                        onChange={(e) => setLocalForm({ ...localForm, imageFit: e.target.value as 'cover' | 'contain' })}
                        className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-black/5"
                      >
                        <option value="cover">Заполнить (Cover)</option>
                        <option value="contain">Вместить (Contain)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={localForm.hideImageOnMobile}
                          onChange={(e) => setLocalForm({ ...localForm, hideImageOnMobile: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Скрыть на мобильных</span>
                    </label>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ширина формы</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLocalForm({ ...localForm, formWidth: 'auto' })}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all", localForm.formWidth === 'auto' ? "bg-black text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}
                    >
                      Авто
                    </button>
                    <button 
                      onClick={() => setLocalForm({ ...localForm, formWidth: 'custom' })}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all", localForm.formWidth === 'custom' ? "bg-black text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}
                    >
                      Своя
                    </button>
                  </div>
                  
                  {localForm.formWidth === 'custom' && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Размер (px)</label>
                        <span className="text-xs font-mono">{localForm.customWidth}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="300" 
                        max="1200" 
                        step="10"
                        value={localForm.customWidth}
                        onChange={(e) => setLocalForm({ ...localForm, customWidth: parseInt(e.target.value) })}
                        className="w-full accent-black"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'fields' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {localForm.fields.map((field, idx) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-xl space-y-3 relative group">
                      <button 
                        onClick={() => removeField(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <input 
                        type="text" 
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="Название поля"
                        className="w-full bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-black/5"
                      />
                      <input 
                        type="text" 
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        placeholder="Плейсхолдер"
                        className="w-full bg-white border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black/5"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={field.type}
                          onChange={(e) => updateField(idx, { type: e.target.value })}
                          className="flex-1 bg-white border-none rounded-lg px-3 py-2 text-[10px] font-bold focus:ring-2 focus:ring-black/5"
                        >
                          <option value="text">Текст</option>
                          <option value="tel">Телефон</option>
                          <option value="email">Email</option>
                          <option value="number">Число</option>
                          <option value="textarea">Многострочный текст</option>
                          <option value="city-dealer">Город/Дилер</option>
                          <option value="dealer-readonly">Дилер (Только чтение)</option>
                          <option value="model-select">Выбор модели</option>
                        </select>
                        <button 
                          onClick={() => updateField(idx, { required: !field.required })}
                          className={cn("px-3 rounded-lg text-[10px] font-bold transition-all", field.required ? "bg-black text-white" : "bg-white text-gray-400")}
                        >
                          Обяз.
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addField}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить поле
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#f8f9fa] flex flex-col items-center justify-start p-8 overflow-y-auto relative">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 mb-8 sticky top-0 z-10">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={cn("p-2 rounded-full transition-all", previewMode === 'desktop' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50")}
              title="Десктоп"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode('tablet')}
              className={cn("p-2 rounded-full transition-all", previewMode === 'tablet' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50")}
              title="Планшет"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={cn("p-2 rounded-full transition-all", previewMode === 'mobile' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50")}
              title="Мобильный"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex flex-col items-center flex-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Предпросмотр (Live Preview)</div>
            
            <div 
              style={{
                width: previewMode === 'desktop' ? '100%' : (previewMode === 'tablet' ? '768px' : '375px'),
                maxWidth: localForm.formWidth === 'custom' ? `${localForm.customWidth}px` : (localForm.layout === 'standard' || localForm.layout === 'image-top' ? `${localForm.maxWidth}px` : '800px'),
                backgroundColor: localForm.backgroundColor,
                color: localForm.textColor,
                borderRadius: `${localForm.borderRadius}px`,
                boxShadow: localForm.showShadow ? '0 25px 50px -12px rgba(0,0,0,0.15)' : 'none',
                display: 'flex',
                flexDirection: previewMode === 'mobile' || localForm.layout === 'standard' || localForm.layout === 'image-top' 
                  ? 'column' 
                  : (localForm.layout === 'split-right' ? 'row-reverse' : 'row'),
                overflow: 'hidden',
                transition: 'width 0.3s ease, max-width 0.3s ease'
              }}
              className="transition-all duration-300"
            >
              {localForm.layout !== 'standard' && localForm.imageUrl && (!localForm.hideImageOnMobile || previewMode !== 'mobile') && (
                <div 
                  style={{
                    flex: previewMode === 'mobile' || localForm.layout === 'image-top' ? 'none' : '1',
                    height: previewMode === 'mobile' || localForm.layout === 'image-top' ? '200px' : 'auto',
                    backgroundImage: `url(${localForm.imageUrl})`,
                    backgroundSize: localForm.imageFit || 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#f3f4f6'
                  }}
                />
              )}

              <div 
                style={{
                  flex: '1',
                  padding: `${localForm.padding}px`,
                }}
              >
                <h3 className="text-2xl font-bold mb-2 leading-tight">{localForm.title || 'Заголовок'}</h3>
                <p className="text-sm opacity-70 mb-8 leading-relaxed">{localForm.subtitle || 'Подзаголовок формы'}</p>
                
                <div className="space-y-4">
                  {localForm.fields.map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs font-bold opacity-80">{field.label}{field.required && ' *'}</label>
                      {field.type === 'dealer-readonly' ? (
                        <div className="w-full rounded-lg px-4 py-3 text-sm font-semibold opacity-70 truncate" style={{ backgroundColor: localForm.inputBackgroundColor, border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}` }}>
                          VOGE LONCIN MEGAMOTO (Пример)
                        </div>
                      ) : field.type === 'model-select' ? (
                        <div className="space-y-2">
                          <select disabled className="w-full rounded-lg px-4 py-3 text-sm appearance-none" style={{ backgroundColor: localForm.inputBackgroundColor, border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}` }}>
                            <option>Выберите категорию</option>
                            <option>Мотоциклы</option>
                            <option>Квадроциклы</option>
                          </select>
                          <select disabled className="w-full rounded-lg px-4 py-3 text-sm appearance-none" style={{ backgroundColor: localForm.inputBackgroundColor, border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}` }}>
                            <option>Выберите модель</option>
                          </select>
                        </div>
                      ) : field.type === 'city-dealer' ? (
                        <div className="space-y-2">
                            <select disabled className="w-full rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: localForm.inputBackgroundColor, border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}` }}>
                                <option>Выберите город</option>
                            </select>
                            <select disabled className="w-full rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: localForm.inputBackgroundColor, border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}` }}>
                                <option>Выберите дилера</option>
                            </select>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea 
                          placeholder={field.placeholder}
                          disabled
                          style={{ 
                            backgroundColor: localForm.inputBackgroundColor,
                            border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}`
                          }}
                          className="w-full rounded-lg px-4 py-3 text-sm min-h-[80px]"
                        />
                      ) : (
                        <input 
                          type={field.type} 
                          placeholder={field.placeholder}
                          disabled
                          style={{ 
                            backgroundColor: localForm.inputBackgroundColor,
                            border: `${localForm.inputBorderWidth}px solid ${localForm.inputBorderColor}`
                          }}
                          className="w-full rounded-lg px-4 py-3 text-sm"
                        />
                      )}
                    </div>
                  ))}
                  
                  <button 
                    style={{
                      backgroundColor: localForm.buttonColor,
                      color: localForm.buttonTextColor,
                    }}
                    className="w-full py-4 rounded-lg font-bold text-base mt-4 shadow-lg shadow-black/5"
                  >
                    Отправить
                  </button>
                  <div className="text-center mt-6">
                    <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{localForm.footerText || 'Powered by LeadFlow'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leads = ({ leads, forms, deals, onCreateDeal, onUpdateDeal, onUpdateLead, onAddLead }: { 
  leads: Lead[], 
  forms: Form[],
  deals: Deal[],
  onCreateDeal: (leadId: string) => void,
  onUpdateDeal: (id: string, updates: Partial<Deal>) => void,
  onUpdateLead: (id: string, updates: Partial<Lead>) => void,
  onAddLead: (data: any) => Promise<void>
}) => {
  const [filter, setFilter] = useState({
    status: 'all',
    source: 'all',
    medium: 'all',
    campaign: 'all',
    content: 'all',
    term: 'all',
    type: 'all',
    search: '',
    city: 'all',
    device: 'all',
    page_url: 'all',
    gender: 'all',
    model: 'all'
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState(filter);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, dateRange, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = filter.status === 'all' || lead.status === filter.status;
      const matchesSource = filter.source === 'all' || (lead.source_normalized || normalizeSource(lead.utm_source || 'Direct')) === filter.source;
      const matchesMedium = filter.medium === 'all' || (lead.utm_medium || 'Direct') === filter.medium;
      const matchesCampaign = filter.campaign === 'all' || (lead.utm_campaign || 'None') === filter.campaign;
      const matchesContent = filter.content === 'all' || (lead.utm_content || 'None') === filter.content;
      const matchesTerm = filter.term === 'all' || (lead.utm_term || 'None') === filter.term;
      const matchesType = filter.type === 'all' || lead.type === filter.type;
      const matchesCity = filter.city === 'all' || (lead.city || 'None') === filter.city;
      const matchesDevice = filter.device === 'all' || (lead.device || 'Desktop') === filter.device;
      const matchesPage = filter.page_url === 'all' || (lead.page_url || 'None') === filter.page_url;
      const matchesGender = filter.gender === 'all' || (lead.gender || 'Not set') === filter.gender;
      const matchesModel = filter.model === 'all' || (lead.model || 'None') === filter.model;

      const matchesSearch = 
        String(lead.name || '').toLowerCase().includes(filter.search.toLowerCase()) ||
        String(lead.phone || '').includes(filter.search) ||
        String(lead.email || '').toLowerCase().includes(filter.search.toLowerCase());
      
      const leadDate = (lead.timestamp || '').split('T')[0];
      const matchesDate = leadDate && leadDate >= dateRange.start && leadDate <= dateRange.end;

      return matchesStatus && matchesSource && matchesMedium && matchesCampaign && 
             matchesContent && matchesTerm && matchesType && matchesCity && 
             matchesDevice && matchesPage && matchesGender && matchesModel && matchesSearch && matchesDate;
    }).sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (sortConfig.key === 'timestamp') {
        const aTime = new Date(aValue).getTime();
        const bTime = new Date(bValue).getTime();
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, filter, dateRange, sortConfig]);

  const uniqueValues = useMemo(() => {
    return {
      sources: Array.from(new Set(leads.map(l => l.source_normalized || normalizeSource(l.utm_source || 'Direct')))),
      mediums: Array.from(new Set(leads.map(l => l.utm_medium || 'Direct'))),
      campaigns: Array.from(new Set(leads.map(l => l.utm_campaign || 'None'))),
      contents: Array.from(new Set(leads.map(l => l.utm_content || 'None'))),
      terms: Array.from(new Set(leads.map(l => l.utm_term || 'None'))),
      cities: Array.from(new Set(leads.map(l => l.city || 'None'))),
      devices: Array.from(new Set(leads.map(l => l.device || 'Desktop'))),
      pages: Array.from(new Set(leads.map(l => l.page_url || 'None'))),
      genders: Array.from(new Set(leads.map(l => l.gender || 'Not set'))),
      models: Array.from(new Set(leads.map(l => l.model || 'None')))
    };
  }, [leads]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in-progress': return 'В работе';
      case 'closed': return 'Закрыт';
      case 'rejected': return 'Отказ';
      default: return status;
    }
  };

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const stats = useMemo(() => {
    const total = filteredLeads.length;
    const uniquePhones = new Set(filteredLeads.map(l => l.phone).filter(Boolean));
    const unique = uniquePhones.size;
    
    // Heuristic for "target" leads: those that are not rejected and have some interaction
    const targetLeads = filteredLeads.filter(l => l.status !== 'rejected');
    const target = targetLeads.length;
    
    const uniqueTargetPhones = new Set(targetLeads.map(l => l.phone).filter(Boolean));
    const uniqueTarget = uniqueTargetPhones.size;

    const men = filteredLeads.filter(l => l.gender === 'Male' || l.gender === 'Мужчина').length;
    const women = filteredLeads.filter(l => l.gender === 'Female' || l.gender === 'Женщина').length;
    const undefinedGender = total - men - women;

    const failedLeads = filteredLeads.filter(l => l.status === 'rejected');
    const failed = failedLeads.length;
    const failedCalls = failedLeads.filter(l => l.type === 'call').length;
    const failedForms = failedLeads.filter(l => l.type === 'form').length;
    const failedPercent = total > 0 ? (failed / total) * 100 : 0;

    const noSourceLeads = filteredLeads.filter(l => {
      const normalized = l.source_normalized || normalizeSource(l.utm_source);
      return normalized === 'Other';
    });
    const noSource = noSourceLeads.length;
    const noSourceCalls = noSourceLeads.filter(l => l.type === 'call').length;
    const noSourceForms = noSourceLeads.filter(l => l.type === 'form').length;
    const noSourcePercent = total > 0 ? (noSource / total) * 100 : 0;

    return {
      total,
      unique,
      target,
      uniqueTarget,
      men,
      women,
      undefinedGender,
      failed,
      failedPercent,
      failedCalls,
      failedForms,
      noSource,
      noSourcePercent,
      noSourceCalls,
      noSourceForms,
      calls: filteredLeads.filter(l => l.type === 'call').length,
      forms: filteredLeads.filter(l => l.type === 'form').length,
      new: filteredLeads.filter(l => l.status === 'new').length,
      inProgress: filteredLeads.filter(l => l.status === 'in-progress').length,
      closed: filteredLeads.filter(l => l.status === 'closed').length,
      rejected: filteredLeads.filter(l => l.status === 'rejected').length,
      conversion: total > 0 ? Math.round((filteredLeads.filter(l => l.status === 'closed').length / total) * 100) : 0
    };
  }, [filteredLeads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Журнал лидов</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end} 
            onChange={(range) => setDateRange(range)} 
          />
          <button 
            disabled={isSimulating}
            onClick={async () => {
              setIsSimulating(true);
              try {
                await onAddLead({
                  name: 'Входящий звонок',
                  phone: '+7 (999) 000-00-00',
                  type: 'call',
                  utm_source: 'google',
                  utm_medium: 'organic'
                });
              } finally {
                setIsSimulating(false);
              }
            }}
            className={cn(
              "bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 flex items-center gap-2 transition-all",
              isSimulating && "opacity-50 cursor-not-allowed"
            )}
          >
            <Phone className={cn("w-4 h-4", isSimulating && "animate-bounce")} />
            {isSimulating ? 'Добавление...' : 'Симуляция звонка'}
          </button>
          <label className={cn(
            "bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-all",
            isImporting && "opacity-50 cursor-not-allowed"
          )}>
            <Upload className={cn("w-4 h-4", isImporting && "animate-spin")} />
            {isImporting ? 'Импорт...' : 'Импорт JSON'}
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              disabled={isImporting}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                setIsImporting(true);
                try {
                  const text = await file.text();
                  const json = JSON.parse(text);
                  
                  const excelDateToJSDate = (serialStr: string) => {
                    try {
                      const parts = serialStr.split(' ');
                      const days = parseFloat(parts[0]);
                      const time = parseFloat((parts[1] || '0').replace(',', '.'));
                      const serial = days + time;
                      
                      const utc_days  = Math.floor(serial - 25569);
                      const utc_value = utc_days * 86400;
                      const date_info = new Date(utc_value * 1000);

                      const fractional_day = serial - Math.floor(serial) + 0.0000001;
                      let total_seconds = Math.floor(86400 * fractional_day);
                      const seconds = total_seconds % 60;
                      total_seconds -= seconds;
                      const hours = Math.floor(total_seconds / (60 * 60));
                      const minutes = Math.floor(total_seconds / 60) % 60;

                      return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
                    } catch {
                      return new Date();
                    }
                  };

                  const importedLeads = json.map((row: any) => {
                    const timestamp = row.created_at ? excelDateToJSDate(row.created_at).toISOString() : new Date().toISOString();
                    
                    return {
                      ...row,
                      name: row.name || 'Без имени',
                      phone: String(row.phone || ''),
                      email: row.email || '',
                      utm_source: row.utm_source === '<не указано>' ? (row.source === '(direct)' ? 'Direct' : row.source) : row.utm_source,
                      utm_medium: row.utm_medium === '<не указано>' ? null : row.utm_medium,
                      utm_campaign: row.utm_campaign === '<не указано>' ? null : row.utm_campaign,
                      utm_content: row.utm_content === '<не указано>' ? null : row.utm_content,
                      utm_term: row.utm_term === '<не указано>' ? null : row.utm_term,
                      timestamp,
                      status: 'new',
                      type: row.type === 'звонок' ? 'call' : 'form',
                      city: row.city,
                      model: row.utm_campaign && row.utm_campaign.includes('vogemodel') ? 'Voge' : null
                    };
                  });
                  
                  const res = await fetch('/api/leads/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leads: importedLeads })
                  });

                  if (!res.ok) throw new Error('Failed to import');
                  
                  window.location.reload();
                } catch (err) {
                  console.error('Failed to import leads', err);
                  alert('Ошибка при импорте JSON. Проверьте формат файла.');
                  setIsImporting(false);
                }
              }} 
            />
          </label>
          <button 
            onClick={() => {
              setTempFilter(filter);
              setIsFilterModalOpen(true);
            }}
            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Фильтровать
            {Object.values(filter).filter(v => v !== 'all' && v !== '').length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {Object.values(filter).filter(v => v !== 'all' && v !== '').length}
              </span>
            )}
          </button>
          <label className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Импорт заявки
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const data = await file.arrayBuffer();
              const workbook = XLSX.read(data, { type: 'array', cellDates: true });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(worksheet);
              
              const importedLeads = json.map((row: any) => {
                let timestamp = new Date().toISOString();
                if (row['Дата']) {
                  const d = new Date(row['Дата']);
                  if (!isNaN(d.getTime())) {
                    timestamp = d.toISOString();
                  }
                }
                
                return {
                  name: row['ФИО'] || row['Name'] || 'Без имени',
                  phone: row['Телефон'] || row['Phone'] || '',
                  email: row['Почта'] || row['Email'] || '',
                  utm_source: row['Источник'] || row['Source'] || 'Excel Import',
                  timestamp,
                  status: 'new',
                  type: 'form'
                };
              });
              
              try {
                await fetch('/api/leads/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ leads: importedLeads, type: 'form' })
                });
                window.location.reload();
              } catch (err) {
                console.error('Failed to import leads', err);
                alert('Ошибка при импорте заявок');
              }
            }} />
          </label>
          <label className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Импорт звонки
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const data = await file.arrayBuffer();
              const workbook = XLSX.read(data, { type: 'array', cellDates: true });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(worksheet);
              
              const importedLeads = json.map((row: any) => {
                let timestamp = new Date().toISOString();
                if (row['Дата']) {
                  const d = new Date(row['Дата']);
                  if (!isNaN(d.getTime())) {
                    timestamp = d.toISOString();
                  }
                }

                return {
                  name: row['Звонивший'] || 'Без имени',
                  phone: row['Звонивший'] || '',
                  utm_source: row['Источник'] || 'Excel Import',
                  timestamp,
                  status: row['Статус'] === 'Удачный' ? 'closed' : 'new',
                  type: 'call'
                };
              });
              
              try {
                await fetch('/api/leads/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ leads: importedLeads, type: 'call' })
                });
                window.location.reload();
              } catch (err) {
                console.error('Failed to import leads', err);
                alert('Ошибка при импорте звонков');
              }
            }} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {[
            { id: 'call', label: 'Звонки' },
            { id: 'form', label: 'Заявки' },
            { id: 'all', label: 'Все лиды' },
            { id: 'deals', label: 'Сделки' },
            { id: 'clients', label: 'Клиенты' },
            { id: 'chats', label: 'Чаты' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (['all', 'call', 'form'].includes(tab.id)) {
                  setFilter({ ...filter, type: tab.id });
                }
              }}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
                (filter.type === tab.id || (tab.id === 'all' && filter.type === 'all'))
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {(filter.type === tab.id || (tab.id === 'all' && filter.type === 'all')) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Total Leads Card */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <Users className="w-5 h-5 text-blue-500" />
              Всего лидов
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  Уникальные
                </div>
                <span className="font-bold text-gray-900">{stats.unique}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Целевые
                </div>
                <span className="font-bold text-gray-900">{stats.target}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  Уникально-целевые
                </div>
                <span className="font-bold text-gray-900">{stats.uniqueTarget}</span>
              </div>
            </div>

            <div className="space-y-3 border-l border-gray-100 pl-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Мужчин
                </div>
                <span className="font-bold text-gray-900">{stats.men}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-3.5 h-3.5 text-pink-400" />
                  Женщин
                </div>
                <span className="font-bold text-gray-900">{stats.women}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-3.5 h-3.5 text-gray-300" />
                  Не определен
                </div>
                <span className="font-bold text-gray-900">{stats.undefinedGender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Leads Card */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Несостоявшиеся лиды
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
          </div>
          
          <div className="flex justify-end mb-2">
            <span className="text-sm font-bold text-red-600">{stats.failedPercent.toFixed(2)}%</span>
          </div>
          
          <div className="w-full bg-red-50 h-4 rounded-sm overflow-hidden mb-4">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.failedPercent, 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">В среднем за месяц</span>
              <span className="font-bold text-gray-900">27.87%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Норма</span>
              <span className="font-bold text-gray-900">6%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Из них заявок</span>
              <span className="font-bold text-gray-900">{stats.failedForms}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Из них звонков</span>
              <span className="font-bold text-gray-900">{stats.failedCalls}</span>
            </div>
          </div>
        </div>

        {/* No Source Card */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <HelpCircle className="w-5 h-5 text-red-500" />
              Лиды без источника
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.noSource}</span>
          </div>
          
          <div className="flex justify-end mb-2">
            <span className="text-sm font-bold text-red-600">{stats.noSourcePercent.toFixed(2)}%</span>
          </div>
          
          <div className="w-full bg-red-50 h-4 rounded-sm overflow-hidden mb-4">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.noSourcePercent, 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">В среднем за месяц</span>
              <span className="font-bold text-gray-900">2.98%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Норма</span>
              <span className="font-bold text-gray-900">4%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Из них заявок</span>
              <span className="font-bold text-gray-900">{stats.noSourceForms}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Из них звонков</span>
              <span className="font-bold text-gray-900">{stats.noSourceCalls}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск по имени, телефону или email..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-black/5"
          />
        </div>
        {Object.values(filter).some(v => v !== 'all' && v !== '') && (
          <button 
            onClick={() => setFilter({
              status: 'all', source: 'all', medium: 'all', campaign: 'all',
              content: 'all', term: 'all', type: 'all', search: '',
              city: 'all', device: 'all', page_url: 'all', gender: 'all', model: 'all'
            })}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Сбросить всё
          </button>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Фильтры</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Настройте параметры отображения лидов</p>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Основные параметры */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Основные</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Статус</label>
                    <select 
                      value={tempFilter.status}
                      onChange={(e) => setTempFilter({ ...tempFilter, status: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все статусы</option>
                      <option value="new">Новые</option>
                      <option value="in-progress">В работе</option>
                      <option value="closed">Закрытые</option>
                      <option value="rejected">Отказы</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Тип лида</label>
                    <select 
                      value={tempFilter.type}
                      onChange={(e) => setTempFilter({ ...tempFilter, type: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все типы</option>
                      <option value="form">Заявка с формы</option>
                      <option value="call">Звонок</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Пол</label>
                    <select 
                      value={tempFilter.gender}
                      onChange={(e) => setTempFilter({ ...tempFilter, gender: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Любой</option>
                      {uniqueValues.genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* Маркетинг */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Маркетинг</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Источник (utm_source)</label>
                    <select 
                      value={tempFilter.source}
                      onChange={(e) => setTempFilter({ ...tempFilter, source: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все источники</option>
                      {uniqueValues.sources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Канал (utm_medium)</label>
                    <select 
                      value={tempFilter.medium}
                      onChange={(e) => setTempFilter({ ...tempFilter, medium: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все каналы</option>
                      {uniqueValues.mediums.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Кампания (utm_campaign)</label>
                    <select 
                      value={tempFilter.campaign}
                      onChange={(e) => setTempFilter({ ...tempFilter, campaign: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все кампании</option>
                      {uniqueValues.campaigns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Объявление (utm_content)</label>
                    <select 
                      value={tempFilter.content}
                      onChange={(e) => setTempFilter({ ...tempFilter, content: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все объявления</option>
                      {uniqueValues.contents.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Технические и Гео */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Технические и Гео</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Модель</label>
                    <select 
                      value={tempFilter.model}
                      onChange={(e) => setTempFilter({ ...tempFilter, model: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все модели</option>
                      {uniqueValues.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Город</label>
                    <select 
                      value={tempFilter.city}
                      onChange={(e) => setTempFilter({ ...tempFilter, city: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все города</option>
                      {uniqueValues.cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Устройство</label>
                    <select 
                      value={tempFilter.device}
                      onChange={(e) => setTempFilter({ ...tempFilter, device: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все устройства</option>
                      {uniqueValues.devices.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Страница входа</label>
                    <select 
                      value={tempFilter.page_url}
                      onChange={(e) => setTempFilter({ ...tempFilter, page_url: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
                    >
                      <option value="all">Все страницы</option>
                      {uniqueValues.pages.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setTempFilter({
                  status: 'all', source: 'all', medium: 'all', campaign: 'all',
                  content: 'all', term: 'all', type: 'all', search: '',
                  city: 'all', device: 'all', page_url: 'all', gender: 'all', model: 'all'
                })}
                className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => {
                    setFilter(tempFilter);
                    setIsFilterModalOpen(false);
                  }}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th 
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Дата
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'timestamp' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('type')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Тип
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'type' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Статус
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'status' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Клиент
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'name' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('model')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Модель
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'model' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('utm_source')}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Источник
                    <ArrowUpDown className={cn("w-3 h-3 transition-colors", sortConfig.key === 'utm_source' ? "text-black" : "text-gray-300")} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Сделка</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Лидов не найдено.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map(lead => {
                  const deal = deals.find(d => d.lead_id === lead.id);
                  return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium text-black">{new Date(lead.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] opacity-60">{new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {lead.type === 'call' ? (
                          <Phone className="w-4 h-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {lead.type === 'call' ? 'Звонок' : 'Форма'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        getStatusColor(lead.status)
                      )}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold text-black">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{lead.model || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        (lead.source_normalized || normalizeSource(lead.utm_source)) !== 'Other' ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {lead.source_normalized || normalizeSource(lead.utm_source)}
                      </span>
                      {lead.utm_source && (lead.source_normalized || normalizeSource(lead.utm_source)) !== lead.utm_source && (
                        <div className="text-[9px] text-gray-400 mt-0.5 italic">({lead.utm_source})</div>
                      )}
                      <div className="text-[10px] opacity-60 mt-1 truncate max-w-[100px]">{lead.utm_campaign || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {deal ? (
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase w-fit",
                            deal.status === 'new' ? 'bg-blue-100 text-blue-700' :
                            deal.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            deal.status === 'won' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {deal.status === 'new' ? 'Новая' :
                             deal.status === 'in_progress' ? 'В работе' :
                             deal.status === 'won' ? 'Успешно' : 'Отказ'}
                          </span>
                          <span className="text-xs font-bold text-gray-700">{deal.amount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCreateDeal(lead.id)}
                          className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Создать
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors border border-gray-100"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[#f9f7f4] border-t border-gray-100 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
                Предыдущая страница
              </button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 9;
                  
                  if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 5) {
                      for (let i = 1; i <= 7; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 4) {
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      pages.push('...');
                      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((p, i) => (
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => setCurrentPage(p as number)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all",
                          currentPage === p ? "bg-gray-200 text-black" : "text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                Наверх
              </button>

              <div className="h-4 w-px bg-gray-200 hidden md:block" />

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Показать:</span>
                <div className="relative group">
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="appearance-none bg-transparent pr-8 pl-2 py-1 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 строк</option>
                    <option value={25}>25 строк</option>
                    <option value={50}>50 строк</option>
                    <option value={100}>100 строк</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              <div className="h-4 w-px bg-gray-200 hidden md:block" />

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
              >
                Следующая
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Карточка лида</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">ID: {selectedLead.id}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Информация о клиенте</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Тип обращения</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              onUpdateLead(selectedLead.id, { type: 'form' });
                              setSelectedLead({ ...selectedLead, type: 'form' });
                            }}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                              selectedLead.type === 'form' ? "border-black bg-gray-50" : "border-gray-100 text-gray-400"
                            )}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">Форма</span>
                          </button>
                          <button 
                            onClick={() => {
                              onUpdateLead(selectedLead.id, { type: 'call' });
                              setSelectedLead({ ...selectedLead, type: 'call' });
                            }}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                              selectedLead.type === 'call' ? "border-black bg-gray-50" : "border-gray-100 text-gray-400"
                            )}
                          >
                            <Phone className="w-4 h-4" />
                            <span className="text-xs font-bold">Звонок</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs text-gray-500">Имя</span>
                        <span className="text-sm font-bold">{selectedLead.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs text-gray-500">Телефон</span>
                        <span className="text-sm font-bold">{selectedLead.phone}</span>
                      </div>
                      {selectedLead.email && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs text-gray-500">Email</span>
                          <span className="text-sm font-bold">{selectedLead.email}</span>
                        </div>
                      )}
                      {Object.keys(selectedLead)
                        .filter(key => ![
                          'id', 'form_id', 'name', 'phone', 'email', 'timestamp', 
                          'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 
                          'referrer', 'page_url', 'status', 'type', 'notes',
                          'session_id', 'product', 'dealer_id'
                        ].includes(key))
                        .map(key => {
                          const form = forms.find(f => f.id === selectedLead.form_id);
                          const field = form?.fields.find(f => f.id === key);
                          let label = field ? field.label : key.replace(/_/g, ' ');
                          if (key === 'city') label = 'Город';
                          if (key === 'dealer') label = 'Дилер';
                          if (key === 'category') label = 'Категория';
                          if (key === 'model') label = 'Модель';
                          return (
                            <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                              <span className="text-xs text-gray-500 capitalize">{label}</span>
                              <span className="text-sm font-bold">{selectedLead[key]}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Статус и заметки</h4>
                    <div className="space-y-3">
                      <select 
                        value={selectedLead.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as Lead['status'];
                          onUpdateLead(selectedLead.id, { status: newStatus });
                          setSelectedLead({ ...selectedLead, status: newStatus });
                        }}
                        className={cn(
                          "w-full border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black/5",
                          getStatusColor(selectedLead.status)
                        )}
                      >
                        <option value="new">Новый</option>
                        <option value="in-progress">В работе</option>
                        <option value="closed">Закрыт</option>
                        <option value="rejected">Отказ</option>
                      </select>
                      <textarea 
                        placeholder="Добавить заметку..."
                        value={selectedLead.notes || ''}
                        onChange={(e) => {
                          onUpdateLead(selectedLead.id, { notes: e.target.value });
                          setSelectedLead({ ...selectedLead, notes: e.target.value });
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 h-32 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Маркетинговые данные</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Источник', value: selectedLead.utm_source },
                        { label: 'Канал', value: selectedLead.utm_medium },
                        { label: 'Кампания', value: selectedLead.utm_campaign },
                        { label: 'Контент', value: selectedLead.utm_content },
                        { label: 'Ключевое слово', value: selectedLead.utm_term },
                        { label: 'Категория', value: selectedLead.category },
                        { label: 'Модель', value: selectedLead.model },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-start py-2 border-b border-gray-50">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</span>
                          <span className="text-xs font-medium text-right max-w-[150px] truncate">{item.value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Технические данные</h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Страница захвата</span>
                        <div className="text-[10px] font-mono bg-gray-50 p-2 rounded-lg break-all leading-relaxed">
                          {selectedLead.page_url}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Referrer</span>
                        <div className="text-[10px] font-mono bg-gray-50 p-2 rounded-lg break-all leading-relaxed">
                          {selectedLead.referrer || 'Direct'}
                        </div>
                      </div>
                      {selectedLead.product && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Заголовок страницы (H1)</span>
                          <div className="text-[10px] font-mono bg-gray-50 p-2 rounded-lg break-all leading-relaxed">
                            {selectedLead.product}
                          </div>
                        </div>
                      )}
                      {selectedLead.dealer_id && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">ID Дилера</span>
                          <div className="text-[10px] font-mono bg-gray-50 p-2 rounded-lg break-all leading-relaxed">
                            {selectedLead.dealer_id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedLead(null)}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Installation = () => {
  const host = window.location.origin;
  const mainScript = `<script async src="${host}/widget.js"></script>`;
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mainScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Код для вставки на сайт</h2>
        <p className="text-gray-500">Скопируйте и установите этот код на все страницы вашего сайта перед тегом &lt;/body&gt; или в &lt;head&gt;.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Основной скрипт</span>
            {copied && <span className="text-xs font-bold text-green-500 animate-in fade-in">Скопировано!</span>}
          </div>
          <div className="bg-black text-white p-6 rounded-xl font-mono text-sm relative group overflow-x-auto">
            <code>{mainScript}</code>
            <button 
              onClick={handleCopy}
              className="absolute right-4 top-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 space-y-4">
          <h3 className="font-bold text-lg">Как это работает?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">1</div>
              <p className="text-sm font-bold">Установите скрипт один раз</p>
              <p className="text-xs text-gray-500 leading-relaxed">Скрипт универсальный. Установите его один раз, и все изменения форм будут автоматически применяться на сайте.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</div>
              <p className="text-sm font-bold">Настройте триггеры</p>
              <p className="text-xs text-gray-500 leading-relaxed">В настройках формы укажите CSS-селектор (например, <code>.order-btn</code>), и форма будет автоматически открываться по клику.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MousePointer2 className="w-5 h-5 text-green-400" />
          Альтернативный вызов (JS)
        </h3>
        <p className="text-sm text-gray-400">Если вы не используете CSS-селекторы, вы можете вызывать форму вручную через атрибут <code>onclick</code>:</p>
        <div className="bg-white/10 p-4 rounded-xl font-mono text-xs text-gray-300">
          {`<button onclick="window.openLeadForm('default-form')">Заказать звонок</button>`}
        </div>
        
        <div className="pt-4 border-t border-white/10 space-y-4">
          <h4 className="font-bold text-sm text-green-400">Передача данных (например, дилера)</h4>
          <p className="text-sm text-gray-400">Вы можете передать дополнительные данные в форму. Если в форме есть поле "Дилер (Только чтение)", оно автоматически отобразит переданное значение:</p>
          <div className="bg-white/10 p-4 rounded-xl font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre">
            {`<button onclick="window.openLeadForm('dealer-form', { dealer: 'VOGE LONCIN MEGAMOTO', dealer_id: 'megamoto_msk' })">\n  Связаться с дилером\n</button>`}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestPage = () => {
  const host = window.location.origin;
  const testUrl = `${host}/test-leadflow`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Тест-драйв</h2>
          <p className="text-gray-500 mt-1">Проверьте работу ваших форм на реальной странице</p>
        </div>
        <a 
          href={testUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          Открыть в новом окне
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 bg-white px-3 py-1 rounded-md border border-gray-200 text-[10px] font-mono text-gray-400 w-64 truncate">
                  {testUrl}
                </div>
              </div>
            </div>
            <div className="aspect-video bg-gray-100 relative group">
              <iframe 
                src={testUrl} 
                className="w-full h-full border-none"
                title="LeadFlow Test Sandbox"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Как тестировать?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Настройте форму</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Перейдите в раздел "Формы" и укажите CSS селектор (например, <code className="bg-gray-100 px-1 rounded">.btn-order</code>).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Кликните по кнопке</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">На тестовой странице слева кликните по кнопке с соответствующим классом.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Проверьте лиды</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">После отправки формы новый лид мгновенно появится в разделе "Лиды".</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Настройка кнопок:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-white px-2 py-1 border border-gray-200 rounded">.btn-order</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Основная форма</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-white px-2 py-1 border border-gray-200 rounded">.btn-consult</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Форма дилера</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-8 rounded-3xl text-white space-y-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold leading-tight">Проверка UTM-меток</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Вы можете добавить UTM-метки к URL тестовой страницы, чтобы проверить, как они сохраняются в лидах.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ settings, onSave }: { settings: Settings, onSave: (s: Settings) => void }) => {
  const [webhook, setWebhook] = useState(settings.bitrixWebhook || '');
  const [ymId, setYmId] = useState(settings.yandexMetricaId || '');
  const [ymToken, setYmToken] = useState(settings.yandexMetricaToken || '');
  const [ymClientId, setYmClientId] = useState(settings.yandexMetricaClientId || '');
  const [ymEnabled, setYmEnabled] = useState(settings.yandexMetricaEnabled || false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ status: 'ok' | 'error', message: string, counters?: { id: number, name: string }[] } | null>(null);

  const handleSave = () => {
    onSave({
      bitrixWebhook: webhook,
      yandexMetricaId: ymId,
      yandexMetricaToken: ymToken,
      yandexMetricaEnabled: ymEnabled,
      yandexMetricaClientId: ymClientId
    });
  };

  const checkConnection = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch(`/api/analytics/metrica/check?token=${encodeURIComponent(ymToken)}`);
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          setCheckResult({ status: 'ok', message: data.message, counters: data.counters });
        } else {
          let msg = data.error || 'Connection failed';
          if (ymToken === '9b53bd81cddd42700a30c9b9be1524b9') {
            msg = 'Вы используете пример токена. Пожалуйста, получите свой собственный токен в Яндекс.OAuth.';
          }
          setCheckResult({ status: 'error', message: msg });
        }
      } else {
        const text = await res.text();
        console.error("[Settings] Received non-JSON response:", text.substring(0, 100));
        setCheckResult({ 
          status: 'error', 
          message: `Ошибка сервера (${res.status}): Некорректный формат ответа` 
        });
      }
    } catch (e) {
      console.error(e);
      setCheckResult({ status: 'error', message: 'Network error' });
    } finally {
      setChecking(false);
    }
  };

  const oauthUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${ymClientId || 'CLIENT_ID'}&scope=metrika:read`;

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold">Настройки интеграций</h2>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-[#2fc6f6] rounded-xl flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <div>
            <h3 className="font-bold text-lg">Bitrix24</h3>
            <p className="text-sm text-gray-500">Автоматическое создание лидов в CRM</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input 
              type="text" 
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://your-domain.bitrix24.ru/rest/1/your-token/"
              className={cn(
                "w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5",
                webhook && !webhook.includes('/rest/') ? "border-red-300 bg-red-50" : "border-gray-200"
              )}
            />
            {webhook && !webhook.includes('/rest/') && (
              <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-wider">
                URL должен содержать /rest/
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Создайте входящий вебхук в Bitrix24 с правами на "CRM"
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff0000] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              Я
            </div>
            <div>
              <h3 className="font-bold text-lg">Яндекс.Метрика</h3>
              <p className="text-sm text-gray-500">Передача звонков и оффлайн-конверсий</p>
            </div>
          </div>
          <button 
            onClick={() => setYmEnabled(!ymEnabled)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              ymEnabled ? "bg-red-500" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              ymEnabled ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID счетчика</label>
              <input 
                type="text" 
                value={ymId}
                onChange={(e) => setYmId(e.target.value)}
                placeholder="95927232"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client ID (OAuth)</label>
              <input 
                type="text" 
                value={ymClientId}
                onChange={(e) => setYmClientId(e.target.value)}
                placeholder="Ваш Client ID"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OAuth-токен</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={ymToken}
                onChange={(e) => setYmToken(e.target.value)}
                placeholder="Ваш OAuth токен"
                className={cn(
                  "flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5",
                  ymToken === '9b53bd81cddd42700a30c9b9be1524b9' ? "border-amber-300 bg-amber-50" : "border-gray-200"
                )}
              />
              <button 
                onClick={checkConnection}
                disabled={checking || !ymToken}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {checking ? '...' : 'Проверить'}
              </button>
            </div>
            {ymToken === '9b53bd81cddd42700a30c9b9be1524b9' && (
              <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">
                Внимание: используется демонстрационный токен
              </p>
            )}
            {checkResult && (
              <div className="mt-2 space-y-2">
                <p className={cn(
                  "text-xs font-medium",
                  checkResult.status === 'ok' ? "text-green-600" : "text-red-600"
                )}>
                  {checkResult.message}
                </p>
                {checkResult.status === 'ok' && checkResult.counters && checkResult.counters.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2">Доступные счетчики:</p>
                    <div className="space-y-1">
                      {checkResult.counters.map(c => (
                        <div key={c.id} className="flex justify-between items-center text-[10px]">
                          <span className="font-medium text-green-800">{c.name}</span>
                          <code className="bg-green-100 px-1 rounded text-green-700">{c.id}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                1. Зарегистрируйте приложение в <a href="https://oauth.yandex.ru/" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">Яндекс.OAuth</a> с правами <b>metrika:read</b>.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                2. Получите токен по ссылке: <a href={oauthUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:underline break-all">Авторизоваться в Яндексе</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-black text-white px-12 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
        >
          Сохранить все настройки
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Другие интеграции</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'AmoCRM', status: 'Soon' },
            { name: 'Telegram', status: 'Soon' },
            { name: 'Google Sheets', status: 'Soon' },
            { name: 'Google Analytics', status: 'Soon' },
            { name: 'Calltouch', status: 'Soon' },
          ].map(item => (
            <div key={item.name} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-1 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
              <span className="text-sm font-bold">{item.name}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const Analytics = ({ leads, deals, settings }: { leads: Lead[], deals: Deal[], settings: Settings }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<'source' | 'campaign'>('source');
  const [metricaData, setMetricaData] = useState<any>(null);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSelectionDone = useRef(false);

  const fetchMetricaData = async () => {
    if (!settings.yandexMetricaEnabled || !settings.yandexMetricaId || !settings.yandexMetricaToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/metrica?date1=${dateRange.start}&date2=${dateRange.end}`);
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch Metrica data');
        console.log('[Analytics] Received Metrica data:', result);
        setMetricaData(result);
      } else {
        const text = await res.text();
        console.error("[Analytics] Received non-JSON response:", text.substring(0, 100));
        if (res.status === 403) {
          throw new Error("Доступ запрещен (403). Проверьте OAuth-токен в настройках.");
        }
        throw new Error(`Ошибка сервера (${res.status}): Некорректный формат ответа`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCosts = async () => {
    try {
      const res = await fetch('/api/costs');
      if (res.ok) {
        const data = await res.json();
        setCosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch costs:', err);
    }
  };

  useEffect(() => {
    fetchMetricaData();
    fetchCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, settings]);

  const allSources = useMemo(() => {
    const sources = new Set<string>();
    
    // From leads
    leads.forEach(l => {
      const date = (l.timestamp || '').split('T')[0];
      if (date && date >= dateRange.start && date <= dateRange.end) {
        sources.add(l.source_normalized || normalizeSource(l.utm_source || 'Direct'));
      }
    });
    
    // From Metrica
    if (metricaData?.data?.data) {
      metricaData.data.data.forEach((row: any) => {
        const dim = row.dimensions?.[0];
        const name = (dim?.name || dim || 'Direct').toString().trim();
        if (name) sources.add(name);
      });
    }
    
    // Filter out demo/unwanted sources
    return Array.from(sources).filter(source => 
      source && !['google', 'facebook', 'yandex', 'Direct'].includes(source)
    );
  }, [leads, metricaData, dateRange]);
  
  useEffect(() => {
    // Only auto-select all sources on initial data load
    if (!initialSelectionDone.current && allSources.length > 0 && metricaData) {
      setSelectedSources(allSources);
      initialSelectionDone.current = true;
    }
  }, [allSources, metricaData]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const leadsInDateRange = leads.filter(l => {
    const date = (l.timestamp || '').split('T')[0];
    return date && date >= dateRange.start && date <= dateRange.end;
  });

  const dealsInDateRange = deals.filter(d => {
    const date = (d.created_at || '').split('T')[0];
    return date && date >= dateRange.start && date <= dateRange.end;
  });

  const wonDeals = deals.filter(d => d.status === 'won');
  const averageWonAmount = wonDeals.length > 0 
    ? wonDeals.reduce((acc, d) => acc + d.amount, 0) / wonDeals.length 
    : 0;

  // Helper to calculate stats for a set of leads and Metrica data
  const calculateStats = (sourceLeads: Lead[], sourceName: string, engineName?: string) => {
    const leadsCount = sourceLeads.length;
    const closedLeads = sourceLeads.filter(l => l.status === 'closed').length;
    
    // Calculate deals and revenue
    let dealsCount = 0;
    let revenue = 0;
    let lostCount = 0;
    sourceLeads.forEach(lead => {
      const deal = dealsInDateRange.find(d => d.lead_id === lead.id);
      if (deal && deal.status !== 'new') {
        dealsCount++;
        if (deal.status === 'won') {
          revenue += deal.amount;
        } else if (deal.status === 'lost') {
          lostCount++;
        }
      }
    });
    
    const lostValue = lostCount * averageWonAmount;
    
    // Find matching Metrica data
    let visits = 0;
    let users = 0;
    let bounceRate = 0;
    let pageDepth = 0;
    let avgVisitDurationSeconds = 0;
    let goalReaches = 0;
    let metricaRevenue = 0;
    let conversionRate = 0;

    if (metricaData?.data?.data) {
      const sNameTrimmed = sourceName.trim();
      const eNameTrimmed = engineName?.trim();

      const matches = metricaData.data.data.filter((row: any) => {
        const dim0 = row.dimensions?.[0];
        const dim1 = row.dimensions?.[1];
        const rowSource = (dim0?.name || dim0 || 'Direct').toString().trim();
        const rowEngine = (dim1?.name || dim1 || '').toString().trim();
        
        if (eNameTrimmed) return rowSource === sNameTrimmed && rowEngine === eNameTrimmed;
        return rowSource === sNameTrimmed;
      });
      
      visits = matches.reduce((acc: number, row: any) => acc + (row.metrics[0] || 0), 0);
      users = matches.reduce((acc: number, row: any) => acc + (row.metrics[1] || 0), 0);
      goalReaches = matches.reduce((acc: number, row: any) => acc + (row.metrics[5] || 0), 0);
      metricaRevenue = matches.reduce((acc: number, row: any) => acc + (row.metrics[6] || 0), 0);
      
      // For rates and depth we take weighted average by visits
      if (visits > 0) {
        bounceRate = matches.reduce((acc: number, row: any) => acc + (row.metrics[2] || 0) * (row.metrics[0] || 0), 0) / visits;
        pageDepth = matches.reduce((acc: number, row: any) => acc + (row.metrics[3] || 0) * (row.metrics[0] || 0), 0) / visits;
        avgVisitDurationSeconds = matches.reduce((acc: number, row: any) => acc + (row.metrics[4] || 0) * (row.metrics[0] || 0), 0) / visits;
        conversionRate = matches.reduce((acc: number, row: any) => acc + (row.metrics[7] || 0) * (row.metrics[0] || 0), 0) / visits;
      }
    }

    const formatTime = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return '0 м 0 с';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m} м ${s} с`;
    };
    
    // Calculate costs for this source/campaign
    let totalCost = 0;
    const filteredCosts = costs.filter(c => {
      const isDateInRange = c.date >= dateRange.start && c.date <= dateRange.end;
      if (!isDateInRange) return false;
      
      const sMatch = c.source_normalized === sourceName;
      if (engineName) {
        return sMatch && c.campaign_normalized === engineName;
      }
      return sMatch;
    });
    totalCost = filteredCosts.reduce((acc, c) => acc + c.cost, 0);

    const cpl = leadsCount > 0 ? totalCost / leadsCount : 0;
    const cpa = dealsCount > 0 ? totalCost / dealsCount : 0;
    const roi = totalCost > 0 ? (revenue / totalCost) * 100 : 0;

    return {
      leadsCount,
      closedLeads,
      dealsCount,
      revenue,
      lostCount,
      lostValue,
      visits,
      users,
      bounceRate: bounceRate.toFixed(2),
      pageDepth: pageDepth.toFixed(2),
      timeOnSite: formatTime(avgVisitDurationSeconds),
      goalReaches,
      metricaRevenue,
      conversionRate: conversionRate.toFixed(2),
      cost: totalCost,
      cpl,
      cpa,
      roi
    };
  };

  // Stats by source with children (engines)
  const analyticsData = allSources.map(source => {
    const sourceLeads = leadsInDateRange.filter(l => (l.source_normalized || normalizeSource(l.utm_source || 'Direct')) === source);
    const mainStats = calculateStats(sourceLeads, source);
    
    // Group campaigns for this source
    const campaignsMap: Record<string, Lead[]> = {};
    sourceLeads.forEach(l => {
      const cName = l.campaign_normalized || normalizeCampaign(l.utm_campaign);
      if (!campaignsMap[cName]) campaignsMap[cName] = [];
      campaignsMap[cName].push(l);
    });

    const campaigns = Object.entries(campaignsMap).map(([cName, cLeads]) => ({
      name: cName,
      ...calculateStats(cLeads, source, cName)
    })).sort((a, b) => b.visits - a.visits);

    // Get real engines from Metrica if available
    const engines: any[] = [];
    if (metricaData?.data?.data) {
      const sourceRows = metricaData.data.data.filter((row: any) => (row.dimensions[0]?.name || 'Direct') === source);
      const engineNames = Array.from(new Set(sourceRows.map((row: any) => row.dimensions[1]?.name).filter(Boolean)));
      
      engineNames.forEach((engineName: any) => {
        engines.push({
          name: engineName,
          ...calculateStats([], source, engineName)
        });
      });
    }

    return {
      source,
      ...mainStats,
      children: engines,
      campaigns
    };
  }).sort((a, b) => b.visits - a.visits);

  // Chart data (visits over time from Metrica)
  const getDaysArray = (start: string, end: string) => {
    const days = [];
    const [sY, sM, sD] = start.split('-').map(Number);
    const [eY, eM, eD] = end.split('-').map(Number);
    
    const current = new Date(Date.UTC(sY, sM - 1, sD));
    const target = new Date(Date.UTC(eY, eM - 1, eD));
    
    while (current <= target) {
      const y = current.getUTCFullYear();
      const m = String(current.getUTCMonth() + 1).padStart(2, '0');
      const d = String(current.getUTCDate()).padStart(2, '0');
      days.push(`${y}-${m}-${d}`);
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
  };

  const days = getDaysArray(dateRange.start, dateRange.end);
  
  const sourceNameToId = useMemo(() => {
    const map: Record<string, string> = {};
    if (metricaData?.data?.data) {
      metricaData.data.data.forEach((row: any) => {
        const dim0 = row.dimensions?.[0];
        if (dim0 && typeof dim0 === 'object' && dim0.name && dim0.id) {
          map[dim0.name.trim().toLowerCase()] = dim0.id;
        }
      });
    }
    return map;
  }, [metricaData]);

  const chartData = useMemo(() => {
    if (!metricaData?.daily?.time_intervals || !metricaData?.daily?.data) {
      if (metricaData?.data?.data) {
        return days.map(date => ({ date, 'Всего': 0 }));
      }
      return [];
    }

    const intervals = metricaData.daily.time_intervals;
    const dailyRows = metricaData.daily.data;

    return days.map((date, idx) => {
      const dayData: any = { date };
      
      let intervalIndex = intervals.findIndex((interval: any) => {
        const start = String(interval[0] || '');
        return start.includes(date);
      });

      if (intervalIndex === -1 && intervals.length === days.length) {
        intervalIndex = idx;
      }

      if (intervalIndex !== -1) {
        selectedSources.forEach((selectedKey) => {
          if (selectedKey === 'Всего') {
            const totals = metricaData.daily.totals;
            if (totals) {
              const totalMetrics = Array.isArray(totals[0]) ? totals[0] : totals;
              dayData['Всего'] = Number(totalMetrics[intervalIndex]) || 0;
            } else {
              dayData['Всего'] = 0;
            }
            return;
          }

          if (selectedKey.includes(':::')) {
            const [sName, eName] = selectedKey.split(':::').map(s => s.trim().toLowerCase());
            const targetSId = sourceNameToId[sName];
            
            const row = dailyRows.find((r: any) => {
              const dim0 = r.dimensions?.[0];
              const dim1 = r.dimensions?.[1];
              const rSName = (dim0?.name || dim0 || 'Direct').toString().trim().toLowerCase();
              const rSId = dim0?.id || '';
              const rEName = (dim1?.name || dim1 || '').toString().trim().toLowerCase();
              return (rSName === sName || (targetSId && rSId === targetSId)) && rEName === eName;
            });

            if (row && row.metrics) {
              const metricValues = Array.isArray(row.metrics[0]) ? row.metrics[0] : row.metrics;
              dayData[selectedKey] = Number(metricValues[intervalIndex]) || 0;
            } else {
              dayData[selectedKey] = 0;
            }
          } else {
            const sName = selectedKey.trim().toLowerCase();
            const targetSId = sourceNameToId[sName];

            const rows = dailyRows.filter((r: any) => {
              const dim0 = r.dimensions?.[0];
              const rSName = (dim0?.name || dim0 || 'Direct').toString().trim().toLowerCase();
              const rSId = dim0?.id || '';
              return rSName === sName || (targetSId && rSId === targetSId);
            });

            dayData[selectedKey] = rows.reduce((acc: number, r: any) => {
              let val = 0;
              if (r.metrics) {
                const metricValues = Array.isArray(r.metrics[0]) ? r.metrics[0] : r.metrics;
                val = Number(metricValues[intervalIndex]) || 0;
              }
              return acc + val;
            }, 0);
          }
        });
      } else {
        selectedSources.forEach(key => {
          dayData[key] = 0;
        });
      }
      
      return dayData;
    });
  }, [days, metricaData, selectedSources, sourceNameToId]);

  if (!settings.yandexMetricaEnabled) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-[#ff0000]">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold">Яндекс.Метрика не подключена</h3>
        <p className="text-gray-500 max-w-md">Для отображения реальных данных по трафику и сквозной аналитики необходимо настроить интеграцию в разделе «Настройки».</p>
        <button 
          onClick={() => window.location.hash = '#settings'} // This won't work easily with current state, but user can navigate
          className="bg-black text-white px-8 py-3 rounded-xl font-bold"
        >
          Перейти в настройки
        </button>
      </div>
    );
  }

  if (loading && !metricaData) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Сквозная аналитика</h2>
          <p className="text-gray-500 mt-1">Отслеживайте эффективность ваших рекламных каналов</p>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs animate-in slide-in-from-top-1">
              <AlertCircle className="w-3 h-3" />
              Ошибка Яндекс.Метрики: {error}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end} 
            onChange={(range) => setDateRange(range)} 
          />

          <div className="relative">
            <button 
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Фильтровать
              {selectedSources.length < allSources.length && (
                <span className="bg-white text-black w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {selectedSources.length}
                </span>
              )}
            </button>

            {showFilterModal && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in zoom-in-95 duration-200">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Источники трафика</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {allSources.map(source => (
                      <label key={source} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedSources.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSources([...selectedSources, source]);
                            } else {
                              setSelectedSources(selectedSources.filter(s => s !== source));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{source}</span>
                      </label>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => setSelectedSources(allSources)}
                      className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      Все
                    </button>
                    <button 
                      onClick={() => setSelectedSources([])}
                      className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      Сброс
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    className="w-full bg-black text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    Готово
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg">Источники, сводка</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                allowDecimals={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              {selectedSources.map((sourceKey, idx) => {
                let color = '';
                let label = sourceKey;
                let strokeWidth = 2;
                
                if (sourceKey === 'Всего') {
                  color = '#8b5cf6';
                  label = 'Всего';
                  strokeWidth = 3;
                } else if (sourceKey.includes(':::')) {
                  const [sName, eName] = sourceKey.split(':::');
                  // Try to find parent index for color consistency
                  const parentIdx = allSources.indexOf(sName);
                  color = `hsl(${(parentIdx * 137.5) + (idx * 30)}, 60%, 65%)`;
                  label = eName;
                } else {
                  const sIdx = allSources.indexOf(sourceKey);
                  color = `hsl(${sIdx * 137.5}, 70%, 50%)`;
                }

                return (
                  <Line 
                    key={sourceKey}
                    type="monotone" 
                    dataKey={sourceKey} 
                    name={label}
                    stroke={color} 
                    strokeWidth={strokeWidth}
                    dot={false}
                    activeDot={{ r: sourceKey === 'Всего' ? 6 : 4, strokeWidth: 0 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-sm text-gray-700">Группировка:</h3>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setAnalyticsGroupBy('source')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${analyticsGroupBy === 'source' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                По источникам
              </button>
              <button 
                onClick={() => setAnalyticsGroupBy('campaign')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${analyticsGroupBy === 'campaign' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                По кампаниям
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-left">
                  {analyticsGroupBy === 'source' ? 'Источник трафика (детально) › Тип площадки' : 'Источник › Кампания'}
                </th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Визиты &darr;</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Посетители</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Отказы</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Глубина просмотра</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Время на сайте</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Достижения избранных целей</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Доход по целям, ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Сделки</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Доход по сделкам, ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right text-red-500">Потери (кол-во)</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right text-red-500">Потери (оценка), ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Конверсия посетителей по избранным целям</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">Расход, ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">CPL, ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">CPA, ₽</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500 text-right">ROI, %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analyticsData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {loading ? 'Загрузка данных из Яндекс.Метрики...' : 'Нет данных для отображения. Проверьте настройки интеграции или выберите источники в фильтре.'}
                  </td>
                </tr>
              ) : (
                <>
                  {/* Total Row */}
                  <tr className="bg-[#f8f9fa] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors ${selectedSources.length === analyticsData.length + 1 ? 'bg-blue-600 border-blue-600' : 'border border-gray-300 hover:border-gray-400'}`}
                          onClick={() => {
                            if (selectedSources.length === analyticsData.length + 1) {
                              setSelectedSources([]);
                            } else {
                              const allSourceKeys = ['Всего', ...analyticsData.map(d => d.source)];
                              setSelectedSources(allSourceKeys);
                            }
                          }}
                        >
                          {selectedSources.length === analyticsData.length + 1 && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="font-medium text-[13px] text-gray-900">Итого и средние</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="text-gray-900">{analyticsData.reduce((a, b) => a + b.visits, 0).toLocaleString()}</div>
                      <div className="text-gray-400 text-[11px]">100.00%</div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="text-gray-900">{analyticsData.reduce((a, b) => a + b.users, 0).toLocaleString()}</div>
                      <div className="text-gray-400 text-[11px]">100.00%</div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">
                      {(analyticsData.reduce((a, b) => a + parseFloat(b.bounceRate) * b.visits, 0) / Math.max(1, analyticsData.reduce((a, b) => a + b.visits, 0))).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">
                      {(analyticsData.reduce((a, b) => a + parseFloat(b.pageDepth) * b.visits, 0) / Math.max(1, analyticsData.reduce((a, b) => a + b.visits, 0))).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">-</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{analyticsData.reduce((a, b) => a + b.goalReaches, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{analyticsData.reduce((a, b) => a + b.metricaRevenue, 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-[13px] text-purple-600 font-bold text-right">{analyticsData.reduce((a, b) => a + b.dealsCount, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-emerald-600 font-bold text-right">{analyticsData.reduce((a, b) => a + b.revenue, 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-[13px] text-red-600 font-bold text-right">{analyticsData.reduce((a, b) => a + b.lostCount, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-red-600 font-bold text-right">{analyticsData.reduce((a, b) => a + b.lostValue, 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">
                      {(analyticsData.reduce((a, b) => a + parseFloat(b.conversionRate) * b.visits, 0) / Math.max(1, analyticsData.reduce((a, b) => a + b.visits, 0))).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right font-bold">{analyticsData.reduce((a, b) => a + b.cost, 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">
                      {(analyticsData.reduce((a, b) => a + b.cost, 0) / Math.max(1, analyticsData.reduce((a, b) => a + b.leadsCount, 0))).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right">
                      {(analyticsData.reduce((a, b) => a + b.cost, 0) / Math.max(1, analyticsData.reduce((a, b) => a + b.dealsCount, 0))).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 text-right font-bold">
                      {analyticsData.reduce((a, b) => a + b.cost, 0) > 0 
                        ? ((analyticsData.reduce((a, b) => a + b.revenue, 0) / analyticsData.reduce((a, b) => a + b.cost, 0)) * 100).toFixed(2) 
                        : '-'}%
                    </td>
                  </tr>
                  
                  {analyticsData.map((row, i) => {
                    const totalVisits = Math.max(1, analyticsData.reduce((a, b) => a + b.visits, 0));
                    const totalUsers = Math.max(1, analyticsData.reduce((a, b) => a + b.users, 0));
                    
                    return (
                      <React.Fragment key={row.source}>
                        <tr className="hover:bg-gray-50 transition-colors group border-t border-gray-100">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {(analyticsGroupBy === 'source' ? row.children.length > 0 : row.campaigns.length > 0) ? (
                                <button 
                                  onClick={() => toggleRow(row.source)}
                                  className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                  {expandedRows.includes(row.source) ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  )}
                                </button>
                              ) : <div className="w-4 h-4" />}
                              
                              <div 
                                className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors ${selectedSources.includes(row.source) ? 'bg-blue-600 border-blue-600' : 'border border-gray-300 hover:border-gray-400'}`}
                                onClick={() => {
                                  if (selectedSources.includes(row.source)) {
                                    setSelectedSources(selectedSources.filter(s => s !== row.source));
                                  } else {
                                    setSelectedSources([...selectedSources, row.source]);
                                  }
                                }}
                              >
                                {selectedSources.includes(row.source) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: `hsl(${i * 137.5}, 70%, 50%)` }} />
                              <span className="text-[13px] text-gray-900">{row.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-right">
                            <div className="text-gray-900">{row.visits.toLocaleString()}</div>
                            <div className="text-gray-400 text-[11px]">{((row.visits / totalVisits) * 100).toFixed(2)}%</div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-right">
                            <div className="text-gray-900">{row.users.toLocaleString()}</div>
                            <div className="text-gray-400 text-[11px]">{((row.users / totalUsers) * 100).toFixed(2)}%</div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.bounceRate}%</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.pageDepth}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.timeOnSite}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.goalReaches.toLocaleString()}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.metricaRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-[13px] text-purple-600 font-bold text-right">{row.dealsCount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-[13px] text-emerald-600 font-bold text-right">{row.revenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-[13px] text-red-600 font-bold text-right">{row.lostCount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-[13px] text-red-600 font-bold text-right">{row.lostValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.conversionRate}%</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right font-bold">{row.cost > 0 ? row.cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.cost > 0 ? row.cpl.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right">{row.cost > 0 ? row.cpa.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-900 text-right font-bold">{row.cost > 0 ? row.roi.toFixed(2) + '%' : '-'}</td>
                        </tr>
                        {expandedRows.includes(row.source) && analyticsGroupBy === 'source' && row.children.map((child: any, childIdx: number) => {
                          const childKey = `${row.source}:::${child.name}`;
                          return (
                            <tr key={childKey} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-2 pl-12">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors ${selectedSources.includes(childKey) ? 'bg-blue-600 border-blue-600' : 'border border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => {
                                      if (selectedSources.includes(childKey)) {
                                        setSelectedSources(selectedSources.filter(s => s !== childKey));
                                      } else {
                                        setSelectedSources([...selectedSources, childKey]);
                                      }
                                    }}
                                  >
                                    {selectedSources.includes(childKey) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: `hsl(${(i * 137.5) + (childIdx * 30)}, 60%, 65%)` }} />
                                  <span className="text-[13px] text-gray-600">{child.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-right">
                                <div className="text-gray-900">{child.visits.toLocaleString()}</div>
                                <div className="text-gray-400 text-[11px]">{((child.visits / totalVisits) * 100).toFixed(2)}%</div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-right">
                                <div className="text-gray-900">{child.users.toLocaleString()}</div>
                                <div className="text-gray-400 text-[11px]">{((child.users / totalUsers) * 100).toFixed(2)}%</div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.bounceRate}%</td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.pageDepth}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.timeOnSite}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.goalReaches.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.metricaRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-purple-600 font-bold text-right">{child.dealsCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-emerald-600 font-bold text-right">{child.revenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-red-600 font-bold text-right">{child.lostCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-red-600 font-bold text-right">{child.lostValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-900 text-right">{child.conversionRate}%</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{child.cost > 0 ? child.cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{child.cost > 0 ? child.cpl.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{child.cost > 0 ? child.cpa.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{child.cost > 0 ? child.roi.toFixed(2) + '%' : '-'}</td>
                            </tr>
                          );
                        })}
                        {expandedRows.includes(row.source) && analyticsGroupBy === 'campaign' && row.campaigns.map((camp: any, campIdx: number) => {
                          return (
                            <tr key={`${row.source}-${camp.name}`} className="hover:bg-gray-50 transition-colors bg-blue-50/10">
                              <td className="px-4 py-2 pl-12">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                                  <span className="text-[13px] font-medium text-gray-600">{camp.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-right">
                                <div className="text-gray-900 font-medium">{camp.visits.toLocaleString()}</div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-right">
                                <div className="text-gray-900">{camp.users.toLocaleString()}</div>
                              </td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.bounceRate}%</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.pageDepth}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.timeOnSite}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.goalReaches.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.metricaRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-purple-600 font-bold text-right">{camp.dealsCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-emerald-600 font-bold text-right">{camp.revenue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-red-600 font-bold text-right">{camp.lostCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-[13px] text-red-600 font-bold text-right">{camp.lostValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-600 text-right">{camp.conversionRate}%</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.cost > 0 ? camp.cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.cost > 0 ? camp.cpl.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.cost > 0 ? camp.cpa.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                              <td className="px-4 py-2 text-[13px] text-gray-500 text-right">{camp.cost > 0 ? camp.roi.toFixed(2) + '%' : '-'}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ModelsManager = () => {
  const [modelsData, setModelsData] = useState<Record<string, Array<{ name: string, enabled: boolean }>>>({ "Мотоциклы": [], "Квадроциклы": [] });
  const [newModel, setNewModel] = useState('');
  const [bulkModelsText, setBulkModelsText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Мотоциклы');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModelsData(data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveModels = async (updatedData: Record<string, Array<{ name: string, enabled: boolean }>>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        setModelsData(updatedData);
      }
    } catch (error) {
      console.error('Failed to save models:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (newModel.trim() && !modelsData[selectedCategory]?.some(m => m.name === newModel.trim())) {
      const updatedData = {
        ...modelsData,
        [selectedCategory]: [...(modelsData[selectedCategory] || []), { name: newModel.trim(), enabled: true }]
      };
      saveModels(updatedData);
      setNewModel('');
    }
  };

  const handleBulkAdd = () => {
    if (!bulkModelsText.trim()) return;
    
    const lines = bulkModelsText.split('\n').map(l => l.trim()).filter(l => l !== '');
    const currentModels = modelsData[selectedCategory] || [];
    const currentNames = new Set(currentModels.map(m => m.name));
    
    const newModels = lines
      .filter(name => !currentNames.has(name))
      .map(name => ({ name, enabled: true }));
      
    if (newModels.length > 0) {
      const updatedData = {
        ...modelsData,
        [selectedCategory]: [...currentModels, ...newModels]
      };
      saveModels(updatedData);
      setBulkModelsText('');
      setShowBulkImport(false);
    }
  };

  const handleRemove = (category: string, modelName: string) => {
    const updatedData = {
      ...modelsData,
      [category]: modelsData[category].filter(m => m.name !== modelName)
    };
    saveModels(updatedData);
  };

  const handleToggleEnabled = (category: string, modelName: string) => {
    const updatedData = {
      ...modelsData,
      [category]: modelsData[category].map(m => 
        m.name === modelName ? { ...m, enabled: !m.enabled } : m
      )
    };
    saveModels(updatedData);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !modelsData[newCategory.trim()]) {
      const updatedData = {
        ...modelsData,
        [newCategory.trim()]: []
      };
      saveModels(updatedData);
      setNewCategory('');
      setSelectedCategory(newCategory.trim());
    }
  };

  const handleRemoveCategory = (category: string) => {
    const updatedData = { ...modelsData };
    delete updatedData[category];
    saveModels(updatedData);
    if (selectedCategory === category) {
      setSelectedCategory(Object.keys(updatedData)[0] || '');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка моделей...</div>;

  const categories = Object.keys(modelsData);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Модели и Категории</h2>
          <p className="text-gray-500 mt-1">Настройте список моделей, которые будут доступны в формах</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Название категории"
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm min-w-[200px]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              disabled={saving || !newCategory.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Categories */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">Категории</div>
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'
              }`}
            >
              <span className="font-bold text-sm truncate">{cat}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {modelsData[cat]?.length || 0}
                </span>
                {selectedCategory !== cat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Удалить категорию "${cat}" и все её модели?`)) {
                        handleRemoveCategory(cat);
                      }
                    }}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Models List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedCategory}</h3>
                  <p className="text-xs text-gray-400">Управление списком моделей в этой категории</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Добавить модель..."
                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm min-w-[250px]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button
                    onClick={handleAdd}
                    disabled={saving || !newModel.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showBulkImport ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">Загрузить списком</span>
                </button>
              </div>
            </div>

            {showBulkImport && (
              <div className="mb-6 p-5 bg-gray-50 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Загрузка списком</span>
                  <button onClick={() => setShowBulkImport(false)} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={bulkModelsText}
                  onChange={(e) => setBulkModelsText(e.target.value)}
                  placeholder="Вставьте список моделей (каждая с новой строки)..."
                  className="w-full h-32 p-4 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleBulkAdd}
                    disabled={saving || !bulkModelsText.trim()}
                    className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/90 disabled:opacity-30 transition-all flex items-center gap-2"
                  >
                    {saving ? 'Сохранение...' : 'Добавить список'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {(modelsData[selectedCategory] || []).map((model) => (
                  <div 
                    key={model.name} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                      model.enabled 
                        ? 'bg-white border-gray-100 hover:border-gray-200' 
                        : 'bg-gray-50/50 border-transparent opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleEnabled(selectedCategory, model.name)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          model.enabled 
                            ? 'bg-black border-black text-white' 
                            : 'bg-white border-gray-200 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-sm font-medium truncate ${model.enabled ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                        {model.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(selectedCategory, model.name)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {(!modelsData[selectedCategory] || modelsData[selectedCategory].length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-50 rounded-3xl">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm">Список моделей пуст</p>
                    <p className="text-xs opacity-60 mt-1">Добавьте первую модель, используя поле выше</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <span>Отображается в формах</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <span>Скрыто</span>
                </div>
              </div>
              <div>
                Всего моделей в категории: {modelsData[selectedCategory]?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DealersManager = () => {
  const [dealersData, setDealersData] = useState<Record<string, Array<{ name: string, enabled: boolean }>>>({ "Москва": [], "Санкт-Петербург": [] });
  const [newDealer, setNewDealer] = useState('');
  const [bulkDealersText, setBulkDealersText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('Москва');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/dealers');
      const data = await res.json();
      setDealersData(data);
      if (Object.keys(data).length > 0 && !data[selectedCity]) {
        setSelectedCity(Object.keys(data)[0]);
      }
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDealers = async (updatedData: Record<string, Array<{ name: string, enabled: boolean }>>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        setDealersData(updatedData);
      }
    } catch (error) {
      console.error('Failed to save dealers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (newDealer.trim() && !dealersData[selectedCity]?.some(d => d.name === newDealer.trim())) {
      const updatedData = {
        ...dealersData,
        [selectedCity]: [...(dealersData[selectedCity] || []), { name: newDealer.trim(), enabled: true }]
      };
      saveDealers(updatedData);
      setNewDealer('');
    }
  };

  const handleBulkAdd = () => {
    if (!bulkDealersText.trim()) return;
    
    const lines = bulkDealersText.split('\n').map(l => l.trim()).filter(l => l !== '');
    const currentDealers = dealersData[selectedCity] || [];
    const currentNames = new Set(currentDealers.map(d => d.name));
    
    const newDealers = lines
      .filter(name => !currentNames.has(name))
      .map(name => ({ name, enabled: true }));
      
    if (newDealers.length > 0) {
      const updatedData = {
        ...dealersData,
        [selectedCity]: [...currentDealers, ...newDealers]
      };
      saveDealers(updatedData);
      setBulkDealersText('');
      setShowBulkImport(false);
    }
  };

  const handleRemove = (city: string, dealerName: string) => {
    const updatedData = {
      ...dealersData,
      [city]: dealersData[city].filter(d => d.name !== dealerName)
    };
    saveDealers(updatedData);
  };

  const handleToggleEnabled = (city: string, dealerName: string) => {
    const updatedData = {
      ...dealersData,
      [city]: dealersData[city].map(d => 
        d.name === dealerName ? { ...d, enabled: !d.enabled } : d
      )
    };
    saveDealers(updatedData);
  };

  const handleAddCity = () => {
    if (newCity.trim() && !dealersData[newCity.trim()]) {
      const updatedData = {
        ...dealersData,
        [newCity.trim()]: []
      };
      saveDealers(updatedData);
      setNewCity('');
      setSelectedCity(newCity.trim());
    }
  };

  const handleRemoveCity = (city: string) => {
    const updatedData = { ...dealersData };
    delete updatedData[city];
    saveDealers(updatedData);
    if (selectedCity === city) {
      setSelectedCity(Object.keys(updatedData)[0] || '');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка дилеров...</div>;

  const cities = Object.keys(dealersData);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Дилеры и Города</h2>
          <p className="text-gray-500 mt-1">Настройте список дилеров, которые будут доступны в формах</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Название города"
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm min-w-[200px]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
            />
            <button
              onClick={handleAddCity}
              disabled={saving || !newCity.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Cities */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">Города</div>
          {cities.map(city => (
            <div
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                selectedCity === city 
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'
              }`}
            >
              <span className="font-bold text-sm truncate">{city}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCity === city ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {dealersData[city]?.length || 0}
                </span>
                {selectedCity !== city && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Удалить город "${city}" и всех его дилеров?`)) {
                        handleRemoveCity(city);
                      }
                    }}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dealers List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedCity}</h3>
                  <p className="text-xs text-gray-400">Управление списком дилеров в этом городе</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={newDealer}
                    onChange={(e) => setNewDealer(e.target.value)}
                    placeholder="Добавить дилера..."
                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm min-w-[250px]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button
                    onClick={handleAdd}
                    disabled={saving || !newDealer.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showBulkImport ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">Загрузить списком</span>
                </button>
              </div>
            </div>

            {showBulkImport && (
              <div className="mb-6 p-5 bg-gray-50 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Загрузка списком</span>
                  <button onClick={() => setShowBulkImport(false)} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={bulkDealersText}
                  onChange={(e) => setBulkDealersText(e.target.value)}
                  placeholder="Вставьте список дилеров (каждый с новой строки)..."
                  className="w-full h-32 p-4 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleBulkAdd}
                    disabled={saving || !bulkDealersText.trim()}
                    className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/90 disabled:opacity-30 transition-all flex items-center gap-2"
                  >
                    {saving ? 'Сохранение...' : 'Добавить список'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {(dealersData[selectedCity] || []).map((dealer) => (
                  <div 
                    key={dealer.name} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                      dealer.enabled 
                        ? 'bg-white border-gray-100 hover:border-gray-200' 
                        : 'bg-gray-50/50 border-transparent opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleEnabled(selectedCity, dealer.name)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          dealer.enabled 
                            ? 'bg-black border-black text-white' 
                            : 'bg-white border-gray-200 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-sm font-medium truncate ${dealer.enabled ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                        {dealer.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(selectedCity, dealer.name)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {(!dealersData[selectedCity] || dealersData[selectedCity].length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-50 rounded-3xl">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm">Список дилеров пуст</p>
                    <p className="text-xs opacity-60 mt-1">Добавьте первого дилера, используя поле выше</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <span>Отображается в формах</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <span>Скрыто</span>
                </div>
              </div>
              <div>Всего дилеров в городе: {dealersData[selectedCity]?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Deals = ({ deals, leads, onUpdateDeal }: { deals: Deal[], leads: Lead[], onUpdateDeal: (id: string, updates: Partial<Deal>) => void }) => {
  const getLead = (leadId: string) => leads.find(l => l.id === leadId);

  const statusColors = {
    'new': 'bg-blue-100 text-blue-700',
    'in_progress': 'bg-yellow-100 text-yellow-700',
    'won': 'bg-green-100 text-green-700',
    'lost': 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    'new': 'Новая',
    'in_progress': 'В работе',
    'won': 'Успешно',
    'lost': 'Отказ'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Сделки</h2>
          <p className="text-gray-500 mt-1">Управление сделками и доходами</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Дата</th>
                <th className="p-4 font-semibold">Лид</th>
                <th className="p-4 font-semibold">Модель</th>
                <th className="p-4 font-semibold">Дилер</th>
                <th className="p-4 font-semibold">Сумма</th>
                <th className="p-4 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Нет сделок. Создайте сделку из раздела "Лиды".
                  </td>
                </tr>
              ) : (
                deals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(deal => {
                  const lead = getLead(deal.lead_id);
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500">
                        {new Date(deal.created_at).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{lead?.name || 'Неизвестно'}</div>
                        <div className="text-gray-500 text-xs">{lead?.phone || ''}</div>
                      </td>
                      <td className="p-4 text-gray-600">{lead?.model || deal.model_id || '-'}</td>
                      <td className="p-4 text-gray-600">{lead?.dealer || deal.dealer_id || '-'}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={deal.amount || ''}
                          onChange={(e) => onUpdateDeal(deal.id, { amount: Number(e.target.value) })}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-black"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={deal.status}
                            onChange={(e) => onUpdateDeal(deal.id, { status: e.target.value as any })}
                            className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer appearance-none ${statusColors[deal.status]}`}
                          >
                            {Object.entries(statusLabels).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                          
                          {deal.status === 'lost' && (
                            <select
                              value={deal.loss_reason || ''}
                              onChange={(e) => onUpdateDeal(deal.id, { loss_reason: e.target.value as any })}
                              className="text-[10px] bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-red-300"
                            >
                              <option value="">Причина...</option>
                              <option value="price">Цена</option>
                              <option value="no_stock">Нет в наличии</option>
                              <option value="competitor">Ушли к конкуренту</option>
                              <option value="no_response">Не отвечает</option>
                              <option value="other">Другое</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [eventStats, setEventStats] = useState<{ new: number, processed: number, error: number }>({ new: 0, processed: 0, error: 0 });
  const [settings, setSettings] = useState<Settings>({ bitrixWebhook: '', yandexMetricaId: '', yandexMetricaToken: '', yandexMetricaEnabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJson = async (url: string) => {
          console.log(`[App] Fetching ${url}`);
          const res = await fetch(`${window.location.origin}${url}`);
          const contentType = res.headers.get("content-type");
          if (!res.ok) {
            const text = await res.text();
            console.error(`[App] Failed to fetch ${url}: ${res.status} ${text.substring(0, 100)}`);
            throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 100)}`);
          }
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          console.error(`[App] Expected JSON but received ${contentType} for ${url}`);
          throw new Error(`Expected JSON but received ${contentType}`);
        };

        const [formsRes, leadsRes, dealsRes, settingsRes, statsRes] = await Promise.all([
          fetchJson('/api/forms'),
          fetchJson('/api/leads'),
          fetchJson('/api/deals'),
          fetchJson('/api/settings'),
          fetchJson('/api/events/stats'),
        ]);
        setForms(formsRes);
        setLeads(leadsRes);
        setDeals(dealsRes);
        setEventStats(statsRes);
        setSettings(prevSettings => {
          if (JSON.stringify(settingsRes) !== JSON.stringify(prevSettings)) {
            return settingsRes;
          }
          return prevSettings;
        });
      } catch (err) {
        console.error("Failed to fetch data:", err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Poll for new leads/deals every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddForm = async (formData: any) => {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const newForm = await res.json();
    setForms([...forms, newForm]);
  };

  const handleDeleteForm = async (id: string) => {
    await fetch(`/api/forms/${id}`, { method: 'DELETE' });
    setForms(forms.filter(f => f.id !== id));
  };

  const handleUpdateForm = async (id: string, formData: any) => {
    const res = await fetch(`/api/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const updatedForm = await res.json();
    setForms(forms.map(f => f.id === id ? updatedForm : f));
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    const saved = await res.json();
    setSettings(saved);
    alert('Настройки сохранены!');
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updatedLead = await res.json();
    setLeads(leads.map(l => l.id === id ? updatedLead : l));
  };

  const handleAddLead = async (leadData: any) => {
    // Track lead event
    fetch("/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: leadData.ym_uid || "admin_manual",
        source: leadData.utm_source || "admin",
        event: "lead",
      }),
    }).catch(() => {});

    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await res.json();
      if (result.success) {
        // Fetch all leads again to ensure consistency or just add the new one
        const leadsRes = await fetch('/api/leads');
        if (leadsRes.ok && leadsRes.headers.get("content-type")?.includes("application/json")) {
          setLeads(await leadsRes.json());
        }
      }
    }
  };

  const handleCreateDeal = async (leadId: string) => {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId })
    });
    const newDeal = await res.json();
    setDeals([...deals, newDeal]);
  };

  const handleUpdateDeal = async (id: string, updates: Partial<Deal>) => {
    const res = await fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updatedDeal = await res.json();
    setDeals(deals.map(d => d.id === id ? updatedDeal : d));
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">LeadFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            <List className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard leads={leads} deals={deals} forms={forms} settings={settings} eventStats={eventStats} />}
          {activeTab === 'analytics' && <Analytics leads={leads} deals={deals} settings={settings} />}
          {activeTab === 'forms' && <Forms forms={forms} onAddForm={handleAddForm} onDeleteForm={handleDeleteForm} onUpdateForm={handleUpdateForm} />}
          {activeTab === 'leads' && <Leads leads={leads} forms={forms} deals={deals} onCreateDeal={handleCreateDeal} onUpdateDeal={handleUpdateDeal} onUpdateLead={handleUpdateLead} onAddLead={handleAddLead} />}
          {activeTab === 'deals' && <Deals deals={deals} leads={leads} onUpdateDeal={handleUpdateDeal} />}
          {activeTab === 'dealers' && <DealersManager />}
          {activeTab === 'models' && <ModelsManager />}
          {activeTab === 'installation' && <Installation />}
          {activeTab === 'test-page' && <TestPage />}
          {activeTab === 'settings' && <Settings settings={settings} onSave={handleSaveSettings} />}
        </div>
      </main>
    </div>
  );
}
