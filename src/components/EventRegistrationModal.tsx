import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';

interface Event {
  id: string;
  title: string;
  date: string;
  price: number;
  maxParticipants: number;
  registeredStudentIds: string[];
}

interface EventRegistrationModalProps {
  visible: boolean;
  event: Event | null;
  students: Student[];
  onClose: () => void;
  onRegister: (studentIds: string[]) => Promise<void>;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  visible,
  event,
  students,
  onClose,
  onRegister,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStudents(prev => [...prev, studentId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRegister(selectedStudents);
      setSelectedStudents([]);
      onClose();
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedStudents.length * event.price;
  const remainingSpots = event.maxParticipants - event.registeredStudentIds.length;
  const canRegister = selectedStudents.length > 0 && selectedStudents.length <= remainingSpots;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.98)', 'rgba(30, 41, 59, 0.98)']}
          style={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🎉 {event.title}</Text>
              <Text style={styles.date}>
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Prix par enfant:</Text>
                <Text style={styles.priceValue}>{event.price}€</Text>
              </View>
              <View style={[
                styles.spotsContainer,
                { backgroundColor: remainingSpots > 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
              ]}>
                <Text style={[
                  styles.spotsText,
                  { color: remainingSpots > 5 ? '#10b981' : '#ef4444' }
                ]}>
                  {remainingSpots} places restantes
                </Text>
              </View>
            </View>

            {/* Students List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sélectionnez vos enfants :</Text>
              {students.map((student) => {
                const isAlreadyRegistered = event.registeredStudentIds.includes(String(student.id));
                const isSelected = selectedStudents.includes(String(student.id));
                
                return (
                  <TouchableOpacity
                    key={student.id}
                    onPress={() => !isAlreadyRegistered && toggleStudent(String(student.id))}
                    disabled={isAlreadyRegistered}
                    style={[
                      styles.studentRow,
                      isAlreadyRegistered && styles.studentRowDisabled
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isAlreadyRegistered
                          ? ['rgba(100, 116, 139, 0.2)', 'rgba(71, 85, 105, 0.2)']
                          : isSelected
                          ? ['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.2)']
                          : ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']
                      }
                      style={styles.studentGradient}
                    >
                      <View style={styles.studentLeft}>
                        <View style={[
                          styles.checkbox,
                          isAlreadyRegistered 
                            ? { borderColor: '#64748b', backgroundColor: 'rgba(100, 116, 139, 0.3)' }
                            : isSelected
                            ? { borderColor: '#10b981', backgroundColor: '#10b981' }
                            : { borderColor: '#475569' }
                        ]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <View>
                          <Text style={[
                            styles.studentName,
                            isAlreadyRegistered && styles.studentNameDisabled
                          ]}>
                            {student.firstName} {student.lastName}
                          </Text>
                          {isAlreadyRegistered && (
                            <Text style={styles.alreadyRegistered}>✓ Déjà inscrit</Text>
                          )}
                        </View>
                      </View>
                      {!isAlreadyRegistered && (
                        <Text style={styles.studentPrice}>{event.price}€</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total */}
            {selectedStudents.length > 0 && (
              <LinearGradient
                colors={['rgba(234, 179, 8, 0.2)', 'rgba(249, 115, 22, 0.2)']}
                style={styles.totalContainer}
              >
                <Text style={styles.totalLabel}>Total à payer:</Text>
                <Text style={styles.totalAmount}>{totalAmount}€</Text>
              </LinearGradient>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSubmit}
                disabled={!canRegister || isSubmitting}
              >
                <LinearGradient
                  colors={
                    canRegister
                      ? ['#10b981', '#059669', '#10b981']
                      : ['#475569', '#334155', '#475569']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmText}>
                    {isSubmitting ? 'Inscription...' : `Confirmer (${selectedStudents.length})`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#eab308',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#eab308',
  },
  spotsContainer: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  spotsText: {
    fontSize: 12,
    fontWeight: '900',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#a855f7',
    marginBottom: 12,
  },
  studentRow: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  studentRowDisabled: {
    opacity: 0.6,
  },
  studentGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 16,
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  studentNameDisabled: {
    color: '#64748b',
  },
  alreadyRegistered: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  studentPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#eab308',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#eab308',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#eab308',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.5)',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#94a3b8',
  },
  confirmButton: {},
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
});
