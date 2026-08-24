from pathlib import Path
from PIL import Image

ASSET_DIR = Path("/home/ubuntu/webdev-static-assets")
SOURCES = [
    ASSET_DIR / "patisserie-nouvelle-selection-01-ar.png",
    ASSET_DIR / "patisserie-nouvelle-selection-02-ar.png",
    ASSET_DIR / "patisserie-nouvelle-selection-03-ar-v2.png",
]
OUTPUT = ASSET_DIR / "controle-visuel-rendus-arabes.png"

tile_width, tile_height, gutter = 720, 540, 28
canvas = Image.new("RGB", (tile_width, tile_height * len(SOURCES) + gutter * (len(SOURCES) - 1)), "#f6f1e8")

for index, source in enumerate(SOURCES):
    with Image.open(source).convert("RGB") as image:
        image.thumbnail((tile_width, tile_height), Image.Resampling.LANCZOS)
        x = (tile_width - image.width) // 2
        y = index * (tile_height + gutter) + (tile_height - image.height) // 2
        canvas.paste(image, (x, y))

canvas.save(OUTPUT, format="PNG", optimize=True)
print(OUTPUT)
