---
name: translation
description: "Translate text between languages using free APIs. Use when: user wants to translate text, detect language, or translate a document. Supports 100+ languages. No API key needed."
homepage: https://libretranslate.com
metadata:
  {
    "xclaw":
      {
        "emoji": "🌐",
        "requires": { "bins": ["curl", "jq"] },
      },
  }
---

# Translation Skill

Translate text between 100+ languages using free, no-key APIs.

## When to Use

✅ **USE this skill when:**
- "Translate this to Spanish"
- "What does this mean in English?"
- "Translate the following Turkish text"
- "Detect what language this is"
- User pastes text in foreign language asking what it means

## Primary API: MyMemory (no key, 5000 chars/day free)

```bash
# Translate to English (auto-detect source)
curl -s "https://api.mymemory.translated.net/get?q=<TEXT>&langpair=auto|en" | jq -r '.responseData.translatedText'

# Translate with specific languages
curl -s "https://api.mymemory.translated.net/get?q=<TEXT>&langpair=tr|en" | jq -r '.responseData.translatedText'

# URL encode text first
TEXT=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "<TEXT>")
curl -s "https://api.mymemory.translated.net/get?q=${TEXT}&langpair=auto|en" | jq -r '.responseData.translatedText'
```

## Language Codes
| Language | Code |
|----------|------|
| Turkish | tr |
| English | en |
| German | de |
| French | fr |
| Spanish | es |
| Italian | it |
| Portuguese | pt |
| Russian | ru |
| Arabic | ar |
| Chinese (Simplified) | zh |
| Japanese | ja |
| Korean | ko |
| Dutch | nl |
| Polish | pl |

## Language Detection

```bash
curl -s "https://api.mymemory.translated.net/get?q=<TEXT>&langpair=auto|en" | jq -r '.responseData | "Detected: \(.match), Translation: \(.translatedText)"'
```

## Batch Translation (multiple sentences)

Process each line separately and combine:
```bash
while IFS= read -r line; do
  TEXT=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$line")
  curl -s "https://api.mymemory.translated.net/get?q=${TEXT}&langpair=auto|en" | jq -r '.responseData.translatedText'
done <<< "<MULTILINE_TEXT>"
```

## Response Format

- Show source language (detected or specified)
- Show translation clearly
- For long texts, translate paragraph by paragraph
- If translation quality seems low, note it
