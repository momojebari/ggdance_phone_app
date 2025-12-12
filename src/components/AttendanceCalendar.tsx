import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';

interface AttendanceRecord {
  id: string;
  date: string;
  sessionId: string;
  isPresent: boolean;
  notes?: string;
}

interface AttendanceCalendarProps {
  student: Student;
  onClose: () => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  student,
  onClose,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Ajouter des jours vides pour aligner le début
    for (let i = 0; i < (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1); i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Vérifier la présence pour un jour donné
  const getAttendanceForDay = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return student.attendance.find(a => a.date.startsWith(dateStr));
  };

  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Calculer les stats du mois
  const monthAttendance = student.attendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });
  const presentCount = monthAttendance.filter(a => a.isPresent).length;
  const absentCount = monthAttendance.filter(a => !a.isPresent).length;
  const totalSessions = monthAttendance.length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.98)', 'rgba(30, 41, 59, 0.98)']}
        style={styles.modalContent}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📅 Calendrier de Présences</Text>
            <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
          </View>

          {/* Month Navigator */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                style={styles.navButtonGradient}
              >
                <Text style={styles.navButtonText}>←</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.monthDisplay}>
              <Text style={styles.monthText}>{monthNames[selectedMonth]} {selectedYear}</Text>
            </View>

            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                style={styles.navButtonGradient}
              >
                <Text style={styles.navButtonText}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats du mois */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
              style={styles.statBox}
            >
              <Text style={styles.statValue}>{presentCount}</Text>
              <Text style={styles.statLabel}>Présent(s)</Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(239, 68, 68, 0.2)', 'rgba(249, 115, 22, 0.2)']}
              style={styles.statBox}
            >
              <Text style={styles.statValue}>{absentCount}</Text>
              <Text style={styles.statLabel}>Absent(s)</Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(234, 179, 8, 0.2)', 'rgba(249, 115, 22, 0.2)']}
              style={styles.statBox}
            >
              <Text style={styles.statValue}>{attendanceRate}%</Text>
              <Text style={styles.statLabel}>Taux</Text>
            </LinearGradient>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Day names */}
            <View style={styles.dayNamesRow}>
              {dayNames.map((name, index) => (
                <View key={index} style={styles.dayNameCell}>
                  <Text style={styles.dayNameText}>{name}</Text>
                </View>
              ))}
            </View>

            {/* Days grid */}
            <View style={styles.daysGrid}>
              {days.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.emptyCell} />;
                }

                const attendance = getAttendanceForDay(day);
                const isToday = 
                  day === new Date().getDate() &&
                  selectedMonth === new Date().getMonth() &&
                  selectedYear === new Date().getFullYear();

                return (
                  <View
                    key={day}
                    style={[
                      styles.dayCell,
                      isToday && styles.todayCell,
                      attendance?.isPresent && styles.presentCell,
                      attendance && !attendance.isPresent && styles.absentCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isToday && styles.todayNumber,
                        attendance?.isPresent && styles.presentNumber,
                        attendance && !attendance.isPresent && styles.absentNumber,
                      ]}
                    >
                      {day}
                    </Text>
                    {attendance && (
                      <Text style={styles.attendanceIcon}>
                        {attendance.isPresent ? '✓' : '✗'}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendBox, { backgroundColor: 'rgba(16, 185, 129, 0.3)' }]} />
              <Text style={styles.legendText}>Présent</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendBox, { backgroundColor: 'rgba(239, 68, 68, 0.3)' }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendBox, { backgroundColor: 'rgba(234, 179, 8, 0.3)' }]} />
              <Text style={styles.legendText}>Aujourd'hui</Text>
            </View>
          </View>

          {/* Close Button */}
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
    fontSize: 24,
    fontWeight: '900',
    color: '#eab308',
    textAlign: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06b6d4',
    textAlign: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  navButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#a855f7',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f8fafc',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  calendar: {
    marginBottom: 16,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#a855f7',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  todayCell: {
    backgroundColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: '#eab308',
    borderWidth: 2,
  },
  presentCell: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10b981',
  },
  absentCell: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#ef4444',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  todayNumber: {
    color: '#eab308',
    fontWeight: '900',
  },
  presentNumber: {
    color: '#10b981',
  },
  absentNumber: {
    color: '#ef4444',
  },
  attendanceIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  closeButton: {
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
