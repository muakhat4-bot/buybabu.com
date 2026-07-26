import os
from PIL import Image, ImageDraw, ImageFont

def generate_whatsapp_dp_icon(size=1080, bg_color=(255, 255, 255, 255), dark_mode=False):
    """
    Generates a WhatsApp Business DP with the icon monogram centered within circular safe area.
    """
    scale = 4
    sw, sh = size * scale, size * scale
    img = Image.new("RGBA", (sw, sh), bg_color)
    draw = ImageDraw.Draw(img)
    
    royal_blue = (30, 64, 175, 255) # #1E40AF
    warm_gold = (245, 158, 11, 255) # #F59E0B
    
    # Circle safe area diameter is ~65-70% of total box size so it looks comfortable inside WhatsApp circle
    icon_dim = int(sw * 0.52)
    padding_x = int((sw - icon_dim) / 2)
    padding_y = int((sh - icon_dim) / 2)
    
    def scale_pt(x, y):
        cx = padding_x + (x / 32.0) * icon_dim
        cy = padding_y + (y / 32.0) * icon_dim
        return (cx, cy)

    # Left wing
    p1 = [scale_pt(6, 6), scale_pt(11.5, 6), scale_pt(16.5, 20), scale_pt(11, 20)]
    draw.polygon(p1, fill=(255, 255, 255, 255) if dark_mode else royal_blue)
    
    # Right wing
    p2 = [scale_pt(26, 6), scale_pt(20.5, 6), scale_pt(15.5, 20), scale_pt(21, 20)]
    draw.polygon(p2, fill=warm_gold)
    
    # Dot
    cx, cy = scale_pt(16, 25)
    r = (3.5 / 32.0) * icon_dim
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=warm_gold)
    
    return img.resize((size, size), Image.Resampling.LANCZOS)


def generate_whatsapp_dp_stacked(size=1080, bg_color=(255, 255, 255, 255), text_color=(17, 24, 39, 255)):
    """
    Generates a WhatsApp Business DP with stacked layout:
    Top: V Icon Emblem
    Bottom: VILLEX. Text
    Calculated to fit comfortably inside circular WhatsApp avatar crop.
    """
    scale = 4
    sw, sh = size * scale, size * scale
    img = Image.new("RGBA", (sw, sh), bg_color)
    draw = ImageDraw.Draw(img)
    
    royal_blue = (30, 64, 175, 255)
    warm_gold = (245, 158, 11, 255)
    
    # Total stacked height should fit within ~62% of sh to clear circular crop corners
    icon_dim = int(sh * 0.36)
    icon_x = int((sw - icon_dim) / 2)
    icon_y = int(sh * 0.18)
    
    def scale_pt(x, y):
        cx = icon_x + (x / 32.0) * icon_dim
        cy = icon_y + (y / 32.0) * icon_dim
        return (cx, cy)

    # Left wing
    p1 = [scale_pt(6, 6), scale_pt(11.5, 6), scale_pt(16.5, 20), scale_pt(11, 20)]
    draw.polygon(p1, fill=royal_blue if bg_color[0] > 100 else (255, 255, 255, 255))
    
    # Right wing
    p2 = [scale_pt(26, 6), scale_pt(20.5, 6), scale_pt(15.5, 20), scale_pt(21, 20)]
    draw.polygon(p2, fill=warm_gold)
    
    # Dot
    cx, cy = scale_pt(16, 25)
    r = (3.5 / 32.0) * icon_dim
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=warm_gold)
    
    # Text "VILLEX." centered below icon
    font_size = int(sh * 0.14)
    font = None
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\segoui.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\trebucbd.ttf"
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

    text_main = "VILLEX"
    bbox_main = draw.textbbox((0, 0), text_main, font=font)
    bbox_dot = draw.textbbox((0, 0), ".", font=font)
    
    total_text_w = (bbox_main[2] - bbox_main[0]) + (bbox_dot[2] - bbox_dot[0]) + 4 * scale
    text_x = int((sw - total_text_w) / 2)
    text_y = int(sh * 0.62)
    
    draw.text((text_x, text_y), text_main, fill=text_color, font=font)
    dot_x = text_x + (bbox_main[2] - bbox_main[0]) + 2 * scale
    draw.text((dot_x, text_y), ".", fill=warm_gold, font=font)
    
    return img.resize((size, size), Image.Resampling.LANCZOS)


