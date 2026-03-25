# XClaw Claude Code Extras

Bu dizin XClaw ile birlikte gelen Claude Code entegrasyonunu içerir.
everything-claude-code projesinden derlenen + XClaw özgün skills/agents dahil.

## İçerik

| Dizin       | Sayı            | Açıklama                      |
| ----------- | --------------- | ----------------------------- |
| `skills/`   | 182             | Workflow tanımları (SKILL.md) |
| `agents/`   | 28              | Uzmanlaşmış subagent'lar      |
| `commands/` | 60              | Slash komutları               |
| `rules/`    | 12 dil + common | Kodlama kuralları             |

## Kurulum

install.sh içinde otomatik seçimle kurulur. Manuel kurulum:

```bash
# Tek skill
mkdir -p ~/.claude/skills/security-review
curl -fsSL https://raw.githubusercontent.com/amirtechai/xclaw/main/claude/skills/security-review/SKILL.md \
  -o ~/.claude/skills/security-review/SKILL.md

# Tüm extras (xclaw install.sh --claude-extras)
curl -fsSL https://xclaw.amirtech.ai/install.sh | bash -s -- --claude-extras
```

## Kaynaklar

- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [xclaw](https://github.com/amirtechai/xclaw)
