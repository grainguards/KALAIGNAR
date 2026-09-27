import sys
import os
import io
import base64
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

def process_background_removal(input_b64: str, preset: str = "transparent") -> str:
    # 1. Decode base64 image
    if "," in input_b64:
        input_b64 = input_b64.split(",")[1]
    raw_bytes = base64.b64decode(input_b64)
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    
    # Resize high-res images to max 1200px to maintain speed and precision
    max_dim = 1200
    w, h = img.size
    if w > max_dim or h > max_dim:
        scale = max_dim / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    
    # 2. Perform deep learning background removal via rembg (U2-Net)
    cutout = None
    try:
        from rembg import remove, new_session
        session = new_session("u2netp")
        cutout = remove(img, session=session)
    except Exception as e:
        try:
            from rembg import remove
            cutout = remove(img)
        except Exception as e2:
            sys.stderr.write(f"rembg error: {e2}\n")
            cutout = fallback_segmentation(img)
            
    # 3. Apply requested studio backdrop preset
    result_img = apply_preset(cutout, preset)
    
    # 4. Output as base64 data URL
    out_buf = io.BytesIO()
    if preset == "transparent":
        result_img.save(out_buf, format="PNG")
        mime = "image/png"
    else:
        result_img.convert("RGB").save(out_buf, format="JPEG", quality=95)
        mime = "image/jpeg"
        
    encoded = base64.b64encode(out_buf.getvalue()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"

def fallback_segmentation(img: Image.Image) -> Image.Image:
    # Reliable geometric & color separation fallback
    rgba = np.array(img)
    rgb = rgba[:, :, :3]
    h, w, _ = rgb.shape
    
    border = np.concatenate([
        rgb[0:4, :, :].reshape(-1, 3),
        rgb[h-4:h, :, :].reshape(-1, 3),
        rgb[:, 0:4, :].reshape(-1, 3),
        rgb[:, w-4:w, :].reshape(-1, 3)
    ], axis=0)
    
    bg_mean = np.mean(border, axis=0)
    dist = np.linalg.norm(rgb - bg_mean, axis=2)
    
    fg_threshold = 32.0
    fg_mask = (dist > fg_threshold).astype(np.uint8) * 255
    
    mask_img = Image.fromarray(fg_mask, mode="L")
    mask_img = mask_img.filter(ImageFilter.MaxFilter(7))
    mask_img = mask_img.filter(ImageFilter.MinFilter(5))
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(1.5))
    
    rgba[:, :, 3] = np.array(mask_img)
    return Image.fromarray(rgba)

def apply_preset(cutout: Image.Image, preset: str) -> Image.Image:
    if preset == "transparent":
        return cutout
    
    bg_color = (255, 255, 255)
    if preset == "artisan-warmth":
        bg_color = (253, 251, 247)
    elif preset == "studio-gray":
        bg_color = (244, 244, 245)
    
    bg = Image.new("RGBA", cutout.size, (*bg_color, 255))
    
    # Grounded contact shadow
    bbox = cutout.getbbox()
    if bbox:
        min_x, min_y, max_x, max_y = bbox
        shadow_w = int((max_x - min_x) * 0.72)
        shadow_h = max(10, int((cutout.height - max_y) * 0.40 + 16))
        shadow = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow)
        draw.ellipse([0, 0, shadow_w, shadow_h], fill=(0, 0, 0, 48))
        shadow = shadow.filter(ImageFilter.GaussianBlur(7))
        
        shadow_x = int((min_x + max_x) / 2 - shadow_w / 2)
        shadow_y = min(cutout.height - shadow_h - 2, max_y - int(shadow_h * 0.35))
        bg.alpha_composite(shadow, (shadow_x, shadow_y))
        
    bg.alpha_composite(cutout)
    return bg

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "Empty input"}))
            sys.exit(1)
            
        data = json.loads(raw_input)
        img_b64 = data.get("imageBase64", "")
        preset = data.get("preset", "transparent")
        
        if not img_b64:
            print(json.dumps({"error": "No imageBase64 provided"}))
            sys.exit(1)
            
        enhanced = process_background_removal(img_b64, preset)
        print(json.dumps({"success": True, "enhancedUrl": enhanced}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
