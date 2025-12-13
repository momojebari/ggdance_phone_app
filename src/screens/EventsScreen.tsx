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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event, Student, EventRegistration, User } from '../types';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
import { eventService, registrationService } from '../services/api';
import { imageService } from '../utils/imageService';

interface EventsScreenProps {
  students: Student[];
  user: User | null;
  navigation: any;
  onRegister: (eventId: string, studentIds: string[]) => Promise<void>;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ students, user, navigation, onRegister }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const loadEvents = async () => {
    try {
      // Charger les événements depuis l'API
      const eventsData = await eventService.getAll();
      // Convertir les imageUrl avec le service centralisé
      const eventsWithFullUrls = eventsData.map((event: any) => ({
        ...event,
        id: String(event.id),
        price: parseFloat(event.price),
        imageUrl: imageService.getUrl(event.imageUrl),
        registeredStudentIds: event.registeredStudentIds || [],
      }));
      setEvents(eventsWithFullUrls);

      // Charger les inscriptions du parent si disponible
      if (user?.phone) {
        try {
          const registrationsData = await registrationService.getByParent(user.phone);
          setRegistrations(registrationsData || []);
        } catch (error) {
          console.error('Error loading registrations:', error);
          setRegistrations([]);
        }
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleRegisterEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  const handleConfirmRegistration = async (studentIds: string[]) => {
    if (selectedEvent) {
      await onRegister(selectedEvent.id.toString(), studentIds);
      setShowRegisterModal(false);
      await loadEvents();
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <ActivityIndicator size="large" color="#eab308" />
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
        <Text style={styles.title}>🎉 Événements</Text>
        <Text style={styles.subtitle}>Inscrivez-vous aux prochains événements</Text>

        {registrations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Mes Inscriptions</Text>
            {registrations.map((reg, index) => (
              <LinearGradient
                key={index}
                colors={
                  reg.isPaid
                    ? ['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.2)']
                    : ['rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.2)']
                }
                style={styles.registrationCard}
              >
                <View style={styles.regContent}>
                  <Text style={styles.regEventTitle}>{reg.eventTitle}</Text>
                  <Text style={styles.regStudentName}>👤 {reg.studentName}</Text>
                  <View style={styles.regFooter}>
                    <Text style={styles.regPrice}>{reg.eventPrice} DT</Text>
                    <View
                      style={[
                        styles.regStatusBadge,
                        {
                          backgroundColor: reg.isPaid
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(239, 68, 68, 0.3)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.regStatusText,
                          { color: reg.isPaid ? '#10b981' : '#ef4444' },
                        ]}
                      >
                        {reg.isPaid ? '✓ Payé' : `⏱ ${reg.daysRemaining}j restants`}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎪 Tous les Événements</Text>
          {events.map((event) => {
            const isRegistered = registrations.some((r) => r.eventId === event.id);
            const spotsLeft = event.availableTickets || 0;

            return (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => !isRegistered && handleRegisterEvent(event)}
                disabled={isRegistered || spotsLeft === 0}
              >
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.9)']}
                  style={styles.eventGradient}
                >
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />

                  <View
                    style={[
                      styles.spotsBadge,
                      {
                        backgroundColor:
                          spotsLeft > 10
                            ? '#10b981'
                            : spotsLeft > 0
                            ? '#f97316'
                            : '#ef4444',
                      },
                    ]}
                  >
                    <Text style={styles.spotsText}>
                      {spotsLeft > 0 ? `${spotsLeft} places` : 'Complet'}
                    </Text>
                  </View>

                  {isRegistered && (
                    <View style={styles.registeredBadge}>
                      <Text style={styles.registeredText}>✓ Inscrit</Text>
                    </View>
                  )}

                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDesc}>{event.description}</Text>

                    <View style={styles.eventInfo}>
                      <View style={styles.eventInfoRow}>
                        <Text style={styles.eventInfoIcon}>📅</Text>
                        <Text style={styles.eventInfoText}>
                          {new Date(event.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      <View style={styles.eventInfoRow}>
                        <Text style={styles.eventInfoIcon}>💰</Text>
                        <Text style={styles.eventPrice}>{event.price} DT</Text>
                      </View>
                    </View>

                    {!isRegistered && spotsLeft > 0 && (
                      <LinearGradient
                        colors={['#eab308', '#f59e0b', '#eab308']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.registerButton}
                      >
                        <Text style={styles.registerButtonText}>
                          S'inscrire →
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <EventRegistrationModal
        visible={showRegisterModal}
        event={
          selectedEvent
            ? {
                ...selectedEvent,
                id: String(selectedEvent.id),
                maxParticipants: selectedEvent.maxTickets || 50,
                registeredStudentIds: selectedEvent.registeredStudentIds.map(String),
              }
            : null
        }
        students={students}
        onClose={() => setShowRegisterModal(false)}
        onRegister={handleConfirmRegistration}
      />
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#eab308',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#a855f7',
    marginBottom: 16,
  },
  registrationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  regContent: {
    gap: 8,
  },
  regEventTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f8fafc',
  },
  regStudentName: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  regFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  regPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#eab308',
  },
  regStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  regStatusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventGradient: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  spotsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  spotsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  registeredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  registeredText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 8,
  },
  eventDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  eventInfo: {
    gap: 12,
    marginBottom: 16,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoIcon: {
    fontSize: 16,
  },
  eventInfoText: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '600',
  },
  eventPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#eab308',
  },
  registerButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
});
