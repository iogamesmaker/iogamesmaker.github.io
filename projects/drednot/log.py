import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import gzip
import time
import json
from datetime import datetime, timedelta
import os
import re
from collections import defaultdict
import threading
import queue
import sys
import gc
import platform
import requests
import psutil

max_mem_gb = 3.5 # change to whatever you like, as long as you know what you're doing.
# basic baseline:
# 4gb of ram, put it to 1.5
# 8gb of ram, put it to 3.5
# more: just do half of your total ram

def set_memory_limit():
    max_mem_bytes = 1024 * 1024 * round(1024 * max_mem_gb)

    if platform.system() == 'Linux':
        import resource
        # Convert to rlimit format (soft, hard)
        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        resource.setrlimit(resource.RLIMIT_AS, (max_mem_bytes, hard))
    elif platform.system() == 'Windows':
        import ctypes
        # Windows memory limit is more complex - we'll use SetProcessWorkingSetSize
        # Note: This doesn't actually limit memory, just tries to keep it within bounds
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

        # Set up window close handler
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Make window resizable
        self.root.rowconfigure(0, weight=1)
        self.root.columnconfigure(0, weight=1)

        # Initialize variables
        self.raw_data = []  # Stores all raw log data
        self.filtered_data = []  # Stores filtered data
        self.ship_names = {}  # Will store ALL ship names
        self.all_items = [f"{item[0]}: {item[1]}" for item in ITEM_DB]
        self.filtered_items = self.all_items.copy()
        self.show_bots = tk.BooleanVar(value=True)
        self.text_size_var = tk.IntVar(value=10)
        self.wrap_text_var = tk.BooleanVar(value=False)
        self.use_ship_names = tk.BooleanVar(value=False)  # New toggle for ship names

        self._last_dates_processed = []
        self.status_var = tk.StringVar(value="Initializing...")

        # Thread-safe queue for communication between download thread and main thread
        self.download_queue = queue.Queue()

        # Flag to track if download is in progress
        self.download_in_progress = False
        self.ship_loading_in_progress = False

        # Filter variables
        self.filter_item_var = tk.StringVar()
        self.filter_source_var = tk.StringVar()
        self.filter_dest_var = tk.StringVar()

        # Date range variables
        self.start_year_var = tk.StringVar(value="2022")
        self.start_month_var = tk.StringVar(value="11")
        self.start_day_var = tk.StringVar(value="23")
        self.end_year_var = tk.StringVar(value="2022")
        self.end_month_var = tk.StringVar(value="11")
        self.end_day_var = tk.StringVar(value="23")

        if platform.system() == 'Windows':
            # On Windows, use AppData/Local
            base_path = os.path.join(os.getenv('LOCALAPPDATA'), 'DredarkLogScourer')
            print(base_path)
        else:
            # On Linux/Mac, use ~/.local/share
            base_path = os.path.join(os.path.expanduser('~'), '.local', 'share', 'DredarkLogScourer')
            print(base_path)

        # Create data directory if it doesn't exist
        self.local_data_dir = os.path.join(base_path, "drednot_data_raw")
        os.makedirs(self.local_data_dir, exist_ok=True)

        # Create GUI elements
        self.create_widgets()
        self.configure_text_tags()
        self.apply_display_settings()

        # Check for and download new data on startup
        self.check_and_download_data()

    def configure_text_tags(self):
        """Configure text widget tags for alternating line colors"""
        self.preview_text.tag_configure("even", background="#FFFFFF")
        self.preview_text.tag_configure("odd", background="#F8F8F8")

        if hasattr(self, 'result_text'):
            self.result_text.tag_configure("even", background="#FFFFFF")
            self.result_text.tag_configure("odd", background="#F8F8F8")

        self.preview_text.tag_raise("sel")

    def check_and_download_data(self):
        """Check for missing data and download what's needed"""
        if not os.path.exists(self.local_data_dir):
            os.makedirs(self.local_data_dir)

        # Get list of existing dates
        existing_dates = set()
        for entry in os.listdir(self.local_data_dir):
            if '_' in entry and entry.count('_') == 2:
                existing_dates.add(entry)

        # Determine dates to download (from earliest missing to today)
        today = datetime.now()
        date_to_check = datetime(2022, 11, 23)  # First available data + 1 day cuz thing
        dates_to_download = []

        while date_to_check <= today:
            date_str = f"{date_to_check.year}_{date_to_check.month}_{date_to_check.day}"
            if date_str not in existing_dates:
                if not dates_to_download:
                    dates_to_download.append(date_to_check - timedelta(days=1))
                dates_to_download.append(date_to_check)
            date_to_check += timedelta(days=1)

        if not dates_to_download:
            self.status_var.set("Data is up to date.")
            return;

        # Set progress bar max to total dates to download
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
        """Thread function to download multiple dates of data"""
        try:
            total_dates = len(dates_to_download)
            success_count = 0

            for i, date in enumerate(dates_to_download):
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "Download cancelled by user"))
                    self.raw_data = []
                    return

                date_str = f"{date.year}_{date.month}_{date.day}"
                base_url = "https://pub.drednot.io/prod/econ"

                # Update progress - send current progress (i+1) and total dates
                self.download_queue.put(("PROGRESS", i + 1, total_dates,
                                    f"Downloading {date_str} ({i+1}/{total_dates})"))

                try:
                    # First check if we can download ships data
                    ships_url = f"{base_url}/{date_str}/ships.json.gz"
                    with requests.get(ships_url, stream=True, timeout=30) as r:
                        r.raise_for_status()  # This will raise an exception for 404

                        # Only create directory if download is successful
                        date_dir = os.path.join(self.local_data_dir, date_str)
                        os.makedirs(date_dir, exist_ok=True)

                        ships_path = os.path.join(date_dir, "ships.json.gz")
                        with open(ships_path, 'wb') as f:
                            for chunk in r.iter_content(chunk_size=8192):
                                f.write(chunk)

                    # Then download log data
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
                        print(f"Data not available for {date_str}, skipping")
                        continue
                    raise  # Re-raise other HTTP errors
                except requests.exceptions.RequestException as e:
                    print(f"Failed to download data for {date_str}: {str(e)}")
                    continue

            self.download_queue.put(("COMPLETE", success_count, total_dates))

        except Exception as e:
            self.download_queue.put(("ERROR", str(e)))

    def is_operation_in_progress(self):
        """Check if any background operations are running"""
        return (self.download_in_progress or
                (hasattr(self, 'loading_thread') and self.loading_thread.is_alive()))

    def on_closing(self):
        """Handle window close event"""
        if self.is_operation_in_progress():
            if messagebox.askokcancel(
                "Operation in Progress",
                "Something is still happening\n"
                "Do you really want to quit?",
                icon=messagebox.WARNING
            ):
                self.download_in_progress=False  # Signal threads to stop
                self.root.destroy()
        else:
            self.root.destroy()

    def start_ship_data_loading(self):
        """Start loading ship data in a background thread"""
        self.loading_thread = threading.Thread(
            target=self.load_all_ship_data_thread,
            daemon=True
        )
        self.loading_thread.start()
        self.root.after(100, self.check_download_progress)

    def show_help_menu(self):
        """Create a help menu with multiple pages"""
        help_window = tk.Toplevel(self.root)
        help_window.title("Help Menu")
        help_window.geometry("800x600")
        help_window.resizable(True, True)

        # Main container frame
        main_frame = ttk.Frame(help_window)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Navigation frame on the left
        nav_frame = ttk.Frame(main_frame, width=150)
        nav_frame.pack(side="left", fill="y", padx=(0, 10))

        # Content frame on the right
        content_frame = ttk.Frame(main_frame)
        content_frame.pack(side="right", fill="both", expand=True)

        # Create text widget for content
        help_text = tk.Text(content_frame, wrap="word", font=("Arial", 12),
                        padx=5, pady=10, state="disabled")
        scrollbar = ttk.Scrollbar(content_frame, orient="vertical", command=help_text.yview)
        help_text.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side="right", fill="y")
        help_text.pack(fill="both", expand=True)

        # Help pages content
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

        # Create navigation buttons
        for page_name in help_pages.keys():
            def make_lambda(page=page_name):
                return lambda: self.update_help_text(help_text, help_pages[page])

            btn = ttk.Button(nav_frame, text=page_name, command=make_lambda(), width=15)
            btn.pack(pady=2, padx=2, fill="x")

        # Show first page by default
        self.update_help_text(help_text, help_pages["Introduction"])

        # Set minimum size
        help_window.minsize(600, 400)

    def update_help_text(self, text_widget, content):
        """Update the help text widget with new content"""
        text_widget.config(state="normal")
        text_widget.delete(1.0, tk.END)
        text_widget.insert(tk.END, content)
        text_widget.config(state="disabled")

    def create_widgets(self):
        # Main container frame for better layout control
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")

        # Configure grid weights for resizing
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(5, weight=1)

        # Date range selection row
        date_frame = ttk.Frame(main_frame)
        date_frame.grid(row=0, column=0, columnspan=2, sticky="ew", pady=5)
        date_frame.columnconfigure(0, weight=1)  # Start date
        date_frame.columnconfigure(1, weight=0)  # Download button
        date_frame.columnconfigure(2, weight=0)  # Cancel button
        date_frame.columnconfigure(3, weight=0)  # Set same button
        date_frame.columnconfigure(4, weight=1)  # End date

        # Start date frame
        start_frame = ttk.Frame(date_frame)
        start_frame.grid(row=0, column=0, sticky="w")
        ttk.Label(start_frame, text="From:").pack(side="left")

        ttk.Spinbox(start_frame, from_=2022, to=datetime.now().year,
                    textvariable=self.start_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=12,
                    textvariable=self.start_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(start_frame, from_=1, to=31,
                    textvariable=self.start_day_var, width=3).pack(side="left", padx=2)

        # Load button (left of Set Same button)
        ttk.Button(date_frame, text="Load Data", command=self.load_data
                ).grid(row=0, column=1, padx=(10,5), sticky="ew")

        self.cancel_button = ttk.Button(date_frame, text="Cancel", command=self.cancel_loading,
                              state="disabled")
        self.cancel_button.grid(row=0, column=2, padx=5, sticky="ew")

        # "To = From" button
        ttk.Button(date_frame, text="Set To = From", command=self.set_same,
                width=12).grid(row=0, column=3, padx=(5,10), sticky="ew")

        # End date frame
        end_frame = ttk.Frame(date_frame)
        end_frame.grid(row=0, column=4, sticky="e")
        ttk.Label(end_frame, text="To:").pack(side="left")

        ttk.Spinbox(end_frame, from_=2022, to=datetime.now().year,
                    textvariable=self.end_year_var, width=5).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=12,
                    textvariable=self.end_month_var, width=3).pack(side="left", padx=2)
        ttk.Spinbox(end_frame, from_=1, to=31,
                    textvariable=self.end_day_var, width=3).pack(side="left", padx=2)

        # Progress bar and status
        self.progress = ttk.Progressbar(main_frame, orient="horizontal",
                                    length=300, mode="determinate")
        self.progress.grid(row=2, column=0, columnspan=2, padx=10, pady=5, sticky="ew")

        self.status_var = tk.StringVar(value="Ready to load data")
        ttk.Label(main_frame, textvariable=self.status_var).grid(row=3, column=0, columnspan=2, pady=(0,10))

        # Filter frame - single frame for all filter elements
        filter_frame = ttk.Frame(main_frame)
        filter_frame.grid(row=4, column=0, columnspan=2, pady=5, sticky="ew")
        filter_frame.columnconfigure(0, weight=1)  # Item filter column
        filter_frame.columnconfigure(1, weight=1)  # Source/Dest filter column

        # Item filter (top left)
        item_filter_frame = ttk.Frame(filter_frame)
        item_filter_frame.grid(row=0, column=0, padx=5, sticky="ew")
        ttk.Label(item_filter_frame, text="Item Filter:").pack(side="left")
        self.search_combo = ttk.Combobox(item_filter_frame, textvariable=self.filter_item_var,
                                        values=self.filtered_items)
        self.search_combo.pack(side="left", fill="x", expand=True, padx=5)
        self.search_combo.bind('<Return>', lambda e: self.root.after(50, self.update_filter))

        # Source/Destination filters (top right)
        source_dest_frame = ttk.Frame(filter_frame)
        source_dest_frame.grid(row=0, column=1, padx=5, sticky="ew")
        source_dest_frame.columnconfigure(0, weight=1)
        source_dest_frame.columnconfigure(1, weight=1)

        # Source filter (left side of right column)
        source_filter_frame = ttk.Frame(source_dest_frame)
        source_filter_frame.grid(row=0, column=0, padx=5, sticky="ew")
        ttk.Label(source_filter_frame, text="Source:").pack(side="left")
        self.source_entry = ttk.Entry(source_filter_frame, textvariable=self.filter_source_var)
        self.source_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.source_entry.bind('<Return>', lambda e: self.update_display())

        # Destination filter (right side of right column)
        dest_filter_frame = ttk.Frame(source_dest_frame)
        dest_filter_frame.grid(row=0, column=1, padx=5, sticky="ew")
        ttk.Label(dest_filter_frame, text="Dest:").pack(side="left")
        self.dest_entry = ttk.Entry(dest_filter_frame, textvariable=self.filter_dest_var)
        self.dest_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.dest_entry.bind('<Return>', lambda e: self.update_display())

        # Show bots and hurt checkboxes
        filter_check_frame = ttk.Frame(filter_frame)
        filter_check_frame.grid(row=1, column=0, columnspan=2, pady=5, sticky="w")

        ttk.Checkbutton(filter_check_frame, text="Only show ship transactions", variable=self.show_bots,
                       command=self.update_display).pack(side="left", padx=5)
        ttk.Checkbutton(filter_check_frame, text="Use ship names", variable=self.use_ship_names,
               command=self.toggle_ship_names).pack(side="left", padx=5)

        ttk.Button(filter_check_frame, text="Help", width=6, command=self.show_help_menu).pack(side="right", padx=5)

        ttk.Button(filter_check_frame, text="⚙", width=6, command=self.open_settings_menu).pack(side="right", padx=5)

        # Data preview frame - now properly resizable
        preview_frame = ttk.Frame(main_frame)
        preview_frame.grid(row=5, column=0, columnspan=2, sticky="nsew", pady=(0,5))
        preview_frame.rowconfigure(0, weight=1)
        preview_frame.columnconfigure(0, weight=1)

        # Text frame with scrollbar
        text_frame = ttk.Frame(preview_frame)
        text_frame.grid(row=0, column=0, sticky="nsew")
        text_frame.columnconfigure(0, weight=1)
        text_frame.rowconfigure(0, weight=1)

        self.preview_text = tk.Text(text_frame, state="disabled", wrap="word")
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=self.preview_text.yview)
        self.preview_text.configure(yscrollcommand=scrollbar.set)

        self.preview_text.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")

        # Bottom button frame
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
        ttk.Button(button_frame, text="Analyze Ships", command=self.analyze_ships).grid(
            row=0, column=3, padx=5, sticky="sew")

        # Set minimum size for main window
        self.root.minsize(720, 300)

    def toggle_ship_names(self):
        """Toggle whether to use ship names and load them if needed"""
        if self.use_ship_names.get():
            if not self.ship_names:
                # Start loading using main progress bar
                self.status_var.set("Loading ship names...")
                self.progress["value"] = 0
                self.download_in_progress = True
                self.start_ship_data_loading()
        else:
            self.update_display()

    def set_same(self):
        """Set the end date to the same as the start date"""
        self.end_year_var.set(self.start_year_var.get())
        self.end_month_var.set(self.start_month_var.get())
        self.end_day_var.set(self.start_day_var.get())

    def open_settings_menu(self):
        settings_win = tk.Toplevel(self.root)
        settings_win.title("Display Settings")
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
        """Apply text size and wrap settings to all text widgets"""
        try:
            size = int(self.text_size_var.get())
            if size < 1 or size > 40:
                raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Enter an integer text size between 1 and 40")
            self.text_size_var.set(10)
            return

        wrap_mode = "word" if self.wrap_text_var.get() else "none"

        # Apply to preview text
        self.preview_text.config(
            font=("DejaVu Sans Mono", size),
            wrap=wrap_mode
        )

        # Apply to any open lookup window
        if hasattr(self, 'result_text'):
            self.result_text.config(
                font=("DejaVu Sans Mono", size),
                wrap=wrap_mode
            )

    def load_all_ship_data_thread(self):
        """Thread function to load all historical ship data with progress updates"""
        try:
            self.ship_names = {}  # Reset ship names cache
            processed_ships = 0

            # Get sorted list of available dates
            all_dates = []
            for entry in os.listdir(self.local_data_dir):
                if entry.count('_') == 2:  # Format: YEAR_MONTH_DAY
                    all_dates.append(entry)

            # Sort dates chronologically
            all_dates.sort(key=lambda x: tuple(map(int, x.split('_'))))

            total_dates = len(all_dates)
            self.download_queue.put(("SHIP_PROGRESS", 0, total_dates, "Starting ship data load..."))

            # Process each day's ship data
            for i, date_str in enumerate(all_dates):
                if not self.download_in_progress:
                    break  # Allow cancellation

                ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")
                if not os.path.exists(ships_path):
                    continue

                try:
                    with gzip.open(ships_path, 'rb') as f:
                        day_ships_data = json.load(f)

                    # Process ships from this day
                    for ship in day_ships_data:
                        hex_code = ship.get("hex_code", "").upper().strip("{}")
                        if not hex_code:
                            continue

                        # Get current name (including empty strings)
                        current_name = ship.get("name", "").strip()

                        # Get or create ship entry
                        if hex_code not in self.ship_names:
                            self.ship_names[hex_code] = {
                                "current_name": current_name,
                                "name_history": []
                            }

                        # Always add to history even if name is empty
                        hist = self.ship_names[hex_code]["name_history"]
                        hist.append((date_str, current_name))
                        self.ship_names[hex_code]["current_name"] = current_name

                    processed_ships += len(day_ships_data)

                except Exception as e:
                    print(f"Error loading {date_str} ships: {str(e)}")

                # Update progress
                self.download_queue.put(("SHIP_PROGRESS", i+1, total_dates,
                                    f"Processing {date_str} ({i+1}/{total_dates})"))

            # Final update
            if self.download_in_progress:
                self.download_queue.put(("SHIP_COMPLETE", len(self.ship_names)))
            else:
                self.download_queue.put(("SHIP_ERROR", "Loading cancelled by user"))

        except Exception as e:
            self.download_queue.put(("SHIP_ERROR", f"Critical error: {str(e)}"))

    def check_download_progress(self):
        """Check progress queue and update UI accordingly"""
        try:
            while True:
                try:
                    data = self.download_queue.get_nowait()

                    if data[0] == "PROGRESS":
                        current, total, status = data[1], data[2], data[3]
                        self.progress["maximum"] = total
                        self.progress["value"] = current
                        self.status_var.set(f"Loading data: {status}")

                    elif data[0] == "COMPLETE":
                        total_trans, filtered_count = data[1], data[2]
                        self.download_complete(total_trans, filtered_count)

                    elif data[0] == "ERROR":
                        error_msg = data[1]
                        self.download_error(error_msg)

                    elif data[0] == "CANCELLED":
                        self.status_var.set("Download cancelled")
                        self.progress["value"] = 0
                        self.download_in_progress = False
                        self.cancel_button.config(state="disabled")
                        self.raw_data = []
                        self.filtered_data = []
                        self.update_preview()

                    elif data[0] == "SHIP_PROGRESS":
                        current, total, status = data[1], data[2], data[3]
                        self.progress["maximum"] = total
                        self.progress["value"] = current
                        self.status_var.set(f"Loading ship data: {status}")

                    elif data[0] == "SHIP_COMPLETE":
                        total_ships = data[1]
                        self.status_var.set(f"Loaded {total_ships} ship names")
                        self.progress["value"] = 0
                        self.download_in_progress = False
                        self.update_display()

                    elif data[0] == "SHIP_ERROR":
                        error_msg = data[1]
                        messagebox.showerror("Error", f"Ship data load failed: {error_msg}")
                        self.status_var.set("Ship data loading failed")
                        self.progress["value"] = 0
                        self.download_in_progress = False

                    elif data[0] == "ANALYSIS_COMPLETE":
                        result = data[1]
                        self.display_analysis_result(result)
                        self.download_in_progress = False
                        self.progress["value"] = 0
                        self.status_var.set("Analysis complete")

                except queue.Empty:
                    break

        except Exception as e:
            messagebox.showerror("Error", f"Progress check failed: {str(e)}")
            self.progress["value"] = 0
            self.download_in_progress = False

        # Re-check if still loading
        if self.download_in_progress:
            self.root.after(100, self.check_download_progress)

    def download_data_thread(self, dates_to_process):
        """Optimized data loading that properly handles JSON while minimizing memory"""
        try:
            # Process logs one day at a time with proper JSON parsing
            self.raw_data = []
            total_transactions = 0
            total_dates = len(dates_to_process)

            # Get current filter values at start of loading
            item_filter = self.filter_item_var.get()
            source_filter = self.filter_source_var.get().lower() if isinstance(self.filter_source_var.get(), str) else ""
            dest_filter = self.filter_dest_var.get().lower() if isinstance(self.filter_dest_var.get(), str) else ""
            hide_bots = self.show_bots.get()

            # Parse item filter if set
            item_id = None
            if item_filter:
                try:
                    item_id = int(item_filter.split(":")[0])
                except (ValueError, IndexError):
                    pass

            for i, date_str in enumerate(dates_to_process):
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "Download cancelled by user"))
                    self.raw_data = []
                    return

                log_path = os.path.join(self.local_data_dir, date_str, "log.json.gz")

                if not os.path.exists(log_path) or os.path.getsize(log_path) == 0:
                    print(f"Skipping empty/missing file: {log_path}")
                    continue

                # Update progress - include current/total dates
                progress = i + 1
                self.download_queue.put(("PROGRESS", progress, total_dates,
                                        f"Processed {date_str} ({progress}/{total_dates}) - {len(self.raw_data)} filtered"))

                with gzip.open(log_path, 'rb') as f:
                    day_log_data = json.load(f)

                    total_transactions += len(day_log_data)

                    # Apply filters during loading
                    filtered_day_data = []
                    for entry in day_log_data:
                        if not isinstance(entry, dict):
                            continue

                        # Item filter
                        if item_id is not None and entry.get("item") != item_id:
                            continue

                        # Ship-only filter
                        if hide_bots:
                            current_src = str(entry.get("src", "")).lower()
                            current_dst = str(entry.get("dst", "")).lower()
                            if not (current_src.startswith('{') and current_dst.startswith('{')):
                                continue

                        # Source filter
                        if source_filter:
                            current_src = str(entry.get("src", "")).lower()
                            src_clean = current_src.strip('{}')
                            if (source_filter not in current_src and
                                (src_clean not in self.ship_names or
                                source_filter not in str(self.ship_names.get(src_clean, "")).lower())):
                                continue

                        # Destination filter
                        if dest_filter:
                            current_dst = str(entry.get("dst", "")).lower()
                            dst_clean = current_dst.strip('{}')
                            if (dest_filter not in current_dst and
                                (dst_clean not in self.ship_names or
                                dest_filter not in str(self.ship_names.get(dst_clean, "")).lower())):
                                continue

                        # If we get here, the entry passes all filters
                        filtered_day_data.append(entry)

                    self.raw_data.extend(filtered_day_data)

                # Force garbage collection between files
                gc.collect()

            self.download_queue.put(("COMPLETE", total_transactions, len(self.raw_data)))

        except Exception as e:
            self.download_queue.put(("ERROR", str(e)))

    def _passes_filters(self, entry):
        """Efficient filter checking for individual entries"""
        if not isinstance(entry, dict):
            return False

        # Get current filter values
        item_filter = self.filter_item_var.get()
        source_filter = self.filter_source_var.get().lower() if isinstance(self.filter_source_var.get(), str) else ""
        dest_filter = self.filter_dest_var.get().lower() if isinstance(self.filter_dest_var.get(), str) else ""
        hide_bots = self.show_bots.get()

        # Get entry data with proper type checking
        current_item = entry.get("item")
        current_src = str(entry.get("src", "?")).lower()
        current_dst = str(entry.get("dst", "?")).lower()

        # Item filter
        if item_filter:
            try:
                item_id = int(item_filter.split(":")[0])
                if current_item != item_id:
                    return False
            except (ValueError, IndexError):
                pass

        # Ship-only filter
        if hide_bots:
            if not (current_src.startswith('{') and current_dst.startswith('{')):
                return False

        # Source filter
        if source_filter:
            src_clean = current_src.strip('{}')
            if (source_filter not in current_src and
                (src_clean not in self.ship_names or
                source_filter not in str(self.ship_names.get(src_clean, "")).lower())):
                return False

        # Destination filter
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
                # Rest of processing
            except (KeyError, IndexError) as e:
                print(f"Skipping invalid log entry: {e}")
                continue
        return filtered_data

    def load_data(self):
        """Main method to initiate data loading"""
        if not self.validate_date_range():
            return

        if self.download_in_progress:
            messagebox.showwarning("Warning", "Data loading already in progress")
            return

        # Enable cancel button
        self.cancel_button.config(state="normal")

        # Clear previous log data (but keep ship names)
        self.raw_data = []
        self.filtered_data = []

        # Calculate date range
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

        # Create list of dates to process
        dates_to_process = []
        current_date = start_date
        while current_date <= end_date:
            dates_to_process.append(f"{current_date.year}_{current_date.month}_{current_date.day}")
            current_date += timedelta(days=1)

        # Store the dates we're processing
        self._last_dates_processed = dates_to_process

        # Update UI - set progress bar max to total dates
        total_dates = len(dates_to_process)
        self.progress["maximum"] = total_dates
        self.progress["value"] = 0
        self.status_var.set(f"Loading log data from local files (0/{total_dates})...")
        self.download_in_progress = True

        # Start download in a separate thread
        download_thread = threading.Thread(
            target=self.download_data_thread,
            args=(dates_to_process,),
            daemon=True
        )
        download_thread.start()

        # Check for updates periodically
        self.root.after(100, self.check_download_progress)

    def apply_filters(self):
        """Simple, reliable filter implementation"""
        # Get filter values
        item_filter = self.filter_item_var.get()
        source_filter = self.filter_source_var.get().lower()
        dest_filter = self.filter_dest_var.get().lower()
        hide_bots = self.show_bots.get()

        # Parse item filter
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

            # Get entry data
            current_item = entry.get("item")
            current_src = str(entry.get("src", "")).lower()
            current_dst = str(entry.get("dst", "")).lower()

            # Item filter
            if item_id is not None and current_item != item_id:
                continue

            # Ship-only filter
            if hide_bots and not (current_src.startswith('{') and current_dst.startswith('{')):
                continue

            # Source filter - check ID first
            if source_filter:
                src_match = source_filter in current_src
                if not src_match and self.use_ship_names.get():
                    src_clean = current_src.strip('{}')
                    if src_clean in self.ship_names:
                        ship_name = self.ship_names[src_clean].get("current_name", "").lower()
                        src_match = source_filter in ship_name
                if not src_match:
                    continue

            # Destination filter - check ID first
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
        """Convert UNIX timestamp (in milliseconds) to readable date/time"""
        try:
            if timestamp:
                # Convert milliseconds to seconds
                dt = datetime.fromtimestamp(timestamp)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            return "Unknown time"
        except (ValueError, TypeError, OSError):
            return "Invalid time"

    def cancel_loading(self):
        """Cancel any ongoing data loading operations"""
        if self.download_in_progress:
            self.download_in_progress = False
            self.status_var.set("Finishing operation...")
            self.cancel_button.config(state="disabled")

    def download_complete(self, total_transactions, filtered_count):
        """Handle download completion"""
        self.download_in_progress = False
        self.cancel_button.config(state="disabled")  # Disable cancel button
        self.progress["value"] = self.progress["maximum"]
        self.status_var.set(f"Data loading complete! Processed {total_transactions} transactions, {filtered_count} after filtering")
        messagebox.showinfo("Success", f"Loaded {total_transactions} transactions, {filtered_count} after filtering")

        # No need to apply filters again since we filtered during loading
        self.filtered_data = self.raw_data.copy()
        self.update_preview()

    def download_error(self, error_msg):
        """Handle download errors"""
        self.download_in_progress = False
        self.cancel_button.config(state="disabled")  # Disable cancel button
        messagebox.showerror("Error", f"Data loading failed: {error_msg}")
        self.status_var.set("Data loading failed")

    def lookup_ship_name(self):
        """Look up a ship name by its hex ID or name, showing complete name history"""
        if self.ship_loading_in_progress or self.download_in_progress:
            messagebox.showwarning("Warning", "Data is being loaded, wait up you impatient fuck")
            return

        if not self.ship_names:
            # Start loading ship names using main progress system
            self.status_var.set("Loading ship name data...")
            self.progress["value"] = 0
            self.download_in_progress = True
            self.start_ship_data_loading()
            return

        # Create dialog window
        self.lookup_window = tk.Toplevel(self.root)
        self.lookup_window.title("Ship Name Lookup")
        self.lookup_window.minsize(500, 400)
        self.lookup_window.geometry("600x500")

        # Main container frame
        main_frame = ttk.Frame(self.lookup_window, padding=10)
        main_frame.pack(fill="both", expand=True)

        # Input section
        input_frame = ttk.Frame(main_frame)
        input_frame.pack(fill="x", pady=5)

        # Radio buttons for search type
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

        # Case sensitive checkbox
        self.case_sensitive = tk.BooleanVar(value=False)
        ttk.Checkbutton(search_type_frame, text="Case sensitive", variable=self.case_sensitive).pack(side="left", padx=5)

        # Fuzzy search toggle button
        self.fuzzy_search = tk.BooleanVar(value=True)
        fuzzy_btn = ttk.Checkbutton(
            search_type_frame,
            text="Enable Searching",
            variable=self.fuzzy_search,
            command=self.toggle_fuzzy_search
        )
        fuzzy_btn.pack(side="left", padx=5)

        # Search entry
        search_entry_frame = ttk.Frame(input_frame)
        search_entry_frame.pack(fill="x", pady=5)

        ttk.Label(search_entry_frame, text="Search:").pack(side="left")
        self.search_entry = ttk.Entry(search_entry_frame)
        self.search_entry.pack(side="left", padx=5, fill="x", expand=True)
        self.search_entry.focus_set()

        # Search button
        ttk.Button(search_entry_frame, text="Search", command=self.do_name_lookup).pack(side="left", padx=5)

        # Create a PanedWindow for resizable split between matches and results
        split_pane = tk.PanedWindow(main_frame, orient=tk.VERTICAL, sashwidth=8, sashrelief='ridge', bg='#AAA')
        split_pane.pack(fill="both", expand=True)

        # Matches frame (top pane)
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

        # Results frame (bottom pane)
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

        # Add frames to panedwindow with weights
        split_pane.add(matches_frame)
        split_pane.add(result_frame)

        # Bind Return to update search results
        self.search_entry.bind('<Return>', lambda e: self.do_name_lookup())

        # Initial empty search to show instructions
        self.result_text.insert(tk.END, "Enter a ship ID or name to search")
        self.result_text.config(state="disabled")
        self.current_ship_hex = None

    def toggle_fuzzy_search(self):
        if not self.fuzzy_search.get():
            self.search_type.set("id")
        self.name_radio_button.config(state="disabled" if not self.fuzzy_search.get() else "normal")

    def _handle_listbox_nav(self, direction):
        """Handle up/down arrow navigation in listbox"""
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
        """Perform the name lookup based on search text and search type, supporting wildcards (*)"""
        try:
            search_text = self.search_entry.get().strip()
            if not search_text:
                self.result_text.config(state="normal")
                self.result_text.delete(1.0, tk.END)
                self.result_text.insert(tk.END, "Enter a ship ID or name to search")
                self.result_text.config(state="disabled")
                return

            search_type = self.search_type.get()
            case_sensitive = self.case_sensitive.get()
            use_wildcard = '*' in search_text

            # Clear previous results
            self.result_text.config(state="normal")
            self.result_text.delete(1.0, tk.END)
            self.matches_listbox.delete(0, tk.END)

            # Process search text
            clean_search = search_text.replace('{', '').replace('}', '') if search_type == "id" else search_text
            if not case_sensitive:
                clean_search = clean_search.upper()

            # Initialize regex pattern if using wildcards
            regex_pattern = None
            if use_wildcard:
                # Escape regex special chars except *
                parts = clean_search.split('*')
                escaped_parts = [re.escape(part) for part in parts]
                pattern_str = '.*'.join(escaped_parts)
                try:
                    regex_pattern = re.compile(f'^{pattern_str}$', re.IGNORECASE if not case_sensitive else 0)
                except re.error as e:
                    self.result_text.insert(tk.END, f"Invalid search pattern: {str(e)}")
                    self.result_text.config(state="disabled")
                    return

            matches = []
            exact_match = None

            for hex_id, data in self.ship_names.items():
                current_name = data.get("current_name", "")
                historical_names = [name for _, name in data.get("name_history", [])]

                # Prepare comparison values based on case sensitivity
                comp_hex = hex_id if case_sensitive else hex_id.upper()
                comp_name = current_name if case_sensitive else current_name.upper()
                comp_historical = [name if case_sensitive else name.upper() for name in historical_names]

                match = False

                if use_wildcard:
                    # Wildcard search using regex
                    if search_type == "id":
                        match = regex_pattern.match(comp_hex)
                    else:
                        name_match = regex_pattern.match(comp_name)
                        hist_match = any(regex_pattern.match(name) for name in comp_historical)
                        match = name_match or hist_match
                else:
                    # Normal search
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
                self.result_text.insert(tk.END, f"No ships found matching: {search_text}")
                self.result_text.config(state="disabled")
                return

            # Sort matches by name (case-insensitive)
            matches.sort(key=lambda x: x[1].lower())

            # Populate matches listbox
            for hex_id, display_name in matches:
                self.matches_listbox.insert(tk.END, display_name)

            self.matches_listbox.config(height=min(10, len(matches)))

            # If exact match found, select it automatically
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
                self.result_text.insert(tk.END, f"Found {len(matches)} matching ships. Double-click one to view history.")
                self.result_text.config(state="disabled")

            if matches:
                self.matches_listbox.focus_set()
                self.matches_listbox.selection_set(0)
                self.matches_listbox.activate(0)

        except Exception as e:
            self.result_text.config(state="normal")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, f"Error during search:\n{str(e)}")
            self.result_text.config(state="disabled")

    def _load_and_display_items(self, hex_id, date_str):
        """Modified to include back button state"""
        self.back_button.config(state="normal")
        ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")

        if not os.path.exists(ships_path):
            self.result_text.insert(tk.END, "\nNo data for this date")
            return

        try:
            with gzip.open(ships_path, "rb") as f:
                ships_data = json.load(f)

            item_name_map = {item[0]: item[1] for item in ITEM_DB}
            found = False

            for ship in ships_data:
                # Fix: Remove braces and normalize case
                ship_hex = ship.get("hex_code", "").strip("{}").upper()
                target_hex = hex_id.strip("{}").upper()

                if ship_hex == target_hex:  # Proper comparison
                    items = ship.get("items", {})
                    if not items:
                        self.result_text.insert(tk.END, "\nNo items recorded")
                        return

                    # Format items
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
                self.result_text.insert(tk.END, "\nShip not found in this date's records")

        except json.JSONDecodeError:
            self.result_text.insert(tk.END, "\nCorrupted ships file")
        except Exception as e:
            self.result_text.insert(tk.END, f"\nError: {str(e)}")

    def _display_current_ship_contents(self, hex_id):
        """Display current ship contents under the name"""
        latest_date = max(
            (tuple(map(int, date.split('_'))), date)
            for date, _ in self.ship_names[hex_id]["name_history"]
        )[1] if self.ship_names[hex_id]["name_history"] else None

        if latest_date:
            self.result_text.insert(tk.END, "\nCurrent Contents:\n")
            self._load_and_display_items(hex_id, latest_date)

    def show_ship_contents(self, hex_id, date_str):
        """Show contents with back button enabled"""
        self.current_ship_hex = hex_id
        self.back_button.config(state="normal")
        """Display ship contents for a specific date"""
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        try:
            # Convert date_str to directory format (ensure underscores)
            year, month, day = date_str.split("_")
            normalized_date = f"{year}_{month}_{day}"

            # Display header
            self.result_text.insert(tk.END, f"=== Contents on {date_str} ===")
            self._load_and_display_items(hex_id, normalized_date)

        except ValueError:
            self.result_text.insert(tk.END, "\nInvalid date format")

        self.result_text.config(state="disabled")

    def select_ship_from_list(self):
        """Handle selection from matches listbox"""
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
                self.result_text.insert(tk.END, f"Error processing ship ID:\n{str(e)}")
                self.result_text.config(state="disabled")

    def get_ship_name_history(self, hex_id):
        """Retrieve complete name history for a ship from preloaded data"""
        hex_id = hex_id.upper().strip('{}')
        if hex_id not in self.ship_names:
            return []

        # Return a copy of the history sorted newest first
        return sorted(self.ship_names[hex_id]["name_history"],
                    key=lambda x: tuple(map(int, x[0].split('_'))),
                    reverse=True)

    def export_to_txt(self):
        """Export the current filtered data to a text file"""
        if not self.filtered_data:
            messagebox.showwarning("Warning", "No data available to export")
            return

        # Get the current display content and ensure it's a string
        content = self.get_filtered_data_as_text()

        # Convert list to string if necessary
        if isinstance(content, list):
            content = '\n'.join(content)

        if not content.strip():
            messagebox.showwarning("Warning", "No data matches current filters")
            return

        # Ask user for file location
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            title="Save transaction data"
        )

        if not file_path:  # User cancelled
            return

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            messagebox.showinfo("Success", f"Data successfully exported to {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export data: {str(e)}")

    def get_filtered_data_as_text(self):
        """Optimized version that stacks identical transactions and sorts by quantity (descending)"""
        try:
            start_time = time.time()

            # Create header as list of lines
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

            # Pre-cache item names
            item_name_cache = {item[0]: item[1] for item in ITEM_DB}

            # Pre-process ship name histories into efficient structure
            ship_name_cache = {}
            if self.use_ship_names.get():
                for hex_id, data in self.ship_names.items():
                    if 'name_history' in data:
                        # Convert dates to comparable tuples and sort
                        history = [(tuple(map(int, date.split('_'))), name)
                                for date, name in data['name_history']]
                        history.sort()  # Sort by date
                        ship_name_cache[hex_id] = {
                            'history': history,
                            'current': data.get('current_name', '')
                        }

            # Group and stack identical transactions, sum their counts
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

                    # Update transaction group with count and timestamps
                    transaction_groups[key]['total'] += count
                    if timestamp is not None:
                        if transaction_groups[key]['first_time'] is None or timestamp < transaction_groups[key]['first_time']:
                            transaction_groups[key]['first_time'] = timestamp
                        if transaction_groups[key]['last_time'] is None or timestamp > transaction_groups[key]['last_time']:
                            transaction_groups[key]['last_time'] = timestamp
            output = []
            # Process transactions into item groups
            item_groups = defaultdict(list)
            for key, data in transaction_groups.items():
                item_id, src, dst, zone = key
                total = data['total']
                first_time = data['first_time']
                last_time = data['last_time']
                item_groups[item_id].append((src, dst, zone, total, first_time, last_time))

            # Add summary section if preview
            summary_lines = ["Summary of filtered data:", ""]
            # Sort items by total quantity (descending)
            for item_id, transactions in sorted(item_groups.items(),
                                            key=lambda x: sum(t[3] for t in x[1]), reverse=True):
                item_name = item_name_cache.get(item_id, str(item_id))
                total = sum(t[3] for t in transactions)
                summary_lines.append(f"{item_name}: {total} total items moved")
            output.extend(summary_lines)
            output.append("=" * 50)
            output.append("")

            # Process each item group, sorted by total quantity across all transactions (descending)
            for item_id, transactions in sorted(item_groups.items(),
                                            key=lambda x: sum(t[3] for t in x[1]),
                                            reverse=True):
                item_name = item_name_cache.get(item_id, str(item_id))
                output.append(f"")
                output.append(f"=== {item_name} ===")

                # Sort transactions by quantity (descending) then by oldest first
                transactions.sort(key=lambda x: (-x[3], x[4]))

                count_len = max(len(str(t[3])) for t in transactions)

                for src, dst, zone, count, first_time, last_time in transactions:
                    # Format zone name
                    zone = {
                        "Super Special Event Zone": "Mosaic",
                        "Freeport I": "FP I",
                        "Freeport II": "FP II",
                        "Freeport III": "FP III",
                        "The Nest": "Freeport",
                        "Hummingbird": "Hummbird"
                    }.get(zone, zone)

                    src_name = None

                    #if not src[0] == "{":
                     #   print(src)

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

                    # Get historical names if enabled
                    dst_name = None
                    if self.use_ship_names.get():
                        src_name = self._get_cached_historical_name(src, first_time, ship_name_cache)
                        dst_name = self._get_cached_historical_name(dst, first_time, ship_name_cache)
                    time_str = self.format_timestamp(first_time)

                    # Format output line - showing summed count
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

            # At the end, instead of joining with newlines, just return the list
            processing_time = time.time() - start_time
            header_lines.insert(0, "")
            header_lines.insert(0, f"Processing completed in: {processing_time:.2f} seconds")
            return header_lines + output  # output should be a list of lines

        except Exception as e:
            return [f"Error generating report: {str(e)}\n\nIf no information was given, you probably ran out of RAM. The limit is set to {max_mem_gb}GB. Change this on the first line after the \"import\" things in the code."]

    def _get_ship_name(self, ship_id):
        """Get the current name for a ship ID"""
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

            # Get the ship data
            ship_data = name_cache[hex_id]
            if not ship_data.get('history'):
                return ship_data.get('current', '')

            # Convert timestamp from milliseconds to seconds
            trans_date = datetime.fromtimestamp(timestamp)
            trans_tuple = (trans_date.year, trans_date.month, trans_date.day)

            # Find most recent name change before transaction
            history = ship_data['history']
            current_name = ship_data['current']

            # Binary search through sorted history
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
        """Display the history and enable/disable back button appropriately"""
        self.current_ship_hex = hex_id
        self.back_button.config(state="disabled")
        self.result_text.config(state="normal")
        self.result_text.delete(1.0, tk.END)

        name_history = self.get_ship_name_history(hex_id)
        current_name = self.ship_names.get(hex_id, {}).get("current_name", "Unknown")

        # Display current name and contents
        self.result_text.insert(tk.END, f"=== Name History for Ship {{{hex_id}}} ===\n\n")
        self.result_text.insert(tk.END, f"Current Name: {current_name}\n")

        # Display historical names with clickable dates
        self.result_text.insert(tk.END, "\nName History:\n")
        self.result_text.insert(tk.END, "-"*50 + "\n")

        for date_str, name in name_history:
            display_name = name if name.strip() else "-"
            tag_name = f"date_{date_str}"
            self.result_text.insert(tk.END, f"{date_str}: {display_name}\n", tag_name)
            self.result_text.tag_bind(tag_name, "<Button-1>",
                lambda e, d=date_str, h=hex_id: self.show_ship_contents(h, d))
            self.result_text.tag_config(tag_name, foreground="black", underline=True)

        self._display_current_ship_contents(hex_id)  # New method for current contents
        self.result_text.config(state="disabled")

    def update_display(self):
        """Update the display with current filters"""
        if not self.download_in_progress and self.raw_data:
            self.status_var.set("Applying filters...")
            self.root.update()

            # Apply filters in the main thread
            self.apply_filters()
            self.update_preview()

            self.status_var.set(f"Displaying {len(self.filtered_data)} transactions")

    def update_preview(self):
        """Update the preview text widget with filtered data"""
        content_lines = self.get_filtered_data_as_text()

        self.preview_text.config(state="normal")
        self.preview_text.delete(1.0, tk.END)

        for i, line in enumerate(content_lines):
            tag = "even" if i % 2 == 0 else "odd"
            self.preview_text.insert(tk.END, line + '\n', tag)

        self.preview_text.config(state="disabled")

    def validate_date_range(self):
        """Validate the selected date range"""
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
                messagebox.showerror("Error", "Dates must be on or after 2022-11-23")
                return False

            if start_date > max_date or end_date > max_date:
                messagebox.showerror("Error", "Dates cannot be in the future")
                return False

            if start_date > end_date:
                messagebox.showerror("Error", "Start date must be before end date")
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

            # save state
            has_selection = bool(self.search_combo.selection_present())

            # combobox update
            self.search_combo.icursor(cursor_pos)

            # restore selection if it exists
            if has_selection:
                self.search_combo.selection_range(0, tk.END)

            # dropdown if matching items
            if self.filtered_items:
                self.search_combo.event_generate('<Down>')


    def analyze_ships(self):
        """Initiate the analysis of all named ships' contents"""
        if self.ship_loading_in_progress or self.download_in_progress:
            messagebox.showwarning("Warning", "Data is being loaded, wait up you fucking freeloader")
            return

        if not self.ship_names:
            # Start loading ship names using main progress system
            self.status_var.set("Loading ship name data...")
            self.progress["value"] = 0
            self.download_in_progress = True
            self.start_ship_data_loading()
            return

        self.download_in_progress = True
        self.progress['value'] = 0
        self.status_var.set("Preparing ship analysis...")

        analysis_thread = threading.Thread(target=self.analyze_ships_thread, daemon=True)
        analysis_thread.start()
        self.root.after(100, self.check_download_progress)

    def analyze_ships_thread(self):
        try:
            # Collect ships and their latest date
            ships_to_process = {}
            for hex_id, data in self.ship_names.items():
                name_history = data.get("name_history", [])
                for date_str, name in reversed(name_history):
                    ships_to_process[hex_id] = date_str
                    break

            # Group by date
            date_ship_map = defaultdict(list)
            for hex_id, date_str in ships_to_process.items():
                date_ship_map[date_str].append(hex_id.upper().strip("{}"))

            total_dates = len(date_ship_map)
            self.download_queue.put(("PROGRESS", 0, total_dates, "Starting analysis..."))

            pile = defaultdict(int)
            processed_dates = 0

            for date_str, hex_ids in date_ship_map.items():
                if not self.download_in_progress:
                    self.download_queue.put(("CANCELLED", "Analysis cancelled"))
                    return

                ships_path = os.path.join(self.local_data_dir, date_str, "ships.json.gz")
                if not os.path.exists(ships_path):
                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates, f"Skipping missing {date_str}"))
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
                                pile[int(item_id)] += count
                            found += 1

                    self.download_queue.put(("PROGRESS", processed_dates + 1, total_dates,
                                            f"Processed {date_str} ({found}/{len(hex_ids)} ships)"))
                    processed_dates += 1

                except Exception as e:
                    self.download_queue.put(("ERROR", f"Error processing {date_str}: {str(e)}"))

            item_name_map = {item[0]: item[1] for item in ITEM_DB}
            sorted_items = sorted(pile.items(), key=lambda x: x[0])
            result = []
            for item_id, total in sorted_items:
                name = item_name_map.get(item_id, "Unknown Item")
                result.append(f"{name}: {total}")

            self.download_queue.put(("ANALYSIS_COMPLETE", result))

        except Exception as e:
            self.download_queue.put(("ERROR", f"Analysis failed: {str(e)}"))

    def display_analysis_result(self, result):
        result_window = tk.Toplevel(self.root)
        result_window.title("Ship Content Analysis")
        result_window.geometry("800x600")

        text_frame = ttk.Frame(result_window)
        text_frame.pack(fill="both", expand=True)

        text = tk.Text(text_frame, wrap="word", font=("DejaVu Sans Mono", self.text_size_var.get()))
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=text.yview)
        text.configure(yscrollcommand=scrollbar.set)

        text.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")

        text.insert(tk.END, "Aggregated items from all named ships:\n\n")
        for line in result:
            text.insert(tk.END, line + "\n")

        text.config(state="disabled")



if __name__ == "__main__":
    set_memory_limit()

    root = tk.Tk()
    app = EconLogScourer(root)
    root.mainloop()
