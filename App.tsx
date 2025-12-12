import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreenNew } from './src/screens/DashboardScreenNew';
import { EventsScreen } from './src/screens/EventsScreen';
import { ParentShop } from './src/screens/ParentShop';
import { AbsencesScreen } from './src/screens/AbsencesScreen';
import { Student, User } from './src/types';
import { studentService } from './src/services/api';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Vérifier si un token existe au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Token existe, charger les données utilisateur
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          await loadStudents(parsedUser.phone || parsedUser.id);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (parentPhone: string) => {
    try {
      const studentsData = await studentService.getByParent(parentPhone);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
    }
  };

  const handleLoginSuccess = async (userData: User, studentsData: Student[]) => {
    setUser(userData);
    setStudents(studentsData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setStudents([]);
  };

  const handleRefresh = async () => {
    if (user) {
      await loadStudents(user.phone || (user as any).id);
    }
  };

  // Écran de chargement initial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#f8fafc',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              options={{
                title: 'Mes Enfants',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  >
                    <Text style={styles.logoutText}>Déconnexion</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => (
                <DashboardScreenNew
                  {...props}
                  students={students}
                  onRefresh={handleRefresh}
                  onStudentPress={(student) => {
                    console.log('Student pressed:', student.firstName);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Events"
              options={{
                title: '🎉 Événements',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  >
                    <Text style={styles.logoutText}>Déconnexion</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => (
                <EventsScreen
                  {...props}
                  students={students}
                  user={user}
                  onRegister={async (eventId: string, studentIds: string[]) => {
                    try {
                      console.log('Register students', studentIds, 'to event', eventId);
                      const response = await fetch(`http://141.227.133.61:3000/api/events/${eventId}/register`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${user?.phone || ''}`,
                        },
                        body: JSON.stringify({ studentIds })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          alert('✅ Inscription réussie! Votre enfant est inscrit à l\'événement.');
                          // Recharger les données
                          if (user?.phone) {
                            await loadStudents(user.phone);
                          }
                        }
                      } else {
                        const error = await response.json();
                        alert(`❌ Erreur: ${error.message || 'Inscription échouée'}`);
                      }
                    } catch (error) {
                      console.error('Error registering:', error);
                      alert('❌ Erreur de connexion');
                    }
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Absences"
              options={{
                title: '📊 Absences',
                headerShown: false,
              }}
            >
              {(props) => (
                <AbsencesScreen
                  {...props}
                  students={students}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Shop"
              options={{
                title: '🛍️ Boutique',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  >
                    <Text style={styles.logoutText}>Déconnexion</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => (
                <ParentShop
                  {...props}
                  students={students}
                  user={user}
                  onReserve={async (productId: string, size?: string, age?: string, notes?: string) => {
                    try {
                      console.log('Reserve product', productId, 'size:', size, 'age:', age, 'notes:', notes);
                      
                      // Utiliser le premier élève du parent pour la commande
                      if (students.length === 0) {
                        alert('❌ Aucun élève trouvé pour ce parent');
                        return;
                      }
                      const studentCode = students[0].id;
                      
                      const response = await fetch(`http://141.227.133.61:3000/api/products/${productId}/order`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${user?.phone || ''}`,
                        },
                        body: JSON.stringify({ 
                          studentCode,
                          quantity: 1
                        })
                      });
                      
                      if (response.ok) {
                        alert('✅ Réservation réussie! Paiement au comptoir.');
                      } else {
                        const error = await response.json();
                        alert(`❌ Erreur: ${error.message || 'Réservation échouée'}`);
                      }
                    } catch (error) {
                      console.error('Error reserving:', error);
                      alert('❌ Erreur de connexion');
                    }
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: '#eab308',
    fontSize: 14,
    fontWeight: '600',
  },
});
