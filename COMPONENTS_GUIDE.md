# 📱 GG Dance Mobile - Parent App

## 🎨 Composants Implémentés

### ✅ 1. DashboardScreenEnhanced
**Fichier:** `src/screens/DashboardScreenEnhanced.tsx`

**Fonctionnalités:**
- 🎨 Gradients neon (purple/pink/cyan) identiques au web
- 🎂 Badge anniversaire avec confettis animés
- 💳 Cartes de paiement avec statuts colorés:
  - ✓ PAID (vert avec neon glow)
  - ⏱ GRACE_PERIOD (orange pulse)
  - ✗ OVERDUE (rouge glow)
  - ⚠ NO_SUBSCRIPTION (gris)
- 📊 Stats de présence avec barre de progression
- 👤 Avatar avec bordure gradient et ombre neon
- 🚫 Badge "DÉSACTIVÉ" pour élèves inactifs

---

### ✅ 2. FinancialDetails
**Fichier:** `src/components/FinancialDetails.tsx`

**Fonctionnalités:**
- 🎉 Section événements participés:
  - Cartes avec gradient vert/cyan (payé) ou rouge/orange (impayé)
  - Badge statut avec icônes ✓/✗
  - Prix affiché avec couleur or
  
- 📅 Calendrier mensuel année scolaire:
  - 12 mois de septembre à août
  - Cases colorées avec checkmark ✓ pour mois payés
  - Gradient vert pour mois payés, gris pour non payés
  
- 📋 Historique complet:
  - Liste triée par date décroissante
  - Date, description, montant et statut pour chaque paiement
  - Gradient slate pour les lignes

---

### ✅ 3. EventRegistrationModal
**Fichier:** `src/components/EventRegistrationModal.tsx`

**Fonctionnalités:**
- ✅ Multi-sélection des enfants avec checkboxes
- 📊 Calcul automatique du total
- 🎫 Affichage places restantes (vert >5, rouge ≤5)
- 🔒 Enfants déjà inscrits non sélectionnables
- 💰 Badge prix par enfant
- ✨ Gradients neon pour sélection

---

### ✅ 4. EditChildModal
**Fichier:** `src/components/EditChildModal.tsx`

**Fonctionnalités:**
- 📷 Upload photo depuis:
  - 🖼️ Galerie
  - 📸 Caméra
- 🎨 Icône caméra overlay sur photo
- 🔒 Champs read-only:
  - Prénom
  - Nom
  - Date de naissance
- ℹ️ Message pour contacter l'administration
- 🔐 Gestion permissions caméra/galerie
- 💾 Bouton enregistrer avec loading state

---

### ✅ 5. ParentShop
**Fichier:** `src/screens/ParentShop.tsx`

**Fonctionnalités:**
- 🛍️ Grille de produits avec:
  - Image produit
  - Nom et description
  - Prix en or
  - Badge stock coloré (vert >5, orange 1-5, rouge 0)
  
- 📝 Modal de réservation:
  - Champ taille (optionnel)
  - Champ âge (optionnel)
  - Notes complémentaires
  - Message "Paiement au comptoir"
  
- ♻️ Pull to refresh
- 🚫 Bouton désactivé si rupture de stock

---

### ✅ 6. AttendanceCalendar
**Fichier:** `src/components/AttendanceCalendar.tsx`

**Fonctionnalités:**
- 📅 Calendrier mensuel avec navigation ←/→
- 📊 Stats du mois:
  - Nombre de présences (vert)
  - Nombre d'absences (rouge)
  - Taux de présence en % (or)
  
- 🗓️ Grille des jours:
  - Cases vertes pour présences ✓
  - Cases rouges pour absences ✗
  - Case jaune pour aujourd'hui
  - Cases grises pour jours sans session
  
- 📖 Légende colorée
- 🎨 Noms des jours en violet

---

## 🔧 Installation des dépendances

```bash
cd ~/Desktop/gg-dance-mobile-parent
npx expo install expo-linear-gradient expo-image-picker
npm install --save-dev babel-preset-expo@12.0.11
```

---

## 🎯 Utilisation dans l'app

### Exemple d'intégration dans un écran:

