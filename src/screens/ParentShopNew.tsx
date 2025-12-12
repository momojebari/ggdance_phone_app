import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';
import { productService, imageService } from '../services/api';
import { Picker } from '@react-native-picker/picker';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  description?: string;
  category: string;
}

interface Reservation {
  childName: string;
  description: string;
  isPaid: boolean;
  amount: number;
}

interface ParentShopNewProps {
  students: Student[];
  onRefreshData?: () => void;
}

const ParentShopNew: React.FC<ParentShopNewProps> = ({ students, onRefreshData }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [size, setSize] = useState('');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [productReservations, setProductReservations] = useState<{[key: string]: Reservation[]}>({});

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAll();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = () => {
    const reservations: {[key: string]: Reservation[]} = {};
    
    students.forEach(child => {
      const childPayments = child.payments.filter(p => 
        (p.type === 'Marchandise' || p.type === 'marchandise') && p.productId
      );
      
      childPayments.forEach(payment => {
        if (!reservations[payment.productId!]) {
          reservations[payment.productId!] = [];
        }
        reservations[payment.productId!].push({
          childName: `${child.firstName} ${child.lastName}`,
          description: payment.description || 'Réservation',
          isPaid: payment.isPaid,
          amount: payment.amount
        });
      });
    });
    
    setProductReservations(reservations);
  };

  useEffect(() => {
    loadProducts();
    loadReservations();
  }, [students]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    loadReservations();
    setRefreshing(false);
  };

  const openReservationModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedStudentId(students.length > 0 ? String(students[0].id) : '');
    setSize('');
    setAge('');
    setNotes('');
  };

  const handleSubmitReservation = async () => {
    if (!selectedStudentId) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un enfant pour continuer');
      return;
    }

    if (!selectedProduct) return;

    setIsReserving(true);
    try {
      await productService.order(selectedProduct.id, selectedStudentId, 1);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedProduct(null);
        setSize('');
        setAge('');
        setNotes('');
        setSelectedStudentId('');
        if (onRefreshData) onRefreshData();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur réservation:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la réservation');
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>GG <Text style={styles.headerGold}>BOUTIQUE</Text></Text>
            <Text style={styles.headerSubtitle}>Réservez pour vos enfants - Paiement au guichet</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.productsGrid}>
          {products.map(product => {
            const reservations = productReservations[product.id] || [];
            const totalReserved = reservations.length;
            const productQuantity = Number(product.stockQuantity) || 0;
            const availableQuantity = productQuantity - totalReserved;
            const isOutOfStock = availableQuantity <= 0;

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageService.getUrl(product.imageUrl) }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  {isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>RUPTURE DE STOCK</Text>
                    </View>
                  )}
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{product.price} DT</Text>
                  </View>
                  <View style={[
                    styles.stockBadge,
                    isOutOfStock ? styles.stockBadgeRed :
                    availableQuantity <= 3 ? styles.stockBadgeOrange :
                    styles.stockBadgeGreen
                  ]}>
                    <Text style={styles.stockText}>
                      {isOutOfStock ? 'Rupture' : `${availableQuantity} dispo`}
                    </Text>
                  </View>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>

                  {/* Existing Reservations */}
                  {reservations.length > 0 && (
                    <View style={styles.reservationsBox}>
                      <Text style={styles.reservationsTitle}>Déjà réservé pour :</Text>
                      {reservations.map((res, idx) => (
                        <View key={idx} style={styles.reservationItem}>
                          <View style={styles.reservationInfo}>
                            <Text style={styles.reservationName}>{res.childName}</Text>
                            <Text style={styles.reservationDetails} numberOfLines={1}>
                              {res.description.split(' - ')[1] || 'Détails non spécifiés'}
                            </Text>
                          </View>
                          <View style={res.isPaid ? styles.paidBadge : styles.unpaidBadge}>
                            <Text style={res.isPaid ? styles.paidText : styles.unpaidText}>
                              {res.isPaid ? 'Payé' : 'En attente'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.reserveButton, isOutOfStock && styles.reserveButtonDisabled]}
                    onPress={() => openReservationModal(product)}
                    disabled={isOutOfStock}
                  >
                    <LinearGradient
                      colors={isOutOfStock ? ['#475569', '#475569'] : ['#d97706', '#f59e0b', '#d97706']}
                      style={styles.reserveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.reserveButtonText}>
                        {isOutOfStock ? 'RUPTURE DE STOCK' : 'RÉSERVER'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Réserver</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.modalProductInfo}>
                  <Image
                    source={{ uri: imageService.getUrl(selectedProduct.imageUrl) }}
                    style={styles.modalProductImage}
                  />
                  <View>
                    <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                    <Text style={styles.modalProductPrice}>{selectedProduct.price} DT</Text>
                  </View>
                </View>

                <View style={styles.modalForm}>
                  <Text style={styles.modalLabel}>Pour quel enfant ?</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedStudentId}
                      onValueChange={setSelectedStudentId}
                      style={styles.picker}
                    >
                      <Picker.Item label="Sélectionner un enfant" value="" />
                      {students.map(child => (
                        <Picker.Item
                          key={child.id}
                          label={`${child.firstName} ${child.lastName}`}
                          value={child.id}
                          enabled={child.isActive !== false}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.modalLabel}>Taille</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={size}
                      onValueChange={setSize}
                      style={styles.picker}
                    >
                      <Picker.Item label="Sélectionner" value="" />
                      <Picker.Item label="4-6 ans (XS)" value="4-6 ans" />
                      <Picker.Item label="6-8 ans (S)" value="6-8 ans" />
                      <Picker.Item label="8-10 ans (M)" value="8-10 ans" />
                      <Picker.Item label="10-12 ans (L)" value="10-12 ans" />
                      <Picker.Item label="12-14 ans (XL)" value="12-14 ans" />
                      <Picker.Item label="14+ ans (XXL)" value="14+ ans" />
                      <Picker.Item label="Adulte S" value="Adulte S" />
                      <Picker.Item label="Adulte M" value="Adulte M" />
                      <Picker.Item label="Adulte L" value="Adulte L" />
                      <Picker.Item label="Adulte XL" value="Adulte XL" />
                    </Picker>
                  </View>

                  <Text style={styles.modalLabel}>Âge</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Ex: 8 ans"
                    placeholderTextColor="#64748b"
                  />

                  <Text style={styles.modalLabel}>Notes (optionnel)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Ex: Préférence couleur, pointure..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      <Text style={styles.infoHighlight}>📍 Paiement au guichet</Text>
                      {'\n'}Votre réservation sera enregistrée. Payez lors de votre prochaine visite.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSubmitReservation}
                    disabled={isReserving}
                  >
                    <LinearGradient
                      colors={['#d97706', '#f59e0b']}
                      style={styles.confirmButtonGradient}
                    >
                      {isReserving ? (
                        <ActivityIndicator color="#0f172a" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Réservation confirmée !</Text>
            <Text style={styles.successText}>Payez au guichet lors de votre prochaine visite</Text>
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
    borderRadius: 24,
    margin: 16,
    marginTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    fontStyle: 'italic',
  },
  headerGold: {
    color: '#d97706',
  },
  headerSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  productsGrid: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '900',
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: '12deg' }],
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.5)',
  },
  priceText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  stockBadgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  stockBadgeOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  stockBadgeRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  stockText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  productInfo: {
    padding: 16,
  },
  productCategory: {
    color: '#d97706',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  reservationsBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  reservationsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: 8,
  },
  reservationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  reservationDetails: {
    fontSize: 9,
    color: '#94a3b8',
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: '700',
  },
  unpaidBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unpaidText: {
    color: '#f97316',
    fontSize: 8,
    fontWeight: '700',
  },
  reserveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 24,
    color: '#94a3b8',
  },
  modalProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d97706',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalProductPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#d97706',
    marginTop: 4,
  },
  modalForm: {
    padding: 24,
  },
  modalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  infoHighlight: {
    color: '#d97706',
    fontWeight: '700',
  },
  confirmButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#065f46',
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    maxWidth: 320,
  },
  successIcon: {
    fontSize: 64,
    color: '#10b981',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#6ee7b7',
    textAlign: 'center',
  },
});

export default ParentShopNew;
