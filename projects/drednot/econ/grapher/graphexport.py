import gzip
import json
import os
import sys
import re
from datetime import datetime
from pathlib import Path

def main():
    base_path = Path.home() / ".local/share/DredarkLogScourer/drednot_data_raw"
    output_file = Path("ship_names.json")

    print(f"🔍 Scanning for ship data in: {base_path}")
    if not base_path.exists():
        print(f"❌ Error: Data directory not found at {base_path}")
        sys.exit(1)

    # 1) Find & parse only valid YYYY_M_D folders
    date_pattern = re.compile(r'^(\d{4})_(\d{1,2})_(\d{1,2})$')
    parsed_dirs = []
    for d in base_path.iterdir():
        m = date_pattern.match(d.name)
        if d.is_dir() and m:
            year, month, day = map(int, m.groups())
            parsed_dirs.append((datetime(year, month, day), d))

    if not parsed_dirs:
        print("❌ No date directories found")
        sys.exit(1)

    # 2) Sort chronologically
    parsed_dirs.sort(key=lambda x: x[0])

    # 3) (Optional) Filter out future dates
    today = datetime.now().date()
    parsed_dirs = [(dt, d) for dt, d in parsed_dirs if dt.date() <= today]

    print(f"📅 Found {len(parsed_dirs)} days of data up to {today}")

    ship_data = {}
    processed_dates = 0
    total_ships = 0

    # Process each day in true date order
    for date_obj, date_dir in parsed_dirs:
        date_str = date_obj.strftime('%Y_%m_%d')
        ships_file = date_dir / "ships.json.gz"

        if not ships_file.exists():
            print(f"⚠️  Missing ships file for {date_str}")
            continue

        try:
            print(f"⏳ Processing {date_str}...", end=" ", flush=True)
            with gzip.open(ships_file, "rb") as f:
                ships = json.load(f)

            daily_ships = {
                ship["hex_code"].upper().strip("{}"): ship["name"].strip()
                for ship in ships
                if ship.get("hex_code")
            }

            count = len(daily_ships)
            ship_data[date_str] = daily_ships
            total_ships += count
            processed_dates += 1
            print(f"✅ Found {count} ships")

        except Exception as e:
            print(f"❌ Error processing {date_str}: {e}")

    # Save
    print(f"\n💾 Saving data to {output_file}...")
    with open(output_file, "w") as f:
        json.dump(ship_data, f, indent=2)

    size_mb = output_file.stat().st_size / 1_000_000
    print(f"""
🚀 Successfully exported:
   - {processed_dates} days processed
   - {total_ships} total ship entries
   - {len(ship_data)} days with valid data
   - Output file size: {size_mb:.2f} MB
""")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Operation cancelled by user")
        sys.exit(130)
