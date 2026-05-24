#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import os, sys, tempfile, datetime
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from io import BytesIO

import pandas as pd
from PyPDF2 import PdfReader

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit



def resource_base_dir() -> Path:
    # PyInstaller onefile จะแตกไฟล์ไว้ที่ sys._MEIPASS ชั่วคราว
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)
    # ตอนรันเป็น .py ปกติ
    if "__file__" in globals():
        return Path(__file__).resolve().parent
    # fallback
    return Path.cwd()

ASSET_ROOT = resource_base_dir() / "assets"


# ------------------ Paths ------------------
def get_desktop_dir() -> Path:
    home = Path.home()
    desktop = home / "Desktop"
    if desktop.exists():
        return desktop
    onedrive_desktop = home / "OneDrive" / "Desktop"
    if onedrive_desktop.exists():
        return onedrive_desktop
    return home

def get_bktax_folder() -> Path:
    folder = get_desktop_dir() / "BKTAX"
    folder.mkdir(parents=True, exist_ok=True)
    return folder

def get_history_folder() -> Path:
    folder = get_bktax_folder() / "01.history"
    folder.mkdir(parents=True, exist_ok=True)
    return folder

def get_pdf_folder() -> Path:
    folder = get_bktax_folder() / "02.pdf"
    folder.mkdir(parents=True, exist_ok=True)
    return folder

def get_assets_folder() -> Path:
    folder = get_bktax_folder() / "assets"
    folder.mkdir(parents=True, exist_ok=True)
    return folder

def get_master_xlsx_path() -> Path:
    return ASSET_ROOT / "00.BK_Sell_Master_Data.xlsx"




# ------------------ Master Data ------------------
def load_master_data():
    """
    Return:
      sales_list: [{"sale_name":..., "tel":...}]
      products_list: [{"code":..., "name":..., "price_thb":...}]
    """
    path = get_master_xlsx_path()
    if not path.exists():
        return None, None, f"Not found: {path}"

    try:
        df_sales = pd.read_excel(path, sheet_name="Sales")
        df_prod = pd.read_excel(path, sheet_name="Products")

        df_sales.columns = [c.strip().lower() for c in df_sales.columns]
        df_prod.columns = [c.strip().lower() for c in df_prod.columns]

        sales_list = []
        for _, r in df_sales.iterrows():
            sale_name = str(r.get("sale_name", "")).strip()
            tel = str(r.get("tel", "")).strip()
            if sale_name:
                sales_list.append({"sale_name": sale_name, "tel": tel})

        products_list = []
        for _, r in df_prod.iterrows():
            code = str(r.get("code", "")).strip()
            name = str(r.get("name", "")).strip()
            price = r.get("price_thb", 0)
            try:
                price = float(price)
            except Exception:
                price = 0.0
            if code and name:
                products_list.append({"code": code, "name": name, "price_thb": price})

        return sales_list, products_list, None
    except Exception as e:
        return None, None, str(e)


# ------------------ Thai Fonts ------------------
# ------------------ Thai Fonts (SAFE for .py + Jupyter) ------------------
def _get_base_dir() -> Path:
    # 1) normal python script
    if "__file__" in globals():
        return Path(__file__).resolve().parent
    # 2) packaged exe (PyInstaller)
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)
    # 3) Jupyter / interactive
    return Path.cwd()

BASE_DIR = _get_base_dir()
FONT_DIR = ASSET_ROOT / "fonts"


TH_REG  = FONT_DIR / "THSarabunNew.ttf"
TH_BOLD = FONT_DIR / "THSarabunNew-Bold.ttf"


if not TH_REG.exists() or not TH_BOLD.exists():
    msg = (
        "Missing Thai font files:\n"
        f"- {TH_REG}\n"
        f"- {TH_BOLD}\n\n"
        "กรุณาวางไฟล์ฟอนต์ใน:\n"
        f"{FONT_DIR}"
    )
    messagebox.showerror("BKTAX - Missing Assets", msg)
    raise SystemExit(0)


pdfmetrics.registerFont(TTFont("TH", str(TH_REG)))
pdfmetrics.registerFont(TTFont("TH-Bold", str(TH_BOLD)))




# =========================
# CONFIG
# =========================
COMPANY = {
    "name": "บริษัท บลู๊ค ลิฟวิ่ง จำกัด (สำนักงานใหญ่)",
    "address": "เลขที่ 3/134 ตำบลบางสมัคร อำเภอบางปะกง จังหวัดฉะเชิงเทรา 24180",
    "tax_id": "0245568003791",
    "phone": "093-736-4796",
    "email": "info@blookliving.com",
    "logo_path": str(ASSET_ROOT / "BK_logo.png"),
    "sign_name": "Mr. Wongsatorn Somtana",
}

DOC_TYPES = [
    ("QUOTATION", "ใบเสนอราคา (Quotation)"),
    ("BILLING", "ใบวางบิล/ใบแจ้งหนี้ (Billing Note/Invoice)"),
    ("RECEIPT", "ใบเสร็จรับเงิน (Receipt)"),
    ("TAX_RECEIPT", "ใบกำกับภาษี/ใบเสร็จรับเงิน (Tax Invoice/Receipt)"),
]

DOC_TITLE_TH_EN = {
    "QUOTATION":   ("ใบเสนอราคา", "Quotation"),
    "BILLING":     ("ใบวางบิล/ใบแจ้งหนี้", "Billing Note / Invoice"),
    "RECEIPT":     ("ใบเสร็จรับเงิน", "Receipt"),
    "TAX_RECEIPT": ("ใบกำกับภาษี/ใบเสร็จรับเงิน", "Tax Invoice / Receipt"),
}


DOC_SHORT = {
    "QUOTATION": "QOU",
    "BILLING": "BIL",
    "RECEIPT": "REC",
    "TAX_RECEIPT": "INV",
}


VAT_MODES = [
    ("COMPANY", "รวม VAT ในราคา (ลูกค้าจ่ายเท่าเดิม)"),
    ("CUSTOMER", "บวก VAT เพิ่มจากราคา"),
    ("NOVAT", "No VAT"),
]

WHT_MODES = [
    ("NOWHT", "ไม่หักภาษี ณ ที่จ่าย"),
    ("WITHHOLD", "ลูกค้าหัก WHT นำส่งให้"),
    ("GROSSUP", "ลูกค้ารับภาระ WHT"),
]


FRAME_PATH = str(ASSET_ROOT / "frame.png")
KBANK_ICON_PATH = str(ASSET_ROOT / "KASI_logo.png")



KBANK_TOKEN = "{KBANK}"  # token สำหรับแสดงรูปใน PDF

NOTE_TEMPLATES = {
    "QUOTATION": (
        "1. ชำระผ่านบัญชี\n"
        f"ธนาคาร : กสิกรไทย {KBANK_TOKEN}\n"
        "เลขบัญชี : 213-8-93674-3\n"
        "ชื่อบัญชี : บจก. บลู๊ค ลิฟวิ่ง\n"
        "2. ราคาในใบเสนอนี้ สำหรับชำระภายใน 15 วัน\n"
        "3. สินค้าจะได้รับภายใน 3-5 วัน หลังจากลูกค้าชำระเงิน\n"
        "4. บริษัทหวังอย่างยิ่ง ที่จะได้ส่งมอบสินค้าที่ดี มีคุณภาพให้แก่ท่าน\n"
    ),
    "BILLING": (
        "1. ชำระผ่านบัญชี\n"
        f"ธนาคาร : กสิกรไทย {KBANK_TOKEN}\n"
        "เลขบัญชี : 213-8-93674-3\n"
        "ชื่อบัญชี : บจก. บลู๊ค ลิฟวิ่ง\n"
    ),
    # Receipt + Tax Receipt
    "RECEIPT": (
        "1. สินค้าจะได้รับภายใน 3-5 วัน หลังจากลูกค้าชำระเงิน\n"
    ),
    "TAX_RECEIPT": (
        "1. สินค้าจะได้รับภายใน 3-5 วัน หลังจากลูกค้าชำระเงิน\n"
    ),
}

def get_default_note_by_doc_type(doc_type_code: str) -> str:
    return NOTE_TEMPLATES.get(doc_type_code, "")






DOC_LABEL_BY_CODE = {k: v for k, v in DOC_TYPES}
DOC_CODE_BY_LABEL = {v: k for k, v in DOC_TYPES}
VAT_LABEL_BY_CODE = {k: v for k, v in VAT_MODES}
VAT_CODE_BY_LABEL = {v: k for k, v in VAT_MODES}
WHT_LABEL_BY_CODE = {k: v for k, v in WHT_MODES}
WHT_CODE_BY_LABEL = {v: k for k, v in WHT_MODES}

DEFAULT_DOC_TYPE = "TAX_RECEIPT"
DEFAULT_VAT_RATE = 7.0
DEFAULT_VAT_MODE = "COMPANY"
DEFAULT_WHT_RATE = 3.0
DEFAULT_WHT_MODE = "NOWHT"

# =========================
# APP EXPIRY
# =========================
APP_EXPIRE_DATE = datetime.date(2027, 1, 30)  # 30/06/26
ADMIN_CONTACT_TEXT = "โปรแกรมหมดอายุแล้ว\nกรุณาติดต่อแอดมินเพื่อขอเวอร์ชันใหม่"


# =========================
# Helpers
# =========================
def today_str():
    return datetime.date.today().strftime("%Y-%m-%d")

def check_app_expiry_or_exit(parent=None):
    """
    If today's date is later than APP_EXPIRE_DATE, block usage.
    """
    try:
        today = datetime.date.today()
    except Exception:
        today = None

    if today and today > APP_EXPIRE_DATE:
        try:
            messagebox.showerror("BKTAX - Expired", ADMIN_CONTACT_TEXT, parent=parent)
        except Exception:
            # fallback if tkinter not ready
            print(ADMIN_CONTACT_TEXT)

        # ปิดโปรแกรมทันที
        raise SystemExit(0)


def money(x: float) -> str:
    try:
        return f"{x:,.2f}"
    except Exception:
        return "0.00"

def safe_float(s: str) -> float:
    try:
        s = str(s).replace(",", "").strip()
        if s == "":
            return 0.0
        return float(s)
    except Exception:
        return 0.0

