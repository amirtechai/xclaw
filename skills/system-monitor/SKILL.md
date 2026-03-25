---
name: system-monitor
description: "Monitor system performance: CPU, memory, disk, network, processes. Use when: user asks about server health, high CPU/memory usage, disk space, slow performance, which process is consuming resources, network traffic. Works on Linux and macOS."
homepage: https://github.com/amirtech/xclaw
metadata:
  {
    "xclaw":
      {
        "emoji": "📊",
        "requires": { "bins": ["top", "df", "free"] },
      },
  }
---

# System Monitor Skill

Real-time and historical system performance monitoring.

## When to Use

✅ **USE this skill when:**
- "Is the server overloaded?"
- "What's using all the memory?"
- "Check disk space"
- "Show me CPU usage"
- "Which process is causing high load?"
- "Is the network saturated?"
- "Server health check"

## Commands by Category

### Quick Health Check (run all at once)
```bash
echo "=== CPU ===" && top -bn1 | grep "Cpu(s)" | awk '{print "Usage: " 100-$8 "%"}'
echo "=== Memory ===" && free -h | awk 'NR==2{printf "Used: %s / %s (%.1f%%)\n", $3, $2, $3*100/$2}'
echo "=== Disk ===" && df -h | grep -v tmpfs | awk 'NR>1{print $1, $5, "used of", $2, "on", $6}'
echo "=== Load ===" && uptime | awk -F'load average:' '{print "Load avg:" $2}'
```

### CPU
```bash
# Current CPU usage by process (top 10)
ps aux --sort=-%cpu | head -11 | awk '{printf "%-25s %s%%\n", $11, $3}'

# CPU count and info
nproc && cat /proc/cpuinfo | grep "model name" | head -1
```

### Memory
```bash
# Memory usage
free -h

# Top memory consumers
ps aux --sort=-%mem | head -11 | awk '{printf "%-25s %s%%\n", $11, $4}'

# Detailed memory breakdown
cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable|Cached|Buffers"
```

### Disk
```bash
# Disk usage (all mounted filesystems)
df -h --output=source,size,used,avail,pcent,target | grep -v tmpfs

# Find largest directories
du -sh /* 2>/dev/null | sort -rh | head -15

# Disk I/O stats
iostat -x 1 3 2>/dev/null || cat /proc/diskstats | head -20
```

### Network
```bash
# Network interfaces and traffic
ip -s link show | grep -A5 "^[0-9]"

# Active connections count
ss -s

# Listening ports
ss -tlnp
```

### Processes
```bash
# All processes sorted by CPU
ps aux --sort=-%cpu | head -20

# Find specific process
ps aux | grep <name> | grep -v grep

# Process tree
pstree -p | head -30
```

### System Info
```bash
# OS and kernel
uname -a && lsb_release -a 2>/dev/null

# Uptime
uptime -p

# Last boot
who -b
```

## Response Format

For health checks: use emoji indicators:
- 🟢 Normal (CPU <70%, Mem <80%, Disk <80%)
- 🟡 Warning (CPU 70-90%, Mem 80-90%, Disk 80-90%)  
- 🔴 Critical (CPU >90%, Mem >90%, Disk >90%)

Always provide actionable suggestions when issues are found.
