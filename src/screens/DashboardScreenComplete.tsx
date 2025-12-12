import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';
import {
  calculatePaymentStatus,
  calculateAttendanceRate,
  isBirthdayToday,
  isBirthdayTomorrow,
  getAvatarPlaceholder,
  calculateAge,
} from '../utils/helpers';
import { FinancialDetails } from '../components/FinancialDetails';
import { AttendanceCalendar } from '../components/AttendanceCalendar';
import { EditChildModal } from '../components/EditChildModal';

const { width } = Dimensions.get('window');

interface DashboardScreenCompleteProps {
  students: Student[];
  onRefresh: () => Promise<void>;
  onUpdatePhoto?: (studentId: string, photoUri: string) => Promise<void>;
  navigation?: any;
}

export const DashboardScreenComplete: React.FC<DashboardScreenCompleteProps> = ({
  students,
  onRefresh,
  onUpdatePhoto,
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditPhoto, setShowEditPhoto] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const openFinancials = (student: Student) => {
    setSelectedStudent(student);
    setShowFinancials(true);
  };

  const openCalendar = (student: Student) => {
    setSelectedStudent(student);
    setShowCalendar(true);
  };

  const openEditPhoto = (student: Student) => {
    setSelectedStudent(student);
    setShowEditPhoto(true);
  };

  const renderStudentCard = (student: Student, index: number) => {
    const paymentStatus = calculatePaymentStatus(student);
    const attendanceRate = calculateAttendanceRate(student);
    const birthdayToday = isBirthdayToday(student.birthDate);
    const birthdayTomorrow = isBirthdayTomorrow(student.birthDate);
    const age = calculateAge(student.birthDate);

    const isInactive = student.isActive === false;
    const cardGradient: [string, string, ...string[]] = isInactive
      ? ['rgba(15, 23, 42, 0.5)', 'rgba(30, 41, 59, 0.5)']
      : birthdayToday
      ? ['rgba(147, 51, 234, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(234, 179, 8, 0.8)']
      : ['rgba(30, 41, 59, 0.9)', 'rgba(88, 28, 135, 0.2)', 'rgba(30, 41, 59, 0.9)'];

    const borderColor = isInactive
      ? 'rgba(239, 68, 68, 0.3)'
      : birthdayToday
      ? 'rgba(234, 179, 8, 1)'
      : 'rgba(168, 85, 247, 0.4)';

    const statusColors = {
      PAID: { bg: 'rgba(16, 185, 129, 0.3)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', icon: '✓' },
      GRACE_PERIOD: { bg: 'rgba(249, 115, 22, 0.3)', border: 'rgba(249, 115, 22, 0.4)', text: '#f97316', icon: '⏱' },
      OVERDUE: { bg: 'rgba(239, 68, 68, 0.3)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', icon: '✗' },
      NO_SUBSCRIPTION: { bg: 'rgba(100, 116, 139, 0.3)', border: 'rgba(100, 116, 139, 0.3)', text: '#64748b', icon: '⚠' },
    };

    const statusStyle = statusColors[paymentStatus];
    const statusLabels = {
      PAID: 'À jour',
      GRACE_PERIOD: 'Délai de grâce',
      OVERDUE: 'Retard',
      NO_SUBSCRIPTION: 'Non inscrit',
    };

    return (
      <View key={student.id} style={[styles.cardContainer, { borderColor, opacity: isInactive ? 0.6 : 1 }]}>
        <LinearGradient colors={cardGradient} style={styles.cardGradient}>
          {isInactive && (
            <View style={styles.badgeInactive}>
              <Text style={styles.badgeInactiveText}>✗ DÉSACTIVÉ</Text>
            </View>
          )}

          {birthdayToday && (
            <LinearGradient
              colors={['#ec4899', '#a855f7', '#eab308']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeBirthday}
            >
              <Text style={styles.badgeBirthdayText}>🎂 JOYEUX ANNIVERSAIRE ! 🎉</Text>
            </LinearGradient>
          )}

          {!birthdayToday && birthdayTomorrow && (
            <LinearGradient
              colors={['#eab308', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeBirthday}
            >
              <Text style={styles.badgeBirthdayText}>📅 Demain c'est l'anniversaire ! 🎂</Text>
            </LinearGradient>
          )}

          <View style={styles.cardContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => openEditPhoto(student)} style={styles.avatarContainer}>
                <LinearGradient
                  colors={birthdayToday ? ['#ec4899', '#a855f7', '#eab308'] : ['#a855f7', '#ec4899', '#06b6d4']}
                  style={styles.avatarBorder}
                >
                  <Image
                    source={{ 
                      uri: student.photoUrl?.startsWith('http') 
                        ? student.photoUrl 
                        : student.photoUrl?.startsWith('/uploads')
                        ? `http://141.227.133.61:3000${student.photoUrl}`
                        : student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName + ' ' + student.lastName)}&background=a855f7&color=fff&bold=true&size=200`
                    }}
                    style={styles.avatar}
                    defaultSource={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName + ' ' + student.lastName)}&background=a855f7&color=fff&bold=true&size=200` }}
                  />
                </LinearGradient>
                {birthdayToday && <Text style={styles.birthdayEmojiOnPhoto}>🎂</Text>}
                <View style={styles.editPhotoOverlay}>
                  <Text style={styles.editPhotoText}>📷</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.studentInfo}>
                {birthdayToday && (
                  <View style={styles.birthdayMessageBox}>
                    <Text style={styles.birthdayMessage}>
                      🎉 {student.firstName} a {age} ans aujourd'hui ! 🎈
                    </Text>
                  </View>
                )}
                
                <Text style={[styles.studentName, isInactive && styles.studentNameInactive]}>
                  {student.firstName}
                  {isInactive && <Text style={styles.inactiveLabel}> (DÉSACTIVÉ)</Text>}
                </Text>
                <Text style={[styles.studentLastName, isInactive && styles.studentLastNameInactive]}>
                  {student.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <LinearGradient
                colors={['rgba(6, 182, 212, 0.3)', 'rgba(15, 23, 42, 0.5)']}
                style={styles.statCard}
              >
                <Text style={styles.statLabel}>Présence</Text>
                <Text style={styles.statValue}>{attendanceRate}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${attendanceRate}%`, backgroundColor: '#06b6d4' }]} />
                </View>
              </LinearGradient>

              <LinearGradient
                colors={[statusStyle.bg, 'rgba(15, 23, 42, 0.5)']}
                style={[styles.statCard, { borderColor: statusStyle.border }]}
              >
                <Text style={styles.statLabel}>Paiement</Text>
                <View style={styles.paymentStatusContainer}>
                  <Text style={[styles.paymentIcon, { color: statusStyle.text }]}>{statusStyle.icon}</Text>
                  <Text style={[styles.paymentStatusText, { color: statusStyle.text }]}>
                    {statusLabels[paymentStatus]}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Menu Actions */}
            <View style={styles.actionsMenu}>
              <TouchableOpacity style={styles.actionButton} onPress={() => openFinancials(student)}>
                <LinearGradient
                  colors={['rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>💰</Text>
                  <Text style={styles.actionText}>Détails Financiers</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => openCalendar(student)}>
                <LinearGradient
                  colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>📅</Text>
                  <Text style={styles.actionText}>Calendrier</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (students.length === 0) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun élève associé</Text>
          <Text style={styles.emptyStateSubtext}>Contactez l'administration</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#eab308"
            colors={['#eab308']}
          />
        }
      >
        {/* Menu de navigation */}
        {navigation && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Events')}
            >
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                style={styles.menuGradient}
              >
                <Text style={styles.menuIcon}>🎉</Text>
                <Text style={styles.menuText}>Événements</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Shop')}
            >
              <LinearGradient
                colors={['rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)']}
                style={styles.menuGradient}
              >
                <Text style={styles.menuIcon}>🛍️</Text>
                <Text style={styles.menuText}>Boutique</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {students.map((student, index) => renderStudentCard(student, index))}
      </ScrollView>

      {/* Modals */}
      {showFinancials && selectedStudent && (
        <Modal visible transparent animationType="fade">
          <FinancialDetails
            student={selectedStudent}
            onClose={() => setShowFinancials(false)}
          />
        </Modal>
      )}

      {showCalendar && selectedStudent && (
        <Modal visible transparent animationType="fade">
          <AttendanceCalendar
            student={selectedStudent}
            onClose={() => setShowCalendar(false)}
          />
        </Modal>
      )}

      {showEditPhoto && selectedStudent && onUpdatePhoto && (
        <EditChildModal
          visible={showEditPhoto}
          student={selectedStudent}
          onClose={() => setShowEditPhoto(false)}
          onUpdate={onUpdatePhoto}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  menuButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#f8fafc',
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardGradient: {
    borderRadius: 22,
  },
  badgeInactive: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fca5a5',
    zIndex: 20,
  },
  badgeInactiveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeBirthday: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
    zIndex: 20,
  },
  badgeBirthdayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#0f172a',
  },
  birthdayEmojiOnPhoto: {
    position: 'absolute',
    top: -8,
    left: -8,
    fontSize: 32,
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(234, 179, 8, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  editPhotoText: {
    fontSize: 16,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  birthdayMessageBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 2,
    borderColor: '#eab308',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  birthdayMessage: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '900',
  },
  studentName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(168, 85, 247, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  studentNameInactive: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  inactiveLabel: {
    fontSize: 18,
    color: '#ef4444',
  },
  studentLastName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  studentLastNameInactive: {
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#06b6d4',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#06b6d4',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  paymentIcon: {
    fontSize: 24,
    fontWeight: '900',
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsMenu: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#f8fafc',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
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
