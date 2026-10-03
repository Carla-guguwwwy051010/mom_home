"""Copy the self-contained preview and make a source archive for delivery."""

from pathlib import Path
from shutil import copy2
from zipfile import ZipFile, ZIP_DEFLATED
import os


root = Path(__file__).resolve().parent
outputs = root.parent.parent / "outputs"
outputs.mkdir(parents=True, exist_ok=True)
preview = root / "dist" / "mom-home-complete.html"
copy2(preview, outputs / preview.name)

files = [
    "app-complete.js", "cards.js", "character.js", "garden.js", "world.js", "tea.js",
    "motion.js", "state.js", "page.html", "theme.css", "package.json",
    "package-lock.json", "build.mjs", "package.py", "test.mjs",
    "test-flow.mjs", "test-all.mjs", "README.md",
    "dist/mom-home-complete.html",
    *(f"assets/embedded-card-{i}.jpg" for i in range(1, 5)),
]
destination = outputs / "mom-home-source.zip"
staging = outputs / "mom-home-source.tmp.zip"
with ZipFile(staging, "w", ZIP_DEFLATED, compresslevel=7) as archive:
    for rel in files:
        archive.write(root / rel, f"mom-home/{rel}")
    archive.write(root / "node_modules/three/LICENSE", "mom-home/LICENSE-three.txt")
with ZipFile(staging) as archive:
    error = archive.testzip()
    if error:
        raise RuntimeError(f"Corrupt archive entry: {error}")
os.replace(staging, destination)
print(f"Delivered: {outputs / preview.name} and {destination}")
