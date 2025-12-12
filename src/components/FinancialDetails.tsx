import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';

interface FinancialDetailsProps {
  student: Student;
  onClose: () => void;
}

export const FinancialDetails: React.FC<FinancialDetailsProps> = ({ student, onClose }) => {
  // Calculer les mois de l'année scolaire (Sept à Août)
  const getSchoolYearMonths = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const schoolYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;
    
    const months = [
      { name: 'Sept', month: 9, year: schoolYearStart },
      { name: 'Oct', month: 10, year: schoolYearStart },
      { name: 'Nov', month: 11, year: schoolYearStart },
      { name: 'Déc', month: 12, year: schoolYearStart },
      { name: 'Jan', month: 1, year: schoolYearStart + 1 },
      { name: 'Fév', month: 2, year: schoolYearStart + 1 },
      { name: 'Mars', month: 3, year: schoolYearStart + 1 },
      { name: 'Avr', month: 4, year: schoolYearStart + 1 },
      { name: 'Mai', month: 5, year: schoolYearStart + 1 },
      { name: 'Juin', month: 6, year: schoolYearStart + 1 },
      { name: 'Juil', month: 7, year: schoolYearStart + 1 },
      { name: 'Août', month: 8, year: schoolYearStart + 1 },
    ];
    
    return months;
  };

  const months = getSchoolYearMonths();

  // Vérifier si un mois est payé
  const isMonthPaid = (month: number, year: number) => {
    return student.payments.some(p => {
      if (!p.isPaid) return false;
      const pDate = new Date(p.date);
      return pDate.getMonth() + 1 === month && pDate.getFullYear() === year;
    });
  };

  // Filtrer les événements
  const eventPayments = student.payments.filter(p => p.type === 'evenement');
  
  // Historique des paiements (triés par date décroissante)
  const sortedPayments = [...student.payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.98)', 'rgba(30, 41, 59, 0.98)']}
        style={styles.modalContent}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💰 Détails Financiers</Text>
            <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
          </View>

          {/* Événements participés */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Événements Participés</Text>
            {eventPayments.length > 0 ? (
              <View style={styles.eventsGrid}>
                {eventPayments.map((payment, index) => (
                  <LinearGradient
                    key={index}
                    colors={payment.isPaid 
                      ? ['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']
                      : ['rgba(239, 68, 68, 0.2)', 'rgba(249, 115, 22, 0.2)']
                    }
                    style={styles.eventCard}
                  >
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {payment.description || 'Événement'}
                      </Text>
                      <View style={styles.eventFooter}>
                        <Text style={styles.eventAmount}>{payment.amount}€</Text>
                        <View style={[
                          styles.eventBadge,
                          { backgroundColor: payment.isPaid ? '#10b981' : '#ef4444' }
                        ]}>
                          <Text style={styles.eventBadgeText}>
                            {payment.isPaid ? '✓ Payé' : '✗ Impayé'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun événement</Text>
              </View>
            )}
          </View>

          {/* Calendrier mensuel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Calendrier des Paiements Mensuels</Text>
            <View style={styles.monthsGrid}>
              {months.map((m, index) => {
                const isPaid = isMonthPaid(m.month, m.year);
                return (
                  <LinearGradient
                    key={index}
                    colors={isPaid 
                      ? ['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.2)']
                      : ['rgba(100, 116, 139, 0.2)', 'rgba(71, 85, 105, 0.2)']
                    }
                    style={[
                      styles.monthBox,
                      { borderColor: isPaid ? '#10b981' : 'rgba(100, 116, 139, 0.3)' }
                    ]}
                  >
                    <Text style={[
                      styles.monthName,
                      { color: isPaid ? '#10b981' : '#94a3b8' }
                    ]}>
                      {m.name}
                    </Text>
                    {isPaid && <Text style={styles.checkMark}>✓</Text>}
                  </LinearGradient>
                );
              })}
            </View>
          </View>

          {/* Historique des paiements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Historique Complet</Text>
            {sortedPayments.length > 0 ? (
              <View style={styles.historyList}>
                {sortedPayments.map((payment, index) => (
                  <LinearGradient
                    key={index}
                    colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']}
                    style={styles.historyRow}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>
                        {new Date(payment.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.historyDesc}>
                        {payment.description || payment.type}
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyAmount}>{payment.amount}€</Text>
                      <View style={[
                        styles.historyStatus,
                        { backgroundColor: payment.isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                      ]}>
                        <Text style={[
                          styles.historyStatusText,
                          { color: payment.isPaid ? '#10b981' : '#ef4444' }
                        ]}>
                          {payment.isPaid ? '✓ Payé' : '✗ Impayé'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun paiement enregistré</Text>
              </View>
            )}
          </View>

          {/* Bouton fermer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <LinearGradient
              colors={['#eab308', '#f59e0b', '#eab308']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#eab308',
    textAlign: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06b6d4',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#a855f7',
    marginBottom: 12,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  eventContent: {
    gap: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    minHeight: 40,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#eab308',
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthBox: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  monthName: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  checkMark: {
    fontSize: 20,
    color: '#10b981',
    marginTop: 4,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  historyLeft: {
    flex: 1,
    gap: 4,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  historyDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#eab308',
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
});
