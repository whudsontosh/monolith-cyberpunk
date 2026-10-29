/* ============================== ITEM INFO (1.4.1) ==============================
   Hover (or tap, or keyboard-focus) any item in the shop — or on the sheet — to see exactly
   what it does in play, worked out for the runner you're looking at.
   Rules text is a plain-language summary of Cyberpunk 2020; the GM has the final say. */
const II_TYPE={P:"Pistol",SMG:"Submachinegun",RIF:"Assault rifle",SHT:"Shotgun",HVY:"Heavy weapon",MEL:"Melee weapon"};
const II_CONC={P:"Pocket: fits in a pocket, pants leg or sleeve",J:"Jacket: hides under a jacket or coat",L:"Long coat: needs a long coat to hide",N:"Can't be hidden"};
const II_AVAIL={E:"Excellent: sold almost anywhere",C:"Common: most gun or sports shops",P:"Poor: specialty shops or the black market",R:"Rare: black market, stolen or military"};
const II_REL={VR:["Very reliable","jams only on 1D10 roll of 3 or less"],ST:["Standard","jams on 1D10 roll of 5 or less"],UR:["Unreliable","jams on 1D10 roll of 8 or less"]};
const II_ARMOR_REF=[[4,"a heavy leather jacket"],[10,"a Kevlar vest"],[14,"a light armor jacket"],[18,"a medium armor jacket"],[20,"a flak vest or heavy jacket"],[25,"a door gunner's vest"]];

