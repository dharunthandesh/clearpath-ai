"""
ClearPath AI — Sample Dataset Generator
========================================
Generates synthetic road obstruction images + annotations for demo/training.
Uses only Pillow (PIL) — no external dependencies beyond what's already installed.

Run:  python generate_dataset.py
"""

import os
import csv
import json
import random
from datetime import datetime, timedelta
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent
IMAGES_DIR      = BASE / "images"
ANNOTATIONS_DIR = BASE / "annotations"
TRAIN_DIR       = BASE / "images" / "train"
TEST_DIR        = BASE / "images" / "test"
THUMBS_DIR      = BASE / "images" / "thumbnails"

for d in [IMAGES_DIR, ANNOTATIONS_DIR, TRAIN_DIR, TEST_DIR, THUMBS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Config ──────────────────────────────────────────────────────────────────
IMG_SIZE   = (640, 480)
THUMB_SIZE = (160, 120)
NUM_TRAIN  = 40
NUM_TEST   = 10
SEED       = 42
random.seed(SEED)

# Obstruction classes + visual config
CLASSES = {
    "illegal_parking": {
        "label":    "Illegal Parking",
        "severity": "red",
        "road_color": (80, 80, 85),
        "obj_colors": [(0, 0, 180), (180, 0, 0), (0, 120, 0), (200, 180, 0)],
        "description": "Vehicle(s) parked illegally on road / emergency lane",
    },
    "construction": {
        "label":    "Construction Zone",
        "severity": "yellow",
        "road_color": (90, 88, 82),
        "obj_colors": [(220, 120, 20), (255, 165, 0), (200, 50, 50)],
        "description": "Construction materials, barriers, or machinery on road",
    },
    "vendor_encroachment": {
        "label":    "Vendor Encroachment",
        "severity": "yellow",
        "road_color": (85, 83, 78),
        "obj_colors": [(0, 150, 100), (200, 180, 80), (180, 80, 20)],
        "description": "Street vendors, stalls, or carts occupying road space",
    },
    "garbage_truck": {
        "label":    "Garbage Truck Blockage",
        "severity": "red",
        "road_color": (75, 75, 80),
        "obj_colors": [(30, 120, 30), (20, 100, 20)],
        "description": "Garbage collection truck blocking road during pickup",
    },
    "clear_road": {
        "label":    "Clear Road",
        "severity": "green",
        "road_color": (70, 70, 75),
        "obj_colors": [],
        "description": "Road is clear with no obstructions",
    },
}

STREET_NAMES = [
    "MG Road, Bangalore",
    "Residency Road, Bangalore",
    "Brigade Road, Bangalore",
    "Indiranagar 100ft Road",
    "Outer Ring Road, Bangalore",
    "Silk Board Junction",
    "Hebbal Flyover, Bangalore",
    "Koramangala 5th Block",
    "Jayanagar 4th Block",
    "BTM Layout 2nd Stage",
    "JP Nagar 3rd Phase",
    "Whitefield Main Road",
    "Old Airport Road",
    "Hosur Road, Bangalore",
    "ITPL Main Road, Whitefield",
]

REPORTERS = ["AI System", "Field Officer", "Citizen App", "CCTV Feed", "Traffic Dept"]


# ── Drawing helpers ──────────────────────────────────────────────────────────

def draw_road(draw, size, road_color, sky_color=(135, 180, 220)):
    w, h = size
    horizon = int(h * 0.45)

    # Sky gradient (simulate with bands)
    for y in range(horizon):
        t = y / horizon
        r = int(sky_color[0] * (1 - t * 0.3))
        g = int(sky_color[1] * (1 - t * 0.2))
        b = int(sky_color[2])
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Road surface
    road_pts = [(0, h), (int(w * 0.15), horizon), (int(w * 0.85), horizon), (w, h)]
    draw.polygon(road_pts, fill=road_color)

    # Lane markings
    for i in range(3, 10):
        y1 = horizon + int((h - horizon) * (i / 10))
        y2 = horizon + int((h - horizon) * ((i + 0.5) / 10))
        x_center = w // 2
        spread = int((y1 - horizon) * 0.8 + 5)
        draw.rectangle([x_center - 8, y1, x_center + 8, y2], fill=(240, 220, 0))

    # Road edges
    draw.line([(0, h), (int(w * 0.15), horizon)], fill=(255, 255, 255), width=3)
    draw.line([(w, h), (int(w * 0.85), horizon)], fill=(255, 255, 255), width=3)

    # Sidewalk
    draw.rectangle([0, 0, int(w * 0.13), h], fill=(160, 150, 140))
    draw.rectangle([int(w * 0.87), 0, w, h], fill=(160, 150, 140))

    # Buildings in background
    for bx in range(0, w, 60):
        bh = random.randint(30, 80)
        draw.rectangle([bx, horizon - bh, bx + 45, horizon],
                       fill=(random.randint(100, 160), random.randint(100, 150), random.randint(110, 160)))
        # Windows
        for wy in range(horizon - bh + 5, horizon - 5, 12):
            for wx2 in range(bx + 5, bx + 40, 14):
                wc = random.choice([(255, 240, 150), (200, 220, 255), (50, 50, 60)])
                draw.rectangle([wx2, wy, wx2 + 8, wy + 7], fill=wc)


def draw_car(draw, x, y, w, h, color, label=""):
    """Draw a simplified car silhouette."""
    # Body
    draw.rectangle([x, y + h // 3, x + w, y + h], fill=color)
    # Roof
    roof_pts = [
        (x + w // 5, y + h // 3),
        (x + w // 4, y),
        (x + 3 * w // 4, y),
        (x + 4 * w // 5, y + h // 3),
    ]
    draw.polygon(roof_pts, fill=tuple(max(0, c - 30) for c in color))
    # Wheels
    wheel_color = (20, 20, 20)
    for wx in [x + w // 5, x + 3 * w // 4]:
        draw.ellipse([wx - 8, y + h - 10, wx + 8, y + h + 6], fill=wheel_color)
        draw.ellipse([wx - 4, y + h - 6, wx + 4, y + h + 2], fill=(60, 60, 60))
    # Windshield
    draw.polygon([
        (x + w // 4 + 3, y + h // 3 - 1),
        (x + w // 4 + 8, y + 4),
        (x + 3 * w // 4 - 8, y + 4),
        (x + 3 * w // 4 - 3, y + h // 3 - 1),
    ], fill=(100, 180, 220))
    if label:
        draw.text((x + 4, y - 14), label, fill=(255, 50, 50))


def draw_construction_barrier(draw, x, y, w, h):
    """Orange-white striped barrier."""
    for i in range(6):
        color = (255, 120, 0) if i % 2 == 0 else (240, 240, 240)
        draw.rectangle([x + i * w // 6, y, x + (i + 1) * w // 6, y + h], fill=color)
    draw.rectangle([x, y, x + w, y + h], outline=(180, 90, 0), width=2)
    # Legs
    draw.line([(x + w // 4, y + h), (x + w // 4, y + h + 15)], fill=(100, 100, 100), width=3)
    draw.line([(x + 3 * w // 4, y + h), (x + 3 * w // 4, y + h + 15)], fill=(100, 100, 100), width=3)


def draw_vendor_stall(draw, x, y, w, h, color):
    """Simple canopy + table stall."""
    # Canopy
    draw.polygon([(x, y + 20), (x + w // 2, y), (x + w, y + 20)],
                 fill=color, outline=(80, 80, 80))
    # Frame
    draw.rectangle([x + 5, y + 20, x + w - 5, y + h], fill=(200, 180, 140))
    # Stripes on canopy
    for i in range(0, w, 14):
        draw.line([(x + i, y + 20), (x + w // 2, y)], fill=(255, 255, 255), width=1)
    # "Goods" on table
    for gx in range(x + 10, x + w - 10, 12):
        gc = (random.randint(150, 255), random.randint(50, 200), random.randint(0, 80))
        draw.ellipse([gx, y + h - 18, gx + 9, y + h - 8], fill=gc)


def draw_garbage_truck(draw, x, y, w, h):
    """Large garbage truck."""
    # Cabin
    draw.rectangle([x, y + h // 3, x + w // 3, y + h], fill=(30, 100, 30))
    # Container
    draw.rectangle([x + w // 3, y, x + w, y + h], fill=(50, 130, 50))
    # Container ribs
    for rx in range(x + w // 3, x + w, 20):
        draw.line([(rx, y), (rx, y + h)], fill=(30, 100, 30), width=2)
    # Wheels
    for wx2 in [x + w // 8, x + w // 2, x + 8 * w // 10]:
        draw.ellipse([wx2 - 10, y + h - 12, wx2 + 10, y + h + 6], fill=(20, 20, 20))
        draw.ellipse([wx2 - 5, y + h - 7, wx2 + 5, y + h + 1], fill=(60, 60, 60))
    # Windshield
    draw.polygon([
        (x + 5, y + h // 3),
        (x + 8, y + h // 3 + 5),
        (x + w // 3 - 5, y + h // 3 + 5),
        (x + w // 3 - 2, y + h // 3),
    ], fill=(80, 160, 200))
    # "BBMP" text
    draw.text((x + w // 3 + 5, y + h // 2), "BBMP", fill=(255, 255, 255))


def add_overlay(draw, w, h, label, severity, street, img_id):
    """Add info overlay to image."""
    sev_colors = {"red": (200, 40, 40), "yellow": (200, 160, 0), "green": (30, 160, 30)}
    sc = sev_colors.get(severity, (100, 100, 100))

    # Top banner
    draw.rectangle([0, 0, w, 28], fill=(0, 0, 0, 180))
    draw.text((8, 6), f"ClearPath AI  |  {label}", fill=(255, 255, 255))
    draw.text((w - 90, 6), f"ID: {img_id}", fill=(180, 180, 180))

    # Severity badge (bottom-left)
    draw.rectangle([8, h - 38, 160, h - 10], fill=sc)
    draw.text((16, h - 32), f"● {severity.upper()}: {label}", fill=(255, 255, 255))

    # Street (bottom-right)
    draw.rectangle([w - 220, h - 38, w - 8, h - 10], fill=(20, 20, 20, 200))
    draw.text((w - 212, h - 32), street[:28], fill=(200, 200, 200))


# ── Main image generator ──────────────────────────────────────────────────────

def generate_image(obs_class: str, img_id: str = "DEMO", size=IMG_SIZE):
    cfg = CLASSES[obs_class]
    w, h = size
    horizon = int(h * 0.45)

    img = Image.new("RGB", size, (135, 180, 220))
    draw = ImageDraw.Draw(img)

    street = random.choice(STREET_NAMES)
    draw_road(draw, size, cfg["road_color"])  # type: ignore

    boxes = []

    # ── Draw obstruction objects ─────────────────────────────────────────────
    if obs_class == "illegal_parking":
        n_cars = random.randint(1, 3)
        for i in range(n_cars):
            cw = random.randint(80, 120)
            ch = random.randint(45, 65)
            cx = random.randint(60, w - 180)
            cy = random.randint(horizon + 20, h - ch - 30)
            color = random.choice(cfg["obj_colors"])
            draw_car(draw, cx, cy, cw, ch, color)
            boxes.append({"x": cx, "y": cy, "w": cw, "h": ch, "class": obs_class})

    elif obs_class == "construction":
        n = random.randint(2, 5)
        for i in range(n):
            bw = random.randint(50, 90)
            bh = random.randint(25, 40)
            bx = 80 + i * (bw + 20) + random.randint(-10, 10)
            by = random.randint(horizon + 15, h - bh - 40)
            draw_construction_barrier(draw, bx, by, bw, bh)
            boxes.append({"x": bx, "y": by, "w": bw, "h": bh + 15, "class": obs_class})
        # Caution tape
        tape_y = random.randint(horizon + 60, h - 60)
        for tx in range(80, min(80 + n * 60, w - 100), 15):
            c = (255, 200, 0) if (tx // 15) % 2 == 0 else (0, 0, 0)
            draw.rectangle([tx, tape_y, tx + 14, tape_y + 6], fill=c)

    elif obs_class == "vendor_encroachment":
        n = random.randint(1, 3)
        for i in range(n):
            sw = random.randint(70, 110)
            sh = random.randint(50, 75)
            sx = 80 + i * (sw + 30) + random.randint(-10, 10)
            sy = random.randint(horizon + 10, h - sh - 30)
            color = random.choice(cfg["obj_colors"])
            draw_vendor_stall(draw, sx, sy, sw, sh, color)
            boxes.append({"x": sx, "y": sy, "w": sw, "h": sh, "class": obs_class})

    elif obs_class == "garbage_truck":
        tw = random.randint(160, 230)
        th = random.randint(80, 110)
        tx = random.randint(80, w - tw - 100)
        ty = random.randint(horizon + 15, h - th - 30)
        draw_garbage_truck(draw, tx, ty, tw, th)
        boxes.append({"x": tx, "y": ty, "w": tw, "h": th, "class": obs_class})

    elif obs_class == "clear_road":
        # Maybe a distant car
        if random.random() < 0.4:
            cx = random.randint(w // 3, 2 * w // 3)
            cy = horizon + 10
            cw, ch = 45, 28
            draw_car(draw, cx, cy, cw, ch, random.choice([(100, 100, 200), (200, 100, 100)]))

    # ── Noise / slight blur for realism ─────────────────────────────────────
    if obs_class != "clear_road":
        img = img.filter(ImageFilter.GaussianBlur(radius=0.4))
        draw = ImageDraw.Draw(img)

    add_overlay(draw, w, h, cfg["label"], cfg["severity"], street, img_id)

    return img, boxes, street


# ── Build dataset ────────────────────────────────────────────────────────────

def build_dataset():
    all_records  = []
    coco_images  = []
    coco_annots  = []
    annot_id     = 0
    class_keys   = list(CLASSES.keys())

    print("🏗  Generating ClearPath AI sample dataset...")
    total = NUM_TRAIN + NUM_TEST

    for idx in range(total):
        split      = "train" if idx < NUM_TRAIN else "test"
        obs_class  = class_keys[idx % len(class_keys)]
        img_id     = f"CP_{idx+1:04d}"
        filename   = f"{img_id}_{obs_class}.jpg"
        out_dir    = TRAIN_DIR if split == "train" else TEST_DIR
        out_path   = out_dir / filename
        thumb_path = THUMBS_DIR / filename

        img, boxes, street = generate_image(obs_class, img_id)

        # Save full image
        img.save(str(out_path), "JPEG", quality=90)

        # Save thumbnail
        thumb = img.copy()
        thumb.thumbnail(THUMB_SIZE, Image.LANCZOS)
        thumb.save(str(thumb_path), "JPEG", quality=80)

        # Generate metadata
        ts = datetime.now() - timedelta(hours=random.randint(0, 72),
                                         minutes=random.randint(0, 59))
        lat = 12.9716 + random.uniform(-0.08, 0.08)
        lng = 77.5946 + random.uniform(-0.08, 0.08)
        conf = round(random.uniform(0.74, 0.97), 3)

        record = {
            "id":               img_id,
            "filename":         filename,
            "split":            split,
            "obstruction_type": obs_class,
            "label":            CLASSES[obs_class]["label"],
            "severity":         CLASSES[obs_class]["severity"],
            "confidence":       conf,
            "latitude":         round(lat, 6),
            "longitude":        round(lng, 6),
            "street":           street,
            "description":      CLASSES[obs_class]["description"],
            "reporter":         random.choice(REPORTERS),
            "timestamp":        ts.strftime("%Y-%m-%dT%H:%M:%S"),
            "image_width":      640,
            "image_height":     480,
            "num_objects":      len(boxes),
            "image_path":       f"images/{split}/{filename}",
            "thumbnail_path":   f"images/thumbnails/{filename}",
        }
        all_records.append(record)

        # COCO-format annotation
        coco_images.append({
            "id": idx + 1,
            "file_name": filename,
            "width": 640,
            "height": 480,
            "split": split,
        })
        for box in boxes:
            coco_annots.append({
                "id":           annot_id + 1,
                "image_id":     idx + 1,
                "category_id":  class_keys.index(obs_class) + 1,
                "bbox":         [box["x"], box["y"], box["w"], box["h"]],
                "area":         box["w"] * box["h"],
                "iscrowd":      0,
            })
            annot_id += 1

        print(f"  [{idx+1:02d}/{total}] {split}/{filename}  →  {CLASSES[obs_class]['label']} ({CLASSES[obs_class]['severity']})")

    # ── Write CSV ─────────────────────────────────────────────────────────────
    csv_path = BASE / "dataset.csv"
    fieldnames = list(all_records[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_records)
    print(f"\n✅  CSV  → {csv_path}")

    # ── Write COCO JSON ───────────────────────────────────────────────────────
    coco = {
        "info": {
            "description": "ClearPath AI — Road Obstruction Dataset",
            "version": "1.0",
            "year": 2026,
            "contributor": "ClearPath AI Team",
            "date_created": datetime.now().isoformat(),
        },
        "categories": [
            {"id": i + 1, "name": k, "supercategory": "obstruction"}
            for i, k in enumerate(class_keys)
        ],
        "images":      coco_images,
        "annotations": coco_annots,
    }
    coco_path = ANNOTATIONS_DIR / "coco_annotations.json"
    with open(coco_path, "w") as f:
        json.dump(coco, f, indent=2)
    print(f"✅  COCO → {coco_path}")

    # ── Write class labels JSON ───────────────────────────────────────────────
    labels = {
        "classes": {k: {"id": i, **v} for i, (k, v) in enumerate(CLASSES.items())},
        "num_classes": len(CLASSES),
    }
    labels_path = ANNOTATIONS_DIR / "class_labels.json"
    with open(labels_path, "w") as f:
        json.dump(labels, f, indent=2)
    print(f"✅  Labels → {labels_path}")

    # ── Write split manifest ──────────────────────────────────────────────────
    manifest = {
        "train": [r["filename"] for r in all_records if r["split"] == "train"],
        "test":  [r["filename"] for r in all_records if r["split"] == "test"],
    }
    manifest_path = BASE / "split_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"✅  Manifest → {manifest_path}")

    # ── Summary stats ─────────────────────────────────────────────────────────
    print("\n📊  Dataset Summary:")
    print(f"   Total images  : {total}")
    print(f"   Train         : {NUM_TRAIN}")
    print(f"   Test          : {NUM_TEST}")
    print(f"   Total bboxes  : {annot_id}")
    print("\n   Class distribution:")
    for k in class_keys:
        cnt = sum(1 for r in all_records if r["obstruction_type"] == k)
        print(f"     {CLASSES[k]['label']:<30} {cnt} images")

    print(f"\n🎉  Dataset saved to: {BASE.resolve()}")


if __name__ == "__main__":
    build_dataset()
