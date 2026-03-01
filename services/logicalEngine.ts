
import { EventFormData, EventPlan, AppLanguage } from "../types";
import { EVENT_TEMPLATES } from "../constants";

const LOCALIZED_STRINGS: Record<AppLanguage, any> = {
  English: {
    tasks: ["Finalize Guest List", "Confirm Venue", "Hire Caterer", "Send E-Invites", "Setup Decoration", "Final Coordination"],
    budget: ["Catering", "Decoration", "Venue", "Photography", "Logistics"],
    menu: ["Appetizers", "Signature Main", "Dessert Platter", "Coolers"],
    style: "Indo-Modern",
    procurement: ["Fresh Flowers", "Guest Favors", "Ritual Kit"],
    steps: "Step",
    invite: "You are cordially invited to our celebration!",
    dayPrefix: "Day"
  },
  Hindi: {
    tasks: ["अतिथि सूची फाइनल करें", "स्थान पक्का करें", "कैटरर चुनें", "ई-निमंत्रण भेजें", "सजावट व्यवस्था", "अंतिम समन्वय"],
    budget: ["खान-पान", "सजावट", "स्थान", "फोटोग्राफी", "रसद"],
    menu: ["स्टार्टर", "मुख्य भोजन", "मिठाई की थाली", "ठंडा पेय"],
    style: "भारत-आधुनिक",
    procurement: ["ताजे फूल", "उपहार", "पूजा किट"],
    steps: "चरण",
    invite: "आप हमारे उत्सव में सादर आमंत्रित हैं!",
    dayPrefix: "दिन"
  },
  Tamil: {
    tasks: ["விருந்தினர் பட்டியலை முடிக்கவும்", "இடத்தை உறுதி செய்யவும்", "உணவு வழங்குபவரை தேர்வு செய்யவும்", "மின்-அழைப்பிதழ் அனுப்பவும்", "அலங்கார ஏற்பாடு", "இறுதி ஒருங்கிணைப்பு"],
    budget: ["உணவு", "அலங்காரம்", "இடம்", "புகைப்படம்", "தளவாடங்கள்"],
    menu: ["தொடக்க உணவு", "முக்கிய உணவு", "இனிப்பு வகைகள்", "குளிர் பானங்கள்"],
    style: "இந்தோ-நவீன",
    procurement: ["புதிய பூக்கள்", "விருந்தினர் பரிசுகள்", "சடங்கு பெட்டி"],
    steps: "படி",
    invite: "எங்கள் கொண்டாட்டத்திற்கு உங்களை அன்புடன் அழைக்கிறோம்!",
    dayPrefix: "நாள்"
  }
};

export const generateRegistrationId = (eventTitle: string, eventDate: string, sequence: number): string => {
  const code = eventTitle.substring(0, 4).toUpperCase().replace(/\s/g, 'X');
  const datePart = eventDate.replace(/-/g, '').substring(4); // MMDD
  const seqPart = sequence.toString().padStart(3, '0');
  return `${code}-${datePart}-${seqPart}`;
};