const WEAPON_NOTES={
 "BudgetArms C-13":"A cheap little pocket pistol. Easy to hide, but it barely scratches armored targets.",
 "Dai Lung Cybermag 15":"Bargain-bin Hong Kong pistol. Cheap and concealable, but it jams a lot.",
 "Federated Arms X-22":"A dependable light pistol for people who'd rather not be noticed carrying.",
 "Militech Arms Avenger":"Solid medium pistol that almost never jams. A favourite backup gun.",
 "Dai Lung Streetmaster":"Hits like a medium pistol should, for street prices. Unreliable.",
 "Federated Arms X-9mm":"The standard police sidearm: medium power, average reliability.",
 "BudgetArms Auto 3":"Heavy-pistol stopping power on the cheap, at the cost of reliability.",
 "Sternmeyer Type 35":"A quality heavy pistol that keeps working when it matters.",
 "Armalite 44":"Very heavy pistol. Hand-cannon damage in something you can still hide in a jacket.",
 "Colt AMT Model 2000":"Top-end very heavy pistol, with +1 to hit and very reliable.",
 "Uzi Miniauto 9":"Light SMG with a huge rate of fire. Sprays bullets, and accurate for its class.",
 "H&K MP-2013":"Light SMG, a little harder-hitting. Good for close-quarters work.",
 "Fed. Arms Tech Assault II":"Big 50-round drum of light rounds. Lots of shots, little punch each.",
 "Arasaka Minami 10":"Corporate-security standard medium SMG. Very reliable.",
 "H&K MPK-9":"Compact medium SMG with +1 to hit.",
 "Sternmeyer SMG 21":"Heavy SMG: rifle-like damage per round, but it kicks (−1 to hit).",
 "H&K MPK-11":"Heavy SMG that still hides under a jacket. Serious damage.",
 "Ingram MAC 14":"Very heavy, cheap and brutal, with −2 to hit and a long coat to hide it.",
 "Militech Ronin Light Assault":"Light assault rifle: accurate (+1) and very reliable.",
 "AKR-20 Medium Assault":"Workhorse assault rifle. Long range and high damage.",
 "FN-RAL Heavy Assault":"Heavy assault rifle. Punches through most body armor.",
 "Kalashnikov A-80":"Rugged heavy assault rifle, cheaper than the FN-RAL with similar damage.",
 "Arasaka Rapid Assault 12":"Combat shotgun that fires in bursts. Devastating up close.",
 "Sternmeyer Stakeout 10":"Pump shotgun. Big damage at short range, slow to fire (ROF 2).",
 "Barrett-Arasaka Light 20mm":"Anti-materiel rifle for vehicles, borgs and very bad days. Uses Heavy Weapons.",
 "Militech Arms RPG-A":"Single-shot rocket launcher. It blasts an area, so allies nearby get hurt too. Uses Heavy Weapons.",
 "Scorpion 16 Missile Launcher":"A shoulder-fired missile launcher, one missile per load: 7D10 in a 6m radius out to a kilometre. Uses Heavy Weapons.",
 "Kenshiri Adachi F-253 Flamethrower":"Sweeps fire between two points: 2D10, then 1D10 and 1D6 the next two turns. Soft armor needs more than SP 15 to help. Uses Heavy Weapons.",
 "Grenade launcher":"Clips under an assault rifle or works on its own. Fires the grenades you carry out to 225m. Uses Heavy Weapons.",
 "Grenade (fragmentation)":"A hand grenade: 7D6 to everything within 5m. Throw it up to 10m × your BODY. A miss scatters it.",
 "Grenade (incendiary)":"Sets everything within 5m alight: 4D6 a turn for 3 turns.",
 "Grenade (stun)":"No damage, but everyone within 5m makes a Stun save at −5.",
 "Grenade (dazzle)":"A blinding flash: everyone within 5m is blind for 4 turns.",
 "Grenade (sonic)":"A deafening blast: everyone within 5m is deaf for 4 turns.",
 "Grenade (gas)":"A gas cloud 3m across that drifts with the wind for a turn: teargas, nausea, sleep, or worse. Gas masks and filters stop it; armor doesn't.",
 "C-6 plastic explosive (1kg)":"Military plastique: 8D10, with a 5m blast for every kilogram. Set it with a timer, tripwire or signal.",
 "Mine":"A land mine or a claymore: 4D10. Claymores blast an hourglass 75m long in front.",
 "Molotov cocktail":"A bottle of fuel with a burning rag: 2D10 to the whole body, 2m of fire for every liter. Not on any price list: make your own.",
 "Knife":"A simple blade. Quiet, easy to hide, always handy.",
 "Club / bat":"Blunt and cheap. Anything heavy you can swing counts.",
 "Nunchaku":"Martial-arts flail. Hits harder than it looks in trained hands.",
 "Axe":"Heavy chopping weapon. Big damage, a bit clumsy (−1 to hit).",
 "Sword":"A proper blade with good damage and reach for a melee fight.",
 "Monoknife":"Mono-edged blade that slices through armor far better than steel. Many GMs treat it as armor-piercing (the Combat tab's AP option halves armor).",
 "Monokatana":"The street samurai's mono-edged sword. Huge damage, and many GMs treat it as armor-piercing.",
 "Chainsaw":"Loud, heavy and terrifying, with −3 to hit. Everyone hears you coming.",
 "Techtronica 15 Microwaver":"A flashlight-sized microwave projector: 1D6 burn damage, and anyone within 1m of the beam rolls 1D6 on the microwaver table (shorted cyberoptics or cyberaudio, REF loss, a frozen cyberlimb or a neural fit). Shielded cyberware is safe. Recharges from a wall socket in an hour.",
 "Militech Elect. LaserCannon":"Milspec laser. Its powerpack holds 10D6: dial 1D6 to 5D6 per shot until it's spent, then recharge at 1D6 an hour from wall current. Roll the damage you dialed with the dice roller. Only 1 in 10 are ever for sale.",
 "Avante P-1135 Needlegun":"Lightweight, plastic, compressed-air needles doped with drugs or poison. The target saves to resist; a successful save halves the effect.",
 "Enertex AKM Power Squirt":"A powered squirtgun. Load it with drugs, poison or acid and it stops being funny.",
 "Nelspot \"Wombat\" airpistol":"A paintball gun from hell. Fires paint (bruises; a head hit can blind), acid (1D6 a pellet, eating 1D6 SP off armor for 3 rounds), drugs or poison.",
 "Militech Electronics Taser":"Zap. The target makes a Stun save, at −2 for each further shot within three turns. Recharges from wall current in an hour.",
 "EagleTech \"Tomcat\" compound bow":"Gyrobalanced, stabilized compound bow. Silent and deadly. Uses Archery.",
 "EagleTech \"Stryker\" crossbow":"Plastic and bimetal crossbow. Silent, deadly, and you can usually get your bolts back. Uses Archery.",
 "SPM-1 Battleglove":"A powered gauntlet over the hand and forearm: 3D6 crushing or 2D6 punching. Holds three cyberarm weapons or options (not hydraulic rams).",
 "Naginata":"A Japanese polearm with a curved blade. Reaches 2m.",
 "Shuriken":"Throwing stars. Thrown with Athletics.",
 "Switchblade":"A spring-loaded folding knife.",
 "Brass knuckles":"Metal knuckles that add weight to a punch.",
 "Sledgehammer":"A heavy two-handed hammer.",
 "S&W Combat Magnum":"A .357 revolver designed for the US Border Patrol and popular with police. Old guns cost about half a new one; the GM has the final say.",
 "Llama Commanche":"A .44 revolver for home defense and police work. Its long barrel makes it hard to hide.",
 "Colt .45 \"Peacemaker\"":"The gun that won the West. Single action: cock it before every shot.",
 "Colt .38 Detective":"The classic police revolver. Many are still around.",
 "C.O.P. .357 Derringer":"A four-shot holdout for law enforcement. Easy to hide.",
 "UZI":"The Israeli export SMG, used worldwide by security forces and worse.",
 "Vz61 Skorpion":"The world's smallest military SMG. Very controllable, easy to silence.",
 "Ingram MAC 10":"Tiny .45 SMG. Easy to silence, very hard to control on full auto.",
 "H&K MP5 / MP5K":"Heckler & Koch's classic SMG family. The MP5K is the compact one.",
 "Thompson M1":"The WWII Tommy gun. Rugged, reliable, easy to use.",
 "Bushmaster":"A one-handed bullpup SMG that takes M-16 clips.",
 "FN-FAL":"The old standard NATO rifle. Deadly, durable, handles well.",
 "AK-47 / AKM":"The Soviet rifle exported everywhere. Reliable and rugged, but hard to control.",
 "M-16A2":"The US military rifle since the 1960s. Accurate, with a staggering rate of fire. Early models had WA 1.",
 "Steyr AUG":"A plastic and aluminum bullpup with a built-in scope.",
 "Winchester M70":"A scoped hunting rifle.",
 "CAWS":"Close Assault Weapon System: a house-clearing shotgun with a built-in scope.",
};
const ARMOR_NOTES={
 "Heavy leather jacket":"Style first. Stops knives and light pistol rounds, not much else.",
 "Kevlar T-shirt / vest":"Light body armor you can wear under clothes. Torso only.",
 "Steel helmet":"Basic head protection.",
 "Nylon helmet":"Good head protection for a small price.",
 "Light armor jacket":"Armored jacket that passes for street wear. Torso and arms.",
 "Medium armor jacket":"Better protection, but a little bulky (−1 REF).",
 "Flak vest":"Military torso armor. Heavy (−1 REF).",
 "Flak pants":"Protect both legs. Heavy (−1 REF).",
 "Heavy armor jacket":"Serious protection for torso and arms, at −2 REF.",
 "Door gunner's vest":"Very heavy torso armor built for combat zones (−3 REF).",
 "MetalGear suit":"Full-body plate armor: everything covered, −2 REF and impossible to miss.",
};
const CYBER_NOTES={
 "Light tattoo":"A glowing or colour-shifting tattoo. Purely for style, with no game effect.",
 "Shift-tacts":"Contact lenses that change eye colour on command. Cosmetic.",
 "Skinwatch":"A glowing digital watch under the skin of your wrist. Never lose track of time.",
 "Techhair":"Light-emitting hair that changes colour and glows. Cosmetic.",
 "Biomonitor":"Under-skin readout of pulse, temperature, blood sugar and more. Warns you about poisons, drugs or bleeding.",
 "Neural processor":"The base implant that all other neuralware plugs into. Install it before any other neuralware.",
 "Interface plugs":"Sockets that let you jack straight into cyberdecks, smartguns, vehicles and machines. Every Netrunner needs them.",
 "Cybermodem link":"A neural co-processor that translates a cybermodem's signals into your own neural code, so you can run a cyberdeck directly. Needs interface plugs.",
 "Kerenzikov boost +1":"Speeds up your reflexes all the time: +1 to every initiative roll. (The sheet adds it for you.)",
 "Kerenzikov boost +2":"Speeds up your reflexes all the time: +2 to every initiative roll. (The sheet adds it for you.)",
 "Sandevistan speedware +3":"Switch it on for a fight: +3 to initiative while it runs (a few turns), then it needs time to recharge. (The sheet adds the +3.)",
 "Pain editor":"Shuts off pain. You're far harder to knock out with stun damage, but you won't feel how badly you're hurt.",
 "Tactile boost":"Hyper-sensitive touch: feel vibrations, footsteps through floors, tiny surface details.",
 "Olfactory boost":"A bloodhound's sense of smell. Track people by scent and sniff out chemicals.",
 "Chipware socket":"A slot for skill chips. While a chip is plugged in you use its skill level. Your GM decides which chips exist.",
 "Vehicle link":"Drive or pilot a linked vehicle directly through your interface plugs, with faster reactions at the controls.",
 "Smartgun link":"Links your eye and brain to a smartgun: +2 to hit with smartguns. (The sheet adds +2 to every ranged weapon; remove it for dumb guns.)",
 "Cyberoptic (one eye)":"A replacement eye with room for up to 4 options (low-lite, infrared, scopes…). Buy one before any eye options.",
 "Low-lite":"See in dim light as if it were daylight. Needs a cyberoptic. Doesn't work in total darkness.",
 "Infrared":"See heat: people in the dark, through smoke, warm engines. Needs a cyberoptic.",
 "Targeting scope":"A crosshair overlay linked to your smartgun: +1 to hit with smartgun attacks (the Attack window adds it). Needs a cyberoptic.",
 "Times Square marquee":"Shows text and images across your vision, like a heads-up display. Needs a cyberoptic.",
 "Anti-dazzle":"Protects your eyes from flashes, flashbangs and bright lights. Needs a cyberoptic.",
 "Teleoptics":"Zoom your vision up to about 20× to spot things far away. Needs a cyberoptic.",
 "Image enhancement":"Sharper vision: +2 to Awareness checks that use sight. Needs a cyberoptic.",
 "Cyberaudio suite":"A replacement inner ear with room for audio options. Buy it before any cyberaudio options.",
 "Radio link":"A built-in radio for talking silently with other linked people (about 1 mile range). Needs cyberaudio.",
 "Phone splice":"A phone wired into your head. Make and take calls hands-free. Needs cyberaudio.",
 "Amplified hearing":"Hear whispers through walls: a bonus to Awareness checks that use hearing. Needs cyberaudio.",
 "Level damper":"Cuts out deafening noise like gunshots, explosions and sonic attacks. Needs cyberaudio.",
 "Voice stress analyzer":"Hears the strain in a liar's voice: +2 to Human Perception to tell if someone is lying. Needs cyberaudio.",
 "Nasal filters":"Filters in your nose block most gases, smoke and airborne toxins.",
 "Toxin binders":"Your blood neutralises poisons and drugs: +4 to saves against them.",
 "Enhanced antibodies":"A boosted immune system: you heal 1 extra point a day while you're being treated.",
 "Nanosurgeons":"Microscopic machines in your blood that repair damage: they double your healing rate while you're being treated.",
 "Contraceptive implant":"Long-term birth control. No game effect.",
 "Grafted muscle (+1 BODY)":"Extra muscle tissue: +1 BODY, so more damage soaked, better saves and a harder punch. (The sheet adds it.)",
 "Muscle & bone lace (+2 BODY)":"Reinforced bones and muscles: +2 BODY. (The sheet adds it.)",
 "Skinweave (SP 12)":"Woven armor under your whole skin: SP 12 everywhere, with no REF penalty and nothing to take off. (The sheet layers it with your armor.)",
 "Subdermal armor (SP 18 torso)":"Armor plates under the skin of your torso: SP 18 there, always on. (The sheet layers it with your armor.)",
 "Big knucks (1D6+2)":"Armored knuckles. Your punches do 1D6+2 instead of normal brawling damage.",
 "Scratchers (1D6/2)":"Sharp fingernail blades. A nasty scratch for 1D6/2 damage, and easy to hide.",
 "Rippers (1D6+3)":"Claws that slide out of your fingertips: 1D6+3 damage.",
 "Wolvers (3D6)":"Long blades that snap out of your knuckles: 3D6 damage. Iconic and illegal in most places.",
 "Slice-n-dice (2D6)":"A monofilament whip in your thumb: 2D6 damage, and it slices through armor easily.",
 "Fangs (1D6/3)":"Sharpened, reinforced teeth. Bite for 1D6/3 damage.",
 "Cyberhand":"A standard replacement hand that looks like a normal one. It attaches to a cyberarm.",
 "Cyberleg":"A replacement leg. Takes hits for you, and has room for options like hydraulic rams.",
 "Cyberarm":"A replacement arm. Takes hits for you until it's destroyed, crushes harder, and holds options like pop-up guns.",
 "Hydraulic rams":"Powerful pistons in a cyberleg or cyberarm: leap much further and kick or lift harder. Needs a cyberlimb.",
 "Pop-up gun in limb":"A pistol hidden inside a cyberlimb that pops out ready to fire. Nearly impossible to find in a search. Needs a cyberlimb.",
 "ChemSkins":"Skin tints that change color or pattern on cue.",
 "Synthskins":"Artificial skin that changes color and pattern.",
 "Machine/tech link":"Plugs you straight into autofactories and large or small machines.",
 "DataTerm link":"Download from DataTerms straight into your internal memory.",
 "Color shift":"Changes your eye color, with special fashion effects.",
 "Micro-optics":"A microscope in your eye.",
 "Thermograph sensor":"See heat patterns and read temperatures.",
 "Ultraviolet":"See in the dark with a UV flash.",
 "MicroVideo optic":"Records up to 20 minutes of video. Takes 2 option spaces.",
 "Digital camera optic":"Shoots up to 20 images. Takes 2 option spaces.",
 "Dartgun optic":"A single poison or drug dart fired from your eye. Takes 3 option spaces. It's in the Attack window.",
 "Scrambler":"Nobody can overhear your communications without a descrambler.",
 "Bug detector":"Detects taps and bugs within 3m. 60% effective.",
 "Sound editing":"+2 to Awareness to overhear one specific conversation.",
 "Enhanced hearing range":"Hear supersonic and subsonic ranges.",
 "Wearman":"A stereo music system in your head.",
 "Radar detector":"Beeps when a radar beam hits you and finds its source (40%).",
 "Homing tracer":"Follow a tracer up to 1km away.",
 "Tight beam radio link":"Untappable radio within line of sight.",
 "Wide band radio scanner":"Picks up every transmission on every band.",
 "Micro-recorder link":"Sends what you hear to a recorder in your body or through your plugs.",
 "Digital recording link":"Sends what you hear to a digital recorder.",
 "Gills":"Breathe water, good for 4 hours.",
 "Independent air supply":"Breathe for 25 minutes with no air.",
 "Mr. Studd sexual implant":"All night, every night.",
 "Subdermal pocket":"A 2\"×4\" pocket under the skin with a RealSkinn zipper.",
 "Adrenal booster":"+1 REF for 1D6+2 turns, three times a day. Switch it on with the GM.",
 "Motion detector":"Detects motion in a 20 sq m area. 70% effective.",
 "Digital recorder implant":"2 hours of storage from any digital source.",
 "Audio/video tape recorder":"2 hours of storage from your video and audio links.",
 "Radar sensor":"100m radar. Needs a cyberoptic. 70% effective.",
 "Sonar implant":"50m sonar, in water only. 70% effective.",
 "Radiation detector":"Detects radiation within 10m. 80% effective.",
 "Chemical analyser":"Analyses chemicals within 5m. 70% effective.",
 "Voice synthesizer":"Mimic any recorded sound (60%), up to 10 sounds.",
 "AudioVox":"A vocal synthesizer for special effects: +2 to Perform.",
 "Grafted muscle (+2 BODY)":"Two grafts of vat-grown muscle: +2 BODY (1,000eb a point).",
 "Cybersnake":"A self-controlling cyberweapon that lives in your throat: 1D6. It's in the Attack window.",
 "Quick change mount":"Swap cyberware on a limb in one turn.",
 "Thickened myomar":"The limb has 25 SDP and does double damage. +50% on leaps.",
 "Reinforced joints":"+5 SDP for the limb.",
 "Artificial shoulder mount":"Mount a second pair of arms below the first. One only.",
 "Microwave/EMP shielding":"The limb ignores microwaver side effects.",
 "Plastic covering":"Colored or transparent plastic skin for a cyberlimb.",
 "RealSkinn":"The limb looks real (a Difficult task to tell). Lowers its Humanity cost by 1D6/2, so the GM adjusts it.",
 "Superchrome":"A high-gloss metallic finish.",
 "Cyberlimb armor (SP 20)":"Armors a cyberlimb to SP 20. Add it as armor on that limb.",
 "Ripper hand":"A standard hand with rippers built in: 1D6+3, AP like a knife.",
 "Hammer hand":"A hydraulic ram fist: 1D10.",
 "Buzz hand":"A wire circular saw: 2D6+2, and it shreds soft armor.",
 "Tool hand":"Fingers with a screwdriver, wrench, small drill and more.",
 "Grapple hand":"Fires a rocket-propelled grapple on a 100' line.",
 "Extension hand":"The hand extends up to 1m on a collapsible sleeve.",
 "Spike hand":"A palm spike through the fingers: 1D6+3, armor piercing.",
 "Modular hand":"Choose any 4 modular tools.",
 "Standard foot":"A cyberfoot that looks normal.",
 "Talon foot":"Toe blades: 1D6, AP like a knife.",
 "Tool foot":"Toes with a screwdriver, wrench, small drill and more.",
 "Web foot":"Double swimming speed and +3 to swim.",
 "Grip foot":"Better grip: +2 to Climb.",
 "Spike heel foot":"A heel spike for climbing or lethal kicks: 2D6, armor piercing.",
 "Limb tape recorder":"A 2-hour micro cassette in a cyberlimb. Needs an external pickup.",
 "Limb digital recorder":"A digital chip recorder in a cyberlimb.",
 "Storage space":"A lockable 2\"×6\" space in a cyberlimb. Holds 2 grenades.",
 "MiniCam":"A pop-up digital camera, 20 shots.",
 "MiniVid":"A pop-up mini video camera, 30 minutes.",
 "Hidden holster":"Hides a pistol in a cyberlimb. How big depends on your BODY.",
 "LCD screen readout":"A screen in the limb that links to any output device.",
 "Limb techscanner":"A techscanner built into a cyberlimb.",
 "Limb grenade launcher":"A pop-up launcher holding one grenade of any type. It's in the Attack window.",
 "Micro-missile launcher":"Four heat-seeking mini-missiles, two a turn: 4D6 each, WA +2, 200m. They can follow a target around one corner (3 in 10 they lose it).",
 "Limb flamethrower":"A 1m flame jet, 4 shots: 2D6, then 1D6/2 for 2 rounds. Soft armor drops 2 levels each hit.",
 "Weapon mount & link":"A hardpoint and neural link for one externally mounted weapon. No armor or clothes over it while in use.",
 "2-shot capacitor laser":"A shoulder micro-laser: 3D6 a shot, WA +3, only 10m. Recharges in an hour from a socket.",
 "Linear frame Σ (Sigma)":"An implanted exoskeleton: use Strength 12 instead of BODY for lifting and breaking, +4 melee damage. Lifts 600kg. −1 REF, and you can't swim.",
 "Linear frame β (Beta)":"An implanted exoskeleton: use Strength 14 instead of BODY for lifting and breaking, +6 melee damage. Lifts 700kg. −1 REF, and you can't swim.",
 "Linear frame Ω (Omega)":"An implanted exoskeleton: use Strength 16 instead of BODY for lifting and breaking. Lifts 800kg. −1 REF, and you can't swim.",
 "Cowl (SP 25 head)":"An armored skullcap: SP 25 on the head.",
 "Faceplate (SP 25)":"A protective armored face mask: SP 25.",
 "Torso plate (SP 25)":"Armor plating over the torso: SP 25.",
 "Front optic mount":"Mount up to 5 optics on your face.",
 "Sense extensions (\"rabbit ears\")":"Head-mounted extensors for audio, optics and more. 500eb each.",
};
const GEAR_NOTES={
 "Jewelry":"Rings, chains and studs. 10–100eb in the book.",
 "Mirrorshades":"Mirrored sunglasses. 5–50eb in the book.",
 "Contact lenses":"Colored or corrective contacts.",
 "Glasses":"Corrective or fashion glasses.",
 "Techscanner":"A handheld diagnostic computer with probes: finds faults and shows schematics.",
 "Cutting torch":"A hand-held oxy-acetylene torch.",
 "Tech toolkit":"Hand tools for mechanical repairs. You need it for most Basic Tech and Jury Rig work.",
 "B & E tools":"Breaking and entering kit: picks, probes and pry bars for Pick Lock.",
 "Electronics toolkit":"Tools for electronics work: Electronics, Elect. Security and similar skills.",
 "Protective goggles":"Eye protection for welding, machining and chemicals.",
 "Flashlight":"Light in the dark. Beam range about 100–120 feet.",
 "Glowstik":"A chemlight. Shake it for up to 6 hours of soft light.",
 "Flash paint (pint)":"Fluorescent paint that glows for up to 4 hours.",
 "Flash tape (foot)":"Glowing tape. Lasts 6 hours.",
 "Rope (per foot)":"Braided synthetic rope. Holds up to 1,000 lbs.",
 "Breathing mask":"A painter's mask with replaceable filters. Keeps out the smog.",
 "Holo generator":"Projects a hologram from a chip.",
 "Video board (per sq ft)":"A flat LCD screen, sold by the square foot.",
 "Data chip":"Digital storage: a button, square or sliver of plastic.",
 "Logcompass":"An inertial compass that tracks every change of direction from a fixed point.",
 "Digital recorder":"Records audio onto datachips.",
 "Digital camera":"Takes still pictures onto a chip.",
 "VideoCam":"A shoulder video camera. Records onto tape-paks or feeds a transmitter.",
 "Video/audio tape player":"Plays videocam tape-paks and old audio tapes.",
 "Video tape":"High-density digital tape for audio and video.",
 "Pocket TV":"A tiny flat screen for news feeds and broadcasts.",
 "Digital chip player":"Plays audio and video chips. Video needs a video board.",
 "Digital music chip":"One to six albums on a chip.",
 "Electric guitar":"The 2020 axe. 100–500eb in the book.",
 "Electronic keyboard":"200–900eb in the book.",
 "Drum synthesizer":"Percussion pads and a sound box. 200–800eb in the book.",
 "Amplifier":"500–1,000eb in the book.",
 "Laptop computer":"A portable computer with chip slots. Can't be used for netrunning.",
 "Pocket computer":"A handheld computer for notes, maps, files and calculations.",
 "Interface cables (pair)":"Cables that connect your interface plugs to decks, guns or machines. 20–30eb in the book.",
 "Low impedance cables":"Better data transfer: +1 to interfacing tasks like cybervehicles or netrunning.",
 "'Trode set":"A headset for running without plugs: −2 to Interface.",
 "Keyboard":"Attaches to a cybermodem or other electronics.",
 "Terminal":"A workstation. You can netrun from it, safe from most Black ICE, but at −5 to Interface.",
 "Mastoid commo":"A radio glued to your jaw and temple: subvocal, silent, 10 miles.",
 "Pocket commo":"A walkie-talkie. 10 miles.",
 "Cellular phone":"A personal phone. Service is 100eb a month.",
 "Mini cell phone":"A phone that fits in a cigarette pack.",
 "Binoglasses":"Binoculars with a laser rangefinder, sometimes IR.",
 "Binoculars":"Plain binoculars.",
 "Light booster goggles":"Night vision from ambient light. A sudden bright light can overwhelm them.",
 "IR goggles":"See infrared, usually with an IR flash.",
 "IR flash":"An invisible infrared light source.",
 "Smartgoggles":"Goggles that work like a smartgun link without surgery, and take up to 4 cyberoptic options.",
 "Keylock (per level)":"A mechanical lock. Four levels: Average (15) to Nearly Impossible (30) to pick.",
 "Cardlock (per level)":"A magnetic card lock. Four levels of security.",
 "Vocolock (per level)":"A voice-recognition lock. Four levels of security.",
 "Line tap":"Taps voice or data on old copper lines. Useless on systems after 2008.",
 "CodeDecryptor":"+5 to beat a cardlock.",
 "VocDecryptor":"A vocal modulator for beating vocolocks.",
 "Security scanner":"Finds alarm systems' fields. 75% chance.",
 "Poison sniffer":"Checks air or liquid for poisons. 85% accurate.",
 "Jamming transmitter":"Jams transmissions, phones and some cyberware within 1,000 feet. Fills 2 or 3 cases.",
 "Scanner plate":"A palmprint reader for an extra layer of security.",
 "Movement sensor":"An alarm that detects movement. 95% reliable.",
 "Passcard":"Opens a cardlock.",
 "Tracking device":"Follows tracer buttons up to 1 mile.",
 "Tracer button":"A tiny tracer to stick on someone.",
 "Remote sensors":"Sensors you can leave and watch from elsewhere.",
 "PlasKuffs":"Plastic handcuffs.",
 "Handcuffs":"Nearly Impossible to break; half open with a cardlock.",
 "Stripwire binders":"One-use plastic cuffs. Very Difficult to break.",
 "Gas mask":"Protects against tear gas, smoke and most airborne toxins while you wear it.",
 "Dermal stapler":"Closes a wound with dissolving staples.",
 "Spray skin (can)":"Antiseptic gel for bad abrasions. Flakes off in two weeks.",
 "Cryotank":"Chills a dying body to preservation while machines keep the blood flowing: +3 to stabilize.",
 "Medkit":"Bandages and basic drugs for First Aid on the spot.",
 "Surgical kit":"A surgeon's full set of tools for Medical Tech.",
 "First aid kit":"Household bandages, antiseptic and painkillers.",
 "Medscanner":"Reads vital signs: +2 to Diagnose.",
 "Drug analyser":"Checks a drug's purity or identifies an unknown one.",
 "Airhypo":"Injects a drug with a burst of air.",
 "Trauma kit":"Surgical-grade gear for Medical Tech: stabilising mortal wounds and serious patch-ups.",
 "Nylon carrybag":"A kitbag in any size, with logos.",
 "Sleeping bag":"Good to −100°F, packs down small.",
 "Inflatable bed":"A self-inflating mattress.",
 "Futon":"A folding bed and pad.",
 "Real wood furniture (piece)":"Real wood.",
 "Synthetic furniture (piece)":"Everything else.",
 "Apartment cube":"A 10'×10' living module with everything folded into the walls.",
 "Lamp":"It gives light.",
 "Cleaning bot":"A small robot vacuum. Not too smart.",
 "Vocal switcher system":"Voice-activated lights and appliances.",
 "Movie":"A night at the movies.",
 "VCR/chip rental":"Rent a movie on chip.",
 "Braindance":"A braindance session.",
 "Live concert/sports event":"A ticket.",
 "Fast food meal":"Fast food.",
 "Well drink":"A cheap drink. Good bars cost 2×, excellent ones 3×.",
 "Restaurant meal":"A fair restaurant. Good ones cost 2×, excellent ones 3×.",
 "Light pistol / light SMG ammo (box of 100)":"Armor piercing costs 3×.",
 "Medium pistol / SMG ammo (box of 50)":"Armor piercing costs 3×.",
 "Heavy pistol / heavy SMG ammo (box of 50)":"Armor piercing costs 3×.",
 "Very heavy pistol ammo (box of 50)":"Armor piercing costs 3×.",
 "Assault rifle ammo (box of 100)":"Armor piercing costs 3×.",
 "Shotgun shells (box of 12)":"Armor piercing costs 3×.",
 "20mm cannon round":"One round.",
 "Arrows (12)":"For bows.",
 "Crossbow bolts (12)":"For crossbows.",
 "Airgun pellets (100)":"Drug or acid pellets cost 5×.",
 "Needlegun rounds (50)":"Drugs cost extra.",
 "Flamethrower reload":"Refills a flamethrower.",
 "Micro-missile reload (each)":"One missile for a micro-missile launcher.",
 "Silencer":"Quiets a gun.",
 "Holster":"Any type.",
 "Shoulder sling":"For long guns.",
 "Scooter":"Electric, about 50 mph, 6 hours a charge.",
 "Motorcycle":"Recumbent, with fairings. Electric ones do 65 mph; CHOOH2 ones 140 mph.",
 "CityCar":"A one-seat electric three-wheeler. About 40 mph, 4 hours a charge.",
 "Small subcompact":"Seats four. About 90 mph.",
 "Medium sedan":"Seats four. About 90 mph.",
 "Sportscar":"Seats two. About 210 mph.",
 "Luxury sedan":"Seats six. About 90 mph.",
 "Pants (Generic Chic)":"Generic Chic: colorful modular streetwear.",
 "Top (Generic Chic)":"Generic Chic: colorful modular streetwear.",
 "Jacket (Generic Chic)":"Generic Chic: colorful modular streetwear.",
 "Footwear (Generic Chic)":"Generic Chic: colorful modular streetwear.",
 "Pants (Leisurewear)":"Leisurewear: padded fleece and athletic logos.",
 "Top (Leisurewear)":"Leisurewear: padded fleece and athletic logos.",
 "Jacket (Leisurewear)":"Leisurewear: padded fleece and athletic logos.",
 "Footwear (Leisurewear)":"Leisurewear: padded fleece and athletic logos.",
 "Pants (Businesswear)":"Businesswear: suits, pinstripes, real leather shoes.",
 "Top (Businesswear)":"Businesswear: suits, pinstripes, real leather shoes.",
 "Jacket (Businesswear)":"Businesswear: suits, pinstripes, real leather shoes.",
 "Footwear (Businesswear)":"Businesswear: suits, pinstripes, real leather shoes.",
 "Pants (High Fashion)":"High Fashion: designer labels for the upper class.",
 "Top (High Fashion)":"High Fashion: designer labels for the upper class.",
 "Jacket (High Fashion)":"High Fashion: designer labels for the upper class.",
 "Footwear (High Fashion)":"High Fashion: designer labels for the upper class.",
 "Pants (Urban Flash)":"Urban Flash: video jackets, colorshift, leathers and spikes.",
 "Top (Urban Flash)":"Urban Flash: video jackets, colorshift, leathers and spikes.",
 "Jacket (Urban Flash)":"Urban Flash: video jackets, colorshift, leathers and spikes.",
 "Footwear (Urban Flash)":"Urban Flash: video jackets, colorshift, leathers and spikes.",
};