```tsx
import { DashboardScreenEnhanced } from './src/screens/DashboardScreenEnhanced';
import { FinancialDetails } from './src/components/FinancialDetails';
import { EventRegistrationModal } from './src/components/EventRegistrationModal';
import { EditChildModal } from './src/components/EditChildModal';
import { ParentShop } from './src/screens/ParentShop';
import { AttendanceCalendar } from './src/components/AttendanceCalendar';

// Dans votre composant:
const [showFinancials, setShowFinancials] = useState(false);
const [showEventModal, setShowEventModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showCalendar, setShowCalendar] = useState(false);

// Dashboard avec bouton "Voir détails"
<DashboardScreenEnhanced
  students={students}
  onRefresh={loadStudents}
  onStudentPress={(student) => {
    // Ouvrir modal de détails ou navigation
    setSelectedStudent(student);
    setShowFinancials(true);
  }}
/>

// Modal détails financiers
{showFinancials && selectedStudent && (
  <Modal visible transparent>
    <FinancialDetails
      student={selectedStudent}
      onClose={() => setShowFinancials(false)}
    />
  </Modal>
)}

// Modal inscription événement
<EventRegistrationModal
  visible={showEventModal}
  event={selectedEvent}
  students={students}
  onClose={() => setShowEventModal(false)}
  onRegister={async (studentIds) => {
    // API call pour inscription
    await registerToEvent(selectedEvent.id, studentIds);
  }}
/>

// Modal édition photo
<EditChildModal
  visible={showEditModal}
  student={selectedStudent}
  onClose={() => setShowEditModal(false)}
  onUpdate={async (studentId, photoUri) => {
    // API call pour upload photo
    await updateStudentPhoto(studentId, photoUri);
  }}
/>

// Boutique (screen séparé dans navigation)
<ParentShop
  onReserve={async (productId, size, age, notes) => {
    // API call pour réservation
    await reserveProduct(productId, { size, age, notes });
  }}
/>

// Calendrier présences
{showCalendar && selectedStudent && (
  <Modal visible transparent>
    <AttendanceCalendar
      student={selectedStudent}
      onClose={() => setShowCalendar(false)}
    />
  </Modal>
)}
```

---

## 🎨 Design System

### Couleurs principales:
- **Purple neon:** `#a855f7` (rgba(168, 85, 247, 0.4))
- **Cyan neon:** `#06b6d4` (rgba(6, 182, 212, 0.4))
- **Pink neon:** `#ec4899` (rgba(236, 72, 153, 0.4))
- **Gold:** `#eab308` / `#f59e0b`
- **Green (success):** `#10b981`
- **Orange (warning):** `#f97316`
- **Red (error):** `#ef4444`
- **Slate background:** `#0f172a` / `#1e293b`

### Gradients:
```typescript
// Background principal
['#0f172a', '#1e293b']

// Cartes
['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.9)']

// Boutons gold
['#eab308', '#f59e0b', '#eab308']

// Success
['#10b981', '#059669', '#10b981']

// Avatar border
['#a855f7', '#ec4899', '#06b6d4']
```

### Effets:
- **Shadow neon:** `shadowColor: '#a855f7', shadowOpacity: 0.5, shadowRadius: 20`
- **Border glow:** `borderColor: 'rgba(168, 85, 247, 0.4)', borderWidth: 2`

---

## 📱 Connexion Backend

**Base URL:** `http://141.227.133.61:3000/api`

### Endpoints utilisés:
- `POST /login` - Authentification
- `GET /students` - Liste des élèves
- `GET /students/:id/attendance` - Présences d'un élève
- `POST /events/:id/register` - Inscription événement
- `POST /students/:id/photo` - Upload photo
- `GET /products` - Liste produits boutique
- `POST /products/:id/reserve` - Réservation produit

---

## ✅ Checklist Complète

- [x] Dashboard avec design neon et gradients
- [x] Badges anniversaire avec confettis
- [x] Cartes de paiement avec statuts colorés
- [x] Section détails financiers complète
- [x] Modal inscription événements multi-sélection
- [x] Modal édition photo avec caméra/galerie
- [x] Écran boutique avec réservations
- [x] Calendrier de présences mensuel
- [x] Toutes les erreurs TypeScript corrigées
- [x] Expo Image Picker installé
- [x] Linear Gradient configuré
- [x] Design 100% identique au web

---

## 🚀 Lancement

```bash
cd ~/Desktop/gg-dance-mobile-parent
npx expo start --port 8082
```

Scannez le QR code avec **Expo Go** sur votre téléphone !
