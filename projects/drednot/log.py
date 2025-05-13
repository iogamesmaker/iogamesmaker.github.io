import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import requests
import gzip
import json
from io import BytesIO
from datetime import datetime, timedelta
import os
from collections import defaultdict
import threading
import queue

ITEM_DB = [
    [1, "Iron"],
    [2, "Explosives"],
    [4, "Rubber"],
    [5, "Flux"],
    [6, "Fuel"],
    [49, "Compressed Explosives"],
    [50, "Compressed Iron"],
    [51, "Volleyball"],
    [52, "Golden Volleyball"],
    [53, "Basketball"],
    [54, "Golden Basketball"],
    [55, "Beachball"],
    [56, "Football"],
    [100, "Wrench"],
    [101, "Shredder"],
    [102, "Golden Shredder"],
    [103, "Repair Tool"],
    [104, "Handheld Pusher"],
    [105, "Shield Booster"],
    [106, "Embiggener"],
    [107, "Shrinkinator"],
    [108, "Backpack"],
    [109, "Speed Skates"],
    [110, "Booster Boots"],
    [111, "Launcher Gauntlets"],
    [112, "Construction Gauntlets"],
    [113, "Rocketpack"],
    [114, "Hoverpack"],
    [115, "Manifest"],
    [116, "BOM"],
    [120, "Blueprint Scanner"],
    [122, "RCD"],
    [123, "Shield Core"],
    [150, "Standard Ammo"],
    [151, "Scattershot Ammo"],
    [152, "Flak Ammo"],
    [153, "Sniper Ammo"],
    [154, "Punch Ammo"],
    [155, "Yank Ammo"],
    [156, "Slug Ammo"],
    [159, "Booster Fuel (low)"],
    [160, "Booster Fuel (high)"],
    [162, "Rapid Fire"],
    [163, "Rapid Fire Depleted"],
    [164, "Preservation"],
    [165, "Preservation Depleted"],
    [166, "Cooling Cell"],
    [167, "Hot Cooling Cell"],
    [168, "Burst Charge"],
    [215, "Helm"],
    [217, "Comms"],
    [218, "Sign"],
    [219, "Spawn"],
    [220, "Door"],
    [221, "Cargo Hatch"],
    [223, "Cargo Ejector"],
    [224, "Turret Controller"],
    [226, "Cannon"],
    [228, "Burst"],
    [229, "Machine"],
    [230, "Thruster"],
    [232, "Iron block"],
    [233, "Rubber block"],
    [234, "Ice"],
    [235, "Ladder"],
    [236, "Walkway"],
    [237, "Item net"],
    [239, "Paint"],
    [240, "Expando box"],
    [241, "Safety anchor"],
    [242, "Pusher"],
    [243, "Item launcher"],
    [245, "Recycler"],
    [246, "Legacy"],
    [248, "Munitions fabricator"],
    [249, "Engineering fabricator"],
    [251, "Equipment fabricator"],
    [252, "Loader"],
    [253, "Lockdown override unit"],
    [255, "Fluid Tank"],
    [256, "Shield Generator"],
    [257, "Shield Projector"],
    [258, "Enhanced Turret Controller"],
    [262, "Logistic Rail"],
    [263, "Acute"],
    [264, "MSU"],
    [265, "Obtuse"],
    [305, "Golden Null"],
    [307, "Silver Null"],
    [306, "Bug Hunter"],
    [326, "Closed lootbox"],
    [327, "Open lootbox"],
]