const iiAvg=e=>{try{return avgDice(e)}catch(_){return 0}};
const iiRange=e=>{const p=parseDice(e);if(!p)return "";if(p.fixed!=null)return String(p.fixed);const lo=p.n+p.mod,hi=p.n*p.sides+p.mod;return p.div>1?`${Math.ceil(lo/p.div)}–${Math.ceil(hi/p.div)}`:`${Math.max(0,lo)}–${hi}`};
function iiRow(label,html){return `<div class="ii-r"><span class="ii-l">${label}</span><span>${html}</span></div>`}
function iiCard(title,sub,body,note,foot){return `<div class="ii-h"><b>${esc(title)}</b><span>${esc(sub)}</span></div>${note?`<p class="ii-note">${esc(note)}</p>`:""}<div class="ii-b">${body}</div>${foot?`<div class="ii-f">${foot}</div>`:""}`}
function iiWho(c){return c?esc(c.handle||c.name||"This runner"):"You"}

function weaponInfo(w,c){
  const k=c?calc(c):null;const type=II_TYPE[w.type]||"Weapon";const skill=w.skill||WTYPE_SKILL[w.type]||"Melee";const wa=Number(w.wa)||0;
  const avg=iiAvg(w.dmg);const melee=w.type==="MEL";let body="";
  if(k){const lvl=skillLevel(c,skill);const smart=k.smart&&!melee?2:0;const total=k.eff.REF+lvl+wa+smart;
    body+=iiRow("To hit",`<b>${total} + 1D10</b> for ${iiWho(c)}: REF ${k.eff.REF} + ${esc(skill)} ${lvl}${wa?` ${wa>0?"+":"−"} ${Math.abs(wa)} WA`:""}${smart?" + 2 smartgun link":""}. ${melee?"Beat the defender's roll (their REF + Dodge or Melee + 1D10).":"Beat the range DV."}`)}
  else body+=iiRow("To hit",`REF + ${esc(skill)}${wa?` ${wa>0?"+":"−"} ${Math.abs(wa)} (weapon accuracy)`:""} + 1D10${melee?" against the defender's roll":", beat the range DV"}.`);
  const mb=melee&&k?k.melee:0;
  const beats=II_ARMOR_REF.filter(([sp])=>avg+mb>sp).pop();
  const stops=II_ARMOR_REF.find(([sp])=>avg+mb<=sp);
  body+=iiRow("Damage",`<b>${esc(w.dmg)}</b> per hit (${iiRange(w.dmg)}, about ${Math.round(avg*10)/10} on average)${melee?`${k&&mb?`, ${sgn(mb)} melee bonus from BODY`:", plus your BODY melee bonus"}`:""}. Armor SP is taken off first, then body type.${beats?` A typical hit gets through ${beats[1]} (SP ${beats[0]})`:" A typical hit won't get through even a leather jacket (SP 4)"}${stops&&beats?`; ${stops[1]} (SP ${stops[0]}) usually stops it.`:stops?".":"; most armor won't stop it."}`);
  if(!melee){const rof=Number(w.rof)||1;const r=parseInt(w.range)||50;
    body+=iiRow("Fire rate",rof<=2?`ROF ${rof}: up to ${rof} aimed shot${rof>1?"s":""} per turn.`:`ROF ${rof}: single shots, a 3-round burst (+3 to hit at close and medium range) or full auto (+1 to hit per 10 rounds at close range, −1 per 10 farther out) up to ${rof} rounds a turn.`);
    if(w.shots)body+=iiRow("Magazine",`${esc(w.shots)} shot${String(w.shots)==="1"?"":"s"}. Reloading takes a turn.`);
    body+=iiRow("Range",`${esc(w.range)} long range. DV 10 within 1 m, 15 up to ${Math.round(r/4)} m, 20 up to ${Math.round(r/2)} m, 25 up to ${r} m, 30 up to ${r*2} m.`)}
  else body+=iiRow("Attacks","One attack per turn, at arm's reach (1 m).");
  const rel=II_REL[w.rel];if(rel&&!melee)body+=iiRow("Reliability",`${rel[0]}: if you fumble, it ${rel[1]}.`);
  if(II_CONC[w.conc])body+=iiRow("Hiding",esc(II_CONC[w.conc])+".");
  if(II_AVAIL[w.avail])body+=iiRow("Where to buy",esc(II_AVAIL[w.avail])+".");
  return iiCard(w.name,`${type} · ${skill} skill`+iiHb("w",w.name),body,WEAPON_NOTES[w.name]||ITEM_DESC.w[w.name]||w.desc||"",iiFoot())}

