# ClearPath AI — Sample Dataset

Synthetic road obstruction dataset generated for training, testing, and demo purposes.

## Structure

```
dataset/
├── generate_dataset.py       ← Generator script (re-run to regenerate)
├── dataset.csv               ← Full metadata CSV (50 rows)
├── split_manifest.json       ← Train/test file lists
│
├── images/
│   ├── train/                ← 40 training images (640×480 JPEG)
│   ├── test/                 ← 10 test images (640×480 JPEG)
│   └── thumbnails/           ← 50 thumbnails (160×120 JPEG)
│
└── annotations/
    ├── coco_annotations.json ← COCO-format bounding box annotations
    └── class_labels.json     ← Class definitions + severity mapping
```

## Classes

| ID | Class Key              | Label                   | Severity |
|----|------------------------|-------------------------|----------|
| 0  | `illegal_parking`      | Illegal Parking         | 🔴 Red    |
| 1  | `construction`         | Construction Zone       | 🟡 Yellow |
| 2  | `vendor_encroachment`  | Vendor Encroachment     | 🟡 Yellow |
| 3  | `garbage_truck`        | Garbage Truck Blockage  | 🔴 Red    |
| 4  | `clear_road`           | Clear Road              | 🟢 Green  |

## Dataset Stats

- **Total images:** 50 (640 × 480 px)
- **Train / Test split:** 40 / 10
- **Bounding boxes:** ~90 total across all images
- **Format:** COCO JSON + CSV

## CSV Columns

| Column             | Description                              |
|--------------------|------------------------------------------|
| `id`               | Unique image ID (e.g. `CP_0001`)         |
| `filename`         | Image filename                           |
| `split`            | `train` or `test`                        |
| `obstruction_type` | Class key                                |
| `label`            | Human-readable label                     |
| `severity`         | `red`, `yellow`, or `green`              |
| `confidence`       | Simulated AI detection confidence (0–1)  |
| `latitude`         | GPS latitude (Bangalore area)            |
| `longitude`        | GPS longitude (Bangalore area)           |
| `street`           | Street name                              |
| `description`      | Obstruction description                  |
| `reporter`         | Who reported it                          |
| `timestamp`        | ISO 8601 timestamp                       |
| `image_width`      | 640                                      |
| `image_height`     | 480                                      |
| `num_objects`      | Number of detected objects in image      |
| `image_path`       | Relative path to full image              |
| `thumbnail_path`   | Relative path to thumbnail               |

## How to Regenerate

```bash
cd dataset/
python generate_dataset.py
```

> Requires: `Pillow` (`pip install pillow`)

## Usage with FastAPI Backend

The backend's `/detect-obstruction` endpoint simulates the AI inference pipeline
that would use these images for training. To integrate:

1. Use `dataset.csv` to seed the PostgreSQL `obstructions` table
2. Use `coco_annotations.json` to train a TensorFlow/YOLO object detection model
3. Use `class_labels.json` for model output interpretation
