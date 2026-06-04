#!/usr/bin/env python3
"""Generate the macOS app icon (.icns + iconset PNGs) for VPN.vu.

Why this exists (and why not build-logo-icons.sh):
  The upstream Mullvad build-logo-icons.sh builds the macOS .icns from the flat
  silhouette in graphics/icon.svg and the pre-rendered PNGs in graphics/macOS/.
  For VPN.vu we want the macOS icon to MATCH the Android adaptive icon — the
  teal->cyan volcano floating on the light vaporwave-grid background — not the
  flat logo. The single source of truth for that artwork is the Android icon
  layers (foreground volcano + grid background). This script reuses those exact
  layers, wraps them in an Apple-style squircle (superellipse) with the correct
  ~80% body padding and a subtle drop shadow, and emits every size macOS needs.

  build-logo-icons.sh also has ../../graphics paths that don't resolve in this
  monorepo layout (graphics/ lives at the repo root, not packages/graphics), so
  it can't regenerate the macOS icon here anyway. This script is the canonical
  way to refresh the macOS icon when the Android artwork changes.

Source artwork (Android xxxhdpi, 432px):
  android/lib/ui/resource/src/main/res/drawable-xxxhdpi/icon_android.png      (volcano fg)
  android/lib/ui/resource/src/main/res/drawable-xxxhdpi/icon_android_bg.png   (grid bg)

Outputs (paths relative to repo root):
  dist-assets/icon-macos.icns         <- consumed by electron-builder (mac.icon)
  graphics/macOS/icon-*.png           <- the iconutil iconset (kept in sync)

Run from anywhere:  python3 desktop/packages/mullvad-vpn/scripts/gen-macos-iconset.py
Requires: Pillow, numpy.
"""

from __future__ import annotations

import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# ---- locate repo root from this script's location -------------------------
# scripts/ -> mullvad-vpn -> packages -> desktop -> <repo root>
REPO = Path(__file__).resolve().parents[4]
ANDROID_RES = REPO / "android/lib/ui/resource/src/main/res/drawable-xxxhdpi"
FG_PATH = ANDROID_RES / "icon_android.png"
BG_PATH = ANDROID_RES / "icon_android_bg.png"
ICNS_OUT = REPO / "dist-assets/icon-macos.icns"
ICONSET_DIR = REPO / "graphics/macOS"

# ---- design constants -----------------------------------------------------
SS = 2                       # supersample factor for anti-aliasing
CANVAS = 1024                # master render size
BODY_FRAC = 0.804            # squircle body as fraction of canvas (Apple ~80%)
VOLCANO_FRAC = 0.60          # volcano width as fraction of the body
SQUIRCLE_N = 5.0             # superellipse exponent (Apple squircle ~5)
SHADOW_RGBA = (20, 40, 60)   # cool dark shadow tint
SHADOW_ALPHA = 70
SHADOW_BLUR = 12
SHADOW_DY = 8                # shadow vertical offset (in master px)

# macOS .icns members: OSType -> pixel size (PNG-encoded, retina-complete set)
ICNS_MEMBERS = [
    ("icp4", 16), ("icp5", 32), ("ic07", 128), ("ic08", 256),
    ("ic09", 512), ("ic10", 1024), ("ic11", 32), ("ic12", 64),
    ("ic13", 256), ("ic14", 512),
]
# graphics/macOS/ iconset filenames (for iconutil): name -> pixel size
ICONSET_FILES = {
    "icon-16.png": 16, "icon-16@2x.png": 32,
    "icon-32.png": 32, "icon-32@2x.png": 64,
    "icon-128.png": 128, "icon-128@2x.png": 256,
    "icon-256.png": 256, "icon-256@2x.png": 512,
    "icon-512.png": 512, "icon-512@2x.png": 1024,
}


