#!/usr/bin/env python3
"""
  ╔══════════════════════════════════════════════════════╗
  ║           IRELAND ADVENTURE                          ║
  ║     Journey Through the Emerald Isle                 ║
  ║                                                      ║
  ║  Explore mystical landscapes, battle monsters,       ║
  ║  and uncover 5 legendary Celtic artifacts!           ║
  ╚══════════════════════════════════════════════════════╝
"""

import os
import sys
import random
import textwrap

# ──────────────────────────────────────────────────────────────
# ANSI COLORS
# ──────────────────────────────────────────────────────────────
R   = '\033[0m'      # Reset
BD  = '\033[1m'      # Bold
DIM = '\033[2m'      # Dim

fR  = '\033[31m'     # Red
fG  = '\033[32m'     # Green
fY  = '\033[33m'     # Yellow
fBL = '\033[34m'     # Blue
fM  = '\033[35m'     # Magenta
fC  = '\033[36m'     # Cyan
fW  = '\033[37m'     # White

fbR  = '\033[91m'    # Bright Red
fbG  = '\033[92m'    # Bright Green
fbY  = '\033[93m'    # Bright Yellow
fbBL = '\033[94m'    # Bright Blue
fbM  = '\033[95m'    # Bright Magenta
fbC  = '\033[96m'    # Bright Cyan
fbW  = '\033[97m'    # Bright White

def col(color, text):
    return f"{color}{text}{R}"

def bold(text):
    return f"{BD}{text}{R}"

# ──────────────────────────────────────────────────────────────
# MAP OF IRELAND  (55 cols × 22 rows)
#
# ~ = Sea          . = Plains       ^ = Mountains
# T = Forest       r = River        | = Cliffs of Moher
# D = Dublin       B = Belfast      G = Galway
# C = Cork         L = Limerick     S = Sligo
# K = Killarney    # = Castle       ? = Mystery location
# ──────────────────────────────────────────────────────────────
MAP_TEMPLATE = [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",  # 0
    "~~~~~~~~~~~~~~~~~^^^^^^^^^^^^~~~~~~~~~~~~~~~~~~~~~~~~~~",  # 1  Donegal
    "~~~~~~~~~~~~~~~~^^..T.?T..T..^^~~~~~~~~~~~~~~~~~~~~~~~~",  # 2  Mystery in forest
    "~~~~~~~~~~~~~~~^^...TTTTTTT...^S~~~~~~~~~~~~~~~~~~~~~~~",  # 3  Sligo
    "~~~~~~~~~~~~~~~^....TTTTT.....^B~~~~~~~~~~~~~~~~~~~~~~~",  # 4  Belfast
    "~~~~~~~~~~~~~~^.....TTT.........#~~~~~~~~~~~~~~~~~~~~~~",  # 5  Dunluce Castle
    "~~~~~~~~~~~~~~^....TTT...........^~~~~~~~~~~~~~~~~~~~~~",  # 6
    "~~~~~~~~~~~~~~^....TT......?.....^~~~~~~~~~~~~~~~~~~~~~",  # 7  Mystery plains
    "~~~~~~~~~~~~~~|....TT.........r..^~~~~~~~~~~~~~~~~~~~~~",  # 8
    "~~~~~~~~~~~~~~|.....T.......rrr..^~~~~~~~~~~~~~~~~~~~~~",  # 9
    "~~~~~~~~~~~~~~|.....T.G....rrr...^~~~~~~~~~~~~~~~~~~~~~",  # 10 Galway
    "~~~~~~~~~~~~~~|..........rrrrrr.^^~~~~~~~~~~~~~~~~~~~~~",  # 11 Wicklow foothills
    "~~~~~~~~~~~~~~|......#..rrrr.D...^~~~~~~~~~~~~~~~~~~~~~",  # 12 Dublin + Castle
    "~~~~~~~~~~~~~~|.....#..rrrr...^.^^~~~~~~~~~~~~~~~~~~~~~",  # 13 Wicklow mountains
    "~~~~~~~~~~~~~~|..L.....rrr.....^^^~~~~~~~~~~~~~~~~~~~~~",  # 14 Limerick
    "~~~~~~~~~~~~~~|........rrrr...^^^^^~~~~~~~~~~~~~~~~~~~~",  # 15
    "~~~~~~~~~~~~~~|......?.rrrr..^^^^^^~~~~~~~~~~~~~~~~~~~~",  # 16 Mystery + river
    "~~~~~~~~~~~~~~|........r.K..^^^^^^^~~~~~~~~~~~~~~~~~~~~",  # 17 Killarney
    "~~~~~~~~~~~~~~|........r..C.^^^^^^^~~~~~~~~~~~~~~~~~~~~",  # 18 Cork
    "~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^~~~~~~~~~~~~~~~~~~~~~~~~~",  # 19 South coast
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",  # 20
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",  # 21
]

