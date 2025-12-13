import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student, Group } from '../types';
import { getAvatarPlaceholder } from '../utils/helpers';

const { width } = Dimensions.get('window');

interface DashboardScreenNewProps {
  students: Student[];
  onRefresh: () => Promise<void>;
  onStudentPress: (student: Student) => void;
  navigation?: any;
}

export const DashboardScreenNew: React.FC<DashboardScreenNewProps> = ({
  students,
  onRefresh,
  onStudentPress,
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [groups, setGroups] = useState<{ [key: number]: Group }>({});

  // Charger les groupes depuis l'API
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await fetch('http://141.227.133.61:3000/api/groups');
      if (response.ok) {
        const groupsData: Group[] = await response.json();
        const groupsMap: { [key: number]: Group } = {};
        groupsData.forEach((group) => {
          groupsMap[group.id] = group;
        });
        setGroups(groupsMap);
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    await loadGroups();
    setRefreshing(false);
  };

  if (students.length === 0) {
    return (
      <LinearGradient colors={['#1a1d3d', '#2d3561']} style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun élève trouvé</Text>
        </View>
      </LinearGradient>
    );
  }

  const student = students[selectedStudentIndex];
  
  // ===== LOGIQUE DE PAIEMENT (comme ParentViews.tsx) =====
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  const dayOfMonth = today.getDate();
  
  // Vérifier si l'élève a des engagements (paiements configurés)
  const hasPayments = student.payments && student.payments.length > 0;
  
  // 1. Vérifier s'il y a un abonnement annuel actif pour l'année scolaire en cours
  const currentSchoolYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  const hasActiveYearlySubscription = student.payments?.some(p => {
    if (p.type !== 'Annuel' && p.type !== 'annuel') return false;
    if (!p.isPaid) return false;
    const pDate = new Date(p.date);
    const pMonth = pDate.getMonth() + 1;
    const pYear = pDate.getFullYear();
    const pSchoolYear = pMonth >= 9 ? pYear : pYear - 1;
    return pSchoolYear === currentSchoolYear;
  });
  
  // 2. Vérifier le paiement du mois courant
  const currentMonthPayment = student.payments?.find(p => {
    const pDate = new Date(p.date);
    return pDate.getMonth() + 1 === currentMonth && 
           pDate.getFullYear() === currentYear &&
           (p.type === 'Mensuel' || p.type === 'mensuel');
  });
  
  // 3. Déterminer le statut de paiement
  let paymentStatus: 'PAID' | 'GRACE_PERIOD' | 'OVERDUE' | 'NO_SUBSCRIPTION' = 'NO_SUBSCRIPTION';
  
  if (hasActiveYearlySubscription) {
    // Abonnement annuel payé → VERT
    paymentStatus = 'PAID';
  } else if (currentMonthPayment?.isPaid) {
    // Mois courant payé → VERT
    paymentStatus = 'PAID';
  } else if (hasPayments) {
    // Il y a des engagements mais le mois courant n'est pas payé
    if (dayOfMonth <= 5) {
      // Du 1er au 5 → ORANGE (délai de grâce)
      paymentStatus = 'GRACE_PERIOD';
    } else {
      // Après le 5 → ROUGE (retard)
      paymentStatus = 'OVERDUE';
    }
  }
  
  const hasPaymentIssue = paymentStatus === 'OVERDUE';
  const hasPaymentWarning = paymentStatus === 'GRACE_PERIOD';
  
  // Séparer les paiements impayés en deux catégories
  const unpaidSubscriptions = student.payments?.filter(p => 
    !p.isPaid && (p.type === 'Mensuel' || p.type === 'mensuel' || p.type === 'Annuel' || p.type === 'annuel')
  ) || [];
  
  const unpaidOthers = student.payments?.filter(p => 
    !p.isPaid && (p.type !== 'Mensuel' && p.type !== 'mensuel' && p.type !== 'Annuel' && p.type !== 'annuel')
  ) || [];

  const totalSubscriptionsUnpaid = unpaidSubscriptions.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOthersUnpaid = unpaidOthers.reduce((sum, p) => sum + Number(p.amount), 0);
  
  const hasUnpaidPayments = unpaidSubscriptions.length > 0;
  const hasUnpaidOthers = unpaidOthers.length > 0;

  // ===== LOGIQUE ANNIVERSAIRE (comme ParentViews.tsx) =====
  const birthDateParts = student.birthDate.split('-'); // Format: YYYY-MM-DD
  const birthDay = parseInt(birthDateParts[2], 10);
  const birthMonth = parseInt(birthDateParts[1], 10);
  const birthYear = parseInt(birthDateParts[0], 10);
  
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  
  const isBirthdayToday = todayDay === birthDay && todayMonth === birthMonth;
  
  // Vérifier si c'est demain (veille d'anniversaire)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  const tomorrowMonth = tomorrow.getMonth() + 1;
  
  const isBirthdayTomorrow = tomorrowDay === birthDay && tomorrowMonth === birthMonth;
  
  // Calculer l'âge
  let age = currentYear - birthYear;
  const monthDiff = todayMonth - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && todayDay < birthDay)) {
    age--;
  }

  // Calculer le taux de présence
  const attendanceRate = student.attendance?.length > 0
    ? Math.round((student.attendance.filter((a: any) => a.isPresent).length / student.attendance.length) * 100)
    : 0;

  // Absences récentes (30 derniers jours)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentAbsences = student.attendance?.filter((a: any) => {
    const absenceDate = new Date(a.date);
    return !a.isPresent && absenceDate >= thirtyDaysAgo && absenceDate <= today;
  }) || [];

  // Paiements effectués (boutique)
  const paidPayments = student.payments?.filter(p => p.isPaid) || [];
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <LinearGradient colors={['#1a1d3d', '#2d3561']} style={styles.container}>
      {/* Menu de navigation en haut */}
      <View style={styles.topMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation?.navigate('Shop')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🛍️</Text>
          </View>
          <Text style={styles.menuLabel}>Boutique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation?.navigate('Events')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🎉</Text>
          </View>
          <Text style={styles.menuLabel}>Événements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation?.navigate('Absences')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📊</Text>
          </View>
          <Text style={styles.menuLabel}>Absences</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#c084fc"
          />
        }
      >
        {/* Header avec photo de profil */}
        <View style={styles.header}>
          {/* Badge Anniversaire */}
          {isBirthdayToday && (
            <View style={styles.birthdayBanner}>
              <Text style={styles.birthdayText}>🎂 JOYEUX ANNIVERSAIRE {student.firstName.toUpperCase()} ! 🎉</Text>
              <Text style={styles.birthdayAge}>{age} ans aujourd'hui !</Text>
            </View>
          )}
          {!isBirthdayToday && isBirthdayTomorrow && (
            <View style={styles.birthdayTomorrowBanner}>
              <Text style={styles.birthdayTomorrowText}>
                📅 Demain c'est l'anniversaire de {student.firstName} ! 🎂
              </Text>
            </View>
          )}
          
          <View style={styles.profileSection}>
            <LinearGradient
              colors={isBirthdayToday ? ['#f472b6', '#fbbf24'] : ['#c084fc', '#a855f7']}
              style={styles.avatarGradient}
            >
              <Image
                source={{
                  uri: imageService.getUrl(student.photoUrl) || imageService.getAvatarPlaceholder(`${student.firstName} ${student.lastName}`, student.gender),
                }}
                style={styles.avatar}
              />
            </LinearGradient>
            <View style={styles.nameSection}>
              <Text style={styles.studentName}>{student.firstName}</Text>
              {student.lastName && (
                <Text style={styles.studentGroup}>{student.lastName.toUpperCase()}</Text>
              )}
              {groups[student.groupId] && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryIcon}>{groups[student.groupId].icon || '🎓'}</Text>
                  <Text style={styles.categoryText}>
                    {groups[student.groupId].name}
                  </Text>
                </View>
              )}
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>👤 {student.isActive ? 'ACTIF' : 'INACTIF'}</Text>
              </View>
            </View>
          </View>

          {/* Bouton d'édition */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Cartes Présence et Paiements */}
        <View style={styles.statsRow}>
          {/* Carte Présence */}
          <LinearGradient
            colors={['#1e3a5f', '#2d4a6f']}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>PRÉSENCE</Text>
              <Text style={styles.statIcon}>📅</Text>
            </View>
            <Text style={styles.statValue}>{attendanceRate}%</Text>
            <Text style={styles.statLabel}>assiduité</Text>
          </LinearGradient>

          {/* Carte Paiements */}
          <LinearGradient
            colors={
              hasPaymentIssue 
                ? ['#5e1e1e', '#7f2d2d'] 
                : hasPaymentWarning 
                ? ['#5e3a1e', '#7f5d2d']
                : ['#1e3a5f', '#2d4a6f']
            }
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>PAIEMENTS</Text>
              <Text style={styles.statIcon}>🔔</Text>
            </View>
            {hasPaymentIssue ? (
              <>
                <View style={styles.paymentWarning}>
                  <Text style={styles.warningIcon}>⊗</Text>
                  <Text style={styles.warningText}>Retard</Text>
                </View>
                <Text style={styles.warningSubtext}>Paiement urgent</Text>
              </>
            ) : hasPaymentWarning ? (
              <>
                <View style={styles.paymentWarning}>
                  <Text style={[styles.warningIcon, { color: '#f59e0b' }]}>⏱</Text>
                  <Text style={[styles.warningText, { color: '#ffffff' }]}>Délai de grâce</Text>
                </View>
                <Text style={[styles.warningSubtext, { color: '#fdba74' }]}>Payer avant le 5</Text>
              </>
            ) : paymentStatus === 'PAID' ? (
              <>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>✓</Text>
                <Text style={[styles.statLabel, { color: '#86efac' }]}>À jour</Text>
              </>
            ) : (
              <>
                <Text style={[styles.statValue, { color: '#94a3b8' }]}>-</Text>
                <Text style={[styles.statLabel, { color: '#94a3b8' }]}>Non inscrit</Text>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Paiements en attente (Orange - Marchandises/Événements) */}
        {unpaidOthers.length > 0 && (
          <LinearGradient
            colors={['#4a3520', '#6b4e2a']}
            style={styles.warningCard}
          >
            <View style={styles.warningHeader}>
              <Text style={styles.warningIconLarge}>⚠️</Text>
              <Text style={styles.warningTitle}>PAIEMENTS EN ATTENTE</Text>
            </View>

            {unpaidOthers.map((payment, idx) => {
              const paymentDate = new Date(payment.date);
              const monthName = paymentDate.toLocaleDateString('fr-FR', { month: 'long' });
              const year = paymentDate.getFullYear();
              const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

              return (
                <View key={idx} style={styles.paymentItem}>
                  <View style={styles.paymentLeft}>
                    <Text style={styles.paymentIcon}>⊗</Text>
                    <View>
                      <Text style={styles.paymentDate}>{capitalizedMonth} {year}</Text>
                      <Text style={styles.paymentDesc}>
                        {payment.type || 'marchandise'} • {payment.description || 'Achat'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.paymentAmount}>{payment.amount}.00 DT</Text>
                </View>
              );
            })}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL À RÉGLER :</Text>
              <Text style={styles.totalAmount}>{totalOthersUnpaid} DT</Text>
            </View>
          </LinearGradient>
        )}

        {/* Absences récentes */}
        {recentAbsences.length > 0 && (
          <LinearGradient
            colors={['#5e3a1e', '#7f5d2d']}
            style={styles.absencesCard}
          >
            <View style={styles.warningHeader}>
              <Text style={styles.warningIconLarge}>⚠️</Text>
              <Text style={styles.warningTitle}>
                ABSENCES RÉCENTES (30 DERNIERS JOURS)
              </Text>
            </View>

            {recentAbsences.slice(0, 3).map((absence: any, idx: number) => {
              const absenceDate = new Date(absence.date);
              const formattedDate = absenceDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });

              return (
                <View key={idx} style={styles.absenceItem}>
                  <Text style={styles.absenceIcon}>⊗</Text>
                  <Text style={styles.absenceDate}>{formattedDate}</Text>
                  {groups[student.groupId] && (
                    <Text style={styles.absenceGroup}>{groups[student.groupId].name}</Text>
                  )}
                </View>
              );
            })}
          </LinearGradient>
        )}

        {/* Situation financière */}
        <LinearGradient
          colors={['#2d2d5a', '#3d3d6a']}
          style={styles.financialCard}
        >
          <View style={styles.financialHeader}>
            <Text style={styles.financialIcon}>💰</Text>
            <Text style={styles.financialTitle}>SITUATION FINANCIÈRE</Text>
          </View>

          <View style={styles.financialSection}>
            <Text style={styles.financialSectionTitle}>DÉTAILS PAR CATÉGORIE</Text>
            <View style={styles.financialItem}>
              <View style={styles.financialLeft}>
                <Text style={styles.financialItemIcon}>🛍️</Text>
                <Text style={styles.financialItemLabel}>Boutique</Text>
              </View>
              <View style={styles.financialAmounts}>
                <Text style={styles.financialPaid}>0 DT ✓</Text>
                <Text style={styles.financialUnpaid}>{totalOthersUnpaid} DT ✗</Text>
              </View>
            </View>
          </View>

          <View style={styles.financialSection}>
            <Text style={styles.financialSectionTitle}>TYPE D'ENGAGEMENT</Text>
            <Text style={styles.financialNoData}>Aucun engagement enregistré</Text>
          </View>

          <View style={styles.financialSection}>
            <Text style={styles.financialSectionTitle}>ÉVÉNEMENTS PARTICIPÉS</Text>
            <Text style={styles.financialNoData}>Aucune participation aux événements</Text>
          </View>

          <View style={styles.financialSection}>
            <Text style={styles.financialSectionTitle}>HISTORIQUE DES PAIEMENTS</Text>
            {student.payments && student.payments.length > 0 ? (
              <View style={styles.historyTable}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyHeaderText, { flex: 2 }]}>Date</Text>
                  <Text style={[styles.historyHeaderText, { flex: 2 }]}>Type</Text>
                  <Text style={[styles.historyHeaderText, { flex: 1.5 }]}>Montant</Text>
                  <Text style={[styles.historyHeaderText, { flex: 1 }]}>Statut</Text>
                </View>
                {student.payments.slice(0, 5).map((payment, idx) => {
                  const paymentDate = new Date(payment.date);
                  const formattedDate = paymentDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <View key={idx} style={styles.historyRow}>
                      <Text style={[styles.historyCell, { flex: 2 }]}>{formattedDate}</Text>
                      <Text style={[styles.historyCell, { flex: 2 }]}>{payment.description || payment.type}</Text>
                      <Text style={[styles.historyCell, { flex: 1.5 }]}>{payment.amount}.00 DT</Text>
                      <Text style={[styles.historyCell, { flex: 1 }]}>
                        {payment.isPaid ? '✓' : '⊗'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.financialNoData}>Aucun paiement enregistré</Text>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(192, 132, 252, 0.2)',
    paddingTop: 50,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuLabel: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  birthdayBanner: {
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
    borderWidth: 2,
    borderColor: '#f472b6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  birthdayText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  birthdayAge: {
    color: '#f472b6',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  birthdayTomorrowBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  birthdayTomorrowText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#1a1d3d',
  },
  nameSection: {
    flex: 1,
  },
  studentName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#c084fc',
    marginBottom: 2,
  },
  studentGroup: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: 1,
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c084fc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    color: '#1a1d3d',
    fontSize: 11,
    fontWeight: '800',
  },
  roleBadge: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editIcon: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#06b6d4',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  paymentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  warningIcon: {
    fontSize: 24,
    color: '#ef4444',
  },
  warningText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  warningSubtext: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '700',
  },
  warningCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  absencesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  warningIconLarge: {
    fontSize: 16,
  },
  warningTitle: {
    color: '#fb923c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  paymentIcon: {
    fontSize: 18,
    color: '#fb923c',
  },
  paymentDate: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  paymentDesc: {
    color: '#fdba74',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentAmount: {
    color: '#fb923c',
    fontSize: 22,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'rgba(251, 146, 60, 0.3)',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    color: '#fdba74',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalAmount: {
    color: '#fb923c',
    fontSize: 28,
    fontWeight: '900',
  },
  absenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  absenceIcon: {
    fontSize: 14,
    color: '#fb923c',
    marginRight: 8,
  },
  absenceDate: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  absenceGroup: {
    color: '#94a3b8',
    fontSize: 11,
  },
  financialCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  financialIcon: {
    fontSize: 16,
  },
  financialTitle: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  financialSection: {
    marginBottom: 16,
  },
  financialSectionTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
  },
  financialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  financialItemIcon: {
    fontSize: 14,
  },
  financialItemLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  financialAmounts: {
    flexDirection: 'row',
    gap: 12,
  },
  financialPaid: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '700',
  },
  financialUnpaid: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  financialNoData: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    padding: 10,
  },
  historyHeaderText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyCell: {
    color: '#e2e8f0',
    fontSize: 11,
  },
});
