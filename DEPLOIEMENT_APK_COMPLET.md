# 📦 Instructions de Déploiement APK

## 1️⃣ Télécharger l'APK depuis Expo

Une fois le build terminé, télécharge l'APK :
```bash
# Sur ton Mac
cd ~/Downloads
# Le fichier sera: gg-dance-parent.apk
```

## 2️⃣ Uploader sur ton VPS

```bash
# Depuis ton Mac
scp ~/Downloads/gg-dance-parent.apk ubuntu@141.227.133.61:/tmp/

# Puis connecte-toi au VPS
ssh ubuntu@141.227.133.61

# Crée le dossier downloads
sudo mkdir -p /home/ubuntu/gg-dance/public/downloads
sudo mv /tmp/gg-dance-parent.apk /home/ubuntu/gg-dance/public/downloads/
sudo chown -R www-data:www-data /home/ubuntu/gg-dance/public/downloads
sudo chmod 644 /home/ubuntu/gg-dance/public/downloads/gg-dance-parent.apk
```

## 3️⃣ Uploader la page HTML

```bash
# Depuis ton Mac, upload le fichier app-download.html
scp app-download.html ubuntu@141.227.133.61:/tmp/

# Sur le VPS
ssh ubuntu@141.227.133.61
sudo mv /tmp/app-download.html /home/ubuntu/gg-dance/public/app.html
sudo chown www-data:www-data /home/ubuntu/gg-dance/public/app.html
```

## 4️⃣ Configurer Nginx

```bash
# Sur le VPS
sudo nano /etc/nginx/sites-available/ggdance

# Ajoute ces lignes dans le bloc server {...} :
location /app {
    alias /home/ubuntu/gg-dance/public/app.html;
    add_header Content-Type text/html;
}

location /downloads {
    alias /home/ubuntu/gg-dance/public/downloads;
    autoindex off;
    add_header Content-Type application/vnd.android.package-archive;
    add_header Content-Disposition 'attachment; filename="gg-dance-parent.apk"';
}

# Redémarre nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 5️⃣ Générer le QR Code

Va sur : https://www.qr-code-generator.com/

- Entre l'URL : `https://www.ggdanceacademy.com/app`
- Choisis la taille : **Grande (au moins 500x500 pixels)**
- Télécharge en **PNG haute résolution**
- Imprime sur papier A4

## 6️⃣ Créer l'Affiche

Utilise Canva ou Word avec ce design :

```
┌─────────────────────────────────────────┐
│                                         │
│        [LOGO GG DANCE]                  │
│                                         │
│     📱 TÉLÉCHARGEZ L'APPLICATION        │
│         GG DANCE PARENTS                │
│                                         │
│                                         │
│        [  QR CODE ICI  ]                │
│         (15cm x 15cm)                   │
│                                         │
│                                         │
│   Scannez avec votre téléphone Android  │
│                                         │
│  ✅ Infos de vos enfants en temps réel  │
│  ✅ Paiements et présences              │
│  ✅ Boutique et événements              │
│  ✅ Déclaration d'absences              │
│                                         │
│  📞 Besoin d'aide ? Demandez à l'accueil│
│                                         │
│       www.ggdanceacademy.com            │
└─────────────────────────────────────────┘
```

## 7️⃣ Tester

```bash
# Depuis ton téléphone Android :
# 1. Ouvre le navigateur
# 2. Va sur : https://www.ggdanceacademy.com/app
# 3. Le téléchargement doit démarrer automatiquement
# 4. Installe l'APK en suivant les instructions
```

## 8️⃣ Diffuser aux Parents

**Message WhatsApp à envoyer :**

```
🎉 Bonne nouvelle !

L'application GG Dance Parents est disponible !

📱 Pour télécharger :
👉 https://www.ggdanceacademy.com/app

Ou scannez le QR code affiché à l'académie.

✅ Suivez les instructions d'installation
✅ Connectez-vous avec votre email et votre numéro de téléphone

Besoin d'aide ? Contactez-nous !

GG Dance Academy 💃🕺
```

## ✅ URL Finale

L'application sera accessible à :
**https://www.ggdanceacademy.com/app**

Le QR code pointera vers cette URL.
