# 📱 GG Dance Mobile - Espace Parent

Application mobile React Native pour l'espace parent de GG Dance, synchronisée avec le backend existant.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 16+ et npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Application Expo Go sur votre smartphone ([iOS](https://apps.apple.com/app/apple-store/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL du serveur backend
# Éditer src/services/api.ts ligne 6 :
# Remplacer 'http://VOTRE_IP_SERVEUR:5000/api' par l'IP de votre serveur
# Exemple: 'http://192.168.1.100:5000/api'

# 3. Lancer l'application
npm start
```

### Lancement sur appareil physique

1. Ouvrir l'application **Expo Go** sur votre smartphone
2. Scanner le QR code affiché dans le terminal
3. L'application se lancera automatiquement

### Lancement sur émulateur

```bash
# iOS (nécessite macOS + Xcode)
npm run ios

# Android (nécessite Android Studio)
npm run android
```

## 📦 Architecture

```
gg-dance-mobile-parent/
├── App.tsx                      # Point d'entrée (navigation + auth)
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Écran de connexion
│   │   └── DashboardScreen.tsx  # Liste des élèves avec statuts
│   ├── services/
│   │   └── api.ts               # Client API (Axios + AsyncStorage)
│   ├── utils/
│   │   └── helpers.ts           # Logique métier (paiements, anniversaires, etc.)
│   └── types/
│       └── index.ts             # Types TypeScript (Student, Payment, etc.)
├── package.json
├── tsconfig.json
└── app.json                     # Configuration Expo
```

## 🎨 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Login avec email/mot de passe + gestion JWT
- **Dashboard parent** : Liste des élèves avec :
  - Photo + nom + groupe
  - **Statut de paiement** (vert/orange/rouge) - logique exacte de ParentViews.tsx
  - **Taux de présence** avec barre de progression visuelle
  - **Badges anniversaire** (aujourd'hui 🎂 / demain 🎉)
  - Statut actif/inactif
- **Pull-to-refresh** pour actualiser les données
- **Thème sombre** (slate-900 + accents dorés)

### 🚧 À venir (dans le POC complet)
- Détail d'un élève (historique présences, paiements, notes coach)
- Liste des événements + inscription
- Notifications push (paiements, absences, anniversaires)
- Mode hors ligne avec cache local

## 🔧 Configuration Backend

### Modifier l'URL du serveur
Éditer `src/services/api.ts` :

```typescript
const api = axios.create({
  baseURL: 'http://192.168.1.100:5000/api', // ⚠️ Remplacer par votre IP
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Trouver l'IP de votre serveur

**macOS/Linux :**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows :**
```bash
ipconfig | findstr IPv4
```

⚠️ **Important** : `localhost` ne fonctionne PAS depuis un smartphone. Utilisez l'IP LAN (192.168.x.x ou 10.0.x.x).

## 🧪 Test de l'application

1. **Vérifier que le backend fonctionne** :
   ```bash
   curl http://192.168.1.100:5000/api/health
   ```

2. **Tester le login** :
   - Email : celui d'un parent existant dans la base
   - Mot de passe : celui configuré pour ce parent

3. **Vérifier les données** :
   - Les élèves du parent doivent s'afficher
   - Les statuts de paiement doivent être colorés correctement
   - Pull-to-refresh doit recharger les données

## 📚 Stack Technique

- **React Native** 0.72.6 - Framework cross-platform
- **Expo** ~49.0.0 - Toolchain simplifié (pas besoin de Xcode/Android Studio)
- **TypeScript** - Typage strict (types partagés avec le backend)
- **React Navigation** v6 - Navigation native (stack + tabs)
- **Axios** - Client HTTP avec intercepteurs JWT
- **AsyncStorage** - Stockage local (tokens, cache)
- **Expo Linear Gradient** - Dégradés modernes
- **Expo Notifications** - Push notifications (à configurer)

## 🔐 Sécurité

- **JWT Token** stocké dans AsyncStorage (chiffré par iOS/Android)
- Token auto-ajouté à chaque requête via intercepteur Axios
- Déconnexion automatique si token invalide/expiré
- Aucun mot de passe stocké localement

## 🎯 Logique Métier (réutilisée de ParentViews.tsx)

### Statut de paiement (`calculatePaymentStatus`)
Logique **exacte** copiée de `ParentViews.tsx` (lignes 769-831) :

1. **Vérification abonnement annuel** (année scolaire Sept-Août)
2. **Vérification paiement mensuel** (mois en cours)
3. **Période de grâce** : jours 1-5 du mois → Orange
4. **Retard** : après le 5 du mois → Rouge
5. **À jour** : paiement valide → Vert
6. **Non inscrit** : aucun paiement → Gris

### Anniversaires (`isBirthdayToday` / `isBirthdayTomorrow`)
- Détection timezone-safe (parsing de `YYYY-MM-DD`)
- Badge "🎂 Aujourd'hui!" si anniversaire le jour même
- Badge "🎉 Demain" si anniversaire le lendemain

### Taux de présence (`calculateAttendanceRate`)
- Pourcentage des présences (attendances avec `present: true`)
- Barre colorée : vert (≥80%), orange (50-79%), rouge (<50%)

## 🚀 Déploiement (Production)

### Build iOS (App Store)
```bash
expo build:ios
```
Nécessite un compte Apple Developer (99€/an).

### Build Android (Google Play)
```bash
expo build:android
```
Nécessite un compte Google Play (25€ unique).

### Expo EAS (recommandé)
```bash
npm install -g eas-cli
eas build --platform all
```

## 🐛 Debugging

### Afficher les logs
```bash
# Logs React Native
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# Logs Expo
npm start -- --dev-client
```

### Outils de debug
- **React Native Debugger** : https://github.com/jhen0409/react-native-debugger
- **Flipper** : https://fbflipper.com/
- **Expo DevTools** : Ouvrir dans le navigateur après `npm start`

## 📞 Support

- **Backend non accessible** : Vérifier l'IP dans `src/services/api.ts` + firewall serveur
- **Login échoue** : Vérifier que l'email/mot de passe existe dans `users` table
- **Pas d'élèves** : Vérifier que des `students` sont liés au `parent_id` dans la DB
- **Erreur 401** : Token JWT expiré, se déconnecter et se reconnecter

## 🎉 Prochaines Étapes

1. **Tester l'app** avec vos identifiants réels
2. **Créer l'écran détail élève** (historique, notes coach)
3. **Ajouter la liste des événements** + inscription
4. **Configurer les notifications push** (Firebase Cloud Messaging)
5. **Implémenter le mode hors ligne** avec cache local
6. **Ajouter les photos de galerie** (affichage des événements)

---

**Développé avec ❤️ pour GG Dance**