def compute_finance(item_amounts, vat_rate_percent, vat_mode, wht_rate_percent, wht_mode):
    base_total = sum(item_amounts)

    # VAT
    vr = max(0.0, vat_rate_percent)
    if vat_mode == "NOVAT" or vr == 0:
        subtotal_ex_vat = base_total
        vat_amount = 0.0
        total_payable = base_total
    elif vat_mode == "COMPANY":
        total_payable = base_total
        vat_amount = total_payable * (vr / (100.0 + vr))
        subtotal_ex_vat = total_payable - vat_amount
    elif vat_mode == "CUSTOMER":
        subtotal_ex_vat = base_total
        vat_amount = subtotal_ex_vat * (vr / 100.0)
        total_payable = subtotal_ex_vat + vat_amount
    else:
        subtotal_ex_vat = base_total
        vat_amount = 0.0
        total_payable = base_total

    # WHT
    wr = max(0.0, wht_rate_percent)
    if wht_mode == "NOWHT" or wr == 0:
        wht_amount = 0.0
        net_after_wht = total_payable
    elif wht_mode == "WITHHOLD":
        wht_amount = subtotal_ex_vat * (wr / 100.0)
        net_after_wht = total_payable - wht_amount
    elif wht_mode == "GROSSUP":
        wht_amount = subtotal_ex_vat * (wr / 100.0)
        net_after_wht = total_payable
    else:
        wht_amount = 0.0
        net_after_wht = total_payable

    return {
        "subtotal_ex_vat": subtotal_ex_vat,
        "vat_amount": vat_amount,
        "total_payable": total_payable,
        "wht_amount": wht_amount,
        "net_after_wht": net_after_wht,
    }


# =========================
# PDF Generator
# =========================
from io import BytesIO
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.utils import simpleSplit
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.pdfbase import pdfmetrics


