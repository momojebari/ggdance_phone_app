import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Student } from '../types';

interface EditChildModalProps {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
  onUpdate: (studentId: string, photoUri: string) => Promise<void>;
}

export const EditChildModal: React.FC<EditChildModalProps> = ({
  visible,
  student,
  onClose,
  onUpdate,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!student) return null;

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à la caméra.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedImage || !student) return;

    setIsUploading(true);
    try {
      await onUpdate(String(student.id), selectedImage);
      setSelectedImage(null);
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const displayImage = selectedImage || student.photoUrl;

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✏️ Modifier la photo</Text>
          </View>

          {/* Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <LinearGradient
                colors={['#a855f7', '#ec4899', '#06b6d4']}
                style={styles.photoBorder}
              >
                <Image
                  source={{ uri: displayImage || 'https://via.placeholder.com/152' }}
                  style={styles.photo}
                />
              </LinearGradient>
              
              {/* Camera Overlay Icon */}
              <TouchableOpacity style={styles.cameraOverlay} onPress={pickImage}>
                <LinearGradient
                  colors={['rgba(234, 179, 8, 0.9)', 'rgba(249, 115, 22, 0.9)']}
                  style={styles.cameraButton}
                >
                  <Text style={styles.cameraIcon}>📷</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Photo Actions */}
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <LinearGradient
                  colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>🖼️</Text>
                  <Text style={styles.actionText}>Galerie</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <LinearGradient
                  colors={['rgba(6, 182, 212, 0.3)', 'rgba(16, 185, 129, 0.3)']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>📸</Text>
                  <Text style={styles.actionText}>Caméra</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Student Info (Read-only) */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Prénom:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{student.firstName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{student.lastName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date de naissance:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>
                  {new Date(student.birthDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>

            <Text style={styles.infoNote}>
              ℹ️ Pour modifier ces informations, contactez l'administration
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setSelectedImage(null);
                onClose();
              }}
              disabled={isUploading}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={!selectedImage || isUploading}
            >
              <LinearGradient
                colors={
                  selectedImage && !isUploading
                    ? ['#10b981', '#059669', '#10b981']
                    : ['#475569', '#334155', '#475569']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>💾 Enregistrer</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photoBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 4,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  photo: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 4,
    borderColor: '#0f172a',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  cameraIcon: {
    fontSize: 24,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  infoSection: {
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValueContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  infoNote: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
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
  saveButton: {},
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
});
