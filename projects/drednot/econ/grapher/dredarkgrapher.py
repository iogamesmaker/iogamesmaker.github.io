import json
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, simpledialog, colorchooser
from collections import defaultdict
import itertools
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
import unicodedata
import threading
import queue
from matplotlib.colors import CSS4_COLORS, to_hex
from matplotlib import ticker
import random
import logging

# Configuration for emoji font and spacing
EMOJI_FONT_SIZE = 14  # Font size for emojis
ROW_PADDING = 14      # Extra padding for row height

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('emoji_analyzer.log'),
        logging.StreamHandler()
    ]
)

plt.rcParams["font.family"] = "Cantarell"
plt.rcParams["font.sans-serif"] = ["Noto Color Emoji", "Cantarell", "Liberation Sans"]

class EmojiTrendAnalyzer:
    def __init__(self, root):
        self.root = root
        self.root.title("Tag Trend Analyzer")
        self.root.geometry("1400x900")

        style = ttk.Style(self.root)
        style.configure("Treeview", font=("Segoe UI Emoji", EMOJI_FONT_SIZE),
                        rowheight=EMOJI_FONT_SIZE + ROW_PADDING)

        self.raw_data = None
        self.controls_visible = True
        self.last_emoji_data = {}
        self.emoji_list_data = {}
        self.processed_data = queue.Queue()
        self.color_palette = list(CSS4_COLORS.values())
        random.shuffle(self.color_palette)
        self.current_ylim = None
        self.data_lock = threading.Lock()
        self.emoji_groups = defaultdict(set)
        self.custom_patterns = set()
        self.graph_mode = "lines"
        self.processing_thread = None
        self.stop_event = threading.Event()
        self.include_other = tk.BooleanVar(value=False)
        self.show_total = tk.BooleanVar(value=False)

        self.setup_ui()
        self.start_processing_thread()

    def create_load_section(self):
        frame = ttk.Frame(self.control_frame)
        frame.pack(pady=5, fill=tk.X)
        ttk.Button(frame, text="Load Data", command=self.load_data).pack(side=tk.LEFT)
        self.status_label = ttk.Label(frame, text="Ready.")
        self.status_label.pack(side=tk.LEFT, padx=5)

    def create_pattern_section(self):
        frame = ttk.LabelFrame(self.control_frame, text="Custom Patterns")
        frame.pack(pady=5, fill=tk.X)
        self.custom_entry = ttk.Entry(frame)
        self.custom_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(frame, text="+", width=3, command=self.add_custom_pattern).pack(side=tk.LEFT)

    def create_group_section(self):
        frame = ttk.LabelFrame(self.control_frame, text="Tag Groups")
        frame.pack(pady=5, fill=tk.BOTH, expand=True)

        # Group list
        self.group_list = ttk.Treeview(frame, columns=('color',), show='tree')
        self.group_list.heading('#0', text='Group')
        self.group_list.column('#0', width=120)
        self.group_list.pack(side=tk.LEFT, fill=tk.Y)
        self.group_list.bind('<Double-1>', self.edit_group_dialog)

        # Group controls
        ctrl = ttk.Frame(frame)
        ctrl.pack(side=tk.LEFT, fill=tk.X, padx=5)
        ttk.Button(ctrl, text="New Group", command=self.create_group).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="Delete Group", command=self.delete_group).pack(pady=2, fill=tk.X)
        self.group_entry = ttk.Entry(ctrl)
        self.group_entry.pack(pady=4, fill=tk.X)
        ttk.Button(ctrl, text="Add Tags to Group", command=self.add_emoji_to_selected_group).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="Add Selected to Group", command=self.add_selected_to_group).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="Save Config", command=self.save_config).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="Load Config", command=self.load_config).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="^", command=self.move_group_up).pack(pady=2, fill=tk.X)
        ttk.Button(ctrl, text="v", command=self.move_group_down).pack(pady=2, fill=tk.X)

    def create_emoji_list(self):
        frame = ttk.LabelFrame(self.control_frame, text="Tag List")
        frame.pack(pady=5, fill=tk.BOTH, expand=True)

        self.emoji_list = ttk.Treeview(frame, columns=('tag', 'count'), show='tree headings')
        self.emoji_list.heading('#0', text='#', anchor='center')
        self.emoji_list.column('#0', width=40, anchor='center', stretch=False)
        self.emoji_list.heading('tag', text='Tag')
        self.emoji_list.column('tag', width=60, anchor='center')
        self.emoji_list.heading('count', text='Count')
        self.emoji_list.column('count', width=120, anchor='center')
        self.emoji_list.pack(fill=tk.BOTH, expand=True)

    def create_plot_section(self):
        fig = plt.Figure(figsize=(10,6), dpi=100)
        self.ax = fig.add_subplot(111)

        self.canvas = FigureCanvasTkAgg(fig, master=self.viz_frame)
        toolbar_frame = ttk.Frame(self.viz_frame)
        toolbar_frame.pack(side=tk.TOP, fill=tk.X)
        toolbar = NavigationToolbar2Tk(self.canvas, toolbar_frame)
        toolbar.update()
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        button_frame = ttk.Frame(self.viz_frame)
        button_frame.pack(pady=5)
        ttk.Button(button_frame, text="Update Plot", command=self.update_plot).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Render High-Res", command=self.create_render_options_dialog).pack(side=tk.LEFT, padx=5)
        self.toggle_btn = ttk.Button(button_frame, text="Hide Controls", command=self.toggle_controls)
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        self.mode_btn = ttk.Button(button_frame, text="Switch to Stacked", command=self.switch_graph_mode)
        self.mode_btn.pack(side=tk.LEFT, padx=5)
        self.update_btn = ttk.Button(button_frame, text="Reprocess Data", command=self.manual_reprocess)
        self.update_btn.pack(side=tk.LEFT, padx=5)
        other_checkbox = ttk.Checkbutton(
            button_frame,
            text='Others',
            variable=self.include_other,
            command=self.update_plot
        )
        other_checkbox.pack(anchor='w', padx=10, pady=5)

        total_checkbox = ttk.Checkbutton(
            button_frame,
            text='Total',
            variable=self.show_total,
            command=self.update_plot
        )
        total_checkbox.pack(anchor='w', padx=5, pady=2)

    def switch_graph_mode(self):
        modes = ['lines', 'stacked', 'stacked100']
        labels = {
            'lines': 'Stacked',
            'stacked': '100% Stacked',
            'stacked100': 'Lines'
        }
        current_idx = modes.index(self.graph_mode)
        self.graph_mode = modes[(current_idx + 1) % 3]
        self.mode_btn.config(text=f"Switch to {labels[self.graph_mode]}")

    def toggle_controls(self):
        if self.controls_visible:
            self.control_frame.grid_remove()
            self.main_frame.columnconfigure(0, minsize=0)
            self.toggle_btn.config(text="Show Controls")
        else:
            self.control_frame.grid()
            self.main_frame.columnconfigure(0, minsize=600)
            self.toggle_btn.config(text="Hide Controls")
        self.controls_visible = not self.controls_visible

    def start_processing_thread(self):
        self.stop_event.clear()
        t = threading.Thread(target=self.data_processor, daemon=True)
        t.start()
        self.processing_thread = t

    def actual_processing(self, data):
        emoji_counts  = defaultdict(lambda: defaultdict(int))
        custom_counts = defaultdict(lambda: defaultdict(int))
        group_counts  = defaultdict(lambda: defaultdict(int))

        custom_snapshot = self.custom_patterns_snapshot
        groups_snapshot = self.emoji_groups_snapshot
        pattern_to_groups = defaultdict(list)
        for group, patterns in groups_snapshot.items():
            for pat in patterns:
                pattern_to_groups[pat].append(group)

        EXCLUDED_CATEGORIES = {
            'Ll','Lu','Lt','Lm','Lo',
            'Nd','Nl','No',
            'Pc','Pd','Ps','Pe','Pi','Pf','Po',
            'Zs','Zl','Zp',
            'Mc','Me','Mn'
        }
        SPECIAL_EXCLUDE = set("~|=\\@#$%^&*()_+{}[]:;'\"<>,.?/!\n\r\t")

        def _ensure_other_group(self):
            """Add OTHER group to UI if missing"""
            if 'OTHER' not in self.group_list.get_children():
                self.group_list.insert('', 'end', iid='OTHER',
                                    text='OTHER', values=('#ffffff',))
                with self.data_lock:
                    self.emoji_groups['OTHER'] = set()

        # Calculate OTHER group counts
        for date in data['ship_data']:
            total_ships = len(data['ship_data'][date])
            categorized = sum(
                group_counts[grp].get(date, 0) +
                custom_counts[pat].get(date, 0) +
                emoji_counts[emoji].get(date, 0)
                for grp in group_counts
                for pat in custom_counts
                for emoji in emoji_counts
            )
            other_count = total_ships - categorized
            if other_count > 0:
                group_counts['OTHER'][date] = other_count

        # Ensure OTHER group exists in UI
        self.root.after(0, self._ensure_other_group)

        for date, ships in data.get('ship_data', {}).items():
            if isinstance(ships, dict):
                ship_names = [n for n in ships.values() if isinstance(n, str) and n.strip()]
            else:
                ship_names = [n for n in ships if isinstance(n, str) and n.strip()]

            for name in ship_names:
                name_lower = name.lower()
                counts = {}

                # pattern matches
                for pat in itertools.chain(custom_snapshot, *groups_snapshot.values()):
                    c = name_lower.count(pat.lower())
                    if c:
                        counts[pat] = counts.get(pat, 0) + c

                # emoji clusters
                current = []
                for c in name:
                    if unicodedata.category(c) in EXCLUDED_CATEGORIES or c in SPECIAL_EXCLUDE:
                        if current:
                            cluster = ''.join(current)
                            counts[cluster] = counts.get(cluster, 0) + 1
                            current = []
                    else:
                        current.append(c)
                if current:
                    cluster = ''.join(current)
                    counts[cluster] = counts.get(cluster, 0) + 1

                if not counts:
                    continue

                max_count = max(counts.values())
                candidates = [p for p, v in counts.items() if v == max_count]
                chosen = sorted(candidates)[0]

                if chosen in self.custom_patterns:
                    custom_counts[chosen][date] += 1
                else:
                    emoji_counts[chosen][date] += 1

                groups = pattern_to_groups.get(chosen, [])
                if groups:
                    grp = sorted(groups)[0]
                    group_counts[grp][date] += 1

        self.last_emoji_data    = {**group_counts, **custom_counts}
        self.emoji_list_data    = {**emoji_counts, **custom_counts}
        self.root.after(0, lambda: self.update_emoji_list(self.emoji_list_data))

    def update_plot(self):
        self.ax.clear()
        if not self.raw_data or not hasattr(self, 'last_emoji_data'):
            self.canvas.draw()
            return

        try:
            dates = sorted(
                self.raw_data['ship_data'].keys(),
                key=lambda d: datetime.strptime(d, '%Y_%m_%d')
            )
            x = [datetime.strptime(d, '%Y_%m_%d') for d in dates]
            groups = [self.group_list.item(c)['text'] for c in self.group_list.get_children('')]

            stack_data = []
            colors = []
            labels = []

            # Group counts per ship
            for group in groups:
                counts = [self.last_emoji_data.get(group, {}).get(d, 0) for d in dates]
                if sum(counts) > 0:
                    stack_data.append(counts)
                    vals = self.group_list.item(group, 'values')
                    colors.append(vals[0] if vals else '#000000')
                    labels.append(group)

            # OTHER = total JSON entries - processed ships
            other_counts = []
            if self.include_other.get():
                for idx, d in enumerate(dates):
                    total_loaded = len(self.raw_data['ship_data'][d])
                    processed = sum(data[idx] for data in stack_data)
                    other_counts.append(total_loaded - processed)
                if any(c > 0 for c in other_counts):
                    stack_data.append(other_counts)
                    colors.append('#ffffff')
                    labels.append('OTHER')

            # Plot lines or stacks for groups + OTHER
            if self.graph_mode == 'lines':
                for lbl, cnts, col in zip(labels, stack_data, colors):
                    self.ax.plot(x, cnts, label=lbl, color=col, zorder=3)
            else:
                if self.graph_mode == 'stacked100':
                    totals = [sum(col) for col in zip(*stack_data)]
                    stack_data = [[(v/t*100 if t else 0) for v, t in zip(row, totals)] for row in stack_data]
                self.ax.stackplot(x, stack_data, labels=labels, colors=colors, zorder=2)

            # Always-on total ships line from JSON entries
            if self.show_total.get():
                totals = [len(self.raw_data['ship_data'][d]) for d in dates]
                self.ax.plot(x, totals, label='TOTAL', color='black', linewidth=1.5, zorder=4)

            # Legend and formatting
            handles, lbls = self.ax.get_legend_handles_labels()
            if handles:
                self.ax.legend(handles=handles, bbox_to_anchor=(1.05, 1), loc='upper left')
            self.ax.get_figure().autofmt_xdate()

        except Exception as e:
            logging.exception("Error in update_plot")
            messagebox.showerror("Plot Error", f"Could not update plot: {e}")

        self.canvas.draw()

    def setup_ui(self):
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        self.main_frame.columnconfigure(0, minsize=600)
        self.main_frame.columnconfigure(1, weight=1)
        self.main_frame.rowconfigure(0, weight=1)

        self.control_frame = ttk.LabelFrame(self.main_frame, text="Controls")
        self.control_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)

        self.viz_frame = ttk.Frame(self.main_frame)
        self.viz_frame.grid(row=0, column=1, sticky="nsew")

        # Load, pattern, group, emoji list, plot sections
        self.create_load_section()
        self.create_pattern_section()
        self.create_group_section()
        self.create_emoji_list()
        self.create_plot_section()

        # Checkbox toggles
        other_checkbox = ttk.Checkbutton(
            self.control_frame,
            text='other',
            variable=self.include_other,
            command=self.update_plot
        )
        other_checkbox.pack(anchor='w', padx=5, pady=2)

        total_checkbox = ttk.Checkbutton(
            self.control_frame,
            text='total',
            variable=self.show_total,
            command=self.update_plot
        )
        total_checkbox.pack(anchor='w', padx=5, pady=2)

    def _ensure_other_group(self):
        # Ensure "OTHER" group is always present
        if 'OTHER' not in self.emoji_groups:
            with self.data_lock:
                self.emoji_groups['OTHER'] = set()
                self.group_list.insert('', 'end', iid='OTHER', text='OTHER', values=('#ffffff',))


    def render_highres(self, start_date, end_date, interval, width_str, height_str):
        # Validate dimensions
        try:
            width = float(width_str) if width_str else 80.0
        except ValueError:
            width = 80.0
        try:
            height = float(height_str) if height_str else 8.0
        except ValueError:
            height = 8.0

        if not self.raw_data or not hasattr(self, 'last_emoji_data'):
            messagebox.showwarning("No Data", "Load data first")
            return
        try:
            fig = plt.Figure(figsize=(width, height), dpi=300)
            ax = fig.add_subplot(111)

            ship_data = self.raw_data.get('ship_data', {})
            dates = sorted(
                [d for d in ship_data.keys()
                 if self.date_in_range(d, start_date, end_date)],
                key=lambda d: datetime.strptime(d, '%Y_%m_%d')
            )
            x = [datetime.strptime(d, '%Y_%m_%d') for d in dates]

            groups = [self.group_list.item(c)['text'] for c in self.group_list.get_children('')]
            stack_data, colors, labels, valid = [], [], [], []
            for grp in groups:
                cnts = [self.last_emoji_data.get(grp, {}).get(d, 0) for d in dates]
                if sum(cnts) > 0:
                    stack_data.append(cnts)
                    vals = self.group_list.item(grp, 'values')
                    colors.append(vals[0] if vals else '#000000')
                    labels.append(grp)
                    valid.append(grp)

            if valid:
                if self.graph_mode == 'lines':
                    for grp, cnts, col in zip(valid, stack_data, colors):
                        ax.plot(x, cnts, label=grp, color=col, zorder=3)
                else:
                    if self.graph_mode == 'stacked100':
                        totals = [sum(col) for col in zip(*stack_data)]
                        stack_data = [
                            [(v/t*100 if t else 0) for v, t in zip(row, totals)]
                            for row in stack_data
                        ]
                    ax.stackplot(x, stack_data, labels=labels, colors=colors, zorder=2)

            for pat in self.custom_patterns:
                cnts = [self.last_emoji_data.get(pat, {}).get(d, 0) for d in dates]
                if sum(cnts) > 0:
                    ax.plot(x, cnts, '--', label=pat, zorder=4)

            if self.graph_mode == 'stacked100':
                ax.set_ylim(0, 100)
                ax.yaxis.set_major_formatter(ticker.PercentFormatter())
            else:
                all_vals = []
                if valid:
                    if self.graph_mode == 'stacked':
                        all_vals.extend([sum(col) for col in zip(*stack_data)])
                    else:
                        all_vals.extend(v for row in stack_data for v in row)
                for pat in self.custom_patterns:
                    all_vals.extend(self.last_emoji_data.get(pat, {}).values())
                max_y = max(all_vals) if all_vals else 1
                ax.set_ylim(0, max_y * 1.1)
                ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))

            import matplotlib.dates as mdates
            try:
                interval = int(interval)
            except ValueError:
                interval = 7
            locator = mdates.DayLocator(interval=interval)
            fmt = mdates.DateFormatter("%Y-%m-%d")
            ax.xaxis.set_major_locator(locator)
            ax.xaxis.set_major_formatter(fmt)

            handles, lbls = ax.get_legend_handles_labels()
            if handles:
                ax.legend(handles=handles, bbox_to_anchor=(1.05, 1), loc='upper left')
            fig.autofmt_xdate()

            path = filedialog.asksaveasfilename(
                defaultextension=".png",
                filetypes=[("PNG","*.png"),("PDF","*.pdf"),("SVG","*.svg")]
            )
            if path:
                fig.savefig(path, bbox_inches='tight', dpi=300)
                messagebox.showinfo("Success", f"Saved high-res render to:\n{path}")

        except Exception as e:
            logging.exception("Render Error")
            messagebox.showerror("Render Error", f"Could not render: {e}")
        finally:
            plt.close(fig)

    def date_in_range(self, date_str, start_str, end_str):
        try:
            date = datetime.strptime(date_str, '%Y_%m_%d')
            start = datetime.strptime(start_str, '%Y_%m_%d') if start_str else datetime.min
            end   = datetime.strptime(end_str, '%Y_%m_%d') if end_str else datetime.max
            return start <= date <= end
        except ValueError as e:
            logging.error(f"Date parsing error: {e}")
            return False

    def data_processor(self):
        logging.info("Data processor thread started")
        while not self.stop_event.is_set():
            try:
                task = self.processed_data.get(timeout=0.1)
                if task['type'] == 'process':
                    self.status_label.config(text="Processing...")
                    self.actual_processing(task['data'])
                    self.status_label.config(text="Done.")
                elif task['type'] == 'shutdown':
                    break
            except queue.Empty:
                continue
        logging.info("Data processor thread exiting")

    def update_emoji_list(self, data):
        for i in self.emoji_list.get_children():
            self.emoji_list.delete(i)

        grouped = set(itertools.chain.from_iterable(self.emoji_groups.values()))
        items = []
        for tag, counts in data.items():
            if tag in grouped:
                continue
            total = sum(counts.values())
            items.append((tag, total))
        items.sort(key=lambda x: x[1], reverse=True)

        for rank, (tag, total) in enumerate(items, start=1):
            self.emoji_list.insert('', 'end', iid=tag,
                                   text=str(rank),
                                   values=(tag, total))

    def add_custom_pattern(self):
        pat = self.custom_entry.get().strip()
        if pat:
            with self.data_lock:
                if pat not in self.custom_patterns:
                    self.custom_patterns.add(pat)
                    self.custom_entry.delete(0, tk.END)

    def create_group(self):
        name = simpledialog.askstring("New Group", "Enter group name:")
        if name and name not in self.emoji_groups:
            self.emoji_groups[name] = set()
            color = "#000000"
            self.group_list.insert('', 'end', iid=name, text=name, values=(color,))

    def move_group_up(self):
        sel = self.group_list.selection()
        if not sel: return
        item = sel[0]
        children = list(self.group_list.get_children(''))
        idx = children.index(item)
        if idx > 0:
            self.group_list.move(item, '', idx-1)

    def move_group_down(self):
        sel = self.group_list.selection()
        if not sel: return
        item = sel[0]
        children = list(self.group_list.get_children(''))
        idx = children.index(item)
        if idx < len(children)-1:
            self.group_list.move(item, '', idx+1)

    def manual_reprocess(self):
        if self.raw_data:
            self.processed_data.put({'type':'process','data':self.raw_data})
            self.status_label.config(text="Reprocessing data...")
        else:
            messagebox.showwarning("No Data", "Load data first")

    @property
    def emoji_groups_snapshot(self):
        with self.data_lock:
            return {k: set(v) for k, v in self.emoji_groups.items()}

    @property
    def custom_patterns_snapshot(self):
        with self.data_lock:
            return set(self.custom_patterns)

    def edit_group_dialog(self, event):
        group_iid = self.group_list.identify_row(event.y)
        if not group_iid:
            return

        with self.data_lock:
            original_name  = group_iid
            original_color = self.group_list.set(group_iid, 'color')
            original_tags  = list(self.emoji_groups.get(group_iid, []))

        dialog = tk.Toplevel(self.root)
        dialog.title(f"Edit Group: {original_name}")
        dialog.transient(self.root)
        dialog.columnconfigure(1, weight=1)

        # Name
        ttk.Label(dialog, text="Group Name:").grid(row=0, column=0, padx=5, pady=5, sticky='e')
        name_entry = ttk.Entry(dialog)
        name_entry.insert(0, original_name)
        name_entry.grid(row=0, column=1, columnspan=2, pady=5, sticky='ew')

        # Color
        ttk.Label(dialog, text="Color:").grid(row=1, column=0, padx=5, pady=5, sticky='e')
        color_preview = ttk.Label(dialog, background=original_color, width=10)
        color_preview.grid(row=1, column=1, sticky='w', padx=5, pady=5)
        def choose_color():
            chosen = colorchooser.askcolor(initialcolor=color_preview.cget('background'))
            if chosen and chosen[1]:
                color_preview.config(background=chosen[1])
        ttk.Button(dialog, text="Choose Color", command=choose_color).grid(row=1, column=2, padx=5, pady=5)

        # Tags
        ttk.Label(dialog, text="Tags:").grid(row=2, column=0, padx=5, pady=5, sticky='ne')
        tags_frame = ttk.Frame(dialog)
        tags_frame.grid(row=2, column=1, columnspan=2, sticky='ew', padx=5, pady=5)
        tags_frame.columnconfigure(0, weight=1)

        tag_vars = []
        def add_tag_field(val=""):
            var = tk.StringVar(value=val)
            ent = ttk.Entry(tags_frame, textvariable=var)
            ent.grid(sticky='ew', pady=2)
            tag_vars.append(var)

        for t in original_tags:
            add_tag_field(t)

        ttk.Button(dialog, text="Add Tag", command=lambda: add_tag_field())\
            .grid(row=3, column=1, sticky='w', padx=5, pady=5)

        def save_changes():
            new_name  = name_entry.get().strip()
            new_color = color_preview.cget('background')
            new_tags  = {v.get().strip() for v in tag_vars if v.get().strip()}

            with self.data_lock:
                if new_name == original_name:
                    self.emoji_groups[original_name] = new_tags
                    # Update both the display text and the values tuple so the new color sticks
                    self.group_list.item(original_name,
                                        text=original_name,
                                        values=(new_color,))
                else:
                    if new_name in self.emoji_groups:
                        messagebox.showerror("Error", f"Group “{new_name}” already exists!")
                        return
                        # Remove the old, then insert the new with correct color in values
                        del self.emoji_groups[original_name]
                        self.group_list.delete(original_name)
                        self.emoji_groups[new_name] = new_tags
                        self.group_list.insert('', 'end',
                                            iid=new_name,
                                            text=new_name,
                                            values=(new_color,))

            dialog.destroy()

        btn_frame = ttk.Frame(dialog)
        btn_frame.grid(row=4, column=1, columnspan=2, sticky='e', pady=10)
        ttk.Button(btn_frame, text="Save",   command=save_changes).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=dialog.destroy).pack(side=tk.RIGHT)

        dialog.update_idletasks()
        dialog.wait_visibility()
        dialog.grab_set()
        dialog.wait_window()

    def delete_group(self):
        sel = self.group_list.selection()
        if sel:
            with self.data_lock:
                del self.emoji_groups[sel[0]]
            self.group_list.delete(sel[0])

    def add_emoji_to_selected_group(self):
        sel = self.group_list.selection()
        if not sel:
            return
        group = sel[0]
        text  = self.group_entry.get().strip()
        if not text:
            return
        patterns = [p.strip() for p in text.split() if p.strip()]
        with self.data_lock:
            self.emoji_groups[group].update(patterns)
        self.group_entry.delete(0, tk.END)

    def add_selected_to_group(self):
        sel = self.group_list.selection()
        if not sel: return
        group = sel[0]
        for tag in self.emoji_list.selection():
            self.emoji_groups[group].add(tag)

    def create_render_options_dialog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("High-Res Render Options")

        # Date entries as local variables
        rows = 0
        ttk.Label(dialog, text="Start Date (YYYY_MM_DD):").grid(row=rows, column=0, padx=5, pady=5, sticky='e')
        start_entry = ttk.Entry(dialog, width=12)
        start_entry.insert(0, "2022_11_23")
        start_entry.grid(row=rows, column=1, padx=5, pady=5, sticky='w')
        rows += 1

        ttk.Label(dialog, text="End Date (YYYY_MM_DD):").grid(row=rows, column=0, padx=5, pady=5, sticky='e')
        end_entry = ttk.Entry(dialog, width=12)
        end_entry.insert(0, "2025_05_15")
        end_entry.grid(row=rows, column=1, padx=5, pady=5, sticky='w')
        rows += 1

        ttk.Label(dialog, text="X-Tick Interval (days):").grid(row=rows, column=0, padx=5, pady=5, sticky='e')
        interval_entry = ttk.Entry(dialog, width=5)
        interval_entry.insert(0, "7")
        interval_entry.grid(row=rows, column=1, padx=5, pady=5, sticky='w')
        rows += 1

        # Add image size controls
        ttk.Label(dialog, text="Width (inches):").grid(row=rows, column=0, padx=5, pady=5, sticky='e')
        width_entry = ttk.Entry(dialog, width=5)
        width_entry.insert(0, "80")
        width_entry.grid(row=rows, column=1, padx=5, pady=5, sticky='w')
        rows += 1

        ttk.Label(dialog, text="Height (inches):").grid(row=rows, column=0, padx=5, pady=5, sticky='e')
        height_entry = ttk.Entry(dialog, width=5)
        height_entry.insert(0, "8")
        height_entry.grid(row=rows, column=1, padx=5, pady=5, sticky='w')
        rows += 1

        def start_render():
            self.render_highres(
                start_entry.get().strip(),
                end_entry.get().strip(),
                interval_entry.get().strip(),
                width_entry.get().strip(),
                height_entry.get().strip()
            )
            dialog.destroy()

        ttk.Button(dialog, text="Start Render", command=start_render).grid(row=rows, column=1, padx=5, pady=5, sticky='e')

    def load_data(self):
        path = filedialog.askopenfilename(filetypes=[("JSON", "*.json")])
        if not path:
            logging.info("Data import canceled by user")
            return

        self.status_label.config(text="Loading...")
        logging.info(f"Starting data import from: {path}")

        try:
            with open(path, encoding='utf-8') as f:
                d = json.load(f)

            logging.info(f"Successfully loaded data from {path}")
            ship_count = len(d)
            date_range = list(d.keys())
            logging.info(
                f"Imported {ship_count} daily records\n"
                f"Date range: {min(date_range, default='N/A')} to {max(date_range, default='N/A')}"
            )

            self.raw_data = {'ship_data': d}
            self.processed_data.put({'type': 'process', 'data': self.raw_data})
            logging.info("Data queued for processing")

        except Exception as e:
            error_msg = f"Failed to load data: {str(e)}"
            logging.error(error_msg, exc_info=True)
            messagebox.showerror("Error", error_msg)
        finally:
            self.status_label.config(text="Ready")

    def save_config(self):
        path = filedialog.asksaveasfilename(defaultextension=".json")
        if not path: return
        with self.data_lock:
            cfg = {
                'groups': {
                    g: {
                        'emojis': list(e),
                        'color' : self.group_list.set(g, 'color')
                    } for g, e in self.emoji_groups.items()
                },
                'custom_patterns': list(self.custom_patterns)
            }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)

    def load_config(self):
        path = filedialog.askopenfilename(filetypes=[("JSON","*.json")])
        if not path: return
        with open(path, encoding='utf-8') as f:
            cfg = json.load(f)
        with self.data_lock:
            self.emoji_groups.clear()
            self.group_list.delete(*self.group_list.get_children())
            self.custom_patterns.clear()
            for g, data in cfg.get('groups', {}).items():
                self.emoji_groups[g] = set(data.get('emojis', []))
                self.group_list.insert('', 'end', iid=g,
                                       text=g, values=(data.get('color','#000000'),))
            self.custom_patterns.update(cfg.get('custom_patterns', []))
        if self.raw_data:
            self.processed_data.put({'type':'process','data':self.raw_data})

    def on_closing(self):
        self.stop_event.set()
        self.processed_data.put({'type':'shutdown'})
        self.root.destroy()

if __name__ == '__main__':
    root = tk.Tk()
    app = EmojiTrendAnalyzer(root)
    root.protocol('WM_DELETE_WINDOW', app.on_closing)
    logging.info("Application started")
    root.mainloop()