def draw_invoice_pdf(
    pdf_path: str,
    company: dict,
    customer: dict,
    invoice_no: str,
    invoice_date: str,
    items: list,
    vat_rate: float,
    doc_type_code: str,
    seller_name: str,
    seller_tel: str,
    job_name: str,
    vat_mode: str,
    wht_rate: float,
    wht_mode: str,
    note_text: str,
):


    # ---- Title mapping (TH/EN) ----
    DOC_TITLE_TH_EN = {
        "QUOTATION": ("ใบเสนอราคา", "Quotation"),
        "BILLING": ("ใบวางบิล/ใบแจ้งหนี้", "Billing Note / Invoice"),
        "RECEIPT": ("ใบเสร็จรับเงิน", "Receipt"),
        "TAX_RECEIPT": ("ใบกำกับภาษี/ใบเสร็จรับเงิน", "Tax Invoice / Receipt"),
    }

    # ---- Title color by doc type ----
    DOC_TITLE_COLOR = {
        "QUOTATION": colors.HexColor("#CAA520"),    # Gold
        "BILLING": colors.HexColor("#1E5AA8"),      # Blue
        "RECEIPT": colors.HexColor("#00BB00"),      # Light Green
        "TAX_RECEIPT": colors.HexColor("#006600"),  # Dark Green
    }

    # ---- Signature title mapping ----
    sig_title_map = {
        "QUOTATION": ("ผู้เสนอราคา", "ผู้รับเสนอราคา"),
        "BILLING": ("ผู้วางบิล", "ผู้รับวางบิล"),
        "RECEIPT": ("ผู้รับเงิน", "ผู้จ่ายเงิน"),
        "TAX_RECEIPT": ("ผู้รับเงิน", "ผู้จ่ายเงิน"),
    }

    def _money(x: float) -> str:
        try:
            return f"{x:,.2f}"
        except Exception:
            return "0.00"

    def _safe_float(x) -> float:
        try:
            return float(str(x).replace(",", "").strip() or 0)
        except Exception:
            return 0.0

    def _compute_finance(item_amounts, vat_rate_percent, vat_mode, wht_rate_percent, wht_mode):
        base_total = sum(item_amounts)

        vr = max(0.0, vat_rate_percent)
        if vat_mode == "NOVAT" or vr == 0:
            subtotal_ex_vat = base_total
            vat_amount = 0.0
            total_payable = base_total
        elif vat_mode == "COMPANY":
            total_payable = base_total
            vat_amount = total_payable * (vr / (100.0 + vr))
            subtotal_ex_vat = total_payable - vat_amount
        elif vat_mode == "CUSTOMER":
            subtotal_ex_vat = base_total
            vat_amount = subtotal_ex_vat * (vr / 100.0)
            total_payable = subtotal_ex_vat + vat_amount
        else:
            subtotal_ex_vat = base_total
            vat_amount = 0.0
            total_payable = base_total

        wr = max(0.0, wht_rate_percent)
        if wht_mode == "NOWHT" or wr == 0:
            wht_amount = 0.0
            net_after_wht = total_payable
        elif wht_mode == "WITHHOLD":
            wht_amount = subtotal_ex_vat * (wr / 100.0)
            net_after_wht = total_payable - wht_amount
        elif wht_mode == "GROSSUP":
            wht_amount = subtotal_ex_vat * (wr / 100.0)
            net_after_wht = total_payable
        else:
            wht_amount = 0.0
            net_after_wht = total_payable

        return {
            "subtotal_ex_vat": subtotal_ex_vat,
            "vat_amount": vat_amount,
            "total_payable": total_payable,
            "wht_amount": wht_amount,
            "net_after_wht": net_after_wht,
        }

    def draw_frame(c, W, H):
        if FRAME_PATH and os.path.exists(FRAME_PATH):
            c.drawImage(
                FRAME_PATH,
                0,
                0,
                width=W,
                height=H,
                preserveAspectRatio=False,
                mask="auto"
            )

    
    def draw_signatures(c, W, H, margin_x, bottom_margin):
        # ----- lock signature block to bottom -----
        sig_box_w = 49 * mm
        sig_box_h = 25 * mm
    
        date_y      = bottom_margin + 6 * mm
        sig_line_y  = date_y + 10 * mm
        under_box_y = sig_line_y + 10 * mm
        stamp_y     = under_box_y + 8 * mm
        sig_title_y = stamp_y + sig_box_h + 8 * mm
    
        left_title, right_title = sig_title_map.get(
            doc_type_code, ("ผู้ขาย/ผู้ให้บริการ", "ผู้ซื้อ/ผู้รับบริการ")
        )
    
        left_x1  = margin_x
        left_x2  = left_x1 + 70*mm
        right_x2 = W - margin_x
        right_x1 = right_x2 - 70*mm
    
        stamp_x_left  = left_x1 + 8*mm
        stamp_x_right = right_x2 - 8*mm - sig_box_w
    
        # หัวข้อ
        c.setFont("TH-Bold", 12)
        c.drawString(left_x1, sig_title_y, left_title)
        c.drawRightString(right_x2, sig_title_y, right_title)
    
        # กล่องตราประทับ
        c.setStrokeColor(colors.black)
        c.setLineWidth(0.3)
        c.rect(stamp_x_left,  stamp_y, sig_box_w, sig_box_h, stroke=1, fill=0)
        c.rect(stamp_x_right, stamp_y, sig_box_w, sig_box_h, stroke=1, fill=0)
    
        c.setFont("TH", 11)
        stamp_text_y = stamp_y + (sig_box_h/2) + 9*mm
        c.drawCentredString(stamp_x_left  + sig_box_w/2, stamp_text_y, "ตราประทับ (หากมี)")
        c.drawCentredString(stamp_x_right + sig_box_w/2, stamp_text_y, "ตราประทับ (หากมี)")
    
        # ในนาม
        buyer_name = (customer.get("name","") or "").strip()
        c.setFont("TH", 11)
        c.drawString(left_x1, under_box_y, f"ในนาม {company.get('name','')}")
        c.drawRightString(right_x2, under_box_y, f"ในนาม {buyer_name if buyer_name else 'ลูกค้า'}")
    
        # เส้นเซ็น
        c.setLineWidth(0.4)
        c.line(left_x1,  sig_line_y, left_x2,  sig_line_y)
        c.line(right_x1, sig_line_y, right_x2, sig_line_y)
    
        # ชื่อ + Date (กำหนดระยะห่างชัดเจน)
        sale_person = (seller_name or "").strip()
        buyer_show  = buyer_name if buyer_name else ".........."
    
        sign_name_y = sig_line_y - 7*mm
        sig_date_y  = sign_name_y - 7.5*mm
    
        c.setFont("TH", 11)
        c.drawString(left_x1,  sign_name_y, f"({sale_person}) ({left_title})")
        c.drawRightString(right_x2, sign_name_y, f"({buyer_show}) ({right_title})")
    
        c.drawString(left_x1,  sig_date_y, "Date : _________/____________________/_________")
        c.drawRightString(right_x2, sig_date_y, "Date : _________/____________________/_________")




    # ------------------------
    # Render function (for 2-pass page counting)
    def _render(c, total_pages: int | None):
        W, H = A4
        margin_x = 18 * mm
        top_margin = 18 * mm
        bottom_margin = 18 * mm
    
        # -------- signature lock (bottom) --------
        sig_box_w = 49 * mm
        sig_box_h = 25 * mm
    
        date_y = bottom_margin + 6 * mm
        sig_line_y = date_y + 10 * mm
        under_box_y = sig_line_y + 10 * mm
        stamp_y = under_box_y + 8 * mm
        stamp_top_y = stamp_y + sig_box_h
        sig_title_y = stamp_top_y + 8 * mm
        safe_bottom_y = sig_title_y + 6 * mm  # เนื้อหาด้านบนห้ามลงต่ำกว่านี้
    
        # -------- prepare paging (6 items / page) --------
        filled_items = [it for it in items if str(it.get("desc", "")).strip()]
        PAGE_SIZE = 6
        chunks = [filled_items[i:i+PAGE_SIZE] for i in range(0, len(filled_items), PAGE_SIZE)]
        if not chunks:
            chunks = [[]]
    
        # col widths (fit between margins)
        avail_w = W - 2 * margin_x

        
        # ----- decide columns by discount -----
        # ✅ set default เสมอ (ไม่มี disc column)
        base_mm = [12, 90, 16, 35, 35]   # No, Desc, Qty, Unit Price, Amount
        
        # ตรวจว่ามีการกรอกส่วนลดอย่างน้อย 1 รายการไหม
        has_disc = any((_safe_float(it.get("disc", 0)) > 0) for it in filled_items)

        
        if has_disc:
            base_mm = [12, 78, 16, 16, 35, 35]  # No, Desc, Qty, Disc%, Unit Price, Amount
        
        base_sum = sum(base_mm)
        col_widths = [(b / base_sum) * avail_w for b in base_mm]


        header_fill = colors.HexColor("#333333")
        #("#D3B56C")
    
        # -------- helper: draw header/meta/customer for EACH PAGE --------
        def draw_header(page_no: int):
            y = H - top_margin
        
            # ---------------- title position (กำหนดก่อน) ----------------
            title_th, title_en = DOC_TITLE_TH_EN.get(doc_type_code, ("เอกสาร", "Document"))
            title_x = W - margin_x
        
            # ✅ ขยับ title ขึ้นนิดให้ชิดบนมากขึ้น
            title_y = y  # (เดิม y - 2mm)
        
            title_color = DOC_TITLE_COLOR.get(doc_type_code, colors.black)
            c.setFillColor(title_color)
        
            c.setFont("TH-Bold", 22)
            c.drawRightString(title_x, title_y, title_th)
        
            c.setFont("TH-Bold", 20)
            c.drawRightString(title_x, title_y - 7 * mm, title_en)
        
            page_text = (
                f"ต้นฉบับ (Original) Page {page_no}/{total_pages}"
                if total_pages else
                f"ต้นฉบับ (Original) Page {page_no}"
            )
            c.setFont("TH", 12)
            c.drawRightString(title_x, title_y - 13 * mm, page_text)
            c.setFillColor(colors.black)
        
            # ---------------- logo (align top with TH title) ----------------
            logo_path = (company.get("logo_path") or "").strip()
            logo_h = 22 * 1.3 * mm
            logo_w = 35 * 1.7 * mm
        
            # ✅ ให้ "ขอบบนโลโก้" เท่ากับ "ขอบบนตัวอักษรไทย"
            # baseline -> top ประมาณ +7mm (ปรับได้ 6-8mm ตามฟอนต์/โลโก้)
            title_top_y = title_y + 7 * mm
            logo_top_y = title_top_y
            logo_y = logo_top_y - logo_h  # drawImage ใช้ y เป็น "ขอบล่าง"
        
            if logo_path and os.path.exists(logo_path):
                try:
                    c.drawImage(
                        logo_path,
                        margin_x,
                        logo_y,
                        width=logo_w,
                        height=logo_h,
                        preserveAspectRatio=True,
                        mask="auto",
                    )
                except Exception:
                    pass
        
            # ---------------- company block ----------------
            hdr_font = "TH-Bold"
            hdr_size = 15
            txt_font = "TH"
            txt_size = 12.5
            line_gap = 5.0 * mm
        
            # ✅ company_y อยู่ใต้ logo เหมือนเดิม
            company_y = logo_y - 4 * mm
        
            c.setFont(hdr_font, hdr_size)
            c.drawString(margin_x, company_y, company.get("name", ""))
        
            c.setFont(txt_font, txt_size)
            company_lines = [
                company.get("address", ""),
                f"เลขประจำตัวผู้เสียภาษี : {company.get('tax_id','')}",
                f"โทร : {company.get('phone','')}   อีเมล : {company.get('email','')}",
            ]
            yy = company_y - line_gap
            for line in company_lines:
                c.drawString(margin_x, yy, line)
                yy -= 4.5 * mm
        
            # ---------------- meta box (top align with company name line) ----------------
            meta_lines = [
                f"เลขที่เอกสาร : {invoice_no}",
                f"วันที่ : {invoice_date}",
                f"ผู้ขาย : {seller_name}",
                f"เบอร์ผู้ขาย : {seller_tel}",
                f"ชื่องาน : {job_name if str(job_name).strip() else '-'}",
            ]
        
            c.setFont("TH", 11)
            pad_x = 3 * mm
            pad_y = 3 * mm
            meta_line_h = 6 * mm
        
            max_text_w = 0
            for s in meta_lines:
                max_text_w = max(max_text_w, pdfmetrics.stringWidth(s, "TH", 11))
        
            meta_w = max_text_w + (pad_x * 2)
            meta_h = (len(meta_lines) * meta_line_h) + (pad_y * 2)
        
            # ✅ ให้ "ขอบบน meta box" อยู่ระดับเดียวกับ "บริษัท บลู๊ค ลิฟวิ่ง (สำนักงานใหญ่)"
            meta_top = company_y
            meta_x = W - margin_x - meta_w
            meta_y = meta_top - meta_h
        
            c.setStrokeColor(colors.black)
            c.setLineWidth(0.5)
            c.rect(meta_x, meta_y, meta_w, meta_h, stroke=1, fill=0)
        
            # --- write meta text (label bold, value normal) ---
            text_y = meta_top - pad_y - 4 * mm
            
            for line in meta_lines:
                if ":" in line:
                    label, value = line.split(":", 1)
                    label = label + ":"
                    value = value.strip()
            
                    # label (Bold)
                    c.setFont("TH-Bold", 11)
                    c.drawString(meta_x + pad_x, text_y, label)
            
                    label_w = pdfmetrics.stringWidth(label, "TH-Bold", 11)
            
                    # value (Normal)
                    c.setFont("TH", 11)
                    c.drawString(meta_x + pad_x + label_w + 2, text_y, value)
                else:
                    c.setFont("TH", 11)
                    c.drawString(meta_x + pad_x, text_y, line)
            
                text_y -= meta_line_h

        
            # ---------------- customer ----------------
            cust_top = yy - 6 * mm
            c.setFont(hdr_font, hdr_size)
            c.drawString(margin_x, cust_top, "Customer (ลูกค้า)")
        
            c.setFont(txt_font, txt_size)
            cust_lines = [
                f"ชื่อ : {customer.get('name','')}",
                f"ที่อยู่ : {customer.get('address','')}",
                f"เลขประจำตัวผู้เสียภาษี : {customer.get('vat_no','')}",
                f"E-mail : {customer.get('email','')}",
            ]
            cy = cust_top - line_gap
            for line in cust_lines:
                c.drawString(margin_x, cy, line)
                cy -= 4.5 * mm
        
            return cy - 5 * mm

        # -------- loop pages (NO recursion) --------
        for page_idx, page_items in enumerate(chunks):
            page_no = page_idx + 1
            is_last_page = (page_idx == len(chunks) - 1)
        
            # ✅ draw frame background
            draw_frame(c, W, H)
        
            table_top = draw_header(page_no)

            filled_items = [it for it in items if str(it.get("desc","")).strip()]
            show_disc_col = any((_safe_float(it.get("disc", 0)) > 0.000001) for it in filled_items)

    
            # table
            if show_disc_col:
                data = [["ลำดับ", "รายการ", "จำนวน", "ส่วนลด(%)", "ราคาต่อหน่วย", "จำนวนเงิน"]]
                for it in page_items:
                    data.append([
                        str(it.get("no","")),
                        str(it.get("desc","")),
                        str(it.get("qty",1)),
                        f'{_safe_float(it.get("disc",0)):.0f}',
                        _money(_safe_float(it.get("price",0))),
                        _money(_safe_float(it.get("amount",0))),
                    ])
                base_mm = [12, 80, 16, 18, 30, 30]   # ✅ ปรับสัดส่วนตามจริง
            else:
                data = [["ลำดับ", "รายการ", "จำนวน", "ราคาต่อหน่วย", "จำนวนเงิน"]]
                for it in page_items:
                    data.append([
                        str(it.get("no","")),
                        str(it.get("desc","")),
                        str(it.get("qty",1)),
                        _money(_safe_float(it.get("price",0))),
                        _money(_safe_float(it.get("amount",0))),
                    ])
                base_mm = [12, 90, 16, 35, 35]

            # ✅ calculate col_widths automatically based on base_mm
            avail_w = W - 2*margin_x
            base_sum = sum(base_mm)
            col_widths = [(b / base_sum) * avail_w for b in base_mm]


    
            #t = Table(data, colWidths=col_widths)
            t = Table(data, colWidths=col_widths)
            
            # ✅ dynamic right align
            if show_disc_col:
                right_cols = [4, 5]  # Unit Price, Amount
            else:
                right_cols = [3, 4]  # Unit Price, Amount
            
            style_cmds = [
                ("BACKGROUND", (0,0), (-1,0), header_fill),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("FONTNAME", (0,0), (-1,0), "TH-Bold"),
                ("FONTSIZE", (0,0), (-1,0), 12.5),
                ("ALIGN", (0,0), (-1,0), "CENTER"),
            
                ("FONTNAME", (0,1), (-1,-1), "TH"),
                ("FONTSIZE", (0,1), (-1,-1), 11),
            
                ("ALIGN", (0,1), (0,-1), "CENTER"),  # No
                ("ALIGN", (2,1), (2,-1), "CENTER"),  # Qty
            
                ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
                ("GRID", (0,0), (-1,-1), 0.6, colors.black),
                ("LEFTPADDING", (0,0), (-1,-1), 4),
                ("RIGHTPADDING", (0,0), (-1,-1), 4),
                ("TOPPADDING", (0,0), (-1,-1), 3),
                ("BOTTOMPADDING", (0,0), (-1,-1), 3),
            ]
            
            for cidx in right_cols:
                style_cmds.append(("ALIGN", (cidx,1), (cidx,-1), "RIGHT"))
            
            # disc column ให้กลาง (ถ้ามี)
            if show_disc_col:
                style_cmds.append(("ALIGN", (3,1), (3,-1), "CENTER"))
            
            t.setStyle(TableStyle(style_cmds))
            w_tbl, h_tbl = t.wrapOn(c, avail_w, H)
            t.drawOn(c, margin_x, table_top - h_tbl)

            draw_signatures(c, W, H, margin_x, bottom_margin)

            
                   
            # only last page draw totals/note/signatures
            if is_last_page:
                # --- totals (NOWHT auto height) ---
                # --- totals ---
                item_amounts = [_safe_float(it.get("amount",0)) for it in filled_items]
                fin = compute_finance(item_amounts, _safe_float(vat_rate), vat_mode, _safe_float(wht_rate), wht_mode)

                
                # ✅ show_wht: ต้องไม่ใช่ NOWHT และต้องมี wht_amount จริง
                show_wht = (wht_mode != "NOWHT") and (fin["wht_amount"] > 0.000001)
                
                # ✅ ถ้า total_payable == net_after_wht → ไม่ต้องโชว์ยอดชำระ
                show_net = abs(fin["total_payable"] - fin["net_after_wht"]) > 0.005
                
                box_w = 70 * mm
                
                # ปรับความสูงตามจำนวนบรรทัดจริง
                lines_count = 3  # subtotal + vat + total
                if show_wht:
                    lines_count += 1
                if show_net:
                    lines_count += 1
                
                # กำหนดสูงแบบแน่นๆ (1 บรรทัด ~ 7mm + padding)
                box_h = (lines_count * 7 * mm) + 10 * mm
                
                box_x = W - margin_x - box_w
                box_y = (table_top - h_tbl - 8*mm) - box_h
                
                # ถ้าชนลายเซ็น → ขึ้นหน้าใหม่
                if box_y < safe_bottom_y:
                    c.showPage()
                    draw_frame(c, W, H)
                    table_top = draw_header(page_no + 1)
                    draw_signatures(c, W, H, margin_x, bottom_margin)
                    box_y = H - 120*mm
                
                c.setStrokeColor(colors.black)
                c.setLineWidth(0.5)
                c.rect(box_x, box_y, box_w, box_h, stroke=1, fill=0)
                
                yline = box_y + box_h - 8*mm
                gap = 7*mm
                
                # 1) subtotal
                c.setFont("TH", 11)
                c.drawString(box_x + 3*mm, yline, "รวมเป็นเงิน :")
                c.drawRightString(box_x + box_w - 3*mm, yline, _money(fin["subtotal_ex_vat"]))
                yline -= gap
                
                # 2) vat
                c.drawString(box_x + 3*mm, yline, f"ภาษีมูลค่าเพิ่ม ({_safe_float(vat_rate):.2f}%):")
                c.drawRightString(box_x + box_w - 3*mm, yline, _money(fin["vat_amount"]))
                yline -= gap
                
                # 3) total
                c.setFont("TH-Bold", 13)
                c.drawString(box_x + 3*mm, yline, "จำนวนเงินทั้งสิ้น:")
                c.drawRightString(box_x + box_w - 3*mm, yline, _money(fin["total_payable"]))
                yline -= gap
                
                # 4) wht
                if show_wht:
                    c.setFont("TH", 11)
                    c.drawString(box_x + 3*mm, yline, f"ภาษีหัก ณ ที่จ่าย ({_safe_float(wht_rate):.2f}%):")
                    c.drawRightString(box_x + box_w - 3*mm, yline, _money(fin["wht_amount"]))
                    yline -= gap
                
                # 5) net
                if show_net:
                    c.setFont("TH-Bold", 16)
                    c.drawString(box_x + 3*mm, yline, "ยอดชำระ:")
                    c.drawRightString(box_x + box_w - 3*mm, yline, _money(fin["net_after_wht"]))


    
                # NOTE (same top as totals)  --- AUTO HEIGHT by lines (stop before signatures)
                note = (note_text or "").strip()
                if note:
                    note_pad = 3*mm
                    leading = 4.8*mm
                    note_x = margin_x
                    note_w = (box_x - 8*mm) - note_x
                
                    # --- split lines (wrap) ---
                    c.setFont("TH", 11)
                    all_lines = []
                    for para in note.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
                        if para.strip() == "":
                            all_lines.append("")
                        else:
                            all_lines.extend(simpleSplit(para, "TH", 11, note_w - 2*note_pad))
                
                    title_h = 6*mm
                    text_h = len(all_lines) * leading
                    need_h = title_h + text_h + (note_pad * 2)
                
                    # top of note = top of totals
                    note_top_y = box_y + box_h
                
                    # max height allowed before hitting signatures
                    max_h = max(0, note_top_y - (safe_bottom_y + 2*mm))
                
                    # ถ้า note ต้องใช้สูงมากจนชนลายเซ็น -> ขึ้นหน้าใหม่ แล้วย้าย totals+note ไปหน้าใหม่
                    if need_h > max_h:
                        c.showPage()
                        draw_frame(c, W, H)
                        draw_header(page_no + 1)
                
                        # วาง totals ในตำแหน่ง safe (เหมือนของคุณ)
                        box_y = H - 120*mm
                        note_top_y = box_y + box_h
                        max_h = max(0, note_top_y - (safe_bottom_y + 2*mm))
                
                    # ✅ final note height (ตามเนื้อหา แต่ไม่ชนลายเซ็น)
                    note_h = min(need_h, max_h)
                    note_y = note_top_y - note_h
                
                    c.setLineWidth(0.5)
                    c.setStrokeColor(colors.black)
                    c.rect(note_x, note_y, note_w, note_h, stroke=1, fill=0)
                
                    c.setFont("TH-Bold", 14)
                    c.drawString(note_x + note_pad, note_top_y - note_pad - 2*mm, "Note :")
                
                    # draw lines (รองรับ icon token ด้วย)
                    c.setFont("TH", 11)
                    yy2 = note_top_y - title_h - note_pad
                
                    icon_w = 60 * mm
                    icon_h = 60 * mm
                    icon_gap = 12 * mm
                
                    for ln in all_lines:
                        if yy2 < note_y + note_pad:
                            break
                
                        if KBANK_TOKEN in ln:
                            left_txt = ln.replace(KBANK_TOKEN, "").rstrip()
                            c.drawString(note_x + note_pad, yy2, left_txt)
                
                            if os.path.exists(KBANK_ICON_PATH):
                                try:
                                    txt_w = pdfmetrics.stringWidth(left_txt, "TH", 11)
                                    c.drawImage(
                                        KBANK_ICON_PATH,
                                        note_x + note_pad + txt_w + icon_gap,
                                        yy2 - (icon_h *0.5),
                                        width=icon_w,
                                        height=icon_h,
                                        preserveAspectRatio=True,
                                        mask="auto",
                                    )
                                except Exception:
                                    pass
                        else:
                            c.drawString(note_x + note_pad, yy2, ln)
                
                        yy2 -= leading



            else:
            # next page if not last
                c.showPage()
               

    
    buf = BytesIO()
    c1 = rl_canvas.Canvas(buf, pagesize=A4)
    _render(c1, total_pages=None)
    c1.save()                        # ✅ pass 1 save
    
    buf.seek(0)
    total_pages = len(PdfReader(buf).pages)
    
    c2 = rl_canvas.Canvas(pdf_path, pagesize=A4)
    _render(c2, total_pages=total_pages)
    c2.save()                        # ✅ pass 2 save (ไฟล์จริง)

                


