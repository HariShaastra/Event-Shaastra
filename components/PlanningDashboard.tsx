
import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { EventPlan, EventFormData, Expense, MediaEntry, MediaType, FeedbackEntry, ParticipantRecord, BudgetCategory, DailyTask, ProcurementItem, ParticipantPass, SpreadsheetData, SpreadsheetRow, CustomModule } from '../types';
import { 
  Download, Edit3, Trash2, Plus, ShoppingBag, CheckSquare, Square, 
  MapPin, Calendar, Layout, Users, List, History, Camera, DollarSign, 
  ImageIcon, Star, X, Utensils, Link, ChevronRight, UserCheck, CheckCircle,
  MessageSquare, Send, Phone, Share2, PieChart as PieIcon, Info, Smartphone, Bell,
  FileText, Upload, Search, AlertCircle, Clock, Video
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { generateLogicalPlan, generateRegistrationId } from '../services/logicalEngine';

interface PlanningDashboardProps {
  plan: EventPlan;
  isOnline: boolean;
  t: any;
  originalData: EventFormData;
  onPlanUpdate: (newPlan: EventPlan) => void;
  appMode: 'organiser' | 'participant';
  savedPlans: EventPlan[];
}

const Spreadsheet = ({ 
  data, 
  onUpdate, 
  onRowAction, 
  actionLabel 
}: { 
  data: SpreadsheetData; 
  onUpdate?: (data: SpreadsheetData) => void; 
  onRowAction?: (row: any, idx: number) => void;
  actionLabel?: string;
}) => {
  const addRow = () => {
    if (!onUpdate) return;
    const newRow: any = {};
    data.headers.forEach(h => newRow[h] = '');
    onUpdate({ ...data, rows: [...data.rows, newRow] });
  };

  const updateCell = (rowIdx: number, header: string, value: string) => {
    if (!onUpdate) return;
    const newRows = [...data.rows];
    newRows[rowIdx] = { ...newRows[rowIdx], [header]: value };
    onUpdate({ ...data, rows: newRows });
  };

  const addColumn = () => {
    if (!onUpdate) return;
    const colName = prompt("Column Name:");
    if (colName && !data.headers.includes(colName)) {
      onUpdate({ ...data, headers: [...data.headers, colName] });
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {data.headers.map(h => (
              <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100">{h}</th>
            ))}
            {onRowAction && <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
              {data.headers.map(h => (
                <td key={h} className="p-2 border-r border-slate-50">
                  <input 
                    value={row[h] || ''} 
                    onChange={e => updateCell(idx, h, e.target.value)}
                    readOnly={!onUpdate}
                    className="w-full p-2 bg-transparent outline-none text-xs font-bold text-[#1e3a3a] focus:bg-white rounded-lg transition-all"
                  />
                </td>
              ))}
              {onRowAction && (
                <td className="p-2">
                  <button 
                    onClick={() => onRowAction(row, idx)}
                    className="px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all"
                  >
                    {actionLabel || 'Action'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {onUpdate && (
        <div className="p-4 flex gap-4 bg-slate-50/30">
          <button onClick={addRow} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all">
            <Plus size={14} /> Add Row
          </button>
          <button onClick={addColumn} className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-all">
            <Layout size={14} /> Add Column
          </button>
        </div>
      )}
    </div>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const PlanningDashboard: React.FC<PlanningDashboardProps> = ({ plan, isOnline, t, originalData, onPlanUpdate, appMode, savedPlans }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'tasks' | 'budget' | 'foodDecor' | 'media' | 'participants' | 'verify' | 'pass' | 'timeline' | 'search'>('blueprint');
  const [showManualVerifyModal, setShowManualVerifyModal] = useState(false);
  const [manualRegId, setManualRegId] = useState('');
  const [checkInCountdown, setCheckInCountdown] = useState<string | null>(null);

  React.useEffect(() => {
    const updateCountdown = () => {
      if (!plan.entryWindow || !plan.overview.eventDate) return;
      
      const [hours, minutes] = plan.entryWindow.split(':').map(Number);
      const openTime = new Date(plan.overview.eventDate);
      openTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const diff = openTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const mins = Math.ceil(diff / (1000 * 60));
        if (mins < 60) {
          setCheckInCountdown(`Check-In opens in ${mins} minutes`);
        } else {
          const hrs = Math.floor(mins / 60);
          setCheckInCountdown(`Check-In opens in ${hrs}h ${mins % 60}m`);
        }
      } else {
        setCheckInCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [plan.entryWindow, plan.overview.eventDate]);

  React.useEffect(() => {
    if (appMode === 'participant') {
      setActiveTab('pass');
    } else {
      setActiveTab('blueprint');
    }
  }, [appMode]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseInput, setExpenseInput] = useState<Partial<Expense>>({ description: '', amount: 0, category: 'Food', paidBy: '', authorNote: '' });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState<Partial<FeedbackEntry>>({ guestName: '', score: 5, comment: '' });
  const [showCustomFacilityModal, setShowCustomFacilityModal] = useState(false);
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
  const [customSectionInput, setCustomSectionInput] = useState<{ title: string; type: 'List' | 'Spreadsheet' | 'Text' }>({ title: '', type: 'List' });
  const [customFacilityInput, setCustomFacilityInput] = useState({ title: '', description: '' });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regContact, setRegContact] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      if (data.length > 1) {
        const headers = data[0].map(h => String(h));
        const rows = data.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        });
        
        // Auto-verify if headers match participant fields
        const newParticipants: ParticipantRecord[] = rows.map((row, idx) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: row.Name || row.name || 'Unknown',
          registrationId: row.RegistrationID || row.registrationId || generateRegistrationId(plan.overview.eventType, plan.overview.eventDate, (plan.participants?.length || 0) + idx + 1),
          status: 'Checked-In', // Auto-verify as requested
          timestamp: Date.now(),
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || ''
        }));
        
        onPlanUpdate({ ...plan, participants: [...(plan.participants || []), ...newParticipants] });
        showToast(`Imported & Verified ${newParticipants.length} guests!`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rows = results.data as any[];
        const newParticipants: ParticipantRecord[] = rows.map((row, idx) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: row.Name || row.name || 'Unknown',
          registrationId: row.RegistrationID || row.registrationId || generateRegistrationId(plan.overview.eventType, plan.overview.eventDate, (plan.participants?.length || 0) + idx + 1),
          status: 'Checked-In',
          timestamp: Date.now(),
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || ''
        }));
        onPlanUpdate({ ...plan, participants: [...(plan.participants || []), ...newParticipants] });
        showToast(`Imported & Verified ${newParticipants.length} guests!`);
      }
    });
  };

  const addCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    const newSection: CustomModule = {
      id: Math.random().toString(36).substr(2, 9),
      title: customSectionInput.title,
      type: customSectionInput.type,
      items: customSectionInput.type === 'List' ? [] : undefined,
      spreadsheet: customSectionInput.type === 'Spreadsheet' ? { headers: ['Column 1', 'Column 2'], rows: [{ 'Column 1': '', 'Column 2': '' }] } : undefined,
      text: customSectionInput.type === 'Text' ? '' : undefined
    };
    onPlanUpdate({ ...plan, customSections: [...(plan.customSections || []), newSection] });
    setShowCustomSectionModal(false);
    setCustomSectionInput({ title: '', type: 'List' });
    showToast("Section Added!");
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      plan.timeline?.forEach(e => {
        const [time, period] = e.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const eventTime = hours * 60 + minutes;
        
        if (eventTime - currentTime === 15) {
          showToast(`Reminder: ${e.title} starts in 15 mins!`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [plan.timeline]);

  const getBadge = (checkIns: number) => {
    if (checkIns >= 7) return t.badgePowerAttendee;
    if (checkIns >= 5) return t.badgeEnthusiast;
    if (checkIns >= 3) return t.badgeExplorer;
    if (checkIns >= 1) return t.badgeParticipant;
    return t.statusRegistered;
  };

  const badgeColors: Record<string, string> = {
    [t.statusRegistered]: 'bg-slate-100 text-slate-500',
    [t.badgeParticipant]: 'bg-emerald-100 text-emerald-600',
    [t.badgeExplorer]: 'bg-blue-100 text-blue-600',
    [t.badgeEnthusiast]: 'bg-purple-100 text-purple-600',
    [t.badgePowerAttendee]: 'bg-orange-100 text-orange-600'
  };

  const COLORS_PIE = ['#1e3a3a', '#d4af37', '#e67e22', '#64748b', '#94a3b8', '#cbd5e1'];

  const totalSpent = useMemo(() => plan.expenses?.reduce((a, b) => a + b.amount, 0) || 0, [plan.expenses]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MediaType = 'Image') => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const entry: MediaEntry = {
          id: Math.random().toString(36).substr(2, 9),
          url: type !== 'Note' ? reader.result as string : undefined,
          data: type === 'Note' ? reader.result as string : undefined,
          type,
          mimeType: file.type,
          timestamp: Date.now(),
          tag: 'Memory',
          name: file.name,
          size: file.size
        };
        onPlanUpdate({ ...plan, media: [...(plan.media || []), entry] });
      };
      if (type === 'Note') reader.readAsText(file as unknown as globalThis.Blob);
      else reader.readAsDataURL(file as unknown as globalThis.Blob);
    });
  };

  const handleGooglePhotosConnect = () => {
    // Placeholder for Google Photos OAuth flow
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'https://www.googleapis.com/auth/photoslibrary.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    const authWindow = window.open(authUrl, 'google_photos_auth', 'width=600,height=700');
    if (!authWindow) {
      showToast("Popup blocked! Please allow popups for Google Photos integration.");
    } else {
      showToast("Connecting to Google Photos...");
    }
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: expenseInput.description || '',
      amount: expenseInput.amount || 0,
      category: (expenseInput.category as any) || 'Food',
      paidBy: expenseInput.paidBy || 'Host',
      authorNote: expenseInput.authorNote || '',
      splitType: 'Equal'
    };
    onPlanUpdate({ ...plan, expenses: [...(plan.expenses || []), newExp] });
    setShowExpenseModal(false);
    setExpenseInput({ description: '', amount: 0, paidBy: '', authorNote: '' });
  };

  const addFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: FeedbackEntry = {
      id: feedbackInput.id || Math.random().toString(36).substr(2, 9),
      guestName: feedbackInput.guestName || 'Guest',
      score: feedbackInput.score || 5,
      category: 'General',
      comment: feedbackInput.comment || '',
      submittedAt: Date.now()
    };
    const current = [...(plan.feedback || [])];
    const index = current.findIndex(f => f.id === entry.id);
    if (index > -1) current[index] = entry;
    else current.push(entry);
    onPlanUpdate({ ...plan, feedback: current });
    setShowFeedbackModal(false);
    setFeedbackInput({ guestName: '', score: 5, comment: '' });
  };

  const downloadAsWord = () => {
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e3a3a; background: #fcfbf7; line-height: 1.6; }
            .header { border-bottom: 4px solid #e67e22; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { font-family: serif; font-size: 32px; margin: 0; color: #1e3a3a; }
            .meta { color: #64748b; font-size: 14px; margin-top: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            h2 { font-family: serif; font-size: 24px; border-left: 4px solid #e67e22; padding-left: 15px; margin-top: 40px; color: #1e3a3a; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; }
            th, td { border: 1px solid #f1f5f9; padding: 12px; text-align: left; font-size: 13px; }
            th { background: #1e3a3a; color: white; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .badge-orange { background: #ffedd5; color: #9a3412; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            .badge-emerald { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${plan.overview.eventType} Official Handbook</h1>
            <div class="meta">${plan.overview.location} • ${plan.overview.eventDate} • ${plan.overview.guestCount} Guests</div>
          </div>
          
          <h2>1. Strategic Timeline</h2>
          <table>
            <tr><th>Step</th><th>Action Required</th><th>Date</th></tr>
            ${plan.dailySchedule.map(s => `<tr><td><span class="badge badge-orange">${s.day}</span></td><td><strong>${s.task}</strong></td><td>${s.date}</td></tr>`).join('')}
          </table>

          <h2>2. Participant Database</h2>
          <table>
            <tr><th>Name</th><th>Registration ID</th><th>Status</th></tr>
            ${(plan.participants || []).map(p => `<tr><td>${p.name}</td><td><code>${p.registrationId}</code></td><td><span class="badge ${p.status === 'Checked-In' ? 'badge-emerald' : 'badge-blue'}">${p.status}</span></td></tr>`).join('')}
            ${(plan.participants || []).length === 0 ? '<tr><td colspan="3">No participants registered yet.</td></tr>' : ''}
          </table>

          <h2>3. Culinary Experience</h2>
          <table>
            <tr><th>Course / Selection</th></tr>
            ${plan.menu.selections.map(s => `<tr><td>${s}</td></tr>`).join('')}
          </table>

          <h2>4. Budget Allocation</h2>
          <table>
            <tr><th>Category</th><th>Percentage</th><th>Amount</th></tr>
            ${plan.budgetAllocation.map(b => `<tr><td>${b.category}</td><td>${b.percentage}%</td><td>₹${b.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
          </table>

          <h2>5. Expense Log</h2>
          <table>
            <tr><th>Description</th><th>Category</th><th>Amount</th><th>Paid By</th></tr>
            ${(plan.expenses || []).map(e => `<tr><td>${e.description}</td><td>${e.category}</td><td>₹${e.amount.toLocaleString('en-IN')}</td><td>${e.paidBy}</td></tr>`).join('')}
            ${(plan.expenses || []).length === 0 ? '<tr><td colspan="4">No expenses logged yet.</td></tr>' : ''}
          </table>

          <h2>6. Guest Feedback</h2>
          <table>
            <tr><th>Guest</th><th>Score</th><th>Comment</th></tr>
            ${(plan.feedback || []).map(f => `<tr><td>${f.guestName}</td><td>${f.score}/5</td><td>${f.comment}</td></tr>`).join('')}
            ${(plan.feedback || []).length === 0 ? '<tr><td colspan="3">No feedback received yet.</td></tr>' : ''}
          </table>

          <div class="footer">Generated via Event Shaastra Logic Engine • Cultural Handbooks Simplified • ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;
    const blob = new window.Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.overview.eventType}_Plan.doc`;
    link.click();
  };

  const toggleTask = (day: string) => {
    const current = plan.completedItems || [];
    const updated = current.includes(day) 
      ? current.filter(x => x !== day) 
      : [...current, day];
    onPlanUpdate({ ...plan, completedItems: updated });
  };

  const handleShare = (type: 'whatsapp' | 'sms') => {
    const text = `*${plan.overview.eventType} Blueprint*\n\nDate: ${plan.overview.eventDate}\nLocation: ${plan.overview.location}\n\nStrategic Timeline:\n${plan.dailySchedule.map(s => `- ${s.task} (${s.date})`).join('\n')}\n\nGenerated via Event Shaastra.`;
    const encoded = encodeURIComponent(text);
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } else {
      window.location.href = `sms:?body=${encoded}`;
    }
  };

  const startEditing = (section: string, value: any) => {
    setEditingSection(section);
    setEditValue(JSON.parse(JSON.stringify(value)));
  };

  const saveEdit = () => {
    if (!editingSection) return;
    const updatedPlan = { ...plan };
    if (editingSection === 'budget') updatedPlan.budgetAllocation = editValue;
    if (editingSection === 'tasks') updatedPlan.dailySchedule = editValue;
    if (editingSection === 'menu') updatedPlan.menu.selections = editValue;
    if (editingSection === 'decor') updatedPlan.themeDesign.decorItems = editValue;
    if (editingSection === 'supplies') updatedPlan.procurementList = editValue;
    if (editingSection === 'suggestion') updatedPlan.overview.personalSuggestion = editValue;
    if (editingSection === 'overview') {
      updatedPlan.overview = { ...updatedPlan.overview, ...editValue };
      updatedPlan.originalData = { ...updatedPlan.originalData!, ...editValue };
    }
    
    onPlanUpdate(updatedPlan);
    setEditingSection(null);
    setEditValue(null);
    showToast("Changes saved successfully!");
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newParticipants: ParticipantRecord[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header or empty lines
        const [name, email, phone] = line.split(',').map(s => s.trim());
        if (name) {
          const regId = generateRegistrationId(plan.overview.eventType, plan.overview.eventDate, (plan.participants?.length || 0) + newParticipants.length + 1);
          newParticipants.push({
            id: Math.random().toString(36).substr(2, 9),
            name,
            registrationId: regId,
            status: 'Registered',
            email: email || '',
            phone: phone || '',
            timestamp: Date.now()
          });
        }
      });

      if (newParticipants.length > 0) {
        onPlanUpdate({ ...plan, participants: [...(plan.participants || []), ...newParticipants] });
        showToast(`Imported ${newParticipants.length} participants!`);
      }
    };
    reader.readAsText(file);
  };
  const addCustomFacility = (e: React.FormEvent) => {
    e.preventDefault();
    const newFacility = {
      id: Math.random().toString(36).substr(2, 9),
      title: customFacilityInput.title,
      description: customFacilityInput.description,
      items: []
    };
    onPlanUpdate({ ...plan, customFacilities: [...(plan.customFacilities || []), newFacility] });
    setShowCustomFacilityModal(false);
    setCustomFacilityInput({ title: '', description: '' });
  };

  const Tab = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      title={`Switch to ${label} tab`}
      onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
        activeTab === id ? 'bg-[#1e3a3a] text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-start md:justify-center bg-white p-2 rounded-[2.5rem] border border-orange-100 shadow-xl z-30 backdrop-blur-md bg-white/90">
        {appMode === 'organiser' ? (
          <>
            <Tab id="blueprint" label={t.tabBlueprint} icon={Layout} />
            <Tab id="tasks" label={t.tabTasks} icon={CheckSquare} />
            <Tab id="budget" label={t.tabBudget} icon={DollarSign} />
            <Tab id="foodDecor" label={t.tabFoodDecor} icon={Utensils} />
            <Tab id="media" label={t.tabMedia} icon={ImageIcon} />
            <Tab id="participants" label={t.tabParticipants} icon={Users} />
            <Tab id="verify" label={t.tabVerify} icon={UserCheck} />
            <Tab id="search" label={t.tabSearch} icon={Search} />
          </>
        ) : (
          <>
            <Tab id="pass" label={t.tabPass} icon={Smartphone} />
            <Tab id="timeline" label={t.tabTimeline} icon={History} />
            <Tab id="search" label={t.tabSearch} icon={Search} />
          </>
        )}
      </div>

      {activeTab === 'pass' && plan.participantPass && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          {!isVerifying ? (
            /* SECTION A - EVENT PASS (PARTICIPANT VIEW) */
            <div className="space-y-10">
              <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
                {/* 1. EVENT HEADER */}
                <div className="bg-[#1e3a3a] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10">
                    <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Event Shaastra Official Pass</p>
                    <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight">{plan.participantPass.eventName}</h1>
                  </div>
                </div>

                <div className="p-10 md:p-16 space-y-12">
                  {/* 2. PARTICIPANT IDENTITY BLOCK */}
                  <div className="space-y-2">
                    <h2 className="text-5xl md:text-7xl font-black text-[#1e3a3a] tracking-tight leading-none">{plan.participantPass.name}</h2>
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">{plan.participantPass.organization || 'Independent Participant'}</p>
                  </div>

                  {/* 3. EVENT DETAILS BLOCK */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 border-y border-slate-100">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Title</p>
                        <p className="text-lg font-black text-[#1e3a3a] uppercase">{plan.participantPass.eventName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-lg font-black text-[#1e3a3a] uppercase">{plan.participantPass.dateTime}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</p>
                        <p className="text-lg font-black text-[#1e3a3a] uppercase">{plan.participantPass.venue}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration ID</p>
                        <p className="text-lg font-mono font-black text-orange-500 uppercase">{plan.participantPass.registrationId}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. STATUS BAR (HIGH VISIBILITY) */}
                  <div className="space-y-6">
                    <div className={`w-full h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all duration-500 border-4 ${
                      plan.participantPass.status === 'Registered' ? (checkInCountdown ? 'bg-emerald-500 border-emerald-400' : 'bg-blue-400 border-blue-300 animate-pulse') : 
                      plan.participantPass.status === 'Checked-In' ? 'bg-blue-600 border-blue-500' : 
                      plan.participantPass.status === 'Awaiting Verification' ? 'bg-orange-500 border-orange-400 animate-pulse' : 'bg-red-500 border-red-400'
                    }`}>
                      <p className="text-white font-black uppercase tracking-[0.5em] text-2xl">
                        {plan.participantPass.status === 'Registered' ? (checkInCountdown ? t.statusRegistered : 'Check-In Available') : 
                         plan.participantPass.status === 'Checked-In' ? t.statusCheckedIn : 
                         plan.participantPass.status === 'Awaiting Verification' ? t.statusAwaiting : t.statusInvalid}
                      </p>
                    </div>

                    {/* Countdown or Check-In Button */}
                    <div className="flex flex-col items-center gap-4">
                      {checkInCountdown ? (
                        <div className="flex items-center gap-3 px-8 py-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 font-black uppercase text-xs tracking-widest shadow-sm">
                          <Clock size={18} className="animate-spin-slow" />
                          {checkInCountdown}
                        </div>
                      ) : plan.participantPass.status === 'Registered' ? (
                        <button 
                          onClick={() => {
                            const updated = plan.participants?.map(p => p.registrationId === plan.participantPass?.registrationId ? { ...p, status: 'Awaiting Verification' as const } : p);
                            onPlanUpdate({ ...plan, participants: updated, participantPass: { ...plan.participantPass!, status: 'Awaiting Verification' } });
                            showToast("Check-In Request Sent! Please proceed to the reception.");
                          }}
                          className="w-full py-8 bg-[#1e3a3a] text-white rounded-[2.5rem] font-black uppercase text-xl tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-[#0d1a1a]"
                        >
                          <Smartphone size={28} /> {t.readyCheckIn}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* 5. PARTICIPATION PROGRESS SECTION */}
                  <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Badge</p>
                        <h3 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif">{getBadge(plan.participantPass.checkInCount)}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-Ins</p>
                        <p className="text-2xl font-black text-[#1e3a3a]">{plan.participantPass.checkInCount}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-slate-100 p-1">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((plan.participantPass.checkInCount / 7) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Newcomer</span>
                        <span>Power Attendee</span>
                      </div>
                    </div>
                  </div>

                  {/* 6. NEXT STEPS TIMELINE */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1e3a3a] uppercase tracking-widest flex items-center gap-3">
                      <ChevronRight size={20} className="text-orange-500" /> Next Steps
                    </h3>
                    <div className="space-y-4">
                      {(plan.participantPass.timeline || [
                        { label: 'Registration Confirmed', time: 'Instant', status: 'completed' },
                        { label: 'Check-In Window Opens', time: '1 Hour Before', status: 'upcoming' },
                        { label: 'Event Start', time: plan.participantPass.dateTime.split(' ')[1], status: 'upcoming' }
                      ]).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-300'}`}>
                            {step.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          </div>
                          <div className="flex-grow">
                            <p className={`text-sm font-black uppercase tracking-wide ${step.status === 'completed' ? 'text-slate-400 line-through' : 'text-[#1e3a3a]'}`}>{step.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. CANCELLATION BUTTON */}
                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel your event pass?")) {
                          onPlanUpdate({
                            ...plan,
                            participantPass: { ...plan.participantPass!, status: 'Cancelled' }
                          });
                          showToast("Event Pass Cancelled");
                        }
                      }}
                      className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <X size={14} /> Cancel Event Pass
                    </button>
                  </div>
                </div>
              </div>

              {/* A3. READY FOR CHECK-IN MODE BUTTON */}
              <div className="flex flex-col items-center gap-4 pt-10">
                {plan.participantPass.status === 'Cancelled' ? (
                  <div className="w-full max-w-2xl py-10 bg-slate-100 text-slate-400 rounded-[3rem] font-black uppercase text-2xl tracking-[0.4em] text-center border-4 border-slate-200">
                    PASS CANCELLED
                  </div>
                ) : plan.participantPass.status === 'Awaiting Verification' ? (
                  <div className="w-full max-w-2xl py-10 bg-blue-50 text-blue-600 rounded-[3rem] font-black uppercase text-2xl tracking-[0.4em] text-center border-4 border-blue-100 animate-pulse">
                    AWAITING VERIFICATION
                  </div>
                ) : plan.participantPass.status === 'Checked-In' ? (
                  <div className="w-full max-w-2xl py-10 bg-emerald-50 text-emerald-600 rounded-[3rem] font-black uppercase text-2xl tracking-[0.4em] text-center border-4 border-emerald-100">
                    CHECKED-IN
                  </div>
                ) : checkInCountdown ? (
                  <div className="w-full max-w-2xl py-10 bg-slate-50 text-slate-300 rounded-[3rem] font-black uppercase text-2xl tracking-[0.4em] text-center border-4 border-slate-100">
                    {checkInCountdown}
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onPlanUpdate({
                        ...plan,
                        participantPass: { ...plan.participantPass!, status: 'Awaiting Verification' }
                      });
                      setIsVerifying(true);
                      showToast("Check-in request sent to organiser");
                    }}
                    className="w-full max-w-2xl py-10 bg-[#1e3a3a] text-white rounded-[3rem] font-black uppercase text-2xl tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white/10"
                  >
                    {t.readyCheckIn}
                  </button>
                )}
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  Check-in window opens at {plan.entryWindow || '17:00'}
                </p>
              </div>
            </div>
          ) : (
            /* VERIFICATION DISPLAY MODE (High Contrast) */
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
              <button 
                onClick={() => setIsVerifying(false)}
                className="absolute top-10 right-10 p-4 bg-slate-100 rounded-full text-slate-400 hover:text-[#1e3a3a] transition-all"
              >
                <X size={32} />
              </button>
              
              <div className="w-full max-w-3xl space-y-16 text-center">
                <div className="space-y-4">
                  <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.5em]">Participant Name</p>
                  <h2 className="text-7xl md:text-9xl font-black text-[#1e3a3a] leading-none">{plan.participantPass.name}</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.5em]">Event</p>
                  <p className="text-5xl font-black text-[#1e3a3a] uppercase">{plan.participantPass.eventName}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.5em]">Registration ID</p>
                  <p className="text-6xl font-mono font-black text-orange-500">{plan.participantPass.registrationId}</p>
                </div>

                <div className={`w-full h-40 rounded-[3rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  plan.participantPass.status === 'Registered' ? 'bg-emerald-500' : 
                  plan.participantPass.status === 'Awaiting Verification' ? 'bg-blue-400' :
                  plan.participantPass.status === 'Checked-In' ? 'bg-blue-600' : 
                  plan.participantPass.status === 'Cancelled' ? 'bg-slate-400' : 'bg-red-500'
                }`}>
                  <p className="text-white font-black uppercase tracking-[0.8em] text-5xl">
                    {plan.participantPass.status === 'Registered' ? t.statusRegistered : 
                     plan.participantPass.status === 'Awaiting Verification' ? t.statusAwaiting :
                     plan.participantPass.status === 'Checked-In' ? t.statusCheckedIn : 
                     plan.participantPass.status === 'Cancelled' ? t.statusCancelled : t.statusInvalid}
                  </p>
                </div>
                
                <p className="text-slate-300 font-black uppercase tracking-widest pt-10">Present this screen to the receptionist</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verify' && (
        /* SECTION B — VERIFICATION SYSTEM (RECEPTION VIEW) */
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-xl space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-500"><UserCheck size={24}/></div> Reception Desk
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Verify attendance in under 3 seconds</p>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <div className="w-full md:w-80 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    placeholder="Search Name or Reg ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-blue-200 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowManualVerifyModal(true)}
                  className="px-8 py-5 bg-slate-100 text-[#1e3a3a] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Manual Verify
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-[#1e3a3a] uppercase tracking-widest flex items-center gap-3">
                <Bell size={20} className="text-blue-500" /> Request Queue
              </h3>
              
              <div className="space-y-4">
                {plan.participants?.filter(p => p.status === 'Awaiting Verification' || (searchQuery && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.registrationId.toLowerCase().includes(searchQuery.toLowerCase())))).length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                    <UserCheck size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs italic">Queue is empty. Waiting for check-ins...</p>
                  </div>
                ) : plan.participants?.filter(p => p.status === 'Awaiting Verification' || (searchQuery && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.registrationId.toLowerCase().includes(searchQuery.toLowerCase())))).map(p => (
                  <div key={p.id} className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                        p.status === 'Checked-In' ? 'bg-blue-600' : 'bg-emerald-500'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-[#1e3a3a] uppercase tracking-tight">{p.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.registrationId} • {p.status}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      {p.status !== 'Checked-In' ? (
                        <button 
                          onClick={() => {
                            const updated = plan.participants?.map(item => item.id === p.id ? { ...item, status: 'Checked-In' as const } : item);
                            onPlanUpdate({ ...plan, participants: updated });
                            showToast(`${p.name} Verified!`);
                          }}
                          className="flex-grow md:flex-none px-12 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                        >
                          Verify Entry
                        </button>
                      ) : (
                        <div className="px-12 py-6 bg-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] flex items-center gap-3 border border-emerald-200">
                          <CheckCircle size={20} /> Checked-In
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          const updated = plan.participants?.map(item => item.id === p.id ? { ...item, status: 'Invalid' as const } : item);
                          onPlanUpdate({ ...plan, participants: updated });
                          showToast(`${p.name} Marked Invalid`);
                        }}
                        className="p-6 bg-white text-red-400 rounded-2xl border border-slate-100 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* B4. OFFLINE REQUIREMENT NOTE */}
              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl text-blue-500 shadow-sm"><Info size={24}/></div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                  Verification system is operating in Offline-First mode. All updates are stored locally and will sync when connection is restored.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div>
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><History size={24}/></div> {t.tabTimeline}
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Rule-based chronological sorting</p>
              </div>
              <button 
                onClick={() => {
                  const now = new Date();
                  const currentTime = now.getHours() * 60 + now.getMinutes();
                  const nextEvent = plan.timeline?.find(e => {
                    const [time, period] = e.time.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    const eventTime = hours * 60 + minutes;
                    return eventTime > currentTime;
                  });
                  if (nextEvent) {
                    showToast(`Next: ${nextEvent.title} at ${nextEvent.time}`);
                  } else {
                    showToast("No upcoming events found.");
                  }
                }}
                className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
              >
                {t.nextAction}
              </button>
            </div>

            <div className="space-y-6 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-1 before:bg-slate-50">
              {plan.timeline?.map((e, i) => (
                <div key={e.id} className={`relative pl-20 group transition-all ${e.isBookmarked ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 transition-all ${
                    e.isBookmarked ? 'bg-orange-500 scale-125' : 'bg-slate-200'
                  }`} />
                  <div className={`p-8 rounded-[2.5rem] border transition-all ${
                    e.isBookmarked ? 'bg-white border-orange-100 shadow-lg' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">{e.time} • {e.location}</p>
                        <h3 className="text-xl font-black text-[#1e3a3a] uppercase">{e.title}</h3>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = plan.timeline?.map(item => item.id === e.id ? { ...item, isBookmarked: !item.isBookmarked } : item);
                          onPlanUpdate({ ...plan, timeline: updated });
                        }}
                        className={`p-3 rounded-xl transition-all ${e.isBookmarked ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-300'}`}
                      >
                        <Star size={18} fill={e.isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-xl space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><Search size={24}/></div> Browse Events
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Find and register for upcoming experiences</p>
              </div>
              
              <div className="w-full md:w-96 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  placeholder="Search Event Name or Type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={18}/></button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedPlans.filter(p => p.isPublished && (p.overview.eventType.toLowerCase().includes(searchQuery.toLowerCase()) || p.overview.description?.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20">
                  <Search size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs italic">No published events found matching your search</p>
                </div>
              ) : savedPlans.filter(p => p.isPublished && (p.overview.eventType.toLowerCase().includes(searchQuery.toLowerCase()) || p.overview.description?.toLowerCase().includes(searchQuery.toLowerCase()))).map(p => (
                <div key={p.id} className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100 flex flex-col justify-between gap-8 hover:bg-white hover:border-orange-200 transition-all group shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-white rounded-2xl text-orange-500 shadow-sm group-hover:bg-orange-50 transition-all">
                        <Calendar size={24} />
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 bg-white text-slate-400 rounded-lg shadow-sm border border-slate-100 uppercase tracking-widest">
                        {p.overview.eventType}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif leading-tight mb-2">{p.overview.eventType}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> {p.overview.location}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {p.overview.eventDate}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const regId = generateRegistrationId(p.overview.eventType, p.overview.eventDate, (p.participants?.length || 0) + 1);
                      const newPass: ParticipantPass = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: 'Current User',
                        registrationId: regId,
                        eventName: p.overview.eventType,
                        dateTime: `${p.overview.eventDate} ${p.originalData?.eventTime || '18:00'}`,
                        venue: p.overview.location,
                        status: 'Registered',
                        checkInCount: 0,
                        eventsJoined: 1
                      };
                      onPlanUpdate({ ...p, participantPass: newPass });
                      setActiveTab('pass');
                      showToast(`Registered for ${p.overview.eventType}!`);
                    }}
                    className="w-full py-5 bg-[#1e3a3a] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-[#2a4d4d] transition-all"
                  >
                    Register Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blueprint' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-[#1e3a3a] text-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-6 w-full md:max-w-2xl">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">{plan.overview.location}</span>
                  <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">{plan.overview.eventDate}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-serif tracking-tight leading-none break-words whitespace-normal">{plan.overview.eventType}</h1>
                <p className="text-orange-400/80 text-sm font-black uppercase tracking-[0.3em]">{plan.overview.eventStyle} Frame</p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button title="Edit Overview" onClick={() => startEditing('overview', { location: plan.overview.location, eventDate: plan.overview.eventDate, guestCount: plan.overview.guestCount })} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
                    <Edit3 size={18} className="text-white" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('timeline')}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-lg"
                  >
                    {t.nextAction}
                  </button>
                  <button title="Copy Invite Link" onClick={() => {
                    const link = `${window.location.origin}/e/${plan.id}`;
                    navigator.clipboard.writeText(link);
                    showToast("Invite link copied to clipboard!");
                  }} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
                    <Link size={18} className="text-white" />
                  </button>
                  <button title="Share via WhatsApp" onClick={() => handleShare('whatsapp')} className="p-3 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-xl transition-all border border-emerald-500/30">
                    <Phone size={18} className="text-emerald-400" />
                  </button>
                  <button title="Share via SMS" onClick={() => handleShare('sms')} className="p-3 bg-blue-500/20 hover:bg-blue-500/40 rounded-xl transition-all border border-blue-500/30">
                    <MessageSquare size={18} className="text-blue-400" />
                  </button>
                  {!plan.isPublished && (
                    <button 
                      onClick={() => {
                        onPlanUpdate({ ...plan, isPublished: true });
                        showToast("Event Published Successfully!");
                      }}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg ml-auto"
                    >
                      <Upload size={18} /> Publish Event
                    </button>
                  )}
                  {plan.isPublished && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border border-blue-500/30 ml-auto">
                      <CheckCircle size={18} /> Published
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md shrink-0">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">{t.totalSpent}</p>
                <p className="text-5xl font-black font-serif text-orange-400">{plan.overview.budget}</p>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'bg-orange-50 text-orange-600' },
              { id: 'budget', label: 'Budget', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
              { id: 'foodDecor', label: 'Decor', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
              { id: 'foodDecor', label: 'Food', icon: Utensils, color: 'bg-purple-50 text-purple-600' },
              { id: 'media', label: 'Media', icon: Camera, color: 'bg-pink-50 text-pink-600' },
              { id: 'participants', label: 'Guests', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
              { id: 'verify', label: 'Verify', icon: UserCheck, color: 'bg-teal-50 text-teal-600' },
              ...(plan.customSections || []).map(s => ({ id: s.id, label: s.title, icon: Layout, color: 'bg-slate-50 text-slate-600' }))
            ].map((nav, idx) => (
              <button 
                key={`${nav.id}-${idx}`}
                onClick={() => setActiveTab(nav.id as any)}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
              >
                <div className={`p-3 rounded-xl mb-3 transition-transform group-hover:scale-110 ${nav.color}`}>
                  <nav.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a3a]">{nav.label}</span>
              </button>
            ))}
            <button 
              onClick={() => setShowCustomSectionModal(true)}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300 hover:border-orange-400 transition-all group"
            >
              <div className="p-3 rounded-xl mb-3 bg-white text-slate-400 group-hover:text-orange-500">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Section</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Budget Breakup */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl lg:col-span-1">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500"><PieIcon size={24}/></div> Budget
                </h2>
                <button title="Edit Budget" onClick={() => startEditing('budget', plan.budgetAllocation)} className="p-2 text-slate-300 hover:text-[#1e3a3a]"><Edit3 size={18}/></button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plan.budgetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {plan.budgetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {plan.budgetAllocation.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }} />
                      <span className="text-slate-500">{b.category}</span>
                    </div>
                    <span className="text-[#1e3a3a]">{formatCurrency(b.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Timeline */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><Calendar size={24}/></div> Strategic Timeline
                </h2>
                <button title="Edit Timeline" onClick={() => startEditing('tasks', plan.dailySchedule)} className="p-2 text-slate-300 hover:text-[#1e3a3a]"><Edit3 size={18}/></button>
              </div>
              <div className="space-y-4">
                {plan.dailySchedule.map((s, i) => (
                  <div key={i} onClick={() => toggleTask(s.day)} className={`flex gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer ${
                    plan.completedItems?.includes(s.day) ? 'bg-emerald-50/50 border-emerald-100 opacity-60' : 'bg-white border-slate-50 hover:border-orange-200 shadow-sm'
                  }`}>
                    {plan.completedItems?.includes(s.day) ? <CheckCircle size={24} className="text-emerald-500 shrink-0" /> : <Square size={24} className="text-slate-200 shrink-0" />}
                    <div className="flex-grow">
                      <p className={`text-base font-black uppercase tracking-wide ${plan.completedItems?.includes(s.day) ? 'text-slate-400 line-through' : 'text-[#1e3a3a]'}`}>{s.task}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">{s.day} • {s.date}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 self-center" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Decor & Food Together */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-500"><Utensils size={24}/></div> Decor & Culinary
                </h2>
                <div className="flex gap-2">
                  <button title="Edit Decor" onClick={() => startEditing('decor', plan.themeDesign.decorItems)} className="p-2 text-slate-300 hover:text-[#1e3a3a]"><Edit3 size={18}/></button>
                  <button title={t.editMenu} onClick={() => startEditing('menu', plan.menu.selections)} className="p-2 text-slate-300 hover:text-[#1e3a3a]"><Edit3 size={18}/></button>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Decor Elements</h4>
                  <div className="flex flex-wrap gap-3">
                    {plan.themeDesign.decorItems?.map((d, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase border border-slate-100 text-slate-600">{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Food Selections</h4>
                  <div className="flex flex-wrap gap-3">
                    {plan.menu.selections.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-black uppercase border border-blue-100 text-blue-600">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Suggestion */}
            <div className="bg-[#fcfbf7] rounded-[3rem] p-10 border border-orange-100 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-orange-200 opacity-20"><Info size={120} /></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Shaastra Suggestion</h2>
                  <button title="Edit Suggestion" onClick={() => startEditing('suggestion', plan.overview.personalSuggestion)} className="p-2 text-slate-300 hover:text-[#1e3a3a]"><Edit3 size={18}/></button>
                </div>
                <p className="text-xl font-medium text-slate-600 italic leading-relaxed">
                  "{plan.overview.personalSuggestion}"
                </p>
                <div className="mt-8 pt-8 border-t border-orange-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a3a] flex items-center justify-center text-white font-black text-xs">ES</div>
                  <div>
                    <p className="text-[10px] font-black text-[#1e3a3a] uppercase tracking-widest">Event Shaastra Engine</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Deterministic Logic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collaborators Section */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-500"><Users size={24}/></div> {t.collaborators}
                </h2>
                <button 
                  title={t.addCollaborator}
                  onClick={() => {
                    const name = prompt("Collaborator Name:");
                    if (name) {
                      const email = prompt("Email:");
                      const newCollab = { name, email: email || '', role: 'Collaborator' as const };
                      onPlanUpdate({ ...plan, collaborators: [...(plan.collaborators || []), newCollab] });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1e3a3a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#2a4d4d] transition-all shadow-sm"
                >
                  <Plus size={14}/> {t.addCollaborator}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(plan.collaborators || []).length === 0 ? (
                  <div className="col-span-full py-10 text-center opacity-20"><Users size={48} className="mx-auto mb-2" /><p className="font-black uppercase tracking-widest text-[10px]">No collaborators added yet</p></div>
                ) : plan.collaborators?.map((c, i) => (
                  <div key={i} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs uppercase">{c.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-[#1e3a3a] uppercase tracking-wide">{c.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.role} • {c.email}</p>
                      </div>
                    </div>
                    <button title="Remove Collaborator" onClick={() => onPlanUpdate({...plan, collaborators: plan.collaborators?.filter((_, idx) => idx !== i)})} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><CheckSquare size={24}/></div> {t.tabTasks}
              </h2>
              <button 
                onClick={() => {
                  const text = prompt("New Task:");
                  if (text) {
                    const newTask = { id: Math.random().toString(36).substr(2, 9), text, completed: false };
                    onPlanUpdate({ ...plan, tasks: [...(plan.tasks || []), newTask] });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#1e3a3a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#2a4d4d] transition-all shadow-sm"
              >
                <Plus size={14}/> {t.newTask}
              </button>
            </div>
            <div className="space-y-4">
              {(plan.tasks || []).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => {
                    const updated = plan.tasks?.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                    onPlanUpdate({ ...plan, tasks: updated });
                  }}
                  className={`flex gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer ${
                    task.completed ? 'bg-emerald-50/50 border-emerald-100 opacity-60' : 'bg-white border-slate-50 hover:border-orange-200 shadow-sm'
                  }`}
                >
                  {task.completed ? <CheckCircle size={24} className="text-emerald-500 shrink-0" /> : <Square size={24} className="text-slate-200 shrink-0" />}
                  <div className="flex-grow">
                    <p className={`text-base font-black uppercase tracking-wide ${task.completed ? 'text-slate-400 line-through' : 'text-[#1e3a3a]'}`}>{task.text}</p>
                    {task.assignee && <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">Assignee: {task.assignee}</p>}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanUpdate({ ...plan, tasks: plan.tasks?.filter(t => t.id !== task.id) });
                    }}
                    className="p-2 text-slate-200 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              {(plan.tasks || []).length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <CheckSquare size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">No tasks planned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm"><DollarSign size={24}/></div> {t.tabBudget}
                  </h3>
                  <p className="text-4xl font-black text-emerald-600 mt-4 font-serif">{formatCurrency(totalSpent)}</p>
                </div>
                <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-3 px-8 py-5 bg-[#1e3a3a] text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                  <Plus size={18}/> {t.logTransaction}
                </button>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {plan.expenses?.length === 0 ? (
                  <div className="py-20 text-center text-slate-200 font-black uppercase tracking-[0.3em]">No entries recorded</div>
                ) : plan.expenses?.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-emerald-200 hover:bg-white transition-all group shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-emerald-500 shadow-inner border border-slate-50"><ShoppingBag size={24}/></div>
                      <div>
                        <p className="text-lg font-black text-[#1e3a3a] uppercase tracking-wide">{e.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black px-3 py-1 bg-white text-slate-400 rounded-lg shadow-sm border border-slate-100 uppercase">{e.category}</span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Paid By: {e.paidBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-2xl font-black text-[#1e3a3a] font-serif">{formatCurrency(e.amount)}</p>
                      <button onClick={() => onPlanUpdate({...plan, expenses: plan.expenses?.filter(x => x.id !== e.id)})} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif mb-8">Allocation</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plan.budgetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {plan.budgetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {plan.budgetAllocation.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }} />
                      <span className="text-slate-500">{b.category}</span>
                    </div>
                    <span className="text-[#1e3a3a]">{formatCurrency(b.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'foodDecor' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-500"><Utensils size={24}/></div> Food Menu
                </h2>
                <button 
                  onClick={() => {
                    const name = prompt("Food Item Name:");
                    if (name) {
                      const newItem = { id: Math.random().toString(36).substr(2, 9), name, vendor: 'TBD', status: 'Pending' as const };
                      onPlanUpdate({ ...plan, foodItems: [...(plan.foodItems || []), newItem] });
                    }
                  }}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Plus size={20}/>
                </button>
              </div>
              <div className="space-y-4">
                {(plan.foodItems || []).map((item) => (
                  <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-black text-[#1e3a3a] uppercase">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor: {item.vendor} • {item.status}</p>
                    </div>
                    <button onClick={() => onPlanUpdate({...plan, foodItems: plan.foodItems?.filter(i => i.id !== item.id)})} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><ShoppingBag size={24}/></div> Decor Planner
                </h2>
                <button 
                  onClick={() => {
                    const name = prompt("Decor Item Name:");
                    if (name) {
                      const newItem = { id: Math.random().toString(36).substr(2, 9), name, vendor: 'TBD', status: 'Pending' as const };
                      onPlanUpdate({ ...plan, decorItems: [...(plan.decorItems || []), newItem] });
                    }
                  }}
                  className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all"
                >
                  <Plus size={20}/>
                </button>
              </div>
              <div className="space-y-4">
                {(plan.decorItems || []).map((item) => (
                  <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-black text-[#1e3a3a] uppercase">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor: {item.vendor} • {item.status}</p>
                    </div>
                    <button onClick={() => onPlanUpdate({...plan, decorItems: plan.decorItems?.filter(i => i.id !== item.id)})} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h3 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 shadow-sm"><Camera size={24}/></div> {t.tabMedia}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleGooglePhotosConnect}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Smartphone size={16} className="text-blue-500" /> Google Photos
                </button>
                <label className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-orange-600 transition-all cursor-pointer">
                  <Upload size={16} /> Upload Media
                  <input type="file" multiple className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => handleMediaUpload(e)} />
                </label>
                <button 
                  onClick={() => {
                    const text = prompt("Enter your note:");
                    if (text) {
                      const entry: MediaEntry = {
                        id: Math.random().toString(36).substr(2, 9),
                        data: text,
                        type: 'Note',
                        timestamp: Date.now(),
                        tag: 'Note',
                        name: 'Text Note'
                      };
                      onPlanUpdate({ ...plan, media: [...(plan.media || []), entry] });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-600 transition-all"
                >
                  <MessageSquare size={16} /> Add Note
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(plan.media || []).map(m => (
                <div key={m.id} className="aspect-square rounded-[2rem] overflow-hidden relative group shadow-lg border-2 border-white bg-slate-50">
                  {m.type === 'Image' && <img src={m.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                  {m.type === 'Video' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-500">
                      <Video size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest px-4 text-center truncate w-full">{m.name}</span>
                    </div>
                  )}
                  {m.type === 'Document' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-emerald-500">
                      <FileText size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest px-4 text-center truncate w-full">{m.name}</span>
                    </div>
                  )}
                  {m.type === 'Note' && (
                    <div className="w-full h-full p-6 flex flex-col justify-between bg-yellow-50/50">
                      <p className="text-xs font-medium text-slate-600 line-clamp-6 italic">"{m.data}"</p>
                      <div className="flex items-center gap-2 text-yellow-600">
                        <MessageSquare size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Note</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPlanUpdate({...plan, media: plan.media?.filter(x => x.id !== m.id)})} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {(plan.media || []).length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20">
                  <ImageIcon size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">No memories captured yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Participant Database</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Manage registrations and check-ins</p>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 break-all text-[10px] font-mono text-slate-500">
                  {plan.googleFormLink}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(plan.googleFormLink || '');
                    showToast('Link copied to clipboard!');
                  }}
                  className="flex-grow flex items-center justify-center gap-3 py-5 bg-[#1e3a3a] text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-[#2a4d4d] transition-all"
                >
                  <Link size={18}/> {t.copyLink}
                </button>
                <label className="flex items-center gap-3 px-8 py-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all shadow-sm font-black uppercase text-[10px] tracking-widest cursor-pointer">
                  <FileText size={18}/> Excel Import
                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                </label>
                <label className="flex items-center gap-3 px-8 py-5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm font-black uppercase text-[10px] tracking-widest cursor-pointer">
                  <Share2 size={18}/> CSV Import
                  <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                </label>
              </div>
            </div>
            <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 shadow-xl text-center space-y-2">
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Total Registered</p>
              <p className="text-5xl font-black text-[#1e3a3a] font-serif">{plan.participants?.length || 0}</p>
            </div>
            <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-xl text-center space-y-2">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Checked-In</p>
              <p className="text-5xl font-black text-[#1e3a3a] font-serif">{plan.participants?.filter(p => p.status === 'Checked-In').length || 0}</p>
            </div>
            <div className="p-10 bg-orange-50 rounded-[3rem] border border-orange-100 shadow-xl text-center space-y-2">
              <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Awaiting Check-In</p>
              <p className="text-5xl font-black text-[#1e3a3a] font-serif">{plan.participants?.filter(p => p.status === 'Awaiting Verification').length || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden">
             <div className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Guest Register</h2>
               <div className="flex gap-4">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                    type="text" 
                    placeholder="Search guests..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl outline-none font-black text-xs border border-slate-100 focus:bg-white transition-all"
                   />
                 </div>
                 <button 
                   onClick={() => {
                     const name = prompt("Guest Name:");
                     if (name) {
                       const regId = generateRegistrationId(plan.overview.eventType, plan.overview.eventDate, (plan.participants?.length || 0) + 1);
                       const newParticipant: ParticipantRecord = {
                         id: Math.random().toString(36).substr(2, 9),
                         name,
                         registrationId: regId,
                         status: 'Registered',
                         email: '',
                         phone: '',
                         timestamp: Date.now()
                       };
                       onPlanUpdate({ ...plan, participants: [...(plan.participants || []), newParticipant] });
                     }
                   }}
                   className="px-6 py-3 bg-slate-50 text-[#1e3a3a] rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-100 hover:bg-white transition-all shadow-sm"
                 >
                   + Manual Entry
                 </button>
               </div>
             </div>
             <div className="space-y-3">
                 <Spreadsheet 
                    data={{
                      headers: ['Name', 'Registration ID', 'Status', 'Email', 'Phone'],
                      rows: plan.participants?.filter(p => 
                        !searchQuery || 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.registrationId.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map(p => ({
                        'Name': p.name,
                        'Registration ID': p.registrationId,
                        'Status': p.status,
                        'Email': p.email || '',
                        'Phone': p.phone || '',
                        '_id': p.id
                      })) || []
                    }}
                    onUpdate={(data) => {
                      const updated = data.rows.map(row => ({
                        id: row._id || Math.random().toString(36).substr(2, 9),
                        name: row.Name,
                        registrationId: row['Registration ID'],
                        status: row.Status as any,
                        email: row.Email,
                        phone: row.Phone,
                        timestamp: Date.now()
                      }));
                      onPlanUpdate({ ...plan, participants: updated });
                    }}
                    onRowAction={(row) => {
                      onPlanUpdate({ ...plan, participants: plan.participants?.filter(p => p.id !== row._id) });
                      showToast("Guest Removed");
                    }}
                    actionLabel="Remove"
                 />
              </div>
          </div>
        </div>
      )}

      {/* Custom Sections Rendering */}
      {(plan.customSections || []).map(section => (
        activeTab === section.id && (
          <div key={section.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
            <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-xl space-y-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif">{section.title}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{section.description || 'Custom Facility Section'}</p>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(`Delete section "${section.title}"?`)) {
                      onPlanUpdate({ ...plan, customSections: plan.customSections?.filter(s => s.id !== section.id) });
                      setActiveTab('blueprint');
                    }
                  }}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={20}/>
                </button>
              </div>

              {section.type === 'Spreadsheet' && section.spreadsheet && (
                <Spreadsheet 
                  data={section.spreadsheet} 
                  onUpdate={(data) => {
                    const updated = plan.customSections?.map(s => s.id === section.id ? { ...s, spreadsheet: data } : s);
                    onPlanUpdate({ ...plan, customSections: updated });
                  }}
                />
              )}

              {section.type === 'List' && (
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const text = prompt("Item Text:");
                      if (text) {
                        const newItem = { id: Math.random().toString(36).substr(2, 9), text, completed: false };
                        const updated = plan.customSections?.map(s => s.id === section.id ? { ...s, items: [...(s.items || []), newItem] } : s);
                        onPlanUpdate({ ...plan, customSections: updated });
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                    <Plus size={16}/> Add Item
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(section.items || []).map(item => (
                      <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-[#1e3a3a]">{item.text}</span>
                        <button 
                          onClick={() => {
                            const updated = plan.customSections?.map(s => s.id === section.id ? { ...s, items: s.items?.filter(i => i.id !== item.id) } : s);
                            onPlanUpdate({ ...plan, customSections: updated });
                          }}
                          className="text-slate-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section.type === 'Text' && (
                <textarea 
                  value={section.text || ''} 
                  onChange={(e) => {
                    const updated = plan.customSections?.map(s => s.id === section.id ? { ...s, text: e.target.value } : s);
                    onPlanUpdate({ ...plan, customSections: updated });
                  }}
                  className="w-full p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 outline-none font-bold text-[#1e3a3a] h-96 resize-none focus:bg-white transition-all"
                  placeholder="Enter content here..."
                />
              )}
            </div>
          </div>
        )
      ))}

      {/* Manual Verification Modal */}
      {showManualVerifyModal && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300 border border-orange-50">
            <button onClick={() => setShowManualVerifyModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-[#1e3a3a] transition-all"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] mb-12 uppercase font-serif tracking-tight">Manual Verify</h3>
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Registration ID</label>
                 <input 
                  required 
                  value={manualRegId} 
                  onChange={e => setManualRegId(e.target.value.toUpperCase())} 
                  className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" 
                  placeholder="e.g. WED-2024-001" 
                 />
               </div>
               <button 
                onClick={() => {
                  const participant = plan.participants?.find(p => p.registrationId === manualRegId);
                  if (participant) {
                    const updated = plan.participants?.map(item => item.id === participant.id ? { ...item, status: 'Checked-In' as const } : item);
                    onPlanUpdate({ ...plan, participants: updated });
                    showToast(`${participant.name} Verified!`);
                    setShowManualVerifyModal(false);
                    setManualRegId('');
                  } else {
                    showToast("Invalid Registration ID");
                  }
                }}
                className="w-full py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4"
               >
                 Search & Verify
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Editing Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[100] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingSection(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-all"><X size={24} /></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] uppercase mb-10 font-serif">{editingSection === 'overview' ? t.editOverview : `Edit ${editingSection}`}</h3>
            
            <div className="space-y-6">
              {editingSection === 'suggestion' ? (
                <textarea 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-medium text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all min-h-[200px]"
                />
              ) : editingSection === 'overview' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.location}</label>
                    <input value={editValue.location} onChange={(e) => setEditValue({...editValue, location: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.date}</label>
                    <input type="date" value={editValue.eventDate} onChange={(e) => setEditValue({...editValue, eventDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.guests}</label>
                    <input type="number" value={editValue.guestCount} onChange={(e) => setEditValue({...editValue, guestCount: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-slate-100" />
                  </div>
                </div>
              ) : Array.isArray(editValue) ? (
                <div className="space-y-4">
                  {editValue.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input 
                        value={typeof item === 'string' ? item : (item.task || item.category || item.item)} 
                        onChange={(e) => {
                          const newArr = [...editValue];
                          if (typeof item === 'string') newArr[idx] = e.target.value;
                          else if (item.task) newArr[idx].task = e.target.value;
                          else if (item.category) newArr[idx].category = e.target.value;
                          else if (item.item) newArr[idx].item = e.target.value;
                          setEditValue(newArr);
                        }}
                        className="flex-grow px-6 py-4 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-slate-100"
                      />
                      <button onClick={() => setEditValue(editValue.filter((_: any, i: number) => i !== idx))} className="p-3 text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newItem = typeof editValue[0] === 'string' ? t.newItem : { ...editValue[0], task: t.newTask, item: t.newItem, category: t.newCategory, id: Math.random().toString() };
                      setEditValue([...editValue, newItem]);
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 hover:border-[#1e3a3a] hover:text-[#1e3a3a] transition-all font-black uppercase text-[10px] tracking-widest"
                  >
                    + {t.addEntry}
                  </button>
                </div>
              ) : null}
            </div>

            <button onClick={saveEdit} className="w-full py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-10">{t.saveChanges}</button>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300 border border-orange-50">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-[#1e3a3a] transition-all"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] mb-12 uppercase font-serif tracking-tight">{t.logTransaction}</h3>
            <form onSubmit={addExpense} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.description}</label>
                 <input required value={expenseInput.description} onChange={e => setExpenseInput({...expenseInput, description: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" placeholder="e.g. Flower vendor payment" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.amount}</label>
                    <input type="number" required value={expenseInput.amount} onChange={e => setExpenseInput({...expenseInput, amount: parseFloat(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Type</label>
                    <select value={expenseInput.category} onChange={e => setExpenseInput({...expenseInput, category: e.target.value as any})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white transition-all">
                      <option>Food</option><option>Venue</option><option>Transport</option><option>Decorations</option><option>Miscellaneous</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.paidBy}</label>
                 <input required value={expenseInput.paidBy} onChange={e => setExpenseInput({...expenseInput, paidBy: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white transition-all" placeholder="Author name" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.authorNote}</label>
                 <textarea value={expenseInput.authorNote} onChange={e => setExpenseInput({...expenseInput, authorNote: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white transition-all h-24 resize-none" placeholder="Add a note for this transaction..." />
               </div>
               <button type="submit" className="w-full py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4">Record Entry</button>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300 border border-orange-50">
            <button onClick={() => setShowFeedbackModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-[#1e3a3a] transition-all"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] mb-12 uppercase font-serif tracking-tight">{t.archiveFeedback}</h3>
            <form onSubmit={addFeedback} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Guest Identity</label>
                 <input required value={feedbackInput.guestName} onChange={e => setFeedbackInput({...feedbackInput, guestName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 transition-all" placeholder="Name or 'Anonymous'" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Score (1-5)</label>
                 <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {[1,2,3,4,5].map(i => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => setFeedbackInput({...feedbackInput, score: i})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${feedbackInput.score === i ? 'bg-[#1e3a3a] text-white shadow-lg' : 'bg-white text-slate-300 shadow-sm'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reflection Details</label>
                 <textarea required value={feedbackInput.comment} onChange={e => setFeedbackInput({...feedbackInput, comment: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm h-40 resize-none border border-slate-100 transition-all" placeholder="How was the food, decor, or overall flow?" />
               </div>
               <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4">Archive Reflection</button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Section Modal */}
      {showCustomSectionModal && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300 border border-orange-50">
            <button onClick={() => setShowCustomSectionModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-[#1e3a3a] transition-all"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] mb-12 uppercase font-serif tracking-tight">Add New Section</h3>
            <form onSubmit={addCustomSection} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Section Title</label>
                 <input required value={customSectionInput.title} onChange={e => setCustomSectionInput({...customSectionInput, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" placeholder="e.g. Volunteer List" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Section Type</label>
                 <select 
                  value={customSectionInput.type} 
                  onChange={e => setCustomSectionInput({...customSectionInput, type: e.target.value as any})}
                  className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all appearance-none"
                 >
                   <option value="List">Task List</option>
                   <option value="Spreadsheet">Spreadsheet</option>
                   <option value="Text">Notes / Text</option>
                 </select>
               </div>
               <button type="submit" className="w-full py-6 bg-orange-500 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4">Create Section</button>
            </form>
          </div>
        </div>
      )}
      {showCustomFacilityModal && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300 border border-orange-50">
            <button onClick={() => setShowCustomFacilityModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-[#1e3a3a] transition-all"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] mb-12 uppercase font-serif tracking-tight">{t.addCategory}</h3>
            <form onSubmit={addCustomFacility} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.facilityTitle}</label>
                 <input required value={customFacilityInput.title} onChange={e => setCustomFacilityInput({...customFacilityInput, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" placeholder="e.g. Media Requirements" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.description}</label>
                 <textarea value={customFacilityInput.description} onChange={e => setCustomFacilityInput({...customFacilityInput, description: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all h-24 resize-none" placeholder="What is this facility for?" />
               </div>
               <button type="submit" className="w-full py-6 bg-purple-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4">{t.createFacility}</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex gap-4">
        <button title="Download Handbook" onClick={downloadAsWord} className="bg-[#1e3a3a] text-white px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl flex items-center gap-5 hover:scale-110 active:scale-95 transition-all border border-white/10">
          <Download size={18} /> {t.download}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-[#1e3a3a] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
};

export default PlanningDashboard;
