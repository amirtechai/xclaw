---
name: server-deploy
description: "Deploy applications to remote servers via SSH, rsync, git pull, or systemd. Use when: user wants to deploy code, restart a service, update an app on a server, sync files to remote, check deployment status."
homepage: https://github.com/amirtech/xclaw
metadata: { "xclaw": { "emoji": "🚀", "requires": { "bins": ["ssh", "rsync", "git"] } } }
---

# Server Deploy Skill

Deploy and manage applications on remote servers.

## When to Use

✅ **USE this skill when:**

- "Deploy my app to the server"
- "Restart the API service"
- "Pull latest code on production"
- "Sync files to remote server"
- "Check if the deployment succeeded"
- "Roll back to previous version"

## Deployment Patterns

### Git Pull Deploy

```bash
# Pull latest and restart service
ssh user@server 'cd /opt/myapp && git pull origin main && systemctl restart myapp'

# With build step
ssh user@server 'cd /opt/myapp && git pull && npm install --production && systemctl restart myapp'
```

### Rsync Deploy (file sync)

```bash
# Sync local dir to remote (exclude node_modules, .git)
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  ./myapp/ user@server:/opt/myapp/

# Then restart
ssh user@server 'systemctl restart myapp'
```

### Service Management

```bash
# Start / stop / restart / status
ssh user@server 'systemctl start|stop|restart|status myapp'

# View logs
ssh user@server 'journalctl -u myapp -n 50 --no-pager'

# Follow logs
ssh user@server 'journalctl -u myapp -f'
```

### Health Check After Deploy

```bash
# Wait for service to be ready then check
ssh user@server 'sleep 3 && systemctl is-active myapp && curl -sf http://localhost:PORT/health'
```

### Rollback

```bash
# Git rollback
ssh user@server 'cd /opt/myapp && git log --oneline -5'
ssh user@server 'cd /opt/myapp && git checkout <commit-hash> && systemctl restart myapp'
```

### Zero-Downtime Deploy (blue-green)

```bash
# Deploy to new path
ssh user@server 'cd /opt/myapp-new && git pull && npm install --production'
# Swap symlink atomically
ssh user@server 'ln -sfn /opt/myapp-new /opt/myapp-current && systemctl reload nginx'
```

## Pre-Deploy Checklist

Always verify before deploying:

1. `git status` on remote — any uncommitted changes?
2. `systemctl status <service>` — is it currently healthy?
3. `df -h` — enough disk space?
4. Backup `.env` and config files if structure changed

## Response Format

Show each step with ✅/❌ status:

```
✅ Connected to server
✅ Git pull: 3 files changed
✅ Dependencies installed
✅ Service restarted
✅ Health check passed — deploy successful
```
