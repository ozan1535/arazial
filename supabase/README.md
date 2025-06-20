## Environment Variables

Ensure these environment variables are set in your Supabase project:

### Edge Functions Environment Variables

- `VERIMOR_USERNAME`: Verimor API username (old method, deprecated)
- `VERIMOR_PASSWORD`: Verimor API password (old method, deprecated)
- `VERIMOR_SOURCE_ADDR`: Verimor sender ID (old method, deprecated)
- `VERIMOR_PROXY_URL`: The URL of your Verimor proxy server (e.g., https://your-proxy-server.com)
- `VERIMOR_PROXY_API_KEY`: The API key for your Verimor proxy server

To set these variables in your Supabase project, run:

```bash
supabase secrets set VERIMOR_PROXY_URL=https://your-proxy-server.com
supabase secrets set VERIMOR_PROXY_API_KEY=your-secure-api-key
``` 