def superellipse_mask(size: int, n: float) -> Image.Image:
    """Soft-edged squircle alpha mask (white inside, anti-aliased border)."""
    yy, xx = np.mgrid[0:size, 0:size].astype("float64")
    c = (size - 1) / 2.0
    d = (np.abs((xx - c) / c) ** n) + (np.abs((yy - c) / c) ** n)
    # Convert the implicit field into a ~1px soft edge at d==1.
    mask = np.clip((1.0 - d) * (size * 0.5) + 0.5, 0, 1)
    return Image.fromarray((mask * 255).astype("uint8"), "L")


def build_master() -> Image.Image:
    """Compose the full-resolution (CANVAS) macOS icon as RGBA."""
    fg = Image.open(FG_PATH).convert("RGBA")
    bg = Image.open(BG_PATH).convert("RGBA")

    s = CANVAS * SS
    body = int(CANVAS * BODY_FRAC) * SS
    off = (s - body) // 2

    squircle = superellipse_mask(body, SQUIRCLE_N)

    # Body = grid background (upscaled to cover) with the volcano composited on.
    body_img = Image.new("RGBA", (body, body), (0, 0, 0, 0))
    body_img.paste(bg.resize((body, body), Image.LANCZOS), (0, 0))

    vb = fg.split()[3].getbbox()                 # tight volcano bounds
    vw, vh = vb[2] - vb[0], vb[3] - vb[1]
    volcano = fg.crop(vb)
    tw = int(body * VOLCANO_FRAC)
    th = int(vh * (tw / vw))
    volcano = volcano.resize((tw, th), Image.LANCZOS)
    body_img.alpha_composite(volcano, ((body - tw) // 2, (body - th) // 2))

    # Clip the body to the squircle.
    clipped_alpha = Image.composite(
        body_img.split()[3], Image.new("L", (body, body), 0), squircle
    )
    body_img.putalpha(clipped_alpha)

    # Subtle drop shadow behind the squircle.
    canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    shadow_alpha = Image.composite(
        Image.new("L", (body, body), SHADOW_ALPHA),
        Image.new("L", (body, body), 0),
        squircle,
    )
    shadow_tile = Image.new("RGBA", (body, body), SHADOW_RGBA + (255,))
    shadow_tile.putalpha(shadow_alpha)
    shadow_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    shadow_layer.alpha_composite(shadow_tile, (off, off + SHADOW_DY * SS))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(SHADOW_BLUR * SS))

    canvas = Image.alpha_composite(canvas, shadow_layer)
    canvas.alpha_composite(body_img, (off, off))
    return canvas.resize((CANVAS, CANVAS), Image.LANCZOS)


def write_icns(master: Image.Image, out: Path) -> None:
    """Assemble a PNG-based .icns container (no iconutil needed)."""
    chunks = b""
    for ostype, size in ICNS_MEMBERS:
        import io

        buf = io.BytesIO()
        master.resize((size, size), Image.LANCZOS).save(buf, format="PNG")
        data = buf.getvalue()
        chunks += ostype.encode("ascii") + struct.pack(">I", len(data) + 8) + data
    body = b"icns" + struct.pack(">I", len(chunks) + 8) + chunks
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(body)


def write_iconset(master: Image.Image, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, size in ICONSET_FILES.items():
        master.resize((size, size), Image.LANCZOS).save(out_dir / name)


def main() -> None:
    for p in (FG_PATH, BG_PATH):
        if not p.exists():
            raise SystemExit(f"missing source artwork: {p}")
    master = build_master()
    # Reference master goes in graphics/ (NOT graphics/macOS/, which is the
    # iconset dir that build-logo-icons.sh globs file-by-file).
    master.save(REPO / "graphics/icon-macos-master.png")
    write_icns(master, ICNS_OUT)
    write_iconset(master, ICONSET_DIR)
    print(f"wrote {ICNS_OUT.relative_to(REPO)}")
    print(f"wrote {len(ICONSET_FILES)} iconset PNGs to {ICONSET_DIR.relative_to(REPO)}")


if __name__ == "__main__":
    main()
