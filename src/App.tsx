import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Copy, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  BarChart3,
  TrendingUp,
  MousePointer2,
  Palette,
  Type,
  Square,
  Move,
  Check,
  X,
  Settings2,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  LayoutTemplate,
  Image as ImageIcon
} from 'lucide-react';
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
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
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
  createdAt: string;
}

interface Lead {
  id: string;
  form_id: string;
  name: string;
  phone: string;
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  page_url?: string;
  model?: string;
}

interface Settings {
  bitrixWebhook: string;
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'forms', label: 'Формы', icon: FileText },
    { id: 'leads', label: 'Лиды', icon: Users },
    { id: 'installation', label: 'Установка', icon: ExternalLink },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-bottom border-gray-100">
        <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          LeadFlow
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id 
                ? "bg-black text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-black"
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
  );
};

const Dashboard = ({ leads, forms }: { leads: Lead[], forms: Form[] }) => {
  const totalLeads = leads.length;
  
  // Stats by source
  const sourceData = leads.reduce((acc: any, lead) => {
    const source = lead.utm_source || 'Direct / Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(sourceData).map(name => ({
    name,
    value: sourceData[name]
  }));

  const COLORS = ['#000000', '#444444', '#888888', '#CCCCCC', '#EEEEEE'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Всего лидов</p>
          <h2 className="text-3xl font-bold">{totalLeads}</h2>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% с прошлой недели
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Активных форм</p>
          <h2 className="text-3xl font-bold">{forms.length}</h2>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            Все системы работают
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Конверсия (ср.)</p>
          <h2 className="text-3xl font-bold">4.2%</h2>
          <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
            -0.5% за сегодня
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Лиды по источникам (UTM Source)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
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
  const [isCreating, setIsCreating] = useState(false);

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
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{form.id}</p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteForm(form.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
                  const code = `<script src="${host}/widget.js"></script>\n<button onclick="openLeadForm('${form.id}')">Оставить заявку</button>`;
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
    createdAt: form.createdAt || '',
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
                      {field.type === 'textarea' ? (
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
                    <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Powered by LeadFlow</span>
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

const Leads = ({ leads }: { leads: Lead[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Список лидов</h2>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Источник</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Кампания</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Модель</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Лидов пока нет. Установите виджет на сайт, чтобы начать сбор.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(lead.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-black">{lead.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        lead.utm_source ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {lead.utm_source || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{lead.utm_campaign || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{lead.model || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
          {`<button onclick="openLeadForm('default-form')">Заказать звонок</button>`}
        </div>
      </div>
    </div>
  );
};

const Settings = ({ settings, onSave }: { settings: Settings, onSave: (s: Settings) => void }) => {
  const [webhook, setWebhook] = useState(settings.bitrixWebhook || '');

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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            <p className="text-xs text-gray-400 mt-2">
              Создайте входящий вебхук в Bitrix24 с правами на "CRM"
            </p>
          </div>
          
          <button 
            onClick={() => onSave({ bitrixWebhook: webhook })}
            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Сохранить настройки
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
        <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Скоро</h4>
        <div className="flex gap-4 opacity-40 grayscale">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium">AmoCRM</div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium">Telegram Bot</div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium">Google Sheets</div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [forms, setForms] = useState<Form[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>({ bitrixWebhook: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, leadsRes, settingsRes] = await Promise.all([
          fetch('/api/forms').then(r => r.json()),
          fetch('/api/leads').then(r => r.json()),
          fetch('/api/settings').then(r => r.json()),
        ]);
        setForms(formsRes);
        setLeads(leadsRes);
        setSettings(settingsRes);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Poll for new leads every 30 seconds
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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black font-sans selection:bg-black selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard leads={leads} forms={forms} />}
          {activeTab === 'forms' && <Forms forms={forms} onAddForm={handleAddForm} onDeleteForm={handleDeleteForm} onUpdateForm={handleUpdateForm} />}
          {activeTab === 'leads' && <Leads leads={leads} />}
          {activeTab === 'installation' && <Installation />}
          {activeTab === 'settings' && <Settings settings={settings} onSave={handleSaveSettings} />}
        </div>
      </main>
    </div>
  );
}
