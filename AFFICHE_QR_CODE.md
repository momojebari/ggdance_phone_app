# 📱 Affiche QR Code - GG Dance Parents App

## 🎯 Stratégie de Distribution

### **Option 1 : Site Web avec Détection Automatique (RECOMMANDÉ)**

Créer une page web sur `www.ggdanceacademy.com/app` qui :
- Détecte automatiquement Android ou iOS
- Télécharge le bon fichier (APK pour Android)
- Affiche les instructions d'installation

**Le QR code pointe vers cette page web.**

---

## 🌐 Page Web Nécessaire

Je vais créer le code HTML pour cette page :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GG Dance - Application Parents</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 500px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
        }
        h1 {
            color: #eab308;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #94a3b8;
            margin-bottom: 30px;
        }
        .download-btn {
            background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
            color: #0f172a;
            font-size: 18px;
            font-weight: bold;
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
        }
        .platform {
            background: rgba(234, 179, 8, 0.2);
            padding: 10px 20px;
            border-radius: 10px;
            margin: 20px 0;
            color: #eab308;
        }
        .instructions {
            background: rgba(6, 182, 212, 0.1);
            border: 2px solid rgba(6, 182, 212, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
            text-align: left;
        }
        .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
        }
        .step {
            margin: 15px 0;
            padding-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="/uploads/images/compressed-1764857554052-6viu3.png" alt="GG Dance" class="logo">
        <h1>GG Dance Parents</h1>
        <p class="subtitle">Application officielle pour les parents</p>
        
        <div class="platform" id="platform-info">
            Détection du système...
        </div>
        
        <a href="#" id="download-btn" class="download-btn" style="display:none;">
            📥 Télécharger l'Application
        </a>
        
        <div class="warning" id="android-warning" style="display:none;">
            <strong>⚠️ Important Android</strong><br>
            Votre téléphone va afficher un message de sécurité.<br>
            C'est normal ! Suivez les instructions ci-dessous.
        </div>
        
        <div class="instructions" id="instructions" style="display:none;">
            <h3>📋 Instructions d'installation</h3>
            <div id="android-steps" style="display:none;">
                <div class="step">
                    <strong>1️⃣</strong> Le fichier APK va se télécharger
                </div>
                <div class="step">
                    <strong>2️⃣</strong> Ouvrez la notification de téléchargement
                </div>
                <div class="step">
                    <strong>3️⃣</strong> Quand le message "Bloquer cette installation" apparaît :
                    <ul>
                        <li>Appuyez sur "Paramètres"</li>
                        <li>Activez "Autoriser depuis cette source"</li>
                        <li>Revenez en arrière</li>
                        <li>Appuyez sur "Installer"</li>
                    </ul>
                </div>
                <div class="step">
                    <strong>4️⃣</strong> Ouvrez l'application et connectez-vous
                </div>
            </div>
            <div id="ios-steps" style="display:none;">
                <div class="step">
                    <strong>❌ Désolé</strong><br>
                    La version iOS n'est pas encore disponible.<br>
                    Utilisez un téléphone Android pour le moment.
                </div>
            </div>
        </div>
        
        <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
            Besoin d'aide ? Contactez l'académie<br>
            📞 [VOTRE_NUMERO] | 📧 contact@ggdanceacademy.com
        </p>
    </div>
    
    <script>
        // Détecter le système d'exploitation
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const platformInfo = document.getElementById('platform-info');
        const downloadBtn = document.getElementById('download-btn');
        const instructions = document.getElementById('instructions');
        const androidWarning = document.getElementById('android-warning');
        const androidSteps = document.getElementById('android-steps');
        const iosSteps = document.getElementById('ios-steps');
        
        // URL du fichier APK (À REMPLACER avec ton lien réel)
        const APK_URL = 'https://www.ggdanceacademy.com/downloads/gg-dance-parent.apk';
        
        if (/android/i.test(userAgent)) {
            // Android détecté
            platformInfo.innerHTML = '🤖 Android détecté';
            platformInfo.style.borderColor = '#10b981';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.href = APK_URL;
            androidWarning.style.display = 'block';
            instructions.style.display = 'block';
            androidSteps.style.display = 'block';
            
            // Téléchargement automatique après 2 secondes
            setTimeout(() => {
                downloadBtn.click();
            }, 2000);
            
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            // iOS détecté
            platformInfo.innerHTML = '🍎 iOS détecté';
            platformInfo.style.borderColor = '#ef4444';
            instructions.style.display = 'block';
            iosSteps.style.display = 'block';
            
        } else {
            // Autre (ordinateur, etc.)
            platformInfo.innerHTML = '💻 Scannez ce QR code avec votre téléphone';
            platformInfo.style.borderColor = '#94a3b8';
        }
    </script>
</body>
</html>
```

---

## 📋 **Étapes pour Mettre en Place**

### 1. **Créer le fichier sur ton site web**
```bash
# Sur ton VPS
cd /home/ubuntu/gg-dance/public
nano app-download.html
# Colle le code HTML ci-dessus
```

### 2. **Uploader l'APK sur ton serveur**
```bash
# Sur ton VPS
mkdir -p /home/ubuntu/gg-dance/public/downloads
# Upload l'APK ici
```

### 3. **Configurer Nginx**
Ajoute dans ta config nginx :
```nginx
location /app {
    alias /home/ubuntu/gg-dance/public/app-download.html;
}

location /downloads {
    alias /home/ubuntu/gg-dance/public/downloads;
    autoindex off;
}
```

### 4. **Générer le QR Code**
URL à encoder : `https://www.ggdanceacademy.com/app`

Je peux générer le QR code pour toi !

---

## 🎨 **Design de l'Affiche**

Voici le texte pour ton affiche à imprimer :

```
┌─────────────────────────────────────────┐
│                                         │
│          📱 NOUVELLE APPLICATION        │
│           GG DANCE PARENTS              │
│                                         │
│    [    QR CODE ICI    ]                │
│        (12cm x 12cm)                    │
│                                         │
│  Scannez avec votre téléphone Android   │
│    pour télécharger l'application       │
│                                         │
│  ✅ Voir les infos de vos enfants      │
│  ✅ Consulter paiements & présences     │
│  ✅ Réserver produits & événements      │
│  ✅ Déclarer les absences               │
│                                         │
│  📞 Besoin d'aide ?                     │
│  Demandez à l'accueil                   │
│                                         │
│  www.ggdanceacademy.com                 │
└─────────────────────────────────────────┘
```

---

## 🚀 **Prochaines Étapes**

Veux-tu que je :
1. ✅ **Crée le fichier HTML** complet prêt à uploader ?
2. ✅ **Génère le QR code** en haute résolution ?
3. ✅ **Prépare l'affiche PDF** complète prête à imprimer ?
4. ✅ **Crée le build APK** final ?

Dis-moi et je commence ! 🎯
