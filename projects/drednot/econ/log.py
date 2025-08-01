import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import gzip
import time
import json
from datetime import datetime, timedelta
import os
import re
import csv
from collections import defaultdict
import threading
import queue
import sys
import gc
import platform
import requests
import psutil
import webbrowser

max_mem_gb = 3.5

def set_memory_limit():
    max_mem_bytes = 1024 * 1024 * round(1024 * max_mem_gb)

    if platform.system() == 'Linux':
        import resource

        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        resource.setrlimit(resource.RLIMIT_AS, (max_mem_bytes, hard))
    elif platform.system() == 'Windows':

        print(f"Warning: Memory limiting not working for {platform.system()} - careful you dont crash!")
        pass
    else:
        print(f"Warning: Memory limiting not working for {platform.system()} - careful you dont crash!")

manual_item_values = {
    "Iron": 0.0625,
    "Explosives": 0.05,
    "Hyper Rubber": 0.5,
    "Flux Crystals": 1.0,
    "Compressed Explosives": 0.8,
    "Compressed Iron": 1.0,
    "Volleyball": 8.0,
    "Basketball": 8.0,
    "Beach Ball": 8.0,
    "Football": 8.0,
    "Golden Item Shredder": 90000.0,
    "Backpack": 1.0,
    "Manifest Scanner": 48.0,
    "BoM Scanner": 48.0,
    "Blueprint Scanner": 4.0,
    "Flux RCD": 32.0,
    "Shield Core": 0.0625,
    "Cannon (Packaged)": 1.5,
    "Burst Cannon (Packaged)": 4.0,
    "Machine Cannon (Packaged)": 32.0,
    "Thruster (Starter, Packaged)": 0.0,
    "Hyper Ice Block": 0.125,
    "DEPRECATED ITEM": 2.5,
    "Fabricator (Legacy, Packaged)": 45000.0,
    "Shield Generator": 0.5,
    "Shield Projector": 16.0,
    "Acute Cannon (Packaged)": 2.0,
    "Munitions Supply Unit (Packaged)": 1.0,
    "Obtuse Cannon (Packaged)": 2.0,
    "Gold Null Trophy": 1000000.0,
    "Silver Null Trophy": 250000.0,
    "Elimination Loot Box": 16.0,
    "Elimination Loot Box (Locked)": 16.0,
}