function armorInfo(a,c){
  const locs=(a.locs||[]).map(l=>(LOCS.find(x=>x[0]===l)||[l,l])[1]);const ev=Number(a.ev)||0;let body="";
  body+=iiRow("Protects",`${locs.length===6?"Every location":esc(locs.join(", "))} with <b>SP ${a.sp}</b>. A hit there loses ${a.sp} damage before body type, and each hit that gets through wears the armor down by 1 SP.`);
  if(c){const k=calc(c);const now=(a.locs||[]).map(l=>({l,sp:spAt(c,l)}));const owned=(c.armor||[]).some(x=>x.id===a.id);
    if(!owned){const after=(()=>{const tmp={...c,armor:[...(c.armor||[]),{...a,worn:true,dmg:{}}]};return (a.locs||[]).map(l=>spAt(tmp,l))})();
      body+=iiRow("On "+iiWho(c),now.map((x,i)=>`${esc((LOCS.find(y=>y[0]===x.l)||[x.l,x.l])[1])} SP ${x.sp} → <b>${after[i]}</b>`).join(" · ")+(now.some(x=>x.sp>0)?". Layers combine by the proportional armor rule.":"."))}
    else body+=iiRow("On "+iiWho(c),now.map(x=>`${esc((LOCS.find(y=>y[0]===x.l)||[x.l,x.l])[1])} SP ${x.sp}`).join(" · ")+" with everything worn.");
    body+=iiRow("Encumbrance",ev?`EV ${ev}: −${ev} REF while worn${owned?"":`, so REF ${k.eff.REF} → <b>${Math.max(0,k.eff.REF-ev)}</b>`}. That lowers your initiative and every REF-based skill.`:"EV 0: no penalty.")}
  else body+=iiRow("Encumbrance",ev?`EV ${ev}: −${ev} REF while worn.`:"EV 0: no penalty.");
  body+=iiRow("Layers","You can wear up to 3 layers. The sheet works out the combined SP for you.");
  return iiCard(a.name,"Armor"+iiHb("a",a.name),body,ARMOR_NOTES[a.name]||ITEM_DESC.a[a.name]||a.desc||"",iiFoot())}

