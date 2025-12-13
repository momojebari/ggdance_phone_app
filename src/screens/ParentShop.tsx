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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Student, User } from '../types';
import { productService } from '../services/api';
import { imageService } from '../utils/imageService';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  category: string;
}

interface ParentShopProps {
  students: Student[];
  user: User | null;
  navigation: any;
  onReserve: (productId: string, studentId: string, studentName: string, size?: string, age?: string, notes?: string) => Promise<void>;
}

export const ParentShop: React.FC<ParentShopProps> = ({ students, user, navigation, onReserve }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [size, setSize] = useState('');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');
  const [isReserving, setIsReserving] = useState(false);

  const loadProducts = async () => {
    try {
      // Charger les produits depuis l'API
      const productsData = await productService.getAll();
      // Convertir les imageUrl avec le service centralisé
      const productsWithFullUrls = productsData.map((product: any) => ({
        id: product.id || product.productCode,
        name: product.name,
        price: parseFloat(product.price),
        stock: product.availableQuantity || product.stockQuantity || 0,
        imageUrl: imageService.getUrl(product.imageUrl),
        description: product.description || '',
        category: product.category || 'Produits',
      }));
      setProducts(productsWithFullUrls);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const openReservationModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedStudentId(students.length > 0 ? String(students[0].id) : '');
    setSize('');
    setAge('');
    setNotes('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedStudentId('');
    setSize('');
    setAge('');
    setNotes('');
  };

  const handleReserve = async () => {
    if (!selectedProduct || !selectedStudentId) {
      alert('⚠️ Veuillez sélectionner un enfant');
      return;
    }

    const selectedStudent = students.find(s => String(s.id) === selectedStudentId);
    if (!selectedStudent) {
      alert('⚠️ Enfant non trouvé');
      return;
    }

    setIsReserving(true);
    try {
      await onReserve(
        selectedProduct.id,
        selectedStudentId,
        `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        size,
        age,
        notes
      );
      closeModal();
    } catch (error) {
      console.error('Error reserving:', error);
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛍️ Boutique</Text>
          <Text style={styles.subtitle}>Réservez vos articles - Paiement au comptoir</Text>
        </View>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => openReservationModal(product)}
                style={styles.productCard}
              >
                <LinearGradient
                  colors={['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.9)']}
                  style={styles.productGradient}
                >
                  {/* Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    {/* Stock Badge */}
                    <View style={[
                      styles.stockBadge,
                      { backgroundColor: product.stock > 5 ? '#10b981' : product.stock > 0 ? '#f97316' : '#ef4444' }
                    ]}>
                      <Text style={styles.stockText}>
                        {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                      </Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text style={styles.productDesc} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    
                    <View style={styles.productFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{product.price} DT</Text>
                      </View>
                      
                      <LinearGradient
                        colors={product.stock > 0 ? ['#eab308', '#f59e0b'] : ['#475569', '#334155']}
                        style={styles.reserveButton}
                      >
                        <Text style={styles.reserveButtonText}>
                          {product.stock > 0 ? 'Réserver' : 'Indisponible'}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={selectedProduct !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.98)', 'rgba(30, 41, 59, 0.98)']}
            style={styles.modalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProduct && (
                <>
                  {/* Product Image */}
                  <Image
                    source={{ uri: selectedProduct.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />

                  {/* Product Info */}
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.modalPrice}>{selectedProduct.price} DT</Text>
                  {selectedProduct.description && (
                    <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                  )}

                  {/* Form */}
                  <View style={styles.form}>
                    {/* Student Selector */}
                    {students.length > 1 && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>👤 Pour quel enfant ? *</Text>
                        <View style={styles.studentPickerContainer}>
                          {students.map((student) => (
                            <TouchableOpacity
                              key={student.id}
                              style={[
                                styles.studentOption,
                                selectedStudentId === String(student.id) && styles.studentOptionSelected
                              ]}
                              onPress={() => setSelectedStudentId(String(student.id))}
                            >
                              <Text style={[
                                styles.studentOptionText,
                                selectedStudentId === String(student.id) && styles.studentOptionTextSelected
                              ]}>
                                {student.firstName} {student.lastName}
                              </Text>
                              {selectedStudentId === String(student.id) && (
                                <Text style={styles.checkMark}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {students.length === 1 && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>👤 Réservé pour</Text>
                        <View style={styles.singleStudentBox}>
                          <Text style={styles.singleStudentText}>
                            {students[0].firstName} {students[0].lastName}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Taille (optionnel)</Text>
                      <TextInput
                        style={styles.input}
                        value={size}
                        onChangeText={setSize}
                        placeholder="Ex: M, L, XL..."
                        placeholderTextColor="#64748b"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Âge (optionnel)</Text>
                      <TextInput
                        style={styles.input}
                        value={age}
                        onChangeText={setAge}
                        placeholder="Ex: 8 ans, 10-12 ans..."
                        placeholderTextColor="#64748b"
                        keyboardType="default"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Notes (optionnel)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Informations complémentaires..."
                        placeholderTextColor="#64748b"
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      ℹ️ Votre réservation sera disponible au comptoir. Paiement sur place.
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeModal}
                      disabled={isReserving}
                    >
                      <Text style={styles.cancelText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleReserve}
                      disabled={isReserving || (selectedProduct?.stock || 0) === 0}
                    >
                      <LinearGradient
                        colors={
                          !isReserving && (selectedProduct?.stock || 0) > 0
                            ? ['#10b981', '#059669']
                            : ['#475569', '#334155']
                        }
                        style={styles.confirmGradient}
                      >
                        {isReserving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.confirmText}>🛒 Confirmer la réservation</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  header: {
    marginBottom: 24,
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
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  productGradient: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 8,
  },
  productDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#eab308',
  },
  reserveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reserveButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalOverlay: {
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
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#eab308',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  form: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#f8fafc',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  studentPickerContainer: {
    gap: 8,
  },
  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 12,
    padding: 14,
  },
  studentOptionSelected: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#eab308',
  },
  studentOptionText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  studentOptionTextSelected: {
    color: '#eab308',
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 20,
    color: '#eab308',
    fontWeight: 'bold',
  },
  singleStudentBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 2,
    borderColor: '#eab308',
    borderRadius: 12,
    padding: 14,
  },
  singleStudentText: {
    fontSize: 16,
    color: '#eab308',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.5)',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#94a3b8',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
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
