Deployment and Secrets Setup

1) Required environment variables (server - Render):
- PORT (optional, default 5000)
- CLIENT_URL (frontend origin, e.g. https://requirement-management-tool-client.vercel.app)
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (use the literal key with \n escaped if using Vercel UI)
- OPENAI_API_KEY (if applicable)

2) Required environment variables (client - Vercel):
- VITE_API_URL (e.g. https://requirement-management-tool.onrender.com/api)
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

3) Production environment variable values to set:
- Render `CLIENT_URL` = your Vercel frontend URL, for example `https://requirement-management-tool-client.vercel.app`
- Render `FIREBASE_PROJECT_ID` = your Firebase project ID (e.g. `remt-60ae7`)
- Render `FIREBASE_CLIENT_EMAIL` = your Firebase admin client email
- Render `FIREBASE_PRIVATE_KEY` = your Firebase private key, with newlines encoded as `\n`
- Render `OPENAI_API_KEY` = your OpenAI API key if required by server features
- Vercel `VITE_API_URL` = your Render backend URL + `/api`, for example `https://requirement-management-tool.onrender.com/api`
- Vercel Firebase values only if frontend needs Firebase auth or client SDK integration

4) How to add secrets on Render:
- Open your service on Render.com
- Go to "Environment" → "Environment Variables" → Add the keys above
- Add `healthCheckPath=/api/health` in service settings or ensure the Render health check uses `/api/health`
- For `FIREBASE_PRIVATE_KEY`, paste the full private key. If Render refuses newlines, replace actual newlines with `\n` when setting the value.

4) How to add secrets on Vercel:
- Open your Vercel project
- Settings → Environment Variables → Add values for `VITE_API_URL` and Firebase client-side keys
- Note: Vite exposes variables that start with `VITE_` during build; do not commit them to git.

5) Verifying CORS and API connectivity locally:
- Start server and client locally:

```bash
# From repo root
npm run dev:server
npm run dev:client
```

- Check the dashboard endpoint in browser DevTools → Network. If CORS is blocking, the request will show `Status: 0` and no response headers.
- To quickly test from the server host (bypasses browser CORS):

```bash
curl -sS https://requirement-management-tool.onrender.com/api/dashboard | jq
```

6) If you need me to set these on Render/Vercel, I can provide the exact values you should paste (but I cannot set them programmatically from this environment).