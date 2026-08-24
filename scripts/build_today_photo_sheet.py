from pathlib import Path
from PIL import Image

ASSET_DIR = Path("/home/ubuntu/webdev-static-assets/publications-du-jour")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/selection-photos-du-jour.png")

columns, tile_width, tile_height, gutter = 2, 640, 480, 20
sources = [ASSET_DIR / f"post-{index:02d}.jpeg" for index in range(1, 11)]
rows = (len(sources) + columns - 1) // columns
canvas = Image.new(
    "RGB",
    (columns * tile_width + (columns - 1) * gutter, rows * tile_height + (rows - 1) * gutter),
    "#f6f1e8",
)

for index, source in enumerate(sources):
    with Image.open(source).convert("RGB") as image:
        image.thumbnail((tile_width, tile_height), Image.Resampling.LANCZOS)
        column, row = index % columns, index // columns
        x = column * (tile_width + gutter) + (tile_width - image.width) // 2
        y = row * (tile_height + gutter) + (tile_height - image.height) // 2
        canvas.paste(image, (x, y))

canvas.save(OUTPUT, format="PNG", optimize=True)
print(OUTPUT)
