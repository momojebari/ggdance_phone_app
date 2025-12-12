# 📱 Guide de Déploiement - GG Dance Mobile

## ✅ Changements Appliqués

- ✅ Logo officiel GG Dance ajouté
- ✅ Icône d'application configurée
- ✅ Correction endpoint API `/products/reserve` → `/products/:id/order`
- ✅ Code poussé sur GitHub: `git@github.com:momojebari/ggdance_phone_app.git`

---

## 🚀 Options de Déploiement

### Option 1: Publication sur Expo (Recommandé pour tester)

Cette option permet de distribuer l'app via Expo Go **sans passer par les stores**.

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter à Expo
eas login

# 3. Configurer le projet
eas build:configure

# 4. Créer un build de développement
eas build --profile development --platform android

# 5. Une fois le build terminé, un QR code sera généré
# Les utilisateurs peuvent scanner ce QR avec Expo Go pour installer l'app
```

**Avantages:**
- Gratuit
- Pas besoin de compte développeur Apple/Google
- Installation facile via QR code
- Updates instantanées avec `eas update`

---

### Option 2: Build Standalone (APK Android)

Pour distribuer un APK installable directement.

```bash
# 1. Créer un build Android
eas build --platform android --profile preview

# 2. Une fois terminé, télécharger l'APK depuis:
# https://expo.dev/accounts/[votre-compte]/projects/gg-dance-parent/builds

# 3. Partager l'APK aux parents
```

**Installation:**
- Les parents téléchargent l'APK
- Activent "Sources inconnues" sur Android
- Installent l'APK

---

### Option 3: Publication sur Google Play Store

Pour une distribution officielle (nécessite 25$ pour le compte développeur).

```bash
# 1. Créer un compte Google Play Developer
# https://play.google.com/console/signup

# 2. Générer les clés de signature
eas credentials

# 3. Créer un build de production
eas build --platform android --profile production

# 4. Soumettre sur Google Play
eas submit --platform android
```

---

### Option 4: Publication sur Apple App Store

Pour iOS (nécessite 99$/an pour le compte développeur Apple).

```bash
# 1. Créer un compte Apple Developer
# https://developer.apple.com

# 2. Créer un build iOS
eas build --platform ios --profile production

# 3. Soumettre sur App Store
eas submit --platform ios
```

---

## 📦 Ce que les Parents Recevront

### Avec Expo Go (Option 1):
1. Instructions pour installer **Expo Go** depuis le Play Store
2. Un QR code à scanner
3. L'app s'ouvre directement dans Expo Go

### Avec APK (Option 2):
1. Lien de téléchargement de l'APK
2. Instructions d'installation
3. L'app s'installe comme une app native

### Avec Store (Options 3 & 4):
1. Lien vers Google Play / App Store
2. Installation standard depuis le store

---

## 🔄 Mise à Jour de l'Application

### Avec Expo (OTA - Over The Air):

Les mises à jour se font **instantanément** sans republier l'app:

```bash
# Après avoir modifié le code
cd /Users/mohamedjebari/Desktop/gg-dance-mobile-parent

# Publier la mise à jour
eas update --branch production --message "Correction bug paiements"

# Les utilisateurs recevront la mise à jour au prochain lancement
```

---

## 📊 Recommandation

**Pour commencer rapidement:**

1. **Option 1 (Expo Go)** - Idéal pour tester avec quelques parents
2. Ensuite **Option 2 (APK)** - Pour distribution plus large sans frais
3. Plus tard **Option 3 (Play Store)** - Pour professionnaliser

---

## 🛠️ Commandes Rapides

```bash
# Démarrer en développement
npm start

# Créer un build Expo
eas build --profile development --platform android

# Publier une mise à jour OTA
eas update --branch production

# Voir les builds
eas build:list

# Télécharger un APK
eas build:download --platform android
```

---

## 📱 Informations de l'App

- **Nom**: GG Dance Parent
- **Package Android**: `com.ggdance.parent`
- **Bundle iOS**: `com.ggdance.parent`
- **Version**: 1.0.0
- **Backend**: `http://141.227.133.61:3000/api`
- **GitHub**: `git@github.com:momojebari/ggdance_phone_app.git`

---

## 🔐 Credentials de Test

- **Email**: `parent@ggdance.tn`
- **Password**: `22222222`

Ou tout autre compte parent existant avec leur email et numéro de téléphone.

---

## ⚡ Next Steps

1. ✅ Code déployé sur GitHub
2. ⏳ Créer un compte Expo: https://expo.dev/signup
3. ⏳ Installer EAS CLI: `npm install -g eas-cli`
4. ⏳ Lancer le premier build: `eas build --profile development --platform android`
5. ⏳ Tester avec quelques parents
6. ⏳ Décider de la stratégie de distribution finale