class EconLogScourer:
    def __init__(self, root):
        self.root = root
        self.root.title("Dredark Log Scourer v 1.5.4")

        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.root.rowconfigure(0, weight=1)
        self.root.columnconfigure(0, weight=1)

        self.raw_data = []
        self.filtered_data = []
        self.ship_names = {}
        self.ships_present_on_date = defaultdict(set)

        self.base_path = ""

        if platform.system() == 'Windows':
            base_path = os.path.join(os.getenv('LOCALAPPDATA'), 'DredarkLogScourer')
        else:
            base_path = os.path.join(os.path.expanduser('~'), '.local', 'share', 'DredarkLogScourer')
        print(f"Data log files will be saved to {base_path}. Everything you do in this program will be temporary unless you press export.")

        self.local_data_dir = os.path.join(base_path, "drednot_data_raw")
        os.makedirs(self.local_data_dir, exist_ok=True)

        self.shareware_pref_file = os.path.join(base_path, "shareware_pref.json")
        self.do_not_show_shareware = tk.BooleanVar(value=False)
        self.load_shareware_preference()

        if not os.path.exists(os.path.join(self.local_data_dir, "item_schema.json")):
            self.fetch_item_schema()

        self.load_item_schema()
        self.all_items = [f"{item['id']}: {item['name']}" for item in self.item_list]
        self.filtered_items = self.all_items.copy()
        self.show_bots = tk.BooleanVar(value=True)
        self.text_size_var = tk.IntVar(value=10)
        self.wrap_text_var = tk.BooleanVar(value=False)
        self.use_ship_names = tk.BooleanVar(value=False)

        self._last_dates_processed = []
        self.status_var = tk.StringVar(value="Initializing...")

        self.download_queue = queue.Queue()
        self.cancel_event = threading.Event()

        self.current_operation = "none"
        self.loading_thread = None

        self.filter_item_var = tk.StringVar()
        self.filter_source_var = tk.StringVar()
        self.filter_dest_var = tk.StringVar()

        self.start_year_var = tk.StringVar(value="2022")
        self.start_month_var = tk.StringVar(value="11")
        self.start_day_var = tk.StringVar(value="23")
        self.end_year_var = tk.StringVar(value="2022")
        self.end_month_var = tk.StringVar(value="11")
        self.end_day_var = tk.StringVar(value="23")

        self.create_widgets()
        self.configure_text_tags()
        self.apply_display_settings()
        self.check_and_download_data()

        self.root.after(200, self.show_shareware_popup)

    def load_shareware_preference(self):
        if os.path.exists(self.shareware_pref_file):
            try:
                with open(self.shareware_pref_file, 'r') as f:
                    pref_data = json.load(f)
                    self.do_not_show_shareware.set(pref_data.get("do_not_show_shareware", False))
            except Exception as e:
                print(f"Error loading shareware preference: {e}")
                self.do_not_show_shareware.set(False)

    def save_shareware_preference(self):
        try:
            with open(self.shareware_pref_file, 'w') as f:
                json.dump({"do_not_show_shareware": self.do_not_show_shareware.get()}, f)
        except Exception as e:
            print(f"error saving shareware thing: {e}")

    def show_shareware_popup(self):
        if self.do_not_show_shareware.get():
            return

        popup = tk.Toplevel(self.root)
        popup.title("Shareware Notice")
        popup.transient(self.root)
        popup.grab_set()
        popup.resizable(False, False)

        frame = ttk.Frame(popup, padding="20")
        frame.pack(fill="both", expand=True)

        message = (
            "This tool is shareware! If you paid for this, you got scammed.\nFeel free to modify this tool, and redistribute it. Just don't make too much flux off of my work.'\n"
            "Credit to @iogamesplayer\n"
        )
        ttk.Label(frame, text=message, wraplength=350, justify="center").pack(pady=(0, 10))

        link_label = ttk.Label(frame, text="https://iogamesplayer.com/projects/drednot/econ/",
                               foreground="blue", cursor="hand2")
        link_label.pack(pady=(0, 10))
        link_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://iogamesplayer.com/projects/drednot/econ/"))

        do_not_show_again_checkbox = ttk.Checkbutton(
            frame,
            text="Do not show this message again",
            variable=self.do_not_show_shareware,
            command=self.save_shareware_preference
        )
        do_not_show_again_checkbox.pack(pady=(10, 0))

        ok_button = ttk.Button(frame, text="OK", command=popup.destroy)
        ok_button.pack(pady=(20, 0))

        popup.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (popup.winfo_width() // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (popup.winfo_height() // 2)
        popup.geometry(f"+{x}+{y}")

    def configure_text_tags(self):
        self.preview_text.tag_configure("even", background="#FFFFFF")
        self.preview_text.tag_configure("odd", background="#F8F8F8")

        if hasattr(self, 'result_text'):
            self.result_text.tag_configure("even", background="#FFFFFF")
            self.result_text.tag_configure("odd", background="#F8F8F8")

        self.preview_text.tag_raise("sel")

    def check_and_download_data(self):
        if not os.path.exists(self.local_data_dir):
            os.makedirs(self.local_data_dir)

        existing_dates = set()
        for entry in os.listdir(self.local_data_dir):

            if '_' in entry and entry.count('_') == 2 and os.path.isdir(os.path.join(self.local_data_dir, entry)):

                ships_gz_path = os.path.join(self.local_data_dir, entry, "ships.json.gz")
                log_gz_path = os.path.join(self.local_data_dir, entry, "log.json.gz")
                if os.path.exists(ships_gz_path) and os.path.exists(log_gz_path):
                    existing_dates.add(entry)

        today = datetime.now()
        date_to_check = datetime(2022, 11, 23)
        dates_to_download = []

        while date_to_check <= today:
            date_str = f"{date_to_check.year}_{date_to_check.month}_{date_to_check.day}"
            if date_str not in existing_dates:

                if not dates_to_download and date_to_check > datetime(2022, 11, 23):
                    prev_date_str = f"{(date_to_check - timedelta(days=1)).year}_{(date_to_check - timedelta(days=1)).month}_{(date_to_check - timedelta(days=1)).day}"
                    if prev_date_str not in existing_dates:
                        dates_to_download.append(date_to_check - timedelta(days=1))
                dates_to_download.append(date_to_check)
            date_to_check += timedelta(days=1)

        if not dates_to_download:
            self.status_var.set("data's all good and updated")
            self.start_ship_data_loading()
            return

        self.progress["maximum"] = len(dates_to_download)
        self.progress["value"] = 0

        self.current_operation = "downloading_raw"
        self.cancel_button.config(state="normal")
        download_thread = threading.Thread(
            target=self.download_dates_thread,
            args=(dates_to_download,),
            daemon=True
        )
        download_thread.start()
        self.root.after(100, self.check_download_progress)

    def fetch_item_schema(self):
        schema_url = "https://pub.drednot.io/prod/econ/item_schema.json"
        try:
            resp = requests.get(schema_url, timeout=10)
            resp.raise_for_status()
            raw = resp.json()
        except requests.exceptions.RequestException as e:
            messagebox.showerror("Error", f"Failed to download item schema:\n{e}")
            return

        filtered = []
        for entry in raw:
            item = {"id": entry["id"], "name": entry["name"]}

            fab = entry.get("fab_recipe", {})
            inputs = fab.get("input")
            out_count = fab.get("count")
            if isinstance(inputs, list) and isinstance(out_count, (int, float)):
                item["recipe"] = {
                    "inputs": inputs,
                    "output_count": out_count
                }

            filtered.append(item)

        manual_additions = [
            {"id": 100000, "name": "Unknown Item", "recipe": []}
        ]
        filtered.extend(manual_additions)

        try:
            os.makedirs(self.local_data_dir, exist_ok=True)
            path = os.path.join(self.local_data_dir, "item_schema.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(filtered, f)
        except Exception as e:
            messagebox.showerror("Error", f"Could not save item schema:\n{e}")

    def build_item_value_map(self):
        self.item_value_map = {}
        name_to_id = {e["name"]: e["id"] for e in self.item_list}

        for name, val in manual_item_values.items():
            if name in name_to_id:
                self.item_value_map[name_to_id[name]] = float(val)

        for entry in self.item_list:
            rid = entry["id"]
            if rid in self.item_value_map:
                continue

            rec = entry.get("recipe")
            if not rec:
                continue

            inputs = rec["inputs"]
            out_cnt = rec["output_count"]
            total_input_value = 0.0
            valid = True

            for ing in inputs:
                iv = self.item_value_map.get(ing["id"])
                if iv is None:
                    valid = False
                    break
                total_input_value += iv * ing["count"]

            if valid and out_cnt > 0:
                self.item_value_map[rid] = total_input_value / out_cnt

        for item in self.item_list:
            if item["id"] not in self.item_value_map:
                self.item_value_map[item["id"]] = 0.0

    def download_dates_thread(self, dates_to_download):
        try:
            total_dates = len(dates_to_download)
            success_count = 0

            for i, date in enumerate(dates_to_download):
                if self.cancel_event.is_set():
                    self.download_queue.put(("CANCELLED", "downloading raw data cancelled"))
                    return

                date_str = f"{date.year}_{date.month}_{date.day}"
                base_url = "https://pub.drednot.io/prod/econ"

                self.download_queue.put(("PROGRESS", i + 1, total_dates,
                                         f"downloading {date_str} ({i+1}/{total_dates})."))

                try:
                    date_dir = os.path.join(self.local_data_dir, date_str)
                    os.makedirs(date_dir, exist_ok=True)

                    ships_url = f"{base_url}/{date_str}/ships.json.gz"
                    ships_path = os.path.join(date_dir, "ships.json.gz")
                    with requests.get(ships_url, stream=True, timeout=30) as r:
                        r.raise_for_status()
                        with open(ships_path, 'wb') as f:
                            for chunk in r.iter_content(chunk_size=8192):
                                f.write(chunk)

                    log_url = f"{base_url}/{date_str}/log.json.gz"
                    log_path = os.path.join(date_dir, "log.json.gz")
                    with requests.get(log_url, stream=True, timeout=30) as r:
                        r.raise_for_status()
                        with open(log_path, 'wb') as f:
                            for chunk in r.iter_content(chunk_size=8192):
                                f.write(chunk)

                    success_count += 1
                except requests.exceptions.HTTPError as e:
                    if e.response.status_code == 404:
                        print(f"cant find anything for {date_str}, skipping")
                        continue
                    print(f"HTTP Error for {date_str}: {e}")
                except requests.exceptions.RequestException as e:
                    print(f"aw man couldnt load data for {date_str}: {str(e)}, sorry cuh. this is most likely just the dredark server screaming at you for downloading {total_dates * 2}, files which is a lot. after downloading is complete, restart the program and it will go over all the missing files again. dont worry bruh")
                    continue
                except Exception as e:
                    print(f"Unexpected error during download for {date_str}: {e}")

            self.download_queue.put(("COMPLETE_DOWNLOAD_RAW", success_count, total_dates))

        except Exception as e:
            self.download_queue.put(("ERROR", f"Initial download thread error: {str(e)}"))

    def load_item_schema(self):
        path = os.path.join(self.local_data_dir, "item_schema.json")
        try:
            with open(path, "r", encoding="utf-8") as f:
                schema = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"couldnt load item schema, dredark servers are likely down idk:\n{e}")
            self.item_list = []
            self.item_name_map = {}
            self.item_recipe_map = {}
            return

        self.item_list = schema
        self.item_name_map = {entry["id"]: entry["name"] for entry in schema}
        self.item_recipe_map = {entry["id"]: entry.get("recipe", []) for entry in schema}

        self.build_item_value_map()

    def is_operation_in_progress(self):
        return self.current_operation != "none"

    def on_closing(self):
        if self.is_operation_in_progress():
            if messagebox.askokcancel(
                    "something is still going on\n"
                    "you sure?",
                    icon=messagebox.WARNING
            ):
                self.cancel_loading()

                self.root.destroy()
        else:
            self.root.destroy()

    def start_ship_data_loading(self):
        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "Another operation is already in progress.")
            return

        self.current_operation = "loading_ships"
        self.cancel_event.clear()
        self.cancel_button.config(state="normal")
        self.status_var.set("loading ship names...")
        self.progress["value"] = 0


        self.loading_thread = threading.Thread(
            target=self.load_all_ship_data_thread,
            daemon=True
        )
        self.loading_thread.start()
        self.root.after(100, self.check_download_progress)

    def show_help_menu(self):
        help_window = tk.Toplevel(self.root)
        help_window.title("Help Menu")
        help_window.geometry("800x600")
        help_window.resizable(True, True)

        main_frame = ttk.Frame(help_window)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        nav_frame = ttk.Frame(main_frame, width=150)
        nav_frame.pack(side="left", fill="y", padx=(0, 10))

        content_frame = ttk.Frame(main_frame)
        content_frame.pack(side="right", fill="both", expand=True)

        help_text = tk.Text(content_frame, wrap="word", font=("Arial", 12),
                            padx=5, pady=10, state="disabled")
        scrollbar = ttk.Scrollbar(content_frame, orient="vertical", command=help_text.yview)
        help_text.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side="right", fill="y")
        help_text.pack(fill="both", expand=True)

        help_pages = {
            "Introduction": """DREDNOT ECON LOG SCOURER (apparently its spelled that way, not scourerer which makes more sense but phonetically sounds like youre having a stroke. whatever)

This program can help you scan the econ log files from drednot.
It's pretty self explenatory for the most part. If you really don't have a clue about something DM me on Discord, @iogamesplayer or ask me in-game, Dutchman.

Use the navigation buttons on the left to figure out more about features and tips.
            """,

            "Loading Data (MUST READ!)": """LOADING DATA
On startup, the program will download all log files data. This button will use the log files that are downloaded to your disk.

-----

Set the date range with the top-left and top-right inputs.
- Start Date: First day to include (from 2022-11-23)
- End Date: Last day to include (to today)
Everything in between will be loaded when clicking the "Load Data" button, BUT: One important thing, it loads filtered data into RAM. The filters you have currently selected will be applied to the loaded data

The filters help to save a bit of RAM, since the econ logs take a shitton of it.
DO NOT TRY TO LOAD OVER 2 MONTHS OF DATA WITHOUT FILTERS - THE PROGRAM WILL MOST LIKELY CRASH!
DO NOT TRY TO LOAD OVER 2 MONTHS OF DATA WITHOUT FILTERS - THE PROGRAM WILL MOST LIKELY CRASH!
            """,

            "Filtering": """FILTERING DATA

Item Filter:
    Type in the item filter box.
    Press enter once to view the dropdown
    Press enter again to select the selected entry. Select another in the dropdown menu with your mouse or arrow keys.

Source/Destination Filters:
    Type an ID into here to search for it. Only exact HEX ID matches will be reported.
    Ship names are NOT used for filtering source/destination, use lookup shipname to find a HEX ID associated with a name..

Other Filters:
    "Only show ship transactions": Does what it says off the tin - check this box and it will hide all despawned items, and all bot to player transactions.
    - "Use ship names": Display ship names together with IDs. Will add a couple seconds to the filtering process..
        Clicking this for the first time will load about 250MB of data as of April 2025 into RAM, it won't unload until you exit.

Press the Refresh button to apply filters after changing them.

SEARCHING BY BOT: (Doesn't work anymore, will keep here in case I fix it)
    I gave each bot a custom display name to fit the field of the source.
    You can only search them by their original name though.
    Here's a list of the bots:

        "OLD NAME": "CUSTOM NAME",

        "block - iron": "Iron mine",

        "bot - zombie": "Vult Bot", (Smallest vulture bot (WAVE I))
        "bot - zombie tank": "Vult Bot 2", (Second tier vulture bot (WAVE II))
        "bot - zombie hunter": "Vult Yank", (Yanker bot (WAVE III))
        "bot - zombie boss": "Vult Boss", (Vulture boss (WAVE IV))

        "bot - green roamer": "Green bot", Legacy stuff
        "bot - red hunter": "Red Hunter",
        "bot - yellow rusher": "YellowRush",
        "block - flux": "Flux mine",

        "bot - aqua shielder": "Shield bot",
        "bot - blue melee": "Blue Spike", (Small melee bot)
        "bot - yellow hunter": "Hunter bot", (Small, slow yellow bot)
        "bot - orange fool": "Orange Fool",(Hummingbird bot)
        "bot - red sniper": "Red Sniper", (Fast moving Sparrow / Falcon bot that shoots red projectiles)
        "bot - red sentry": "Red Sentry", (Annoying stationary bot)

        "Yellow Mine Bot": "Mine bot",
        "The Coward": "The Coward",
        "The Shield Master": "ShieldBoss",
        "The Lazer Enthusiast": "LazerBoss"
            """,

            "Ship Data Lookup": """SHIP HISTORY SUB-PROGRAM

To lookup a ship's name history:
    1. Click "Lookup Ship Name" to load ship data if it isn't loaded already.
    2. After that's done, click the button again to open the sub-program.
    3. Press either the ID or Name button, depending on what you want to search, wildcards (*) are supported More on that later.
    4. Type your prompt into
    5. Select from matching ships
    6. Press on a date / name to see the contents of the ship at that time.

The history will show all known names for that ship ID, with dates when the name was recorded.
It only shows names from when the ship was loaded at least once in the day.
Press the back button to go back to the ship name history if you want to return from seeing contents of a ship.

Unchecking "Enable Searching" will disable searching by name, and will only show EXACT ID matches.
            """,

            "Economy": """ITEM ANALYZER SUB-PROGRAM

This program is really simple to use, press the Economy Items button to begin.

Select a date for the analysis, or keep it at default to read all of the available data.

Also paste a shiplist from https://drednot.io/shiplist?server=0 if you want to analyze just YOUR items. Pretty interesting as well for figuring out which of your ships is worth scrapping [IDEA FOR FUTURE ME: create a ranking of all the ships owned by some dude]

This will return a list of ALL items and their total counts, without duplicates. So if it says that there is 2134849239458 iron in the economy, there is that much iron total in ALL ships combined together.

This works by taking all of the ships.gz.json files, and reading all of the contents of all ships. It will only use the most recent available data per ship. This should be water-tight to not have any item being counted twice.

Double-click an entry to see a leaderboard of so-called "contributors" to the item-count. See if your storage cuts the top 100 for amount of flux stored. You can then again double-click an entry to see its name history

item 100000 is most likely some sort of flag item.
The test items are probably cogg testing some shit off.
I'm not sure how some ships have more starter items than allowed, Timmy no.1 {{E4862}} somehow has 9 starter cannons, 2 starter fabs, while testyy {{DAD5FA}} has 18 starter thrusters.
            """,
            "Your Items": """YOUR ITEMS
This little button allows you to check out all the items you possess. It includes a flux value, but that's pretty subjective ngl. Full list is here:
EVERYTHING NOT PRESENT IS MADE UP OF THE CRAFTING STUFF'S VALUE - OR IS 0.0.

    "Iron": 0.0625,
    "Explosives": 0.05,
    "Hyper Rubber": 0.5,
    "Flux Crystals": 1.0,
    "Compressed Explosives": 0.8,
    "Compressed Iron": 1.0,
    "Volleyball": 8.0,
    "Basketball": 8.0,
    "Beach Ball": 8.0,
    "Football": 8.0,
    "Golden Item Shredder": 90000.0,
    "Backpack": 1.0,
    "Manifest Scanner": 48.0,
    "BoM Scanner": 48.0,
    "Blueprint Scanner": 4.0,
    "Flux RCD": 64.0,
    "Shield Core": 0.0625,
    "Cannon (Packaged)": 1.5,
    "Burst Cannon (Packaged)": 4.0,
    "Machine Cannon (Packaged)": 32.0,
    "Thruster (Starter, Packaged)": 0.0,
    "Hyper Ice Block": 0.125,
    "DEPRECATED ITEM": 2.5,
    "Fabricator (Legacy, Packaged)": 45000.0,
    "Shield Generator": 0.5,
    "Shield Projector": 16.0,
    "Acute Cannon (Packaged)": 2.0,
    "Munitions Supply Unit (Packaged)": 1.0,
    "Obtuse Cannon (Packaged)": 2.0,
    "Gold Null Trophy": 1000000.0,
    "Bug Hunter Trophy": 0.0,
    "Silver Null Trophy": 250000.0,
    "Elimination Loot Box": 16.0,
    "Elimination Loot Box (Locked)": 16.0

""",

            "Exporting": """EXPORTING DATA

To save your filtered data to a file:
    1. Put your filters the way you want
    2. Click the export button
    3. Choose a save location
    4. Click Save

The exported file will contain all transactions displayed on the screen. low key copy pasting is more useful but whatever.
            """
        }

        for page_name in help_pages.keys():
            def make_lambda(page=page_name):
                return lambda: self.update_help_text(help_text, help_pages[page])

            btn = ttk.Button(nav_frame, text=page_name, command=make_lambda(), width=15)
            btn.pack(pady=2, padx=2, fill="x")

        self.update_help_text(help_text, help_pages["Introduction"])

        help_window.minsize(600, 400)

    def update_help_text(self, text_widget, content):
        text_widget.config(state="normal")
        text_widget.delete(1.0, tk.END)
        text_widget.insert(tk.END, content)
        text_widget.config(state="disabled")

    def create_widgets(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(5, weight=1)

        date_frame = ttk.Frame(main_frame)
        date_frame.grid(row=0, column=0, columnspan=2, sticky="ew", pady=5)
        for i in range(5):
            date_frame.columnconfigure(i, weight=1)

        start_frame = ttk.Frame(date_frame)
        start_frame.grid(row=0, column=0, sticky="w")
        ttk.Label(start_frame, text="From:").pack(side="left")

        ttk.Spinbox(start_frame, from_=2022, to=datetime.now().year,
                    textvariable=self.start_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=12,
                    textvariable=self.start_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=31,
                    textvariable=self.start_day_var, width=3).pack(side="left", padx=2)

        ttk.Button(date_frame, text="Load Data", command=self.load_data
                   ).grid(row=0, column=1, padx=(10,5), sticky="ew")

        self.cancel_button = ttk.Button(date_frame, text="Cancel", command=self.cancel_loading,
                                        state="disabled")
        self.cancel_button.grid(row=0, column=2, padx=5, sticky="ew")

        ttk.Button(date_frame, text="Set To = From", command=self.set_same,
                   width=12).grid(row=0, column=3, padx=(5,10), sticky="ew")

        end_frame = ttk.Frame(date_frame)
        end_frame.grid(row=0, column=4, sticky="e")
        ttk.Label(end_frame, text="To:").pack(side="left")

        ttk.Spinbox(end_frame, from_=2022, to=datetime.now().year,
                    textvariable=self.end_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=12,
                    textvariable=self.end_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=31,
                    textvariable=self.end_day_var, width=3).pack(side="left", padx=2)

        self.progress = ttk.Progressbar(main_frame, orient="horizontal",
                                        length=300, mode="determinate")
        self.progress.grid(row=2, column=0, columnspan=2, padx=10, pady=5, sticky="ew")

        self.status_var = tk.StringVar(value="Ready to load data")
        ttk.Label(main_frame, textvariable=self.status_var).grid(row=3, column=0, columnspan=2, pady=(0,10))

        filter_frame = ttk.Frame(main_frame)
        filter_frame.grid(row=4, column=0, columnspan=2, pady=5, sticky="ew")
        filter_frame.columnconfigure(0, weight=1)
        filter_frame.columnconfigure(1, weight=1)

        item_filter_frame = ttk.Frame(filter_frame)
        item_filter_frame.grid(row=0, column=0, padx=5, sticky="ew")
        ttk.Label(item_filter_frame, text="Item Filter:").pack(side="left")
        self.search_combo = ttk.Combobox(item_filter_frame, textvariable=self.filter_item_var,
                                         values=self.filtered_items)
        self.search_combo.pack(side="left", fill="x", expand=True, padx=5)
        self.search_combo.bind('<Return>', lambda e: self.root.after(50, self.update_filter))

        source_dest_frame = ttk.Frame(filter_frame)
        source_dest_frame.grid(row=0, column=1, padx=5, sticky="ew")
        source_dest_frame.columnconfigure(0, weight=1)
        source_dest_frame.columnconfigure(1, weight=1)

        source_filter_frame = ttk.Frame(source_dest_frame)
        source_filter_frame.grid(row=0, column=0, padx=5, sticky="ew")
        ttk.Label(source_filter_frame, text="Source:").pack(side="left")
        self.source_entry = ttk.Entry(source_filter_frame, textvariable=self.filter_source_var)
        self.source_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.source_entry.bind('<Return>', lambda e: self.update_display())

        dest_filter_frame = ttk.Frame(source_dest_frame)
        dest_filter_frame.grid(row=0, column=1, padx=5, sticky="ew")
        ttk.Label(dest_filter_frame, text="Dest:").pack(side="left")
        self.dest_entry = ttk.Entry(dest_filter_frame, textvariable=self.filter_dest_var)
        self.dest_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.dest_entry.bind('<Return>', lambda e: self.update_display())

        filter_check_frame = ttk.Frame(filter_frame)
        filter_check_frame.grid(row=1, column=0, columnspan=2, pady=5, sticky="w")

        ttk.Checkbutton(filter_check_frame, text="Only show ship transactions", variable=self.show_bots,
                        command=self.update_display).pack(side="left", padx=5)
        ttk.Checkbutton(filter_check_frame, text="Use ship names", variable=self.use_ship_names,
                        command=self.update_display).pack(side="left", padx=5)

        ttk.Button(filter_check_frame, text="Help", width=6, command=self.show_help_menu).pack(side="right", padx=5)

        ttk.Button(filter_check_frame, text="⚙", width=6, command=self.open_settings_menu).pack(side="right", padx=5)

        preview_frame = ttk.Frame(main_frame)
        preview_frame.grid(row=5, column=0, columnspan=2, sticky="nsew", pady=(0,5))
        preview_frame.rowconfigure(0, weight=1)
        preview_frame.columnconfigure(0, weight=1)

        text_frame = ttk.Frame(preview_frame)
        text_frame.grid(row=0, column=0, sticky="nsew")
        text_frame.columnconfigure(0, weight=1)
        text_frame.rowconfigure(0, weight=1)

        self.preview_text = tk.Text(text_frame, state="disabled", wrap="word")
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=self.preview_text.yview)
        self.preview_text.configure(yscrollcommand=scrollbar.set)

        self.preview_text.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")

        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=6, column=0, columnspan=2, sticky="sew", pady=(0,5))
        for i in range(5):
            button_frame.columnconfigure(i, weight=1)

        ttk.Button(button_frame, text="Lookup Ship Name", command=self.lookup_ship_name).grid(
            row=0, column=0, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Export to TXT", command=self.export_to_txt).grid(
            row=0, column=1, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Refresh", command=self.update_display).grid(
            row=0, column=2, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Your Items", command=self.open_shiplist_window).grid(
            row=0, column=3, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Economy", command=self.analyze_ships).grid(
            row=0, column=4, padx=5, sticky="sew")

        self.root.minsize(720, 300)

    def set_same(self):
        self.end_year_var.set(self.start_year_var.get())
        self.end_month_var.set(self.start_month_var.get())
        self.end_day_var.set(self.start_day_var.get())

    def open_settings_menu(self):
        settings_win = tk.Toplevel(self.root)
        settings_win.title("Text Settings")
        settings_win.resizable(False, False)

        frame = ttk.Frame(settings_win, padding=10)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Text Size:").grid(row=0, column=0, sticky="w", padx=10, pady=5)
        text_size_entry = ttk.Entry(frame, textvariable=self.text_size_var, width=5)
        text_size_entry.grid(row=0, column=1, sticky="w", padx=5)
        text_size_entry.bind("<Return>", lambda e: self.apply_display_settings())

        ttk.Label(frame, text="Wrap Text:").grid(row=1, column=0, sticky="w", padx=10, pady=5)
        ttk.Checkbutton(
            frame, variable=self.wrap_text_var,
            command=self.apply_display_settings
        ).grid(row=1, column=1, sticky="w")

        ttk.Separator(frame, orient="horizontal").grid(row=2, column=0, columnspan=2, sticky="ew", pady=10)

        btn_schema = ttk.Button(
            frame,
            text="Redownload Item Schema",
            command=self.fetch_item_schema
        )
        btn_schema.grid(row=3, column=0, columnspan=2, pady=(0, 10))

        ttk.Button(frame, text="Close", command=settings_win.destroy).grid(
            row=4, column=0, columnspan=2, pady=10
        )

    def apply_display_settings(self):
        try:
            size = int(self.text_size_var.get())
            if size < 1 or size > 40:
                raise ValueError
        except ValueError:
            messagebox.showerror("Error", "put a normal damn number you atuistic fuck no decimals")
            self.text_size_var.set(10)
            return

        wrap_mode = "word" if self.wrap_text_var.get() else "none"

        self.preview_text.config(
            font=("DejaVu Sans Mono", size),
            wrap=wrap_mode
        )

        if hasattr(self, 'result_text'):
            self.result_text.config(
                font=("DejaVu Sans Mono", size),
                wrap=wrap_mode
            )

    def load_all_ship_data_thread(self):
        try:
            self.ship_names = {}
            self.ships_present_on_date.clear()

            all_dates = []
            for entry in os.listdir(self.local_data_dir):
                if entry.count('_') == 2 and os.path.isdir(os.path.join(self.local_data_dir, entry)):

                    ships_gz_path = os.path.join(self.local_data_dir, entry, "ships.json.gz")
                    log_gz_path = os.path.join(self.local_data_dir, entry, "log.json.gz")
                    if os.path.exists(ships_gz_path) and os.path.exists(log_gz_path):
                        all_dates.append(entry)

            all_dates.sort(key=lambda x: tuple(map(int, x.split('_'))))

            total_dates = len(all_dates)
            self.download_queue.put(("SHIP_PROGRESS", 0, total_dates, "starting loading ship data"))

            for i, date_str in enumerate(all_dates):
                if self.cancel_event.is_set():
                    self.download_queue.put(("SHIP_ERROR", "loading ship data cancelled"))
                    return

                ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")
                if not os.path.exists(ships_path):
                    continue

                try:
                    with gzip.open(ships_path, 'rb') as f:
                        day_ships_data = json.load(f)

                    for ship in day_ships_data:
                        hex_code = ship.get("hex_code", "").upper().strip("{}")
                        if not hex_code:
                            continue

                        self.ships_present_on_date[date_str].add(hex_code)

                        current_name = ship.get("name", "").strip()

                        if hex_code not in self.ship_names:
                            self.ship_names[hex_code] = {
                                "current_name": current_name,
                                "name_history": []
                            }

                        hist = self.ship_names[hex_code]["name_history"]
                            hist.append((date_str, current_name))
                        self.ship_names[hex_code]["current_name"] = current_name

                except Exception as e:
                    print(f"error loading {date_str}'s ships: {str(e)}")

                self.download_queue.put(("SHIP_PROGRESS", i+1, total_dates,
                                         f"processing {date_str} ({i+1}/{total_dates})"))

            if not self.cancel_event.is_set():
                self.download_queue.put(("SHIP_COMPLETE", len(self.ship_names)))
            else:
                self.download_queue.put(("SHIP_ERROR", "loading ship data cancelled"))

        except Exception as e:
            self.download_queue.put(("SHIP_ERROR", f"bad error during ship data loading: {str(e)}"))

    def check_download_progress(self):
        try:
            while True:
                try:
                    data = self.download_queue.get_nowait()

                    if data[0] == "PROGRESS":
                        current, total, status = data[1], data[2], data[3]
                        self.progress["maximum"] = total
                        self.progress["value"] = current
                        self.status_var.set(f"loading data: {status}")

                    elif data[0] == "COMPLETE_DOWNLOAD_RAW":
                        success_count, total_dates = data[1], data[2]
                        self.download_complete_raw_data(success_count, total_dates)

                    elif data[0] == "COMPLETE_LOAD_DATA":
                        total_trans, filtered_count = data[1], data[2]
                        self.load_data_complete(total_trans, filtered_count)

                    elif data[0] == "ERROR":
                        error_msg = data[1]
                        self.operation_error(error_msg)

                    elif data[0] == "CANCELLED":
                        self._handle_cancellation(data[1])

                    elif data[0] == "SHIP_PROGRESS":
                        current, total, status = data[1], data[2], data[3]
                        self.progress["maximum"] = total
                        self.progress["value"] = current
                        self.status_var.set(f"loading ship data into RAM: {status}")

                    elif data[0] == "SHIP_COMPLETE":
                        total_ships = data[1]
                        self.status_var.set(f"loaded {total_ships} ship names and contents, that cost about {round(total_ships * 0.0122) * 0.1}MB of RAM. nice")
                        self.progress["value"] = 0
                        self.current_operation = "none"
                        self.cancel_button.config(state="disabled")
                        self.update_display()

                    elif data[0] == "SHIP_ERROR":
                        error_msg = data[1]
                        messagebox.showerror("Error", f"ship data loading failed: {error_msg}")
                        self.status_var.set("couldn't load ship data ): try again or live with it")
                        self.progress["value"] = 0
                        self.current_operation = "none"
                        self.cancel_button.config(state="disabled")

                    elif data[0] == "ANALYSIS_COMPLETE":
                        result = data[1]
                        self.display_analysis_result(result)
                        self.current_operation = "none"
                        self.progress["value"] = 0
                        self.cancel_button.config(state="disabled")
                        self.status_var.set("looked at all known ships and their contents")

                except queue.Empty:
                    break

        except Exception as e:
            messagebox.showerror("Error", f"progress check failed: {str(e)}. rip")
            self.progress["value"] = 0
            self.current_operation = "none"
            self.cancel_button.config(state="disabled")

        if self.current_operation != "none":
            self.root.after(100, self.check_download_progress)

    def _handle_cancellation(self, message):
        self.status_var.set(f"Operation cancelled: {message}")
        self.progress["value"] = 0
        self.cancel_button.config(state="disabled")
        self.current_operation = "none"

        if "raw data" in message or "log data" in message:
            self.raw_data = []
            self.filtered_data = []
            self.update_preview()
        self.cancel_event.clear()

    def download_data_thread(self, dates_to_process):
        try:
            self.raw_data = []
            total_transactions = 0
            total_dates = len(dates_to_process)

            item_filter = self.filter_item_var.get()
            source_filter_hex = self.filter_source_var.get().strip('{}').upper()
            dest_filter_hex = self.filter_dest_var.get().strip('{}').upper()
            hide_bots = self.show_bots.get()

            item_id = None
            if item_filter:
                try:
                    item_id = int(item_filter.split(":")[0])
                except (ValueError, IndexError):
                    pass

            for i, date_str in enumerate(dates_to_process):
                if self.cancel_event.is_set():
                    self.download_queue.put(("CANCELLED", "loading log data cancelled"))
                    self.raw_data = []
                    return

                log_path = os.path.join(self.local_data_dir, date_str, "log.json.gz")

                if not os.path.exists(log_path) or os.path.getsize(log_path) == 0:
                    continue

                ships_on_this_date = self.ships_present_on_date.get(date_str, set())

                if source_filter_hex and source_filter_hex not in ships_on_this_date:
                    continue
                if dest_filter_hex and dest_filter_hex not in ships_on_this_date:
                    continue

                progress = i + 1
                self.download_queue.put(("PROGRESS", progress, total_dates,
                                         f"Processed {date_str} ({progress}/{total_dates}) - {len(self.raw_data)} filtered"))

                with gzip.open(log_path, 'rb') as f:
                    if self.cancel_event.is_set():
                        self.download_queue.put(("CANCELLED", "loading log data cancelled"))
                        self.raw_data = []
                        return
                    day_log_data = json.load(f)

                    total_transactions += len(day_log_data)

                    filtered_day_data = []
                    for entry in day_log_data:
                        if not isinstance(entry, dict):
                            continue

                        if item_id is not None and entry.get("item") != item_id:
                            continue

                        current_src_raw = str(entry.get("src", "")).upper()
                        current_dst_raw = str(entry.get("dst", "")).upper()

                        src_hex_match = re.match(r'\{([0-9A-F]+)\}', current_src_raw)
                        dst_hex_match = re.match(r'\{([0-9A-F]+)\}', current_dst_raw)

                        src_is_ship = bool(src_hex_match)
                        dst_is_ship = bool(dst_hex_match)

                        src_hex = src_hex_match.group(1) if src_is_ship else current_src_raw
                        dst_hex = dst_hex_match.group(1) if dst_is_ship else current_src_raw

                        if hide_bots:
                            if not (src_is_ship and dst_is_ship):
                                continue

                        if source_filter_hex:

                            if not src_is_ship or src_hex != source_filter_hex or src_hex not in ships_on_this_date:
                                continue

                        if dest_filter_hex:

                            if not dst_is_ship or dst_hex != dest_filter_hex or dst_hex not in ships_on_this_date:
                                continue

                        filtered_day_data.append(entry)

                    self.raw_data.extend(filtered_day_data)

                gc.collect()

            if not self.cancel_event.is_set():
                self.download_queue.put(("COMPLETE_LOAD_DATA", total_transactions, len(self.raw_data)))
            else:
                self.download_queue.put(("CANCELLED", "loading log data cancelled"))

        except Exception as e:
            self.download_queue.put(("ERROR", f"Log data loading thread error: {str(e)}"))

    def load_data(self):
        if not self.validate_date_range():
            return

        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "something is already loading you impatient bum")
            return

        self.cancel_event.clear()
        self.cancel_button.config(state="normal")

        self.raw_data = []
        self.filtered_data = []

        start_date = datetime(
            int(self.start_year_var.get()),
            int(self.start_month_var.get()),
            int(self.start_day_var.get())
        )
        end_date = datetime(
            int(self.end_year_var.get()),
            int(self.end_month_var.get()),
            int(self.end_day_var.get())
        )

        dates_to_process = []
        current_date = start_date
        while current_date <= end_date:
            dates_to_process.append(f"{current_date.year}_{current_date.month}_{current_date.day}")
            current_date += timedelta(days=1)

        self._last_dates_processed = dates_to_process

        total_dates = len(dates_to_process)
        self.progress["maximum"] = total_dates
        self.progress["value"] = 0
        self.status_var.set(f"loading logs from files (0/{total_dates})...")
        self.current_operation = "loading_raw"

        self.loading_thread = threading.Thread(
            target=self.download_data_thread,
            args=(dates_to_process,),
            daemon=True
        )
        self.loading_thread.start()

        self.root.after(100, self.check_download_progress)

    def apply_filters(self):
        item_filter = self.filter_item_var.get()
        source_filter_hex = self.filter_source_var.get().strip('{}').upper()
        dest_filter_hex = self.filter_dest_var.get().strip('{}').upper()
        hide_bots = self.show_bots.get()

        item_id = None
        if item_filter:
            try:
                item_id = int(item_filter.split(":")[0])
            except (ValueError, IndexError):
                pass

        self.filtered_data = []

        for entry in self.raw_data:
            if not isinstance(entry, dict):
                continue

            current_item = entry.get("item")
            current_src_raw = str(entry.get("src", "")).upper()
            current_dst_raw = str(entry.get("dst", "")).upper()
            timestamp = entry.get("time")

            entry_date_str = datetime.fromtimestamp(timestamp).strftime("%Y_%m_%d") if timestamp else None
            ships_on_this_date = self.ships_present_on_date.get(entry_date_str, set())

            if item_id is not None and current_item != item_id:
                continue

            src_hex_match = re.match(r'\{([0-9A-F]+)\}', current_src_raw)
            dst_hex_match = re.match(r'\{([0-9A-F]+)\}', current_dst_raw)

            src_is_ship = bool(src_hex_match)
            dst_is_ship = bool(dst_hex_match)

            src_hex = src_hex_match.group(1) if src_is_ship else current_src_raw
            dst_hex = dst_hex_match.group(1) if dst_is_ship else current_src_raw

            if hide_bots and not (src_is_ship and dst_is_ship):
                continue

            if source_filter_hex:
                if not src_is_ship or src_hex != source_filter_hex or src_hex not in ships_on_this_date:
                    continue

            if dest_filter_hex:
                if not dst_is_ship or dst_hex != dest_filter_hex or dst_hex not in ships_on_this_date:
                    continue

            self.filtered_data.append(entry)

    def format_timestamp(self, timestamp):
        try:
            if timestamp:
                dt = datetime.fromtimestamp(timestamp)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            return "Unknown time"
        except (ValueError, TypeError, OSError):
            return "Invalid time"

    def cancel_loading(self):
        if self.is_operation_in_progress():
            self.cancel_event.set()
            self.status_var.set(f"Cancelling {self.current_operation}...")
            self.cancel_button.config(state="disabled")
        else:
            messagebox.showinfo("Info", "No operation is currently in progress to cancel.")

    def download_complete_raw_data(self, success_count, total_dates):
        self.current_operation = "none"
        self.cancel_button.config(state="disabled")
        self.progress["value"] = self.progress["maximum"]
        self.status_var.set(f"Initial raw data download finished. Downloaded {success_count}/{total_dates} dates.")
        self.start_ship_data_loading()

    def load_data_complete(self, total_transactions, filtered_count):
        self.current_operation = "none"
        self.cancel_button.config(state="disabled")
        self.progress["value"] = self.progress["maximum"]
        self.status_var.set(f"finished loading shit! gone trough {total_transactions} transactions, {filtered_count} after filters")
        messagebox.showinfo("Success", f"loaded {total_transactions} transactions, {filtered_count} after filters")

        self.filtered_data = self.raw_data.copy()
        self.update_preview()

    def operation_error(self, error_msg):
        self.current_operation = "none"
        self.cancel_button.config(state="disabled")
        messagebox.showerror("Error", f"data loading did boom this is 10000% your fault fuck you for breaking it no tech support for you: {error_msg}\n(this is the dredark server screaming at you for downloading 900+ files in one go, dont worry, relaunch after it's done dowloading. it will redownload the missing files.)")
        self.status_var.set("data loading failed")

    def lookup_ship_name(self):
        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "Data is being loaded, wait up you impatient fuck")
            return

        self.lookup_window = tk.Toplevel(self.root)
        self.lookup_window.title("Ship Name Lookup")
        self.lookup_window.minsize(500, 400)
        self.lookup_window.geometry("600x500")

        main_frame = ttk.Frame(self.lookup_window, padding=10)
        main_frame.pack(fill="both", expand=True)

        input_frame = ttk.Frame(main_frame)
        input_frame.pack(fill="x", pady=5)

        self.search_type = tk.StringVar(value="id")
        self.case_sensitive = tk.BooleanVar(value=False)
        self.fuzzy_search = tk.BooleanVar(value=True)
        self.digit_length_var = tk.StringVar(value="*")

        settings_frame = ttk.Frame(input_frame)
        settings_frame.pack(fill="x", pady=5)

        ttk.Label(settings_frame, text="Search by:").pack(side="left")
        ttk.Radiobutton(settings_frame, text="ID", variable=self.search_type, value="id").pack(side="left", padx=2)
        self.name_radio_button = ttk.Radiobutton(settings_frame, text="Name", variable=self.search_type, value="name")
        self.name_radio_button.pack(side="left", padx=2)

        ttk.Checkbutton(settings_frame, text="Case sensitive", variable=self.case_sensitive).pack(side="left", padx=2)

        ttk.Checkbutton(
            settings_frame,
            text="Enable Searching",
            variable=self.fuzzy_search,
            command=self.toggle_fuzzy_search
        ).pack(side="left", padx=2)

        ttk.Label(settings_frame, text="Digit Length:").pack(side="left", padx=(10, 2))
        ttk.Combobox(
            settings_frame,
            textvariable=self.digit_length_var,
            values=["*", "4", "5", "6", "7", "8"],
            state="readonly",
            width=5
        ).pack(side="left")

        self.back_button = ttk.Button(
            input_frame,
            text="←",
            command=lambda: self.display_ship_history(self.current_ship_hex),
            state="disabled"
        )
        self.back_button.pack(side="right")

        search_entry_frame = ttk.Frame(input_frame)
        search_entry_frame.pack(fill="x", pady=5)

        ttk.Label(search_entry_frame, text="Search:").pack(side="left")
        self.search_entry = ttk.Entry(search_entry_frame)
        self.search_entry.pack(side="left", padx=5, fill="x", expand=True)
        self.search_entry.focus_set()

        ttk.Button(search_entry_frame, text="Search", command=self.do_name_lookup).pack(side="left", padx=5)

        split_pane = tk.PanedWindow(main_frame, orient=tk.VERTICAL, sashwidth=8, sashrelief='ridge', bg='#AAA')
        split_pane.pack(fill="both", expand=True)

        matches_frame = ttk.Frame(split_pane)
        matches_container = ttk.Frame(matches_frame)
        matches_container.pack(fill="both", expand=True)

        self.matches_listbox = tk.Listbox(
            matches_container,
            height=5,
            selectmode=tk.SINGLE
        )

        self.matches_listbox.bind('<Up>', lambda e: self._handle_listbox_nav(-1))
        self.matches_listbox.bind('<Down>', lambda e: self._handle_listbox_nav(1))
        self.matches_listbox.bind('<Return>', lambda e: self.select_ship_from_list())

        matches_scrollbar = ttk.Scrollbar(
            matches_container,
            orient="vertical",
            command=self.matches_listbox.yview
        )
        self.matches_listbox.configure(yscrollcommand=matches_scrollbar.set)

        self.matches_listbox.grid(row=0, column=0, sticky="nsew")
        matches_scrollbar.grid(row=0, column=1, sticky="ns")

        matches_container.columnconfigure(0, weight=1)
        matches_container.rowconfigure(0, weight=1)

        self.matches_listbox.bind("<Double-Button-1>", lambda e: self.select_ship_from_list())

        result_frame = ttk.Frame(split_pane)
        self.result_text = tk.Text(
            result_frame,
            wrap="word" if self.wrap_text_var.get() else "none",
            font=("DejaVu Sans Mono", self.text_size_var.get()),
            state="normal"
        )
        result_scrollbar = ttk.Scrollbar(
            result_frame,
            orient="vertical",
            command=self.result_text.yview
        )
        self.result_text.configure(yscrollcommand=result_scrollbar.set)

        self.result_text.grid(row=0, column=0, sticky="nsew")
        result_scrollbar.grid(row=0, column=1, sticky="ns")

        result_frame.columnconfigure(0, weight=1)
        result_frame.rowconfigure(0, weight=1)

        split_pane.add(matches_frame)
        split_pane.add(result_frame)

        self.search_entry.bind('<Return>', lambda e: self.do_name_lookup())

        self.result_text.insert(tk.END, "put in a ship id or name")
        self.result_text.config(state="disabled")
        self.current_ship_hex = None

    def toggle_fuzzy_search(self):
        if not self.fuzzy_search.get():
            self.search_type.set("id")
        self.name_radio_button.config(state="disabled" if not self.fuzzy_search.get() else "normal")

    def _handle_listbox_nav(self, direction):
        if not self.matches_listbox.curselection():
            return

        current = self.matches_listbox.curselection()[0]
        new_pos = current + direction

        if 0 <= new_pos < self.matches_listbox.size():
            self.matches_listbox.selection_clear(0, tk.END)
            self.matches_listbox.selection_set(new_pos)
            self.matches_listbox.activate(new_pos)
            self.matches_listbox.see(new_pos)

    def do_name_lookup(self):
        try:
            search_text = self.search_entry.get().strip()
            if not search_text:
                self.result_text.config(state="normal")
                self.result_text.delete(1.0, tk.END)
                self.result_text.insert(tk.END, "put in a ship id or name")
                self.result_text.config(state="disabled")
                return

            search_type = self.search_type.get()
            case_sensitive = self.case_sensitive.get()
            use_wildcard = '*' in search_text

            self.result_text.config(state="normal")
            self.result_text.delete(1.0, tk.END)
            self.matches_listbox.delete(0, tk.END)

            clean_search = search_text.replace('{', '').replace('}', '') if search_type == "id" else search_text
            if not case_sensitive:
                clean_search = clean_search.upper()

            regex_pattern = None
            if use_wildcard:
                parts = clean_search.split('*')
                escaped_parts = [re.escape(part) for part in parts]
                pattern_str = '.*'.join(escaped_parts)
                try:
                    regex_pattern = re.compile(f'^{pattern_str}$', re.IGNORECASE if not case_sensitive else 0)
                except re.error as e:
                    self.result_text.insert(tk.END, f"weird ass search pattern: {str(e)}")
                    self.result_text.config(state="disabled")
                    return

            matches = []
            exact_match = None

            for hex_id, data in self.ship_names.items():
                digit_length = self.digit_length_var.get()
                if digit_length != "*":
                    try:
                        if len(hex_id) != int(digit_length):
                            continue
                    except ValueError:
                        pass

                current_name = data.get("current_name", "")

                historical_names = list(set([name for _, name in data.get("name_history", [])]))

                comp_hex = hex_id if case_sensitive else hex_id.upper()
                comp_name = current_name if case_sensitive else current_name.upper()
                comp_historical = [name if case_sensitive else name.upper() for name in historical_names]

                match = False

                if use_wildcard:
                    if search_type == "id":
                        match = bool(regex_pattern.match(comp_hex))
                    else:
                        name_match = bool(regex_pattern.match(comp_name))
                        hist_match = any(bool(regex_pattern.match(name)) for name in comp_historical)
                        match = name_match or hist_match
                else:
                    if search_type == "id":
                        if self.fuzzy_search.get():
                            match = clean_search in comp_hex
                        else:
                            match = (comp_hex == clean_search)
                    else:
                        if self.fuzzy_search.get():
                            name_match = clean_search in comp_name
                            hist_match = any(clean_search in name for name in comp_historical)
                            match = name_match or hist_match
                        else:
                            name_match = (comp_name == clean_search)
                            hist_match = any(name == clean_search for name in comp_historical)
                            match = name_match or hist_match

                if match:
                    display_name = f"{current_name} {{{hex_id}}}"
                    matches.append((hex_id, display_name))
                    if comp_hex == clean_search and search_type == "id":
                        exact_match = hex_id

            if not matches:
                self.result_text.insert(tk.END, f"no ships at all match your weird prompt, {search_text}")
                self.result_text.config(state="disabled")
                return

            matches.sort(key=lambda x: x[1].lower())

            for hex_id, display_name in matches:
                self.matches_listbox.insert(tk.END, display_name)

            self.matches_listbox.config(height=min(10, len(matches)))

            if exact_match:
                for i in range(self.matches_listbox.size()):
                    if exact_match in self.matches_listbox.get(i):
                        self.matches_listbox.selection_clear(0, tk.END)
                        self.matches_listbox.selection_set(i)
                        self.matches_listbox.activate(i)
                        self.display_ship_history(exact_match)
                        return

            if len(matches) == 1:
                self.display_ship_history(matches[0][0])
            else:
                self.result_text.insert(tk.END, f"found {len(matches)} matching ships. click on one to view it closer.")
                self.result_text.config(state="disabled")

            if matches:
                self.matches_listbox.focus_set()
                self.matches_listbox.selection_set(0)
                self.matches_listbox.activate(0)

        except Exception as e:
            self.result_text.config(state="normal")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, f"search had a little error:\n{str(e)}")
            self.result_text.config(state="disabled")

    def _load_and_display_items(self, hex_id, date_str):
        ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")

        if not os.path.exists(ships_path):
            self.result_text.insert(tk.END, "\nData missing for this date. (File not found)\n")
            return

        try:
            with gzip.open(ships_path, "rb") as f:
                ships_data = json.load(f)

            item_name_map = self.item_name_map
            found = False
            total_value = 0.0

            if re.fullmatch(r'[A-Za-z0-9]{4}', hex_id):
                total_value += 45000.0
                self.result_text.insert(tk.END, "\nIt's a 4 digit, +45000 flux value and +100 aura!\n")
                self.result_text.insert(tk.END, "-"*55 + "\n")

            for ship in ships_data:
                ship_hex = ship.get("hex_code", "").strip("{}").upper()
                target_hex = hex_id.strip("{}").upper()

                if ship_hex == target_hex:
                    items = ship.get("items", {})
                    if not items:
                        self.result_text.insert(tk.END, "\nNo items recorded for this ship on this date.\n")
                        return

                    sorted_items = sorted(
                        items.items(),
                        key=lambda x: int(x[0])
                    )
                    self.result_text.insert(tk.END, "\nItem ID | Count | Item Name | Value\n")
                    self.result_text.insert(tk.END, "-"*55 + "\n")

                    for item_id, count in sorted_items:
                        try:
                            item_id_int = int(item_id)
                        except ValueError:
                            continue

                        item_name = item_name_map.get(item_id_int, "UnknownItem")
                        unit_value = self.item_value_map.get(item_id_int, 0.0)
                        item_value = unit_value * int(count)
                        total_value += item_value
                        self.result_text.insert(
                            tk.END,
                            f"{item_id:>3} | {count:>6} | {item_name:45} | {item_value:9.2f}\n"
                        )
                    found = True
                    self.result_text.insert(tk.END, "-"*55 + "\n")
                    self.result_text.insert(tk.END,
                        f"{'TOTAL SHIP VALUE:':>45} {total_value:9.2f}\n")
                    break

            if not found:
                self.result_text.insert(tk.END, "\nCould not find the ship in this record.\n")

        except json.JSONDecodeError:
            self.result_text.insert(tk.END, "\nCorrupted ship file for this date.\n")
        except Exception as e:
            self.result_text.insert(tk.END, f"\nError loading items: {str(e)}\n")

    def open_shiplist_window(self):
        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "wait up sum is happening")
            return

        self.shiplist_window = tk.Toplevel(self.root)
        self.shiplist_window.title("total brokeness calculator")
        self.shiplist_window.minsize(600, 500)
        self.shiplist_window.geometry("650x550")

        frame = ttk.Frame(self.shiplist_window, padding=10)
        frame.pack(fill="both", expand=True)

        url_frame = ttk.Frame(frame)
        url_frame.pack(fill="x", pady=(0, 1))
        ttk.Label(url_frame, text="copy paste this in your adress bar:").pack(side="left")
        url_entry = ttk.Entry(url_frame, state="readonly")
        url_entry.pack(side="left", fill="x", expand=True, padx=(1, 0))
        url_entry.configure(state="normal")
        url_entry.insert(0, "https://drednot.io/shiplist?server=0")
        url_entry.configure(state="readonly")

        paste_label = ttk.Label(frame, text="paste everything from there in here:")
        paste_label.pack(anchor="w", pady=(5, 0))

        self.shiplist_text = tk.Text(frame, wrap="none", height=1)
        self.shiplist_text.pack(fill="both", expand=False, padx=5, pady=(0, 5))

        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill="x", pady=(10, 5))
        ttk.Button(btn_frame, text="Process", command=self.process_shiplist_json).pack(side="right")

        self.shiplist_result_text = tk.Text(frame, wrap="none", state="disabled", height=12)
        self.shiplist_result_text.pack(fill="both", expand=True, padx=5, pady=(0, 5))

    def process_shiplist_json(self):
        raw = self.shiplist_text.get("1.0", tk.END).strip()
        if not raw:
            messagebox.showerror("Error", "put some json in the damn field")
            return

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            messagebox.showerror("Error", f"Invalid JSON: {e}")
            return

        if isinstance(data, dict) and "ships" in data:
            ships_dict = data["ships"]
        elif isinstance(data, list):
            ships_dict = {str(i): entry for i, entry in enumerate(data)}
        else:
            messagebox.showerror(
                "Error",
                "Expected a JSON object with 'ships', or a raw list of ship-entries."
            )
            return

        owned_ships = []
        for ship_key, entry in ships_dict.items():
            if not isinstance(entry, dict):
                continue
            if entry.get("owned") is True:
                hex_id = entry.get("hex_code") or entry.get("hexCode") or entry.get("hex")
                if hex_id:
                    h = hex_id.strip("{}").upper()
                    owned_ships.append(h)

        if not owned_ships:
            messagebox.showinfo("Result", "lmao poor fuck you own NONE of  those")
            return

        item_name_map = {item["id"]: item["name"] for item in self.item_list}

        aggregated = defaultdict(int)
        missing = []
        four_digit_ship_count = 0
        four_digit_total_value = 0.0

        for hex_id in owned_ships:
            if hex_id not in self.ship_names:
                missing.append(hex_id)
                continue

            history = self.ship_names[hex_id].get("name_history", [])
            if not history:
                missing.append(hex_id)
                continue

            latest_date = max(history, key=lambda x: tuple(map(int, x[0].split("_"))))[0]
            ships_path = os.path.join(self.local_data_dir, latest_date, "ships.json.gz")
            if not os.path.exists(ships_path):
                missing.append(hex_id)
                continue

            try:
                with gzip.open(ships_path, "rb") as f:
                    ships_data = json.load(f)
            except Exception:
                missing.append(hex_id)
                continue

            found = False
            if re.fullmatch(r'[A-Za-z0-9]{4}', hex_id):
                four_digit_ship_count += 1
                four_digit_total_value += 45000.0
            for ship_entry in ships_data:
                ship_hex = ship_entry.get("hex_code", "").strip("{}").upper()
                if ship_hex == hex_id:
                    items = ship_entry.get("items", {}) or {}
                    for sid_str, cnt in items.items():
                        try:
                            sid = int(sid_str)
                        except ValueError:
                            continue
                        aggregated[sid] += int(cnt)
                    found = True
                    break

            if not found:
                missing.append(hex_id)

        output_lines = []
        if missing:
            output_lines.append(
                f"no data for {len(missing)} of your ships - they probably weren't loaded after 2022-11-23, or were created today. Wait for the new logs to drop."
            )
            output_lines.append("missing: " + ", ".join(missing))
            output_lines.append("")

        name_map  = self.item_name_map
        value_map = self.item_value_map

        output_lines.append("")
        output_lines.append(f"{'ID':>3} | {'Name':45} | {'Count':>6} | {'Unit Value':>9} | {'Total Value':>13}")

        grand_total = 0.0
        for sid in sorted(aggregated):
            cnt      = aggregated[sid]
            nm       = name_map.get(sid, f"Item {sid}")
            unit_val = value_map.get(sid, 0.0)
            tot_val  = unit_val * cnt
            grand_total += tot_val
            output_lines.append(
                f"{sid:>7} | {nm:40} | {cnt:7d} | {unit_val:11.2f} | {tot_val:13.2f}"
            )
        if four_digit_ship_count > 0:
            output_lines.append(
                f"{'4d':>7} | {'4 digits':40} | {four_digit_ship_count:7d} | {45000.0:11.2f} | {four_digit_total_value:13.2f}"
            )
            grand_total += four_digit_total_value
        output_lines.append("-"*75)
        output_lines.append(f"{'':>44} Grand Total: {grand_total:12.2f}")

        self.shiplist_result_text.configure(state="normal")
        self.shiplist_result_text.delete("1.0", tk.END)
        for line in output_lines:
            self.shiplist_result_text.insert(tk.END, line + "\n")
        self.shiplist_result_text.configure(state="disabled")

    def _display_current_ship_contents(self, hex_id):
        latest_date = None
        if self.ship_names[hex_id]["name_history"]:

            latest_date = max(
                (tuple(map(int, date.split('_'))), date)
                for date, _ in self.ship_names[hex_id]["name_history"]
            )[1]

        if latest_date:
            self.result_text.insert(tk.END, "\n--- Current Contents (Latest Record) ---\n")
            self._load_and_display_items(hex_id, latest_date)

    def show_ship_contents(self, hex_id, date_str):
        self.current_ship_hex = hex_id
        self.back_button.config(state="normal")
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        try:
            self.result_text.insert(tk.END, f"=== Contents for Ship {{{hex_id}}} on {date_str} ===\n")
            self._load_and_display_items(hex_id, date_str)

        except ValueError:
            self.result_text.insert(tk.END, "\nInvalid date format.\n")

        self.result_text.config(state="disabled")

    def select_ship_from_list(self):
        selection = self.matches_listbox.curselection()
        if selection:
            selected_text = self.matches_listbox.get(selection[0])
            try:
                last_brace = selected_text.rfind('{')
                if last_brace != -1:
                    hex_id = selected_text[last_brace+1:].split('}')[0]
                else:
                    hex_id = selected_text.strip()

                self.display_ship_history(hex_id)
            except Exception as e:
                self.result_text.config(state="normal")
                self.result_text.delete(1.0, tk.END)
                self.result_text.insert(tk.END, f"ship ID has an extra chromosome:\n{str(e)}")
                self.result_text.config(state="disabled")

    def get_ship_name_history(self, hex_id):
        hex_id = hex_id.upper().strip('{}')
        if hex_id not in self.ship_names:
            return []

        return sorted(self.ship_names[hex_id]["name_history"],
                      key=lambda x: tuple(map(int, x[0].split('_'))),
                      reverse=True)

    def export_to_txt(self):
        if not self.filtered_data:
            messagebox.showwarning("Warning", "no data available to export (this is an useless feature i should remove it)")
            return

        content = self.get_filtered_data_as_text()

        if isinstance(content, list):
            content = '\n'.join(content)

        if not content.strip():
            messagebox.showwarning("Warning", "didnt find any data")
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
            messagebox.showinfo("Success", f"exported your shit to {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"couldnt export your shit: {str(e)}")

    def get_filtered_data_as_text(self):
        try:
            start_time = time.time()

            header_lines = [
                f"Date Range: {self.start_year_var.get()}-{self.start_month_var.get()}-{self.start_day_var.get()} to {self.end_year_var.get()}-{self.end_month_var.get()}-{self.end_day_var.get()}",
                f"Filters: Item={self.filter_item_var.get()}, Source={self.filter_source_var.get()}, Dest={self.filter_dest_var.get()}",
                f"Hide non-ship transactions: {'Yes' if self.show_bots.get() else 'No'}",
                f"Using ship names (display only): {'Yes' if self.use_ship_names.get() else 'No'}",
                "=" * 50,
                ""
            ]

            if not self.filtered_data:
                return header_lines + ["No transactions found matching filters"]

            item_name_cache = {item["id"]: item["name"] for item in self.item_list}

            ship_name_cache = {}
            if self.use_ship_names.get():
                for hex_id, data in self.ship_names.items():
                    if 'name_history' in data:
                        history = [(tuple(map(int, date.split('_'))), name)
                                   for date, name in data['name_history']]
                        history.sort()
                        ship_name_cache[hex_id] = {
                            'history': history,
                            'current': data.get('current_name', '')
                        }

            transaction_groups = defaultdict(lambda: {'total': 0, 'first_time': None, 'last_time': None})
            for entry in self.filtered_data:
                if isinstance(entry, dict):
                    key = (
                        entry.get("item"),
                        entry.get("src", "?"),
                        entry.get("dst", "?"),
                        entry.get("zone", "Unknown zone")
                    )
                    count = entry.get("count", 1)
                    timestamp = entry.get("time")

                    transaction_groups[key]['total'] += count
                    if timestamp is not None:
                        if transaction_groups[key]['first_time'] is None or timestamp < transaction_groups[key]['first_time']:
                            transaction_groups[key]['first_time'] = timestamp
                        if transaction_groups[key]['last_time'] is None or timestamp > transaction_groups[key]['last_time']:
                            transaction_groups[key]['last_time'] = timestamp
            output = []

            item_groups = defaultdict(list)
            for key, data in transaction_groups.items():
                item_id, src, dst, zone = key
                total = data['total']
                first_time = data['first_time']
                last_time = data['last_time']
                item_groups[item_id].append((src, dst, zone, total, first_time, last_time))

            summary_lines = ["Summary of filtered data:", ""]

            for item_id, transactions in sorted(item_groups.items(),
                                                key=lambda x: sum(t[3] for t in x[1]), reverse=True):
                item_name = item_name_cache.get(item_id, str(item_id))
                total = sum(t[3] for t in transactions)
                summary_lines.append(f"{item_name}: {total} total items moved")
            output.extend(summary_lines)
            output.append("=" * 50)
            output.append("")

            for item_id, transactions in sorted(item_groups.items(),
                                                key=lambda x: sum(t[3] for t in x[1]),
                                                reverse=True):
                item_name = item_name_cache.get(item_id, str(item_id))
                output.append(f"")
                output.append(f"=== {item_name} ===")

                transactions.sort(key=lambda x: (-x[3], x[4]))

                count_len = max(len(str(t[3])) for t in transactions)

                for src, dst, zone, count, first_time, last_time in transactions:

                    zone = {
                        "Super Special Event Zone": "Mosaic",
                        "Freeport I": "FP I",
                        "Freeport II": "FP II",
                        "Freeport III": "FP III",
                        "The Nest": "Freeport",
                        "Hummingbird": "Hummbird"
                    }.get(zone, zone)

                    src_name = None
                    dst_name = None

                    src_display = {
                        "block - flux": "Flux mine", "block - iron": "Iron mine",
                        "bot - zombie": "Vult Bot", "bot - zombie tank": "Vult Bot 2",
                        "bot - zombie hunter": "Vult Yank", "bot - zombie boss": "Vult Boss",
                        "bot - green roamer": "Green bot", "bot - red hunter": "Red Hunter",
                        "bot - yellow rusher": "YellowRush", "bot - blue melee": "Blue Spike",
                        "bot - red sentry": "Red Sentry", "bot - orange fool": "Orange Fool",
                        "bot - yellow hunter": "Hunter bot", "bot - red sniper": "Red Sniper",
                        "bot - aqua shielder": "Shield bot", "Yellow Mine Bot": "Mine bot",
                        "The Coward": "The Coward", "The Shield Master": "ShieldBoss",
                        "The Lazer Enthusiast": "LazerBoss"
                    }.get(src, src)

                    dst_display = dst

                    if self.use_ship_names.get():
                        src_name = self._get_cached_historical_name(src, first_time, ship_name_cache)
                        dst_name = self._get_cached_historical_name(dst, first_time, ship_name_cache)

                    time_str = self.format_timestamp(first_time)

                    hurt = ""
                    if src_display and src_display[0] == "{":
                        str_parts = src_display.split(" ", 1)
                        src_display = str_parts[0]
                        hurt = " " + str_parts[1] if len(str_parts) > 1 else ""

                    line = (f"[{time_str[:19]:<19}] [{zone[:8]:<8}] || "
                            f"{str(count):<{count_len}}x from {src_display[:10]:<10} to {dst_display[:10]:<10}")
                    if src_name or dst_name:
                        line += " ("
                        if src_name:
                            line += f"src: {src_name}"
                        if dst_name:
                            if src_name:
                                line += ", "
                            line += f"dst: {dst_name}"
                        line += ")"

                    line += f" - {hurt}"

                    output.append(line)

            processing_time = time.time() - start_time
            header_lines.insert(0, "")
            header_lines.insert(0, f"Processing completed in: {processing_time:.2f} seconds")
            return header_lines + output

        except Exception as e:
            return [f"report exploded: {str(e)}\n\nIf no information was given, you probably ran out of RAM. The limit is set to {max_mem_gb}GB. Change this on the first line after the \"import\" things in the code."]

    def _get_cached_historical_name(self, ship_id, timestamp, name_cache):
        try:

            match = re.match(r'\{([0-9A-F]+)\}', ship_id, re.IGNORECASE)
            if not match:
                return None

            hex_id = match.group(1).upper()
            if hex_id not in name_cache:
                return None

            ship_data = name_cache[hex_id]
            if not ship_data.get('history'):
                return ship_data.get('current', '')

            trans_date = datetime.fromtimestamp(timestamp)
            trans_tuple = (trans_date.year, trans_date.month, trans_date.day)

            history = ship_data['history']
            current_name = ship_data['current']

            low, high = 0, len(history)
            while low < high:
                mid = (low + high) // 2
                if history[mid][0] <= trans_tuple:
                    low = mid + 1
                else:
                    high = mid

            return history[low-1][1] if low > 0 else current_name
        except (ValueError, IndexError, AttributeError) as e:

            return None

    def display_ship_history(self, hex_id):
        self.current_ship_hex = hex_id
        self.back_button.config(state="disabled")
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        name_history = self.get_ship_name_history(hex_id)
        current_name = self.ship_names.get(hex_id, {}).get("current_name", "Unknown")

        self.result_text.insert(tk.END, f"=== History for Ship {{{hex_id}}} ===\n\n")
        self.result_text.insert(tk.END, f"Current Name: {current_name}\n")

        all_present_dates = []
        for date_str, ships_on_date_set in self.ships_present_on_date.items():
            if hex_id in ships_on_date_set:
                all_present_dates.append(date_str)

        all_present_dates.sort(key=lambda x: tuple(map(int, x.split('_'))))


        for date_str in all_present_dates:
            name_for_date = "Unknown"
            for hist_date, hist_name in name_history:
                if hist_date == date_str:
                    name_for_date = hist_name
                    break

            tag_name = f"date_present_{date_str}"
            self.result_text.insert(tk.END, f"{date_str} - {name_for_date}\n", tag_name)
            self.result_text.tag_bind(tag_name, "<Button-1>",
                                      lambda e, d=date_str, h=hex_id: self.show_ship_contents(h, d))
            self.result_text.tag_config(tag_name, foreground="blue", underline=False)

        self.result_text.config(state="disabled")
        self.back_button.config(state="disabled")

    def update_display(self):
        if self.current_operation == "none" and self.raw_data:
            self.status_var.set("applying filters... might be slow if ship names are enabled. looking those up takes ages")
            self.root.update_idletasks()

            self.apply_filters()
            self.update_preview()

            self.status_var.set(f"looking at {len(self.filtered_data)} transactions")
        elif not self.raw_data:
            self.status_var.set("No data loaded to filter. Load data first.")

    def update_preview(self):
        content_lines = self.get_filtered_data_as_text()

        self.preview_text.config(state="normal")
        self.preview_text.delete(1.0, tk.END)

        for i, line in enumerate(content_lines):
            tag = "even" if i % 2 == 0 else "odd"
            self.preview_text.insert(tk.END, line + '\n', tag)

        self.preview_text.config(state="disabled")

    def validate_date_range(self):
        try:
            start_date = datetime(
                int(self.start_year_var.get()),
                int(self.start_month_var.get()),
                int(self.start_day_var.get())
            )
            end_date = datetime(
                int(self.end_year_var.get()),
                int(self.end_month_var.get()),
                int(self.end_day_var.get())
            )
            min_date = datetime(2022, 11, 23)
            max_date = datetime.now()

            if start_date < min_date or end_date < min_date:
                messagebox.showerror("Error", "hey the earliest possible date is 2022-11-23")
                return False

            if start_date > max_date or end_date > max_date:
                messagebox.showerror("Error", "time traveler moment")
                return False

            if start_date > end_date:

                messagebox.showwarning("Warning", "Start date is after end date. Swapping them.")
                self.start_year_var.set(end_date.year)
                self.start_month_var.set(end_date.month)
                self.start_day_var.set(end_date.day)
                self.end_year_var.set(start_date.year)
                self.end_month_var.set(start_date.month)
                self.end_day_var.set(start_date.day)

                start_date = datetime(
                    int(self.start_year_var.get()),
                    int(self.start_month_var.get()),
                    int(self.start_day_var.get())
                )
                end_date = datetime(
                    int(self.end_year_var.get()),
                    int(self.end_month_var.get()),
                    int(self.end_day_var.get())
                )

            return True
        except ValueError:
            messagebox.showerror("Error", "invalid date learn your times dumb ass")
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

        has_selection = bool(self.search_combo.selection_present())

        self.search_combo.icursor(cursor_pos)

        if has_selection:
            self.search_combo.selection_range(0, tk.END)

        if self.filtered_items:

            self.search_combo.event_generate('<Down>')

    def start_analysis(self, start_date, end_date, owned_ships=None):
        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "something else is happeningss")
            return

        self.current_operation = "analyzing_ships"
        self.cancel_event.clear()
        self.cancel_button.config(state="normal")
        self.progress['value'] = 0
        self.status_var.set("starting ship analysis")

        analysis_thread = threading.Thread(
            target=self.analyze_ships_thread,
            args=(start_date, end_date, owned_ships),
            daemon=True
        )
        analysis_thread.start()
        self.root.after(100, self.check_download_progress)

    def analyze_ships(self):
        if self.is_operation_in_progress():
            messagebox.showwarning("Warning", "theres something happening cant you see")
            return

        analysis_dialog = tk.Toplevel(self.root)
        analysis_dialog.title("range to analyze (from-to)")
        analysis_dialog.geometry("500x350")
        analysis_dialog.transient(self.root)
        analysis_dialog.grab_set()

        date_frame = ttk.Frame(analysis_dialog)
        date_frame.pack(fill="x", padx=10, pady=5)

        start_frame = ttk.Frame(date_frame)
        start_frame.pack(fill="x", pady=5)
        ttk.Label(start_frame, text="Start Date:").pack(side="left")
        start_year_var = tk.StringVar(value="2022")
        start_month_var = tk.StringVar(value="11")
        start_day_var = tk.StringVar(value="23")
        ttk.Spinbox(start_frame, from_=2022, to=datetime.now().year, textvariable=start_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=12, textvariable=start_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=31, textvariable=start_day_var, width=3).pack(side="left", padx=2)

        end_frame = ttk.Frame(date_frame)
        end_frame.pack(fill="x", pady=5)
        ttk.Label(end_frame, text="End Date:").pack(side="left")
        end_year_var = tk.StringVar(value=datetime.now().year)
        end_month_var = tk.StringVar(value=datetime.now().month)
        end_day_var = tk.StringVar(value=datetime.now().day)
        ttk.Spinbox(end_frame, from_=2022, to=datetime.now().year, textvariable=end_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=12, textvariable=end_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=31, textvariable=end_day_var, width=3).pack(side="left", padx=2)

        shiplist_frame = ttk.LabelFrame(analysis_dialog, text="Shiplist (optional, paste JSON)")
        shiplist_frame.pack(fill="x", padx=10, pady=5)

        self.shiplist_text_analysis_dialog = tk.Text(shiplist_frame, height=4, width=50, wrap="none")
        self.shiplist_text_analysis_dialog.pack(fill="x")

        info_label = ttk.Label(analysis_dialog, text="Copy from: https://drednot.io/shiplist?server=0\nLeave blank to analyze ALL ships")
        info_label.pack(pady=(5, 0))

        def validate_and_start():
            try:
                start_date = datetime(
                    int(start_year_var.get()),
                    int(start_month_var.get()),
                    int(start_day_var.get())
                )
                end_date = datetime(
                    int(end_year_var.get()),
                    int(end_month_var.get()),
                    int(end_day_var.get())
                )
                min_date = datetime(2022, 11, 23)
                max_date = datetime.now()

                if start_date < min_date or end_date < min_date:
                    messagebox.showerror("Error", "hey the earliest possible date is 2022-11-23")
                    return False
                if start_date > max_date or end_date > max_date:
                    messagebox.showerror("Error", "time traveler moment")
                    return False
                if start_date > end_date:
                    start_date, end_date = end_date, start_date

                owned_ships = None
                raw = self.shiplist_text_analysis_dialog.get("1.0", tk.END).strip()
                if raw:
                    try:
                        data = json.loads(raw)
                    except json.JSONDecodeError as e:
                        messagebox.showerror("Error", f"Invalid JSON: {e}")
                        return

                    owned_ships = set()
                    if isinstance(data, dict) and "ships" in data:
                        for ship in data["ships"].values():
                            if ship.get("owned") is True:
                                hex_id = ship.get("hex_code") or ship.get("hexCode") or ship.get("hex")
                                if hex_id:
                                    owned_ships.add(hex_id.strip("{}").upper())
                    elif isinstance(data, list):
                        for ship in data:
                            if isinstance(ship, dict) and ship.get("owned") is True:
                                hex_id = ship.get("hex_code") or ship.get("hexCode") or ship.get("hex")
                                if hex_id:
                                    owned_ships.add(hex_id.strip("{}").upper())

                    if not owned_ships:
                        messagebox.showinfo("Result", "No owned ships found in shiplist. Analyzing ALL ships.")
                        owned_ships = None

                analysis_dialog.destroy()
                self.start_analysis(start_date, end_date, owned_ships)

            except ValueError:
                messagebox.showerror("Error", "Invalid date.")

        btn_frame = ttk.Frame(analysis_dialog)
        btn_frame.pack(fill="x", padx=10, pady=10)
        ttk.Button(btn_frame, text="Analyze", command=validate_and_start).pack(side="right")

    def analyze_ships_thread(self, start_date, end_date, owned_ships=None):
        try:
            dates_to_process = []
            current_date = start_date
            while current_date <= end_date:
                date_str = f"{current_date.year}_{current_date.month}_{current_date.day}"
                dates_to_process.append(date_str)
                current_date += timedelta(days=1)

            dates_to_process.sort(key=lambda x: tuple(map(int, x.split('_'))))

            total_dates = len(dates_to_process)
            self.download_queue.put(("PROGRESS", 0, total_dates, "starting analysis"))

            ship_last_seen = {}
            ship_items = {}
            processed_dates = 0

            for date_str in dates_to_process:
                if self.cancel_event.is_set():
                    self.download_queue.put(("CANCELLED", "analysis stopped"))
                    return

                ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")
                if not os.path.exists(ships_path):
                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates, f"no data for {date_str}"))
                    processed_dates += 1
                    continue

                try:
                    current_date_tuple = tuple(map(int, date_str.split('_')))
                    with gzip.open(ships_path, 'rb') as f:
                        ships_data = json.load(f)

                    for ship in ships_data:
                        hex_code = ship.get("hex_code", "").upper().strip("{}")

                        if hex_code:

                            if owned_ships is None or hex_code in owned_ships:
                                items = ship.get("items", {})

                                if hex_code not in ship_last_seen or current_date_tuple > ship_last_seen[hex_code]:
                                    ship_last_seen[hex_code] = current_date_tuple
                                    ship_items[hex_code] = items

                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates,
                                            f"Processed {date_str} ({processed_dates + 1}/{total_dates})"))
                    processed_dates += 1

                except Exception as e:
                    self.download_queue.put(("ERROR", f"error processing {date_str}: {str(e)}"))

            item_totals = defaultdict(int)
            item_contributions = defaultdict(lambda: defaultdict(int))
            for hex_code, items in ship_items.items():
                for item_id_str, count in items.items():
                    try:
                        item_id = int(item_id_str)
                        item_totals[item_id] += count
                        item_contributions[item_id][hex_code] += count
                    except ValueError:
                        continue

            ship_values = {}
            for hex_code, items in ship_items.items():
                current_ship_value = 0.0
                if re.fullmatch(r'[A-Za-z0-9]{4}', hex_code):
                    current_ship_value += 45000.0

                for item_id_str, count in items.items():
                    try:
                        item_id = int(item_id_str)
                        unit_value = self.item_value_map.get(item_id, 0.0)
                        current_ship_value += unit_value * count
                    except ValueError:
                        continue
                ship_values[hex_code] = current_ship_value

            self.download_queue.put(("ANALYSIS_COMPLETE", (item_totals, item_contributions, ship_values)))

        except Exception as e:
            self.download_queue.put(("ERROR", f"rip analysis {str(e)}"))

    def display_analysis_result(self, result):
        item_totals, item_contributions, ship_values = result

        result_window = tk.Toplevel(self.root)
        result_window.title("Economy Content")
        result_window.geometry("1200x800")
        result_window.minsize(800, 600)
        result_window.transient(self.root)
        result_window.grab_set()

        notebook = ttk.Notebook(result_window)
        notebook.pack(fill="both", expand=True)

        summary_frame = ttk.Frame(notebook)
        notebook.add(summary_frame, text="Item Summary")

        control_frame = ttk.Frame(summary_frame)
        control_frame.pack(fill="x", padx=5, pady=5)

        ttk.Label(control_frame, text="Search:").pack(side="left")
        item_search_var = tk.StringVar()
        item_search_entry = ttk.Entry(control_frame, textvariable=item_search_var, width=30)
        item_search_entry.pack(side="left", padx=5)

        item_sort_options = ["Name (A-Z)", "Count (High-Low)", "Count (Low-High)", "ID"]
        item_sort_var = tk.StringVar(value="Count (High-Low)")
        item_sort_combo = ttk.Combobox(control_frame, textvariable=item_sort_var, values=item_sort_options, state="readonly")
        item_sort_combo.pack(side="left", padx=5)

        export_button = ttk.Button(control_frame, text="Export CSV",
                                   command=lambda: self.export_analysis(item_totals, item_contributions))
        export_button.pack(side="right", padx=5)

        item_tree_container = ttk.Frame(summary_frame)
        item_tree_container.pack(fill="both", expand=True)

        self.analysis_tree = ttk.Treeview(item_tree_container, columns=("item_id", "item_name", "total_count"), show="headings")

        self.analysis_tree.heading("item_id", text="ID", command=lambda: self.sort_treeview(self.analysis_tree, "item_id", True))
        self.analysis_tree.heading("item_name", text="Item Name", command=lambda: self.sort_treeview(self.analysis_tree, "item_name", False))
        self.analysis_tree.heading("total_count", text="Total Count", command=lambda: self.sort_treeview(self.analysis_tree, "total_count", True))

        self.analysis_tree.column("item_id", width=80, anchor="center")
        self.analysis_tree.column("item_name", width=300, anchor="w")
        self.analysis_tree.column("total_count", width=120, anchor="e")

        item_y_scroll = ttk.Scrollbar(item_tree_container, orient="vertical", command=self.analysis_tree.yview)
        item_x_scroll = ttk.Scrollbar(item_tree_container, orient="horizontal", command=self.analysis_tree.xview)
        self.analysis_tree.configure(yscrollcommand=item_y_scroll.set, xscrollcommand=item_x_scroll.set)

        self.analysis_tree.grid(row=0, column=0, sticky="nsew")
        item_y_scroll.grid(row=0, column=1, sticky="ns")
        item_x_scroll.grid(row=1, column=0, sticky="ew")
        item_tree_container.grid_rowconfigure(0, weight=1)
        item_tree_container.grid_columnconfigure(0, weight=1)

        self.analysis_tree.bind("<Double-1>", lambda e: self.show_contributors(item_contributions))

        self.populate_analysis_tree(item_totals, item_contributions, item_search_var.get())

        item_search_var.trace_add("write", lambda *_: self.populate_analysis_tree(item_totals, item_contributions, item_search_var.get()))
        item_sort_var.trace_add("write", lambda *_: self.handle_sort_change(item_sort_var.get(), item_totals, item_contributions))

        ship_leaderboard_frame = ttk.Frame(notebook)
        notebook.add(ship_leaderboard_frame, text="Ship Leaderboard")

        ship_control_frame = ttk.Frame(ship_leaderboard_frame)
        ship_control_frame.pack(fill="x", padx=5, pady=5)

        ttk.Label(ship_control_frame, text="Search Ship:").pack(side="left")
        ship_search_var = tk.StringVar()
        ship_search_entry = ttk.Entry(ship_control_frame, textvariable=ship_search_var, width=30)
        ship_search_entry.pack(side="left", padx=5)
        ship_search_entry.bind('<Return>', lambda e: self.populate_ship_leaderboard_tree(ship_values, ship_search_var.get()))


        ship_sort_options = ["Value (High-Low)", "Value (Low-High)", "Name (A-Z)", "ID"]
        ship_sort_var = tk.StringVar(value="Value (High-Low)")
        ship_sort_combo = ttk.Combobox(ship_control_frame, textvariable=ship_sort_var, values=ship_sort_options, state="readonly")
        ship_sort_combo.pack(side="left", padx=5)

        ship_tree_container = ttk.Frame(ship_leaderboard_frame)
        ship_tree_container.pack(fill="both", expand=True)

        self.ship_leaderboard_tree = ttk.Treeview(ship_tree_container, columns=("rank", "ship_id", "ship_name", "estimated_value"), show="headings")

        self.ship_leaderboard_tree.heading("rank", text="Rank", command=lambda: self.sort_treeview(self.ship_leaderboard_tree, "rank", True))
        self.ship_leaderboard_tree.heading("ship_id", text="Ship ID", command=lambda: self.sort_treeview(self.ship_leaderboard_tree, "ship_id", False))
        self.ship_leaderboard_tree.heading("ship_name", text="Ship Name", command=lambda: self.sort_treeview(self.ship_leaderboard_tree, "ship_name", False))
        self.ship_leaderboard_tree.heading("estimated_value", text="Estimated Value", command=lambda: self.sort_treeview(self.ship_leaderboard_tree, "estimated_value", True))

        self.ship_leaderboard_tree.column("rank", width=60, anchor="center")
        self.ship_leaderboard_tree.column("ship_id", width=120, anchor="center")
        self.ship_leaderboard_tree.column("ship_name", width=300, anchor="w")
        self.ship_leaderboard_tree.column("estimated_value", width=150, anchor="e")

        ship_y_scroll = ttk.Scrollbar(ship_tree_container, orient="vertical", command=self.ship_leaderboard_tree.yview)
        ship_x_scroll = ttk.Scrollbar(ship_tree_container, orient="horizontal", command=self.ship_leaderboard_tree.xview)
        self.ship_leaderboard_tree.configure(yscrollcommand=ship_y_scroll.set, xscrollcommand=ship_x_scroll.set)

        self.ship_leaderboard_tree.grid(row=0, column=0, sticky="nsew")
        ship_y_scroll.grid(row=0, column=1, sticky="ns")
        ship_x_scroll.grid(row=1, column=0, sticky="ew")
        ship_tree_container.grid_rowconfigure(0, weight=1)
        ship_tree_container.grid_columnconfigure(0, weight=1)

        self.ship_leaderboard_tree.bind("<Double-1>", lambda e: self.open_ship_lookup_from_leaderboard())

        self.populate_ship_leaderboard_tree(ship_values, ship_search_var.get())

        ship_sort_var.trace_add("write", lambda *_: self.handle_ship_sort_change(ship_sort_var.get(), ship_values))

        notebook.select(summary_frame)

    def populate_analysis_tree(self, item_totals, contributions, search_term=""):
        self.analysis_tree.delete(*self.analysis_tree.get_children(item=''))
        item_name_map = {item["id"]: item["name"] for item in self.item_list}

        filtered_items = [
            (item_id, count, item_name_map.get(item_id, f"Unknown ({item_id})"))
            for item_id, count in item_totals.items()
            if search_term.lower() in item_name_map.get(item_id, "").lower()
               or search_term.lower() in str(item_id)
        ]

        for item_id, count, name in filtered_items:
            self.analysis_tree.insert("", "end", values=(item_id, name, f"{count:,}"))

    def populate_ship_leaderboard_tree(self, ship_values, search_term=""):
        self.ship_leaderboard_tree.delete(*self.ship_leaderboard_tree.get_children(item=''))

        filtered_ships = []
        for hex_id, value in ship_values.items():
            ship_name = self.ship_names.get(hex_id, {}).get("current_name", "Unknown")
            if search_term.lower() in hex_id.lower() or search_term.lower() in ship_name.lower():
                filtered_ships.append((hex_id, ship_name, value))

        filtered_ships.sort(key=lambda x: x[2], reverse=True)

        for rank, (hex_id, ship_name, value) in enumerate(filtered_ships, start=1):
            self.ship_leaderboard_tree.insert("", "end", values=(
                f"#{rank}",
                hex_id,
                ship_name,
                f"{value:,.2f}"
            ))

    def open_ship_lookup_from_leaderboard(self):
        selected = self.ship_leaderboard_tree.selection()
        if not selected:
            return

        ship_id = self.ship_leaderboard_tree.item(selected[0], "values")[1]

        if not hasattr(self, 'lookup_window') or not self.lookup_window.winfo_exists():
            self.lookup_ship_name()
        self.display_ship_history(ship_id.strip("{}"))
        self.lookup_window.lift()

    def sort_treeview(self, tree, col, reverse):
        items = [(tree.set(k, col), k) for k in tree.get_children('')]

        if col in ("item_id", "total_count", "rank", "estimated_value"):

            def sort_key(x):
                try:

                    return float(x[0].replace('#', '').replace(',', ''))
                except ValueError:
                    return x[0].lower()
            items.sort(key=sort_key, reverse=reverse)
        else:

            items.sort(key=lambda x: x[0].lower(), reverse=reverse)

        for index, (_, k) in enumerate(items):
            tree.move(k, '', index)

        tree.heading(col, command=lambda: self.sort_treeview(tree, col, not reverse))

    def handle_sort_change(self, sort_option, item_totals, contributions):
        if sort_option == "Count (High-Low)":
            sorted_items = sorted(item_totals.items(), key=lambda x: -x[1])
        elif sort_option == "Count (Low-High)":
            sorted_items = sorted(item_totals.items(), key=lambda x: x[1])
        elif sort_option == "Name (A-Z)":
            sorted_items = sorted(
                item_totals.items(),
                key=lambda x: self.item_name_map.get(x[0], "")
            )
        elif sort_option == "Name (Z-A)":
            sorted_items = sorted(
                item_totals.items(),
                key=lambda x: self.item_name_map.get(x[0], ""),
                reverse=True
            )
        else:
            sorted_items = sorted(item_totals.items(), key=lambda x: x[0])

        self.populate_analysis_tree(dict(sorted_items), contributions)

    def handle_ship_sort_change(self, sort_option, ship_values):
        filtered_ships = []
        for hex_id, value in ship_values.items():
            ship_name = self.ship_names.get(hex_id, {}).get("current_name", "Unknown")
            filtered_ships.append((hex_id, ship_name, value))

        if sort_option == "Value (High-Low)":
            filtered_ships.sort(key=lambda x: x[2], reverse=True)
        elif sort_option == "Value (Low-High)":
            filtered_ships.sort(key=lambda x: x[2], reverse=False)
        elif sort_option == "Name (A-Z)":
            filtered_ships.sort(key=lambda x: x[1].lower())
        elif sort_option == "ID":
            filtered_ships.sort(key=lambda x: x[0].lower())

        self.ship_leaderboard_tree.delete(*self.ship_leaderboard_tree.get_children(item=''))
        for rank, (hex_id, ship_name, value) in enumerate(filtered_ships, start=1):
            self.ship_leaderboard_tree.insert("", "end", values=(
                f"#{rank}",
                hex_id,
                ship_name,
                f"{value:,.2f}"
            ))

    def show_contributors(self, item_contributions):
        selected = self.analysis_tree.selection()
        if not selected:
            return

        item_id = int(self.analysis_tree.item(selected[0], "values")[0])
        contributions = item_contributions.get(item_id, {})

        detail_win = tk.Toplevel()
        detail_win.title(
            f"Contributors for Item {item_id} "
            f"({self.item_name_map.get(item_id, 'Unknown Item')})"
        )
        detail_win.geometry("1000x500")
        detail_win.transient(self.root)
        detail_win.grab_set()

        tree = ttk.Treeview(detail_win, columns=("rank", "ship_id", "ship_name", "count"), show="headings")
        tree.heading("rank", text="Rank", anchor="w")
        tree.heading("ship_id", text="Ship ID", anchor="w")
        tree.heading("ship_name", text="Ship Name", anchor="w")
        tree.heading("count", text="Count", anchor="e")

        tree.column("rank", width=50, stretch=False)
        tree.column("ship_id", width=150)
        tree.column("ship_name", width=300)
        tree.column("count", width=100)

        vsb = ttk.Scrollbar(detail_win, orient="vertical", command=tree.yview)
        hsb = ttk.Scrollbar(detail_win, orient="horizontal", command=tree.xview)
        tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")

        sorted_contribs = sorted(contributions.items(), key=lambda x: -x[1])
        for rank, (ship_id, count) in enumerate(sorted_contribs, start=1):
            name = self.ship_names.get(ship_id, {}).get("current_name", "Unknown")
            tree.insert("", "end", values=(
                f"#{rank}",
                ship_id,
                name,
                f"{count:,}"
            ))

        detail_win.grid_rowconfigure(0, weight=1)
        detail_win.grid_columnconfigure(0, weight=1)

        context_menu = tk.Menu(detail_win, tearoff=0)
        context_menu.add_command(label="Sort by Rank",
                                 command=lambda: self.sort_treeview(tree, "rank", False))
        context_menu.add_command(label="Sort by Count",
                                 command=lambda: self.sort_treeview(tree, "count", True))

        tree.bind("<Button-3>", lambda e: context_menu.tk_popup(e.x_root, e.y_root))
        tree.bind("<Double-1>", lambda e: self.open_ship_lookup(tree))

    def export_analysis(self, item_totals, contributions):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text Files (CSV base but fuck that extension)", "*.txt"), ("CSV Files", "*.csv"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        try:
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Item ID", "Item Name", "Total Count", "Top Contributor ID", "Top Contributor Name", "Top Contribution Count"])

                item_name_map = {item["id"]: item["name"] for item in self.item_list}
                for item_id, total in item_totals.items():
                    contribs = contributions.get(item_id, {})

                    top_contrib = max(contribs.items(), key=lambda x: x[1], default=(None, 0))
                    writer.writerow([
                        item_id,
                        item_name_map.get(item_id, "Unknown"),
                        total,
                        top_contrib[0] or "",
                        self.ship_names.get(top_contrib[0], {}).get("current_name", "") if top_contrib[0] else "",
                        top_contrib[1] if top_contrib[0] else ""
                    ])
            messagebox.showinfo("Success", f"Analysis exported to {file_path}")
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export: {str(e)}")

if __name__ == "__main__":
    set_memory_limit()

    root = tk.Tk()
    app = EconLogScourer(root)
    root.mainloop()