def generate_whatsapp_dp_horizontal(size=1080, bg_color=(255, 255, 255, 255)):
    """
    Horizontal full logo centered in 1:1 box with circular safe area.
    """
    scale = 4
    sw, sh = size * scale, size * scale
    img = Image.new("RGBA", (sw, sh), bg_color)
    draw = ImageDraw.Draw(img)
    
    royal_blue = (30, 64, 175, 255)
    warm_gold = (245, 158, 11, 255)
    text_color = (17, 24, 39, 255)
    
    # Scale horizontal logo so max diagonal fits inside circle (R = sw*0.35)
    # Target logo width ~ 65% of sw
    logo_w = int(sw * 0.68)
    icon_dim = int(logo_w * 0.28)
    
    font_size = int(icon_dim * 0.85)
    font = None
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\segoui.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf"
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

    bbox_main = draw.textbbox((0, 0), "VILLEX", font=font)
    bbox_dot = draw.textbbox((0, 0), ".", font=font)
    text_w = (bbox_main[2] - bbox_main[0]) + (bbox_dot[2] - bbox_dot[0]) + 4 * scale
    
    total_w = icon_dim + int(sw * 0.04) + text_w
    start_x = int((sw - total_w) / 2)
    start_y = int((sh - icon_dim) / 2)
    
    icon_x = start_x
    icon_y = start_y
    
    def scale_pt(x, y):
        cx = icon_x + (x / 32.0) * icon_dim
        cy = icon_y + (y / 32.0) * icon_dim
        return (cx, cy)

    p1 = [scale_pt(6, 6), scale_pt(11.5, 6), scale_pt(16.5, 20), scale_pt(11, 20)]
    draw.polygon(p1, fill=royal_blue)
    
    p2 = [scale_pt(26, 6), scale_pt(20.5, 6), scale_pt(15.5, 20), scale_pt(21, 20)]
    draw.polygon(p2, fill=warm_gold)
    
    cx, cy = scale_pt(16, 25)
    r = (3.5 / 32.0) * icon_dim
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=warm_gold)
    
    text_x = start_x + icon_dim + int(sw * 0.04)
    text_y = start_y + int((icon_dim - (bbox_main[3] - bbox_main[1])) / 2) - 4 * scale
    
    draw.text((text_x, text_y), "VILLEX", fill=text_color, font=font)
    dot_x = text_x + (bbox_main[2] - bbox_main[0]) + 2 * scale
    draw.text((dot_x, text_y), ".", fill=warm_gold, font=font)
    
    return img.resize((size, size), Image.Resampling.LANCZOS)


if __name__ == "__main__":
    brain_dir = r"C:\Users\Admin\.gemini\antigravity\brain\2815f89b-cbc6-4ef1-91b3-e6485c46f354"
    public_dir = r"d:\Master Project\Villex\public"
    app_public_dir = r"d:\Master Project\Villex\apps\customer-marketplace\public"
    
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(app_public_dir, exist_ok=True)
    os.makedirs(brain_dir, exist_ok=True)
    
    # 1. WhatsApp DP - Stacked White BG (Recommended for WhatsApp Business)
    dp_stacked_white = generate_whatsapp_dp_stacked(1080, (255, 255, 255, 255), (17, 24, 39, 255))
    dp_stacked_white.save(os.path.join(brain_dir, "villex_whatsapp_dp_stacked.png"))
    dp_stacked_white.save(os.path.join(public_dir, "villex_whatsapp_dp_stacked.png"))
    dp_stacked_white.save(os.path.join(app_public_dir, "villex_whatsapp_dp_stacked.png"))

    # 2. WhatsApp DP - Stacked Dark Royal Navy BG (#0F172A)
    dp_stacked_dark = generate_whatsapp_dp_stacked(1080, (15, 23, 42, 255), (255, 255, 255, 255))
    dp_stacked_dark.save(os.path.join(brain_dir, "villex_whatsapp_dp_dark.png"))
    dp_stacked_dark.save(os.path.join(public_dir, "villex_whatsapp_dp_dark.png"))

    # 3. WhatsApp DP - Stacked Royal Blue BG (#1E40AF)
    dp_stacked_blue = generate_whatsapp_dp_stacked(1080, (30, 64, 175, 255), (255, 255, 255, 255))
    dp_stacked_blue.save(os.path.join(brain_dir, "villex_whatsapp_dp_blue.png"))
    dp_stacked_blue.save(os.path.join(public_dir, "villex_whatsapp_dp_blue.png"))

    # 4. WhatsApp DP - Minimal Monogram Icon (White BG)
    dp_icon_white = generate_whatsapp_dp_icon(1080, (255, 255, 255, 255), dark_mode=False)
    dp_icon_white.save(os.path.join(brain_dir, "villex_whatsapp_dp_icon.png"))
    dp_icon_white.save(os.path.join(public_dir, "villex_whatsapp_dp_icon.png"))

    # 5. WhatsApp DP - Minimal Monogram Icon (Dark Slate BG)
    dp_icon_dark = generate_whatsapp_dp_icon(1080, (15, 23, 42, 255), dark_mode=True)
    dp_icon_dark.save(os.path.join(brain_dir, "villex_whatsapp_dp_icon_dark.png"))
    dp_icon_dark.save(os.path.join(public_dir, "villex_whatsapp_dp_icon_dark.png"))

    # 6. WhatsApp DP - Horizontal Full Logo (White BG)
    dp_horizontal = generate_whatsapp_dp_horizontal(1080, (255, 255, 255, 255))
    dp_horizontal.save(os.path.join(brain_dir, "villex_whatsapp_dp_horizontal.png"))
    dp_horizontal.save(os.path.join(public_dir, "villex_whatsapp_dp_horizontal.png"))

    print("Successfully generated all WhatsApp Business PNG logos!")
