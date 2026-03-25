---
name: file-organizer
description: "Organize, search, rename, and manage files and directories. Use when: user wants to find files, bulk rename, sort by date/size/type, clean up directories, deduplicate, compress, or extract archives."
homepage: https://github.com/amirtech/xclaw
metadata: { "xclaw": { "emoji": "📁", "requires": { "bins": ["find", "ls", "mv", "cp"] } } }
---

# File Organizer Skill

Powerful file management and organization from chat.

## When to Use

✅ **USE this skill when:**

- "Find all PDF files in Downloads"
- "What are the largest files here?"
- "Rename all these files to include today's date"
- "Move all images to an Images folder"
- "Delete files older than 30 days"
- "Compress this directory"
- "Find duplicate files"

## Core Operations

### Find Files

```bash
# Find by extension
find /path -name "*.pdf" -type f

# Find by size (>100MB)
find /path -type f -size +100M

# Find by date (modified in last 7 days)
find /path -type f -mtime -7

# Find and list with details
find /path -name "*.log" -type f -exec ls -lh {} \;
```

### List & Sort

```bash
# Largest files first
du -sh * | sort -rh | head -20

# Most recently modified
ls -lt | head -20

# By extension count
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn
```

### Bulk Rename

```bash
# Add date prefix to all .jpg files
for f in *.jpg; do mv "$f" "$(date +%Y%m%d)_$f"; done

# Replace spaces with underscores
for f in *\ *; do mv "$f" "${f// /_}"; done

# Lowercase all filenames
for f in *; do mv "$f" "${f,,}" 2>/dev/null; done

# Sequential numbering
i=1; for f in *.jpg; do mv "$f" "photo_$(printf '%03d' $i).jpg"; ((i++)); done
```

### Move & Organize

```bash
# Move all images to Images/
mkdir -p Images && mv *.{jpg,jpeg,png,gif,webp} Images/ 2>/dev/null

# Organize by year-month
for f in *.jpg; do
  dir=$(date -r "$f" "+%Y-%m")
  mkdir -p "$dir" && mv "$f" "$dir/"
done
```

### Clean Up

```bash
# Delete files older than 30 days
find /path -type f -mtime +30 -delete

# Remove empty directories
find /path -type d -empty -delete

# Remove .DS_Store files (macOS)
find . -name ".DS_Store" -delete
```

### Archives

```bash
# Create tar.gz
tar -czf archive.tar.gz /path/to/dir/

# Extract tar.gz
tar -xzf archive.tar.gz

# Create zip
zip -r archive.zip /path/to/dir/

# Extract zip
unzip archive.zip -d /destination/
```

### Disk Usage

```bash
# Directory sizes
du -sh */ | sort -rh

# Full tree view
du -h --max-depth=2 | sort -rh | head -30
```

## Safety Rules

- NEVER delete files without showing what will be deleted first
- Always use `find ... -print` before `find ... -delete` to preview
- For bulk operations, show a dry-run summary first
- Keep trash/backup for deletions when possible
