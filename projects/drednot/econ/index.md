---
layout: default
title: Drednot/econ
---

# Economy utils
## [DOWNLOAD V 1.5.5](/projects/drednot/econ/log.py)
Install instructions are at the bottom of the page.
Very easy to use python script to check economy data.<br>
Oldest available data from 2022/11/23<br>
<small>If you're not sure it's safe, send the script to your LLM of choice and ask it if it's safe. NEVER EVER trust scripts from the internet</small><br>

### Features
- **NEEDS AT LEAST 3.5GB OF RAM BY DEFAULT!!!** Change the "max_mem_gb" value at the top of the script (line 20) manually to change how much you're allocating. Minimum of 2.5GB. **DO NOT ALLOCATE TOO MUCH!!!**
- Lookup the name AND contents of any ship at any time.
- Search trough all recorded transactions, you can see where someone's flux or items come from, or go. Handy for detecting alt accounts.
- Look at all recorded existing items in the game. WIP, more updates are coming.
- Cool HELP menu to send you on your way while all the data is downloading.
- Automatic data downloading - The first run will download all (compressed) data files. Currently 2GB total, for 1100 days of data. Will update each run.
- Very easy to use once you get Python working.
- This tool uses public data, find out more [here - Drednot Coder Docs](https://drednot.io/c/coder-docs/t/economy-data-dumps/)

---

## Changelog

#### NEWEST VERSION - v 1.5.5
#### v 1.5

* **1.5.5**, small fix fixing the contributor window in the economy section
* **1.5.4**, Massively speeded up log loading when a SRC/DST ship is selected. If a ship was loaded on 2022/11/23 and once again let's say a month later, instead of combing trough EVERY log of that whole month and saying "nah this log's useless found 0 mentions" it checks first if the ship was loaded that day, and if not, it doesn't load the log.
* **1.5.3**, Added digit length filter in lookup ship name, useful for finding 8 digits.
* **1.5.2**, Modded analyze all ships to be able to only analyze ships from your shiplist.
* **1.5.1**, small hotfix (i test in prod)
* **1.5.0**, Added a strawberry bot inspired total net worth calculator. Pretty subjective, who gives a fuck. Change it yourself if you want, not too hard. Also improved the backend to handle newly added items automatically via item_scheme.json, if cogg ever decides to continue development.

#### v 1.4
* **1.4.5** Added the analyze items button, to analyze all existing items and where they're at. Really interesting stuff.
* **1.4.4**, added the help entry for analyze ships, clarified some of the error messages.
* **1.4.2 + 3** are small hotfixes.
* **1.4.1**, made error mess

**Started recording version history at v 1.4.1**

#### v 1.3
Added ship content in the ship name function, bug fixes, bit of RAM optimization and stuff. Exact same look as 1.1/1.2 though

#### v 1.2
Lots of UI and backend improvements and bug fixes.

#### v 1.1
Stopped the bad practice of just downloading all the stuff you need - added a local directory with all the files. Downloading them was still in a seperate script back then. Will only download the dataset once. Also added a summary of the things you looked up

#### v 1.0
Formatted the data nicely, fixed search functionality, added date range, a basic ship name lookup function, and TON of bug fixes holy shit.

#### v 0.2
Added nonfunctional basic search functionality

#### v 0.1
Very primitive JSON downloader with a tiny preview window. Could download data from one date and just view the raw JSON.

# Install instructions for WINDOWS
**This might be tricky to install, if you need some of my help, DM me on Discord: @`iogamesplayer` or ask ChatGPT**
- 1: Install Python >3.

- 2: Download the script into your Downloads folder as "log.py".

- 3: Open CMD, and type "cd Downloads", or cd to your download folder.

- 4: Run "python3 log.py" - it should return some errors. If the error is "Python3 is not recognized as a command", I don't really know how to fix that. Try installing the package from python.org AND MAKE SURE YOU CHECK THE ADD PYTHON TO $PATH CHECKBOX!!!

- 5: All errors should be some imports missing, like "requests". Type "pip install \[missing package\]" to install these.

- 6: Repeat that for every missing package, until it finally works.

- 7: Wait like an hour for all the data to download. Read the help menu or something. It's ~2.0GB and should only download once.

- 8: It probably failed for a few files. Just relaunch it after you're done and it'll automatically see which files are **MISSING**.

- If it crashed / got closed while the download was going on you're probably gonna have to remove some directories manually.

- 9 \[OPTIONAL\]: Once you got it all working, place the log.py file on the desktop and rename it to log.py**w**. This will make it click-to-open like any normal program and you won't have to do any command prompt stuff.

