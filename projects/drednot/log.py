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

max_mem_gb = 3.5

def set_memory_limit():
    max_mem_bytes = 1024 * 1024 * round(1024 * max_mem_gb)

    if platform.system() == 'Linux':
        import resource

        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        resource.setrlimit(resource.RLIMIT_AS, (max_mem_bytes, hard))
    elif platform.system() == 'Windows':
        import ctypes

    else:
        print(f"Warning: Memory limiting not working for {platform.system()} - careful you dont crash!")

ITEM_DB = [
    [1, "Iron"], [2, "Explosives"], [4, "Rubber"], [5, "Flux"], [6, "Fuel"],
    [49, "Compressed Explosives"], [50, "Compressed Iron"], [51, "Volleyball"],
    [52, "Golden Volleyball"], [53, "Basketball"], [54, "Golden Basketball"],
    [55, "Beachball"], [56, "Football"], [100, "Wrench"], [101, "Shredder"],
    [102, "Golden Shredder"], [103, "Repair Tool"], [104, "Handheld Pusher"],
    [105, "Shield Booster"], [106, "Embiggener"], [107, "Shrinkinator"],
    [108, "Backpack"], [109, "Speed Skates"], [110, "Booster Boots"],
    [111, "Launcher Gauntlets"], [112, "Construction Gauntlets"], [113, "Rocketpack"],
    [114, "Hoverpack"], [115, "Manifest"], [116, "BOM"], [120, "Blueprint Scanner"],
    [122, "RCD"], [123, "Shield Core"], [150, "Standard Ammo"], [151, "Scattershot Ammo"],
    [152, "Flak Ammo"], [153, "Sniper Ammo"], [154, "Punch Ammo"], [155, "Yank Ammo"],
    [156, "Slug Ammo"], [159, "Booster Fuel (low)"], [160, "Booster Fuel (high)"],
    [162, "Rapid Fire"], [163, "Rapid Fire Depleted"], [164, "Preservation"],
    [165, "Preservation Depleted"], [166, "Cooling Cell"], [167, "Hot Cooling Cell"],
    [168, "Burst Charge"], [215, "Helm"], [217, "Comms"], [218, "Sign"],
    [219, "Spawn"], [220, "Door"], [221, "Cargo Hatch"], [223, "Cargo Ejector"],
    [224, "Turret Controller"], [226, "Cannon / RC"], [228, "Burst"], [229, "Machine / Auto"],
    [230, "Thruster"], [232, "Iron block"], [233, "Rubber block"], [234, "Ice / Glass block"],
    [235, "Ladder"], [236, "Walkway"], [237, "Item net"], [239, "Paint"],
    [240, "Expando box"], [241, "Safety anchor"], [242, "Pusher"], [243, "Item launcher"],
    [245, "Recycler"], [246, "Legacy"], [248, "Munitions fabricator"], [249, "Engineering fabricator"],
    [251, "Equipment fabricator"], [252, "Loader"], [253, "Lockdown override unit"],
    [255, "Fluid Tank"], [256, "Shield Generator"], [257, "Shield Projector"],
    [258, "Enhanced Turret Controller"], [262, "Logistic Rail"], [263, "Acute"],
    [264, "MSU / Munition supply unit"], [265, "Obtuse"], [305, "Golden Null"], [307, "Silver Null"],
    [306, "Bug Hunter"], [326, "Open lootbox"], [327, "Closed lootbox"],
    [225, "Manual turret (Deprecated)"],[3, "Silica (Deprecated)"], [250, "Machine Fabricator (Deprecated)"],[100000,"Unknown Item"],
    [244, "Old Loader"],

    [117, "Starter Wrench"],
    [118, "Starter Shredder"],
    [119, "Hand Cannon"],
    [121, "Sandbox RCD"],
    [157, "Trash Box"],
    [161, "Void Orb"],
    [216, "Starter Helm"],
    [222, "Starter Hatch"],
    [227, "Starter Cannon"],
    [231, "Starter Thruster"],
    [247, "Starter Fab"],
    [261, "Navigation Unit"],
    [254, "Annihilator Tile"],
    [259, "Bulk Ejector "],
    [260, "Bulk Loading Bay Designator"],
    [300, "Eternal Bronze Wrench"],
    [301, "Eternal Silver Wrench"],
    [302, "Eternal Gold Wrench"],
    [303, "Eternal Flux Wrench"],
    [304, "Eternal Platinum Wrench"],
    [308, "Bronze Wrench"],
    [309, "Silver Wrench"],
    [310, "Gold Wrench"],
    [311, "Platinum Wrench"],
    [312, "Flux Wrench"],
    [313, "Lesser Cap"],
    [314, "Goofy Glasses"],
    [315, "Shades"],
    [316, "Top Hat"],
    [317, "Demon Horns"],
    [318, "Alien Mask"],
    [319, "Clown Mask"],
    [320, "Goblin Mask"],
    [321, "Pumpkin"],
    [322, "Witch Hat"],
    [323, "Wild Gremlin (Red)"],
    [324, "Wild Gremlin (Orange)"],
    [325, "Wild Gremlin (Yellow)"]
]

