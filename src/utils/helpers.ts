import { Student, PaymentStatus, Payment } from '../types';

// ===== LOGIQUE MÉTIER COPIÉE DE ParentViews.tsx =====
// Calcul du statut de paiement (identique au code web)

export const calculatePaymentStatus = (student: Student): PaymentStatus => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  const dayOfMonth = today.getDate();
  
  const hasPayments = student.payments.length > 0;
  
  // 1. Vérifier abonnement annuel actif
  const currentSchoolYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  const hasActiveYearlySubscription = student.payments.some(p => {
    if (p.type !== 'Annuel' && p.type !== 'annuel') return false;
    if (!p.isPaid) return false;
    const pDate = new Date(p.date);
    const pMonth = pDate.getMonth() + 1;
    const pYear = pDate.getFullYear();
    const pSchoolYear = pMonth >= 9 ? pYear : pYear - 1;
    return pSchoolYear === currentSchoolYear;
  });
  
  // 2. Vérifier paiement du mois courant
  const currentMonthPayment = student.payments.find((p: Payment) => {
    const pDate = new Date(p.date);
    return pDate.getMonth() + 1 === currentMonth && 
           pDate.getFullYear() === currentYear &&
           (p.type === 'Mensuel' || p.type === 'mensuel');
  });
  
  // 3. Déterminer le statut
  if (hasActiveYearlySubscription) {
    return 'PAID'; // Abonnement annuel payé → VERT
  } else if (currentMonthPayment?.isPaid) {
    return 'PAID'; // Mois courant payé → VERT
  } else if (hasPayments) {
    if (dayOfMonth <= 5) {
      return 'GRACE_PERIOD'; // Du 1er au 5 → ORANGE
    } else {
      return 'OVERDUE'; // Après le 5 → ROUGE
    }
  }
  
  return 'NO_SUBSCRIPTION';
};

// Calcul du taux de présence
export const calculateAttendanceRate = (student: Student): number => {
  if (student.attendance.length === 0) return 0;
  const presentCount = student.attendance.filter(a => a.isPresent).length;
  return Math.round((presentCount / student.attendance.length) * 100);
};

// Vérifier si c'est l'anniversaire aujourd'hui
export const isBirthdayToday = (birthDate: string): boolean => {
  const today = new Date();
  const parts = birthDate.split('-'); // YYYY-MM-DD
  const birthDay = parseInt(parts[2], 10);
  const birthMonth = parseInt(parts[1], 10);
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  
  return todayDay === birthDay && todayMonth === birthMonth;
};

// Vérifier si c'est l'anniversaire demain
export const isBirthdayTomorrow = (birthDate: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const parts = birthDate.split('-');
  const birthDay = parseInt(parts[2], 10);
  const birthMonth = parseInt(parts[1], 10);
  const tomorrowDay = tomorrow.getDate();
  const tomorrowMonth = tomorrow.getMonth() + 1;
  
  return tomorrowDay === birthDay && tomorrowMonth === birthMonth;
};

// Calculer l'âge
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10);
  const birthDay = parseInt(parts[2], 10);
  const currentYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  
  let age = currentYear - birthYear;
  const monthDiff = todayMonth - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && todayDay < birthDay)) {
    age--;
  }
  return age;
};

// Obtenir l'avatar placeholder selon le genre
export const getAvatarPlaceholder = (gender: 'M' | 'F'): string => {
  return gender === 'F' 
    ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=female'
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=male';
};

// Formater la date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};
