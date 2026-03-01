
import React, { useState } from 'react';
import { Icons } from '../constants';
import { Edit3, Check, X } from 'lucide-react';

interface HeaderProps {
  onEditTitle: (newTitle: string) => void;
  t: any;
  onShowBlueprint: () => void;
  onShowGuide: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEditTitle, t, onShowBlueprint, onShowGuide }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(t.title);

  const handleSave = () => {
    onEditTitle(title);
    setIsEditing(false);
  };

  return (
    <header className="py-6 px-4 md:px-8 border-b border-orange-100 bg-white shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-xl">
            <Icons.Marigold />
          </div>
          <div>
            <div className="flex items-center gap-2 group">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="text-xl font-extrabold text-[#1e3a3a] border-b-2 border-orange-500 outline-none"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-emerald-500"><Check size={18}/></button>
                  <button onClick={() => setIsEditing(false)} className="text-slate-300"><X size={18}/></button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a3a] leading-none">
                    {title}
                  </h1>
                  <button title="Edit App Title" onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-orange-500 transition-all"><Edit3 size={14}/></button>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onShowBlueprint}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-100 transition-all shadow-sm"
          >
            Blueprint
          </button>
          <button 
            onClick={onShowGuide}
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-sm border border-slate-100"
          >
            Guide
          </button>
          <div className="hidden lg:block ml-4">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.3em] opacity-50">{t.form.engineNote}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