function cyberInfo(x,c){let body="";const hc=x.hc||x[3];const avg=iiAvg(hc);
  if(x.init)body+=iiRow("Effect",`+${x.init} initiative.`);
  if(x.smart)body+=iiRow("Effect","+2 to hit with smartguns.");
  if(x.mods)body+=iiRow("Effect",Object.entries(x.mods).map(([m,v])=>`${sgn(v)} ${esc(m)}`).join(", ")+".");
  if(x.armor)body+=iiRow("Effect",`SP ${x.armor.sp} on ${x.armor.locs.length===6?"every location":esc(x.armor.locs.map(l=>(LOCS.find(y=>y[0]===l)||[l,l])[1]).join(", "))}, layered with your armor.`);
  body+=iiRow("Humanity",`Costs ${esc(hc)} Humanity${avg?` (about ${Math.round(avg*10)/10})`:""}. You lose 1 EMP for every 10 Humanity lost, and at 0 you go cyberpsycho.`);
  if(c){const k=calc(c);const owned=(c.cyber||[]).some(y=>y.id===x.id);
    if(!owned){const h=k.humanity-avg;const emp=Math.max(0,Math.min(k.base.EMP+(k.mods.EMP||0),Math.ceil(h/10)));
      body+=iiRow("On "+iiWho(c),`Humanity ${k.humanity} → about <b>${Math.round(h)}</b>${emp!==k.eff.EMP?`, EMP ${k.eff.EMP} → <b>${emp}</b> (EMP skills and Humanity checks get harder)`:`, EMP stays ${k.eff.EMP}`}.`)}
    else body+=iiRow("On "+iiWho(c),`Cost ${esc(x.hcLoss)} Humanity when installed.`)}
  const cat=x.cat||x[1];
  return iiCard(x.name,(cat?cat+" · cyberware":"Cyberware")+iiHb("c",x.name),body,CYBER_NOTES[x.name]||ITEM_DESC.c[x.name]||x.desc||"",iiFoot())}