class EconLogScourer:
    def __init__(self, root):
        self.root = root
        self.root.title("Dredark Log Scourer v 1.3 - by Dutchman")

        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.root.rowconfigure(0, weight=1)
        self.root.columnconfigure(0, weight=1)

        self.raw_data = []  
        self.filtered_data = []  
        self.ship_names = {}  
        self.all_items = [f"{item[0]}: {item[1]}" for item in ITEM_DB]
        self.filtered_items = self.all_items.copy()
        self.show_bots = tk.BooleanVar(value=True)
        self.text_size_var = tk.IntVar(value=10)
        self.wrap_text_var = tk.BooleanVar(value=False)
        self.use_ship_names = tk.BooleanVar(value=False)  

        self._last_dates_processed = []
        self.status_var = tk.StringVar(value="Initializing...")

        self.download_queue = queue.Queue()
        self.cancel_event = threading.Event()

        self.download_in_progress = False
        self.ship_loading_in_progress = False

        self.filter_item_var = tk.StringVar()
        self.filter_source_var = tk.StringVar()
        self.filter_dest_var = tk.StringVar()

        self.start_year_var = tk.StringVar(value="2022")
        self.start_month_var = tk.StringVar(value="11")
        self.start_day_var = tk.StringVar(value="23")
        self.end_year_var = tk.StringVar(value="2022")
        self.end_month_var = tk.StringVar(value="11")
        self.end_day_var = tk.StringVar(value="23")

        if platform.system() == 'Windows':

            base_path = os.path.join(os.getenv('LOCALAPPDATA'), 'DredarkLogScourer')
        else:

            base_path = os.path.join(os.path.expanduser('~'), '.local', 'share', 'DredarkLogScourer')
        print(f"Data log files will be saved to {base_path}")

        self.local_data_dir = os.path.join(base_path, "drednot_data_raw")
        os.makedirs(self.local_data_dir, exist_ok=True)

        self.create_widgets()
        self.configure_text_tags()
        self.apply_display_settings()

        self.check_and_download_data()

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
            if '_' in entry and entry.count('_') == 2:
                existing_dates.add(entry)

        today = datetime.now()
        date_to_check = datetime(2022, 11, 23)  
        dates_to_download = []

        while date_to_check <= today:
            date_str = f"{date_to_check.year}_{date_to_check.month}_{date_to_check.day}"
            if date_str not in existing_dates:
                if not dates_to_download:
                    dates_to_download.append(date_to_check - timedelta(days=1))
                dates_to_download.append(date_to_check)
            date_to_check += timedelta(days=1)

        if not dates_to_download:
            self.status_var.set("data's all good and updated")
            return;

        self.progress["maximum"] = len(dates_to_download)
        self.progress["value"] = 0

        self.download_in_progress = True
        download_thread = threading.Thread(
            target=self.download_dates_thread,
            args=(dates_to_download,),
            daemon=True
        )
        download_thread.start()
        self.root.after(100, self.check_download_progress)

    def download_dates_thread(self, dates_to_download):
        try:
            total_dates = len(dates_to_download)
            success_count = 0

            for i, date in enumerate(dates_to_download):
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "cancelled loading - retry if this is an error the cancel button is still buggy lol"))
                    self.raw_data = []
                    return

                date_str = f"{date.year}_{date.month}_{date.day}"
                base_url = "https://pub.drednot.io/prod/econ"

                self.download_queue.put(("PROGRESS", i + 1, total_dates,
                                    f"downloading {date_str} ({i+1}/{total_dates}). Your files are located at {base_path}"))

                try:
                    ships_url = f"{base_url}/{date_str}/ships.json.gz"
                    with requests.get(ships_url, stream=True, timeout=30) as r:
                        r.raise_for_status()

                        date_dir = os.path.join(self.local_data_dir, date_str)
                        os.makedirs(date_dir, exist_ok=True)

                        ships_path = os.path.join(date_dir, "ships.json.gz")
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
                    raise  
                except requests.exceptions.RequestException as e:
                    print(f"aw man couldnt load data for {date_str}: {str(e)}, sorry cuh. this is most likely just the dredark server screaming at you for downloading {total_dates * 2} files which is a lot. after downloading is complete, restart the program and it will go over all the missing files again.")
                    continue

            self.download_queue.put(("COMPLETE", success_count, total_dates))

        except Exception as e:
            self.download_queue.put(("ERROR", str(e)))

    def is_operation_in_progress(self):
        return (self.download_in_progress or
                (hasattr(self, 'loading_thread') and self.loading_thread.is_alive()))

    def on_closing(self):
        if self.is_operation_in_progress():
            if messagebox.askokcancel(
                "something is still going on\n"
                "you sure?",
                icon=messagebox.WARNING
            ):
                self.download_in_progress=False  
                self.root.destroy()
        else:
            self.root.destroy()

    def start_ship_data_loading(self):
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

            "Loading Data": """LOADING DATA
On startup, the program will download all neccesarry data.

Set the date range with the top-left and top-right inputs.
- Start Date: First day to include (from 2022-11-23)
- End Date: Last day to include (to today)
Everything in between will be loaded when clicking the "Load Data" button, keeping the filters in mind.

The filters help to save a bit of RAM, since the econ logs take a shitton of it.
DO NOT TRY TO LOAD OVER 2 MONTHS OF DATA WITHOUT FILTERS - THE PROGRAM WILL MOST LIKELY CRASH!
DO NOT TRY TO LOAD OVER 2 MONTHS OF DATA WITHOUT FILTERS - THE PROGRAM WILL MOST LIKELY CRASH!
            """,

            "Filtering": """FILTERING DATA

Item Filter:
    Type in the item filter box.
    Press enter once to view the dropdown
    Press enter again to select the top one, or select another in the dropdown menu.

Source/Destination Filters:
    Type an ID, ship name, or bot name (see below) into here to search for it. Not case sensitive. If you want to search by ship name, you have to check the "Use Ship Names" box.

Other Filters:
    "Only show ship transactions": Does what it says off the tin - check this box and it will hide all despawned items, and all bot to player transactions.
    - "Use ship names": Display ship names together with IDs. Will add a couple seconds to the filtering process..
        Clicking this for the first time will load about 250MB of data as of April 2025 into RAM, it won't unload until you exit.

Press Enter in a text field or the Refresh button to apply filters after changing them.

SEARCHING BY BOT:
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

        "Yellow Mine Bot": "Mine bot", (Annoying mine bot)
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

            "Exporting": """EXPORTING DATA

