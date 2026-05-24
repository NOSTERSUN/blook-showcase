#!/usr/bin/env python3
"""
BLOOK Living - Review Crawler
Crawls customer reviews from Shopee and TikTok
Saves images to Customer Review folder
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BLOOKReviewCrawler:
    def __init__(self):
        self.base_path = Path(r"C:\Users\PC\Desktop\BLOOK DEV\Customer Review")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def setup_folders(self):
        """Create folder structure for reviews"""
        folders = [
            'Reed Diffuser',
            'Pillow',
            'Sofa',
            'Gift Set',
            'TikTok Reviews'
        ]

        for folder in folders:
            folder_path = self.base_path / folder
            folder_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"✓ Folder created: {folder_path}")

    def crawl_shopee_reviews(self, shopee_url, product_name):
        """
        Crawl reviews from Shopee product URL
        Note: Shopee has dynamic content, requires Selenium for full functionality
        """
        try:
            logger.info(f"🔍 Crawling Shopee reviews for: {product_name}")
            logger.info(f"📌 URL: {shopee_url}")

            # For Shopee, we'd need Selenium due to JavaScript rendering
            # This is a placeholder for manual setup
            print("\n⚠️  Shopee Crawling Instructions:")
            print("=" * 50)
            print(f"Product: {product_name}")
            print(f"URL: {shopee_url}")
            print("\nSince Shopee uses JavaScript rendering:")
            print("1. Open the Shopee link in your browser")
            print("2. Scroll to Reviews section")
            print("3. Right-click images → Save image as")
            print("4. Save to: Customer Review/{product_name}/")
            print("5. Or use: pip install selenium")
            print("   Then run the script with --selenium flag")
            print("=" * 50 + "\n")

        except Exception as e:
            logger.error(f"❌ Error crawling Shopee: {e}")

    def crawl_tiktok_reviews(self, tiktok_url):
        """
        Crawl reviews/videos from TikTok
        Note: TikTok has strong anti-bot protection
        """
        try:
            logger.info(f"🔍 Crawling TikTok: {tiktok_url}")

            print("\n⚠️  TikTok Crawling Instructions:")
            print("=" * 50)
            print(f"URL: {tiktok_url}")
            print("\nDue to TikTok's strong anti-bot protection:")
            print("1. Install: pip install TikTokApi")
            print("2. Or manually download videos using yt-dlp:")
            print("   pip install yt-dlp")
            print("   yt-dlp [TIKTOK_URL] -o 'output.mp4'")
            print("3. Extract frames using FFmpeg")
            print("4. Or use online TikTok downloader tools")
            print("=" * 50 + "\n")

        except Exception as e:
            logger.error(f"❌ Error crawling TikTok: {e}")

    def download_image(self, url, filename, folder):
        """Download and save image"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            folder_path = self.base_path / folder
            file_path = folder_path / filename

            with open(file_path, 'wb') as f:
                f.write(response.content)

            logger.info(f"✓ Downloaded: {filename}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to download {filename}: {e}")
            return False

    def manual_add_review(self, product_category, image_paths):
        """
        Manually add reviews when you have image paths
        Usage: crawler.manual_add_review('Pillow', ['path/to/image1.jpg', 'path/to/image2.jpg'])
        """
        try:
            folder_path = self.base_path / product_category
            folder_path.mkdir(parents=True, exist_ok=True)

            for i, image_path in enumerate(image_paths, 1):
                src = Path(image_path)
                if src.exists():
                    # Rename to sequential naming
                    ext = src.suffix
                    dst = folder_path / f"review_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}{ext}"

                    # Copy file
                    import shutil
                    shutil.copy2(src, dst)
                    logger.info(f"✓ Added review: {dst}")
                else:
                    logger.warning(f"⚠️  File not found: {image_path}")

        except Exception as e:
            logger.error(f"❌ Error adding review: {e}")

    def print_instructions(self):
        """Print setup instructions"""
        print("""
╔════════════════════════════════════════════════════════════╗
║         BLOOK Living - Review Crawler Setup Guide          ║
╚════════════════════════════════════════════════════════════╝

📦 INSTALLATION:
   pip install requests pillow yt-dlp selenium

🛍️  SHOPEE REVIEWS:
   1. Go to: https://shopee.co.th/blookliving
   2. Find product page
   3. Scroll to "ความเห็นของผู้ซื้อ" (Customer Reviews)
   4. Right-click images → Save image as
   5. Save to: C:\\Users\\PC\\Desktop\\BLOOK DEV\\Customer Review\\[Product]\\

   Products: Reed Diffuser, Pillow, Sofa, Gift Set

🎵 TIKTOK REVIEWS:
   Method 1: yt-dlp (fastest)
   -------
   yt-dlp "https://www.tiktok.com/@blookliving/video/..." -o "%(title)s.%(ext)s"

   Method 2: Online Tools
   -------
   Use: https://ssstiktok.com or similar

   Method 3: Selenium Script (advanced)
   -------
   python crawl_reviews.py --selenium --tiktok "https://..."

📁 FOLDER STRUCTURE:
   Customer Review/
   ├── Reed Diffuser/     (images from Shopee)
   ├── Pillow/            (images from Shopee)
   ├── Sofa/              (images from Shopee)
   ├── Gift Set/          (images from Shopee)
   └── TikTok Reviews/    (images/screenshots from TikTok)

⚙️  QUICK START:

   # Setup folders
   python crawl_reviews.py --setup

   # Add reviews manually
   python crawl_reviews.py --add-folder "Pillow" --images "image1.jpg" "image2.jpg"

🔗 SHOPEE LINKS:
   Reed Diffuser 250ml: https://shopee.co.th/search?keyword=blook%20reed%20diffuser
   Pillow:              https://shopee.co.th/search?keyword=blook%20pillow
   Sofa:                https://shopee.co.th/search?keyword=blook%20sofa
   Gift Set:            https://shopee.co.th/search?keyword=blook%20gift

🔗 TIKTOK:
   Channel: @blookliving
   https://www.tiktok.com/@blookliving

📝 NOTES:
   • Shopee requires manual screenshot (JavaScript rendering issue)
   • TikTok requires either manual download or API key
   • Images must be in format: product_name_1.jpg, product_name_2.jpg, etc.
   • All images will be organized in Customer Review folder
   • Recommended: Use online image editors to crop/enhance reviews

        """)