function gearInfo(g){const name=g.name||g[0];return iiCard(name,"Gear"+iiHb("g",name),"",GEAR_NOTES[name]||ITEM_DESC.g[name]||g.desc||"General equipment.",iiFoot())}
function iiHb(kind,name){const p=PACK_SRC[kind]&&PACK_SRC[kind][name];return p?` · homebrew (${p})`:""}
function iiFoot(){return "A summary of the Cyberpunk 2020 rules. Your GM has the final say."}

/* what a data-info key points at: "w:3" (catalog), "own:weapons:<id>" (on the sheet) */
function itemInfoHTML(key){const c=typeof ckChar==="function"?ckChar():curChar();const [k,a,b]=String(key).split(":");
  if(k==="w"&&WEAPONS[a])return weaponInfo(mkWeapon(WEAPONS[a]),c);
  if(k==="a"&&ARMOR[a])return armorInfo(mkArmor(ARMOR[a]),c);
  if(k==="c"&&CYBER[a]){const r=CYBER[a];return cyberInfo({...mkCyber(r,0),hc:r[3]},c)}
  if(k==="g"&&GEAR[a])return gearInfo(GEAR[a]);
  if(k==="own"&&c){const it=(c[a]||[]).find(x=>x.id===b);if(!it)return "";
    if(a==="weapons")return weaponInfo(it,c);if(a==="armor")return armorInfo(it,c);if(a==="cyber")return cyberInfo(it,c);if(a==="gear")return gearInfo(it)}
  return ""}