# =========================
# GUI
# =========================
class BKTAX(tk.Tk):
    def __init__(self):
        super().__init__()
        try:
            self.iconbitmap(str(ASSET_ROOT / "BKTAX.ico"))

        except Exception:
            pass
        
        check_app_expiry_or_exit(parent=self)  # ✅ เช็คซ้ำอีกชั้น
        self.title("BKTAXV1")
        self.geometry("1050x950")
        self.minsize(980, 860)

        self.DEFAULT_ROWS = 2

        # master data
        self.sales_master, self.products_master, err = load_master_data()
        if err:
            messagebox.showwarning("Master Data", f"Cannot load 00.BK_Sell_Master_Data.xlsx\n{err}")

        if self.products_master:
            self.product_display_list = [f'{p["code"]} - {p["name"]}' for p in self.products_master]
        else:
            self.product_display_list = []

        # vars
        self.doc_no_var = tk.StringVar(value=self._make_doc_no(DEFAULT_DOC_TYPE))
        self.doc_date_var = tk.StringVar(value=today_str())
        self.doc_type_var = tk.StringVar(value=DOC_LABEL_BY_CODE[DEFAULT_DOC_TYPE])
        self.job_name_var = tk.StringVar(value="")

        self.sale_name_var = tk.StringVar(value="")
        self.sale_tel_var = tk.StringVar(value="")

        self.cust_name_var = tk.StringVar(value="")
        self.cust_addr_var = tk.StringVar(value="")
        self.cust_vat_var = tk.StringVar(value="")
        self.cust_email_var = tk.StringVar(value="")


        self.vat_rate_var = tk.StringVar(value=str(DEFAULT_VAT_RATE))
        self.vat_mode_var = tk.StringVar(value=VAT_LABEL_BY_CODE[DEFAULT_VAT_MODE])

        self.wht_mode_var = tk.StringVar(value=WHT_LABEL_BY_CODE[DEFAULT_WHT_MODE])
        self.wht_rate_var = tk.StringVar(value="0.0")

        self.subtotal_var = tk.StringVar(value="0.00")
        self.vat_var = tk.StringVar(value="0.00")
        self.total_var = tk.StringVar(value="0.00")
        self.wht_var = tk.StringVar(value="0.00")
        self.net_after_wht_var = tk.StringVar(value="0.00")

        self.note_var = tk.StringVar(value="")

        self.rows = []
        self.totals_ready = False

        self.history_list = None
        self._draft_file_map = {}

        self.last_pdf_path = None


        container = ttk.Frame(self)
        container.pack(fill="both", expand=True)
        
        self.main_canvas = tk.Canvas(container, highlightthickness=0)
        self.main_canvas.pack(side="left", fill="both", expand=True)
        
        vbar = ttk.Scrollbar(container, orient="vertical", command=self.main_canvas.yview)
        vbar.pack(side="right", fill="y")
        
        self.main_canvas.configure(yscrollcommand=vbar.set)
        
        # frame ที่จะใส่ UI ทั้งหมด
        self.scroll_frame = ttk.Frame(self.main_canvas)
        self._scroll_window_id = self.main_canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        
        
        style = ttk.Style(self)
        style.theme_use("default")
        

        
        
        def _on_frame_configure(event=None):
            self._update_scrollregion()

        
        def _on_canvas_configure(event):
            # ให้ความกว้างของ scroll_frame เท่ากับ canvas (กัน UI บีบ)
            self.main_canvas.itemconfigure(self._scroll_window_id, width=event.width)
        
        self.scroll_frame.bind("<Configure>", _on_frame_configure)
        self.main_canvas.bind("<Configure>", _on_canvas_configure)
        
        # mouse wheel scroll (Windows)
        def _on_mousewheel(event):
            self.main_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
        self.main_canvas.bind_all("<MouseWheel>", _on_mousewheel)   

            
        self._setup_theme()
        self._build_ui()
        self._update_scrollregion()
        self.bind_all("<Button-1>", self._global_click_hide_popup, add="+")
        self._recalc_totals()

    def _safe_focus_get(self):
        try:
            return self.focus_get()
        except KeyError:
            # ttk.Combobox popdown internal widget
            return None
        except Exception:
            return None
   
        
    # --- Main vertical scroll (whole window) ---
    def _update_scrollregion(self):
        try:
            self.update_idletasks()
            self.main_canvas.configure(scrollregion=self.main_canvas.bbox("all"))
        except Exception:
            pass


    # ---------- Draft / Files ----------
    def _refresh_history_list(self):
        if not self.history_list:
            return
        self.history_list.delete(0, tk.END)
        self._draft_file_map = {}
        folder = get_history_folder()
        files = sorted(folder.glob("*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
        for p in files:
            name = p.name
            self._draft_file_map[name] = p
            self.history_list.insert(tk.END, name)

    def new_form(self):
        self.doc_type_var.set(DOC_LABEL_BY_CODE[DEFAULT_DOC_TYPE])
        self.doc_no_var.set(self._make_doc_no(DEFAULT_DOC_TYPE))
        self.doc_date_var.set(today_str())

        self.sale_name_var.set("")
        self.sale_tel_var.set("")
        self.job_name_var.set("")

        self.cust_name_var.set("")
        self.cust_addr_var.set("")
        self.cust_vat_var.set("")
        self.cust_email_var.set("")


        self.vat_rate_var.set(str(DEFAULT_VAT_RATE))
        self.vat_mode_var.set(VAT_LABEL_BY_CODE[DEFAULT_VAT_MODE])

        self.wht_rate_var.set("0.0")
        self.wht_mode_var.set(WHT_LABEL_BY_CODE[DEFAULT_WHT_MODE])
        try:
            self.note_text.delete("1.0", "end")
            self._apply_default_note_if_empty()
        except Exception:
            pass

        self.reset_rows()
        self._recalc_totals()

    def save_draft(self):
        try:
            rows = self._serialize_state_to_rows()
    
            doc_type_code = DOC_CODE_BY_LABEL.get(
                self.doc_type_var.get().strip(),
                "DOC"
            )
            short = DOC_SHORT.get(doc_type_code, doc_type_code)
            stamp = datetime.datetime.now().strftime("%y%m%d-%H%M%S")
            filename = f"Df-{short}-{stamp}.csv"

    
            path = get_history_folder() / filename
            pd.DataFrame(rows).to_csv(path, index=False, encoding="utf-8-sig")
    
            self._refresh_history_list()
            messagebox.showinfo("Saved", f"Draft saved:\n{path}")
        except Exception as e:
            messagebox.showerror("Save Draft Error", str(e))


    def open_selected_draft(self, event=None):
        if not self.history_list:
            return
        sel = self.history_list.curselection()
        if not sel:
            return
        label = self.history_list.get(sel[0])
        path = self._draft_file_map.get(label)
        if not path or not path.exists():
            return

        try:
            df = pd.read_csv(path, encoding="utf-8-sig", dtype=str, keep_default_na=False)
            df = df.fillna("")  # กัน NaN หลุดมา (เผื่อบางเคส)
            
            def clean(v, default=""):
                s = str(v).strip()
                if s.lower() in ("nan", "none", "null"):
                    return default
                return s

            if df.empty:
                return

            r0 = df.iloc[0]
            # ✅ load note
            try:
                self.note_text.delete("1.0", "end")
                self.note_text.insert("1.0", str(r0.get("note", "")))
            except Exception:
                pass

            self.doc_type_var.set(clean(r0.get("doc_type", DOC_LABEL_BY_CODE[DEFAULT_DOC_TYPE])))
            self.doc_no_var.set(clean(r0.get("doc_no", "")))
            self.doc_date_var.set(clean(r0.get("doc_date", today_str())))
            
            self.sale_name_var.set(clean(r0.get("sale_name", "")))
            self.sale_tel_var.set(clean(r0.get("sale_tel", "")))
            self.job_name_var.set(clean(r0.get("job_name", "")))
            
            self.cust_name_var.set(clean(r0.get("cust_name", "")))
            self.cust_addr_var.set(clean(r0.get("cust_addr", "")))
            self.cust_vat_var.set(clean(r0.get("cust_vat", "")))
            self.cust_email_var.set(clean(r0.get("cust_email", "")))
            
            self.vat_rate_var.set(clean(r0.get("vat_rate", str(DEFAULT_VAT_RATE))))
            self.vat_mode_var.set(clean(r0.get("vat_mode", VAT_LABEL_BY_CODE[DEFAULT_VAT_MODE])))
            
            self.wht_rate_var.set(clean(r0.get("wht_rate", "0.0")))
            self.wht_mode_var.set(clean(r0.get("wht_mode", WHT_LABEL_BY_CODE[DEFAULT_WHT_MODE])))


            # rebuild rows
            items = []
            for _, rr in df.iterrows():
                items.append({
                    "product": clean(rr.get("product", "")),
                    "qty": clean(rr.get("qty", "1"), "1"),
                    "price": clean(rr.get("price", "0.00"), "0.00"),
                    "disc": clean(rr.get("disc", "0"), "0"),
                })



            target = max(self.DEFAULT_ROWS, len(items))
            self.reset_rows()
            while len(self.rows) < target:
                self.add_item_row()

            for i, it in enumerate(items):
                if i >= len(self.rows):
                    break
            
                self.rows[i]["prod_var"].set(it.get("product",""))
                self.rows[i]["qty_var"].set(it.get("qty","1") or "1")
                self.rows[i]["price_var"].set(it.get("price","0.00") or "0.00")
            
                # ✅ โหลด disc ของแถวนี้ (สำคัญ)
                self.rows[i]["disc_var"].set(it.get("disc","0") or "0")
            
                self._try_fill_product(i)   # (ถ้าจะให้ auto เติม code/price จาก master)


            self._recalc_totals()
            self._update_scrollregion() 
            
        except Exception as e:
            messagebox.showerror("Open Draft Error", str(e))

    def _serialize_state_to_rows(self):
        items = self._collect_items(include_empty=True)
        note_text = ""
        try:
            note_text = self.note_text.get("1.0", "end-1c")
        except Exception:
            note_text = ""
    
        return [{
            "doc_type": self.doc_type_var.get().strip(),
            "doc_no": self.doc_no_var.get().strip(),
            "doc_date": self.doc_date_var.get().strip(),
    
            "sale_name": self.sale_name_var.get().strip(),
            "sale_tel": self.sale_tel_var.get().strip(),
            "job_name": self.job_name_var.get().strip(),
    
            "cust_name": self.cust_name_var.get().strip(),
            "cust_addr": self.cust_addr_var.get().strip(),
            "cust_vat": self.cust_vat_var.get().strip(),
            "cust_email": self.cust_email_var.get().strip(),

    
            "vat_rate": self.vat_rate_var.get().strip(),
            "vat_mode": self.vat_mode_var.get().strip(),
            "wht_rate": self.wht_rate_var.get().strip(),
            "wht_mode": self.wht_mode_var.get().strip(),
    
            "note": note_text,  # ✅ เพิ่ม
    
            "item_no": it.get("no", ""),
            "product": it.get("desc", ""),
            "qty": it.get("qty", ""),
            "disc": it.get("disc", 0),
            "price": it.get("price", ""),
        } for it in items]

    def _setup_theme(self):
        style = ttk.Style(self)
        style.theme_use("default")
    
        # ✅ เก็บสีไว้เป็น self.* เพื่อเรียกใช้ใน _build_ui ได้
        self.BLACK_BG   = "#111111"
        self.DARK_BG    = "#1A1A1A"
        self.GOLD       = "#C9A24D"
        self.TEXT_WHITE = "#F2F2F2"
    
        BTN_BLUE   = "#1E5AA8"
        BTN_GREEN  = "#2E7D32"
        BTN_RED    = "#8B0000"   # ✅ Save PDF
        BTN_GRAY   = "#333333"

        BTN_ADD    = "#2E7D32"   # Green
        BTN_REMOVE = "#E67E22"   # Orange
        BTN_YELLOW = "#C9A24D"

        style.configure("Warn.TButton", background=BTN_YELLOW, foreground="black")
        style.map(
            "Warn.TButton",
            background=[("active", "#E6C45A")]
        )

        
        style.configure(".", background=self.BLACK_BG, foreground=self.TEXT_WHITE, font=("Segoe UI", 10))
        style.configure("TFrame", background=self.BLACK_BG)
        style.configure("TLabelframe", background=self.DARK_BG, foreground=self.GOLD)
        style.configure("TLabelframe.Label", background=self.DARK_BG, foreground=self.GOLD, font=("Segoe UI", 10, "bold"))
        style.configure("TLabel", background=self.BLACK_BG, foreground=self.TEXT_WHITE)
    
        style.configure("TEntry", fieldbackground="#222222", foreground=self.TEXT_WHITE)
        style.configure("TCombobox", fieldbackground="#222222", foreground=self.TEXT_WHITE)
    
        # ✅ Button styles
        style.configure("Add.TButton", background=BTN_ADD, foreground="white")
        style.map("Add.TButton", background=[("active", "#388E3C")])
        
        style.configure("Remove.TButton", background=BTN_REMOVE, foreground="white")
        style.map("Remove.TButton", background=[("active", "#D35400")])
        
        style.configure("Warn.TButton", background=BTN_YELLOW, foreground="black")
        style.map("Warn.TButton", background=[("active", "#D4B36A")])
   
        style.configure("Primary.TButton", background=BTN_BLUE, foreground="white")
        style.map("Primary.TButton", background=[("active", "#2979FF")])
    
        style.configure("Success.TButton", background=BTN_GREEN, foreground="white")
        style.map("Success.TButton", background=[("active", "#388E3C")])
    
        style.configure("Danger.TButton", background=BTN_RED, foreground="white")
        style.map("Danger.TButton", background=[("active", "#A00000")])
    
        style.configure("Neutral.TButton", background=BTN_GRAY, foreground=self.TEXT_WHITE)

        style.configure("TCombobox",
            fieldbackground="#222222",
            background="#222222",
            foreground=self.TEXT_WHITE,
            arrowcolor=self.GOLD,
        )
        
        # ✅ สำคัญ: ให้ readonly/disabled สีไม่เพี้ยน
        style.map("TCombobox",
            fieldbackground=[("readonly", "#222222"), ("disabled", "#222222")],
            foreground=[("readonly", self.TEXT_WHITE), ("disabled", "#AAAAAA")],
            background=[("readonly", "#222222"), ("disabled", "#222222")],
            selectbackground=[("readonly", "#222222")],
            selectforeground=[("readonly", self.TEXT_WHITE)],
        )
        
        style.configure("TEntry",
            fieldbackground="#222222",
            foreground=self.TEXT_WHITE,
            insertcolor=self.TEXT_WHITE,
        )
        
        style.map("TEntry",
            fieldbackground=[("readonly", "#222222"), ("disabled", "#222222")],
            foreground=[("readonly", self.TEXT_WHITE), ("disabled", "#AAAAAA")],
        )


    

    # ---------- UI ----------
    def _build_ui(self):
        parent = self.scroll_frame  # ✅ สำคัญ
    
        top = ttk.Frame(parent, padding=10)
        top.pack(fill="x")

        company_frame = ttk.Labelframe(top, text="BLOOK LIVING Co., Ltd.", padding=10)
        company_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))

        company_text = (
            f"{COMPANY['name']}\n"
            f"{COMPANY['address']}\n"
            f"เลขประจำตัวผู้เสียภาษี: {COMPANY['tax_id']}\n"
            f"โทร: {COMPANY['phone']}\n"
            f"E-mail: {COMPANY['email']}\n"
            f"Logo: {COMPANY.get('logo_path','') or '(none)'}"
        )
        ttk.Label(company_frame, text=company_text, justify="left").pack(anchor="w")

        doc_frame = ttk.Labelframe(top, text="Document", padding=10)
        doc_frame.pack(side="left", fill="both", expand=True)

        r = 0
        ttk.Label(doc_frame, text="Doc Type").grid(row=r, column=0, sticky="w", pady=(6, 0))
        doc_cb = ttk.Combobox(doc_frame, textvariable=self.doc_type_var, values=[v for _, v in DOC_TYPES],
                              width=42, state="readonly")
        doc_cb.grid(row=r, column=1, sticky="w", padx=8, pady=(6, 0))
        doc_cb.bind("<<ComboboxSelected>>", self._on_doc_type_change)
        r += 1

        ttk.Label(doc_frame, text="Doc No").grid(row=r, column=0, sticky="w")
        ttk.Entry(doc_frame, textvariable=self.doc_no_var, width=30).grid(row=r, column=1, sticky="w", padx=8)
        r += 1

        ttk.Label(doc_frame, text="Date").grid(row=r, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(doc_frame, textvariable=self.doc_date_var, width=20).grid(row=r, column=1, sticky="w", padx=8, pady=(6, 0))
        r += 1

        ttk.Label(doc_frame, text="ผู้ขาย").grid(row=r, column=0, sticky="w", pady=(6, 0))
        sale_names = [s["sale_name"] for s in (self.sales_master or [])]
        self.sale_cb = ttk.Combobox(doc_frame, textvariable=self.sale_name_var, values=sale_names,
                                    width=42, state="readonly")
        self.sale_cb.grid(row=r, column=1, sticky="w", padx=8, pady=(6, 0))
        self.sale_cb.bind("<<ComboboxSelected>>", self._on_sale_change)
        r += 1

        ttk.Label(doc_frame, text="เบอร์ติดต่อ").grid(row=r, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(doc_frame, textvariable=self.sale_tel_var, width=42, state="readonly")\
            .grid(row=r, column=1, sticky="w", padx=8, pady=(6, 0))
        r += 1

        ttk.Label(doc_frame, text="ชื่องาน").grid(row=r, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(doc_frame, textvariable=self.job_name_var, width=42)\
            .grid(row=r, column=1, sticky="w", padx=8, pady=(6, 0))

        # ---------- body: left history + right main (layout still same content) ----------
        parent = self.scroll_frame
        body = ttk.Frame(parent)
        body.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        left = ttk.Frame(body, width=200)     # ✅ กำหนดกว้างขึ้น
        left.pack(side="left", fill="y")
        left.pack_propagate(False)           # ✅ ไม่ให้ยุบตาม widget
        
        right = ttk.Frame(body)
        right.pack(side="left", fill="both", expand=True, padx=(10, 0))


        # Draft History Panel
        hist = ttk.Labelframe(left, text="Draft History", padding=10)
        hist.pack(fill="both", expand=True)

        self.history_list = tk.Listbox(hist, height=30)
        self.history_list.pack(side="left", fill="both", expand=True)

        self.history_list.configure(bg="#1C1C1C",fg=self.TEXT_WHITE,selectbackground=self.GOLD,selectforeground="black")



        scroll = ttk.Scrollbar(hist, orient="vertical", command=self.history_list.yview)
        scroll.pack(side="right", fill="y")
        self.history_list.configure(yscrollcommand=scroll.set)

        self.history_list.bind("<Double-Button-1>", self.open_selected_draft)

        ttk.Button(left, text="Refresh", command=self._refresh_history_list).pack(fill="x", pady=(8, 0))
        self._refresh_history_list()

        # Customer
        cust = ttk.Labelframe(right, text="Customer (ลูกค้า)", padding=10)
        cust.pack(fill="x", pady=(0, 10))

        ttk.Label(cust, text="Customer Name").grid(row=0, column=0, sticky="w")
        ttk.Entry(cust, textvariable=self.cust_name_var, width=45).grid(row=0, column=1, sticky="w", padx=8)

        ttk.Label(cust, text="VAT No").grid(row=0, column=2, sticky="w", padx=(20, 0))
        ttk.Entry(cust, textvariable=self.cust_vat_var, width=45).grid(row=0, column=3, sticky="w", padx=8)

        ttk.Label(cust, text="Address").grid(row=1, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(cust, textvariable=self.cust_addr_var, width=106).grid(row=1, column=1, columnspan=3,
                                                                          sticky="w", padx=8, pady=(6, 0))
        ttk.Label(cust, text="E-mail").grid(row=2, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(cust, textvariable=self.cust_email_var, width=45).grid(row=2, column=1, sticky="w", padx=8, pady=(6, 0))


        # Tax
        tax_outer = ttk.Labelframe(right, text="ภาษี (Tax)", padding=10)
        tax_outer.pack(fill="x", pady=(0, 10))

        goods_frame = ttk.Labelframe(tax_outer, text="กรณีขายสินค้า (Goods)", padding=10)
        goods_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 10))

        service_frame = ttk.Labelframe(tax_outer, text="กรณีให้บริการ (Service)", padding=10)
        service_frame.grid(row=0, column=1, sticky="nsew")

        tax_outer.grid_columnconfigure(0, weight=1)
        tax_outer.grid_columnconfigure(1, weight=1)

        ttk.Label(goods_frame, text="VAT rate (%)").grid(row=0, column=0, sticky="w")
        vat_entry = ttk.Entry(goods_frame, textvariable=self.vat_rate_var, width=10)
        vat_entry.grid(row=0, column=1, sticky="w", padx=(10, 0))
        vat_entry.bind("<KeyRelease>", lambda e: self._recalc_totals())

        ttk.Label(goods_frame, text="VAT mode").grid(row=1, column=0, sticky="w", pady=(10, 0))
        vat_mode_cb = ttk.Combobox(goods_frame, textvariable=self.vat_mode_var, values=[v for _, v in VAT_MODES],
                                   width=28, state="readonly")
        vat_mode_cb.grid(row=1, column=1, sticky="w", padx=(10, 0), pady=(10, 0))
        vat_mode_cb.bind("<<ComboboxSelected>>", self._on_vat_mode_change)

        ttk.Label(goods_frame, text="(ขายสินค้า : การขายสินค้ามี VAT เสมอ)").grid(row=2, column=0, columnspan=2,
                                                                               sticky="w", pady=(10, 0))

        ttk.Label(service_frame, text="WHT rate (%)").grid(row=0, column=0, sticky="w")
        wht_entry = ttk.Entry(service_frame, textvariable=self.wht_rate_var, width=10)
        wht_entry.grid(row=0, column=1, sticky="w", padx=(10, 0))
        wht_entry.bind("<KeyRelease>", lambda e: self._recalc_totals())

        ttk.Label(service_frame, text="WHT mode").grid(row=1, column=0, sticky="w", pady=(10, 0))
        wht_mode_cb = ttk.Combobox(service_frame, textvariable=self.wht_mode_var, values=[v for _, v in WHT_MODES],
                                   width=28, state="readonly")
        wht_mode_cb.grid(row=1, column=1, sticky="w", padx=(10, 0), pady=(10, 0))
        wht_mode_cb.bind("<<ComboboxSelected>>", self._on_wht_mode_change)

        ttk.Label(service_frame, text="(ให้บริการ : การให้บริการมีภาษีหัก ณ ที่จ่ายเสมอ, ลูกค้าต้องออกใบรับรองการหักให้ด้วย)")\
            .grid(row=2, column=0, columnspan=2, sticky="w", pady=(10, 0))

        # Items
        self.items_frame = ttk.Labelframe(right, text="รายการ", padding=10)
        self.items_frame.pack(fill="both", expand=True, pady=(0, 10))

        # เดิม:
        # headers = ["No", "Product", "Code", "Qty", "Unit Price", "Amount"]
        
        # ใหม่:
        headers = ["No", "Product", "Code", "Qty", "Disc(%)", "Unit Price", "Amount"]
        for col, h in enumerate(headers):
            ttk.Label(self.items_frame, text=h).grid(row=0, column=col, sticky="w", padx=4)
        
        # IMPORTANT: ปุ่ม columnspan ต้องเปลี่ยนเป็น 7
        btn_row = ttk.Frame(self.items_frame)
        btn_row.grid(row=999, column=0, columnspan=7, sticky="we", pady=(10, 0))
        
        ttk.Button(btn_row, text="(+) Add", style="Add.TButton", command=self.add_item_row).pack(side="left")
        ttk.Button(btn_row, text="(-) Remove", style="Remove.TButton", command=self.remove_last_row).pack(side="left", padx=(8, 0))
        ttk.Button(btn_row, text="Reset", style="Warn.TButton", command=self.reset_rows).pack(side="right")
        

        for _ in range(self.DEFAULT_ROWS):
            self.add_item_row()

        # ---- Note Panel (document note) ----
        note_box = ttk.Labelframe(right, text="Note", padding=10)
        note_box.pack(fill="both", expand=False, pady=(0, 10))
        
        self.note_text = tk.Text(note_box, height=8, wrap="word")
        self.note_text.pack(side="left", fill="both", expand=True)
        
        note_scroll = ttk.Scrollbar(note_box, orient="vertical", command=self.note_text.yview)
        note_scroll.pack(side="right", fill="y")
        self.note_text.configure(
            bg="#1E1E1E",
            fg=self.TEXT_WHITE,
            insertbackground=self.GOLD,
            selectbackground=self.GOLD,
            selectforeground="black"
        )

        self.note_text.configure(yscrollcommand=note_scroll.set)
        
        # ปุ่ม Default Note
        note_btns = ttk.Frame(note_box)
        note_btns.pack(fill="x", pady=(6, 0))
        
        ttk.Button(note_btns, text="Default Note", style="Warn.TButton", command=self.apply_default_note).pack(side="left")



        # Bottom (old layout)
        bottom = ttk.Frame(right, padding=10)
        bottom.pack(fill="x")

        totals_box = ttk.Labelframe(bottom, text="สรุปการชำระเงิน (บาท)", padding=10)
        totals_box.pack(side="left", fill="x", expand=True)

        totals_box.grid_columnconfigure(0, weight=0)
        totals_box.grid_columnconfigure(1, weight=0)
        totals_box.grid_columnconfigure(2, weight=0)
        totals_box.grid_columnconfigure(3, weight=0)
        totals_box.grid_columnconfigure(4, weight=0)

        ttk.Label(totals_box, text="รวมเป็นเงิน :").grid(row=0, column=0, sticky="w")
        ttk.Label(totals_box, textvariable=self.subtotal_var, font=("Segoe UI", 10))\
            .grid(row=0, column=1, sticky="e", padx=(10, 40))

        ttk.Label(totals_box, text="ภาษีมูลค่าเพิ่ม :").grid(row=1, column=0, sticky="w", pady=(6, 0))
        ttk.Label(totals_box, textvariable=self.vat_var, font=("Segoe UI", 10))\
            .grid(row=1, column=1, sticky="e", padx=(10, 40), pady=(6, 0))

        ttk.Label(totals_box, text="จำนวนเงินทั้งสิ้น :").grid(row=2, column=0, sticky="w", pady=(6, 0))
        ttk.Label(totals_box, textvariable=self.total_var, font=("Segoe UI", 11),foreground=self.GOLD)\
            .grid(row=2, column=1, sticky="e", padx=(10, 40), pady=(6, 0))

        self.wht_label = ttk.Label(totals_box, text="หัก ณ ที่จ่าย :")
        self.wht_value = ttk.Label(totals_box, textvariable=self.wht_var, font=("Segoe UI", 10))
        self.net_label = ttk.Label(totals_box, text="ยอดชำระ :")
        self.net_value = ttk.Label(totals_box, textvariable=self.net_after_wht_var, font=("Segoe UI", 12, "bold"))

        self.wht_label.grid(row=0, column=2, sticky="w")
        self.wht_value.grid(row=0, column=3, sticky="e", padx=(10, 0))
        self.net_label.grid(row=1, column=2, sticky="w", pady=(6, 0))
        self.net_value.grid(row=1, column=3, sticky="e", padx=(10, 0), pady=(6, 0))

        # ---- Replace old 3 buttons with 4 main buttons (same position) ----
        btns = ttk.Frame(bottom)
        btns.pack(side="right", padx=(10, 0))

        ttk.Button(btns, text="New", style="Primary.TButton", command=self.new_form)\
            .pack(fill="x", pady=(0, 6))
        ttk.Button(btns, text="Save Draft", style="Success.TButton", command=self.save_draft)\
            .pack(fill="x", pady=(0, 6))
        ttk.Button(btns,text="Save PDF",style="Danger.TButton",command=self.save_pdf).pack(fill="x", pady=(0, 6))

        ttk.Button(btns, text="Print", style="Primary.TButton", command=self.print_a4)\
            .pack(fill="x")

        self.totals_ready = True
        self._recalc_totals()
        self._update_scrollregion()

    # ---------- Items row / popup (keep your current behavior) ----------
    def add_item_row(self):
        display_row = len(self.rows) + 1

        code_var = tk.StringVar(value="")
        prod_var = tk.StringVar(value="")
        qty_var = tk.StringVar(value="1")
        disc_var = tk.StringVar(value="0")
        price_var = tk.StringVar(value="0.00")
        amount_var = tk.StringVar(value="0.00")

        no_lbl = ttk.Label(self.items_frame, text=str(display_row))
        no_lbl.grid(row=display_row, column=0, sticky="w", padx=4)

        prod_entry = ttk.Entry(self.items_frame, textvariable=prod_var, width=55)
        prod_entry.grid(row=display_row, column=1, sticky="w", padx=4)

        prod_entry.bind("<KeyRelease>", lambda e, idx=len(self.rows): self._on_product_typing(idx, e))
        prod_entry.bind("<Return>", lambda e, idx=len(self.rows): self._try_fill_product(idx))
        prod_entry.bind("<FocusOut>", lambda e, idx=len(self.rows): self._on_product_focus_out(idx, e))
        prod_entry.bind("<Button-1>", lambda e, idx=len(self.rows): self._show_full_dropdown(idx))
        prod_entry.bind("<Down>", lambda e, idx=len(self.rows): self._show_full_dropdown(idx))

        code_entry = ttk.Entry(self.items_frame, textvariable=code_var, width=10, state="readonly")
        code_entry.grid(row=display_row, column=2, sticky="w", padx=4)

        qty_entry = ttk.Entry(self.items_frame, textvariable=qty_var, width=8)
        qty_entry.grid(row=display_row, column=3, sticky="w", padx=4)

        
        # ... หลัง qty_entry แล้วเพิ่ม Discount Entry
        disc_entry = ttk.Entry(self.items_frame, textvariable=disc_var, width=8)
        disc_entry.grid(row=display_row, column=4, sticky="w", padx=4)
        
        # เลื่อน Unit Price ไป column=5 และ Amount ไป column=6
        price_entry = ttk.Entry(self.items_frame, textvariable=price_var, width=14)
        price_entry.grid(row=display_row, column=5, sticky="w", padx=4)
        
        amount_lbl = ttk.Label(self.items_frame, textvariable=amount_var, width=14)
        amount_lbl.grid(row=display_row, column=6, sticky="e", padx=4)
        
        # bind ให้ recalc เมื่อเปลี่ยน qty/discount/price
        for w in (qty_entry, disc_entry, price_entry):
            w.bind("<KeyRelease>", lambda e: self._recalc_totals())

        self.rows.append({
            "no": display_row,
            "prod_var": prod_var,
            "prod_entry": prod_entry,
            "code_var": code_var,
            "qty_var": qty_var,
            "disc_var": disc_var, 
            "price_var": price_var,
            "amount_var": amount_var,
            "widgets": [no_lbl, prod_entry, code_entry, qty_entry,  disc_entry,price_entry, amount_lbl],
        })

        if getattr(self, "totals_ready", False):
            self._recalc_totals()
            self._update_scrollregion()

    def remove_last_row(self):
        if not self.rows:
            return
        last = self.rows.pop()
        for w in last.get("widgets", []):
            try:
                w.destroy()
            except Exception:
                pass
        for i, row in enumerate(self.rows, start=1):
            row["no"] = i
            try:
                row["widgets"][0].configure(text=str(i))
            except Exception:
                pass
        self._recalc_totals()
        self._update_scrollregion()

    def reset_rows(self):
        while self.rows:
            self.remove_last_row()
        for _ in range(self.DEFAULT_ROWS):
            self.add_item_row()
        self._recalc_totals()
        self._update_scrollregion()

    def _reset_item_row(self, idx: int):
        if idx < 0 or idx >= len(self.rows):
            return
        r = self.rows[idx]
        r["code_var"].set("")
        r["price_var"].set("0.00")
        r["qty_var"].set("1")
        self._recalc_totals()

    # ----- popup -----
    def _ensure_popup(self):
        if hasattr(self, "_popup") and self._popup and self._popup.winfo_exists():
            return
        self._popup = tk.Toplevel(self)
        self._popup.withdraw()
        self._popup.overrideredirect(True)
        self._popup.attributes("-topmost", True)

        self._listbox = tk.Listbox(self._popup, height=8)
        self._listbox.pack(fill="both", expand=True)

        self._listbox.bind("<Double-Button-1>", self._popup_pick)
        self._listbox.bind("<ButtonRelease-1>", self._popup_pick)
        self._listbox.bind("<Return>", self._popup_pick)
        self._listbox.bind("<Escape>", lambda e: self._hide_popup())

    def _hide_popup(self):
        if hasattr(self, "_popup") and self._popup and self._popup.winfo_exists():
            self._popup.withdraw()

    def _show_popup_under_widget(self, widget):
        self._ensure_popup()
        x = widget.winfo_rootx()
        y = widget.winfo_rooty() + widget.winfo_height()
        w = widget.winfo_width()
        self._popup.geometry(f"{w}x180+{x}+{y}")
        self._popup.deiconify()

    def _global_click_hide_popup(self, event=None):
        if not hasattr(self, "_popup") or not self._popup or not self._popup.winfo_exists():
            return
        if not self._popup.winfo_viewable():
            return
        w = event.widget if event is not None else None
        if w == getattr(self, "_listbox", None):
            return
        if w is not None and str(w).startswith(str(self._popup)):
            return
        for r in self.rows:
            if w == r.get("prod_entry"):
                return
        self._hide_popup()

    def _popup_pick(self, event=None):
        idx = getattr(self, "_popup_row_idx", None)
        if idx is None or idx < 0 or idx >= len(self.rows):
            self._hide_popup()
            return

        if event is not None and hasattr(event, "y"):
            i = self._listbox.nearest(event.y)
            if i < 0:
                return
            self._listbox.selection_clear(0, tk.END)
            self._listbox.selection_set(i)
            self._listbox.activate(i)

        sel = self._listbox.curselection()
        if not sel:
            return

        value = self._listbox.get(sel[0])
        self.rows[idx]["prod_var"].set(value)
        self._hide_popup()
        self._try_fill_product(idx)
        try:
            self.rows[idx]["prod_entry"].focus_set()
        except Exception:
            pass

    def _on_product_focus_out(self, idx: int, event=None):
        def _check():
            w = self._safe_focus_get()
            if not hasattr(self, "_popup") or not self._popup or not self._popup.winfo_exists():
                return
            if w == getattr(self, "_listbox", None) or (w is not None and str(w).startswith(str(self._popup))):
                return
            self._hide_popup()
            if 0 <= idx < len(self.rows) and self.rows[idx]["prod_var"].get().strip() == "":
                self._reset_item_row(idx)
        self.after(60, _check)

    def _show_full_dropdown(self, idx: int):
        if idx < 0 or idx >= len(self.rows):
            return
        entry = self.rows[idx].get("prod_entry")
        if entry is None:
            return
        self._ensure_popup()
        self._listbox.delete(0, tk.END)
        for v in (self.product_display_list[:200] if self.product_display_list else []):
            self._listbox.insert(tk.END, v)
        self._popup_row_idx = idx
        self._show_popup_under_widget(entry)

    def _on_product_typing(self, idx: int, event=None):
        if idx < 0 or idx >= len(self.rows):
            return
        row = self.rows[idx]
        entry = row.get("prod_entry")
        if entry is None:
            return

        text = row["prod_var"].get().strip().lower()
        if text == "":
            row["code_var"].set("")
            row["price_var"].set("0.00")
            self._hide_popup()
            self._recalc_totals()
            return

        filtered = [v for v in (self.product_display_list or []) if text in v.lower()]
        if not filtered:
            self._hide_popup()
            return

        self._ensure_popup()
        self._listbox.delete(0, tk.END)
        for v in filtered[:50]:
            self._listbox.insert(tk.END, v)

        self._popup_row_idx = idx
        self._show_popup_under_widget(entry)

    def _try_fill_product(self, idx: int):
        if idx < 0 or idx >= len(self.rows):
            return
        text = self.rows[idx]["prod_var"].get().strip()

        if text == "":
            self._reset_item_row(idx)
            return

        if not self.products_master:
            self._recalc_totals()
            return

        found = None
        code = ""

        if " - " in text:
            code = text.split(" - ", 1)[0].strip()
            for p in self.products_master:
                if p["code"] == code:
                    found = p
                    break

        if not found:
            for p in self.products_master:
                if p["code"].lower() == text.lower():
                    found = p
                    break

        if not found:
            for p in self.products_master:
                if p["name"].strip().lower() == text.lower():
                    found = p
                    break

        if found:
            self.rows[idx]["code_var"].set(found["code"])
            self.rows[idx]["price_var"].set(f'{float(found.get("price_thb", 0.0)):.2f}')
        else:
            self.rows[idx]["code_var"].set("")

        self._recalc_totals()

    def _is_voucher_item(self, desc: str, code: str) -> bool:
        d = (desc or "").strip().lower()
        c = (code or "").strip().upper()
        # เงื่อนไข: ชื่อมี Discount Voucher หรือ code เป็น/ขึ้นต้นด้วย VOU000
        return ("discount voucher" in d) or ("ส่วนลด" in d) or ("คูปอง" in d) or (c.startswith("VOU000"))


    # ---------- Core ----------
    def _collect_items(self, include_empty=False):
        items = []
        for row in self.rows:
            desc = row["prod_var"].get().strip()
            code = row.get("code_var").get().strip() if row.get("code_var") else ""
    
            qty = max(0.0, safe_float(row["qty_var"].get()))
            price = safe_float(row["price_var"].get())  # อนุญาตลบ/บวกได้
            disc = safe_float(row.get("disc_var").get() if row.get("disc_var") else "0")
            disc = max(0.0, min(100.0, disc))
    
            raw_amount = qty * price * (1.0 - disc/100.0)
    
            # ✅ Voucher: บังคับให้เป็น “ลบ” เสมอ ก่อนนำไปคิด VAT/WHT
            if self._is_voucher_item(desc, code):
                amount = -abs(raw_amount)
            else:
                amount = raw_amount
    
            row["amount_var"].set(money(amount))
    
            if include_empty:
                items.append({
                    "no": row["no"],
                    "desc": desc,
                    "code": code,
                    "qty": qty,
                    "disc": disc,
                    "price": price,
                    "amount": amount,
                })
            else:
                if desc and qty > 0:
                    items.append({
                        "no": row["no"],
                        "desc": desc,
                        "code": code,
                        "qty": qty,
                        "disc": disc,
                        "price": price,
                        "amount": amount,
                    })
        return items

    def _make_doc_no(self, doc_type_code: str) -> str:
        prefix_map = {
            "QUOTATION": "QOU-",
            "BILLING": "BIL-",
            "RECEIPT": "REC-",
            "TAX_RECEIPT": "INV-",
        }
        prefix = prefix_map.get(doc_type_code, "DOC-")
        stamp = datetime.datetime.now().strftime("%y%m%d-%H%M")
        return f"{prefix}{stamp}"


    def apply_default_note(self):
        doc_type_code = DOC_CODE_BY_LABEL.get(self.doc_type_var.get().strip(), DEFAULT_DOC_TYPE)
        default_note = get_default_note_by_doc_type(doc_type_code)
    
        if not default_note:
            messagebox.showwarning("Default Note", "No default note for this Doc Type.")
            return
    
        try:
            cur = self.note_text.get("1.0", "end-1c")
        except Exception:
            cur = ""
    
        cur_strip = (cur or "").strip()
    
        try:
            if not cur_strip:
                # ว่าง -> ใส่ default ตรงๆ
                self.note_text.delete("1.0", "end")
                self.note_text.insert("1.0", default_note)
            else:
                # มีอยู่แล้ว -> ต่อท้าย
                # เว้นบรรทัด 1 บรรทัดก่อนต่อ
                if not cur.endswith("\n"):
                    self.note_text.insert("end", "\n")
                self.note_text.insert("end", "\n" + default_note)
        except Exception:
            pass




    
    def _apply_default_note_if_empty(self):
        try:
            cur = self.note_text.get("1.0", "end-1c").strip()
        except Exception:
            cur = ""
        if cur:
            return
    
        doc_type_code = DOC_CODE_BY_LABEL.get(self.doc_type_var.get().strip(), DEFAULT_DOC_TYPE)
        default_note = get_default_note_by_doc_type(doc_type_code)
        if default_note:
            try:
                self.note_text.delete("1.0", "end")
                self.note_text.insert("1.0", default_note)
            except Exception:
                pass

    

    def _on_doc_type_change(self, *_):
        doc_type_code = DOC_CODE_BY_LABEL.get(self.doc_type_var.get().strip(), DEFAULT_DOC_TYPE)
        self.doc_no_var.set(self._make_doc_no(doc_type_code))
    


        # ✅ เติม default note เฉพาะถ้าว่าง (ทุก doc type)
        self._apply_default_note_if_empty()
    
        self._recalc_totals()


    def _on_sale_change(self, *_):
        name = self.sale_name_var.get().strip()
        tel = ""
        for s in (self.sales_master or []):
            if s["sale_name"] == name:
                tel = s.get("tel", "")
                break
        self.sale_tel_var.set(tel)

    def _on_vat_mode_change(self, *_):
        vat_mode_code = VAT_CODE_BY_LABEL.get(self.vat_mode_var.get().strip(), DEFAULT_VAT_MODE)
        if vat_mode_code == "NOVAT":
            self.vat_rate_var.set("0.0")
        else:
            if safe_float(self.vat_rate_var.get()) == 0:
                self.vat_rate_var.set(str(DEFAULT_VAT_RATE))
        self._recalc_totals()

    def _on_wht_mode_change(self, *_):
        wht_mode_code = WHT_CODE_BY_LABEL.get(self.wht_mode_var.get().strip(), DEFAULT_WHT_MODE)
        if wht_mode_code == "NOWHT":
            self.wht_rate_var.set("0.0")
        else:
            if safe_float(self.wht_rate_var.get()) == 0:
                self.wht_rate_var.set(str(DEFAULT_WHT_RATE))
        self._recalc_totals()

    def _recalc_totals(self):
        if not hasattr(self, "wht_label"):
            return
        items = self._collect_items()
        vat_rate = safe_float(self.vat_rate_var.get())
        vat_mode = VAT_CODE_BY_LABEL.get(self.vat_mode_var.get().strip(), DEFAULT_VAT_MODE)
        wht_rate = safe_float(self.wht_rate_var.get())
        wht_mode = WHT_CODE_BY_LABEL.get(self.wht_mode_var.get().strip(), DEFAULT_WHT_MODE)

        fin = compute_finance([it["amount"] for it in items], vat_rate, vat_mode, wht_rate, wht_mode)

        self.subtotal_var.set(money(fin["subtotal_ex_vat"]))
        self.vat_var.set(money(fin["vat_amount"]))
        self.total_var.set(money(fin["total_payable"]))
        self.wht_var.set(money(fin["wht_amount"]))
        self.net_after_wht_var.set(money(fin["net_after_wht"]))

        show_wht = (wht_mode != "NOWHT") and (fin["wht_amount"] > 0.000001)
        if show_wht:
            self.wht_label.grid()
            self.wht_value.grid()
            self.net_label.grid()
            self.net_value.grid()
        else:
            self.wht_label.grid_remove()
            self.wht_value.grid_remove()
            self.net_label.grid_remove()
            self.net_value.grid_remove()

    # ---------- Save PDF / Print ----------
    def _validate_basic(self):
        if not self.cust_name_var.get().strip():
            messagebox.showwarning("Missing", "Please enter Customer Name.")
            return False
        if not self.cust_addr_var.get().strip():
            messagebox.showwarning("Missing", "Please enter Customer Address.")
            return False
        return True

    def save_pdf(self):
        self._recalc_totals()
        if not self._validate_basic():
            return

        default_name = f"{self.doc_no_var.get().strip() or 'DOC'}.pdf"
        save_dir = str(get_pdf_folder())  # ✅ Desktop/BKTAX/02.pdf

        path = filedialog.asksaveasfilename(
            title="Save PDF",
            initialdir=save_dir,
            defaultextension=".pdf",
            initialfile=default_name,
            filetypes=[("PDF files", "*.pdf")]
        )
        if not path:
            return

        self._generate_pdf(path)
        messagebox.showinfo("Saved", f"PDF saved:\n{path}")

    def _generate_pdf(self, path):
        items = self._collect_items()
    
        customer = {
            "name": self.cust_name_var.get().strip(),
            "address": self.cust_addr_var.get().strip(),
            "vat_no": self.cust_vat_var.get().strip(),
            "email": self.cust_email_var.get().strip(),
        }
    
        doc_type_code = DOC_CODE_BY_LABEL.get(
            self.doc_type_var.get().strip(),
            DEFAULT_DOC_TYPE
        )
        vat_mode = VAT_CODE_BY_LABEL.get(
            self.vat_mode_var.get().strip(),
            DEFAULT_VAT_MODE
        )
        wht_mode = WHT_CODE_BY_LABEL.get(
            self.wht_mode_var.get().strip(),
            DEFAULT_WHT_MODE
        )
    
        note_text = ""
        try:
            note_text = self.note_text.get("1.0", "end-1c")
        except Exception:
            note_text = ""
    
        draw_invoice_pdf(
            pdf_path=path,
            company=COMPANY,
            customer=customer,
            invoice_no=self.doc_no_var.get().strip(),
            invoice_date=self.doc_date_var.get().strip() or today_str(),
            items=items,
            vat_rate=safe_float(self.vat_rate_var.get()),
            doc_type_code=doc_type_code,
    
            # ✅ เพิ่มใหม่
            seller_name=self.sale_name_var.get().strip(),
            seller_tel=self.sale_tel_var.get().strip(),   # ← เบอร์ผู้ขาย
            job_name=self.job_name_var.get().strip(),
    
            vat_mode=vat_mode,
            wht_rate=safe_float(self.wht_rate_var.get()),
            wht_mode=wht_mode,
    
            note_text=note_text,   # ← Note
        )
    
        self.last_pdf_path = path


    def print_a4(self):
        self._recalc_totals()
        if not self._validate_basic():
            return

        fd, tmp_path = tempfile.mkstemp(prefix="bktax_", suffix=".pdf")
        os.close(fd)
        self._generate_pdf(tmp_path)

        try:
            if sys.platform.startswith("win"):
                os.startfile(tmp_path, "print")  # type: ignore
                messagebox.showinfo("Print", "Sent to default printer (Windows).")
            else:
                if sys.platform == "darwin":
                    os.system(f'open "{tmp_path}"')
                else:
                    os.system(f'xdg-open "{tmp_path}"')
                messagebox.showinfo("Print", "Opened PDF. Please print from your PDF viewer.")
        except Exception as e:
            messagebox.showerror("Print error", str(e))


if __name__ == "__main__":
    try:
        import reportlab  # noqa
    except Exception:
        messagebox.showerror("Missing package", "Please install reportlab:\n\npip install reportlab")
        raise


    # ✅ CHECK EXPIRE (ก่อนเปิด GUI)
    check_app_expiry_or_exit()

    app = BKTAX()
    app.mainloop()



# In[ ]:




