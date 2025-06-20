asidfjsodi:wq# Arazial Web Application

Web version of the Arazial land auction platform.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm start
```

## Production Build

```bash
# Create production build
npm run build
```

## Deployment

This project is configured for deployment on Vercel.

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Vercel will automatically deploy the application

## Environment Variables

The following environment variables are required:

- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous API key 

## Recent Updates

### 'Yeni Eklenenler' Tab Implementation
- Added "Yeni Eklenenler" (Newly Added) as a main tab alongside "Açık Arttırmalar" and "Pazarlığa Başla"
- The tab shows listings added within the last 7 days
- Enhanced mobile responsiveness of the tab system
- Improved styling for better visibility on smaller screens 
