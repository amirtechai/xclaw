---
name: docker-manager
description: "Manage Docker containers, images, volumes, and networks. Use when: user wants to list/start/stop/restart containers, check logs, pull images, clean up Docker resources, inspect container stats. NOT for: Kubernetes, building Dockerfiles from scratch."
homepage: https://docs.docker.com/reference/cli/docker/
metadata: { "xclaw": { "emoji": "🐳", "requires": { "bins": ["docker"] } } }
---

# Docker Manager Skill

Manage Docker containers, images, and infrastructure directly from chat.

## When to Use

✅ **USE this skill when:**

- "Show me running containers"
- "Restart the nginx container"
- "Check logs for my app"
- "How much memory is docker using?"
- "Remove unused images"
- "What ports are exposed?"
- "Pull the latest postgres image"

## Core Commands

### List & Status

```bash
# All containers (running + stopped)
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Container resource usage (live)
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk usage summary
docker system df
```

### Container Control

```bash
docker start <name>
docker stop <name>
docker restart <name>
docker rm <name>         # remove stopped container
docker rm -f <name>      # force remove running container
```

### Logs

```bash
docker logs <name> --tail 100
docker logs <name> --tail 50 --follow   # live tail
docker logs <name> --since 1h           # last 1 hour
```

### Images

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
docker pull <image>:<tag>
docker rmi <image>
docker image prune -f    # remove dangling images
```

### Cleanup

```bash
docker system prune -f          # remove stopped containers + dangling images
docker system prune -af         # aggressive: remove ALL unused images too
docker volume prune -f          # remove unused volumes
```

### Inspect

```bash
docker inspect <name>
docker exec -it <name> sh        # shell into container
docker exec <name> <command>     # run command in container
```

### Networks

```bash
docker network ls
docker network inspect <name>
```

## Response Format

When listing containers, always show: Name, Status, Image, Ports in a clean table.
When showing logs, show the last 50 lines by default unless asked for more.
When cleaning up, always show what was removed and how much space was freed.

## Safety Rules

- NEVER remove volumes without explicit confirmation
- NEVER remove running containers unless asked to force-remove
- ALWAYS confirm before `system prune -af` as it removes all unused images
- Show container names, not just IDs