/* ---------- the hover card ---------- */
const ItemTip={el:null,key:null,anchor:null,t:null,pinned:false,
  ensure(){if(!this.el){this.el=document.createElement("div");this.el.className="itemtip";this.el.id="itemtip";this.el.setAttribute("role","tooltip");this.el.hidden=true;document.body.appendChild(this.el)}return this.el},
  pane(anchor){const p=anchor.closest(".modal")&&document.getElementById("shop-detail");return p&&p.offsetParent!==null&&getComputedStyle(p).display!=="none"?p:null},
  show(anchor,pinned){const key=anchor.dataset.info;const html=itemInfoHTML(key);if(!html){this.hide();return}
    const pane=this.pane(anchor);
    if(pane){if(this.el)this.el.hidden=true;if(pane.dataset.key!==key){pane.innerHTML=`<div class="ii-pane">${html}</div>`;pane.dataset.key=key}
      document.querySelectorAll(".shop-row.ii-on").forEach(r=>r.classList.remove("ii-on"));anchor.classList.add("ii-on");this.anchor=anchor;this.key=key;this.pinned=false;this.inPane=true;anchor.setAttribute("aria-describedby","shop-detail");return}
    this.inPane=false;
    const el=this.ensure();this.key=key;this.anchor=anchor;this.pinned=!!pinned;el.innerHTML=html;el.hidden=false;el.classList.toggle("pinned",this.pinned);
    if(this.pinned)el.insertAdjacentHTML("afterbegin",`<button class="icon-btn ii-x" data-ii-close aria-label="Close">×</button>`);
    anchor.setAttribute("aria-describedby","itemtip");this.place()},
  place(){const el=this.el,a=this.anchor;if(!el||!a||el.hidden)return;const r=a.getBoundingClientRect();const W=window.innerWidth,H=window.innerHeight;
    if(W<700){el.classList.add("sheet");el.style.width="";el.style.left="";el.style.top="";el.style.maxHeight=Math.round(H*0.55)+"px";return}
    el.classList.remove("sheet");
    el.style.maxHeight=Math.min(H-24,560)+"px";const w=Math.min(400,W-24);el.style.width=w+"px";const h=el.offsetHeight;
    const modal=a.closest(".modal");const mr=modal?modal.getBoundingClientRect():r;let x,y;
    if(mr.right+12+w<=W-8)x=mr.right+12;else if(mr.left-12-w>=8)x=mr.left-12-w;else{x=Math.max(12,Math.min(W-w-12,r.left));}
    const beside=x>=mr.right||x+w<=mr.left;
    if(beside)y=Math.max(12,Math.min(H-h-12,r.top+r.height/2-h/2));
    else{y=r.bottom+8;if(y+h>H-12)y=Math.max(12,r.top-8-h)}
    el.style.left=Math.round(x)+"px";el.style.top=Math.round(y)+"px"},
  hide(){clearTimeout(this.t);if(this.inPane){this.inPane=false;this.anchor=null;this.key=null;return}if(this.anchor)this.anchor.removeAttribute("aria-describedby");this.anchor=null;this.key=null;this.pinned=false;if(this.el){this.el.hidden=true;this.el.classList.remove("pinned")}},
};
document.addEventListener("pointerover",ev=>{if(ev.pointerType!=="mouse")return;const a=ev.target.closest&&ev.target.closest("[data-info]");if(!a){if(ItemTip.anchor&&!ItemTip.pinned&&!(ev.target.closest&&ev.target.closest(".itemtip")))ItemTip.hide();return}
  if(ItemTip.pinned&&ItemTip.anchor!==a)ItemTip.pinned=false;
  if(ItemTip.anchor===a)return;clearTimeout(ItemTip.t);ItemTip.t=setTimeout(()=>ItemTip.show(a),ItemTip.anchor?0:140)});
