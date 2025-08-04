# Bedtimes Backend

Strapi CMS backend for the Bedtimes iOS application.

## Prerequisites

- Node.js (v16-v20)
- Docker and Docker Compose
- npm or yarn

## Setup

1. Start PostgreSQL database:
```bash
docker-compose up -d
```

2. Install dependencies and create Strapi app:
```bash
./setup-strapi.sh
```

3. Start Strapi development server:
```bash
npm run develop
```

4. Access Strapi admin panel at: http://localhost:1337/admin

## Database

- PostgreSQL running in Docker
- Database name: bedtimes_db
- Username: bedtimes
- Password: bedtimes_dev_password
- Port: 5432

## Content Types

After setup, create these content types in Strapi admin:

### Edition
- volumeNumber (Number, required, unique)
- coverImageURL (Text)
- isActive (Boolean, default: true)
- sortOrder (Number)
- stories (Relation: has many Stories)

### Story
- title (Text, required)
- description (Text)
- imageURL (Text)
- narrationURL (Text)
- backingTrackURL (Text)
- combinedTrackURL (Text)
- duration (Number)
- edition (Relation: belongs to Edition)
- metadata (JSON):
  - historicalPeriod
  - ageRange
  - iconName

### UserSubscription
- user (Relation: belongs to User)
- planType (Enumeration: 3_month, 6_month, annual)
- startDate (Date)
- endDate (Date)
- currentVolumeNumber (Number)
- status (Enumeration: active, expired, cancelled)

## API Endpoints

- `POST /api/auth/local` - User login
- `GET /api/users/me` - Get current user
- `GET /api/editions` - Get all editions
- `GET /api/stories` - Get all stories

## Development

```bash
# Start database
npm run docker:up

# Start Strapi
npm run develop

# View database logs
npm run docker:logs

# Stop database
npm run docker:down
```

## Production

1. Update database credentials
2. Configure environment variables
3. Build Strapi: `npm run build`
4. Start production server: `npm start`