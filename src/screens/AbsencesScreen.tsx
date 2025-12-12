import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';

interface AbsencesScreenProps {
  students: Student[];
  navigation?: any;
}

export const AbsencesScreen: React.FC<AbsencesScreenProps> = ({
  students,
  navigation,
}) => {
  // Calculer toutes les absences de tous les élèves
  const allAbsences: Array<{
    studentName: string;
    date: string;
    sessionId?: number;
  }> = [];

  students.forEach((student) => {
    if (student.attendance) {
      student.attendance.forEach((att: any) => {
        if (!att.isPresent && !att.present) {
          allAbsences.push({
            studentName: `${student.firstName} ${student.lastName}`,
            date: att.date,
            sessionId: att.sessionId,
          });
        }
      });
    }
  });

  // Trier par date décroissante (plus récentes en premier)
  allAbsences.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Grouper par mois
  const absencesByMonth: { [key: string]: typeof allAbsences } = {};
  allAbsences.forEach((absence) => {
    const date = new Date(absence.date);
    const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    if (!absencesByMonth[monthKey]) {
      absencesByMonth[monthKey] = [];
    }
    absencesByMonth[monthKey].push(absence);
  });

  return (
    <LinearGradient colors={['#1a1d3d', '#2d3561']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Absences</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Statistiques globales */}
        <LinearGradient
          colors={['#2d2d5a', '#3d3d6a']}
          style={styles.statsCard}
        >
          <Text style={styles.statsTitle}>Statistiques globales</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{allAbsences.length}</Text>
              <Text style={styles.statLabel}>Total absences</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Object.keys(absencesByMonth).length}</Text>
              <Text style={styles.statLabel}>Mois concernés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{students.length}</Text>
              <Text style={styles.statLabel}>Élèves</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Liste des absences par élève */}
        {students.map((student) => {
          const studentAbsences = student.attendance?.filter(
            (att: any) => !att.isPresent && !att.present
          ) || [];

          if (studentAbsences.length === 0) return null;

          const attendanceRate = student.attendance
            ? Math.round(
                ((student.attendance.length - studentAbsences.length) /
                  student.attendance.length) *
                  100
              )
            : 100;

          return (
            <LinearGradient
              key={student.id}
              colors={['#2d2d5a', '#3d3d6a']}
              style={styles.studentCard}
            >
              <View style={styles.studentHeader}>
                <View>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentSubtext}>
                    {studentAbsences.length} absence(s) • {attendanceRate}% de présence
                  </Text>
                </View>
                <View
                  style={[
                    styles.attendanceBadge,
                    {
                      backgroundColor:
                        attendanceRate >= 80
                          ? 'rgba(34, 197, 94, 0.2)'
                          : attendanceRate >= 50
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      borderColor:
                        attendanceRate >= 80
                          ? '#22c55e'
                          : attendanceRate >= 50
                          ? '#f59e0b'
                          : '#ef4444',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.attendanceText,
                      {
                        color:
                          attendanceRate >= 80
                            ? '#22c55e'
                            : attendanceRate >= 50
                            ? '#f59e0b'
                            : '#ef4444',
                      },
                    ]}
                  >
                    {attendanceRate}%
                  </Text>
                </View>
              </View>

              <View style={styles.absencesList}>
                {studentAbsences.slice(0, 5).map((absence: any, idx: number) => {
                  const absenceDate = new Date(absence.date);
                  const formattedDate = absenceDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <View key={idx} style={styles.absenceItem}>
                      <Text style={styles.absenceIcon}>⊗</Text>
                      <Text style={styles.absenceDate}>{formattedDate}</Text>
                    </View>
                  );
                })}
                {studentAbsences.length > 5 && (
                  <Text style={styles.moreText}>
                    +{studentAbsences.length - 5} autre(s) absence(s)
                  </Text>
                )}
              </View>
            </LinearGradient>
          );
        })}

        {/* Timeline par mois */}
        <Text style={styles.sectionTitle}>Timeline des absences</Text>
        {Object.keys(absencesByMonth).map((monthKey) => (
          <LinearGradient
            key={monthKey}
            colors={['#4a3520', '#6b4e2a']}
            style={styles.monthCard}
          >
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{monthKey}</Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthBadgeText}>
                  {absencesByMonth[monthKey].length}
                </Text>
              </View>
            </View>
            {absencesByMonth[monthKey].slice(0, 10).map((absence, idx) => {
              const absenceDate = new Date(absence.date);
              const formattedDate = absenceDate.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <View key={idx} style={styles.timelineItem}>
                  <Text style={styles.timelineDate}>{formattedDate}</Text>
                  <Text style={styles.timelineStudent}>{absence.studentName}</Text>
                </View>
              );
            })}
            {absencesByMonth[monthKey].length > 10 && (
              <Text style={styles.moreText}>
                +{absencesByMonth[monthKey].length - 10} autre(s)
              </Text>
            )}
          </LinearGradient>
        ))}

        {allAbsences.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>Aucune absence enregistrée</Text>
            <Text style={styles.emptySubtext}>
              Tous vos enfants ont une présence parfaite !
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(192, 132, 252, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#c084fc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#c084fc',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#c084fc',
    marginBottom: 12,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#c084fc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  studentSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  attendanceText: {
    fontSize: 16,
    fontWeight: '900',
  },
  absencesList: {
    gap: 8,
  },
  absenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.2)',
  },
  absenceIcon: {
    fontSize: 14,
    color: '#c084fc',
    marginRight: 8,
  },
  absenceDate: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  moreText: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#c084fc',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 1,
  },
  monthCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fb923c',
    textTransform: 'capitalize',
  },
  monthBadge: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fb923c',
  },
  monthBadgeText: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: '900',
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  timelineDate: {
    color: '#fdba74',
    fontSize: 12,
    fontWeight: '700',
    width: 100,
  },
  timelineStudent: {
    color: '#e2e8f0',
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#22c55e',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
