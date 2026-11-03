#!/usr/bin/env python3
"""Pack the deck into ONE self-contained HTML file for classrooms without internet.

    python3 make_offline.py deck/index.html deck/test.mp3 OUT.html

Inlines the Google Fonts (latin, latin-ext, vietnamese subsets) and the audio as data
URIs and adds the <!doctype>/<head> skeleton the artifact host normally supplies.
Needs network access to fonts.googleapis.com once, while building.
"""
import base64, os, re, sys, urllib.request

src_path, audio_path, out = sys.argv[1:4]
src = open(src_path).read()
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}

m = re.search(r'<link rel="stylesheet" href="(https://fonts.googleapis.com/css2\?[^"]+)">', src)
if m:
    css = urllib.request.urlopen(urllib.request.Request(m.group(1).replace('&amp;', '&'), headers=UA)).read().decode()
    keep, cache = [], {}
    for subset, block in re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, flags=re.S):
        if subset not in ('latin', 'latin-ext', 'vietnamese'):
            continue
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        if url not in cache:
            cache[url] = 'data:font/woff2;base64,' + base64.b64encode(urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()).decode()
        keep.append(block.replace(url, cache[url]))
    src = src.replace(m.group(0), '<style>\n' + '\n'.join(keep) + '\n</style>')
    src = src.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', '')

name = os.path.basename(audio_path)
assert f'src="{name}"' in src, f'audio src="{name}" not found in the page'
mime = 'audio/mpeg' if name.endswith('.mp3') else 'audio/mp4'
src = src.replace(f'src="{name}"', f'src="data:{mime};base64,' + base64.b64encode(open(audio_path, 'rb').read()).decode() + '"')

title = re.search(r'<title>.*?</title>', src).group(0)
src = src.replace(title, '', 1)
page = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + title + '\n<style>[hidden]{display:none!important}body{margin:0}</style>\n</head>\n<body>\n' + src + '\n</body>\n</html>\n')
open(out, 'w').write(page)
left = re.findall(r'(?:src|href)="https?://[^"]+"', page)
print(f'{out}: {os.path.getsize(out) / 1e6:.1f} MB; external references left: {left or "none"}')
