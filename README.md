# TP NestJS WebSocket

Application de messagerie en temps réel — monorepo pnpm avec une API NestJS et une interface Next.js.

## Stack

| Couche   | Technologie                                         |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 16, NextAuth, shadcn/ui, TailwindCSS        |
| Backend  | NestJS, Prisma, PostgreSQL                          |
| Auth     | JWT (access 15min / refresh 7j), OTP par email, 2FA |
| Mail     | Nodemailer + Mailhog (dev)                          |
| Monorepo | pnpm workspaces                                     |

## Prérequis

- Node.js 20+
- pnpm 9+
- Docker (pour PostgreSQL et Mailhog)

## Installation

```bash
# Cloner le repo
git clone git@github.com:jadechy/nest-cc2.git
cd cc2

# Installer les dépendances
pnpm install
```

## Configuration

### API — `apps/api/.env`

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@monapp.com
APP_URL=localhost:3000
PORT=3001
```

### Web — `apps/web/.env`

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=remplace_par_ton_secret
```

### Docker — `.env` (racine)

```dotenv
DB_USER=user
DB_PASSWORD=password
DB_NAME=dbname
JWT_ACCESS_SECRET=changeme
JWT_REFRESH_SECRET=changeme
```

## Lancement
### Développement

```bash
# Démarrer PostgreSQL et Mailhog
docker compose up -d

# Appliquer les migrations Prisma
pnpm --filter api prisma:migrate

# Générer les fichiers Prisma
pnpm --filter api prisma:generate

# Seed de la base de données
pnpm db:seed

# Démarrer l'API Nest
pnpm dev:api

# Démarrer l'API et le frontend en parallèle
pnpm dev

# Visualiser la Base de données
cd apps/api
npx prisma studio
```

L'API est disponible sur `http://localhost:3001`
Le frontend est disponible sur `http://localhost:3000`
Mailhog (visualisation des emails) est disponible sur `http://localhost:8025`

### Production

```bash
pnpm build
pnpm prod
```

## Scripts

| Commande       | Description                                      |
| -------------- | ------------------------------------------------ |
| `pnpm dev`     | Lance l'API et le frontend en mode développement |
| `pnpm dev:api` | Lance uniquement l'API                           |
| `pnpm dev:web` | Lance uniquement le frontend                     |
| `pnpm build`   | Build l'API et le frontend                       |
| `pnpm prod`    | Lance en mode production                         |
| `pnpm db:seed` | Seed la base de données                          |

## Architecture

```
.
└── apps/
    ├── api/          # NestJS — Auth, Users, Room, Messages, Reaction
    └── web/          # Next.js — Interface utilisateur
```

## Comptes de démonstration

Le code OTP est envoyé par email — récupérez-le sur [Mailhog](http://localhost:8025).

| Email               | Mot de passe   |
| ------------------- | -------------- |
| `alice@example.com` | `Password123!` |
| `bob@example.com`   | `Password123!` |

## Authentification

Le flux d'authentification utilise une double vérification :

1. **Login** — email + mot de passe → envoi d'un OTP par email
2. **Vérification OTP** — saisie du code → retour d'un `access_token` (15min) et `refresh_token` (7j)
3. **Refresh** — renouvellement automatique de l'`access_token` via le `refresh_token`