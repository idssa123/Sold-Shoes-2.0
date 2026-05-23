#!/usr/bin/env python3
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {"node_modules", ".git", "dist", "build"}
EXTS = {'.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.mjs', '.cjs'}

def should_process(path: Path):
    if any(part in SKIP_DIRS for part in path.parts):
        return False
    if path.suffix.lower() in EXTS:
        return True
    # handle config files like tailwind.config.js, vite.config.js, postcss.config.js
    if path.name.endswith('.config.js') or path.name.endswith('.config.cjs'):
        return True
    return False

def remove_comments(text: str) -> str:
    # Remove JSX comments {/* ... */}
    text = re.sub(r"{\s*/\*[\s\S]*?\*/\s*}", '', text)
    # Remove block comments /* ... */
    text = re.sub(r"/\*[\s\S]*?\*/", '', text)
    # Remove HTML comments <!-- ... -->
    text = re.sub(r"<!--[\s\S]*?-->", '', text)
    # Remove // comments but avoid URLs like http:// or https://
    text = re.sub(r"(?<!:)//.*", '', text)
    # Strip trailing whitespace on each line
    lines = [line.rstrip() for line in text.splitlines()]
    return "\n".join(lines) + ("\n" if text.endswith('\n') else '')

def main():
    modified = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # prune skip dirs
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            fpath = Path(dirpath) / fname
            if not should_process(fpath):
                continue
            try:
                text = fpath.read_text(encoding='utf-8')
            except Exception:
                continue
            new = remove_comments(text)
            if new != text:
                fpath.write_text(new, encoding='utf-8')
                modified.append(str(fpath.relative_to(ROOT)))
    if modified:
        print('Modified files:')
        for m in modified:
            print(m)
    else:
        print('No comments removed; no files changed.')

if __name__ == '__main__':
    main()