MAP_WIDTH  = 55
MAP_HEIGHT = 22

# ──────────────────────────────────────────────────────────────
# TERRAIN DEFINITIONS
# ──────────────────────────────────────────────────────────────
TERRAIN = {
    '~': {'name': 'Sea',           'symbol': '~', 'color': fbBL, 'walkable': False, 'enc': 0.00},
    '.': {'name': 'Plains',        'symbol': '.', 'color': fbG,  'walkable': True,  'enc': 0.22},
    '^': {'name': 'Mountains',     'symbol': '^', 'color': fbW,  'walkable': True,  'enc': 0.30},
    'T': {'name': 'Forest',        'symbol': 'T', 'color': fG,   'walkable': True,  'enc': 0.38},
    'r': {'name': 'River',         'symbol': '~', 'color': fbC,  'walkable': True,  'enc': 0.12},
    '|': {'name': 'Cliffs',        'symbol': '|', 'color': fY,   'walkable': True,  'enc': 0.10},
    '#': {'name': 'Castle Ruins',  'symbol': '#', 'color': fbM,  'walkable': True,  'enc': 0.55},
    '?': {'name': 'Mystery Spot',  'symbol': '?', 'color': fbM,  'walkable': True,  'enc': 1.00},
    'D': {'name': 'Dublin',        'symbol': 'D', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'B': {'name': 'Belfast',       'symbol': 'B', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'G': {'name': 'Galway',        'symbol': 'G', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'C': {'name': 'Cork',          'symbol': 'C', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'L': {'name': 'Limerick',      'symbol': 'L', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'S': {'name': 'Sligo',         'symbol': 'S', 'color': fbY,  'walkable': True,  'enc': 0.00},
    'K': {'name': 'Killarney',     'symbol': 'K', 'color': fbY,  'walkable': True,  'enc': 0.00},
}

# ──────────────────────────────────────────────────────────────
# CITY DATA
# ──────────────────────────────────────────────────────────────
CITY_DATA = {
    'D': {
        'name': 'Dublin',
        'desc': "Capital of Ireland! Cobblestone streets bustle with merchants and scholars.",
        'heal_cost': 0,
        'lore': "The ancient city of Dubhlinn — 'Black Pool' — where Vikings once traded and saints walked.",
    },
    'B': {
        'name': 'Belfast',
        'desc': "A spirited northern city with strong linen traders and salty sea air.",
        'heal_cost': 10,
        'lore': "Belfast guards the northern shores. Nearby Dunluce Castle perches on dramatic cliffs.",
    },
    'G': {
        'name': 'Galway',
        'desc': "A lively harbour city on the Wild Atlantic Way. Seagulls cry and music drifts from the pubs.",
        'heal_cost': 5,
        'lore': "Once a walled medieval city, Galway is the gateway to the magical Connemara wilderness.",
    },
    'C': {
        'name': 'Cork',
        'desc': "The Republic's second city, built on an island in the River Lee. Grand markets abound.",
        'heal_cost': 5,
        'lore': "Cork's ancient name, Corcaigh, means 'marshy place'. Blarney Castle lies just to the north.",
    },
    'L': {
        'name': 'Limerick',
        'desc': "A medieval city guarding the Shannon crossing. Bards sing limericks at every corner.",
        'heal_cost': 10,
        'lore': "King John's Castle looms over the Shannon. The Treaty Stone marks a fateful peace.",
    },
    'S': {
        'name': 'Sligo',
        'desc': "W.B. Yeats' beloved town, nestled between Benbulben mountain and the Atlantic.",
        'heal_cost': 5,
        'lore': "Sligo is the land of myth — Knocknarea mountain holds the alleged tomb of Queen Maeve.",
    },
    'K': {
        'name': 'Killarney',
        'desc': "A jewel of the southwest, surrounded by ancient lakes, mountains, and fairy-tale forests.",
        'heal_cost': 0,
        'lore': "Ross Castle on Lough Leane was the last stronghold in Munster to fall to Cromwell.",
    },
}

# ──────────────────────────────────────────────────────────────
# SHOP ITEMS
# ──────────────────────────────────────────────────────────────
SHOP_ITEMS = [
    {'id': 'potion',   'name': 'Healing Potion',    'price': 25,  'desc': 'Restores 35 HP'},
    {'id': 'gpotion',  'name': 'Greater Potion',    'price': 50,  'desc': 'Restores 70 HP'},
    {'id': 'sword',    'name': "Blacksmith's Sword", 'price': 65,  'desc': '+6 Attack (one per player)'},
    {'id': 'shield',   'name': 'Wicker Shield',     'price': 50,  'desc': '+4 Defense (one per player)'},
    {'id': 'cloak',    'name': 'Traveller\'s Cloak', 'price': 80,  'desc': '-20% encounter rate (one)'},
]

# ──────────────────────────────────────────────────────────────
# THE 5 LEGENDARY ARTIFACTS
# ──────────────────────────────────────────────────────────────
ARTIFACTS = [
    {'id': 'harp',    'name': 'Harp of Tara',
     'desc': "A golden harp said to put all who hear it to peaceful sleep.",
     'location': (2, 22)},
    {'id': 'spear',   'name': 'Spear of Lugh',
     'desc': "The sun-god Lugh's invincible spear — it always hits its mark.",
     'location': (7, 27)},
    {'id': 'cauldron','name': 'Cauldron of Dagda',
     'desc': "The great cauldron that never runs empty and heals the worthy.",
     'location': (16, 21)},
    {'id': 'sword_art','name': 'Sword of Light',
     'desc': "A blade that glows with sacred fire, banishing all darkness.",
     'location': (5, 32)},
    {'id': 'stone',   'name': 'Stone of Destiny',
     'desc': "The Lia Fáil, which cries out beneath the feet of the true High King.",
     'location': (12, 21)},
]

ARTIFACT_LOCATIONS = {a['location']: a for a in ARTIFACTS}

# ──────────────────────────────────────────────────────────────
# ENCOUNTER TABLES  {terrain: [(chance, type, data), ...]}
# ──────────────────────────────────────────────────────────────
def make_encounters():
    return {
        '.': [
            (0.30, 'enemy',   {'name': 'Viking Raider',   'hp': 35, 'atk': 11, 'dfn': 3,  'gold': 14}),
            (0.15, 'enemy',   {'name': 'Bandit Gang',     'hp': 50, 'atk': 14, 'dfn': 4,  'gold': 20}),
            (0.15, 'friendly',{'name': 'Wandering Merchant','msg': "A friendly merchant hands you some coin!", 'gold': random.randint(10,25)}),
            (0.10, 'heal',    {'msg': "You find a fairy ring! Resting within, you recover 15 HP.", 'hp': 15}),
            (0.30, 'nothing', {}),
        ],
        '^': [
            (0.35, 'enemy',   {'name': 'Rock Troll',      'hp': 75, 'atk': 20, 'dfn': 8,  'gold': 28}),
            (0.20, 'enemy',   {'name': 'Mountain Eagle',  'hp': 40, 'atk': 15, 'dfn': 2,  'gold': 10}),
            (0.10, 'heal',    {'msg': "A mountain spring! You drink the cool water and recover 10 HP.", 'hp': 10}),
            (0.10, 'friendly',{'name': 'Hermit Monk',     'msg': "A wise monk shares provisions with you.", 'gold': random.randint(5,15)}),
            (0.25, 'nothing', {}),
        ],
        'T': [
            (0.30, 'enemy',   {'name': 'Wolf Pack',       'hp': 45, 'atk': 14, 'dfn': 3,  'gold': 8}),
            (0.25, 'enemy',   {'name': 'Giant Spider',    'hp': 60, 'atk': 17, 'dfn': 5,  'gold': 18}),
            (0.15, 'friendly',{'name': 'Forest Fairy',    'msg': "A tiny fairy sprinkles healing dust on you!", 'hp': 20}),
            (0.10, 'gold',    {'msg': "You find a fallen traveller's purse in the undergrowth.", 'gold': random.randint(8,20)}),
            (0.20, 'nothing', {}),
        ],
        'r': [
            (0.20, 'enemy',   {'name': 'River Nixie',     'hp': 30, 'atk': 10, 'dfn': 2,  'gold': 12}),
            (0.20, 'heal',    {'msg': "You splash cold Shannon water on your face. +20 HP!", 'hp': 20}),
            (0.10, 'gold',    {'msg': "You spot a glinting coin beneath the shallows.", 'gold': random.randint(5,15)}),
            (0.50, 'nothing', {}),
        ],
        '|': [
            (0.25, 'enemy',   {'name': 'Banshee',         'hp': 55, 'atk': 16, 'dfn': 4,  'gold': 22}),
            (0.15, 'damage',  {'msg': "A gust of Atlantic wind nearly throws you off the Cliffs! -10 HP.", 'hp': 10}),
            (0.20, 'heal',    {'msg': "The breathtaking view restores your spirit. +5 HP.", 'hp': 5}),
            (0.40, 'nothing', {}),
        ],
        '#': [
            (0.45, 'enemy',   {'name': 'Castle Ghost',    'hp': 55, 'atk': 18, 'dfn': 6,  'gold': 35}),
            (0.15, 'enemy',   {'name': 'Dark Knight',     'hp': 80, 'atk': 22, 'dfn': 10, 'gold': 50}),
            (0.40, 'nothing', {}),
        ],
    }

# ──────────────────────────────────────────────────────────────
# PLAYER
# ──────────────────────────────────────────────────────────────
class Player:
    def __init__(self):
        self.row       = 12
        self.col       = 29     # Start in Dublin
        self.hp        = 100
        self.max_hp    = 100
        self.atk       = 10
        self.dfn       = 5
        self.gold      = 50
        self.inventory = []     # list of item ids
        self.artifacts = []     # list of artifact ids found
        self.visited   = set()  # city tiles visited
        self.messages  = []     # last N log messages
        self.moves     = 0

    def add_msg(self, msg, color=fbW):
        wrapped = textwrap.fill(msg, 52)
        for line in wrapped.split('\n'):
            self.messages.append(col(color, line))
        self.messages = self.messages[-6:]

    def has_item(self, item_id):
        return item_id in self.inventory

    def use_item(self, item_id):
        if item_id not in self.inventory:
            return False
        if item_id == 'potion':
            self.hp = min(self.max_hp, self.hp + 35)
            self.inventory.remove('potion')
            self.add_msg("You drink the potion. +35 HP!", fbG)
        elif item_id == 'gpotion':
            self.hp = min(self.max_hp, self.hp + 70)
            self.inventory.remove('gpotion')
            self.add_msg("You quaff the greater potion. +70 HP!", fbG)
        return True

# ──────────────────────────────────────────────────────────────
# RENDERING HELPERS
# ──────────────────────────────────────────────────────────────
def hp_bar(current, maximum, width=16):
    pct   = current / maximum if maximum > 0 else 0
    filled = round(pct * width)
    color  = fbG if pct > 0.5 else (fbY if pct > 0.25 else fbR)
    bar    = col(color, '█' * filled) + col(DIM + fW, '░' * (width - filled))
    return f"[{bar}{R}]"

def render_map(game_map, player_row, player_col):
    lines = []
    for r, row in enumerate(game_map):
        line_parts = []
        for c, ch in enumerate(row):
            if r == player_row and c == player_col:
                line_parts.append(col(fbR + BD, '@'))
            elif ch in TERRAIN:
                t = TERRAIN[ch]
                line_parts.append(col(t['color'], t['symbol']))
            else:
                line_parts.append(ch)
        lines.append(''.join(line_parts))
    return lines

def render_stats(player):
    lines = []
    w = 22
    sep = col(DIM + fW, '─' * w)

    lines.append(col(fbY + BD, ' ★ IRELAND ADVENTURE ★'))
    lines.append(sep)
    lines.append(f" HP  {hp_bar(player.hp, player.max_hp)}")
    lines.append(f"     {col(fbG, str(player.hp))}/{col(fG, str(player.max_hp))} HP")
    lines.append(f" {col(fbY, '⚔')}  ATK {col(fbW, str(player.atk))}   "
                 f"{col(fbBL, '🛡')}  DEF {col(fbW, str(player.dfn))}")
    lines.append(f" {col(fbY, '💰')}  {col(fbY, str(player.gold))} gold")
    lines.append(sep)

    # Artifacts
    lines.append(col(fbM + BD, f" ARTIFACTS  {len(player.artifacts)}/5"))
    for art in ARTIFACTS:
        if art['id'] in player.artifacts:
            lines.append(col(fbM, f"  ✦ {art['name'][:18]}"))
        else:
            lines.append(col(DIM + fW, f"  · {'?' * min(len(art['name']), 18)}"))
    lines.append(sep)

    # Inventory
    lines.append(col(fbC + BD, f" INVENTORY  {len(player.inventory)} item(s)"))
    item_display = {
        'potion':  'Healing Potion',
        'gpotion': 'Greater Potion',
        'sword':   "Blacksmith Sword",
        'shield':  'Wicker Shield',
        'cloak':   "Traveller's Cloak",
    }
    shown = []
    for item_id in player.inventory:
        name = item_display.get(item_id, item_id)
        if name not in shown:
            count = player.inventory.count(item_id)
            suffix = f' x{count}' if count > 1 else ''
            lines.append(col(fbC, f"  • {name}{suffix}"))
            shown.append(name)
    if not player.inventory:
        lines.append(col(DIM + fW, "  (empty)"))
    lines.append(sep)

    # Moves
    lines.append(col(DIM + fW, f" Moves: {player.moves}"))
    return lines

def render_messages(player):
    lines = [col(fW + BD, " MESSAGE LOG ") + col(DIM + fW, '─' * 42)]
    if not player.messages:
        lines.append(col(DIM + fW, " ...silence..."))
    for msg in player.messages[-4:]:
        lines.append(f" {msg}")
    return lines

def render_commands(terrain_name):
    cmds = (f" {col(fbY,'[W/A/S/D]')} Move  "
            f"{col(fbY,'[I]')} Use item  "
            f"{col(fbY,'[E]')} Interact  "
            f"{col(fbY,'[H]')} Help  "
            f"{col(fbY,'[Q]')} Quit")
    loc  = f" Location: {col(fbG, terrain_name)}"
    return [col(DIM + fW, '─' * 78), cmds, loc]

def clear():
    os.system('clear')

def print_screen(map_lines, stat_lines, msg_lines, cmd_lines):
    clear()
    # Print title bar
    print(col(fG + BD,
              "╔══════════════════════════════════════════════════════╗  "
              "╔════════════════════╗"))
    print(col(fG + BD,
              "║         EMERALD ISLE ADVENTURE MAP                  ║  "
              "║   ADVENTURER       ║"))
    print(col(fG + BD,
              "╚══════════════════════════════════════════════════════╝  "
              "╚════════════════════╝"))

    max_rows = max(len(map_lines), len(stat_lines))
    for i in range(max_rows):
        map_part  = map_lines[i]  if i < len(map_lines)  else ''
        stat_part = stat_lines[i] if i < len(stat_lines) else ''
        # Pad map part to fixed visual width (55 visible chars)
        raw_map   = strip_ansi(map_part)
        padding   = ' ' * max(0, MAP_WIDTH - len(raw_map))
        print(f"{map_part}{padding}  {stat_part}")

    print()
    for line in msg_lines:
        print(line)
    for line in cmd_lines:
        print(line)

def strip_ansi(text):
    import re
    return re.sub(r'\033\[[0-9;]*m', '', text)

# ──────────────────────────────────────────────────────────────
# COMBAT
# ──────────────────────────────────────────────────────────────
def do_combat(player, enemy, game):
    """Simple turn-based combat. Returns True if player survives."""
    e_hp  = enemy['hp']
    e_atk = enemy['atk']
    e_dfn = enemy['dfn']
    name  = enemy['name']

    player.add_msg(f"⚔  A {name} attacks!", fbR)

    while e_hp > 0 and player.hp > 0:
        # Player's turn
        p_dmg = max(1, player.atk + random.randint(-3, 4) - e_dfn)
        e_hp -= p_dmg

        if e_hp <= 0:
            reward = enemy.get('gold', 0) + random.randint(0, 5)
            player.gold += reward
            player.add_msg(f"You slay the {name}! +{reward}g", fbY)
            # Chance for potion drop
            if random.random() < 0.25:
                player.inventory.append('potion')
                player.add_msg("It dropped a Healing Potion!", fbG)
            return True

        # Enemy's turn
        e_dmg = max(1, e_atk + random.randint(-3, 3) - player.dfn)
        player.hp -= e_dmg
        player.add_msg(
            f"{name}: -{e_dmg} HP  |  You: -{p_dmg} HP to foe", fbR)

        if player.hp <= 0:
            player.hp = 0
            player.add_msg("You have been defeated... ☠", fbR + BD)
            return False

    return True

# ──────────────────────────────────────────────────────────────
# GAME CLASS
# ──────────────────────────────────────────────────────────────
class Game:
    def __init__(self):
        self.map     = [list(row) for row in MAP_TEMPLATE]
        self.player  = Player()
        self.running = True
        self.enc_tbl = make_encounters()
        self.collected_artifacts = set()
        # Greet
        self.player.add_msg(
            "Welcome to Ireland! You stand in Dublin. "
            "Seek the 5 legendary Celtic artifacts!", fbY)
        self.player.add_msg(
            "Move with W/A/S/D. Type 'E' to interact, 'I' to use items.", fbW)
        self._check_special(self.player.row, self.player.col, entering=True)

    # ── helpers ─────────────────────────────────────────────
    def tile(self, r, c):
        if 0 <= r < MAP_HEIGHT and 0 <= c < MAP_WIDTH:
            return self.map[r][c]
        return '~'

    def terrain_name(self):
        t = self.tile(self.player.row, self.player.col)
        return TERRAIN.get(t, {}).get('name', '???')

    # ── movement ────────────────────────────────────────────
    def move(self, dr, dc):
        nr = self.player.row + dr
        nc = self.player.col + dc
        t  = self.tile(nr, nc)
        if not TERRAIN.get(t, {}).get('walkable', False):
            self.player.add_msg("The sea blocks your path.", fBL)
            return
        self.player.row  = nr
        self.player.col  = nc
        self.player.moves += 1

        enc_rate = TERRAIN[t]['enc']
        # Cloak reduces encounters
        if 'cloak' in self.player.inventory:
            enc_rate *= 0.8

        self._check_special(nr, nc, entering=True)

        if t not in ('D','B','G','C','L','S','K') and random.random() < enc_rate:
            self._do_encounter(t)

    def _check_special(self, r, c, entering=False):
        t = self.tile(r, c)
        loc = (r, c)

        # Artifact at this location?
        if loc in ARTIFACT_LOCATIONS:
            art = ARTIFACT_LOCATIONS[loc]
            if art['id'] not in self.player.artifacts:
                self.player.artifacts.append(art['id'])
                self.player.add_msg(
                    f"✦ You found: {art['name']}!", fbM + BD)
                self.player.add_msg(art['desc'], fbM)
                # Mark tile as collected
                self.map[r][c] = '.'

        # City entry
        if entering and t in CITY_DATA and t not in self.player.visited:
            self.player.visited.add(t)
            city = CITY_DATA[t]
            self.player.add_msg(
                f"You arrive at {city['name']}!", fbY + BD)
            self.player.add_msg(city['desc'], fY)

    # ── encounters ──────────────────────────────────────────
    def _do_encounter(self, terrain):
        table = self.enc_tbl.get(terrain, [])
        if not table:
            return
        roll = random.random()
        cum  = 0.0
        for (chance, etype, data) in table:
            cum += chance
            if roll <= cum:
                self._resolve_encounter(etype, data)
                return

    def _resolve_encounter(self, etype, data):
        p = self.player
        if etype == 'nothing':
            return
        elif etype == 'enemy':
            do_combat(p, data, self)
            if p.hp <= 0:
                self.running = False
        elif etype == 'friendly':
            msg = data.get('msg', '')
            if msg:
                p.add_msg(msg, fbG)
            if 'gold' in data and isinstance(data['gold'], int):
                p.gold += data['gold']
                p.add_msg(f"+{data['gold']} gold!", fbY)
            if 'hp' in data:
                healed = min(data['hp'], p.max_hp - p.hp)
                p.hp += healed
                p.add_msg(f"+{healed} HP!", fbG)
        elif etype == 'heal':
            healed = min(data['hp'], p.max_hp - p.hp)
            p.hp += healed
            p.add_msg(data['msg'], fbG)
        elif etype == 'damage':
            p.hp = max(0, p.hp - data['hp'])
            p.add_msg(data['msg'], fbR)
            if p.hp <= 0:
                self.running = False
        elif etype == 'gold':
            p.gold += data['gold']
            p.add_msg(data['msg'], fbY)
            p.add_msg(f"+{data['gold']} gold!", fbY)

    # ── interactions ────────────────────────────────────────
    def interact(self):
        p = self.player
        t = self.tile(p.row, p.col)

        if t in CITY_DATA:
            self._city_menu(t)
        elif t == '#':
            p.add_msg("You explore the castle ruins...", fbM)
            self._do_encounter('#')
        elif t == '?':
            # Handled by _check_special on move; re-check manually
            self._check_special(p.row, p.col)
        elif t in ('^', '.', 'T', 'r', '|'):
            descs = {
                '^': "Craggy peaks pierce low clouds. The wind howls between ancient stones.",
                '.': "Rolling green fields, dotted with sheep and hawthorn hedges.",
                'T': "A dense oak forest hums with birdsong and rustles with hidden life.",
                'r': "Clear water babbles over moss-covered rocks along the Shannon river.",
                '|': "You stand at the Cliffs of Moher. 200m below, Atlantic waves crash.",
            }
            p.add_msg(descs.get(t, "Nothing of note here."), fC)
        else:
            p.add_msg("Nothing of note here.", DIM + fW)

    def _city_menu(self, city_key):
        p    = self.player
        city = CITY_DATA[city_key]
        p.add_msg(city['lore'], fC)

        # Auto-rest if HP is low (free)
        if p.hp < p.max_hp:
            healed = p.max_hp - p.hp
            p.hp   = p.max_hp
            p.add_msg(
                f"You rest in {city['name']}. Fully healed! (+{healed} HP)", fbG)

        # Mini shop — offer one random item
        shop_item = random.choice(SHOP_ITEMS)
        if not (shop_item['id'] in ('sword','shield','cloak') and p.has_item(shop_item['id'])):
            p.add_msg(
                f"Shop: '{shop_item['name']}' for {shop_item['price']}g "
                f"— {shop_item['desc']}. Buy? [y/n]", fbY)
            self._render_now()
            ans = input(" > ").strip().lower()
            if ans == 'y':
                if p.gold >= shop_item['price']:
                    p.gold -= shop_item['price']
                    p.inventory.append(shop_item['id'])
                    # Weapon/armour/cloak: apply effect immediately
                    if shop_item['id'] == 'sword':
                        p.atk += 6
                        p.add_msg("+6 Attack from Blacksmith's Sword!", fbG)
                    elif shop_item['id'] == 'shield':
                        p.dfn += 4
                        p.add_msg("+4 Defense from Wicker Shield!", fbG)
                    elif shop_item['id'] == 'cloak':
                        p.add_msg("Traveller's Cloak reduces encounters!", fbG)
                    else:
                        p.add_msg(
                            f"Bought {shop_item['name']}! "
                            f"({p.gold}g remaining)", fbG)
                else:
                    p.add_msg("Not enough gold!", fbR)

    # ── inventory / use item ─────────────────────────────────
    def use_item_menu(self):
        p = self.player
        usable = [i for i in p.inventory if i in ('potion', 'gpotion')]
        if not usable:
            p.add_msg("No usable items in inventory.", DIM + fW)
            return
        item_id = usable[0]
        p.use_item(item_id)

    # ── render ───────────────────────────────────────────────
    def _render_now(self):
        map_lines  = render_map(self.map, self.player.row, self.player.col)
        stat_lines = render_stats(self.player)
        msg_lines  = render_messages(self.player)
        cmd_lines  = render_commands(self.terrain_name())
        print_screen(map_lines, stat_lines, msg_lines, cmd_lines)

    # ── main loop ────────────────────────────────────────────
    def run(self):
        while self.running:
            self._render_now()

            if len(self.player.artifacts) >= 5:
                self._victory()
                return

            try:
                cmd = input(col(fbY, "\n Command > ")).strip().lower()
            except (EOFError, KeyboardInterrupt):
                break

            if cmd in ('w', 'up',    'north', 'n'):
                self.move(-1, 0)
            elif cmd in ('s', 'down',  'south'):
                self.move(1, 0)
            elif cmd in ('a', 'left',  'west',  'l'):
                self.move(0, -1)
            elif cmd in ('d', 'right', 'east'):
                self.move(0, 1)
            elif cmd == 'e':
                self.interact()
            elif cmd == 'i':
                self.use_item_menu()
            elif cmd == 'h':
                self._show_help()
            elif cmd in ('q', 'quit', 'exit'):
                print(col(fbY, "\nFarewell, brave adventurer! May the road rise up to meet you.\n"))
                return
            elif cmd == '':
                pass
            else:
                self.player.add_msg(
                    f"Unknown command '{cmd}'. Press H for help.", DIM + fW)

        if self.player.hp <= 0:
            self._game_over()

    def _victory(self):
        self._render_now()
        print()
        print(col(fbY + BD, "╔══════════════════════════════════════════════════════╗"))
        print(col(fbY + BD, "║           ✦  VICTORY! YOU WIN!  ✦                    ║"))
        print(col(fbY + BD, "╚══════════════════════════════════════════════════════╝"))
        print()
        print(col(fbW, " You have gathered all 5 legendary Celtic artifacts!"))
        print(col(fbG, " The High King's throne at Tara glows with golden light."))
        print(col(fbM, " Druids and bards across the Emerald Isle sing your name."))
        print()
        for art in ARTIFACTS:
            print(col(fbM, f"  ✦ {art['name']}: {art['desc']}"))
        print()
        print(col(fbY, f" Moves taken : {self.player.moves}"))
        print(col(fbY, f" Gold earned : {self.player.gold}g"))
        print()
        print(col(fbG + BD, " Sláinte agus go raibh maith agat! (Health and thank you!)"))
        print()

    def _game_over(self):
        clear()
        print()
        print(col(fbR + BD, "╔══════════════════════════════════════════════════════╗"))
        print(col(fbR + BD, "║            ☠  GAME OVER  ☠                           ║"))
        print(col(fbR + BD, "╚══════════════════════════════════════════════════════╝"))
        print()
        print(col(fbW, " Your wounds proved too great. Ireland mourns a brave soul."))
        print(col(fW,  f" You fell after {self.player.moves} moves, carrying "
                       f"{self.player.gold} gold pieces."))
        if self.player.artifacts:
            print(col(fM,  " Artifacts collected:"))
            for aid in self.player.artifacts:
                art = next(a for a in ARTIFACTS if a['id'] == aid)
                print(col(fM,  f"   ✦ {art['name']}"))
        print()
        print(col(fY, " Press Enter to exit."))
        input()

    def _show_help(self):
        clear()
        print(col(fbY + BD, "\n  ── IRELAND ADVENTURE HELP ──\n"))
        print(col(fbW, "  MOVEMENT"))
        print("    W / N  →  North (up)")
        print("    S      →  South (down)")
        print("    A / W  →  West  (left)")
        print("    D      →  East  (right)\n")
        print(col(fbW, "  ACTIONS"))
        print("    E  →  Interact / Enter city shop or explore castle")
        print("    I  →  Use first available healing item")
        print("    H  →  Show this help screen")
        print("    Q  →  Quit game\n")
        print(col(fbW, "  MAP LEGEND"))
        legends = [
            ('~', fbBL,  'Sea / Ocean (impassable)'),
            ('.', fbG,   'Plains (low encounter)'),
            ('^', fbW,   'Mountains (trolls & eagles)'),
            ('T', fG,    'Forest (wolves & fairies)'),
            ('~', fbC,   'River (nixies & fresh water)'),
            ('|', fY,    'Cliffs of Moher (banshees)'),
            ('#', fbM,   'Castle Ruins (ghosts & knights)'),
            ('?', fbM,   'Mystery Location (contains an artifact!)'),
            ('★', fbY,   'City (rest, shop, lore)'),
            ('@', fbR,   'You!'),
        ]
        for sym, clr, desc in legends:
            print(f"    {col(clr, sym)}  →  {desc}")
        print(col(fbW, "\n  GOAL"))
        print("    Collect all 5 legendary Celtic artifacts to win!")
        print("    Artifacts appear at Mystery (?) spots and Castle ruins.\n")
        print(col(DIM + fW, "  Press Enter to continue..."))
        input()

# ──────────────────────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────────────────────
def main():
    print(col(fbG + BD, """
  ╔══════════════════════════════════════════════════════╗
  ║           IRELAND ADVENTURE                          ║
  ║     Journey Through the Emerald Isle                 ║
  ╠══════════════════════════════════════════════════════╣
  ║                                                      ║
  ║  Five legendary Celtic artifacts are hidden across   ║
  ║  Ireland. Brave monsters, visit ancient cities, and  ║
  ║  uncover the treasures of the Emerald Isle!          ║
  ║                                                      ║
  ║  Move: W A S D    Interact: E    Help: H    Quit: Q  ║
  ╚══════════════════════════════════════════════════════╝
    """))
    input(col(fbY, "  Press Enter to begin your adventure..."))
    game = Game()
    game.run()

if __name__ == '__main__':
    main()
