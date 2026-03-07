"""
ClearPath AI — Obstruction Detection Pipeline
==============================================
This module orchestrates:
  1. OpenCV preprocessing   — resize, denoise, edge-enhance
  2. TensorFlow inference   — classify obstruction type
  3. Result formatting      — return structured detection output

To use with a real TensorFlow model:
  • Train a model on a labelled road obstruction dataset
  • Save as SavedModel format: model.save("model/clearpath_detector")
  • Uncomment the TensorFlow sections below

For the hackathon demo, a rule-based mock is used instead.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger("clearpath.ai")

# ── Class labels ──────────────────────────────────────────────────────────────
CLASS_LABELS = [
    "clear_road",
    "illegal_parking",
    "construction_barrier",
    "garbage_truck",
    "vendor_encroachment",
    "road_blockage",
]

# ── TensorFlow model (uncomment when model is available) ─────────────────────
# import tensorflow as tf
# MODEL_PATH = Path(__file__).parent / "clearpath_detector"
# _model = tf.saved_model.load(str(MODEL_PATH)) if MODEL_PATH.exists() else None


# ─────────────────────────────────────────────────────────────────────────────
def preprocess_image(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    Decode and preprocess an image for model inference.
    Steps:
      - Decode JPEG/PNG via OpenCV
      - Resize to 224x224 (MobileNet-compatible)
      - Convert BGR→RGB
      - Normalize to [0, 1]
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            logger.error("OpenCV: failed to decode image")
            return None

        # Resize
        img_resized = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)

        # Denoise (mild Gaussian blur)
        img_denoised = cv2.GaussianBlur(img_resized, (3, 3), 0)

        # Convert BGR → RGB
        img_rgb = cv2.cvtColor(img_denoised, cv2.COLOR_BGR2RGB)

        # Normalize
        img_normalized = img_rgb.astype(np.float32) / 255.0

        return img_normalized

    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        return None


def extract_features(img: np.ndarray) -> dict:
    """
    Extract heuristic image features for rule-based classification.
    In production, these are replaced by deep model embeddings.
    """
    # Convert to HSV for color analysis
    img_uint8 = (img * 255).astype(np.uint8)
    img_bgr = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    # Edge density (Canny)
    gray = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size

    # Color ratios
    orange_mask = cv2.inRange(hsv, np.array([10, 100, 100]), np.array([25, 255, 255]))
    yellow_mask = cv2.inRange(hsv, np.array([25, 100, 100]), np.array([40, 255, 255]))
    dark_mask   = cv2.inRange(hsv, np.array([0, 0, 0]),     np.array([180, 255, 80]))

    total_pixels = img.shape[0] * img.shape[1]
    return {
        "edge_density": float(edge_density),
        "orange_ratio": float(np.sum(orange_mask > 0) / total_pixels),
        "yellow_ratio": float(np.sum(yellow_mask > 0) / total_pixels),
        "dark_ratio":   float(np.sum(dark_mask > 0) / total_pixels),
    }


def rule_based_classify(features: dict) -> tuple[str, float]:
    """
    Heuristic classification based on extracted image features.
    Replace this with TF model inference for production.
    """
    e  = features["edge_density"]
    or_ = features["orange_ratio"]
    yr = features["yellow_ratio"]
    dr = features["dark_ratio"]

    if or_ > 0.10:
        return "construction_barrier", 0.87
    elif yr > 0.12:
        return "vendor_encroachment", 0.82
    elif dr > 0.50 and e > 0.15:
        return "garbage_truck", 0.80
    elif dr > 0.40:
        return "illegal_parking", 0.84
    elif e > 0.20:
        return "road_blockage", 0.78
    else:
        return "clear_road", 0.91


def run_inference(image_bytes: bytes) -> dict:
    """
    Full inference pipeline:
      preprocess → feature extraction → classify → return result
    """
    # Preprocess
    img = preprocess_image(image_bytes)
    if img is None:
        return {
            "success": False,
            "error": "Failed to process image",
            "detections": [],
        }

    # === Real TF inference (uncomment when model is ready) ===
    # if _model is not None:
    #     input_tensor = tf.expand_dims(img, axis=0)  # (1, 224, 224, 3)
    #     predictions = _model(input_tensor)
    #     probs = tf.nn.softmax(predictions[0]).numpy()
    #     class_idx = np.argmax(probs)
    #     label = CLASS_LABELS[class_idx]
    #     confidence = float(probs[class_idx])
    # else:
    #     # Fallback to rule-based
    #     features = extract_features(img)
    #     label, confidence = rule_based_classify(features)

    # Rule-based fallback (demo)
    features = extract_features(img)
    label, confidence = rule_based_classify(features)

    severity = "red" if confidence > 0.90 else "yellow" if confidence > 0.80 else "green"
    human_label = {
        "illegal_parking": "Illegal Parking",
        "construction_barrier": "Construction Barrier",
        "garbage_truck": "Garbage Truck Blockage",
        "vendor_encroachment": "Vendor Encroachment",
        "road_blockage": "Road Blockage",
        "clear_road": "Clear Road",
    }.get(label, label)

    return {
        "success": True,
        "label": label,
        "human_label": human_label,
        "confidence": round(confidence, 4),
        "severity": severity,
        "features": features,
        "model_version": "ClearPath-CV-v1 (OpenCV + rule-based / TF ready)",
    }
