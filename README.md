# Academic Certificate Verification System — Cloud / No-Docker Edition

This is the same React + TypeScript frontend and Django REST backend from the supplied project. Docker files have been removed. Existing screens and API features are retained.

## What the project currently does

- Login with JWT authentication
- Dashboard counts
- Add certificate with PDF upload
- SHA-256 hash generation for uploaded PDF
- QR-code generation for public verification
- Certificate list, search and details
- Public certificate verification
- Compare an uploaded PDF against the registered file hash
- Revoke certificate
- Validate the hash-linked ledger

**Blockchain clarification:** the supplied source code implements a hash-chain ledger stored in the database (`backend/certificates/blockchain.py`). The uploaded ZIP did not contain a Solidity contract or an Ethereum deployment script. This cloud-ready edition preserves that existing behavior; it does not silently replace it with a different blockchain implementation or claim it is an on-chain Ethereum contract.

## No local software installation: use VS Code in the browser

The easiest route is GitHub Codespaces. It provides a VS Code-like editor and preconfigured cloud development environment in the browser. You do not need to install Python, Node.js, PostgreSQL, Docker Desktop, or Postman on your computer.

1. Sign in to GitHub in your browser and create a new **private** repository.
2. Upload this project folder's contents to that repository (keep `frontend/` and `backend/` at the repository root).
3. Open the repository on GitHub.
4. Select **Code → Codespaces → Create codespace on main**.
5. When the VS Code browser editor opens, open its terminal.

Codespaces availability and included free usage depend on your GitHub account. If GitHub asks you to choose a machine, choose a basic option.

## Run the backend in Codespaces

In the terminal:

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

The backend uses SQLite automatically when `DATABASE_URL` is not set. This is suitable for a temporary Codespaces demo. For persistent hosted data, connect a managed PostgreSQL database as described below.

## Run the frontend in Codespaces

Open a second terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the forwarded port **5173** when Codespaces offers it. If it is private, change the port visibility to **Public** only if you intentionally want others to access your demo.

The frontend defaults to `http://localhost:8000/api`. In Codespaces, this usually works from the browser preview because the frontend and backend ports are forwarded by the same Codespace. If your browser preview cannot reach the backend, use the forwarded backend URL and set it as `VITE_API_BASE_URL` in `frontend/.env`, ending with `/api`, then restart Vite.

## Cloud hosting (optional)

You can keep coding in Codespaces and host the app online:

### 1. PostgreSQL database — Render

1. Create a PostgreSQL database in Render.
2. Copy its **Internal Database URL** if the web service is also on Render (otherwise use the external URL).
3. In the backend Render web service, add environment variable `DATABASE_URL` with that URL.
4. Add `DJANGO_SECRET_KEY` with a long random secret.
5. Set `DJANGO_DEBUG=0`.
6. Set `DJANGO_ALLOWED_HOSTS` to your backend hostname, for example `your-service.onrender.com`.
7. Set `CORS_ALLOWED_ORIGINS` to your exact Vercel frontend URL.
8. Set `CSRF_TRUSTED_ORIGINS` to your exact HTTPS frontend URL.
9. Set `FRONTEND_BASE_URL` to your exact Vercel frontend URL.

### 2. Django backend — Render

Create a **Web Service** from the GitHub repository:
- Root directory: `backend`
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

Add the environment variables listed above. After deployment, create an admin account from the Render Shell:

```bash
python manage.py createsuperuser
```

**Uploaded PDF and QR persistence:** this project currently uses Django's local media-file storage. Render's ordinary service filesystem may be temporary. For persistent uploaded certificates, attach a Render persistent disk and set `MEDIA_ROOT` to its mount path (for example `/var/data/media`), or configure a durable object-storage service before using it for real records. Do not treat temporary media storage as permanent.

### 3. React frontend — Vercel

1. Import the same GitHub repository into Vercel.
2. Set the project root directory to `frontend`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variable `VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api`.
7. Deploy.

After the first Vercel deployment, copy its URL into the backend's `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` (include `https://`), and `FRONTEND_BASE_URL`, then redeploy the backend.

## Important note about "no installation"

You do not need to install development tools on your own computer if you use the browser-based Codespaces environment. The project still needs its dependencies installed **inside that cloud workspace** using `pip install` and `npm install`; these commands install project libraries in the cloud, not on your Windows computer.

If you want to use the locally installed VS Code desktop application without installing Python or Node.js anywhere, that is not enough by itself to execute a Django + React project. Use the VS Code browser editor in Codespaces for the no-local-install route.

## Project structure

```text
Academic-Certificate-Verification/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AddCertificate.tsx
│   │   │   ├── CertificateList.tsx
│   │   │   └── VerifyCertificate.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── certificates/
│   ├── config/
│   ├── manage.py
│   ├── Procfile
│   └── requirements.txt
└── README.md
```

## Security / mini-project limitations

- Change the Django secret key before deployment.
- Create a strong admin password.
- Do not commit `.env` files or credentials to GitHub.
- Keep the GitHub repository private while it contains demo data or configuration.
- The hash-chain ledger is database-backed. It demonstrates hash linking and tamper detection but is not equivalent to independently operated public blockchain consensus.
- Use durable media storage before uploading certificates that must remain available.