export const generateLogicalPlan = (data: EventFormData): EventPlan => {
  const lang = data.language || 'English';
  const l = LOCALIZED_STRINGS[lang];
  const budgetNum = parseFloat(data.budget || '0') || 100000;
  const eventId = Math.random().toString(36).substr(2, 9);
  
  const template = EVENT_TEMPLATES[data.eventType] || {
    decor: ['Standard Decor', 'Entrance Flowers'],
    food: ['Standard Menu', 'Beverages'],
    supplies: ['Basic Supplies'],
    suggestion: 'Plan ahead to ensure everything runs smoothly.'
  };

  // Calculate days remaining
  const eventDate = new Date(data.eventDate);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = diffDays > 0 ? diffDays : 0;

  // Entry Window Logic
  const entryWindow = data.entryWindow || "17:00";
  const eventTime = data.eventTime || "18:00";

  // Generate day-specific schedule
  const schedule = [];
  for (let i = 0; i < Math.min(daysRemaining, 7); i++) {
    const taskDate = new Date();
    taskDate.setDate(today.getDate() + i);
    schedule.push({
      day: `${l.dayPrefix} ${i + 1}`,
      date: taskDate.toISOString().split('T')[0],
      task: l.tasks[i % l.tasks.length]
    });
  }
  // Add final day task
  schedule.push({
    day: "Event Day",
    date: data.eventDate,
    task: "Execute Event & Manage Guests"
  });

  return {
    id: eventId,
    createdAt: Date.now(),
    completedItems: [],
    originalData: data,
    participants: [],
    customFacilities: [],
    expenses: [],
    media: [],
    feedback: [],
    isPublished: false,
    verificationEnabled: true,
    entryWindow: entryWindow,
    googleFormLink: `https://docs.google.com/forms/d/e/shaastra-${eventId}/viewform`,
    settings: { autosave: true, notifyTasks: true, notifyRSVP: true },
    overview: {
      eventType: data.eventType,
      location: data.location,
      guestCount: data.guestCount,
      budget: `₹${budgetNum.toLocaleString('en-IN')}`,
      eventStyle: l.style,
      toneMood: "Elegant",
      eventDate: data.eventDate,
      daysRemaining: daysRemaining,
      personalSuggestion: template.suggestion,
      description: data.specialRequirements || "A cultural celebration managed by Event Shaastra.",
      organiserInfo: "Event Shaastra Team"
    },
    budgetAllocation: l.budget.map((cat: string, i: number) => ({
      category: cat,
      percentage: i === 0 ? 40 : (i === 1 ? 25 : 11.66),
      amount: budgetNum * (i === 0 ? 0.40 : (i === 1 ? 0.25 : 0.1166))
    })),
    dailySchedule: schedule,
    procurementList: template.supplies.map((p: string) => ({
      item: p,
      sourceType: 'Mixed',
      channel: 'Local Vendors',
      timeline: 'D-3'
    })),
    tasks: l.tasks.map((t: string, i: number) => ({
      id: `task-${i}`,
      text: t,
      completed: false
    })),
    foodItems: template.food.map((f: string, i: number) => ({
      id: `food-${i}`,
      name: f,
      vendor: 'TBD',
      status: 'Pending'
    })),
    decorItems: template.decor.map((d: string, i: number) => ({
      id: `decor-${i}`,
      name: d,
      vendor: 'TBD',
      status: 'Pending'
    })),
    themeDesign: {
      colorPalette: ["Royal Gold", "Crimson", "Cream"],
      style: l.style,
      musicCategory: "Instrumental Fusion",
      lighting: "Ambient Amber",
      dressCode: "Traditional Ethnic",
      bannerText: "Welcome to our Special Day"
    },
    menu: {
      selections: template.food,
      regionalVariation: "Authentic Regional",
      budgetAlternative: [],
      kidsFriendly: ["Popcorn", "Fruit Skewers"]
    },
    guestExperience: {
      seatingPlan: "Circular Banquet",
      icebreaker: "Digital Guestbook",
      games: ["Antakshari"],
      elderComfort: "Accessible pathways",
      kidsEngagement: "Face painting"
    },
    invitationContent: {
      whatsapp: l.invite,
      short: "Join us!",
      formal: l.invite,
      emojiFriendly: "✨ " + l.invite + " ✨"
    },
    vendorCategories: l.budget,
    riskPrediction: {
      analysis: "High feasibility",
      stressLevel: 'Low',
      riskMitigation: ["Backup generators", "Catering buffer"]
    },
    participantPass: undefined, // Will be generated upon registration
    timeline: [
      { id: '1', title: 'Arrival & Welcome', time: entryWindow, location: 'Entrance', isBookmarked: true },
      { id: '2', title: 'Opening Ceremony', time: eventTime, location: 'Main Hall', isBookmarked: true },
      { id: '3', title: 'Lunch Break', time: '01:00 PM', location: 'Dining Area', isBookmarked: false },
      { id: '4', title: 'Cultural Performance', time: '03:00 PM', location: 'Stage', isBookmarked: false },
      { id: '5', title: 'Closing Remarks', time: '05:00 PM', location: 'Main Hall', isBookmarked: false }
    ],
    bookmarks: ['1', '2'],
    collaborators: []
  };
};
