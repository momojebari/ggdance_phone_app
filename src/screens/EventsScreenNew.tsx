import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event, Student } from '../types';
import { eventService, registrationService, imageService } from '../services/api';

interface EventsScreenNewProps {
  students: Student[];
  parentPhone?: string;
  onRegisterEvent: (eventId: string, studentIds: string[]) => Promise<void>;
}

const EventsScreenNew: React.FC<EventsScreenNewProps> = ({ students, parentPhone, onRegisterEvent }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const eventsData = await eventService.getAll();
      setEvents(eventsData);

      if (parentPhone) {
        const registrationsData = await registrationService.getByParent(parentPhone);
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (parentPhone) {
        registrationService.getByParent(parentPhone).then(data => {
          setRegistrations(Array.isArray(data) ? data : []);
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [parentPhone]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenRegister = (event: Event) => {
    setSelectedEvent(event);
    const alreadyRegistered = students
      .filter(s => event.registeredStudentIds.includes(s.id))
      .map(s => String(s.id));
    setSelectedStudentIds(alreadyRegistered);
  };

  const handleToggleStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds(prev => [...prev, studentId]);
    }
  };

  const handleSubmitRegistration = async () => {
    if (!selectedEvent) return;

    try {
      await onRegisterEvent(String(selectedEvent.id), selectedStudentIds);
      setSelectedEvent(null);
      
      // Refresh after delay
      setTimeout(async () => {
        if (parentPhone) {
          const data = await registrationService.getByParent(parentPhone);
          setRegistrations(Array.isArray(data) ? data : []);
        }
      }, 1000);
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Erreur', 'Impossible de valider l\'inscription');
    }
  };

  const pendingRegistrations = registrations.filter(r => !r.isPaid);
  const paidRegistrations = registrations.filter(r => r.isPaid);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🎉 Événements & Stages</Text>
        <Text style={styles.headerSubtitle}>Prochaines dates à ne pas manquer</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Pending Registrations */}
        {pendingRegistrations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⏱️</Text>
              <View>
                <Text style={styles.sectionTitle}>Réservations en Attente</Text>
                <Text style={styles.sectionSubtitle}>Validez vos paiements avant expiration</Text>
              </View>
            </View>

            {pendingRegistrations.map((reg, idx) => {
              const daysLeft = Math.ceil(Number(reg.daysRemaining) || 0);
              const isExpiringSoon = daysLeft <= 1;

              return (
                <View
                  key={idx}
                  style={[
                    styles.registrationCard,
                    isExpiringSoon ? styles.registrationCardUrgent : styles.registrationCardWarning
                  ]}
                >
                  <View style={styles.registrationHeader}>
                    <View style={styles.registrationInfo}>
                      <Text style={styles.registrationTitle}>{reg.eventTitle}</Text>
                      <Text style={styles.registrationStudent}>{reg.studentName}</Text>
                    </View>
                    <View style={[
                      styles.daysLeftBadge,
                      isExpiringSoon ? styles.daysLeftBadgeUrgent : styles.daysLeftBadgeWarning
                    ]}>
                      <Text style={styles.daysLeftText}>
                        {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : 'Expiré'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.registrationWarning}>
                    {isExpiringSoon
                      ? '⚠️ Délai de paiement presque écoulé !'
                      : `Paiement à effectuer avant le ${new Date(reg.paymentDeadline).toLocaleDateString('fr-FR')}`
                    }
                  </Text>

                  <View style={styles.registrationFooter}>
                    <Text style={styles.registrationPrice}>💰 {reg.eventPrice} DT</Text>
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => Alert.alert('Paiement', 'Contactez l\'administration pour valider le paiement')}
                    >
                      <Text style={styles.payButtonText}>Payer</Text>
                    </TouchableOpacity>
                  </View>

                  {daysLeft <= 0 && (
                    <Text style={styles.expiryWarning}>
                      ⚠️ Cette réservation sera supprimée automatiquement
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Available Events */}
        <View style={styles.section}>
          <Text style={styles.eventsTitle}>Événements Disponibles</Text>
          
          {events.map(event => {
            const registeredCount = students.filter(s => event.registeredStudentIds.includes(s.id)).length;
            const isRegistered = registeredCount > 0;
            const isFullyBooked = event.availableTickets === 0;

            return (
              <View key={event.id} style={styles.eventCard}>
                <Image
                  source={{ uri: imageService.getUrl(event.imageUrl) }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(15, 23, 42, 0.9)', '#0f172a']}
                  style={styles.eventImageOverlay}
                >
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </LinearGradient>

                <View style={styles.priceBadgeEvent}>
                  <Text style={styles.priceTextEvent}>
                    {event.price === 0 ? 'Gratuit' : `${event.price} DT`}
                  </Text>
                </View>

                <View style={styles.eventContent}>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>

                  {isRegistered && (
                    <View style={styles.registeredBadge}>
                      <Text style={styles.registeredText}>
                        ✓ {registeredCount} enfant(s) inscrit(s)
                      </Text>
                    </View>
                  )}

                  {!isRegistered && isFullyBooked && (
                    <View style={styles.fullBadge}>
                      <Text style={styles.fullText}>⚠️ Complet - Places épuisées</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      (isFullyBooked && !isRegistered) && styles.registerButtonDisabled
                    ]}
                    onPress={() => handleOpenRegister(event)}
                    disabled={isFullyBooked && !isRegistered}
                  >
                    <LinearGradient
                      colors={
                        isFullyBooked && !isRegistered
                          ? ['#475569', '#475569']
                          : isRegistered
                          ? ['#475569', '#334155']
                          : ['#d97706', '#f59e0b']
                      }
                      style={styles.registerButtonGradient}
                    >
                      <Text style={styles.registerButtonText}>
                        {isFullyBooked && !isRegistered
                          ? 'COMPLET'
                          : isRegistered
                          ? 'Gérer l\'inscription'
                          : 'S\'inscrire maintenant'
                        }
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Registration Modal */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Inscription: <Text style={styles.modalTitleGold}>{selectedEvent?.title}</Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedEvent(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalSubtitle}>
                Sélectionnez les enfants à inscrire pour cet événement :
              </Text>

              {students.map(child => {
                const isSelected = selectedStudentIds.includes(String(child.id));
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.studentOption,
                      isSelected && styles.studentOptionSelected
                    ]}
                    onPress={() => handleToggleStudent(String(child.id))}
                  >
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Image
                      source={{ uri: child.photoUrl || 'https://via.placeholder.com/50' }}
                      style={styles.studentAvatar}
                    />
                    <View style={styles.studentInfo}>
                      <Text style={[
                        styles.studentName,
                        isSelected && styles.studentNameSelected
                      ]}>
                        {child.firstName} {child.lastName}
                      </Text>
                      <Text style={styles.studentPrice}>
                        Tarif: {selectedEvent?.price || 0} DT
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.totalSection}>
                <View>
                  <Text style={styles.totalLabel}>Total à payer</Text>
                  <Text style={styles.totalAmount}>
                    {selectedStudentIds.length * (selectedEvent?.price || 0)} DT
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.validateButton}
                  onPress={handleSubmitRegistration}
                >
                  <Text style={styles.validateButtonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    marginTop: 48,
    marginHorizontal: 16,
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  registrationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  registrationCardWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  registrationCardUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  registrationInfo: {
    flex: 1,
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  registrationStudent: {
    fontSize: 14,
    color: '#94a3b8',
  },
  daysLeftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  daysLeftBadgeWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  daysLeftBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  registrationWarning: {
    fontSize: 12,
    color: '#fbbf24',
    marginBottom: 12,
  },
  registrationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  registrationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d97706',
  },
  payButton: {
    backgroundColor: '#d97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  expiryWarning: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 60,
  },
  eventDateBadge: {
    marginBottom: 4,
  },
  eventDate: {
    color: '#d97706',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  priceBadgeEvent: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d97706',
  },
  priceTextEvent: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  eventContent: {
    padding: 16,
  },
  eventDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  registeredBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  registeredText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  fullBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  fullText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  modalTitleGold: {
    color: '#d97706',
  },
  modalClose: {
    fontSize: 24,
    color: '#94a3b8',
  },
  modalScroll: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 12,
  },
  studentOptionSelected: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderColor: '#d97706',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  checkmark: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  studentNameSelected: {
    color: '#d97706',
  },
  studentPrice: {
    fontSize: 12,
    color: '#94a3b8',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  totalLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#d97706',
  },
  validateButton: {
    backgroundColor: '#d97706',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  validateButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default EventsScreenNew;