class DrednotDataDownloader:
    def __init__(self, root):
        self.root = root
        self.root.title("Econ log thing demo version")

        self.root.rowconfigure(5, weight=1)
        self.root.columnconfigure(0, weight=1)

        self.ships_data = []
        self.log_data = []
        self.all_items = [f"{item[0]}: {item[1]}" for item in ITEM_DB]
        self.filtered_items = self.all_items.copy()
        self.show_bots = tk.BooleanVar(value=True)

        self.download_queue = queue.Queue()
        self.download_in_progress = False

        self.filter_item_var = tk.StringVar()
        self.filter_source_var = tk.StringVar()
        self.filter_dest_var = tk.StringVar()

        self.date_year_var = tk.StringVar(value="2025")
        self.date_month_var = tk.StringVar(value="4")
        self.date_day_var = tk.StringVar(value="12")

        self.ship_names = {}

        self.create_widgets()

    def create_widgets(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        main_frame.columnconfigure(1, weight=1)

        ttk.Label(main_frame, text="Date:").grid(row=0, column=0, padx=5, pady=5, sticky="w")

        date_frame = ttk.Frame(main_frame)
        date_frame.grid(row=0, column=0, padx=5, pady=5, sticky="nw")

        ttk.Spinbox(date_frame, from_=2022, to=datetime.now().year,
                  textvariable=self.date_year_var, width=5).pack(side="left")
        ttk.Spinbox(date_frame, from_=1, to=12,
                  textvariable=self.date_month_var, width=3).pack(side="left")
        ttk.Spinbox(date_frame, from_=1, to=31,
                  textvariable=self.date_day_var, width=3).pack(side="left")

        ttk.Button(main_frame, text="Download Data", command=self.download_data).grid(row=0, column=1, padx=5, sticky="w")

        self.status_var = tk.StringVar(value="Ready to download")
        ttk.Label(main_frame, textvariable=self.status_var).grid(row=0, column=1, columnspan=3, pady=5, padx=10)

        filter_frame = ttk.Frame(main_frame)
        filter_frame.grid(row=4, column=0, columnspan=2, pady=5, sticky="ew")
        filter_frame.columnconfigure(1, weight=1)

        ttk.Label(filter_frame, text="Item Filter:").grid(row=0, column=0, padx=5, sticky="w")
        self.search_combo = ttk.Combobox(filter_frame, textvariable=self.filter_item_var,
                                      values=self.filtered_items)
        self.search_combo.grid(row=0, column=1, padx=5, sticky="ew")
        self.search_combo.bind('<Return>', lambda e: self.root.after(50, self.update_filter))
        self.search_combo.bind("<<ComboboxSelected>>", lambda e: self.update_display())

        ttk.Label(filter_frame, text="Source Filter:").grid(row=1, column=0, padx=5, sticky="w")
        self.source_entry = ttk.Entry(filter_frame, textvariable=self.filter_source_var)
        self.source_entry.grid(row=1, column=1, padx=5, sticky="ew")
        self.source_entry.bind('<KeyRelease>', lambda e: self.update_display())

        ttk.Label(filter_frame, text="Destination Filter:").grid(row=2, column=0, padx=5, sticky="w")
        self.dest_entry = ttk.Entry(filter_frame, textvariable=self.filter_dest_var)
        self.dest_entry.grid(row=2, column=1, padx=5, sticky="ew")
        self.dest_entry.bind('<KeyRelease>', lambda e: self.update_display())

        ttk.Checkbutton(filter_frame, text="Hide Bot Transactions", variable=self.show_bots,
                      command=self.update_display).grid(row=3, column=0, columnspan=2, pady=5, sticky="w")

        preview_frame = ttk.Frame(main_frame)
        preview_frame.grid(row=5, column=0, columnspan=2, sticky="nsew", pady=5)
        preview_frame.columnconfigure(0, weight=1)
        preview_frame.rowconfigure(0, weight=1)

        text_frame = ttk.Frame(preview_frame)
        text_frame.grid(row=0, column=0, sticky="nsew")
        text_frame.columnconfigure(0, weight=1)
        text_frame.rowconfigure(0, weight=1)

        self.preview_text = tk.Text(text_frame, state="disabled")
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=self.preview_text.yview)
        self.preview_text.configure(yscrollcommand=scrollbar.set)

        self.preview_text.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")

        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=6, column=0, columnspan=2, pady=5)

        ttk.Button(button_frame, text="Lookup Ship Name", command=self.lookup_ship_name).pack(side="left", padx=5)
        ttk.Button(button_frame, text="Show Data", command=self.show_formatted_data).pack(side="left", padx=5)
        ttk.Button(button_frame, text="Export to TXT", command=self.export_to_txt).pack(side="left", padx=5)

    def show_formatted_data(self):
        if not self.log_data:
            messagebox.showwarning("Warning", "No data available to display")
            return

        content = self.get_filtered_data_as_text()

        if not content.strip():
            messagebox.showwarning("Warning", "No data matches current filters")
            return

        data_window = tk.Toplevel(self.root)
        data_window.title("Formatted Transaction Data")

        text_frame = ttk.Frame(data_window)
        text_frame.pack(fill="both", expand=True, padx=10, pady=10)

        text_widget = tk.Text(text_frame, wrap="word")
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=text_widget.yview)
        text_widget.configure(yscrollcommand=scrollbar.set)

        text_widget.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        text_widget.insert("1.0", content)
        text_widget.config(state="disabled")

        ttk.Button(data_window, text="Close", command=data_window.destroy).pack(pady=10)

    def download_data(self):
        if not self.validate_date():
            return

        if self.download_in_progress:
            messagebox.showwarning("Warning", "Download already in progress")
            return

        self.ships_data = []
        self.log_data = []
        self.ship_names = {}

        selected_date = datetime(
            int(self.date_year_var.get()),
            int(self.date_month_var.get()),
            int(self.date_day_var.get())
        )
        date_str = f"{selected_date.year}_{selected_date.month}_{selected_date.day}"

        self.status_var.set("Downloading data...")
        self.download_in_progress = True

        download_thread = threading.Thread(
            target=self.download_data_thread,
            args=([date_str],),
            daemon=True
        )
        download_thread.start()

        self.root.after(100, self.check_download_progress)

    def download_data_thread(self, dates_to_process):
        try:
            for i, date_str in enumerate(dates_to_process):
                if not self.download_in_progress:
                    break

                day_ships_data, day_log_data, day_ship_names = self.download_single_day(date_str)

                result_data = (
                    day_ships_data,
                    day_log_data,
                    day_ship_names,
                    i + 1,
                    len(dates_to_process)
                )
                self.download_queue.put(result_data)

            self.download_queue.put("COMPLETE")

        except Exception as e:
            self.download_queue.put(("ERROR", str(e)))

    def check_download_progress(self):
        try:
            while True:
                try:
                    data = self.download_queue.get_nowait()

                    if data == "COMPLETE":
                        self.download_complete()
                        break
                    elif isinstance(data, tuple) and data[0] == "ERROR":
                        self.download_error(data[1])
                        break
                    elif isinstance(data, tuple) and len(data) == 5:
                        day_ships_data, day_log_data, day_ship_names, progress, total = data

                        self.ships_data.extend(day_ships_data)
                        self.log_data.extend(day_log_data)
                        self.ship_names.update(day_ship_names)

                        self.status_var.set("Downloading data...")

                except queue.Empty:
                    break

        except Exception as e:
            self.download_error(str(e))

        if self.download_in_progress:
            self.root.after(100, self.check_download_progress)

    def download_complete(self):
        self.download_in_progress = False
        self.status_var.set("Download complete!")
        messagebox.showinfo("Success", "Data downloaded successfully!")
        self.update_display()

    def download_error(self, error_msg):
        self.download_in_progress = False
        messagebox.showerror("Error", f"Download failed: {error_msg}")
        self.status_var.set("Download failed")

    def download_single_day(self, date_str):
        base_url = "https://pub.drednot.io/prod/econ"
        ships_url = f"{base_url}/{date_str}/ships.json.gz"
        log_url = f"{base_url}/{date_str}/log.json.gz"

        try:
            response = requests.get(ships_url, stream=True, timeout=30)
            response.raise_for_status()

            with gzip.GzipFile(fileobj=BytesIO(response.content)) as f:
                day_ships_data = json.load(f)
                day_ship_names = {ship["hex_code"].upper(): ship.get("name", "Unknown")
                                for ship in day_ships_data if "hex_code" in ship}

            response = requests.get(log_url, stream=True, timeout=30)
            response.raise_for_status()

            with gzip.GzipFile(fileobj=BytesIO(response.content)) as f:
                day_log_data = json.load(f)

            return day_ships_data, day_log_data, day_ship_names

        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to download data for {date_str}: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to process data for {date_str}: {str(e)}")

    def lookup_ship_name(self):
        if not self.ship_names:
            messagebox.showwarning("Warning", "No ship data available. Download data first.")
            return

        lookup_window = tk.Toplevel(self.root)
        lookup_window.title("Ship Name Lookup")

        ttk.Label(lookup_window, text="Enter Ship Hex ID:").pack(pady=10)

        hex_entry = ttk.Entry(lookup_window)
        hex_entry.pack(pady=5)
        hex_entry.focus_set()

        result_var = tk.StringVar()
        ttk.Label(lookup_window, textvariable=result_var).pack(pady=10)

        def do_lookup():
            hex_id = hex_entry.get().strip().upper().replace('{', '').replace('}', '')
            if not hex_id:
                result_var.set("Please enter a ship ID")
                return

            if hex_id in self.ship_names:
                result_var.set(f"Ship Name: {self.ship_names[hex_id]}")
            else:
                result_var.set(f"No ship found with ID: {hex_id}")

        ttk.Button(lookup_window, text="Lookup", command=do_lookup).pack(pady=5)
        hex_entry.bind('<Return>', lambda e: do_lookup())

    def export_to_txt(self):
        if not self.log_data:
            messagebox.showwarning("Warning", "No data available to export")
            return

        content = self.get_filtered_data_as_text()

        if not content.strip():
            messagebox.showwarning("Warning", "No data matches current filters")
            return

        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            title="Save transaction data"
        )

        if not file_path:
            return

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            messagebox.showinfo("Success", f"Data successfully exported to {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export data: {str(e)}")

    def get_filtered_data_as_text(self):
        """Return the filtered data as formatted text"""
        # Get filter values
        item_filter = self.filter_item_var.get()
        source_filter = self.filter_source_var.get().lower()
        dest_filter = self.filter_dest_var.get().lower()
        hide_bots = self.show_bots.get()  # True means hide non-ship transactions

        # Parse item filter if set
        item_id = None
        if item_filter:
            try:
                item_id = int(item_filter.split(":")[0])
            except (ValueError, IndexError):
                pass

        # Group transactions by item
        grouped = defaultdict(lambda: defaultdict(int))

        for entry in self.log_data:
            if not isinstance(entry, dict):
                continue

            current_item = entry.get("item")
            current_src = entry.get("src", "?")
            current_dst = entry.get("dst", "?")
            count = entry.get("count", 1)

            # Apply filters
            if hide_bots:
                # Hide if either source or destination doesn't look like a ship ID (in curly braces)
                if not (current_src.startswith('{') and current_src.endswith('}') and
                        current_dst.startswith('{') and current_dst.endswith('}')):
                    continue
            if item_id is not None and current_item != item_id:
                continue

            # Check source filter against either ID or name
            if source_filter:
                src_clean = current_src.replace('{', '').replace('}', '')
                src_name = self.ship_names.get(src_clean, "").lower()
                if not (source_filter in current_src.lower() or
                        source_filter in src_name):
                    continue

            # Check destination filter against either ID or name
            if dest_filter:
                dst_clean = current_dst.replace('{', '').replace('}', '')
                dst_name = self.ship_names.get(dst_clean, "").lower()
                if not (dest_filter in current_dst.lower() or
                        dest_filter in dst_name):
                    continue

            # Group by item and transaction pair
            grouped[current_item][(current_src, current_dst)] += count

        # Format the results as text
        output = []
        for item_id, transactions in grouped.items():
            item_name = next((name for id, name in ITEM_DB if id == item_id), str(item_id))
            output.append(f"\n=== {item_name} ===")

            # Sort transactions by count in descending order
            sorted_transactions = sorted(transactions.items(), key=lambda x: x[1], reverse=True)

            for (src, dst), count in sorted_transactions:
                # Get ship names if available
                src_clean = src.replace('{', '').replace('}', '')
                dst_clean = dst.replace('{', '').replace('}', '')

                src_name = self.ship_names.get(src_clean, "")
                dst_name = self.ship_names.get(dst_clean, "")

                name_info = ""
                if src_name or dst_name:
                    name_info = " ("
                    if src_name:
                        name_info += f"src: {src_name}"
                    if src_name and dst_name:
                        name_info += ", "
                    if dst_name:
                        name_info += f"dst: {dst_name}"
                    name_info += ")"

                output.append(f"{count} went from {src} to {dst}{name_info}")

        return "\n".join(output)

    def update_display(self):
        if not self.log_data:
            return

        content = self.get_filtered_data_as_text()

        self.preview_text.config(state="normal")
        self.preview_text.delete(1.0, tk.END)

        if not content.strip():
            self.preview_text.insert(tk.END, "No transactions match the current filters")
        else:
            self.preview_text.insert(tk.END, content)

        self.preview_text.config(state="disabled")

    def validate_date(self):
        """Validate the selected date range"""
        try:
            date = datetime(
                int(self.date_year_var.get()),
                int(self.date_month_var.get()),
                int(self.date_day_var.get())
            )

            min_date = datetime(2022, 11, 23)
            max_date = datetime.now()

            if date < min_date:
                messagebox.showerror("Error", "Dates must be on or after 2022-11-23")
                return False

            if date > max_date:
                messagebox.showerror("Error", "Dates cannot be in the future")
                return False

            return True
        except ValueError:
            messagebox.showerror("Error", "Invalid date")
            return False

    def update_filter(self):
        current_text = self.filter_item_var.get()
        cursor_pos = self.search_combo.index(tk.INSERT)

        if current_text == '':
            self.filtered_items = self.all_items.copy()
        else:
            self.filtered_items = [item for item in self.all_items
                                if current_text.lower() in item.lower()]

        self.search_combo['values'] = self.filtered_items

        # Save selection state
        has_selection = bool(self.search_combo.selection_present())

        # Update the combobox
        self.search_combo.icursor(cursor_pos)

        # Restore selection if there was one
        if has_selection:
            self.search_combo.selection_range(0, tk.END)

        # Only trigger dropdown if there are matching items
        if self.filtered_items:
            self.search_combo.event_generate('<Down>')

if __name__ == "__main__":
    root = tk.Tk()
    app = DrednotDataDownloader(root)
    root.mainloop()