document.addEventListener("pointerleave",ev=>{if(ev.target===document.documentElement&&!ItemTip.pinned)ItemTip.hide()},true);
// tap (touch) or click on the item's name pins the card; tapping again or elsewhere closes it
document.addEventListener("click",ev=>{const n=ev.target.closest&&ev.target.closest("[data-info] .t");
  if(n){const a=n.closest("[data-info]");if(ItemTip.pinned&&ItemTip.anchor===a){ItemTip.hide()}else ItemTip.show(a,true);return}
  if(ev.target.closest&&ev.target.closest("[data-ii-close]")){ItemTip.hide();return}
  if(!(ev.target.closest&&ev.target.closest(".itemtip"))&&ItemTip.pinned)ItemTip.hide()});
document.addEventListener("focusin",ev=>{const a=ev.target.closest&&ev.target.closest("[data-info]");if(a)ItemTip.show(a);else if(!ItemTip.pinned)ItemTip.hide()});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&ItemTip.anchor){ItemTip.hide();ev.stopPropagation()}},true);
window.addEventListener("resize",()=>{const a=ItemTip.anchor;if(a&&ItemTip.inPane&&!ItemTip.pane(a)){ItemTip.inPane=false;ItemTip.anchor=null;a.classList.remove("ii-on");ItemTip.show(a)}else if(a&&!ItemTip.inPane&&ItemTip.pane(a)){ItemTip.hide();ItemTip.show(a)}else ItemTip.place()});
document.addEventListener("scroll",()=>{if(ItemTip.anchor){if(!document.body.contains(ItemTip.anchor))ItemTip.hide();else ItemTip.place()}},true);
// hide when the anchor disappears (modal closed, tab changed, re-render)
new MutationObserver(()=>{if(ItemTip.anchor&&!document.body.contains(ItemTip.anchor)){const k=ItemTip.key;const again=k&&document.querySelector(`[data-info="${CSS.escape(k)}"]`);if(again&&ItemTip.el&&!ItemTip.el.hidden){ItemTip.anchor=again;ItemTip.show(again,ItemTip.pinned)}else ItemTip.hide()}}).observe(document.body,{childList:true,subtree:true});
