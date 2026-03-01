
import React, { useState, useEffect } from 'react';
import { EventFormData, AppLanguage, FileAttachment } from '../types';
import { Icons } from '../constants';
import { Calendar, Wallet, MapPin, Users, Home, Sparkles, MessageSquare, Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  loading: boolean;
  t: any;
  eventTypes: string[];
  venueTypes: { value: string; label: string }[];
  initialLanguage: AppLanguage;
  initialData?: EventFormData;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, loading, t, eventTypes, venueTypes, initialLanguage, initialData }) => {
  const [formData, setFormData] = useState<EventFormData>(initialData || {
    eventType: '',
    budget: '',
    location: '',
    guestCount: 20,
    venueType: 'home',
    ageGroup: 'Mixed',
    theme: '',
    eventDate: '',
    eventTime: '18:00',
    entryWindow: '17:00',
    festival: '',
    specialRequirements: '',
    sustainabilityMode: false,
    language: initialLanguage,
    attachments: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, language: initialLanguage }));
  }, [initialLanguage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const filePromise = new Promise<FileAttachment>((resolve) => {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64.split(',')[1] 
          });
        };
      });
      reader.readAsDataURL(file);
      newAttachments.push(await filePromise);
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl shadow-orange-900/10 p-10 md:p-16 border border-orange-50 max-w-4xl mx-auto w-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 opacity-80" />
      <div className="mb-12 text-center space-y-3">
        <h2 className="text-4xl md:text-5xl font-black text-[#1e3a3a] font-serif uppercase tracking-tight leading-none">{t.title}</h2>
        <p className="text-[11px] font-black text-orange-400 uppercase tracking-[0.4em] opacity-80">Deterministic Handbooks for Indian Traditions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Sparkles size={12} className="text-orange-400"/> {t.occasion}
            </label>
            <select
              name="eventType"
              required
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <option value="">{t.choose}</option>
              {eventTypes.map(type => <option key={type} value={type} className="text-slate-800 font-bold">{type}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Sparkles size={12} className="text-orange-400"/> {t.festival}
            </label>
            <input
              type="text"
              name="festival"
              placeholder={t.festivalPlaceholder}
              value={formData.festival}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Wallet size={12} className="text-orange-400"/> {t.budget}
            </label>
            <input
              type="number"
              name="budget"
              placeholder={t.budgetPlaceholder}
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <MapPin size={12} className="text-orange-400"/> {t.location}
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder={t.locationPlaceholder}
              value={formData.location}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Calendar size={12} className="text-orange-400"/> {t.date}
            </label>
            <input
              type="date"
              name="eventDate"
              required
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all cursor-pointer shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Calendar size={12} className="text-orange-400"/> {t.time}
            </label>
            <input
              type="time"
              name="eventTime"
              required
              value={formData.eventTime}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all cursor-pointer shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Calendar size={12} className="text-orange-400"/> {t.entryWindow}
            </label>
            <input
              type="time"
              name="entryWindow"
              required
              value={formData.entryWindow}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all cursor-pointer shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Users size={12} className="text-orange-400"/> {t.guests}
            </label>
            <div className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
              <input
                type="range"
                name="guestCount"
                min="5"
                max="1000"
                step="5"
                value={formData.guestCount}
                onChange={handleChange}
                className="flex-grow accent-orange-500 cursor-pointer"
              />
              <span className="text-base font-black text-slate-700 w-12 text-center">{formData.guestCount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
              <Home size={12} className="text-orange-400"/> {t.venue}
            </label>
            <select
              name="venueType"
              value={formData.venueType}
              onChange={handleChange}
              className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all cursor-pointer shadow-sm"
            >
              {venueTypes.map(v => <option key={v.value} value={v.value} className="text-slate-800 font-bold">{v.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 h-full pt-8 px-4">
            <input
              type="checkbox"
              id="eco"
              name="sustainabilityMode"
              checked={formData.sustainabilityMode}
              onChange={handleChange}
              className="w-6 h-6 accent-emerald-500 cursor-pointer rounded-lg shadow-sm"
            />
            <label htmlFor="eco" className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] cursor-pointer leading-tight">
              {t.eco}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
            <MessageSquare size={12} className="text-orange-400"/> {t.details}
          </label>
          <div className="space-y-6">
            <textarea
              name="specialRequirements"
              required
              placeholder={t.detailsPlaceholder}
              value={formData.specialRequirements}
              onChange={handleChange}
              className="w-full px-8 py-6 h-40 rounded-[2rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none text-[13px] font-black uppercase text-slate-700 transition-all resize-none shadow-sm placeholder:text-slate-300"
            />
            
            <div className="flex flex-wrap gap-3 px-4">
              <label title="Attach Assets" className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 hover:border-orange-300 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm">
                <Paperclip size={14} className="text-orange-400"/>
                <span>{t.attachAssets}</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
              </label>
            </div>

            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 px-4">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-orange-50/30 border border-orange-100 rounded-2xl shadow-sm animate-in zoom-in duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm"><FileText size={14}/></div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-300 hover:text-red-500 transition-all p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden py-6 px-10 rounded-[2.5rem] font-black text-white text-[15px] bg-[#1e3a3a] hover:bg-[#2a4d4d] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-[0.4em]">
            {loading ? <Loader2 className="animate-spin" /> : <Icons.Marigold />}
            {loading ? t.logicAnalysis : t.submit}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </form>
      
      <div className="mt-16 text-center border-t border-slate-50 pt-10">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{t.engineNote}</p>
      </div>
    </div>
  );
};

export default EventForm;
