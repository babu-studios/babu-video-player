"""Generates build/icon.icns (matches the in-app logo). macOS only."""
import math, os, struct, subprocess, zlib

N = 1024

M = 100                       # transparent margin, as macOS icons expect
S = N - 2 * M                 # visible square size
R = S * 18 / 72               # corner radius, same ratio as renderer/components/Logo.tsx
TRI = [(28, 21), (28, 51), (53, 36)]  # play triangle in the logo's 72x72 space

def in_triangle(u, v):
    def side(a, b):
        return (u - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (v - b[1])
    d = [side(TRI[0], TRI[1]), side(TRI[1], TRI[2]), side(TRI[2], TRI[0])]
    return all(x >= 0 for x in d) or all(x <= 0 for x in d)

def sample(x, y):
    lx, ly = x - M, y - M
    cx = min(max(lx, R), S - R)
    cy = min(max(ly, R), S - R)
    if not (0 <= lx <= S and 0 <= ly <= S) or math.hypot(lx - cx, ly - cy) > R:
        return (0, 0, 0, 0)
    if in_triangle(lx / S * 72, ly / S * 72):
        return (255, 255, 255, 255)
    t = (lx + ly) / (2 * S)   # diagonal gradient #8aa4ff -> #5a4bff
    return (int(138 - 48 * t), int(164 - 89 * t), 255, 255)

def px(x, y):
    # 2x2 supersampling for smooth edges
    pts = [sample(x + dx, y + dy) for dx in (0.25, 0.75) for dy in (0.25, 0.75)]
    a = sum(p[3] for p in pts)
    if a == 0:
        return (0, 0, 0, 0)
    return tuple(sum(p[i] * p[3] for p in pts) // a for i in range(3)) + (a // 4,)

rows = []
for y in range(N):
    row = bytearray([0])
    for x in range(N):
        row += bytes(px(x, y))
    rows.append(bytes(row))
raw = b"".join(rows)

def chunk(t, d):
    c = struct.pack(">I", len(d)) + t + d
    return c + struct.pack(">I", zlib.crc32(t + d))

png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", N, N, 8, 6, 0, 0, 0)) \
    + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
os.makedirs("build/icon.iconset", exist_ok=True)
open("build/icon.png", "wb").write(png)
for s in (16, 32, 64, 128, 256, 512, 1024):
    for scale in (1, 2):
        size = s * scale
        if size > 1024 or (scale == 2 and s == 1024):
            continue
        name = f"icon_{s}x{s}{'@2x' if scale == 2 else ''}.png"
        subprocess.run(["sips", "-z", str(size), str(size), "build/icon.png", "--out", f"build/icon.iconset/{name}"], check=True, capture_output=True)
subprocess.run(["iconutil", "-c", "icns", "build/icon.iconset", "-o", "build/icon.icns"], check=True)
subprocess.run(["rm", "-rf", "build/icon.iconset"])
