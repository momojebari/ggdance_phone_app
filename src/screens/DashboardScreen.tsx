import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';
import {
  calculatePaymentStatus,
  calculateAttendanceRate,
  isBirthdayToday,
  isBirthdayTomorrow,
  getAvatarPlaceholder,
} from '../utils/helpers';

interface DashboardScreenProps {
  students: Student[];
  onRefresh: () => Promise<void>;
  onStudentPress: (student: Student) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  students,
  onRefresh,
  onStudentPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderStudentCard = ({ item: student }: { item: Student }) => {
    const paymentStatus = calculatePaymentStatus(student);
    const attendanceRate = calculateAttendanceRate(student);
    const birthdayToday = isBirthdayToday(student.birthDate);
    const birthdayTomorrow = isBirthdayTomorrow(student.birthDate);

    // Couleurs du statut de paiement (exactement comme ParentViews.tsx)
    const statusColors = {
      PAID: '#22c55e',
      GRACE_PERIOD: '#f59e0b',
      OVERDUE: '#ef4444',
      NO_SUBSCRIPTION: '#64748b',
    };

    const statusLabels = {
      PAID: 'À jour',
      GRACE_PERIOD: 'Période de grâce',
      OVERDUE: 'En retard',
      NO_SUBSCRIPTION: 'Non inscrit',
    };

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => onStudentPress(student)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#1e293b', '#334155']}
          style={styles.cardGradient}
        >
          {/* En-tête avec photo et badges anniversaire */}
          <View style={styles.cardHeader}>
            <Image
              source={{
                uri: student.photoUrl || getAvatarPlaceholder(student.gender),
              }}
              style={styles.avatar}
            />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.firstName} {student.lastName}
              </Text>
              <Text style={styles.groupName}>ID Groupe: {student.groupId}</Text>
            </View>

            {/* Badges anniversaire (comme ParentViews.tsx) */}
            {birthdayToday && (
              <View style={[styles.badge, { backgroundColor: '#eab308' }]}>
                <Text style={styles.badgeText}>🎂 Aujourd'hui!</Text>
              </View>
            )}
            {birthdayTomorrow && !birthdayToday && (
              <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.badgeText}>🎉 Demain</Text>
              </View>
            )}
          </View>

          {/* Statut de paiement */}
          <View style={styles.cardBody}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Paiement</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[paymentStatus] },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {statusLabels[paymentStatus]}
                </Text>
              </View>
            </View>

            {/* Taux de présence */}
            {student.attendance && student.attendance.length > 0 && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Présence</Text>
                <View style={styles.attendanceContainer}>
                  <View style={styles.attendanceBarBackground}>
                    <View
                      style={[
                        styles.attendanceBarFill,
                        {
                          width: `${attendanceRate}%`,
                          backgroundColor:
                            attendanceRate >= 80
                              ? '#22c55e'
                              : attendanceRate >= 50
                              ? '#f59e0b'
                              : '#ef4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.attendanceText}>{attendanceRate}%</Text>
                </View>
              </View>
            )}

            {/* Statut actif/inactif */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Statut</Text>
              <Text
                style={[
                  styles.activeStatus,
                  student.isActive ? styles.activeStatusActive : styles.activeStatusInactive,
                ]}
              >
                {student.isActive ? '✓ Actif' : '✗ Inactif'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (students.length === 0) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucun élève associé à votre compte
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Contactez l'administration pour plus d'informations
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudentCard}
        keyExtractor={(item: Student) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#eab308"
            colors={['#eab308']}
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  studentCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#eab308',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 14,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardBody: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceBarBackground: {
    width: 100,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  attendanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  attendanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f8fafc',
    minWidth: 40,
  },
  activeStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatusActive: {
    color: '#22c55e',
  },
  activeStatusInactive: {
    color: '#ef4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
