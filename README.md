# 🚀 Reputation OS

> SaaS intelligent pour gérer les avis Google avec IA - Génération automatique de réponses personnalisées et analyse de sentiment

## 📋 Vue d'ensemble

Reputation OS transforme la gestion des avis clients en un processus automatisé et intelligent. Grâce à l'IA, vous pouvez générer des réponses personnalisées, analyser le sentiment de vos clients et identifier les axes d'amélioration de votre business.

### ✨ Fonctionnalités principales

- **🤖 Génération automatique de réponses IA** : 3 propositions de réponses personnalisées pour chaque avis
- **🧠 Base de connaissance intelligente** : L'IA comprend votre entreprise (ton, politiques, valeurs)
- **📊 Dashboard d'intelligence** : Analyse de sentiment et identification des points forts/faibles
- **🎯 Guidage de l'IA** : Affinez les réponses avec des instructions spécifiques
- **🔄 Synchronisation Google** : Récupération automatique des avis Google My Business
- **📈 Analytics avancés** : Suivez l'évolution de votre réputation dans le temps

## 🛠️ Stack technique

- **Frontend/Backend** : Next.js 14/15 (App Router)
- **Base de données** : Neon (PostgreSQL) + Prisma ORM
- **Authentification** : Clerk
- **Intelligence artificielle** : OpenAI API (GPT-4)
- **Intégration** : Google Business Profile API
- **Paiements** : Stripe
- **Déploiement** : Vercel
- **Versioning** : GitHub

## 📁 Structure du projet

```
reputation-os/
├── app/
│   ├── (auth)/              # Routes d'authentification
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/         # Application protégée
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── reviews/         # Gestion des avis
│   │   ├── settings/        # Configuration
│   │   └── onboarding/      # Wizard d'onboarding
│   ├── api/                 # API endpoints
│   └── layout.tsx
├── components/
│   ├── ui/                  # Composants UI (shadcn/ui)
│   ├── dashboard/           # Composants métier
│   └── marketing/           # Landing page
├── lib/
│   ├── supabase/           # Clients DB
│   ├── openai/             # Fonctions IA
│   └── google/             # API Google Business
├── actions/                # Server Actions
├── types/                  # Types TypeScript
└── prisma/
    └── schema.prisma       # Schéma de base de données
```

## 🚦 Démarrage rapide

### Prérequis

- Node.js 18+
- Un compte Neon (PostgreSQL)
- Un compte Clerk
- Une clé API OpenAI
- Un accès à l'API Google Business Profile

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/JosuaMbia/reputation-os.git
cd reputation-os

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# 4. Initialiser la base de données
npx prisma db push

# 5. Lancer le serveur de développement
npm run dev
```

### Variables d'environnement

```bash
# Base de données (Neon)
DATABASE_URL="postgresql://..."

# Authentification (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Intelligence artificielle
OPENAI_API_KEY="sk-..."

# Google Business Profile API
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Paiements (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 💰 Modèle de pricing

### Plan Starter - 29€/mois
- 1 établissement
- Réponses IA illimitées
- Personnalisation basique
- Support email

### Plan Growth - 59€/mois
- 3 établissements
- Dashboard d'analyse complet
- Guidage de l'IA
- Support prioritaire

### Plan Agency - Sur devis
- Établissements illimités
- Marque blanche
- Gestion multi-clients
- Support dédié

## 📊 Schéma de base de données

```prisma
model User {
  id         String     @id @default(cuid())
  email      String     @unique
  name       String?
  plan       String     @default("free")
  createdAt  DateTime   @default(now())
  businesses Business[]
}

model Business {
  id             String   @id @default(cuid())
  name           String
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  googlePlaceId  String?
  tone           String?  @default("professionnel")
  policies       Json?
  reviews        Review[]
}

model Review {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id])
  content     String
  rating      Int
  authorName  String
  response    String?
  isReplied   Boolean  @default(false)
  sentiment   String?
  createdAt   DateTime @default(now())
}
```

## 🎯 Roadmap (7 jours)

### Jour 1 : Fondations
- ✅ Configuration du projet Next.js
- ✅ Configuration Clerk (authentification)
- ✅ Configuration Neon (base de données)

### Jour 2 : Connexion Google
- 🔄 Intégration Google Business Profile API
- 🔄 Récupération des avis

### Jour 3 : Cerveau IA
- 🔄 Formulaire d'onboarding
- 🔄 Prompt engineering
- 🔄 Génération de réponses

### Jour 4 : UX de réponse
- 🔄 Design des cartes de réponse
- 🔄 Fonction "Guider l'IA"
- 🔄 Copier/coller vers Google

### Jour 5 : Intelligence
- 🔄 Analyse de sentiment
- 🔄 Dashboard analytics

### Jour 6 : Paiements & Landing
- 🔄 Intégration Stripe
- 🔄 Landing page

### Jour 7 : Tests & Lancement
- 🔄 Tests complets
- 🔄 Déploiement Vercel
- 🔄 Lancement public

## 📝 Prompt système IA

Le prompt utilisé pour générer les réponses :

```
Rôle: Tu es un expert en communication client pour l'entreprise "{BUSINESS_NAME}".

Contexte: Voici un avis reçu: "{REVIEW_TEXT}" (Note: {STARS}/5).

Ta Base de Connaissance :
- Ton: {TONE_SETTING}
- Politique: {POLICY_SETTINGS}
- Signature: {SIGNATURE}

Tâche 1 (Rédaction): Génère 3 variations de réponse :
1. Empathique (chaleureuse et personnelle)
2. Commerciale (invite à revenir)
3. Courte (concise et efficace)

Tâche 2 (Analyse - format JSON):
- Sentiment: (Positif/Neutre/Négatif)
- Sujets clés: (Liste de 1 à 3 mots clés)
- Action requise: (Oui/Non)
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

**Josua Mbia**
- GitHub: [@JosuaMbia](https://github.com/JosuaMbia)

## 🙏 Remerciements

- Gemini AI pour l'assistance dans la conception
- La communauté Next.js
- Les contributeurs open-source

---

**Fait avec ❤️ et ☕ par [Josua Mbia](https://github.com/JosuaMbia)**
