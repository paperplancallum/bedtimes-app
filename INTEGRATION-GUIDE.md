# Bedtimes App Integration Guide

## Overview
This document explains the complete architecture and integration between the Bedtimes iOS app and Strapi backend.

## Architecture Components

### 1. Backend (Strapi CMS)
- **Location**: Hosted on DigitalOcean at `159.223.185.190:1337`
- **Database**: PostgreSQL 15 (running in Docker)
- **Deployment**: Docker Compose setup at `/root/bedtimes-app`
- **Admin Panel**: http://159.223.185.190:1337/admin

### 2. iOS App (SwiftUI)
- **API Configuration**: `/bedtimes/bedtimes/Config/APIConfig.swift`
- **Base URL**: `http://159.223.185.190:1337/api`
- **Authentication**: Bearer token authentication

## Content Structure

### Volume-Based Organization
The app uses a **Volume-based** content structure (not month-based):
- Each Edition represents a Volume (Volume 1, Volume 2, etc.)
- Stories are nested within Editions
- Cover images and audio files are stored in Strapi

### Strapi Content Types

#### Edition
```json
{
  "volumeNumber": Number,
  "isActive": Boolean,
  "sortOrder": Number,
  "coverImage": Media,
  "stories": Relation to Story (one-to-many),
  "publishedAt": DateTime
}
```

#### Story
```json
{
  "title": String,
  "duration": Number (seconds),
  "narration": Media (audio file),
  "backingTrack": Media (audio file),
  "combinedTrack": Media (audio file),
  "image": Media,
  "edition": Relation to Edition
}
```

## API Integration Details

### API Endpoints
- **Editions**: `GET /api/editions?populate=deep`
- **Stories**: Nested within editions response
- **Authentication**: `/api/auth/local` (for user login)
- **User Subscription**: `/api/auth/subscription` (custom endpoint)

### Authentication Flow
1. **API Token**: Hardcoded in `StrapiService.swift` for public content access
2. **User Auth**: JWT tokens stored in UserDefaults for authenticated requests
3. **Public Access**: Editions and Stories are publicly accessible

### Current API Token
```
8bbecdb3a71dd308d0942780eea988feab38c96518ae68fbee2ed6c28331227a08860b4a45b8a0e1bdf910c2f4a6fcf87608042e6bd07b53da702a751f40b2240d039b55bef01661258c54b23673e0c88a724428f54974f880e06717fdef2b61ff81e4336b4119cf99168f94bd4b3a9c3ccc644663c7f15d9fcddb909a59b0ea
```

## iOS App Configuration

### Key Files
1. **APIConfig.swift**: Contains server URLs
2. **StrapiService.swift**: Main service for API communication
3. **Edition+Strapi.swift**: Converts Strapi models to app models
4. **ContentManager.swift**: Manages local/remote content synchronization

### Data Flow
1. App launches → `StrapiService.fetchEditions()`
2. API returns editions with nested stories
3. `Edition+Strapi.swift` converts response to app models
4. ContentManager stores data and manages audio downloads
5. UI displays content from ContentManager

### Media Handling
- **Images**: Loaded directly from Strapi URLs (e.g., `http://159.223.185.190:1337/uploads/...`)
- **Audio**: Downloaded and cached locally for offline playback
- **Fallback**: Dummy data shown if API fails

## Server Configuration

### Docker Setup
```yaml
services:
  strapi:
    image: bedtimes-strapi:latest
    ports:
      - "1337:1337"
    environment:
      - DATABASE_CLIENT=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=bedtimes
      - DATABASE_USERNAME=strapi
      - DATABASE_PASSWORD=strapi

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=bedtimes
      - POSTGRES_USER=strapi
      - POSTGRES_PASSWORD=strapi
```

### Database Connection
- **Host**: `159.223.185.190`
- **Port**: `5432`
- **Database**: `bedtimes`
- **User**: `strapi`
- **Password**: `strapi`

## Deployment Process

### Backend Deployment
1. SSH to server: `ssh root@159.223.185.190`
2. Navigate to: `cd /root/bedtimes-app`
3. Pull changes: `git pull origin main`
4. Rebuild: `docker compose down && docker compose up -d --build`

### iOS App Deployment
1. Update code in Xcode
2. Clean build folder (Cmd+Shift+K)
3. Build and run (Cmd+R)
4. For production: Archive and upload to App Store Connect

## Common Issues & Solutions

### Issue: App shows dummy data
**Cause**: API permissions not set or authentication failing
**Solution**: 
1. Check Strapi admin → Settings → Roles → Public
2. Enable find/findOne for Edition and Story
3. Verify API token is correct

### Issue: "No image named 'story-cover-2025-feb' found"
**Cause**: App trying to load local assets that don't exist
**Solution**: These are warnings from fallback code, ignore if real images load

### Issue: "Fetched 0 editions from Strapi"
**Cause**: API request failing or returning empty data
**Solution**:
1. Check API is accessible: `curl http://159.223.185.190:1337/api/editions`
2. Verify API token in StrapiService.swift
3. Check server logs: `docker logs bedtimes-strapi`

### Issue: Connection timeout to database
**Cause**: Network issues or database not running
**Solution**: Increased timeouts in `/config/database.js`:
```javascript
connectionTimeoutMillis: 30000,
pool: {
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
}
```

## Security Notes

### Server Access
- **SSH Password**: `8*Sdd!CCDO*UdN`
- **Admin Panel**: Standard Strapi login
- **API Token**: Should be rotated periodically

### App Transport Security
iOS requires HTTPS by default. Exception added for development:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>159.223.185.190</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## Future Improvements

1. **HTTPS**: Set up SSL certificate for production
2. **CDN**: Use CloudFlare for media delivery
3. **Authentication**: Implement proper user subscription system
4. **Monitoring**: Add error tracking and analytics
5. **CI/CD**: Automate deployment process

## Quick Commands Reference

```bash
# Check server status
curl http://159.223.185.190:1337/api/editions?populate=deep

# SSH to server
ssh root@159.223.185.190

# View Docker logs
docker logs bedtimes-strapi -f

# Restart Strapi
docker compose restart

# Check running containers
docker ps

# Database connection
psql -h 159.223.185.190 -U strapi -d bedtimes
```

---
*Last updated: August 5, 2025*