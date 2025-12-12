// ===== TYPES RÉUTILISÉS DE ParentViews.tsx =====
// Types copiés directement de votre code web existant

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string; // Format YYYY-MM-DD
  gender: 'M' | 'F';
  photoUrl: string | null;
  groupId: number;
  isActive: boolean;
  payments: Payment[];
  attendance: Attendance[];
  notes: Note[];
  badges?: Badge[];
}

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  type: 'Mensuel' | 'Annuel' | 'Événement' | 'Marchandise' | 'mensuel' | 'annuel' | 'evenement' | 'marchandise';
  isPaid: boolean;
  eventId?: number;
  eventTitle?: string;
  productId?: number;
  description?: string;
  imageUrl?: string;
}

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  isPresent: boolean;
  sessionId?: number;
}

export interface Note {
  id: number;
  studentId: number;
  content: string;
  date: string;
  isVisibleToParent: boolean;
  authorId: number;
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
}

export interface Group {
  id: number;
  name: string;
  icon: string;
  level?: string;
}

export interface Event {
  id: number | string;
  title: string;
  description: string;
  date: string;
  price: number;
  imageUrl: string;
  availableTickets?: number;
  maxTickets?: number;
  registeredStudentIds: (number | string)[];
  showOnLanding?: boolean;
}

export interface EventRegistration {
  eventId: string;
  eventTitle?: string;
  eventPrice?: number;
  studentId: string;
  studentName?: string;
  registeredAt: string;
  isPaid: boolean;
  paymentDeadline: string;
  daysRemaining?: number;
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  showOnLanding?: boolean;
}

export interface User {
  id: number | string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'parent' | 'admin' | 'coach' | 'PARENT' | 'ADMIN' | 'COACH';
  photoUrl?: string;
}

// Type pour le statut de paiement (réutilisé de ParentViews.tsx)
export type PaymentStatus = 'PAID' | 'GRACE_PERIOD' | 'OVERDUE' | 'NO_SUBSCRIPTION';

// Type pour l'authentification
export interface AuthResponse {
  token: string;
  user: User;
  students: Student[];
}

// Type pour le contexte utilisateur
export interface UserContext {
  user: User | null;
  students: Student[];
  token: string | null;
}
