"""Generates the VPN.vu tray icon set: vulcao silhouette on colored disc,
one per connection state. Replaces the Mullvad lock-N 10-frame animation
with 4 static images (the 4th is the pulse frame for the connecting state).

States and colors:
  disconnected     -> red    (#dc2626)
  connecting       -> orange (#ea580c)  bright frame
  connecting-pulse -> orange (#9a3412)  dim frame (alternates with above)
  connected        -> green  (#16a34a)

Outputs:
  win32/tray-<state>.ico              (multi-size 16,20,24,32,40,48,64)
  darwin/tray-<state>.png             (32x32)  +  tray-<state>@2x.png (64x64)
  linux/tray-<state>.png              (64x64)

Source: projects/thiago-moya/vpn.vu/logovulcao.png (white volcano cutout
inside a transparent disc).
"""

from pathlib import Path
import shutil
from PIL import Image

ROOT = Path(r"C:\Users\chris\Desktop\Claude-Psyco\psyco\projects\thiago-moya\vpnvu-desktop")
SRC_LOGO = Path(r"C:\Users\chris\Desktop\Claude-Psyco\psyco\projects\thiago-moya\vpn.vu\logovulcao.png")
OUT_DIR = ROOT / "desktop/packages/mullvad-vpn/assets/images/menubar-icons"
TMP = Path(__file__).parent / "tmp"
TMP.mkdir(parents=True, exist_ok=True)

STATES = {
    "disconnected":     (220, 38, 38),    # #dc2626
    "connecting":       (234, 88, 12),    # #ea580c
    "connecting-pulse": (154, 52, 18),    # #9a3412
    "connected":        (22, 163, 74),    # #16a34a
}

# Bigger sizes look better as renders; the .ico will hold multi-size.
WIN_SIZES = [16, 20, 24, 32, 40, 48, 64]
MAC_BASE = 32
MAC_RETINA = 64
LINUX_SIZE = 64


def load_white_silhouette() -> Image.Image:
    """Loads the logovulcao.png and paints the teal disc white, keeping the
    vulcao+rio as transparent cutouts. Result is a square white-on-transparent
    image ready to be tinted/composited onto a colored circle."""
    src = Image.open(SRC_LOGO).convert("RGBA")
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    sp = src.load()
    op = out.load()
    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = sp[x, y]
            if a > 0:
                # Pixel was opaque (the teal disc) -> paint white.
                # Vulcao+rio were already transparent (a==0) so they stay so.
                op[x, y] = (255, 255, 255, a)
    side = max(out.width, out.height)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(out, ((side - out.width) // 2, (side - out.height) // 2), out)
    return sq


def render_state(silhouette: Image.Image, color: tuple[int, int, int], size: int) -> Image.Image:
    """Renders the silhouette as a colored disc with vulcao cutout, at `size`x`size`.

    Strategy: take the alpha channel of the white silhouette (which IS the disc
    shape minus the vulcao cutouts), use it as a mask to paint the color onto
    a transparent canvas. The cutout regions stay transparent so the tray
    background shows through, keeping the vulcao silhouette readable.
    """
    sil_sized = silhouette.resize((size, size), Image.LANCZOS)
    alpha = sil_sized.split()[3]  # the mask
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    color_layer = Image.new("RGBA", (size, size), color + (255,))
    canvas.paste(color_layer, (0, 0), alpha)
    return canvas


def save_ico(silhouette: Image.Image, color: tuple[int, int, int], out_path: Path) -> None:
    """Multi-size ICO. Render at the biggest size, let Pillow downscale."""
    master = render_state(silhouette, color, max(WIN_SIZES))
    master.save(out_path, format="ICO", sizes=[(s, s) for s in WIN_SIZES])


def save_png(silhouette: Image.Image, color: tuple[int, int, int], size: int, out_path: Path) -> None:
    render_state(silhouette, color, size).save(out_path)


def main() -> None:
    print(f"Rendering tray icons from {SRC_LOGO.name}...")
    silhouette = load_white_silhouette()
    print(f"  master silhouette: {silhouette.size}")

    win = OUT_DIR / "win32"
    mac = OUT_DIR / "darwin"
    linux = OUT_DIR / "linux"
    for d in (win, mac, linux):
        d.mkdir(parents=True, exist_ok=True)

    # Backup any existing tray-* files (idempotent re-runs).
    backup = Path(__file__).parent / "backup-existing-tray"
    backup.mkdir(exist_ok=True)
    for d in (win, mac, linux):
        for f in d.glob("tray-*"):
            shutil.copy2(f, backup / f"{d.name}__{f.name}")

    for state, color in STATES.items():
        save_ico(silhouette, color, win / f"tray-{state}.ico")
        save_png(silhouette, color, MAC_BASE, mac / f"tray-{state}.png")
        save_png(silhouette, color, MAC_RETINA, mac / f"tray-{state}@2x.png")
        save_png(silhouette, color, LINUX_SIZE, linux / f"tray-{state}.png")
        print(f"  {state} ({color}): wrote 4 files")

    # Also write a 256x256 preview for Chris to eyeball.
    for state, color in STATES.items():
        render_state(silhouette, color, 256).save(TMP / f"preview-{state}.png")
    print(f"\nPreview PNGs (256x256) in {TMP}")


if __name__ == "__main__":
    main()
