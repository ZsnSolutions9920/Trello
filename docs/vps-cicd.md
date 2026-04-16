# VPS CI/CD

This project now includes a GitHub Actions workflow at `.github/workflows/deploy-vps.yml` that builds the app on every push to `main` and, if the build passes, deploys the latest code to your VPS over SSH.

## What the workflow does

1. Runs `npm ci`
2. Runs `npm run build`
3. Syncs the repository to the VPS with `rsync`
4. Runs `deploy/deploy.sh` on the VPS
5. The server-side script:
   - runs `npm ci`
   - runs `npm run build`
   - runs `npx prisma migrate deploy`
   - restarts the systemd service that serves the app

## GitHub secrets to add

Add these repository secrets in GitHub:

- `VPS_HOST`: public IP or hostname of the VPS
- `VPS_PORT`: SSH port, usually `22`
- `VPS_USER`: SSH user that can write into the app directory
- `VPS_SSH_KEY`: private SSH key for that user
- `VPS_APP_DIR`: absolute path to the app on the VPS, for example `/var/www/trello`
- `VPS_SERVICE_NAME`: systemd service name, for example `trello.service`

## One-time VPS setup

### 1. Create the app directory

```bash
sudo mkdir -p /var/www/trello
sudo chown -R <deploy-user>:<deploy-user> /var/www/trello
```

### 2. Put the production environment file on the server

Create `/var/www/trello/.env` with the production values used by the app, including the database connection and any external API keys. The workflow does not upload `.env`.

### 3. Install Node.js 20 and dependencies used on the server

At minimum, the VPS needs:

- Node.js 20
- npm
- systemd
- a PostgreSQL database reachable from the app

### 4. Install the systemd service

Copy `deploy/trello.service.example` to `/etc/systemd/system/trello.service`, replace:

- `__APP_USER__` with your deploy user
- `__APP_DIR__` with your app directory

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable trello.service
sudo systemctl start trello.service
```

### 5. Allow the deploy user to restart only this service

Run `sudo visudo -f /etc/sudoers.d/trello-deploy` and add:

```sudoers
<deploy-user> ALL=NOPASSWD: /bin/systemctl restart trello.service, /bin/systemctl status trello.service
```

Adjust the service name if you do not use `trello.service`.

## First deploy

After the secrets and VPS setup are in place, push to `main` or run the workflow manually from the Actions tab. GitHub will build the app first; only a successful build will deploy to the VPS.

## Notes

- This setup matches the current custom Next.js server in `server.ts`, so the app is started with `npm run start`, not `next start`.
- The workflow intentionally excludes `.env`, `.next`, and `node_modules` from the sync.
- For a single VPS instance, this is enough. If you later move to multiple app servers or rolling deploys, revisit Next.js deployment IDs and shared cache handling.
