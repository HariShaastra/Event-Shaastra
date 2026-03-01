
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EventForm from './components/EventForm';
import PlanningDashboard from './components/PlanningDashboard';
import { EventFormData, EventPlan, AppLanguage } from './types';
import { generateLogicalPlan } from './services/logicalEngine';
import { EVENT_TYPES, VENUE_TYPES } from './constants';
import { Save, Languages, History, Settings, Bell, X, CheckCircle, Smartphone, Search, ChevronRight, Layout, Users, Calendar } from 'lucide-react';

const TRANSLATIONS: Record<AppLanguage, any> = {
  English: {
    title: "Event Shaastra",
    subtitle: "Cultural Event Handbooks, Simplified",
    newPlan: "New Plan",
    save: "Save",
    history: "Archives",
    settings: "App Settings",
    autosave: "Autosave",
    notifications: "Task Alerts",
    rsvpAlerts: "RSVP Alerts",
    back: "Modify Setup",
    signIn: "Sign In",
    welcome: "Welcome back",
    noPlans: "No plans in archive.",
    savedSuccess: "Saved Successfully!",
    cancel: "Cancel Modification",
    fullName: "Full Name",
    emailAddress: "Email Address",
    accessPlans: "Access My Plans",
    offlineFirst: "Offline First",
    zeroAI: "Zero AI Runtime",
    privacy: "Privacy Focused",
    guestsLabel: "Guests",
    guestIdentity: "Guest Identity",
    scoreLabel: "Score (1-5)",
    reflectionPlaceholder: "How was the food, decor, or overall flow?",
    guestPlaceholder: "Name or 'Anonymous'",
    simulateResponse: "Simulate Response",
    collaborators: "Collaborators",
    addCollaborator: "Add Collaborator",
    role: "Role",
    contact: "Contact",
    admin: "Admin",
    editor: "Editor",
    editMenu: "Edit Menu",
    form: {
      title: "Design Your Event",
      occasion: "What is the occasion?",
      festival: "Festival?",
      budget: "Budget (₹)",
      location: "Location",
      date: "Event Date",
      time: "Event Time",
      entryWindow: "Entry Window (Check-in Start)",
      guests: "Guest Count",
      venue: "Venue Type",
      eco: "Eco-Friendly Mode",
      details: "Rituals/Requirements",
      submit: "Generate Blueprint",
      choose: "Choose an option",
      festivalPlaceholder: "Holi, Diwali, Pongal...",
      budgetPlaceholder: "e.g. 150000",
      locationPlaceholder: "City, Area",
      detailsPlaceholder: "Dietary needs, family rituals, special guests...",
      attachAssets: "Attach Assets",
      logicAnalysis: "Logic Analysis...",
      engineNote: "Proprietary Cultural Framework Engine"
    },
    dashboard: {
      tabBlueprint: "Blueprint",
      tabTasks: "Plan Tasks",
      tabBudget: "Budget & Expenses",
      tabFoodDecor: "Food & Decor",
      tabMedia: "Media Gallery",
      tabParticipants: "Participants",
      tabVerify: "Entry & Verification",
      tabPass: "Event Pass",
      tabTimeline: "My Timeline",
      tabSearch: "Search Events",
      nextAction: "What Should I Do Next?",
      readyCheckIn: "READY FOR CHECK-IN",
      confirmCheckIn: "Confirm Check-In",
      verifyParticipant: "Verify Participant",
      alreadyCheckedIn: "Already Checked-In",
      badgeUnlocked: "New Badge Unlocked",
      collaborators: "Collaborators",
      addCollaborator: "Add Collaborator",
      foodMenu: "Food Menu",
      statusRegistered: "Registered",
      statusAwaiting: "Awaiting Verification",
      statusCheckedIn: "Checked-In",
      statusCancelled: "Cancelled",
      statusInvalid: "Invalid",
      badgeParticipant: "Participant",
      badgeExplorer: "Explorer",
      badgeEnthusiast: "Enthusiast",
      badgePowerAttendee: "Power Attendee",
      download: "Download Handbook (.doc)",
      addCategory: "Add Facility",
      totalSpent: "Total Expense Pool",
      memories: "Memories Vault",
      feedback: "Guest Reflections",
      manualEntry: "Manual Entry",
      copyLink: "Copy Public Link",
      paidBy: "Paid By (Author)",
      description: "Description",
      amount: "Amount (₹)",
      logTransaction: "Log Transaction",
      archiveFeedback: "Archive Feedback",
      shareWhatsapp: "Share via WhatsApp",
      shareSMS: "Share via SMS",
      authorNote: "Author Note",
      location: "Location",
      date: "Date",
      guests: "Guest Count",
      saveChanges: "Save Changes",
      editOverview: "Edit Overview",
      addEntry: "Add Entry",
      newItem: "New Item",
      newTask: "New Task",
      newCategory: "New Category",
      addItem: "Add Item",
      noFacilities: "No custom facilities designed yet",
      reflectionDetails: "Reflection Details",
      archiveReflection: "Archive Reflection",
      facilityTitle: "Facility Title",
      createFacility: "Create Facility",
      contactOrganiser: "Contact Organiser",
      manualApproval: "Manual Approval",
      register: "Register",
      onboardingTitle: "Welcome to Event Shaastra",
      onboardingOrganiser: "Organiser Mode: Create and manage events.",
      onboardingParticipant: "Participant Mode: Register and attend events.",
      onboardingPass: "Event Pass: Your digital identity for entry.",
      onboardingCheckin: "Check-In: One-tap verification at the venue.",
      skip: "Skip",
      next: "Next",
      finish: "Finish"
    }
  },
  Hindi: {
    title: "इवेंट शास्त्र",
    subtitle: "सांस्कृतिक आयोजन पुस्तिकाएं, सरलीकृत",
    newPlan: "नया प्लान",
    save: "सहेजें",
    history: "संग्रह",
    settings: "ऐप सेटिंग्स",
    autosave: "ऑटो-सेव",
    notifications: "कार्य अलर्ट",
    rsvpAlerts: "आरएसवीपी अलर्ट",
    back: "सेटअप बदलें",
    signIn: "साइन इन करें",
    welcome: "वापसी पर स्वागत है",
    noPlans: "संग्रह में कोई प्लान नहीं है।",
    savedSuccess: "सफलतापूर्वक सुरक्षित!",
    cancel: "संशोधन रद्द करें",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    accessPlans: "मेरे प्लान एक्सेस करें",
    offlineFirst: "ऑफ़लाइन पहले",
    zeroAI: "जीरो एआई रनटाइम",
    privacy: "गोपनीयता केंद्रित",
    guestsLabel: "अतिथि",
    guestIdentity: "अतिथि पहचान",
    scoreLabel: "स्कोर (1-5)",
    reflectionPlaceholder: "भोजन, सजावट या समग्र प्रवाह कैसा था?",
    guestPlaceholder: "नाम या 'अनाम'",
    simulateResponse: "प्रतिक्रिया सिम्युलेट करें",
    collaborators: "सहयोगी",
    addCollaborator: "सहयोगी जोड़ें",
    role: "भूमिका",
    contact: "संपर्क",
    admin: "व्यवस्थापक",
    editor: "संपादक",
    editMenu: "मेन्यू संपादित करें",
    form: {
      title: "अपना आयोजन डिजाइन करें",
      occasion: "अवसर क्या है?",
      festival: "त्योहार?",
      budget: "बजट (₹)",
      location: "स्थान",
      date: "तारीख",
      time: "समय",
      entryWindow: "प्रवेश विंडो (चेक-इन शुरू)",
      guests: "अतिथि संख्या",
      venue: "स्थान का प्रकार",
      eco: "इको-फ्रेंडली मोड",
      details: "रीति-रिवाज/आवश्यकताएं",
      submit: "ब्लूप्रिंट बनाएं",
      choose: "एक विकल्प चुनें",
      festivalPlaceholder: "होली, दिवाली, पोंगल...",
      budgetPlaceholder: "जैसे 150000",
      locationPlaceholder: "शहर, क्षेत्र",
      detailsPlaceholder: "आहार संबंधी ज़रूरतें, पारिवारिक रीति-रिवाज, विशेष अतिथि...",
      attachAssets: "संपत्ति संलग्न करें",
      logicAnalysis: "तर्क विश्लेषण...",
      engineNote: "मालिकाना सांस्कृतिक ढांचा इंजन"
    },
    dashboard: {
      tabBlueprint: "ब्लूप्रिंट",
      tabRSVP: "आरएसवीपी",
      tabCustom: "संसाधन",
      tabPost: "समाप्ति",
      tabAnything: "कुछ और",
      tabPass: "इवेंट पास",
      tabVerify: "सत्यापन",
      tabTimeline: "मेरी समयरेखा",
      nextAction: "मुझे आगे क्या करना चाहिए?",
      readyCheckIn: "चेक-इन के लिए तैयार",
      confirmCheckIn: "चेक-इन की पुष्टि करें",
      alreadyCheckedIn: "पहले से ही चेक-इन किया हुआ",
      badgeUnlocked: "नया बैज अनलॉक हुआ",
      collaborators: "सहयोगी",
      addCollaborator: "सहयोगी जोड़ें",
      foodMenu: "भोजन मेनू",
      statusRegistered: "पंजीकृत",
      statusCheckedIn: "चेक-इन किया हुआ",
      statusInvalid: "अमान्य",
      badgeParticipant: "प्रतिभागी",
      badgeExplorer: "अन्वेषक",
      badgeEnthusiast: "उत्साही",
      badgePowerAttendee: "पावर अटेंडी",
      download: "पुस्तिका डाउनलोड करें (.doc)",
      addCategory: "सुविधा जोड़ें",
      totalSpent: "कुल व्यय",
      memories: "यादें",
      feedback: "अतिथि विचार",
      manualEntry: "मैनुअल एंट्री",
      copyLink: "पब्लिक लिंक कॉपी करें",
      paidBy: "किसने भुगतान किया",
      description: "विवरण",
      amount: "राशि (₹)",
      logTransaction: "लेन-देन दर्ज करें",
      archiveFeedback: "फीडबैक सहेजें",
      shareWhatsapp: "व्हाट्सएप द्वारा साझा करें",
      shareSMS: "एसएमएस द्वारा साझा करें",
      authorNote: "लेखक नोट",
      location: "स्थान",
      date: "तारीख",
      guests: "अतिथि संख्या",
      saveChanges: "परिवर्तन सहेजें",
      editOverview: "अवलोकन संपादित करें",
      addEntry: "प्रविष्टि जोड़ें",
      newItem: "नई वस्तु",
      newTask: "नया कार्य",
      newCategory: "नई श्रेणी",
      addItem: "वस्तु जोड़ें",
      noFacilities: "अभी तक कोई कस्टम सुविधा डिज़ाइन नहीं की गई है",
      reflectionDetails: "प्रतिबिंब विवरण",
      archiveReflection: "प्रतिबिंब संग्रह करें",
      facilityTitle: "सुविधा का शीर्षक",
      createFacility: "सुविधा बनाएँ"
    }
  },
  Tamil: {
    title: "ஈவென்ட் சாஸ்திரா",
    subtitle: "கலாச்சார நிகழ்வு கையேடுகள், எளிமைப்படுத்தப்பட்டது",
    newPlan: "புதிய திட்டம்",
    save: "சேமி",
    history: "காப்பகம்",
    settings: "அமைப்புகள்",
    autosave: "தானாக சேமி",
    notifications: "பணி எச்சரிக்கைகள்",
    rsvpAlerts: "அழைப்பு எச்சரிக்கைகள்",
    back: "அமைப்பை மாற்றவும்",
    signIn: "உள்நுழைய",
    welcome: "மீண்டும் வருக",
    noPlans: "காப்பகத்தில் திட்டங்கள் இல்லை.",
    savedSuccess: "வெற்றிகரமாக சேமிக்கப்பட்டது!",
    cancel: "மாற்றத்தை ரத்துசெய்",
    fullName: "முழு பெயர்",
    emailAddress: "மின்னஞ்சல் முகவரி",
    accessPlans: "எனது திட்டங்களை அணுகவும்",
    offlineFirst: "ஆஃப்லைன் முதலில்",
    zeroAI: "பூஜ்ஜிய AI இயக்க நேரம்",
    privacy: "தனியுரிமை சார்ந்தது",
    guestsLabel: "விருந்தினர்கள்",
    guestIdentity: "விருந்தினர் அடையாளம்",
    scoreLabel: "மதிப்பெண் (1-5)",
    reflectionPlaceholder: "உணவு, அலங்காரம் அல்லது ஒட்டுமொத்த ஓட்டம் எப்படி இருந்தது?",
    guestPlaceholder: "பெயர் அல்லது 'அநாமதேய'",
    simulateResponse: "பதிலை உருவகப்படுத்து",
    collaborators: "கூட்டாளிகள்",
    addCollaborator: "கூட்டாளியைச் சேர்",
    role: "பங்கு",
    contact: "தொடர்பு",
    admin: "நிர்வாகி",
    editor: "எடிட்டர்",
    editMenu: "மெனுவைத் திருத்து",
    form: {
      title: "உங்கள் நிகழ்வை வடிவமைக்கவும்",
      occasion: "நிகழ்ச்சி என்ன?",
      festival: "திருவிழா?",
      budget: "பட்ஜெட் (₹)",
      location: "இடம்",
      date: "தேதி",
      time: "நேரம்",
      entryWindow: "நுழைவு நேரம் (செக்-இன் தொடக்கம்)",
      guests: "விருந்தினர் எண்ணிக்கை",
      venue: "இட வகை",
      eco: "சுற்றுச்சூழல் முறை",
      details: "சடங்குகள்/தேவைகள்",
      submit: "திட்டத்தை உருவாக்கு",
      choose: "விருப்பத்தைத் தேர்ந்தெடுக்கவும்",
      festivalPlaceholder: "ஹோலி, தீபாவளி, பொங்கல்...",
      budgetPlaceholder: "உதாரணம் 150000",
      locationPlaceholder: "நகரம், பகுதி",
      detailsPlaceholder: "உணவுத் தேவைகள், குடும்பச் சடங்குகள், சிறப்பு விருந்தினர்கள்...",
      attachAssets: "சொத்துக்களை இணைக்கவும்",
      logicAnalysis: "தர்க்க பகுப்பாய்வு...",
      engineNote: "தனியுரிம கலாச்சார கட்டமைப்பு இயந்திரம்"
    },
    dashboard: {
      tabBlueprint: "திட்டம்",
      tabRSVP: "அழைப்பு ஸ்டுடியோ",
      tabCustom: "வளங்கள்",
      tabPost: "நிறைவு",
      tabAnything: "வேறேதாவது",
      tabPass: "நிகழ்வு பாஸ்",
      tabVerify: "சரிபார்ப்பு",
      tabTimeline: "எனது காலவரிசை",
      nextAction: "அடுத்து நான் என்ன செய்ய வேண்டும்?",
      readyCheckIn: "செக்-இன் செய்ய தயார்",
      confirmCheckIn: "செக்-இன் உறுதிப்படுத்து",
      alreadyCheckedIn: "ஏற்கனவே செக்-இன் செய்யப்பட்டது",
      badgeUnlocked: "புதிய பேட்ஜ் திறக்கப்பட்டது",
      collaborators: "கூட்டாளிகள்",
      addCollaborator: "கூட்டாளியைச் சேர்",
      foodMenu: "உணவு மெனு",
      statusRegistered: "பதிவு செய்யப்பட்டது",
      statusCheckedIn: "செக்-இன் செய்யப்பட்டது",
      statusInvalid: "தவறானது",
      badgeParticipant: "பங்கேற்பாளர்",
      badgeExplorer: "ஆராய்ச்சியாளர்",
      badgeEnthusiast: "ஆர்வலர்",
      badgePowerAttendee: "பவர் பங்கேற்பாளர்",
      download: "பதிவிறக்கம் (.doc)",
      addCategory: "வகையைச் சேர்",
      totalSpent: "மொத்த செலவு",
      memories: "நினைவுகள்",
      feedback: "விருந்தினர் கருத்துக்கள்",
      manualEntry: "நேரடி பதிவு",
      copyLink: "இணைப்பை நகலெடு",
      paidBy: "செலுத்தியவர்",
      description: "விவரம்",
      amount: "தொகை (₹)",
      logTransaction: "பதிவு செய்க",
      archiveFeedback: "கருத்தைச் சேமி",
      shareWhatsapp: "வாட்ஸ்அப் மூலம் பகிரவும்",
      shareSMS: "எஸ்எம்எஸ் மூலம் பகிரவும்",
      authorNote: "ஆசிரியர் குறிப்பு",
      location: "இடம்",
      date: "தேதி",
      guests: "விருந்தினர் எண்ணிக்கை",
      saveChanges: "மாற்றங்களைச் சேமி",
      editOverview: "மேலோட்டத்தைத் திருத்து",
      addEntry: "பதிவைச் சேர்",
      newItem: "புதிய உருப்படி",
      newTask: "புதிய பணி",
      newCategory: "புதிய வகை",
      addItem: "உருப்படியைச் சேர்",
      noFacilities: "இன்னும் தனிப்பயன் வசதிகள் வடிவமைக்கப்படவில்லை",
      reflectionDetails: "பிரதிபலிப்பு விவரங்கள்",
      archiveReflection: "பிரதிபலிப்பைச் சேமி",
      facilityTitle: "வசதி தலைப்பு",
      createFacility: "வசதியை உருவாக்கு"
    }
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>('English');
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<EventPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [appMode, setAppMode] = useState<'organiser' | 'participant'>('organiser');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState({ category: '', location: '', date: '' });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const t = TRANSLATIONS[lang];

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user ? `, ${user.name}` : '';
    if (hour < 12) return lang === 'Hindi' ? `नमस्ते${name}, शुभ प्रभात!` : (lang === 'Tamil' ? `வணக்கம்${name}, காலை வணக்கம்!` : `Hello${name}, Good Morning!`);
    if (hour < 17) return lang === 'Hindi' ? `नमस्ते${name}, शुभ दोपहर!` : (lang === 'Tamil' ? `வணக்கம்${name}, மதிய வணக்கம்!` : `Hello${name}, Good Afternoon!`);
    return lang === 'Hindi' ? `नमस्ते${name}, शुभ संध्या!` : (lang === 'Tamil' ? `வணக்கம்${name}, மாலை வணக்கம்!` : `Hello${name}, Good Evening!`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'participant') {
      setAppMode('participant');
    } else if (mode === 'organiser') {
      setAppMode('organiser');
    }
    
    const saved = localStorage.getItem('shaastra_all_plans');
    if (saved) setSavedPlans(JSON.parse(saved));
    const active = localStorage.getItem('shaastra_active_plan');
    if (active) setPlan(JSON.parse(active));
    const savedLang = localStorage.getItem('shaastra_lang') as AppLanguage;
    if (savedLang) setLang(savedLang);
    const savedUser = localStorage.getItem('shaastra_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const hasSeenOnboarding = localStorage.getItem('shaastra_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (plan && plan.settings?.autosave) {
      const timer = setTimeout(() => {
        localStorage.setItem('shaastra_active_plan', JSON.stringify(plan));
        const updatedHistory = [plan, ...savedPlans.filter(p => p.id !== plan.id)];
        localStorage.setItem('shaastra_all_plans', JSON.stringify(updatedHistory.slice(0, 10)));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [plan, savedPlans]);

  // Non-AI RSVP Notification logic
  useEffect(() => {
    if (plan && plan.settings?.notifyRSVP) {
      const prevCount = parseInt(localStorage.getItem(`rsvp_count_${plan.id}`) || '0');
      const currentCount = plan.guests?.length || 0;
      if (currentCount > prevCount && Notification.permission === "granted") {
        new Notification("New RSVP Response!", {
          body: `You have ${currentCount - prevCount} new guest response(s) for ${plan.overview.eventType}.`,
          icon: "/favicon.ico"
        });
        localStorage.setItem(`rsvp_count_${plan.id}`, currentCount.toString());
      }
    }
  }, [plan]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string
    };
    setUser(userData);
    localStorage.setItem('shaastra_user', JSON.stringify(userData));
    setShowLogin(false);
  };

  const handleLangChange = (newLang: AppLanguage) => {
    setLang(newLang);
    localStorage.setItem('shaastra_lang', newLang);
    if (plan) {
      // Re-generate current logic-based plan with the new language
      const basePlan = generateLogicalPlan({ ...plan.originalData!, language: newLang });
      setPlan({ 
        ...basePlan, 
        id: plan.id, 
        guests: plan.guests, 
        expenses: plan.expenses, 
        photos: plan.photos,
        feedback: plan.feedback,
        completedItems: plan.completedItems,
        customFacilities: plan.customFacilities,
        settings: plan.settings
      });
    }
  };

  const handleFormSubmit = (data: EventFormData) => {
    setLoading(true);
    setTimeout(() => {
      const newPlan = generateLogicalPlan({ ...data, language: lang });
      if (plan && isEditing) {
        // Preserve existing dynamic data when editing setup
        setPlan({
          ...newPlan,
          id: plan.id,
          guests: plan.guests,
          expenses: plan.expenses,
          photos: plan.photos,
          feedback: plan.feedback,
          completedItems: plan.completedItems,
          customFacilities: plan.customFacilities,
          settings: plan.settings
        });
      } else {
        setPlan(newPlan);
      }
      setLoading(false);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const manualSave = () => {
    if (!plan) return;
    localStorage.setItem('shaastra_active_plan', JSON.stringify(plan));
    const updatedHistory = [plan, ...savedPlans.filter(p => p.id !== plan.id)];
    setSavedPlans(updatedHistory);
    localStorage.setItem('shaastra_all_plans', JSON.stringify(updatedHistory.slice(0, 10)));
    alert(t.savedSuccess);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col font-sans">
      <Header 
        onEditTitle={() => {}} 
        t={t} 
        onShowBlueprint={() => setShowBlueprint(true)}
        onShowGuide={() => setShowGuide(true)}
      />

      {/* Blueprint Modal */}
      {showBlueprint && plan && (
        <div className="fixed inset-0 z-[150] bg-[#1e3a3a]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12 md:p-20 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-500">
            <button onClick={() => setShowBlueprint(false)} className="absolute top-12 right-12 p-4 bg-slate-100 rounded-full text-slate-400 hover:text-[#1e3a3a] transition-all"><X size={32}/></button>
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <p className="text-orange-500 font-black uppercase tracking-[0.5em] text-sm">Event Blueprint Overview</p>
                <h2 className="text-6xl md:text-8xl font-black text-[#1e3a3a] font-serif tracking-tight leading-none">{plan.overview.eventType}</h2>
                <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{plan.overview.location} • {plan.overview.eventDate}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><Layout size={32}/></div>
                  <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Structure</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.overview.description}</p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><Users size={32}/></div>
                  <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Capacity</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.overview.guestCount} Guests expected. Entry window starts {plan.entryWindow}.</p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><Smartphone size={32}/></div>
                  <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Digital Pass</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Auto-generated IDs for all participants. One-tap verification enabled.</p>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 flex justify-center">
                <button onClick={() => setShowBlueprint(false)} className="px-12 py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">Close Overview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[150] bg-[#1e3a3a]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 md:p-20 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-500">
            <button onClick={() => setShowGuide(false)} className="absolute top-12 right-12 p-4 bg-slate-100 rounded-full text-slate-400 hover:text-[#1e3a3a] transition-all"><X size={32}/></button>
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <p className="text-orange-500 font-black uppercase tracking-[0.5em] text-sm">In-App Help Guide</p>
                <h2 className="text-6xl font-black text-[#1e3a3a] font-serif tracking-tight leading-none">How to use Shaastra</h2>
              </div>

              <div className="space-y-12">
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">01</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Organiser Mode</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">Create events in under 10 minutes. Upload participant lists via CSV/Excel. Manage tasks, budget, and verify entries at the reception desk.</p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">02</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Participant Mode</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">Register for events with just your name. Your digital Event Pass is generated instantly with a unique Registration ID.</p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">03</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">Check-In & Verification</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">When the entry window opens, tap "Ready for Check-In" on your pass. The organiser will verify you in seconds at the venue.</p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 flex justify-center">
                <button onClick={() => setShowGuide(false)} className="px-12 py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">Got it!</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistence Bar */}
      <div className="bg-[#1e3a3a] text-white border-b border-white/10 z-40 shadow-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all">
              <Languages size={14} className="text-orange-400" />
              <select 
                value={lang} 
                onChange={(e) => handleLangChange(e.target.value as AppLanguage)}
                className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="English" className="text-slate-800">English</option>
                <option value="Hindi" className="text-slate-800">Hindi</option>
                <option value="Tamil" className="text-slate-800">Tamil</option>
              </select>
            </div>
            
            <div className="flex bg-white/10 rounded-xl p-1 border border-white/20">
              <button 
                onClick={() => setAppMode('organiser')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${appMode === 'organiser' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Organiser
              </button>
              <button 
                onClick={() => setAppMode('participant')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${appMode === 'participant' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Participant
              </button>
            </div>

            <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[11px] font-black uppercase">
              <Search size={14} className="text-orange-400" /> {t.dashboard.tabSearch}
            </button>

            <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[11px] font-black uppercase">
              <History size={14} /> {t.history}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/20">
                {t.signIn}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-xl border border-white/20">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black">{user.name.charAt(0)}</div>
                <span className="text-[10px] font-black uppercase hidden md:inline">{user.name}</span>
              </div>
            )}
            {plan && (
              <button onClick={manualSave} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg">
                <Save size={14} /> {t.save}
              </button>
            )}
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        {!plan || isEditing ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <p className="text-orange-500 font-black uppercase tracking-[0.3em] animate-bounce">{getGreeting()}</p>
              <h2 className="text-4xl md:text-6xl font-black text-[#1e3a3a] leading-tight">{t.title}</h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium">
                {user ? `${t.welcome}, ${user.name}! ` : ''}{t.subtitle}
              </p>
            </div>
            {plan && isEditing && (
              <button onClick={() => setIsEditing(false)} className="mx-auto flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                <X size={14}/> {t.cancel}
              </button>
            )}
            <EventForm onSubmit={handleFormSubmit} loading={loading} t={t.form} eventTypes={EVENT_TYPES} venueTypes={VENUE_TYPES} initialLanguage={lang} initialData={plan?.originalData} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button onClick={() => setPlan(null)} className="text-slate-400 hover:text-[#1e3a3a] font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all">
                <X size={14}/> {t.newPlan}
              </button>
              <button onClick={() => setIsEditing(true)} className="text-orange-500 hover:text-orange-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all">
                <Settings size={14}/> {t.back}
              </button>
            </div>
            <PlanningDashboard plan={plan} isOnline={true} t={t.dashboard} originalData={plan.originalData!} onPlanUpdate={setPlan} appMode={appMode} savedPlans={savedPlans} />
          </div>
        )}
      </main>

      {/* Event Discovery Dashboard (Search Modal) */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <button onClick={() => setShowSearch(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-all"><X size={24} /></button>
            <div className="mb-8">
              <h3 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif">{appMode === 'participant' ? 'Discover Events' : 'My Plans'}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                {appMode === 'participant' ? 'Find and register for public events' : 'Manage your saved event blueprints'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by event name, location or ID..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all"
                />
              </div>
              <select 
                value={searchFilter.category} 
                onChange={e => setSearchFilter({...searchFilter, category: e.target.value})}
                className="px-6 py-5 bg-slate-50 rounded-2xl outline-none font-black text-xs border border-slate-100 focus:bg-white transition-all uppercase tracking-widest"
              >
                <option value="">All Categories</option>
                {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <button 
                onClick={() => { setSearchQuery(''); setSearchFilter({ category: '', location: '', date: '' }); }}
                className="px-6 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {savedPlans
                .filter(p => {
                  const matchesSearch = p.overview.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.overview.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = !searchFilter.category || p.overview.eventType === searchFilter.category;
                  const isPublished = appMode === 'organiser' || p.isPublished;
                  return matchesSearch && matchesCategory && isPublished;
                })
                .map(p => (
                  <div key={p.id} onClick={() => { setPlan(p); setShowSearch(false); }} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] cursor-pointer hover:border-orange-400 hover:bg-white transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-orange-500 shadow-inner border border-slate-50">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{p.overview.eventDate}</span>
                          {p.isPublished && <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">Live</span>}
                        </div>
                        <h4 className="text-xl font-black text-[#1e3a3a] font-serif mt-1">{p.overview.eventType}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{p.overview.location} • {p.id.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Organiser</p>
                        <p className="text-xs font-black text-[#1e3a3a] uppercase">{p.overview.organiserInfo || 'Shaastra Team'}</p>
                      </div>
                      <ChevronRight size={24} className="text-slate-200 group-hover:text-orange-500 group-hover:translate-x-2 transition-all ml-auto" />
                    </div>
                  </div>
                ))}
              {(searchQuery || searchFilter.category) && savedPlans.filter(p => {
                  const matchesSearch = p.overview.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.overview.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = !searchFilter.category || p.overview.eventType === searchFilter.category;
                  const isPublished = appMode === 'organiser' || p.isPublished;
                  return matchesSearch && matchesCategory && isPublished;
                }).length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <Search size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs italic">No events found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[110] bg-[#1e3a3a] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-lg p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((onboardingStep + 1) / 4) * 100}%` }} />
            </div>
            
            <div className="space-y-8 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 mx-auto">
                {onboardingStep === 0 && <Layout size={40} />}
                {onboardingStep === 1 && <Users size={40} />}
                {onboardingStep === 2 && <Smartphone size={40} />}
                {onboardingStep === 3 && <CheckCircle size={40} />}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-[#1e3a3a] uppercase font-serif">{t.dashboard.onboardingTitle}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  {onboardingStep === 0 && t.dashboard.onboardingOrganiser}
                  {onboardingStep === 1 && t.dashboard.onboardingParticipant}
                  {onboardingStep === 2 && t.dashboard.onboardingPass}
                  {onboardingStep === 3 && t.dashboard.onboardingCheckin}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                {onboardingStep < 3 ? (
                  <>
                    <button onClick={() => { setShowOnboarding(false); localStorage.setItem('shaastra_onboarding_seen', 'true'); }} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">
                      {t.dashboard.skip}
                    </button>
                    <button onClick={() => setOnboardingStep(s => s + 1)} className="flex-1 py-5 bg-[#1e3a3a] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 transition-all">
                      {t.dashboard.next}
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setShowOnboarding(false); localStorage.setItem('shaastra_onboarding_seen', 'true'); }} className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 transition-all">
                    {t.dashboard.finish}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showHistory && (
        <div className="fixed inset-0 z-[60] bg-[#1e3a3a]/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col border-l border-orange-100 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-[#1e3a3a] uppercase font-serif">{t.history}</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar">
              {savedPlans.map(p => (
                <div key={p.id} onClick={() => { setPlan(p); setShowHistory(false); }} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-orange-500 uppercase">{p.overview.eventDate}</span>
                    <button onClick={(e) => { e.stopPropagation(); setSavedPlans(prev => prev.filter(x => x.id !== p.id)); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={16}/></button>
                  </div>
                  <h4 className="text-lg font-black text-[#1e3a3a] font-serif mt-1">{p.overview.eventType}</h4>
                  <p className="text-xs font-medium text-slate-400">{p.overview.location} • {p.overview.guestCount} {t.guestsLabel}</p>
                </div>
              ))}
              {savedPlans.length === 0 && <p className="text-center text-slate-300 py-20 italic font-medium">{t.noPlans}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] bg-[#1e3a3a]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-300">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-all"><X size={24} /></button>
            <h3 className="text-2xl font-black text-[#1e3a3a] uppercase mb-10 font-serif">{t.settings}</h3>
            <div className="space-y-6">
              {[
                { id: 'autosave', label: t.autosave, icon: Smartphone },
                { id: 'notifyTasks', label: t.notifications, icon: Bell },
                { id: 'notifyRSVP', label: t.rsvpAlerts, icon: CheckCircle }
              ].map(s => (
                <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-orange-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500"><s.icon size={20} /></div>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <button 
                    onClick={() => setPlan(plan ? { ...plan, settings: { ...plan.settings!, [s.id]: !((plan.settings as any)[s.id]) } } : null)}
                    className={`w-14 h-7 rounded-full transition-all relative ${plan?.settings?.[s.id as keyof typeof plan.settings] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${plan?.settings?.[s.id as keyof typeof plan.settings] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-10 text-[10px] text-slate-300 text-center font-black uppercase tracking-[0.2em]">Deterministic Logic Engine v1.0</p>
          </div>
        </div>
      )}

      <footer className="py-20 bg-[#0a1a1a] text-white border-t border-white/5 text-center px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <h2 className="text-3xl font-black font-serif">Event Shaastra</h2>
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <span>{t.offlineFirst}</span>
            <span>{t.zeroAI}</span>
            <span>{t.privacy}</span>
          </div>
          <p className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.3em]">&copy; 2024 Design Engine</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-[#1e3a3a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-12 shadow-2xl relative border border-orange-50 animate-in zoom-in duration-300">
            <button onClick={() => setShowLogin(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-all"><X size={24} /></button>
            <h3 className="text-3xl font-black text-[#1e3a3a] uppercase mb-10 font-serif">{t.signIn}</h3>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.fullName}</label>
                <input name="name" required className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t.emailAddress}</label>
                <input name="email" type="email" required className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none font-black text-sm border border-slate-100 focus:bg-white focus:border-orange-200 transition-all" placeholder="john@example.com" />
              </div>
              <button type="submit" className="w-full py-6 bg-[#1e3a3a] text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4">{t.accessPlans}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
