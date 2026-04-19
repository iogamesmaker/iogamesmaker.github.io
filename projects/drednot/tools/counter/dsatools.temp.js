var dsabp = (() => {
    var Ct = Object.defineProperty;
    var _e = Object.getOwnPropertyDescriptor;
    var ge = Object.prototype.hasOwnProperty;
    var be = (i, t) => {,
            for (var e in t) Ct(i, e, {
                get: t[e],
                enumerable: !0
            })
        },
        we = (i, t, e, n) => {
            if (t && typeof t == "object" || typeof t == "function")
                for (let r of de(t)) !ge.call(i, r) && r !== e && Ct(i, r, {
                    get: () => t[r],
                    enumerable: !(n = _e(t, r)) || n.enumerable
                });
            return i
        };
    var xe = i => we(Ct({}, "__esModule", {
        value: !0
    }), i);
    var Ye = {};
    be(Ye, {
        BPCmd: () => et,
        Blueprint: () => G,
        BuildBits: () => ct,
        BuildCmd: () => Z,
        ConfigCmd: () => P,
        Decoder: () => yt,
        Encoder: () => vt,
        Enum: () => D,
        FilterMode: () => ft,
        FixedAngle: () => mt,
        Item: () => W,
        LoaderPoint: () => nt,
        LoaderPriority: () => ht,
        PREFIX: () => gt,
        PusherMode: () => it,
        Shape: () => at,
        decode: () => Ve,
        decodeConfigCmd: () => qe,
        decodeConfigCmdSync: () => ze,
        decodeSync: () => Fe,
        encode: () => Ge,
        encodeSync: () => We
    });
    var et = class {};
    var ct = class {
        int;
        constructor(t) {
            if (t == null) {
                this.int = 0n;
                return
            }
            if (typeof t == "string") t = "0b" + kt(t);
            else if (typeof t != "number" && typeof t != "bigint") throw new TypeError("input must be a number, bigint or string");
            this.int = BigInt(t)
        }
        set(t) {
            if (t < 0 || t > 63) throw new RangeError("index must be between [0,63]");
            return this.int |= Tt(t), this
        }
        clear(t) {
            if (t < 0 || t > 63) throw new RangeError("index must be between [0,63]");
            return this.int &= ~Tt(t), this
        }
        toggle(t, e) {
            if (t < 0 || t > 63) throw new RangeError("index must be between [0,63]");
            return typeof e > "u" ? this.int ^= Tt(t) : e === !0 ? this.set(t) : e === !1 && this.clear(t), this
        }
        isSet(t) {
            return t < 0 || t > 63 ? !1 : !!(this.int & Tt(t))
        }
        isZero() {
            return this.int == 0n
        }
        isOne() {
            return this.int == 1n
        }
        trimLeadZeros() {
            return this.int && (this.int /= -this.int & this.int), this
        }
        get size() {
            return this.int.toString(2).length
        }*[Symbol.iterator]() {
            for (let t of kt(this.int.toString(2))) yield t == "1"
        }
        toArray() {
            return Array.from(this)
        }
        toString() {
            return kt(this.int.toString(2))
        }
        get[Symbol.toStringTag]() {
            return this.toString()
        }
        equals(t) {
            return this.int === t?.int
        }
        clone() {
            return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        }
    };

    function Tt(i) {
        return 1n << BigInt(i)
    }

    function kt(i) {
        return i.length < 1 ? i : i.split("").reduce((t, e) => e + t)
    }
    var D = class i {
        static maps = new Map;
        static getMap() {
            return this.maps.get(this.name)[0]
        }
        static getReverseMap() {
            return this.maps.get(this.name)[1]
        }
        static getByName(t) {
            return this.getMap().get(t)
        }
        static getByValue(t) {
            return this.getMap().get(this.getReverseMap().get(t))
        }
        static end() {
            this.maps.set(this.name, [new Map, new Map]);
            let t = this.getMap(),
                e = this.getReverseMap();
            for (let n in this) {
                let r = this[n];
                r instanceof i && (r.enumName = n, t.set(n, r), e.set(r.enumValue, n))
            }
        }
        constructor(t) {
            this.enumValue = t
        }
        enumName;
        enumValue;
        toString() {
            return this.constructor.name + "." + this.enumName
        }
    };
    var W = class i extends D {
        name;
        description;
        stackable;
        rarity;
        constructor(t, e, n, r, s, u, f, y, p, a) {
            super(t), this.name = e, this.description = n, this.stackable = r, this.rarity = s, u !== void 0 && (this.image = u), f !== void 0 && (this.recipe = f), y !== void 0 && (this.buildInfo = y), p !== void 0 && (this.blacklist_autobuild = p), a !== void 0 && (this.fab_type = a)
        }
        get id() {
            return this.enumValue
        }
        get isBuildable() {
            return !!this.buildInfo
        }
        get isBlock() {
            return !!this.buildInfo?.[0]?.block
        }
        static getById(t) {
            return i.getByValue(t)
        }
        static NULL = new this(0, "", "", !1, NaN);
        static RES_METAL = new this(1, "Iron", "Material. Used to produce most items.", !0, 0, "item/res_iron");
        static RES_GUNPOWDER = new this(2, "Explosives", "Material. Used to produce munitions.", !0, 0, "item/res_explosives");
        static RES_HYPER_RUBBER = new this(4, "Hyper Rubber", "Material. High Elasticity.", !0, 2, "item/res_hyper_rubber");
        static RES_FLUX = new this(5, "Flux Crystals", "Material. Used to produce advanced machinery.", !0, 2, "item/res_flux_crystals");
        static RES_FUEL = new this(6, "Thruster Fuel", "Refined fuel. Powers thrusters. More efficient than explosives.", !0, 0, "item/fuel", {
            count: 1,
            time: 30,
            input: [{
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static COMPRESSED_EXPLOSIVES = new this(49, "Compressed Explosives", "Explosives, compressed into a flux matrix at a 16:1 ratio. Unpack with a recycler.", !0, 2, "item/comp_exp");
        static COMPRESSED_IRON = new this(50, "Compressed Iron", "Iron, compressed into a flux matrix at a 24:1 ratio. Unpack with a recycler.", !0, 2, "item/comp_iron");
        static BALL_VOLLEY = new this(51, "Volleyball", "\u{1F3D0}", !1, 2, "item/ball_volley");
        static BALL_VOLLEY_GOLD = new this(52, "Golden Volleyball", "\u{1F31F}\u{1F3D0}\u{1F31F}", !1, 2, "item/ball_vg");
        static BALL_BASKET = new this(53, "Basketball", "\u{1F3C0}", !1, 2, "item/ball_basket");
        static BALL_BASKET_GOLD = new this(54, "Golden Basketball", "\u{1F31F}\u{1F3C0}\u{1F31F}", !1, 2, "item/ball_bg");
        static BALL_BEACH = new this(55, "Beach Ball", "\u{1F334}", !1, 2, "item/ball_beach");
        static BALL_SOCCER = new this(56, "Football", "\u26BD", !1, 2, "item/ball_soccer");
        static WRENCH = new this(100, "Wrench", "Used to take stuff apart.", !1, 0, "item/wrench", {
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static SHREDDER = new this(101, "Item Shredder", "Destroys items.", !1, 0, "item/item_shredder", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static SHREDDER_GOLD = new this(102, "Golden Item Shredder", "Destroys items quickly, with style.", !1, 9, "item/item_shredder_g");
        static REPAIR_TOOL = new this(103, "Repair Tool", "Used to repair blocks and objects.", !1, 0, "item/repair_tool", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static HAND_PUSHER = new this(104, "Handheld Pusher", "A pusher you can hold in your hand.", !1, 2, "item/pusher_hand", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }, {
                item: 5,
                count: 16
            }],
            built_by: ["Engineering"]
        });
        static SHIELD_BOOSTER = new this(105, "Ship Shield Booster", "An inferior power source for shield generators.", !1, 0, "item/repairkit", {
            count: 1,
            time: 3,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Engineering", "Munitions"]
        });
        static SHIP_EMBIGGENER = new this(106, "Ship Embiggener", "Makes your ship bigger. Press R to change axis.", !1, 0, "item/ship_embiggener", {
            count: 1,
            time: 3,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static SHIP_SHRINKINATOR = new this(107, "Ship Shrinkinator", "Makes your ship smaller. Space must be completely empty. Press R to change axis.", !1, 0, "item/ship_shrinkinator", {
            count: 1,
            time: 3,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Engineering"]
        });
        static EQUIPMENT_BACKPACK = new this(108, "Backpack", "Equipment (Back). Lets you hold more items.", !1, 1, "item/eq_backpack");
        static EQUIPMENT_SPEED_SKATES = new this(109, "Speed Skates", "Equipment (Feet). SPEED.", !1, 2, "item/eq_speed_skates", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 4,
                count: 4
            }, {
                item: 5,
                count: 16
            }],
            built_by: ["Equipment"]
        });
        static EQUIPMENT_BOOSTER_BOOTS = new this(110, "Booster Boots", "Equipment (Feet). Provides a double-jump and slightly more powerful jumps.", !1, 2, "item/eq_booster_boots", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 4,
                count: 8
            }, {
                item: 5,
                count: 16
            }],
            built_by: ["Equipment"]
        });
        static EQUIPMENT_LAUNCHER_GAUNTLETS = new this(111, "Launcher Gauntlets", "Equipment (Hands). Throw items more powerfully.", !1, 2, "item/eq_launcher_gauntlets", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 4,
                count: 8
            }, {
                item: 5,
                count: 8
            }],
            built_by: ["Equipment"]
        });
        static EQUIPMENT_CONSTRUCTION_GAUNTLETS = new this(112, "Construction Gauntlets", "Equipment (Hands). While in a safe zone: Doubles build/destruct/repair/use range and speed, and allows using objects through walls.", !1, 2, "item/eq_construction_gauntlets", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 4,
                count: 4
            }, {
                item: 5,
                count: 32
            }],
            built_by: ["Equipment"]
        });
        static EQUIPMENT_ROCKET_PACK = new this(113, "Rocket Pack", "Equipment (Back). Speedy Flight.", !1, 2, "item/eq_rocket_pack", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }, {
                item: 4,
                count: 4
            }, {
                item: 5,
                count: 32
            }],
            built_by: ["Equipment"]
        });
        static EQUIPMENT_HOVER_PACK = new this(114, "Hover Pack", "Equipment (Back). Controlled Flight.", !1, 2, "item/eq_hover_pack", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }, {
                item: 4,
                count: 4
            }, {
                item: 5,
                count: 32
            }],
            built_by: ["Equipment"]
        });
        static SCANNER_MANIFEST = new this(115, "Manifest Scanner", "Generate a list of items on your ship.", !1, 2, "item/scanner_manifest");
        static SCANNER_BOM = new this(116, "BoM Scanner", "Generate a list of materials used to build your ship.", !1, 2, "item/scanner_bom");
        static WRENCH_STARTER = new this(117, "Starter Wrench", "Useful for getting you out of a bind. Slow. Disappears if dropped.", !1, -1, "item/wrench_starter");
        static SHREDDER_STARTER = new this(118, "Starter Shredder", "Destroys items. Slow. Disappears if dropped.", !1, -1, "item/item_shredder_starter");
        static HAND_CANNON = new this(119, "Hand Cannon", "[TEST EXCLUSIVE] A small, handheld cannon. Uses ammo in your inventory.", !1, 0, "item/hand_cannon");
        static SCANNER_BLUEPRINT = new this(120, "Blueprint Scanner", "Generates blueprint strings, which describe how to rebuild ships or parts of ships. Click and drag to select a region.", !1, 2, "item/scanner_blueprint");
        static RCD_SANDBOX = new this(121, "Sandbox RCD", "Buildable. Used for automated construction. This test-exclusive variant can spawn items and doesn't need fuel. It works faster on ships owned by patrons.", !1, -1, "item/rcd_sandbox", void 0, [{
            bounds: {
                x: 2.5,
                y: 2.5
            },
            shape: {
                verts: [{
                    x: -1.2,
                    y: -.3999999999999999
                }, {
                    x: -.3999999999999999,
                    y: -1.2
                }, {
                    x: .3999999999999999,
                    y: -1.2
                }, {
                    x: 1.2,
                    y: -.3999999999999999
                }, {
                    x: 1.2,
                    y: .3999999999999999
                }, {
                    x: .3999999999999999,
                    y: 1.2
                }, {
                    x: -.3999999999999999,
                    y: 1.2
                }, {
                    x: -1.2,
                    y: .3999999999999999
                }]
            },
            allow_non_solids: !0,
            image: "rcd_sandbox",
            image_only: !0
        }], !0);
        static RCD_FLUX = new this(122, "Flux RCD", "Buildable. Used for automated construction. Consumes flux as fuel.", !1, 2, "item/rcd_flux", void 0, [{
            bounds: {
                x: 2.5,
                y: 2.5
            },
            shape: {
                verts: [{
                    x: -1.2,
                    y: -.3999999999999999
                }, {
                    x: -.3999999999999999,
                    y: -1.2
                }, {
                    x: .3999999999999999,
                    y: -1.2
                }, {
                    x: 1.2,
                    y: -.3999999999999999
                }, {
                    x: 1.2,
                    y: .3999999999999999
                }, {
                    x: .3999999999999999,
                    y: 1.2
                }, {
                    x: -.3999999999999999,
                    y: 1.2
                }, {
                    x: -1.2,
                    y: .3999999999999999
                }]
            },
            allow_non_solids: !0,
            image: "rcd_flux",
            image_only: !0
        }], !0);
        static SHIELD_CORE = new this(123, "Shield Core", "A power source for shield generators.", !1, 0, "item/shield_core");
        static AMMO_STANDARD = new this(150, "Standard Ammo", "Regular bullets.", !0, 0, "item/ammo_standard", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Starter", "Munitions"]
        });
        static AMMO_SCATTER = new this(151, "ScatterShot Ammo", "Shoots multiple projectiles. Significant damage at close range, with knock-back.", !0, 0, "item/ammo_scattershot", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_FLAK = new this(152, "Flak Ammo", "Explodes into more bullets in flight.", !0, 0, "item/ammo_flak", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_SNIPER = new this(153, "Sniper Ammo", "Speedy. Gains power from bouncing.", !0, 0, "item/ammo_sniper", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_PUNCH = new this(154, "Punch Ammo", "Pushes objects away.", !0, 0, "item/ammo_punch", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_YANK = new this(155, "Yank Ammo", "Pulls objects.", !0, 0, "item/ammo_yank", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_SLUG = new this(156, "Slug Ammo", "Slow bullet. Gains speed and damage as it falls.", !0, 0, "item/ammo_slug", {
            count: 4,
            time: 1,
            input: [{
                item: 1,
                count: 1
            }, {
                item: 2,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static AMMO_TRASH = new this(157, "Trash Box", "Low quality, but free! Decays over time.", !0, 0, "item/ammo_trash", {
            count: 1,
            time: 3,
            input: [],
            built_by: ["Munitions"]
        });
        static FUEL_BOOSTER_LOW = new this(159, "Booster Fuel (Low Grade)", "Increases thruster power for a short time.", !1, 0, "item/booster_low", {
            count: 1,
            time: 30,
            input: [{
                item: 2,
                count: 16
            }],
            built_by: ["Munitions"]
        });
        static FUEL_BOOSTER_HIGH = new this(160, "Booster Fuel (High Grade)", "Increases thruster power for a short time.", !1, 2, "item/booster_high", {
            count: 4,
            time: 30,
            input: [{
                item: 2,
                count: 64
            }, {
                item: 5,
                count: 1
            }],
            built_by: ["Munitions"]
        });
        static VOID_ORB = new this(161, "Void Orb", "DO NOT EAT!", !1, 10, "item/void_orb");
        static TURRET_BOOSTER_RAPID = new this(162, "Turret Booster - Rapid Fire", "Boosts a re-configurable turret's fire rate by 50%, with reduced accuracy.", !1, 2, "item/turret_booster_rapid");
        static TURRET_BOOSTER_RAPID_USED = new this(163, "Turret Booster - Rapid Fire (Depleted)", "Boosts a re-configurable turret's fire rate by 25%, with reduced accuracy. Nearly depleted!", !1, 2, "item/turret_booster_rapid_used");
        static TURRET_BOOSTER_PRESERVATION = new this(164, "Turret Booster - Preservation", "Boosts a re-configurable turret's ammo preservation by 10%, with reduced rotational aiming limits.", !1, 2, "item/turret_booster_preservation");
        static TURRET_BOOSTER_PRESERVATION_USED = new this(165, "Turret Booster - Preservation (Depleted)", "Boosts a re-configurable turret's ammo preservation by 5%, with reduced rotational aiming limits. Nearly depleted!", !1, 2, "item/turret_booster_preservation_used");
        static COOLING_CELL = new this(166, "Cooling Cell", "Prevents machine cannons from damaging themselves.", !1, 0, "item/cooling_cell", {
            count: 1,
            time: 1,
            input: [{
                item: 234,
                count: 4
            }],
            built_by: ["Munitions"]
        });
        static COOLING_CELL_HOT = new this(167, "Cooling Cell (Hot)", "Will take some time to cool back down.", !1, 0, "item/cooling_cell_hot");
        static BURST_CHARGE = new this(168, "Burst Charge", "Power source for burst cannons. Overcharging cannons may result in damage!", !1, 0, "item/burst_charge", {
            count: 1,
            time: 1,
            input: [{
                item: 2,
                count: 4
            }],
            built_by: ["Munitions"]
        });
        static HELM = new this(215, "Helm (Packaged)", "Buildable. Used to pilot your ship.", !1, 0, "item/helm", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_y: !0,
            offset: {
                x: 0,
                y: .3
            },
            bounds: {
                x: 1.5,
                y: 1.5
            },
            require_blocks: [{
                x: 0,
                y: -1,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "helm_wheel",
            image_only: !0
        }]);
        static HELM_STARTER = new this(216, "Helm (Starter, Packaged)", "Buildable Starter Item. Used to pilot your ship.", !1, -1, "item/helm_starter", void 0, [{
            snap_y: !0,
            offset: {
                x: 0,
                y: .3
            },
            bounds: {
                x: 1.5,
                y: 1.5
            },
            require_blocks: [{
                x: 0,
                y: -1,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "helm_wheel_starter",
            image_only: !0
        }]);
        static COMMS_STATION = new this(217, "Comms Station (Packaged)", "Buildable. Used to communicate with other ships.", !1, 0, "item/comms", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_y: !0,
            offset: {
                x: 0,
                y: -.25
            },
            bounds: {
                x: 1.25,
                y: 2.5
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "comms_station",
            image_only: !0
        }]);
        static SIGN = new this(218, "Sign (Packaged)", "Buildable. Can display a short message.", !1, 0, "item/sign", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            allow_solids: !0,
            image: "sign"
        }], !0);
        static SPAWN_POINT = new this(219, "Spawn Point (Packaged)", "Buildable. Can be set to spawn a specific rank.", !1, 0, "item/spawn", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_y: !0,
            offset: {
                x: 0,
                y: .5
            },
            bounds: {
                x: 1,
                y: 2
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "spawn"
        }], !0);
        static DOOR = new this(220, "Door (Packaged)", "Buildable. Can be restricted to specific ranks. Press R to rotate.", !1, 0, "item/door", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: .5,
                y: 0
            },
            bounds: {
                x: 2,
                y: .45
            },
            image: "door_full"
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: 0,
                y: .5
            },
            bounds: {
                x: .45,
                y: 2
            },
            image: "door_full"
        }], !0);
        static ITEM_HATCH = new this(221, "Cargo Hatch (Packaged)", "Buildable. Drops items picked up by the ship.", !1, 0, "item/item_hatch", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            allow_solids: !0
        }]);
        static ITEM_HATCH_STARTER = new this(222, "Cargo Hatch (Starter, Packaged)", "Buildable Starter Item. Drops items picked up by the ship.", !1, -1, "item/item_hatch_starter", void 0, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            allow_solids: !0
        }]);
        static ITEM_EJECTOR = new this(223, "Cargo Ejector (Packaged)", "Buildable. Ejects items from the ship.", !1, 0, "item/item_ejector", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }, {
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            build_angle: "Fixed",
            image: "arrow_shape",
            image_only: !0
        }]);
        static TURRET_CONTROLLER = new this(224, "Turret Controller (Packaged)", "Buildable. Controls adjacent turrets.", !1, 0, "item/turret_controller", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static TURRET_REMOTE = new this(226, "Cannon (Packaged)", "Buildable. A normal cannon that you can use to shoot at stuff.", !1, 1, "item/turret_rc", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static TURRET_REMOTE_STARTER = new this(227, "Starter Cannon (Packaged)", "Buildable Starter Item. Slowly re-generates ammo when empty.", !1, -1, "item/turret_rc_starter", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static TURRET_BURST = new this(228, "Burst Cannon (Packaged)", "Buildable. Fires a burst of shots when supplied with burst charges. May damage itself.", !1, 1, "item/turret_burst", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static TURRET_AUTO = new this(229, "Machine Cannon (Packaged)", "Buildable. A fully automatic gun that takes time to wind up. Requires cooling.", !1, 1, "item/turret_auto", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static THRUSTER = new this(230, "Thruster (Packaged)", "Buildable. Moves your ship. Fuelled with explosives.", !1, 0, "item/thruster", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static THRUSTER_STARTER = new this(231, "Thruster (Starter, Packaged)", "Buildable Starter Item. Moves your ship. Doesn't need fuel.", !1, -1, "item/thruster_starter", void 0, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_CORNER"
            }],
            allow_world: !0
        }]);
        static BLOCK = new this(232, "Iron Block", "Buildable. Used for interior walls/floors.", !0, 0, "item/block", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Starter", "Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 4,
            block_shaped: !0
        }]);
        static BLOCK_HYPER_RUBBER = new this(233, "Hyper Rubber Block", "Buildable. Bouncy.", !0, 2, "item/block_hrubber", {
            count: 1,
            time: 1,
            input: [{
                item: 4,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 13,
            block_shaped: !0
        }]);
        static BLOCK_ICE_GLASS = new this(234, "Hyper Ice Block", "Buildable. Low-friction ice that can't melt for some reason.", !0, 1, "item/block_sglass", void 0, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 14,
            block_shaped: !0
        }]);
        static BLOCK_LADDER = new this(235, "Ladder", "Buildable. You can climb them.", !0, 0, "item/ladder", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Starter", "Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 5
        }]);
        static BLOCK_WALKWAY = new this(236, "Walkway", "Buildable. Blocks players but not items.", !0, 0, "item/walkway", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 6,
            block_shaped: !0
        }]);
        static BLOCK_ITEM_NET = new this(237, "Item Net", "Buildable. Blocks items but not players.", !0, 0, "item/item_net", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 7,
            block_shaped: !0
        }]);
        static PAINT = new this(239, "Paint", "Used to paint your ship's background. Hold R to select color.", !0, 0, "item/color_panel", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block_is_colored: !0,
            allow_world: !0,
            allow_any: !0
        }], !0);
        static EXPANDO_BOX = new this(240, "Expando Box (Packaged)", "Buildable. Flexible bulk storage.", !1, 0, "item/exbox", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            bounds: {
                x: 2,
                y: 2
            },
            shape: {
                verts: [{
                    x: -.95,
                    y: -.75
                }, {
                    x: -.75,
                    y: -.95
                }, {
                    x: .75,
                    y: -.95
                }, {
                    x: .95,
                    y: -.75
                }, {
                    x: .95,
                    y: .75
                }, {
                    x: .75,
                    y: .95
                }, {
                    x: -.75,
                    y: .95
                }, {
                    x: -.95,
                    y: .75
                }]
            },
            allow_non_solids: !0,
            build_angle: "Any",
            image: "exbox_base",
            image_only: !0
        }]);
        static FREEPORT_ANCHOR = new this(241, "Safety Anchor", "Buildable. Prevents teleports out of safe zones while placed.", !1, 0, "item/anchor", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }],
            built_by: ["Engineering"]
        }, [{
            bounds: {
                x: 3,
                y: 3
            },
            snap_x: !0,
            snap_y: !0,
            image: "anchor"
        }]);
        static PUSHER = new this(242, "Pusher (Packaged)", "Buildable. Pushes things.", !1, 2, "item/pusher", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 5,
                count: 4
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            image: "loader_base",
            image_anim: "pusher",
            image_only: !0
        }]);
        static ITEM_LAUNCHER = new this(243, "Item Launcher (Packaged)", "Buildable. Launches items at a configurable speed and angle.", !1, 2, "item/item_launcher", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 4,
                count: 8
            }, {
                item: 5,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            image: "item_launcher",
            image_only: !0
        }], !0);
        static LOADER = new this(244, "DEPRECATED ITEM", "DEPRECATED ITEM", !1, 2, "item/loader_old");
        static RECYCLER = new this(245, "Recycler (Packaged)", "Buildable. Converts items back into resources.", !1, 0, "item/recycler", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }],
            built_by: ["Engineering"]
        }, [{
            snap_y: !0,
            offset: {
                x: 0,
                y: .25
            },
            bounds: {
                x: 2.25,
                y: 3.5
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "recycler",
            image_only: !0
        }]);
        static FABRICATOR_GOLD = new this(246, "Fabricator (Legacy, Packaged)", "Buildable. It doesn't do anything.", !1, 9, "item/fabricator_legacy", void 0, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Legacy");
        static FABRICATOR_STARTER = new this(247, "Fabricator (Starter, Packaged)", "Buildable Starter Item. Used to craft basic items.", !1, -1, "item/fabricator_starter", void 0, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Starter");
        static FABRICATOR_MUNITIONS = new this(248, "Fabricator (Munitions, Packaged)", "Buildable. Used to craft ammo and other consumables.", !1, 0, "item/fabricator_munitions", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }],
            built_by: ["Starter", "Engineering"]
        }, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Munitions");
        static FABRICATOR_ENGINEERING = new this(249, "Fabricator (Engineering, Packaged)", "Buildable. Used to craft tools, blocks, and security items.", !1, 0, "item/fabricator_engineering", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }],
            built_by: ["Starter", "Engineering"]
        }, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Engineering");
        static FABRICATOR_MACHINE_DEPRECATED = new this(250, "Fabricator (DEPRECATED, Packaged)", "DEPRECATED ITEM", !1, 0, "item/fabricator_machine", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }],
            built_by: []
        }, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Engineering");
        static FABRICATOR_EQUIPMENT = new this(251, "Fabricator (Equipment, Packaged)", "Buildable. Used to craft wearable equipment.", !1, 0, "item/fabricator_equipment", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 16
            }],
            built_by: ["Engineering"]
        }, [{
            snap_y: !0,
            bounds: {
                x: 2.5,
                y: 3
            },
            require_blocks: [{
                x: 0,
                y: -2,
                block: "_BUILD_SURFACE"
            }],
            allow_solids: !0,
            image: "fab_lod",
            image_only: !0
        }], void 0, "Equipment");
        static LOADER_NEW = new this(252, "Loader (Packaged)", "Buildable. Loads items into machines.", !1, 2, "item/loader", {
            count: 1,
            time: 10,
            input: [{
                item: 1,
                count: 8
            }, {
                item: 5,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            image: "loader_base",
            image_anim: "loader",
            image_only: !0
        }]);
        static LOCKDOWN_OVERRIDE_GREEN = new this(253, "Lockdown Override Unit", "Buildable. Allows a limited number of green rarity items to be removed from a ship while in lockdown mode.", !1, 2, "item/lockdown_override_green", {
            count: 1,
            time: 20,
            input: [{
                item: 5,
                count: 64
            }],
            built_by: ["Engineering"]
        }, [{
            bounds: {
                x: 1,
                y: 1
            },
            snap_x: !0,
            snap_y: !0,
            image: "lockdown_override_green",
            is_lockdown_override: !0
        }], !0);
        static BLOCK_ANNIHILATOR = new this(254, "Annihilator Tile", "[TEST EXCLUSIVE] Buildable. Destroys objects.", !0, 0, "item/annihilator_tile", void 0, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 15
        }]);
        static FLUID_TANK = new this(255, "Fluid Tank", "Buildable. Stores fluids.", !1, 0, "item/tank", {
            count: 1,
            time: 20,
            input: [{
                item: 1,
                count: 64
            }],
            built_by: ["Engineering"]
        }, [{
            bounds: {
                x: 2,
                y: 2
            },
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: .5,
                y: .5
            },
            offset2: {
                x: -.5,
                y: -.5
            },
            image: "tank"
        }]);
        static SHIELD_GENERATOR = new this(256, "Shield Generator", "Buildable. Generates shield fluid.", !1, 1, "item/shield_generator", void 0, [{
            bounds: {
                x: 4,
                y: 2
            },
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: .5,
                y: .5
            },
            offset2: {
                x: -.5,
                y: -.5
            },
            image: "shield_generator",
            build_angle: "Fixed",
            image_only: !0
        }]);
        static SHIELD_PROJECTOR = new this(257, "Shield Projector", "Buildable. Used to activate an adjacent bank of shield tanks.", !1, 1, "item/shield_projector", void 0, [{
            bounds: {
                x: 1,
                y: 1
            },
            snap_x: !0,
            snap_y: !0,
            image: "shield_projector_1"
        }]);
        static TURRET_CONTROLLER_NEW = new this(258, "Enhanced Turret Controller", "Buildable. Used to control turrets remotely.", !1, 2, "item/turret_controller_new", void 0, [{
            bounds: {
                x: 1,
                y: 1
            },
            snap_x: !0,
            snap_y: !0
        }]);
        static BULK_EJECTOR = new this(259, "Bulk Ejector (Packaged)", "Buildable. WIP / UNOBTAINABLE", !1, 2, "item/bulk_ejector", void 0, [{
            bounds: {
                x: 2,
                y: 2
            },
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: .5,
                y: .5
            },
            offset2: {
                x: -.5,
                y: -.5
            },
            build_angle: "Fixed"
        }]);
        static BULK_BAY_MARKER = new this(260, "Bulk Loading Bay Designator (Packaged)", "Buildable. WIP / UNOBTAINABLE", !1, 2, "item/bulk_bay_marker", void 0, [{
            bounds: {
                x: 1,
                y: 1
            },
            snap_x: !0,
            snap_y: !0
        }]);
        static NAV_UNIT = new this(261, "Navigation Unit (Starter, Packaged)", "Buildable Starter Item. Used to select a destination zone and initiate emergency warps. Also functions as a simple shield projector.", !1, -1, "item/nav_unit", void 0, [{
            bounds: {
                x: 1,
                y: 1
            },
            snap_x: !0,
            snap_y: !0
        }]);
        static BLOCK_LOGISTICS_RAIL = new this(262, "Logistics Rail", "Buildable. Used by munitions supply units to deliver munitions.", !0, 0, "item/logistics_rail", {
            count: 1,
            time: 1,
            input: [{
                item: 1,
                count: 2
            }],
            built_by: ["Engineering"]
        }, [{
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 1,
                y: 1
            },
            block: 16
        }]);
        static TURRET_ACUTE = new this(263, "Acute Cannon (Packaged)", "Buildable. A gun with a limited firing angle, and a slightly improved fire-rate.", !1, 1, "item/turret_acute", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static MUNITIONS_SUPPLY_UNIT = new this(264, "Munitions Supply Unit (Packaged)", "Buildable. Sends munitions to turrets via logistics rails.", !1, 1, "item/msu", void 0, [{
            bounds: {
                x: 2,
                y: 2
            },
            snap_x: !0,
            snap_y: !0,
            offset: {
                x: .5,
                y: .5
            },
            offset2: {
                x: -.5,
                y: -.5
            }
        }]);
        static TURRET_OBTUSE = new this(265, "Obtuse Cannon (Packaged)", "Buildable. A gun which preserves ammo, and has a slightly reduced fire-rate.", !1, 1, "item/turret_obtuse", void 0, [{
            buildDirection: "HORIZONTAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: 2.8,
                y: .8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_H"
            }, {
                x: 1,
                y: 0,
                block: "HULL_H"
            }, {
                x: -1,
                y: 0,
                block: "HULL_H"
            }],
            allow_world: !0
        }, {
            buildDirection: "VERTICAL",
            snap_x: !0,
            snap_y: !0,
            bounds: {
                x: .8,
                y: 2.8
            },
            require_blocks: [{
                x: 0,
                y: 0,
                block: "HULL_V"
            }, {
                x: 0,
                y: 1,
                block: "HULL_V"
            }, {
                x: 0,
                y: -1,
                block: "HULL_V"
            }],
            allow_world: !0
        }]);
        static ETERNAL_WRENCH_BRONZE = new this(300, "Eternal Bronze Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", !1, -1, "item/wrench_bronze_et");
        static ETERNAL_WRENCH_SILVER = new this(301, "Eternal Silver Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", !1, -1, "item/wrench_silver_et");
        static ETERNAL_WRENCH_GOLD = new this(302, "Eternal Gold Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", !1, -1, "item/wrench_gold_et");
        static ETERNAL_WRENCH_FLUX = new this(303, "Eternal Flux Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", !1, -1, "item/wrench_flux_et");
        static ETERNAL_WRENCH_PLATINUM = new this(304, "Eternal Platinum Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", !1, -1, "item/wrench_platinum_et");
        static TROPHY_NULL = new this(305, "Gold Null Trophy", "RIP 0x items.", !1, 9, "item/trophy_null");
        static TROPHY_BUG_HUNTER = new this(306, "Bug Hunter Trophy", "Rewarded for reporting a serious problem.", !1, -1, "item/trophy_bug");
        static TROPHY_NULL_SILVER = new this(307, "Silver Null Trophy", "RIP 0x items.", !1, 9, "item/trophy_null_silver");
        static PAT_WRENCH_BRONZE = new this(308, "Bronze Wrench", "Patron reward. Thank you for your support! \u{1F600}", !1, 0, "item/wrench_bronze", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static PAT_WRENCH_SILVER = new this(309, "Silver Wrench", "Patron reward. Thank you for your support! \u{1F600}", !1, 0, "item/wrench_silver", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static PAT_WRENCH_GOLD = new this(310, "Gold Wrench", "Patron reward. Thank you for your support! \u{1F600}", !1, 0, "item/wrench_gold", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static PAT_WRENCH_PLATINUM = new this(311, "Platinum Wrench", "Patron reward. Thank you for your support! \u{1F600}", !1, 0, "item/wrench_platinum", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static PAT_WRENCH_FLUX = new this(312, "Flux Wrench", "Patron reward. Thank you for your support! \u{1F600}", !1, 0, "item/wrench_flux", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Starter", "Engineering"]
        });
        static COS_LESSER_CAP = new this(313, "Lesser Cap", "Cosmetic Equipment (Head). Patron reward.", !1, 0, "item/cap", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_GOOFY_GLASSES = new this(314, "Goofy Glasses", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/glasses", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_SHADES = new this(315, "Shades", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/shades", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_TOP_HAT = new this(316, "Top Hat", "Cosmetic Equipment (Head). Patron reward.", !1, 0, "item/top_hat", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_HORNS = new this(317, "Demon Horns", "Cosmetic Equipment (Head). Patron reward.", !1, 0, "item/horns", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_MASK_ALIEN = new this(318, "Alien Mask", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/mask_alien", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_MASK_CLOWN = new this(319, "Clown Mask", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/mask_clown", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_MASK_GOBLIN = new this(320, "Goblin Mask", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/mask_goblin", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_PUMPKIN = new this(321, "Pumpkin", "Cosmetic Equipment (Face). Patron reward.", !1, 0, "item/mask_pumpkin", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static COS_WITCH_HAT = new this(322, "Witch Hat", "Cosmetic Equipment (Head). Patron reward.", !1, 0, "item/witch_hat", {
            count: 1,
            time: 5,
            input: [{
                item: 1,
                count: 4
            }],
            built_by: ["Equipment"]
        });
        static GREMLIN_RED = new this(323, "Wild Gremlin (Red)", "It looks upset.", !1, 2, "item/gremlin_red");
        static GREMLIN_ORANGE = new this(324, "Wild Gremlin (Orange)", "It looks upset.", !1, 2, "item/gremlin_orange");
        static GREMLIN_YELLOW = new this(325, "Wild Gremlin (Yellow)", "It looks upset.", !1, 2, "item/gremlin_yellow");
        static ELIMINATION_LOOT_BOX = new this(326, "Elimination Loot Box", "Recycle in a safe zone to unbox.", !0, 2, "item/loot_box");
        static ELIMINATION_LOOT_BOX_LOCKED = new this(327, "Elimination Loot Box (Locked)", "Recycle in a safe zone to unbox.", !0, 2, "item/loot_box_locked");
        static {
            this.end()
        }
    };
    var at = class i extends D {
        constructor(e, n) {
            super(e);
            this.vertices = n
        }
        get isBuildSurface() {
            return i.buildSurfaceShapes.has(this)
        }
        static BLOCK = new this(0, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static RAMP_UR = new this(1, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: -.5,
            y: .5
        }]);
        static RAMP_DR = new this(2, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static RAMP_DL = new this(3, [{
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static RAMP_UL = new this(4, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }]);
        static SLAB_U = new this(5, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: -.5,
            y: 0
        }]);
        static SLAB_R = new this(6, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static SLAB_D = new this(7, [{
            x: -.5,
            y: 0
        }, {
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static SLAB_L = new this(8, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_1_U = new this(9, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: -.5,
            y: 0
        }]);
        static HALF_RAMP_1_R = new this(10, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_1_D = new this(11, [{
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_1_L = new this(12, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }]);
        static HALF_RAMP_2_U = new this(13, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_2_R = new this(14, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_2_D = new this(15, [{
            x: -.5,
            y: 0
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_2_L = new this(16, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_1_UI = new this(17, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }]);
        static HALF_RAMP_1_RI = new this(18, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_1_DI = new this(19, [{
            x: -.5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_1_LI = new this(20, [{
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_2_UI = new this(21, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: 0
        }]);
        static HALF_RAMP_2_RI = new this(22, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_2_DI = new this(23, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_2_LI = new this(24, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_3_U = new this(25, [{
            x: -.5,
            y: 0
        }, {
            x: .5,
            y: 0
        }, {
            x: -.5,
            y: .5
        }]);
        static HALF_RAMP_3_R = new this(26, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_3_D = new this(27, [{
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: -.5,
            y: 0
        }]);
        static HALF_RAMP_3_L = new this(28, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_3_UI = new this(29, [{
            x: -.5,
            y: 0
        }, {
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }]);
        static HALF_RAMP_3_RI = new this(30, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: 0,
            y: .5
        }]);
        static HALF_RAMP_3_DI = new this(31, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: -.5,
            y: 0
        }]);
        static HALF_RAMP_3_LI = new this(32, [{
            x: 0,
            y: -.5
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static QUARTER_UR = new this(33, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: 0,
            y: 0
        }, {
            x: -.5,
            y: 0
        }]);
        static QUARTER_DR = new this(34, [{
            x: -.5,
            y: 0
        }, {
            x: 0,
            y: 0
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static QUARTER_DL = new this(35, [{
            x: 0,
            y: 0
        }, {
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static QUARTER_UL = new this(36, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: 0,
            y: 0
        }]);
        static QUARTER_RAMP_UR = new this(37, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: -.5,
            y: 0
        }]);
        static QUARTER_RAMP_DR = new this(38, [{
            x: -.5,
            y: 0
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static QUARTER_RAMP_DL = new this(39, [{
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }]);
        static QUARTER_RAMP_UL = new this(40, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }]);
        static BEVEL_UR = new this(41, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static BEVEL_DR = new this(42, [{
            x: -.5,
            y: -.5
        }, {
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: 0
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }]);
        static BEVEL_DL = new this(43, [{
            x: 0,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: -.5,
            y: .5
        }, {
            x: -.5,
            y: 0
        }]);
        static BEVEL_UL = new this(44, [{
            x: -.5,
            y: -.5
        }, {
            x: .5,
            y: -.5
        }, {
            x: .5,
            y: .5
        }, {
            x: 0,
            y: .5
        }, {
            x: -.5,
            y: 0
        }]);
        static {
            this.end()
        }
        static buildSurfaceShapes = new Set([this.BLOCK, this.RAMP_DR, this.RAMP_DL, this.SLAB_D, this.HALF_RAMP_1_D, this.HALF_RAMP_2_R, this.HALF_RAMP_2_D, this.HALF_RAMP_1_DI, this.HALF_RAMP_2_DI, this.HALF_RAMP_2_LI, this.BEVEL_DR, this.BEVEL_DL])
    };
    var Z = class extends et {
        x;
        y;
        item;
        bits;
        shape;
        constructor(t) {
            super();
            for (let e in this) Object.defineProperty(this, e, {
                configurable: !1
            });
            if (t != null) {
                if (Object.getPrototypeOf(t) != Object.prototype) throw new TypeError("input must be an object literal");
                this.set(t)
            }
        }
        set(t) {
            return Object.assign(this, t)
        }
        fillFromArray(t) {
            return this.x = t[1], this.y = t[2], this.item = W.getById(t[3]), this.bits = typeof t[4] < "u" ? new ct(t[4]) : void 0, this.shape = at.getByValue(t[5]), this
        }
        toArray() {
            let t = [];
            return t[0] = 0, this.x !== void 0 && (t[1] = this.x), this.y !== void 0 && (t[2] = this.y), this.item !== void 0 && (t[3] = this.item.id), this.bits !== void 0 && (t[4] = this.bits.int), this.shape !== void 0 && this.shape != at.BLOCK && (t[5] = this.shape.enumValue, typeof t[4] > "u" && (t[4] = 1n)), t
        }
        clone() {
            let t = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            return this.bits && (t.bits = this.bits.clone()), t
        }
    };
    var gt = "DSA:",
        it = class extends D {
            static PUSH = new this(0);
            static PULL = new this(1);
            static DO_NOTHING = new this(2);
            static {
                this.end()
            }
        },
        nt = class extends D {
            static TOP_LEFT = new this(0);
            static TOP = new this(1);
            static TOP_RIGHT = new this(2);
            static LEFT = new this(3);
            static RIGHT = new this(4);
            static BOTTOM_LEFT = new this(5);
            static BOTTOM = new this(6);
            static BOTTOM_RIGHT = new this(7);
            static {
                this.end()
            }
        },
        ht = class extends D {
            static LOW = new this(0);
            static NORMAL = new this(1);
            static HIGH = new this(2);
            static {
                this.end()
            }
        },
        ft = class extends D {
            static ALLOW_ALL = new this(0);
            static BLOCK_FILTER_ONLY = new this(1);
            static ALLOW_FILTER_ONLY = new this(2);
            static BLOCK_ALL = new this(3);
            static {
                this.end()
            }
        },
        mt = class extends D {
            static RIGHT = new this(0);
            static UP = new this(1);
            static LEFT = new this(2);
            static DOWN = new this(3);
            static {
                this.end()
            }
        };
    var rt = {
            filterMode: ft.ALLOW_ALL,
            filterItems: [W.NULL, W.NULL, W.NULL],
            angle: 0,
            fixedAngle: mt.RIGHT,
            pusher: {
                defaultMode: it.DO_NOTHING,
                filteredMode: it.PUSH,
                angle: 0,
                targetSpeed: 20,
                filterByInventory: !1,
                maxBeamLength: 1e3
            },
            loader: {
                pickupPoint: nt.LEFT,
                dropPoint: nt.RIGHT,
                priority: ht.NORMAL,
                stackLimit: 16,
                cycleTime: 20,
                requireOutputInventory: !1,
                waitForStackLimit: !1
            }
        },
        bt = {
            filter_config: "filterMode",
            filter_items: "filterItems",
            angle: "angle",
            angle_fixed: "fixedAngle",
            config_pusher: "pusher",
            config_loader: "loader"
        };
    for (let i in bt) bt[bt[i]] = i;
    var P = class extends et {
        static get defaults() {
            return rt
        }
        static set defaults(t) {
            if (t != null && Object.getPrototypeOf(t) != Object.prototype) throw new TypeError("defaults can only be set to an object literal");
            rt = t
        }
        rawData;
        filterMode;
        filterItems;
        angle;
        fixedAngle;
        pusher = {};
        loader = {};
        constructor(t) {
            super();
            for (let e in this) Object.defineProperty(this, e, {
                configurable: !1
            });
            if (t != null) {
                if (Object.getPrototypeOf(t) != Object.prototype) throw new TypeError("input must be an object literal");
                this.set(t)
            }
        }
        set(t) {
            return Object.assign(this, t)
        }
        fillFromArray(t) {
            if (t[1] == null) return this;
            if (t[1] instanceof Uint8Array) return this.rawData = t[1], this;
            t = t[1];
            for (let e = 0; e < t.length; e++)
                if (!(e <= 1) && typeof t[e] == "string" && t[e + 1] === 0) {
                    let n = t[e],
                        r = t[e + 2];
                    Array.isArray(r) && (r = Ee(n, r) ?? r), this[bt[n] ?? n] = r, e += 2
                } return this
        }
        fillDataFromArray(t) {
            let e = [];
            return e[0] = 1, e[1] = t, this.fillFromArray(e)
        }
        toArray() {
            let t = [];
            if (t[0] = 1, this.isRaw) return t[1] = this.rawData, t;
            t[1] = [0, 0];
            for (let e of Object.keys(this)) {
                let n = structuredClone(this[e]),
                    r = bt[e] ?? e;
                if (n !== void 0) {
                    if (r == "filter_config") n = [(n ?? rt.filterMode).enumValue];
                    else if (r == "filter_items")
                        if (n === null) n = rt.filterItems;
                        else
                            for (let s = 0; s < n.length; s++) n[s] = (n[s] ?? rt.filterItems[s]).enumValue;
                    else if (r == "angle_fixed") n = [(n ?? rt.fixedAngle).enumValue];
                    else if (n === null || Object.getPrototypeOf(n) == Object.prototype) {
                        if (n !== null && !Object.keys(n).length) continue;
                        n = ve(r, n)
                    } else Array.isArray(n) || (n = [n]);
                    t[1].push(r, 0, n)
                }
            }
            return t
        }
        get isRaw() {
            return this.rawData instanceof Uint8Array
        }
        equals(t) {
            return Qt(this, t)
        }
        clone() {
            let t = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            return t.pusher = {
                ...this.pusher
            }, t.loader = {
                ...this.loader
            }, this.rawData && (t.rawData = new Uint8Array(this.rawData)), t
        }
    };

    function Qt(i, t) {
        if (i === t) return !0;
        if (i?.constructor !== t?.constructor) return !1;
        let e = Object.keys(i);
        return i && t && typeof i == "object" && typeof t == "object" ? e.length === Object.keys(t).length && e.every(n => Qt(i[n], t[n])) : i === t
    }

    function Ee(i, t) {
        switch (i) {
            case "angle":
                return t[0];
            case "filter_config":
                return ft.getByValue(t[0]);
            case "filter_items":
                for (let e = 0; e < t.length; e++) t[e] = W.getById(t[e]);
                return t;
            case "config_loader":
                return {
                    pickupPoint: nt.getByValue(t[0]), dropPoint: nt.getByValue(t[1]), priority: ht.getByValue(t[2]), stackLimit: t[3], cycleTime: t[4], requireOutputInventory: t[5], waitForStackLimit: t[6]
                };
            case "config_pusher":
                return {
                    defaultMode: it.getByValue(t[0]), filteredMode: it.getByValue(t[1]), angle: t[2], targetSpeed: t[3], filterByInventory: t[4], maxBeamLength: t[5]
                };
            case "angle_fixed":
                return mt.getByValue(t[0])
        }
    }

    function ve(i, t) {
        let e = [];
        if (t !== null)
            for (let n in t) t[n] === null && delete t[n];
        switch (i) {
            case "config_loader":
                t = {
                    ...rt.loader,
                    ...t
                }, e[0] = t.pickupPoint?.enumValue, e[1] = t.dropPoint?.enumValue, e[2] = t.priority?.enumValue, e[3] = t.stackLimit, e[4] = t.cycleTime, e[5] = t.requireOutputInventory, e[6] = t.waitForStackLimit;
                break;
            case "config_pusher":
                t = {
                    ...rt.pusher,
                    ...t
                }, e[0] = t.defaultMode?.enumValue, e[1] = t.filteredMode?.enumValue, e[2] = t.angle, e[3] = t.targetSpeed, e[4] = t.filterByInventory, e[5] = t.maxBeamLength;
                break
        }
        return e
    }
    var G = class {
        version;
        width;
        height;
        commands;
        constructor(t) {
            for (let e in this) Object.defineProperty(this, e, {
                configurable: !1
            });
            if (t == null) this.version = 0, this.width = 1, this.height = 1, this.commands = [];
            else if (Object.getPrototypeOf(t) == Object.prototype)
                if (this.version = t.version ?? 0, this.width = t.width ?? 1, this.height = t.height ?? 1, t.commands == null) this.commands = [];
                else {
                    if (!Array.isArray(t.commands)) throw new TypeError("input.commands must be an array");
                    this.commands = t.commands
                }
            else throw new TypeError("input must be an object literal")
        }
        set(t) {
            return Object.assign(this, t)
        }
        fillFromArray(t, e) {
            return this.version = t[0], this.width = t[1], this.height = t[2], this.commands = e ? t[3] : t[3].map(n => {
                if (n[0] == 0) return new Z().fillFromArray(n);
                if (n[0] == 1) return new P().fillFromArray(n)
            }), this
        }
        toArray(t) {
            let e = [];
            return e[0] = this.version, e[1] = this.width, e[2] = this.height, e[3] = t ? this.commands : this.commands.map(n => n.toArray()), e
        }
        clone() {
            let t = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            return this.commands && (t.commands = this.commands.map(e => e.clone())), t
        }
    };
    var S = Uint8Array,
        V = Uint16Array,
        qt = Int32Array,
        Ot = new S([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]),
        St = new S([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]),
        Nt = new S([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
        ee = function(i, t) {
            for (var e = new V(31), n = 0; n < 31; ++n) e[n] = t += 1 << i[n - 1];
            for (var r = new qt(e[30]), n = 1; n < 30; ++n)
                for (var s = e[n]; s < e[n + 1]; ++s) r[s] = s - e[n] << 5 | n;
            return {
                b: e,
                r
            }
        },
        ie = ee(Ot, 2),
        ne = ie.b,
        Ft = ie.r;
    ne[28] = 258, Ft[258] = 28;
    var re = ee(St, 0),
        Le = re.b,
        $t = re.r,
        Vt = new V(32768);
    for (h = 0; h < 32768; ++h) Q = (h & 43690) >> 1 | (h & 21845) << 1, Q = (Q & 52428) >> 2 | (Q & 13107) << 2, Q = (Q & 61680) >> 4 | (Q & 3855) << 4, Vt[h] = ((Q & 65280) >> 8 | (Q & 255) << 8) >> 1;
    var Q, h, j = (function(i, t, e) {
            for (var n = i.length, r = 0, s = new V(t); r < n; ++r) i[r] && ++s[i[r] - 1];
            var u = new V(t);
            for (r = 1; r < t; ++r) u[r] = u[r - 1] + s[r - 1] << 1;
            var f;
            if (e) {
                f = new V(1 << t);
                var y = 15 - t;
                for (r = 0; r < n; ++r)
                    if (i[r])
                        for (var p = r << 4 | i[r], a = t - i[r], o = u[i[r] - 1]++ << a, c = o | (1 << a) - 1; o <= c; ++o) f[Vt[o] >> y] = p
            } else
                for (f = new V(n), r = 0; r < n; ++r) i[r] && (f[r] = Vt[u[i[r] - 1]++] >> 15 - i[r]);
            return f
        }),
        st = new S(288);
    for (h = 0; h < 144; ++h) st[h] = 8;
    var h;
    for (h = 144; h < 256; ++h) st[h] = 9;
    var h;
    for (h = 256; h < 280; ++h) st[h] = 7;
    var h;
    for (h = 280; h < 288; ++h) st[h] = 8;
    var h, Et = new S(32);
    for (h = 0; h < 32; ++h) Et[h] = 5;
    var h, Ae = j(st, 9, 0),
        Re = j(st, 9, 1),
        Te = j(Et, 5, 0),
        Oe = j(Et, 5, 1),
        Pt = function(i) {
            for (var t = i[0], e = 1; e < i.length; ++e) i[e] > t && (t = i[e]);
            return t
        },
        Y = function(i, t, e) {
            var n = t / 8 | 0;
            return (i[n] | i[n + 1] << 8) >> (t & 7) & e
        },
        Mt = function(i, t) {
            var e = t / 8 | 0;
            return (i[e] | i[e + 1] << 8 | i[e + 2] << 16) >> (t & 7)
        },
        Wt = function(i) {
            return (i + 7) / 8 | 0
        },
        se = function(i, t, e) {
            return (t == null || t < 0) && (t = 0), (e == null || e > i.length) && (e = i.length), new S(i.subarray(t, e))
        };
    var Se = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"],
        J = function(i, t, e) {
            var n = new Error(t || Se[i]);
            if (n.code = i, Error.captureStackTrace && Error.captureStackTrace(n, J), !e) throw n;
            return n
        },
        Ue = function(i, t, e, n) {
            var r = i.length,
                s = n ? n.length : 0;
            if (!r || t.f && !t.l) return e || new S(0);
            var u = !e,
                f = u || t.i != 2,
                y = t.i;
            u && (e = new S(r * 3));
            var p = function(_t) {
                    var dt = e.length;
                    if (_t > dt) {
                        var lt = new S(Math.max(dt * 2, _t));
                        lt.set(e), e = lt
                    }
                },
                a = t.f || 0,
                o = t.p || 0,
                c = t.b || 0,
                _ = t.l,
                R = t.d,
                d = t.m,
                C = t.n,
                q = r * 8;
            do {
                if (!_) {
                    a = Y(i, o, 1);
                    var M = Y(i, o + 1, 3);
                    if (o += 3, M)
                        if (M == 1) _ = Re, R = Oe, d = 9, C = 5;
                        else if (M == 2) {
                        var I = Y(i, o, 31) + 257,
                            E = Y(i, o + 10, 15) + 4,
                            m = I + Y(i, o + 5, 31) + 1;
                        o += 14;
                        for (var l = new S(m), v = new S(19), w = 0; w < E; ++w) v[Nt[w]] = Y(i, o + w * 3, 7);
                        o += E * 3;
                        for (var O = Pt(v), tt = (1 << O) - 1, H = j(v, O, 1), w = 0; w < m;) {
                            var k = H[Y(i, o, tt)];
                            o += k & 15;
                            var x = k >> 4;
                            if (x < 16) l[w++] = x;
                            else {
                                var L = 0,
                                    g = 0;
                                for (x == 16 ? (g = 3 + Y(i, o, 3), o += 2, L = l[w - 1]) : x == 17 ? (g = 3 + Y(i, o, 7), o += 3) : x == 18 && (g = 11 + Y(i, o, 127), o += 7); g--;) l[w++] = L
                            }
                        }
                        var B = l.subarray(0, I),
                            A = l.subarray(I);
                        d = Pt(B), C = Pt(A), _ = j(B, d, 1), R = j(A, C, 1)
                    } else J(1);
                    else {
                        var x = Wt(o) + 4,
                            U = i[x - 4] | i[x - 3] << 8,
                            T = x + U;
                        if (T > r) {
                            y && J(0);
                            break
                        }
                        f && p(c + U), e.set(i.subarray(x, T), c), t.b = c += U, t.p = o = T * 8, t.f = a;
                        continue
                    }
                    if (o > q) {
                        y && J(0);
                        break
                    }
                }
                f && p(c + 131072);
                for (var pt = (1 << d) - 1, z = (1 << C) - 1, X = o;; X = o) {
                    var L = _[Mt(i, o) & pt],
                        N = L >> 4;
                    if (o += L & 15, o > q) {
                        y && J(0);
                        break
                    }
                    if (L || J(2), N < 256) e[c++] = N;
                    else if (N == 256) {
                        X = o, _ = null;
                        break
                    } else {
                        var F = N - 254;
                        if (N > 264) {
                            var w = N - 257,
                                b = Ot[w];
                            F = Y(i, o, (1 << b) - 1) + ne[w], o += b
                        }
                        var K = R[Mt(i, o) & z],
                            ot = K >> 4;
                        K || J(3), o += K & 15;
                        var A = Le[ot];
                        if (ot > 3) {
                            var b = St[ot];
                            A += Mt(i, o) & (1 << b) - 1, o += b
                        }
                        if (o > q) {
                            y && J(0);
                            break
                        }
                        f && p(c + 131072);
                        var ut = c + F;
                        if (c < A) {
                            var At = s - A,
                                Rt = Math.min(A, ut);
                            for (At + c < 0 && J(3); c < Rt; ++c) e[c] = n[At + c]
                        }
                        for (; c < ut; ++c) e[c] = e[c - A]
                    }
                }
                t.l = _, t.p = X, t.b = c, t.f = a, _ && (a = 1, t.m = d, t.d = R, t.n = C)
            } while (!a);
            return c != e.length && u ? se(e, 0, c) : e.subarray(0, c)
        },
        $ = function(i, t, e) {
            e <<= t & 7;
            var n = t / 8 | 0;
            i[n] |= e, i[n + 1] |= e >> 8
        },
        wt = function(i, t, e) {
            e <<= t & 7;
            var n = t / 8 | 0;
            i[n] |= e, i[n + 1] |= e >> 8, i[n + 2] |= e >> 16
        },
        Ht = function(i, t) {
            for (var e = [], n = 0; n < i.length; ++n) i[n] && e.push({
                s: n,
                f: i[n]
            });
            var r = e.length,
                s = e.slice();
            if (!r) return {
                t: oe,
                l: 0
            };
            if (r == 1) {
                var u = new S(e[0].s + 1);
                return u[e[0].s] = 1, {
                    t: u,
                    l: 1
                }
            }
            e.sort(function(T, I) {
                return T.f - I.f
            }), e.push({
                s: -1,
                f: 25001
            });
            var f = e[0],
                y = e[1],
                p = 0,
                a = 1,
                o = 2;
            for (e[0] = {
                    s: -1,
                    f: f.f + y.f,
                    l: f,
                    r: y
                }; a != r - 1;) f = e[e[p].f < e[o].f ? p++ : o++], y = e[p != a && e[p].f < e[o].f ? p++ : o++], e[a++] = {
                s: -1,
                f: f.f + y.f,
                l: f,
                r: y
            };
            for (var c = s[0].s, n = 1; n < r; ++n) s[n].s > c && (c = s[n].s);
            var _ = new V(c + 1),
                R = zt(e[a - 1], _, 0);
            if (R > t) {
                var n = 0,
                    d = 0,
                    C = R - t,
                    q = 1 << C;
                for (s.sort(function(I, E) {
                        return _[E.s] - _[I.s] || I.f - E.f
                    }); n < r; ++n) {
                    var M = s[n].s;
                    if (_[M] > t) d += q - (1 << R - _[M]), _[M] = t;
                    else break
                }
                for (d >>= C; d > 0;) {
                    var x = s[n].s;
                    _[x] < t ? d -= 1 << t - _[x]++ - 1 : ++n
                }
                for (; n >= 0 && d; --n) {
                    var U = s[n].s;
                    _[U] == t && (--_[U], ++d)
                }
                R = t
            }
            return {
                t: new S(_),
                l: R
            }
        },
        zt = function(i, t, e) {
            return i.s == -1 ? Math.max(zt(i.l, t, e + 1), zt(i.r, t, e + 1)) : t[i.s] = e
        },
        Jt = function(i) {
            for (var t = i.length; t && !i[--t];);
            for (var e = new V(++t), n = 0, r = i[0], s = 1, u = function(y) {
                    e[n++] = y
                }, f = 1; f <= t; ++f)
                if (i[f] == r && f != t) ++s;
                else {
                    if (!r && s > 2) {
                        for (; s > 138; s -= 138) u(32754);
                        s > 2 && (u(s > 10 ? s - 11 << 5 | 28690 : s - 3 << 5 | 12305), s = 0)
                    } else if (s > 3) {
                        for (u(r), --s; s > 6; s -= 6) u(8304);
                        s > 2 && (u(s - 3 << 5 | 8208), s = 0)
                    }
                    for (; s--;) u(r);
                    s = 1, r = i[f]
                } return {
                c: e.subarray(0, n),
                n: t
            }
        },
        xt = function(i, t) {
            for (var e = 0, n = 0; n < t.length; ++n) e += i[n] * t[n];
            return e
        },
        ae = function(i, t, e) {
            var n = e.length,
                r = Wt(t + 2);
            i[r] = n & 255, i[r + 1] = n >> 8, i[r + 2] = i[r] ^ 255, i[r + 3] = i[r + 1] ^ 255;
            for (var s = 0; s < n; ++s) i[r + s + 4] = e[s];
            return (r + 4 + n) * 8
        },
        te = function(i, t, e, n, r, s, u, f, y, p, a) {
            $(t, a++, e), ++r[256];
            for (var o = Ht(r, 15), c = o.t, _ = o.l, R = Ht(s, 15), d = R.t, C = R.l, q = Jt(c), M = q.c, x = q.n, U = Jt(d), T = U.c, I = U.n, E = new V(19), m = 0; m < M.length; ++m) ++E[M[m] & 31];
            for (var m = 0; m < T.length; ++m) ++E[T[m] & 31];
            for (var l = Ht(E, 7), v = l.t, w = l.l, O = 19; O > 4 && !v[Nt[O - 1]]; --O);
            var tt = p + 5 << 3,
                H = xt(r, st) + xt(s, Et) + u,
                k = xt(r, c) + xt(s, d) + u + 14 + 3 * O + xt(E, v) + 2 * E[16] + 3 * E[17] + 7 * E[18];
            if (y >= 0 && tt <= H && tt <= k) return ae(t, a, i.subarray(y, y + p));
            var L, g, B, A;
            if ($(t, a, 1 + (k < H)), a += 2, k < H) {
                L = j(c, _, 0), g = c, B = j(d, C, 0), A = d;
                var pt = j(v, w, 0);
                $(t, a, x - 257), $(t, a + 5, I - 1), $(t, a + 10, O - 4), a += 14;
                for (var m = 0; m < O; ++m) $(t, a + 3 * m, v[Nt[m]]);
                a += 3 * O;
                for (var z = [M, T], X = 0; X < 2; ++X)
                    for (var N = z[X], m = 0; m < N.length; ++m) {
                        var F = N[m] & 31;
                        $(t, a, pt[F]), a += v[F], F > 15 && ($(t, a, N[m] >> 5 & 127), a += N[m] >> 12)
                    }
            } else L = Ae, g = st, B = Te, A = Et;
            for (var m = 0; m < f; ++m) {
                var b = n[m];
                if (b > 255) {
                    var F = b >> 18 & 31;
                    wt(t, a, L[F + 257]), a += g[F + 257], F > 7 && ($(t, a, b >> 23 & 31), a += Ot[F]);
                    var K = b & 31;
                    wt(t, a, B[K]), a += A[K], K > 3 && (wt(t, a, b >> 5 & 8191), a += St[K])
                } else wt(t, a, L[b]), a += g[b]
            }
            return wt(t, a, L[256]), a + g[256]
        },
        Ie = new qt([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]),
        oe = new S(0),
        Ce = function(i, t, e, n, r, s) {
            var u = s.z || i.length,
                f = new S(n + u + 5 * (1 + Math.ceil(u / 7e3)) + r),
                y = f.subarray(n, f.length - r),
                p = s.l,
                a = (s.r || 0) & 7;
            if (t) {
                a && (y[0] = s.r >> 3);
                for (var o = Ie[t - 1], c = o >> 13, _ = o & 8191, R = (1 << e) - 1, d = s.p || new V(32768), C = s.h || new V(R + 1), q = Math.ceil(e / 3), M = 2 * q, x = function(It) {
                        return (i[It] ^ i[It + 1] << q ^ i[It + 2] << M) & R
                    }, U = new qt(25e3), T = new V(288), I = new V(32), E = 0, m = 0, l = s.i || 0, v = 0, w = s.w || 0, O = 0; l + 2 < u; ++l) {
                    var tt = x(l),
                        H = l & 32767,
                        k = C[tt];
                    if (d[H] = k, C[tt] = H, w <= l) {
                        var L = u - l;
                        if ((E > 7e3 || v > 24576) && (L > 423 || !p)) {
                            a = te(i, y, 0, U, T, I, m, v, O, l - O, a), v = E = m = 0, O = l;
                            for (var g = 0; g < 286; ++g) T[g] = 0;
                            for (var g = 0; g < 30; ++g) I[g] = 0
                        }
                        var B = 2,
                            A = 0,
                            pt = _,
                            z = H - k & 32767;
                        if (L > 2 && tt == x(l - z))
                            for (var X = Math.min(c, L) - 1, N = Math.min(32767, l), F = Math.min(258, L); z <= N && --pt && H != k;) {
                                if (i[l + B] == i[l + B - z]) {
                                    for (var b = 0; b < F && i[l + b] == i[l + b - z]; ++b);
                                    if (b > B) {
                                        if (B = b, A = z, b > X) break;
                                        for (var K = Math.min(z, b - 2), ot = 0, g = 0; g < K; ++g) {
                                            var ut = l - z + g & 32767,
                                                At = d[ut],
                                                Rt = ut - At & 32767;
                                            Rt > ot && (ot = Rt, k = ut)
                                        }
                                    }
                                }
                                H = k, k = d[H], z += H - k & 32767
                            }
                        if (A) {
                            U[v++] = 268435456 | Ft[B] << 18 | $t[A];
                            var _t = Ft[B] & 31,
                                dt = $t[A] & 31;
                            m += Ot[_t] + St[dt], ++T[257 + _t], ++I[dt], w = l + B, ++E
                        } else U[v++] = i[l], ++T[i[l]]
                    }
                }
                for (l = Math.max(l, w); l < u; ++l) U[v++] = i[l], ++T[i[l]];
                a = te(i, y, p, U, T, I, m, v, O, l - O, a), p || (s.r = a & 7 | y[a / 8 | 0] << 3, a -= 7, s.h = C, s.p = d, s.i = l, s.w = w)
            } else {
                for (var l = s.w || 0; l < u + p; l += 65535) {
                    var lt = l + 65535;
                    lt >= u && (y[a / 8 | 0] = p, lt = u), a = ae(y, a + 1, i.subarray(l, lt))
                }
                s.i = u
            }
            return se(f, 0, n + Wt(a) + r)
        };
    var ke = function(i, t, e, n, r) {
        if (!r && (r = {
                l: 1
            }, t.dictionary)) {
            var s = t.dictionary.subarray(-32768),
                u = new S(s.length + i.length);
            u.set(s), u.set(i, s.length), i = u, r.w = s.length
        }
        return Ce(i, t.level == null ? 6 : t.level, t.mem == null ? r.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(i.length))) * 1.5) : 20 : 12 + t.mem, e, n, r)
    };

    function Gt(i, t) {
        return ke(i, t || {}, 0, 0)
    }

    function Yt(i, t) {
        return Ue(i, {
            i: 2
        }, t && t.out, t && t.dictionary)
    }
    var Be = typeof TextDecoder < "u" && new TextDecoder,
        De = 0;
    try {
        Be.decode(oe, {
            stream: !0
        }), De = 1
    } catch {}
    var Pe = globalThis.document?.currentScript?.src ?? (globalThis.window && (window.chrome ?? window.browser)?.runtime ? ((i = /.*dsabp.*\/.*?(index|dsabp)\.min\.js$|dsabp\.min\.js$/, t = window.chrome ?? window.browser) => {
            let e = n => new RegExp("^" + n.replaceAll("/", "\\/").replaceAll(".", "\\.").replaceAll("*:\\/\\/", "https?:\\/\\/").replaceAll("*\\.", ".*\\.").replaceAll("\\.*", "\\..*").replaceAll("\\/*", "\\/.*").replace(/(?<![\/.])\*(?!\.)/g, ".*") + "$");
            for (let n of t.runtime.getManifest().content_scripts)
                for (let r of n.matches)
                    if (e(r).test(location.href)) {
                        for (let s of n.js)
                            if (i.test(s)) return t.runtime.getURL(s)
                    }
        })() : null),
        ue = i => Uint8Array.from(atob(i), t => t.charCodeAt(0)),
        le = i => btoa(String.fromCharCode.apply(null, i));

    function ce() {
        let i = async e => {
            let n;
            self.addEventListener("message", async r => {
                let s = r.data;
                for (; !n;) await new Promise(u => setTimeout(u, 0));
                if (s.cmd == "decode") {
                    try {
                        s.result = new n.Decoder().decodeSync(s.args.input, s.args.options).toArray()
                    } catch (u) {
                        s.err = u.message
                    }
                    delete s.args, self.postMessage(s)
                } else if (s.cmd == "decodeConfigCmd") {
                    try {
                        s.result = new n.Decoder().decodeConfigCmdData(s.args.rawData)
                    } catch (u) {
                        s.err = u.message
                    }
                    delete s.args, self.postMessage(s)
                } else if (s.cmd == "encode") {
                    try {
                        let u = new n.Blueprint().fillFromArray(s.args.input);
                        s.result = new n.Encoder().encodeSync(u)
                    } catch (u) {
                        s.err = u.message
                    }
                    delete s.args, self.postMessage(s)
                }
            }), e.bundleInfo.format == "iife" ? (importScripts(e.path), n = globalThis[e.bundleInfo.globalName]) : n = await import(e.path)
        }, t = {
            path: Pe,
            bundleInfo: {
                format: "iife",
                globalName: "dsabp"
            }
        };
        return new Worker(URL.createObjectURL(new Blob([`(${i.toString()})(${JSON.stringify(t)})`], {
            type: "text/javascript;charset=utf-8"
        })))
    }
    var He = {
            0: 2,
            2: 3,
            3: 4,
            4: 5
        },
        yt = class {
            static fflate_inflateSync = Yt;
            #o;
            #n;
            #e;
            #t;
            #s;
            options;
            constructor() {
                this.#o = new TextDecoder("utf-8")
            }
            #h(t, e) {
                this.#n = new Uint8Array(t), this.#e = new DataView(t.buffer), this.#t = 0, this.#s = e ?? 0
            }
            decodeSync(t, e = {}) {
                if (typeof t != "string") throw new TypeError("input must be a string");
                t.substring(0, gt.length).toUpperCase() == gt && (t = t.substring(gt.length)), typeof e.ignoreConfigCmdData > "u" && (e.ignoreConfigCmdData = !1), this.options = e;
                let n;
                if (typeof zlib_inflateRawSync < "u") {
                    let r = Buffer.from(t, "base64");
                    n = zlib_inflateRawSync(r)
                } else {
                    let r = ue(t);
                    n = Yt(r)
                }
                return this.#h(n, 0), new G().fillFromArray(this.#a(), !0)
            }
            decodeConfigCmdSync(t) {
                if (!(t instanceof P)) throw new TypeError(`input must be a ${P.name}`);
                if (!t.isRaw) return t;
                let e = this.decodeConfigCmdData(t.rawData);
                return t.rawData = void 0, t.fillDataFromArray(e)
            }
            decodeConfigCmdData(t) {
                return this.#h(t, 4), this.#a()
            }
            #a() {
                for (; this.#t < this.#n.length;) {
                    let t = this.#n[this.#t++];
                    if (t <= 63) return t;
                    if (t <= 127) return t - 128;
                    switch (t) {
                        case 144:
                            return this.#_();
                        case 128:
                            return this.#d();
                        case 129:
                            return this.#u();
                        case 130:
                            return this.#g();
                        case 131:
                            return this.#i();
                        case 132:
                            return this.#l();
                        case 133:
                            return this.#c();
                        case 134:
                            return this.#b();
                        case 135:
                            return this.#f();
                        case 136:
                            return this.#w();
                        case 137:
                            return this.#x();
                        case 143:
                            return null;
                        case 141:
                            return !0;
                        case 142:
                            return !1;
                        case 148:
                            return this.#E(this.#m(), 1);
                        case 149:
                            return this.#E(this.#y(), 2);
                        case 150:
                            return this.#E(this.#p(), 4);
                        case 138:
                            return this.#r(this.#m(), 1);
                        case 139:
                            return this.#r(this.#y(), 2);
                        case 140:
                            return this.#r(this.#p(), 4)
                    }
                    throw new Error(`unsupported byte: ${t} (0x${t.toString(16)})`)
                }
            }
            #_() {
                let t = [],
                    e = this.#s;
                this.#s = He[e] ?? 1;
                let n = this.#s;
                for (; this.#t < this.#n.length;) {
                    if (this.#n[this.#t] == 145) {
                        if (this.#t++, this.#s = e, n == 4) {
                            if (t[0] === 0) return new Z().fillFromArray(t);
                            if (t[0] === 1) return new P().fillFromArray(t)
                        }
                        return t
                    }
                    t.push(this.#a())
                }
            }
            #d() {
                let t = this.#e.getUint8(this.#t);
                return this.#t++, t
            }
            #u() {
                let t = this.#e.getUint16(this.#t, !0);
                return this.#t += 2, t
            }
            #g() {
                let t = this.#e.getUint32(this.#t, !0);
                return this.#t += 4, t
            }
            #i() {
                let t = this.#e.getBigUint64(this.#t, !0);
                return this.#t += 8, t
            }
            #l() {
                let t = this.#e.getInt8(this.#t);
                return this.#t++, t
            }
            #c() {
                let t = this.#e.getInt16(this.#t, !0);
                return this.#t += 2, t
            }
            #b() {
                let t = this.#e.getInt32(this.#t, !0);
                return this.#t += 4, t
            }
            #f() {
                let t = this.#e.getBigInt64(this.#t, !0);
                return this.#t += 8, t
            }
            #w() {
                let t = this.#e.getFloat32(this.#t, !0);
                return this.#t += 4, t
            }
            #x() {
                let t = this.#e.getFloat64(this.#t, !0);
                return this.#t += 8, t
            }
            #m() {
                return this.#e.getUint8(this.#t)
            }
            #y() {
                return this.#e.getUint16(this.#t, !0)
            }
            #p() {
                return this.#e.getUint32(this.#t, !0)
            }
            #r(t, e) {
                let n = this.#t + e,
                    r = this.#o.decode(this.#n.slice(n, n + t));
                return this.#t += e + t, r
            }
            #E(t, e) {
                let n = this.options.ignoreConfigCmdData !== !0 && this.#s == 4,
                    r = this.#t + e,
                    s = this.#n.slice(r, r + t);
                return this.#t = r, n ? this.#a() : (this.#t += t, s)
            }
        };
    var vt = class i {
        static fflate_deflateSync = Gt;
        #o;
        #n;
        #e;
        #t;
        constructor() {
            this.#o = new TextEncoder
        }
        #s(t) {
            this.#e = new DataView(new ArrayBuffer(t)), this.#n = new Uint8Array(this.#e.buffer), this.#t = 0
        }
        encodeSync(t) {
            if (!(t instanceof G)) throw new TypeError(`input must be an instance of ${G.name}`);
            let e = t.commands.length ? Math.max(t.commands.length * 20, 512) : 4096;
            this.#s(e), this.#a(t.toArray(!0));
            let n = this.#n.slice(0, this.#t);
            if (typeof zlib_deflateRawSync < "u") return zlib_deflateRawSync(n, {
                level: 9
            }).toString("base64");
            {
                let r = Gt(n, {
                    level: 9
                });
                return le(r)
            }
        }
        #h(t) {
            return this.#s(128), this.#a(t), this.#n.slice(0, this.#t)
        }
        #a(t) {
            if (typeof t == "number" || typeof t == "bigint") this.#_(t);
            else if (typeof t == "boolean") this.#i(t ? 141 : 142);
            else if (typeof t == "string") this.#d(t);
            else if (t == null) this.#i(143);
            else if (Array.isArray(t)) this.#u(t);
            else if (t instanceof Uint8Array) this.#g(t);
            else if (t instanceof Z) this.#u(t.toArray());
            else if (t instanceof P) {
                let e = t.toArray();
                Array.isArray(e[1]) && (e[1] = new Uint8Array(new i().#h(e[1]))), this.#u(e)
            } else throw new Error(`unsupported object: ${t.constructor?.name} ${t}`)
        }
        #_(t, e) {
            let n = typeof t == "bigint";
            if (n && t <= 4294967295 && (t = Number(t), n = !1), !Number.isSafeInteger(t) && !n) {
                this.#i(136), this.#y(t);
                return
            }
            if (t >= -64 && t <= -1) return this.#f(64 | t & 127);
            if (t >= 0 && t <= 63) return this.#f(t);
            t < 0 || e ? -128 <= t && t <= 127 ? (this.#i(132), this.#i(t)) : -32768 <= t && t <= 32767 ? (this.#i(133), this.#w(t)) : -2147483648 <= t && t <= 2147483647 ? (this.#i(134), this.#x(t)) : (this.#i(135), this.#m(BigInt(t))) : t <= 255 ? (this.#i(128), this.#i(t)) : t <= 65535 ? (this.#i(129), this.#l(t)) : t <= 4294967295 ? (this.#i(130), this.#c(t)) : (this.#i(131), this.#b(BigInt(t)))
        }
        #d(t) {
            let e = this.#o.encode(t),
                n = e.byteLength;
            n <= 255 ? (this.#i(138), this.#i(n)) : n <= 65535 ? (this.#i(139), this.#l(n)) : n <= 4294967295 && (this.#i(140), this.#c(n)), this.#r(n), this.#n.set(e, this.#t), this.#t += n
        }
        #u(t) {
            this.#i(144);
            for (let e of t) this.#a(e);
            this.#i(145)
        }
        #g(t) {
            let e = t.byteLength;
            e <= 255 ? (this.#i(148), this.#i(e)) : e <= 65535 ? (this.#i(149), this.#l(e)) : e <= 4294967295 && (this.#i(150), this.#c(e)), this.#p(t)
        }
        #i(t) {
            this.#r(1), this.#e.setUint8(this.#t, t), this.#t++
        }
        #l(t) {
            this.#r(2), this.#e.setUint16(this.#t, t, !0), this.#t += 2
        }
        #c(t) {
            this.#r(4), this.#e.setUint32(this.#t, t, !0), this.#t += 4
        }
        #b(t) {
            this.#r(8), this.#e.setBigUint64(this.#t, t, !0), this.#t += 8
        }
        #f(t) {
            this.#r(1), this.#e.setInt8(this.#t, t), this.#t++
        }
        #w(t) {
            this.#r(2), this.#e.setInt16(this.#t, t, !0), this.#t += 2
        }
        #x(t) {
            this.#r(4), this.#e.setInt32(this.#t, t, !0), this.#t += 4
        }
        #m(t) {
            this.#r(8), this.#e.setBigInt64(this.#t, t, !0), this.#t += 8
        }
        #y(t) {
            this.#r(4), this.#e.setFloat32(this.#t, t, !0), this.#t += 4
        }
        #p(t) {
            this.#r(t.length), this.#n.set(t, this.#t), this.#t += t.length
        }
        #r(t) {
            let e = this.#t + t;
            if (e <= this.#e.byteLength) return;
            let n = new ArrayBuffer(Math.max(e, this.#e.byteLength + 128)),
                r = new Uint8Array(n),
                s = new DataView(n);
            r.set(this.#n), this.#e = s, this.#n = r
        }
    };
    var Kt = globalThis.process?.release?.name == "node",
        fe = Kt ? !isMainThread : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope,
        Zt = 0,
        Ut = {},
        Lt = fe ? null : (Kt ? node_createWorker : ce)();

    function he(i) {
        i.err ? Ut[i.id].rej(i.err) : Ut[i.id].res(i.result), delete Ut[i.id]
    }
    fe || (Kt ? Lt.on("message", he) : Lt.addEventListener("message", i => he(i.data)));

    function jt(i) {
        return new Promise((t, e) => Ut[i] = {
            res: t,
            rej: e
        })
    }
    async function me(i, t) {
        let e = Zt++;
        return Lt.postMessage({
            id: e,
            cmd: "decode",
            args: {
                input: i,
                options: t
            }
        }), new G().fillFromArray(await jt(e))
    }

    function ye(i) {
        let t = Zt++;
        return Lt.postMessage({
            id: t,
            cmd: "decodeConfigCmd",
            args: {
                rawData: i
            }
        }), jt(t)
    }

    function pe(i) {
        let t = Zt++;
        return Lt.postMessage({
            id: t,
            cmd: "encode",
            args: {
                input: i.toArray()
            }
        }), jt(t)
    }

    function Fe(i, t) {
        return new yt().decodeSync(i, t)
    }
    async function Ve(i, t) {
        return me(i, t)
    }

    function ze(i) {
        return new yt().decodeConfigCmdSync(i)
    }
    async function qe(i) {
        if (!(i instanceof P)) throw new TypeError(`input must be a ${P.name}`);
        if (!i.isRaw) return i;
        let t = await ye(i.rawData);
        return i.rawData = void 0, i.fillDataFromArray(t)
    }

    function We(i) {
        return new vt().encodeSync(i)
    }

    function Ge(i) {
        return pe(i)
    }
    return xe(Ye);
})();
