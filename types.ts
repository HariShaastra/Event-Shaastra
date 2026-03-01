
export type AppLanguage = 'English' | 'Hindi' | 'Tamil';

export interface UserProfile {
  name: string;
  email: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

export interface Participant {
  name: string;
  contact: string;
  role?: string;
}

export interface RSVPGuest {
  id: string;
  name: string;
  status: 'Pending' | 'Confirmed' | 'Maybe' | 'Declined';
  count: number;
  contact?: string;
  remarks?: string;
  respondedAt?: number;
  nudgedCount?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Food' | 'Venue' | 'Transport' | 'Decorations' | 'Miscellaneous';
  paidBy: string; // The "Author" or "Payer"
  authorNote?: string;
  splitType: 'Equal' | 'Percentage' | 'Selected';
}

export type MediaType = 'Image' | 'Video' | 'Document' | 'Note';

export interface MediaEntry {
  id: string;
  url?: string; // base64 or external URL
  data?: string; // for text notes
  type: MediaType;
  mimeType?: string;
  timestamp: number;
  tag: string;
  name?: string;
  size?: number;
}

export interface FeedbackEntry {
  id: string;
  guestName: string;
  score: number; // 1-5
  category: string;
  comment: string;
  submittedAt?: number;
}

export interface SpreadsheetRow {
  [key: string]: any;
}

export interface SpreadsheetData {
  headers: string[];
  rows: SpreadsheetRow[];
}

export interface CustomModule {
  id: string;
  title: string;
  description?: string;
  type?: 'List' | 'Spreadsheet' | 'Text';
  items?: { id: string; text: string; completed: boolean }[];
  spreadsheet?: SpreadsheetData;
  text?: string;
}

export interface EventFormData {
  eventType: string;
  budget?: string;
  location: string;
  guestCount: number;
  venueType: 'home' | 'apartment' | 'hall' | 'outdoor' | 'online' | 'others';
  ageGroup: string;
  theme?: string;
  eventDate: string; 
  eventTime?: string;
  entryWindow?: string; // e.g. "12:00"
  festival?: string;
  specialRequirements?: string;
  sustainabilityMode: boolean;
  language: AppLanguage;
  attachments?: FileAttachment[];
}

export interface BudgetCategory {
  category: string;
  percentage: number;
  amount: number;
  notes?: string;
}

export interface DailyTask {
  day: string;
  date: string;
  task: string;
  isCompleted?: boolean;
}

export interface ProcurementItem {
  item: string;
  sourceType: 'Online' | 'Offline' | 'Mixed';
  channel: string;
  timeline: string;
}

export interface RSVPAnalytics {
  totalResponses: number;
  confirmed: number;
  maybe: number;
  declined: number;
  pending: number;
}

export type CheckInStatus = 'Registered' | 'Awaiting Verification' | 'Checked-In' | 'Cancelled' | 'Invalid';
export type BadgeLevel = 'Participant' | 'Explorer' | 'Enthusiast' | 'Power Attendee';

export interface ParticipantPass {
  id: string;
  name: string;
  registrationId: string;
  eventName: string;
  dateTime: string;
  venue: string;
  organization?: string;
  organiserName?: string;
  status: CheckInStatus;
  checkInCount: number;
  eventsJoined: number;
  checkInTimestamp?: number;
  timeline?: { label: string; time: string; status: 'completed' | 'upcoming' }[];
}

export interface ParticipantRecord {
  id: string;
  name: string;
  registrationId: string;
  status: CheckInStatus;
  timestamp: number;
  email?: string;
  phone?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  isBookmarked: boolean;
}

export interface Collaborator {
  email: string;
  name: string;
  role: 'Owner' | 'Collaborator';
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  vendor: string;
  status: 'Pending' | 'Finalized';
}

export interface DecorItem {
  id: string;
  name: string;
  vendor: string;
  status: 'Pending' | 'Finalized';
}

export interface EventPlan {
  id: string; 
  createdAt: number;
  completedItems?: string[]; 
  originalData?: EventFormData; 
  collaborators?: Collaborator[];
  volunteers?: Participant[];
  vendors_list?: Participant[];
  participants?: ParticipantRecord[]; // Organiser's database
  customFacilities?: CustomModule[];
  customSections?: CustomModule[];
  expenses?: Expense[];
  media?: MediaEntry[];
  feedback?: FeedbackEntry[];
  googleFormLink?: string;
  isPublished?: boolean;
  verificationEnabled?: boolean;
  entryWindow?: string; // e.g. "2 hours before"
  
  // New features
  participantPass?: ParticipantPass;
  timeline?: TimelineEvent[];
  bookmarks?: string[]; // IDs of bookmarked events
  
  // Specific Dashboard Data
  tasks?: TaskItem[];
  foodItems?: FoodItem[];
  decorItems?: DecorItem[];
  
  settings?: {
    autosave: boolean;
    notifyTasks: boolean;
    notifyRSVP: boolean;
  };
  
  overview: {
    eventType: string;
    location: string;
    guestCount: number;
    budget: string;
    eventStyle: string;
    toneMood: string;
    eventDate: string;
    daysRemaining: number;
    personalSuggestion?: string;
    description?: string;
    organiserInfo?: string;
  };
  
  budgetAllocation: BudgetCategory[];
  dailySchedule: DailyTask[];
  procurementList: ProcurementItem[];
  
  themeDesign: {
    colorPalette: string[];
    style: string;
    musicCategory: string;
    lighting: string;
    dressCode: string;
    bannerText: string;
  };
  
  menu: {
    selections: string[];
    regionalVariation: string;
    budgetAlternative: string[];
    kidsFriendly: string[];
  };
  
  guestExperience: {
    seatingPlan: string;
    icebreaker: string;
    games: string[];
    elderComfort: string;
    kidsEngagement: string;
  };
  
  invitationContent: {
    whatsapp: string;
    short: string;
    formal: string;
    emojiFriendly: string;
    regionalVariation?: string;
  };
  
  vendorCategories: string[];
  
  riskPrediction: {
    analysis: string;
    stressLevel: 'Low' | 'Moderate' | 'High';
    riskMitigation: string[];
  };
}
