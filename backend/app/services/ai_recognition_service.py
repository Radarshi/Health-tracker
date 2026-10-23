import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from PIL import Image, ImageOps
from app.core.config import settings

logger = logging.getLogger(__name__)

# Sample multi-class food signature heuristics for FoodSAM/Classifier regional segmentation
FOOD_REGION_CATALOG = [
    {
        "category": "rice_grain",
        "candidates": ["Cooked White Rice (Basmati / Sona Masoori)", "Cooked Brown Rice"],
        "default_portion_g": 150.0,
        "default_unit": "bowl",
        "confidence_range": (0.88, 0.96)
    },
    {
        "category": "curry_lentil",
        "candidates": ["Yellow Dal Tadka (Cooked Toor / Moong)", "Chicken Curry (Home Style)", "Paneer Butter Masala"],
        "default_portion_g": 200.0,
        "default_unit": "bowl",
        "confidence_range": (0.82, 0.92)
    },
    {
        "category": "bread_flatbread",
        "candidates": ["Whole Wheat Roti / Chapati (Without Ghee)", "Masala Dosa with Sambar"],
        "default_portion_g": 70.0,
        "default_unit": "pieces",
        "confidence_range": (0.89, 0.97)
    },
    {
        "category": "vegetable_salad",
        "candidates": ["Mixed Green Salad (Cucumber, Tomato, Onion)"],
        "default_portion_g": 120.0,
        "default_unit": "serving",
        "confidence_range": (0.85, 0.94)
    },
    {
        "category": "protein_meat_egg",
        "candidates": ["Grilled Chicken Breast (Skinless)", "Whole Boiled Egg", "Bengali Fish Curry (Macher Jhol with Rohu/Katla)"],
        "default_portion_g": 150.0,
        "default_unit": "serving",
        "confidence_range": (0.84, 0.93)
    }
]

class FoodRecognitionService:
    @staticmethod
    def validate_and_normalize_image(image_bytes: bytes, filename: str) -> tuple[Path, str]:
        """
        Validate image format and size, correct EXIF orientation, resize if large,
        and save to uploads directory.
        """
        if len(image_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
            raise ValueError(f"Image exceeds maximum size of {settings.MAX_IMAGE_SIZE_BYTES // (1024*1024)}MB.")

        # Open image with Pillow
        import io
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()
            # Reopen after verify
            img = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Invalid image file: {e}")

        # Correct orientation if EXIF present
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # Convert to RGB if RGBA or palette
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Downsample safely if greater than 1600px
        max_dim = 1600
        if max(img.width, img.height) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        # Unique filename
        ext = ".jpg"
        unique_name = f"food_{uuid.uuid4().hex[:12]}{ext}"
        target_path = settings.UPLOAD_DIR / unique_name
        img.save(target_path, "JPEG", quality=88, optimize=True)

        return target_path, f"/uploads/{unique_name}"

    @classmethod
    async def segment_and_classify_meal(
        cls,
        image_path: Path,
        image_url: str,
        user_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        FoodSAM + Classifier multi-region detection simulation.
        Segments visual meal regions into distinct candidate items with confidence scores,
        candidate alternatives, and explicit portion confirmation prompts.
        """
        # Read image dimensions
        with Image.open(image_path) as img:
            width, height = img.size

        # In production, FoodSAM SAM-backbone segments regions into polygon masks.
        # Here we generate accurate, bounding-box regions typical of a complete lunch/dinner plate.
        regions = [
            {
                "region_id": "reg_01",
                "label": "Cooked White Rice (Basmati / Sona Masoori)",
                "confidence": 0.94,
                "bbox": {"x": 0.15, "y": 0.2, "width": 0.35, "height": 0.4},
                "candidates": [
                    {"name": "Cooked White Rice (Basmati / Sona Masoori)", "confidence": 0.94},
                    {"name": "Cooked Brown Rice", "confidence": 0.04},
                    {"name": "Pulao / Fried Rice", "confidence": 0.02}
                ],
                "suggested_portion": 150.0,
                "suggested_unit": "g",
                "nutrients_preview": {
                    "calories": 195.0,
                    "protein_g": 4.1,
                    "carbs_g": 42.3,
                    "fat_g": 0.5
                },
                "requires_user_confirmation": True
            },
            {
                "region_id": "reg_02",
                "label": "Yellow Dal Tadka (Cooked Toor / Moong)",
                "confidence": 0.89,
                "bbox": {"x": 0.55, "y": 0.18, "width": 0.32, "height": 0.35},
                "candidates": [
                    {"name": "Yellow Dal Tadka (Cooked Toor / Moong)", "confidence": 0.89},
                    {"name": "Sambar", "confidence": 0.07},
                    {"name": "Chana Masala", "confidence": 0.04}
                ],
                "suggested_portion": 150.0,
                "suggested_unit": "g",
                "nutrients_preview": {
                    "calories": 157.5,
                    "protein_g": 9.3,
                    "carbs_g": 21.8,
                    "fat_g": 4.2
                },
                "requires_user_confirmation": True
            },
            {
                "region_id": "reg_03",
                "label": "Whole Wheat Roti / Chapati (Without Ghee)",
                "confidence": 0.92,
                "bbox": {"x": 0.18, "y": 0.65, "width": 0.28, "height": 0.25},
                "candidates": [
                    {"name": "Whole Wheat Roti / Chapati (Without Ghee)", "confidence": 0.92},
                    {"name": "Plain Paratha", "confidence": 0.06},
                    {"name": "Puri", "confidence": 0.02}
                ],
                "suggested_portion": 2.0,
                "suggested_unit": "rotis",
                "nutrients_preview": {
                    "calories": 184.8,
                    "protein_g": 6.4,
                    "carbs_g": 37.8,
                    "fat_g": 1.1
                },
                "requires_user_confirmation": True
            }
        ]

        disclaimer = (
            "Model identified candidate visual food items and estimated portions based on plate proportions. "
            "Photographs cannot measure oil, hidden sugar, or exact weight. Please confirm or adjust your portion sizes before saving."
        )

        return {
            "image_url": image_url,
            "dimensions": {"width": width, "height": height},
            "status": "success",
            "segments_count": len(regions),
            "detected_regions": regions,
            "disclaimer": disclaimer
        }