To save your filtered data to a file:
    1. Put your filters the way you want
    2. Click the export button
    3. Choose a save location
    4. Click Save

The exported file will contain all transactions matching your current filters, formatted the same way as shown in the preview.
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
        date_frame.columnconfigure(0, weight=1)  
        date_frame.columnconfigure(1, weight=0)  
        date_frame.columnconfigure(2, weight=0)  
        date_frame.columnconfigure(3, weight=0)  
        date_frame.columnconfigure(4, weight=1)  

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
               command=self.toggle_ship_names).pack(side="left", padx=5)

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
        button_frame.columnconfigure(0, weight=1)
        button_frame.columnconfigure(1, weight=1)
        button_frame.columnconfigure(2, weight=1)
        button_frame.columnconfigure(3, weight=1)

        ttk.Button(button_frame, text="Lookup Ship Name", command=self.lookup_ship_name).grid(
            row=0, column=0, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Export to TXT", command=self.export_to_txt).grid(
            row=0, column=1, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Refresh", command=self.update_display).grid(
            row=0, column=2, padx=5, sticky="sew")
        ttk.Button(button_frame, text="Analyze Items", command=self.analyze_ships).grid(
            row=0, column=3, padx=5, sticky="sew")

        self.root.minsize(720, 300)

    def toggle_ship_names(self):
        if self.use_ship_names.get():
            if not self.ship_names:

                self.status_var.set("loading ship names...")
                self.progress["value"] = 0
                self.download_in_progress = True
                self.start_ship_data_loading()
        else:
            self.update_display()

    def set_same(self):
        self.end_year_var.set(self.start_year_var.get())
        self.end_month_var.set(self.start_month_var.get())
        self.end_day_var.set(self.start_day_var.get())

    def open_settings_menu(self):
        settings_win = tk.Toplevel(self.root)
        settings_win.title("Text Settings")
        settings_win.resizable(False, False)

        ttk.Label(settings_win, text="Text Size:").grid(row=0, column=0, sticky="w", padx=10, pady=5)
        text_size_entry = ttk.Entry(settings_win, textvariable=self.text_size_var, width=5)
        text_size_entry.grid(row=0, column=1, sticky="w", padx=5)
        text_size_entry.bind("<Return>", lambda e: self.apply_display_settings())

        ttk.Label(settings_win, text="Wrap Text:").grid(row=1, column=0, sticky="w", padx=10, pady=5)
        ttk.Checkbutton(
            settings_win, variable=self.wrap_text_var,
            command=self.apply_display_settings
        ).grid(row=1, column=1, sticky="w")

        ttk.Button(settings_win, text="Close", command=settings_win.destroy).grid(
            row=3, column=0, columnspan=6, pady=10
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
            processed_ships = 0

            all_dates = []
            for entry in os.listdir(self.local_data_dir):
                if entry.count('_') == 2:  
                    all_dates.append(entry)

            all_dates.sort(key=lambda x: tuple(map(int, x.split('_'))))

            total_dates = len(all_dates)
            self.download_queue.put(("SHIP_PROGRESS", 0, total_dates, "starting loading ship data"))

            for i, date_str in enumerate(all_dates):
                if not self.download_in_progress:
                    break  

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

                        current_name = ship.get("name", "").strip()

                        if hex_code not in self.ship_names:
                            self.ship_names[hex_code] = {
                                "current_name": current_name,
                                "name_history": []
                            }

                        hist = self.ship_names[hex_code]["name_history"]
                        hist.append((date_str, current_name))
                        self.ship_names[hex_code]["current_name"] = current_name

                    processed_ships += len(day_ships_data)

                except Exception as e:
                    print(f"error loading {date_str}'s ships: {str(e)}")

                self.download_queue.put(("SHIP_PROGRESS", i+1, total_dates,
                                    f"processing {date_str} ({i+1}/{total_dates})"))

            if self.download_in_progress:
                self.download_queue.put(("SHIP_COMPLETE", len(self.ship_names)))
            else:
                self.download_queue.put(("SHIP_ERROR", "cancelled"))

        except Exception as e:
            self.download_queue.put(("SHIP_ERROR", f"bad error: {str(e)}"))

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

                    elif data[0] == "COMPLETE":
                        total_trans, filtered_count = data[1], data[2]
                        self.download_complete(total_trans, filtered_count)

                    elif data[0] == "ERROR":
                        error_msg = data[1]
                        self.download_error(error_msg)

                    elif data[0] == "CANCELLED":
                        self._handle_cancellation()

                    elif data[0] == "SHIP_PROGRESS":
                        current, total, status = data[1], data[2], data[3]
                        self.progress["maximum"] = total
                        self.progress["value"] = current
                        self.status_var.set(f"loading ship data {status}")

                    elif data[0] == "SHIP_COMPLETE":
                        total_ships = data[1]
                        self.status_var.set(f"loaded {total_ships} ship names and contents, that cost about {round(total_ships * 0.0121277) * 0.1}MB of RAM. nice") 
                        self.progress["value"] = 0
                        self.download_in_progress = False
                        self.update_display()

                    elif data[0] == "SHIP_ERROR":
                        error_msg = data[1]
                        messagebox.showerror("Error", f"ship data loading failde: {error_msg}")
                        self.status_var.set("couldn't load ship data ): try again or live with it")
                        self.progress["value"] = 0
                        self.download_in_progress = False

                    elif data[0] == "ANALYSIS_COMPLETE":
                        result = data[1]
                        self.display_analysis_result(result)
                        self.download_in_progress = False
                        self.progress["value"] = 0
                        self.status_var.set("looked at all known ships and their contents")

                except queue.Empty:
                    break

        except Exception as e:
            messagebox.showerror("Error", f"progress check failed: {str(e)}. rip")
            self.progress["value"] = 0
            self.download_in_progress = False

        if self.download_in_progress:
            self.root.after(100, self.check_download_progress)

    def _handle_cancellation(self):
        self.status_var.set("Cancelled")
        self.progress["value"] = 0
        self.cancel_button.config(state="disabled")
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
            source_filter = self.filter_source_var.get().lower() if isinstance(self.filter_source_var.get(), str) else ""
            dest_filter = self.filter_dest_var.get().lower() if isinstance(self.filter_dest_var.get(), str) else ""
            hide_bots = self.show_bots.get()

            item_id = None
            if item_filter:
                try:
                    item_id = int(item_filter.split(":")[0])
                except (ValueError, IndexError):
                    pass

            for i, date_str in enumerate(dates_to_process):
                if self.cancel_event.is_set():
                    break
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "loading cancelled"))
                    self.raw_data = []
                    return

                log_path = os.path.join(self.local_data_dir, date_str, "log.json.gz")

                if not os.path.exists(log_path) or os.path.getsize(log_path) == 0:
                    print(f"i skipped an empty/missing file: {log_path}")
                    continue

                progress = i + 1
                self.download_queue.put(("PROGRESS", progress, total_dates,
                                        f"Processed {date_str} ({progress}/{total_dates}) - {len(self.raw_data)} filtered"))

                with gzip.open(log_path, 'rb') as f:
                    if self.cancel_event.is_set():
                        break
                    day_log_data = json.load(f)

                    total_transactions += len(day_log_data)

                    filtered_day_data = []
                    for entry in day_log_data:
                        if not isinstance(entry, dict):
                            continue

                        if item_id is not None and entry.get("item") != item_id:
                            continue

                        if hide_bots:
                            current_src = str(entry.get("src", "")).lower()
                            current_dst = str(entry.get("dst", "")).lower()
                            if not (current_src.startswith('{') and current_dst.startswith('{')):
                                continue

                        if source_filter:
                            current_src = str(entry.get("src", "")).lower()
                            src_clean = current_src.strip('{}')
                            if (source_filter not in current_src and
                                (src_clean not in self.ship_names or
                                source_filter not in str(self.ship_names.get(src_clean, "")).lower())):
                                continue

                        if dest_filter:
                            current_dst = str(entry.get("dst", "")).lower()
                            dst_clean = current_dst.strip('{}')
                            if (dest_filter not in current_dst and
                                (dst_clean not in self.ship_names or
                                dest_filter not in str(self.ship_names.get(dst_clean, "")).lower())):
                                continue

                        filtered_day_data.append(entry)

                    self.raw_data.extend(filtered_day_data)

                gc.collect()

            self.download_queue.put(("COMPLETE", total_transactions, len(self.raw_data)))

        except Exception as e:
            self.download_queue.put(("ERROR", str(e)))

    def _passes_filters(self, entry):
        if not isinstance(entry, dict):
            return False

        item_filter = self.filter_item_var.get()
        source_filter = self.filter_source_var.get().lower() if isinstance(self.filter_source_var.get(), str) else ""
        dest_filter = self.filter_dest_var.get().lower() if isinstance(self.filter_dest_var.get(), str) else ""
        hide_bots = self.show_bots.get()

        current_item = entry.get("item")
        current_src = str(entry.get("src", "?")).lower()
        current_dst = str(entry.get("dst", "?")).lower()

        if item_filter:
            try:
                item_id = int(item_filter.split(":")[0])
                if current_item != item_id:
                    return False
            except (ValueError, IndexError):
                pass

        if hide_bots:
            if not (current_src.startswith('{') and current_dst.startswith('{')):
                return False

        if source_filter:
            src_clean = current_src.strip('{}')
            if (source_filter not in current_src and
                (src_clean not in self.ship_names or
                source_filter not in str(self.ship_names.get(src_clean, "")).lower())):
                return False

        if dest_filter:
            dst_clean = current_dst.strip('{}')
            if (dest_filter not in current_dst and
                (dst_clean not in self.ship_names or
                dest_filter not in str(self.ship_names.get(dst_clean, "")).lower())):
                return False

        return True

    def process_log_data(self, log_data):
        if not isinstance(log_data, list):
            return []

        filtered_data = []
        for entry in log_data:
            try:
                if not isinstance(entry, dict):
                    continue

            except (KeyError, IndexError) as e:
                print(f"wrong log entry: {e}")
                continue
        return filtered_data

    def load_data(self):
        if not self.validate_date_range():
            return

        if self.download_in_progress:
            messagebox.showwarning("Warning", "somethnig is already loading you impatient bum")
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
        self.download_in_progress = True

        download_thread = threading.Thread(
            target=self.download_data_thread,
            args=(dates_to_process,),
            daemon=True
        )
        download_thread.start()

        self.root.after(100, self.check_download_progress)

    def apply_filters(self):
        item_filter = self.filter_item_var.get()
        source_filter = self.filter_source_var.get().lower()
        dest_filter = self.filter_dest_var.get().lower()
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
            current_src = str(entry.get("src", "")).lower()
            current_dst = str(entry.get("dst", "")).lower()

            if item_id is not None and current_item != item_id:
                continue

            if hide_bots and not (current_src.startswith('{') and current_dst.startswith('{')):
                continue

            if source_filter:
                src_match = source_filter in current_src
                if not src_match and self.use_ship_names.get():
                    src_clean = current_src.strip('{}')
                    if src_clean in self.ship_names:
                        ship_name = self.ship_names[src_clean].get("current_name", "").lower()
                        src_match = source_filter in ship_name
                if not src_match:
                    continue

            if dest_filter:
                dst_match = dest_filter in current_dst
                if not dst_match and self.use_ship_names.get():
                    dst_clean = current_dst.strip('{}')
                    if dst_clean in self.ship_names:
                        ship_name = self.ship_names[dst_clean].get("current_name", "").lower()
                        dst_match = source_filter in ship_name
                if not dst_match:
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
        self.cancel_event.set()
        self.status_var.set("Cancelling...")
        self.cancel_button.config(state="disabled")

    def download_complete(self, total_transactions, filtered_count):
        self.download_in_progress = False
        self.cancel_button.config(state="disabled")  
        self.progress["value"] = self.progress["maximum"]
        self.status_var.set(f"finished loading shit! gone trough {total_transactions} transactions, {filtered_count} after filters")
        messagebox.showinfo("Success", f"loaded {total_transactions} transactions, {filtered_count} after filters")

        self.filtered_data = self.raw_data.copy()
        self.update_preview()

    def download_error(self, error_msg):
        self.download_in_progress = False
        self.cancel_button.config(state="disabled")  
        messagebox.showerror("Error", f"data loading did boom this is 10000% your fault fuck you for breaking it no tech support for you: {error_msg}")
        self.status_var.set("data loading failed")

    def lookup_ship_name(self):
        if self.ship_loading_in_progress or self.download_in_progress:
            messagebox.showwarning("Warning", "Data is being loaded, wait up you impatient fuck")
            return

        if not self.ship_names:

            self.status_var.set("loading all ship names")
            self.progress["value"] = 0
            self.download_in_progress = True
            self.start_ship_data_loading()
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
        search_type_frame = ttk.Frame(input_frame)
        search_type_frame.pack(fill="x", pady=5)

        ttk.Label(search_type_frame, text="Search by:").pack(side="left")
        ttk.Radiobutton(search_type_frame, text="ID", variable=self.search_type, value="id").pack(side="left", padx=5)
        self.name_radio_button = ttk.Radiobutton(search_type_frame, text="Name", variable=self.search_type, value="name")
        self.name_radio_button.pack(side="left", padx=5)

        self.back_button = ttk.Button(
            input_frame,
            text="←",
            command=lambda: self.display_ship_history(self.current_ship_hex),
            state="disabled"
        )
        self.back_button.pack(side="right")

        self.case_sensitive = tk.BooleanVar(value=False)
        ttk.Checkbutton(search_type_frame, text="Case sensitive", variable=self.case_sensitive).pack(side="left", padx=5)

        self.fuzzy_search = tk.BooleanVar(value=True)
        fuzzy_btn = ttk.Checkbutton(
            search_type_frame,
            text="Enable Searching",
            variable=self.fuzzy_search,
            command=self.toggle_fuzzy_search
        )
        fuzzy_btn.pack(side="left", padx=5)

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
                current_name = data.get("current_name", "")
                historical_names = [name for _, name in data.get("name_history", [])]

                comp_hex = hex_id if case_sensitive else hex_id.upper()
                comp_name = current_name if case_sensitive else current_name.upper()
                comp_historical = [name if case_sensitive else name.upper() for name in historical_names]

                match = False

                if use_wildcard:

                    if search_type == "id":
                        match = regex_pattern.match(comp_hex)
                    else:
                        name_match = regex_pattern.match(comp_name)
                        hist_match = any(regex_pattern.match(name) for name in comp_historical)
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
        self.back_button.config(state="normal")
        ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")

        if not os.path.exists(ships_path):
            self.result_text.insert(tk.END, "\ndata missing for this date idk")
            return

        try:
            with gzip.open(ships_path, "rb") as f:
                ships_data = json.load(f)

            item_name_map = {item[0]: item[1] for item in ITEM_DB}
            found = False

            for ship in ships_data:

                ship_hex = ship.get("hex_code", "").strip("{}").upper()
                target_hex = hex_id.strip("{}").upper()

                if ship_hex == target_hex:  
                    items = ship.get("items", {})
                    if not items:
                        self.result_text.insert(tk.END, "\nNo items recorded")
                        return

                    sorted_items = sorted(
                        items.items(),
                        key=lambda x: int(x[0])
                    )
                    self.result_text.insert(tk.END, "\nItem ID | Count | Item Name\n")
                    self.result_text.insert(tk.END, "-"*40 + "\n")

                    for item_id, count in sorted_items:
                        item_name = item_name_map.get(int(item_id), "Unknown Item")
                        self.result_text.insert(
                            tk.END,
                            f"{item_id:>7} | {count:>5} | {item_name}\n"
                        )
                    found = True
                    break

            if not found:
                self.result_text.insert(tk.END, "\ncant find the ship in this record")

        except json.JSONDecodeError:
            self.result_text.insert(tk.END, "\ncorrupted ship file")
        except Exception as e:
            self.result_text.insert(tk.END, f"\boom: {str(e)}")

    def _display_current_ship_contents(self, hex_id):
        latest_date = max(
            (tuple(map(int, date.split('_'))), date)
            for date, _ in self.ship_names[hex_id]["name_history"]
        )[1] if self.ship_names[hex_id]["name_history"] else None

        if latest_date:
            self.result_text.insert(tk.END, "\nCurrent Contents:\n")
            self._load_and_display_items(hex_id, latest_date)

    def show_ship_contents(self, hex_id, date_str):
        self.current_ship_hex = hex_id
        self.back_button.config(state="normal")
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        try:

            year, month, day = date_str.split("_")
            normalized_date = f"{year}_{month}_{day}"

            self.result_text.insert(tk.END, f"=== Contents on {date_str} ===")
            self._load_and_display_items(hex_id, normalized_date)

        except ValueError:
            self.result_text.insert(tk.END, "\nInvalid date format")

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
                f"Using ship names: {'Yes' if self.use_ship_names.get() else 'No'}",
                "=" * 50,
                ""
            ]

            if not self.filtered_data:
                return header_lines + ["No transactions found matching filters"]

            item_name_cache = {item[0]: item[1] for item in ITEM_DB}

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

                    src = {
                        "block - flux": "Flux mine",
                        "block - iron": "Iron mine",

                        "bot - zombie": "Vult Bot",
                        "bot - zombie tank": "Vult Bot 2",
                        "bot - zombie hunter": "Vult Yank",
                        "bot - zombie boss": "Vult Boss",

                        "bot - green roamer": "Green bot",
                        "bot - red hunter": "Red Hunter",
                        "bot - yellow rusher": "YellowRush",

                        "bot - blue melee": "Blue Spike",
                        "bot - red sentry": "Red Sentry",
                        "bot - orange fool": "Orange Fool",
                        "bot - yellow hunter": "Hunter bot",
                        "bot - red sniper": "Red Sniper",
                        "bot - aqua shielder": "Shield bot",

                        "Yellow Mine Bot": "Mine bot",
                        "The Coward": "The Coward",
                        "The Shield Master": "ShieldBoss",
                        "The Lazer Enthusiast": "LazerBoss"

                    }.get(src, src)

                    dst_name = None
                    if self.use_ship_names.get():
                        src_name = self._get_cached_historical_name(src, first_time, ship_name_cache)
                        dst_name = self._get_cached_historical_name(dst, first_time, ship_name_cache)
                    time_str = self.format_timestamp(first_time)

                    hurt = ""

                    if src[0] == "{":
                        str_parts = src.split(" ", 1)
                        src = str_parts[0]
                        hurt = " " + str_parts[1] if len(str_parts) > 1 else ""

                    line = (f"[{time_str[:19]:<19}] [{zone[:8]:<8}] || "
                        f"{str(count):<{count_len}}x from {src[:10]:<10} to {dst[:10]:<10}")
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

    def _get_ship_name(self, ship_id):
        if ship_id in self.ship_names:
            return self.ship_names[ship_id].get("current_name", "")
        return ""

    def _get_cached_historical_name(self, ship_id, timestamp, name_cache):
        try:
            ship_id = re.match(r'^\S+', ship_id).group(0)
            if not ship_id.startswith('{'):
                return None

            hex_id = ship_id.strip('{}')
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

            return history[low-1][1] if low > 0 else history[0][1]
        except (ValueError, IndexError) as e:
            print(f"Error processing date for ship {ship_id}: {e}")
            return None

    def display_ship_history(self, hex_id):
        self.current_ship_hex = hex_id
        self.back_button.config(state="disabled")
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        name_history = self.get_ship_name_history(hex_id)
        current_name = self.ship_names.get(hex_id, {}).get("current_name", "Unknown")

        self.result_text.insert(tk.END, f"=== Name History for Ship {{{hex_id}}} ===\n\n")
        self.result_text.insert(tk.END, f"Current Name: {current_name}\n")

        self.result_text.insert(tk.END, "\nName History:\n")
        self.result_text.insert(tk.END, "-"*50 + "\n")

        for date_str, name in name_history:
            display_name = name if name.strip() else "-"
            tag_name = f"date_{date_str}"
            self.result_text.insert(tk.END, f"{date_str}: {display_name}\n", tag_name)
            self.result_text.tag_bind(tag_name, "<Button-1>",
                lambda e, d=date_str, h=hex_id: self.show_ship_contents(h, d))
            self.result_text.tag_config(tag_name, foreground="black", underline=True)

        self._display_current_ship_contents(hex_id)  
        self.result_text.config(state="disabled")

    def update_display(self):
        if not self.download_in_progress and self.raw_data:
            self.status_var.set("applying filters... might be slow if ship names are enabled. looking those up takes ages")
            self.root.update()

            self.apply_filters()
            self.update_preview()

            self.status_var.set(f"looking at {len(self.filtered_data)} transactions")

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
                start_date2 = start_date
                start_date = end_date
                end_date = start_date2

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

    def analyze_ships(self):
        if self.ship_loading_in_progress or self.download_in_progress:
            messagebox.showwarning("Warning", "something is happening cant you tell wait the fuck up retarded fucking fuck fuck")
            return

        if not self.ship_names:

            self.status_var.set("loading all ship data")
            self.progress["value"] = 0
            self.download_in_progress = True
            self.start_ship_data_loading()
            return

        self.download_in_progress = True
        self.progress['value'] = 0
        self.status_var.set("starting ship analysis...")

        analysis_thread = threading.Thread(target=self.analyze_ships_thread, daemon=True)
        analysis_thread.start()
        self.root.after(100, self.check_download_progress)

    def analyze_ships_thread(self):
        try:

            ships_to_process = {}
            for hex_id, data in self.ship_names.items():
                name_history = data.get("name_history", [])
                if name_history:
                    latest_date = name_history[-1][0]  
                    ships_to_process[hex_id] = latest_date

            date_ship_map = defaultdict(list)
            for hex_id, date_str in ships_to_process.items():
                date_ship_map[date_str].append(hex_id.upper().strip("{}"))

            total_dates = len(date_ship_map)
            self.download_queue.put(("PROGRESS", 0, total_dates, "Starting analysis..."))

            item_totals = defaultdict(int)
            item_contributions = defaultdict(lambda: defaultdict(int))
            processed_dates = 0

            for date_str, hex_ids in date_ship_map.items():
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "stopped analyzing ships"))
                    return

                ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")
                if not os.path.exists(ships_path):
                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates, f"missing date: {date_str}"))
                    processed_dates += 1
                    continue

                try:
                    with gzip.open(ships_path, 'rb') as f:
                        ships_data = json.load(f)

                    target_hexes = set(hex_ids)
                    found = 0

                    for ship in ships_data:
                        hex_code = ship.get("hex_code", "").upper().strip("{}")
                        if hex_code in target_hexes:
                            items = ship.get("items", {})
                            for item_id, count in items.items():
                                item_id_int = int(item_id)
                                item_totals[item_id_int] += count
                                item_contributions[item_id_int][hex_code] += count
                            found += 1

                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates,
                                            f"{date_str} - Processed {found}/{len(hex_ids)} ships"))
                    processed_dates += 1

                except Exception as e:
                    self.download_queue.put(("ERROR", f"{date_str} expoded.: {str(e)}"))

            self.download_queue.put(("ANALYSIS_COMPLETE", (item_totals, item_contributions)))

        except Exception as e:
            self.download_queue.put(("ERROR", f"Analysis failed: {str(e)}"))

    def display_analysis_result(self, result):
        item_totals, item_contributions = result
        result_window = tk.Toplevel(self.root)
        result_window.title("Economy Content")
        result_window.geometry("1200x800")
        result_window.minsize(800, 600)

        notebook = ttk.Notebook(result_window)
        notebook.pack(fill="both", expand=True)

        summary_frame = ttk.Frame(notebook)
        notebook.add(summary_frame, text="Summary")

        control_frame = ttk.Frame(summary_frame)
        control_frame.pack(fill="x", padx=5, pady=5)

        ttk.Label(control_frame, text="Search:").pack(side="left")
        search_var = tk.StringVar()
        search_entry = ttk.Entry(control_frame, textvariable=search_var, width=30)
        search_entry.pack(side="left", padx=5)

        sort_options = ["Name (A-Z)", "Count (High-Low)", "Count (Low-High)", "ID"]
        sort_var = tk.StringVar(value="Count (High-Low)")
        sort_combo = ttk.Combobox(control_frame, textvariable=sort_var, values=sort_options, state="readonly")
        sort_combo.pack(side="left", padx=5)

        export_button = ttk.Button(control_frame, text="Export CSV",
                                 command=lambda: self.export_analysis(item_totals, item_contributions))
        export_button.pack(side="right", padx=5)

        tree_container = ttk.Frame(summary_frame)
        tree_container.pack(fill="both", expand=True)

        self.analysis_tree = ttk.Treeview(tree_container, columns=("item_id", "item_name", "total_count"), show="headings")

        self.analysis_tree.heading("item_id", text="ID", command=lambda: self.sort_tree("item_id", True))
        self.analysis_tree.heading("item_name", text="Item Name", command=lambda: self.sort_tree("item_name", False))
        self.analysis_tree.heading("total_count", text="Total Count", command=lambda: self.sort_tree("total_count", True))

        self.analysis_tree.column("item_id", width=80, anchor="center")
        self.analysis_tree.column("item_name", width=300, anchor="w")
        self.analysis_tree.column("total_count", width=120, anchor="e")

        y_scroll = ttk.Scrollbar(tree_container, orient="vertical", command=self.analysis_tree.yview)
        x_scroll = ttk.Scrollbar(tree_container, orient="horizontal", command=self.analysis_tree.xview)
        self.analysis_tree.configure(yscrollcommand=y_scroll.set, xscrollcommand=x_scroll.set)

        self.analysis_tree.grid(row=0, column=0, sticky="nsew")
        y_scroll.grid(row=0, column=1, sticky="ns")
        x_scroll.grid(row=1, column=0, sticky="ew")
        tree_container.grid_rowconfigure(0, weight=1)
        tree_container.grid_columnconfigure(0, weight=1)

        self.analysis_tree.bind("<Double-1>", lambda e: self.show_contributors(item_contributions))

        self.populate_analysis_tree(item_totals, item_contributions, search_var.get())

        search_var.trace_add("write", lambda *_: self.populate_analysis_tree(item_totals, item_contributions, search_var.get()))
        sort_var.trace_add("write", lambda *_: self.handle_sort_change(sort_var.get(), item_totals, item_contributions))

    def create_viz_tab(self, parent, item_totals):

        canvas = tk.Canvas(parent, bg="white")
        canvas.pack(fill="both", expand=True)

        total_items = sum(item_totals.values())
        if total_items == 0:
            canvas.create_text(100, 50, text="No data to visualize", anchor="w")
            return

        sorted_items = sorted(item_totals.items(), key=lambda x: -x[1])[:10]
        max_value = max(item[1] for item in sorted_items)

        bar_width = 40
        x_start = 100
        y_start = 50
        height = 300

        for i, (item_id, count) in enumerate(sorted_items):
            item_name = next((item[1] for item in ITEM_DB if item[0] == item_id), f"Item {item_id}")
            bar_height = (count / max_value) * height
            x0 = x_start + i * 100
            y0 = y_start + height - bar_height
            canvas.create_rectangle(x0, y0, x0+bar_width, y_start+height, fill="skyblue")
            canvas.create_text(x0 + bar_width/2, y0 - 20,
                              text=f"{count:,}", anchor="s")
            canvas.create_text(x0 + bar_width/2, y_start+height + 20,
                              text=item_name, anchor="n", angle=45)

    def populate_analysis_tree(self, item_totals, contributions, search_term=""):
        self.analysis_tree.delete(*self.analysis_tree.get_children())
        item_name_map = {item[0]: item[1] for item in ITEM_DB}

        filtered_items = [
            (item_id, count, item_name_map.get(item_id, f"Unknown ({item_id})"))
            for item_id, count in item_totals.items()
            if search_term.lower() in item_name_map.get(item_id, "").lower()
            or search_term.lower() in str(item_id)
        ]

        for item_id, count, name in filtered_items:
            self.analysis_tree.insert("", "end", values=(item_id, name, f"{count:,}"))

    def open_ship_lookup(self, tree):
        selected = tree.selection()
        if not selected:
            return

        ship_id = tree.item(selected[0], "values")[0]
        if not hasattr(self, 'lookup_window') or not self.lookup_window.winfo_exists():
            self.lookup_ship_name()  
        self.display_ship_history(ship_id.strip("{}"))
        self.lookup_window.lift()

    def sort_treeview(self, tree, col, numeric=False):
        items = [(tree.set(child, col), child) for child in tree.get_children('')]
        
        if numeric:
            items.sort(key=lambda x: int(x[0].replace(',', '')), reverse=True)
        else:
            items.sort(key=lambda x: int(x[0].replace('#', '')))
        
        for index, (val, child) in enumerate(items):
            tree.move(child, '', index)

    def handle_sort_change(self, sort_option, item_totals, contributions):
        reverse = False
        if sort_option == "Count (High-Low)":
            sorted_items = sorted(item_totals.items(), key=lambda x: -x[1])
        elif sort_option == "Count (Low-High)":
            sorted_items = sorted(item_totals.items(), key=lambda x: x[1])
        elif sort_option == "Name (A-Z)":
            sorted_items = sorted(item_totals.items(),
                                key=lambda x: next(
                                    (item[1] for item in ITEM_DB if item[0] == x[0]),
                                    ""  
                                ))
        elif sort_option == "Name (Z-A)":
            sorted_items = sorted(item_totals.items(),
                                key=lambda x: next(
                                    (item[1] for item in ITEM_DB if item[0] == x[0]),
                                    ""  
                                ),
                                reverse=True)
        else:  
            sorted_items = sorted(item_totals.items(), key=lambda x: x[0])

        item_totals = dict(sorted_items)
        self.populate_analysis_tree(item_totals, contributions)

    def show_contributors(self, item_contributions):
        selected = self.analysis_tree.selection()
        if not selected:
            return
            
        item_id = int(self.analysis_tree.item(selected[0], "values")[0])
        contributions = item_contributions.get(item_id, {})
        
        self.item_name_map = {item[0]: item[1] for item in ITEM_DB}
        
        detail_win = tk.Toplevel()
        detail_win.title(
            f"Contributors for Item {item_id} "
            f"({self.item_name_map.get(item_id, 'Unknown Item')})"
        )
        detail_win.geometry("1000x500")
        
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
        hsb = ttt.Scrollbar(detail_win, orient="horizontal", command=tree.xview)
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

    def export_analysis(self, item_totals, contributions):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text Files (CSV base but fuck that extension)", "*.txt"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        try:
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Item ID", "Item Name", "Total Count", "Top Contributor ID", "Top Contributor Name", "Top Contribution Count"])

                item_name_map = {item[0]: item[1] for item in ITEM_DB}
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
