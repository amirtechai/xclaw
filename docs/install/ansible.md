---
summary: "Automated, hardened XClaw installation with Ansible, Tailscale VPN, and firewall isolation"
read_when:
  - You want automated server deployment with security hardening
  - You need firewall-isolated setup with VPN access
  - You're deploying to remote Debian/Ubuntu servers
title: "Ansible"
---

# Ansible Installation

Deploy XClaw to production servers with **[xclaw-ansible](https://github.com/xclaw/xclaw-ansible)** -- an automated installer with security-first architecture.

<Info>
The [xclaw-ansible](https://github.com/xclaw/xclaw-ansible) repo is the source of truth for Ansible deployment. This page is a quick overview.
</Info>

## Prerequisites

| Requirement | Details                                                   |
| ----------- | --------------------------------------------------------- |
| **OS**      | Debian 11+ or Ubuntu 20.04+                               |
| **Access**  | Root or sudo privileges                                   |
| **Network** | Internet connection for package installation              |
| **Ansible** | 2.14+ (installed automatically by the quick-start script) |

## What You Get

- **Firewall-first security** -- UFW + Docker isolation (only SSH + Tailscale accessible)
- **Tailscale VPN** -- secure remote access without exposing services publicly
- **Docker** -- isolated sandbox containers, localhost-only bindings
- **Defense in depth** -- 4-layer security architecture
- **Systemd integration** -- auto-start on boot with hardening
- **One-command setup** -- complete deployment in minutes

## Quick Start

One-command install:

```bash
curl -fsSL https://raw.githubusercontent.com/xclaw/xclaw-ansible/main/install.sh | bash
```

## What Gets Installed

The Ansible playbook installs and configures:

1. **Tailscale** -- mesh VPN for secure remote access
2. **UFW firewall** -- SSH + Tailscale ports only
3. **Docker CE + Compose V2** -- for agent sandboxes
4. **Node.js 24 + pnpm** -- runtime dependencies (Node 22 LTS, currently `22.16+`, remains supported)
5. **XClaw** -- host-based, not containerized
6. **Systemd service** -- auto-start with security hardening

<Note>
The gateway runs directly on the host (not in Docker), but agent sandboxes use Docker for isolation. See [Sandboxing](/gateway/sandboxing) for details.
</Note>

## Post-Install Setup

<Steps>
  <Step title="Switch to the xclaw user">
    ```bash
    sudo -i -u xclaw
    ```
  </Step>
  <Step title="Run the onboarding wizard">
    The post-install script guides you through configuring XClaw settings.
  </Step>
  <Step title="Connect messaging providers">
    Log in to WhatsApp, Telegram, Discord, or Signal:
    ```bash
    xclaw channels login
    ```
  </Step>
  <Step title="Verify the installation">
    ```bash
    sudo systemctl status xclaw
    sudo journalctl -u xclaw -f
    ```
  </Step>
  <Step title="Connect to Tailscale">
    Join your VPN mesh for secure remote access.
  </Step>
</Steps>

### Quick Commands

```bash
# Check service status
sudo systemctl status xclaw

# View live logs
sudo journalctl -u xclaw -f

# Restart gateway
sudo systemctl restart xclaw

# Provider login (run as xclaw user)
sudo -i -u xclaw
xclaw channels login
```

## Security Architecture

The deployment uses a 4-layer defense model:

1. **Firewall (UFW)** -- only SSH (22) + Tailscale (41641/udp) exposed publicly
2. **VPN (Tailscale)** -- gateway accessible only via VPN mesh
3. **Docker isolation** -- DOCKER-USER iptables chain prevents external port exposure
4. **Systemd hardening** -- NoNewPrivileges, PrivateTmp, unprivileged user

To verify your external attack surface:

```bash
nmap -p- YOUR_SERVER_IP
```

Only port 22 (SSH) should be open. All other services (gateway, Docker) are locked down.

Docker is installed for agent sandboxes (isolated tool execution), not for running the gateway itself. See [Multi-Agent Sandbox and Tools](/tools/multi-agent-sandbox-tools) for sandbox configuration.

## Manual Installation

If you prefer manual control over the automation:

<Steps>
  <Step title="Install prerequisites">
    ```bash
    sudo apt update && sudo apt install -y ansible git
    ```
  </Step>
  <Step title="Clone the repository">
    ```bash
    git clone https://github.com/xclaw/xclaw-ansible.git
    cd xclaw-ansible
    ```
  </Step>
  <Step title="Install Ansible collections">
    ```bash
    ansible-galaxy collection install -r requirements.yml
    ```
  </Step>
  <Step title="Run the playbook">
    ```bash
    ./run-playbook.sh
    ```

    Alternatively, run directly and then manually execute the setup script afterward:
    ```bash
    ansible-playbook playbook.yml --ask-become-pass
    # Then run: /tmp/xclaw-setup.sh
    ```

  </Step>
</Steps>

## Updating

The Ansible installer sets up XClaw for manual updates. See [Updating](/install/updating) for the standard update flow.

To re-run the Ansible playbook (for example, for configuration changes):

```bash
cd xclaw-ansible
./run-playbook.sh
```

This is idempotent and safe to run multiple times.

## Troubleshooting

<AccordionGroup>
  <Accordion title="Firewall blocks my connection">
    - Ensure you can access via Tailscale VPN first
    - SSH access (port 22) is always allowed
    - The gateway is only accessible via Tailscale by design
  </Accordion>
  <Accordion title="Service will not start">
    ```bash
    # Check logs
    sudo journalctl -u xclaw -n 100

    # Verify permissions
    sudo ls -la /opt/xclaw

    # Test manual start
    sudo -i -u xclaw
    cd ~/xclaw
    xclaw gateway run
    ```

  </Accordion>
  <Accordion title="Docker sandbox issues">
    ```bash
    # Verify Docker is running
    sudo systemctl status docker

    # Check sandbox image
    sudo docker images | grep xclaw-sandbox

    # Build sandbox image if missing
    cd /opt/xclaw/xclaw
    sudo -u xclaw ./scripts/sandbox-setup.sh
    ```

  </Accordion>
  <Accordion title="Provider login fails">
    Make sure you are running as the `xclaw` user:
    ```bash
    sudo -i -u xclaw
    xclaw channels login
    ```
  </Accordion>
</AccordionGroup>

## Advanced Configuration

For detailed security architecture and troubleshooting, see the xclaw-ansible repo:

- [Security Architecture](https://github.com/xclaw/xclaw-ansible/blob/main/docs/security.md)
- [Technical Details](https://github.com/xclaw/xclaw-ansible/blob/main/docs/architecture.md)
- [Troubleshooting Guide](https://github.com/xclaw/xclaw-ansible/blob/main/docs/troubleshooting.md)

## Related

- [xclaw-ansible](https://github.com/xclaw/xclaw-ansible) -- full deployment guide
- [Docker](/install/docker) -- containerized gateway setup
- [Sandboxing](/gateway/sandboxing) -- agent sandbox configuration
- [Multi-Agent Sandbox and Tools](/tools/multi-agent-sandbox-tools) -- per-agent isolation