def main():
    import argparse

    parser = argparse.ArgumentParser(description='BLOOK Living Review Crawler')
    parser.add_argument('--setup', action='store_true', help='Create folder structure')
    parser.add_argument('--add-folder', type=str, help='Folder name to add reviews to')
    parser.add_argument('--images', nargs='+', help='Image file paths to add')
    parser.add_argument('--instructions', action='store_true', help='Show instructions')
    parser.add_argument('--shopee', type=str, help='Shopee product URL')
    parser.add_argument('--tiktok', type=str, help='TikTok URL')

    args = parser.parse_args()

    crawler = BLOOKReviewCrawler()

    if args.instructions:
        crawler.print_instructions()

    if args.setup:
        logger.info("📁 Setting up folder structure...")
        crawler.setup_folders()
        logger.info("✅ Setup complete!")

    if args.add_folder and args.images:
        logger.info(f"📸 Adding {len(args.images)} images to {args.add_folder}...")
        crawler.manual_add_review(args.add_folder, args.images)
        logger.info("✅ Reviews added!")

    if args.shopee:
        crawler.crawl_shopee_reviews(args.shopee, "Shopee Product")

    if args.tiktok:
        crawler.crawl_tiktok_reviews(args.tiktok)

    if not any([args.setup, args.add_folder, args.shopee, args.tiktok, args.instructions]):
        crawler.print_instructions()

if __name__ == '__main__':
    main()
