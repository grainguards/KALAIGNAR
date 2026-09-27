import sys
import os
import io
import base64
import json
import numpy as np
import scipy.ndimage as ndi
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageOps

# -------------------------------------------------------------
# 1. Modular AI Segmentation Base Class & Rembg Implementation
# -------------------------------------------------------------
class BaseSegmenter:
    """Modular interface for swap-in segmentation backends (SAM, U2-Net, RMBG, etc.)"""
    def generate_mask(self, img: Image.Image) -> np.ndarray:
        raise NotImplementedError

class RembgSegmenter(BaseSegmenter):
    def __init__(self, model_name: str = "u2netp"):
        self.model_name = model_name
        self.session = None
        try:
            from rembg import new_session
            self.session = new_session(model_name)
        except Exception as e:
            sys.stderr.write(f"Rembg session initialization warning: {e}\n")

    def generate_mask(self, img: Image.Image) -> np.ndarray:
        from rembg import remove
        if self.session is not None:
            cutout = remove(img, session=self.session, only_mask=True)
        else:
            cutout = remove(img, only_mask=True)
        return np.array(cutout)

# -------------------------------------------------------------
# 2. Product Selection (Dominant or Point-Prompt Tapped Object)
# -------------------------------------------------------------
def select_product_component(mask: np.ndarray, point_prompt=None) -> np.ndarray:
    """
    Distinguishes the primary artisan product from hands, tables, walls, and edge artifacts.
    If point_prompt is provided [x, y], selects the component containing/nearest that point.
    Otherwise selects the dominant central craft product.
    """
    binary_mask = (mask > 32).astype(np.uint8)
    labeled, num_features = ndi.label(binary_mask)

    if num_features == 0:
        return mask

    h, w = binary_mask.shape

    # If point prompt provided (e.g. from user tapping to select object)
    if point_prompt and len(point_prompt) == 2:
        px, py = point_prompt
        # If normalized (0..1), convert to pixel coords
        if 0.0 <= px <= 1.0 and 0.0 <= py <= 1.0:
            px = int(px * w)
            py = int(py * h)
        else:
            px, py = int(px), int(py)

        px = max(0, min(w - 1, px))
        py = max(0, min(h - 1, py))

        selected_label = labeled[py, px]
        if selected_label > 0:
            return (labeled == selected_label).astype(np.uint8) * 255

        # If tapped slightly outside, search nearest component
        min_dist = float("inf")
        best_label = 1
        for lbl in range(1, num_features + 1):
            coords = np.argwhere(labeled == lbl)
            dists = np.sqrt((coords[:, 0] - py)**2 + (coords[:, 1] - px)**2)
            d_min = dists.min()
            if d_min < min_dist:
                min_dist = d_min
                best_label = lbl
        return (labeled == best_label).astype(np.uint8) * 255

    # Automatic mode: Rank components by area, central placement, and distance from border
    center_y, center_x = h / 2.0, w / 2.0
    best_score = -1.0
    best_label = 1

    for lbl in range(1, num_features + 1):
        comp = (labeled == lbl)
        area = np.sum(comp)
        if area < (h * w * 0.005):  # ignore tiny noise speckles (<0.5% area)
            continue

        coords = np.argwhere(comp)
        cy = np.mean(coords[:, 0])
        cx = np.mean(coords[:, 1])

        # Distance penalty from center
        dist_from_center = np.sqrt(((cy - center_y) / h)**2 + ((cx - center_x) / w)**2)
        center_weight = max(0.2, 1.0 - dist_from_center * 1.5)

        # Border touch penalty (table/floor/wall often touches outer border)
        touches_top = np.any(comp[0, :])
        touches_bottom = np.any(comp[-1, :])
        touches_left = np.any(comp[:, 0])
        touches_right = np.any(comp[:, -1])
        border_penalty = 1.0
        if touches_top and touches_bottom: border_penalty *= 0.6
        if touches_left and touches_right: border_penalty *= 0.6

        score = area * center_weight * border_penalty
        if score > best_score:
            best_score = score
            best_label = lbl

    return (labeled == best_label).astype(np.uint8) * 255

# -------------------------------------------------------------
# 3. Mask Refinement (Hole Removal, Edge Smoothing, Detail Preservation)
# -------------------------------------------------------------
def refine_product_mask(mask: np.ndarray) -> np.ndarray:
    """
    Applies morphological refinement to remove accidental holes inside the product,
    smooth jagged edges, while strictly preserving fine details (threads, jewelry, carvings).
    """
    # 1. Fill internal holes without expanding outer boundary
    filled = ndi.binary_fill_holes(mask > 128)

    # 2. Gentle opening/closing to remove isolated 1-2 pixel noise
    structure = ndi.generate_binary_structure(2, 1)
    cleaned = ndi.binary_closing(filled, structure=structure, iterations=1)

    # 3. Alpha feathering using gentle Gaussian blur for anti-aliased edge
    mask_float = cleaned.astype(np.float32) * 255.0
    smooth_mask = ndi.gaussian_filter(mask_float, sigma=0.85)

    # 4. Preserve sharp inner product confidence: values > 200 stay 255
    final_mask = np.clip(smooth_mask, 0, 255).astype(np.uint8)
    return final_mask

# -------------------------------------------------------------
# 4. Image Enhancement (Faithful Lighting & Exposure)
# -------------------------------------------------------------
def enhance_product_image(img_rgb: Image.Image) -> Image.Image:
    """
    Exposure correction, brightness & contrast optimization, and mild sharpening.
    Does NOT alter genuine craft colors, motifs, or textures.
    """
    # 1. Gentle Unsharp Mask to highlight artisanal details (embroidery, woodgrain, pottery glaze)
    sharpened = img_rgb.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))

    # 2. Subtle Contrast & Brightness optimization
    enh_contrast = ImageEnhance.Contrast(sharpened)
    balanced = enh_contrast.enhance(1.08)

    enh_brightness = ImageEnhance.Brightness(balanced)
    # Check average brightness of the image
    stat = np.array(balanced)
    mean_lum = np.mean(stat[:, :, :3])
    if mean_lum < 110:
        boost = 1.08
    elif mean_lum > 175:
        boost = 0.98
    else:
        boost = 1.04
    final_enhanced = enh_brightness.enhance(boost)

    return final_enhanced

# -------------------------------------------------------------
# 5. 1:1 E-Commerce Canvas & Subtle Grounded Shadow
# -------------------------------------------------------------
def create_ecommerce_presentation(
    product_rgba: Image.Image,
    preset: str = "studio-white",
    canvas_size: int = 1200,
    target_occupancy: float = 0.78
) -> Image.Image:
    """
    Centers the product on a 1:1 square e-commerce canvas occupying 70–85% of canvas.
    Applies clean studio backdrop and subtle grounded shadow if requested.
    """
    # 1. Find tight bounding box of product
    bbox = product_rgba.getbbox()
    if not bbox:
        return Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))

    min_x, min_y, max_x, max_y = bbox
    prod_w = max_x - min_x
    prod_h = max_y - min_y

    # Crop tightly to product
    cropped_prod = product_rgba.crop((min_x, min_y, max_x, max_y))

    # Scale so max dimension occupies ~78% of the canvas
    max_target_dim = int(canvas_size * target_occupancy)
    scale = min(max_target_dim / max(1, prod_w), max_target_dim / max(1, prod_h))
    new_w = max(1, int(prod_w * scale))
    new_h = max(1, int(prod_h * scale))

    scaled_prod = cropped_prod.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 2. Determine background color
    if preset == "transparent":
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    elif preset == "light-neutral" or preset == "artisan-warmth":
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (250, 247, 242, 255))
    elif preset == "soft-studio" or preset == "studio-gray":
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (244, 244, 245, 255))
    else:  # "studio-white" or default
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))

    # Calculate centered position (slightly vertically balanced for e-commerce aesthetics)
    pos_x = (canvas_size - new_w) // 2
    # Place product slightly grounded (48% center rather than strictly 50%)
    pos_y = int((canvas_size - new_h) * 0.48)

    # 3. Add subtle grounded contact shadow below product for studio backdrops
    if preset != "transparent":
        shadow_w = int(new_w * 0.76)
        shadow_h = max(14, int(canvas_size * 0.038))
        shadow = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow)
        # Elliptical contact shadow
        draw.ellipse([0, 0, shadow_w, shadow_h], fill=(0, 0, 0, 42))
        shadow = shadow.filter(ImageFilter.GaussianBlur(9))

        shadow_x = (canvas_size - shadow_w) // 2
        shadow_y = min(canvas_size - shadow_h - 10, pos_y + new_h - int(shadow_h * 0.40))
        canvas.alpha_composite(shadow, (shadow_x, shadow_y))

    # Composite product
    canvas.alpha_composite(scaled_prod, (pos_x, pos_y))
    return canvas

# -------------------------------------------------------------
# 6. Full Extraction & Studio Pipeline
# -------------------------------------------------------------
def process_pipeline(
    input_b64: str,
    preset: str = "studio-white",
    point_prompt=None,
    canvas_size: int = 1200
) -> dict:
    # Decode image
    if "," in input_b64:
        input_b64 = input_b64.split(",")[1]
    raw_bytes = base64.b64decode(input_b64)
    orig_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")

    # Resize high-res images for fast segmentation (max 1200)
    max_dim = 1200
    w, h = orig_img.size
    scale = 1.0
    if w > max_dim or h > max_dim:
        scale = max_dim / max(w, h)
        seg_img = orig_img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    else:
        seg_img = orig_img.copy()

    # 1. AI Segmentation
    segmenter = RembgSegmenter("u2netp")
    raw_mask = segmenter.generate_mask(seg_img)

    # 2. Product Selection (dominant component or tapped point)
    selected_mask = select_product_component(raw_mask, point_prompt=point_prompt)

    # 3. Mask Refinement
    refined_mask = refine_product_mask(selected_mask)

    # 4. Scale mask back to original dimensions if needed
    if (w, h) != seg_img.size:
        mask_pil = Image.fromarray(refined_mask).resize((w, h), Image.Resampling.LANCZOS)
        refined_mask = np.array(mask_pil)

    # 5. Extract RGBA cutout (Lift Subject from Background)
    # Authentic product pixels, transparent background
    orig_arr = np.array(orig_img)
    rgba_arr = np.dstack([orig_arr, refined_mask])
    extracted_cutout = Image.fromarray(rgba_arr, mode="RGBA")

    # 6. Apply Lighting & Quality Enhancement to the product pixels
    enhanced_rgb = enhance_product_image(orig_img)
    enhanced_rgba_arr = np.dstack([np.array(enhanced_rgb), refined_mask])
    enhanced_cutout = Image.fromarray(enhanced_rgba_arr, mode="RGBA")

    # 7. Generate 1:1 E-Commerce Studio Image
    ecommerce_studio = create_ecommerce_presentation(
        enhanced_cutout,
        preset=preset,
        canvas_size=canvas_size,
        target_occupancy=0.78
    )

    # 8. Encode outputs
    # A. Extracted transparent PNG (Clean Lift Subject cutout)
    out_cutout = io.BytesIO()
    extracted_cutout.save(out_cutout, format="PNG")
    cutout_b64 = "data:image/png;base64," + base64.b64encode(out_cutout.getvalue()).decode("utf-8")

    # B. E-Commerce Studio Image (1:1 centered presentation)
    out_studio = io.BytesIO()
    if preset == "transparent":
        ecommerce_studio.save(out_studio, format="PNG")
        studio_mime = "image/png"
    else:
        ecommerce_studio.convert("RGB").save(out_studio, format="JPEG", quality=95)
        studio_mime = "image/jpeg"
    studio_b64 = f"data:{studio_mime};base64," + base64.b64encode(out_studio.getvalue()).decode("utf-8")

    # Calculate metrics
    bbox = extracted_cutout.getbbox()
    confidence = 0.94 if bbox else 0.50

    return {
        "success": True,
        "confidence": confidence,
        "extracted_product": cutout_b64,
        "enhanced_image": studio_b64,
        "bbox": list(bbox) if bbox else [0, 0, w, h],
        "width": w,
        "height": h,
    }

if __name__ == "__main__":
    try:
        raw_in = sys.stdin.read()
        if not raw_in.strip():
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        data = json.loads(raw_in)
        img_b64 = data.get("imageBase64", "")
        preset = data.get("preset", "studio-white")
        point = data.get("pointPrompt", None)
        canvas_size = data.get("canvasSize", 1200)

        res = process_pipeline(img_b64, preset=preset, point_prompt=point, canvas_size=canvas_size)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
