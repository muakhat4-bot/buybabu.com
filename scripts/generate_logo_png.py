import os
import math
from PIL import Image, ImageDraw, ImageFont

def draw_villex_logo(width=1200, height=400, bg_color=None, dark_mode=False):
    # Create high-res canvas (4x supersampling for ultra smooth anti-aliased rendering)
    scale = 4
    sw, sh = width * scale, height * scale
    
    if bg_color is None:
        img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    else:
        img = Image.new("RGBA", (sw, sh), bg_color)
        
    draw = ImageDraw.Draw(img)
    
    # Colors
    royal_blue = (30, 64, 175, 255) # #1E40AF
    warm_gold = (245, 158, 11, 255) # #F59E0B
    text_color = (255, 255, 255, 255) if dark_mode else (17, 24, 39, 255) # #111827 or white
    
    # Calculate dimensions
    # ViewBox is 0 0 32 32 for icon.
    # Icon size in scaled canvas
    icon_dim = int(sh * 0.55)
    icon_x = int(sw * 0.1)
    icon_y = int((sh - icon_dim) / 2)
    
    def scale_pt(x, y):
        # Maps (0..32) in icon ViewBox to canvas coordinates
        cx = icon_x + (x / 32.0) * icon_dim
        cy = icon_y + (y / 32.0) * icon_dim
        return (cx, cy)

    # Path 1: Left wing - M6 6h5.5l5 14h-5.5l-5-14z
    p1 = [scale_pt(6, 6), scale_pt(11.5, 6), scale_pt(16.5, 20), scale_pt(11, 20)]
    draw.polygon(p1, fill=royal_blue)
    
    # Path 2: Right wing - M26 6h-5.5l-5 14h5.5l5-14z
    p2 = [scale_pt(26, 6), scale_pt(20.5, 6), scale_pt(15.5, 20), scale_pt(21, 20)]
    draw.polygon(p2, fill=warm_gold)
    
    # Path 3: Circle - cx=16, cy=25, r=3.5
    cx, cy = scale_pt(16, 25)
    r = (3.5 / 32.0) * icon_dim
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=warm_gold)
    
    # Text "VILLEX."
    text_x = icon_x + icon_dim + int(sw * 0.05)
    text_y = int(sh * 0.28)
    
    font_size = int(sh * 0.38)
    font = None
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\segoui.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\trebucbd.ttf",
        "C:\\Windows\\Fonts\\impact.ttf"
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, font_size)
                break
            except Exception:
                pass
    if font is None:
        font = ImageFont.load_default()

    # Draw "VILLEX"
    draw.text((text_x, text_y), "VILLEX", fill=text_color, font=font)
    
    # Measure width of "VILLEX" to append "." in Warm Gold
    bbox = draw.textbbox((text_x, text_y), "VILLEX", font=font)
    dot_x = bbox[2] + 2 * scale
    draw.text((dot_x, text_y), ".", fill=warm_gold, font=font)
    
    # Downsample using LANCZOS for high anti-aliasing
    final_img = img.resize((width, height), Image.Resampling.LANCZOS)
    return final_img

def draw_villex_icon_only(size=512, bg_color=None):
    scale = 4
    sw, sh = size * scale, size * scale
    
    if bg_color is None:
        img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    else:
        img = Image.new("RGBA", (sw, sh), bg_color)
        
    draw = ImageDraw.Draw(img)
    
    royal_blue = (30, 64, 175, 255)
    warm_gold = (245, 158, 11, 255)
    
    padding = int(sw * 0.15)
    icon_dim = sw - 2 * padding
    
    def scale_pt(x, y):
        cx = padding + (x / 32.0) * icon_dim
        cy = padding + (y / 32.0) * icon_dim
        return (cx, cy)

    p1 = [scale_pt(6, 6), scale_pt(11.5, 6), scale_pt(16.5, 20), scale_pt(11, 20)]
    draw.polygon(p1, fill=royal_blue)
    
    p2 = [scale_pt(26, 6), scale_pt(20.5, 6), scale_pt(15.5, 20), scale_pt(21, 20)]
    draw.polygon(p2, fill=warm_gold)
    
    cx, cy = scale_pt(16, 25)
    r = (3.5 / 32.0) * icon_dim
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=warm_gold)
    
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

if __name__ == "__main__":
    brain_dir = r"C:\Users\Admin\.gemini\antigravity\brain\2815f89b-cbc6-4ef1-91b3-e6485c46f354"
    app_public_dir = r"d:\Master Project\Villex\apps\customer-marketplace\public"
    root_public_dir = r"d:\Master Project\Villex\public"
    
    os.makedirs(root_public_dir, exist_ok=True)
    os.makedirs(app_public_dir, exist_ok=True)
    os.makedirs(brain_dir, exist_ok=True)
    
    # 1. Full logo transparent
    logo_trans = draw_villex_logo(width=1200, height=400, bg_color=None, dark_mode=False)
    logo_trans.save(os.path.join(brain_dir, "villex_logo_transparent.png"))
    logo_trans.save(os.path.join(root_public_dir, "villex_logo_transparent.png"))
    logo_trans.save(os.path.join(app_public_dir, "villex_logo_transparent.png"))

    # 2. Full logo light background
    logo_light = draw_villex_logo(width=1200, height=400, bg_color=(250, 251, 252, 255), dark_mode=False)
    logo_light.save(os.path.join(brain_dir, "villex_logo_light.png"))
    logo_light.save(os.path.join(root_public_dir, "villex_logo_light.png"))
    logo_light.save(os.path.join(app_public_dir, "villex_logo_light.png"))
    
    # 3. Full logo dark background
    logo_dark = draw_villex_logo(width=1200, height=400, bg_color=(15, 23, 42, 255), dark_mode=True)
    logo_dark.save(os.path.join(brain_dir, "villex_logo_dark.png"))
    logo_dark.save(os.path.join(root_public_dir, "villex_logo_dark.png"))
    logo_dark.save(os.path.join(app_public_dir, "villex_logo_dark.png"))

    # 4. Icon only transparent
    icon_trans = draw_villex_icon_only(size=512, bg_color=None)
    icon_trans.save(os.path.join(brain_dir, "villex_icon.png"))
    icon_trans.save(os.path.join(root_public_dir, "villex_icon.png"))
    icon_trans.save(os.path.join(app_public_dir, "villex_icon.png"))

    # 5. Icon only dark badge
    icon_dark = draw_villex_icon_only(size=512, bg_color=(15, 23, 42, 255))
    icon_dark.save(os.path.join(brain_dir, "villex_icon_dark.png"))
    icon_dark.save(os.path.join(root_public_dir, "villex_icon_dark.png"))
    
    print("Successfully generated all Villex PNG logos!")
