import validGuessesJson from "@/data/five-letter-words.json";

/** Curated list of common words used as daily answers. */
export const ANSWERS: string[] = [
  "about", "above", "actor", "acute", "admit", "adopt", "adult", "after", "again", "agent",
  "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone", "along",
  "alter", "among", "anger", "angle", "angry", "ankle", "apart", "apple", "apply", "arena",
  "argue", "arise", "armor", "aroma", "array", "arrow", "aside", "asset", "audio", "audit",
  "avoid", "awake", "award", "aware", "badly", "baker", "basic", "beach", "beard", "beast",
  "began", "begin", "being", "below", "bench", "berry", "birth", "black", "blade", "blame",
  "blank", "blast", "bleak", "bless", "blind", "block", "bloom", "blues", "blunt", "blush",
  "board", "boast", "bonus", "booth", "bound", "brain", "brand", "brass", "brave", "bread",
  "break", "breed", "brick", "bride", "brief", "bring", "brisk", "broad", "broke", "brown",
  "brush", "build", "built", "bunch", "burst", "buyer", "cabin", "cable", "candy", "canoe",
  "cargo", "carry", "carve", "catch", "cause", "cease", "chain", "chair", "chalk", "charm",
  "chart", "chase", "cheap", "check", "cheek", "cheer", "chess", "chest", "chief", "child",
  "chill", "choir", "chose", "chunk", "churn", "civic", "civil", "claim", "clash", "class",
  "clean", "clear", "clerk", "click", "cliff", "climb", "cling", "cloak", "clock", "close",
  "cloth", "cloud", "clown", "coach", "coast", "color", "comet", "comic", "coral", "couch",
  "could", "count", "court", "cover", "crack", "craft", "crane", "crash", "crawl", "crazy",
  "cream", "crest", "crime", "crisp", "cross", "crowd", "crown", "crush", "curve", "cycle",
  "daily", "dairy", "dance", "dated", "dealt", "death", "debut", "decay", "delay", "dense",
  "depth", "devil", "diary", "dirty", "dodge", "doing", "donor", "doubt", "dozen", "draft",
  "drain", "drama", "drank", "drape", "drawn", "dream", "dress", "dried", "drift", "drill",
  "drink", "drive", "drove", "drown", "dwarf", "eager", "early", "earth", "eight", "elbow",
  "elder", "elect", "elite", "empty", "enemy", "enjoy", "enter", "entry", "equal", "error",
  "essay", "event", "every", "exact", "exile", "exist", "extra", "faith", "false", "fancy",
  "fatal", "fault", "feast", "fence", "ferry", "fetch", "fever", "fewer", "fiber", "field",
  "fiery", "fifth", "fifty", "fight", "final", "first", "flame", "flash", "fleet", "flesh",
  "flint", "float", "flock", "flood", "floor", "flour", "fluid", "flute", "focus", "foggy",
  "force", "forge", "forth", "forty", "forum", "found", "frame", "fraud", "fresh", "fried",
  "front", "frost", "fruit", "fully", "funny", "gauge", "ghost", "giant", "given", "glass",
  "gleam", "globe", "glove", "going", "goose", "grace", "grade", "grain", "grand", "grant",
  "grape", "grasp", "grass", "grave", "gravy", "great", "green", "greet", "grief", "grill",
  "grind", "groan", "groom", "group", "grove", "growl", "guard", "guess", "guest", "guide",
  "guilt", "habit", "handy", "happy", "harsh", "haste", "hatch", "haunt", "hazel", "heart",
  "heavy", "hedge", "hefty", "hello", "hence", "hobby", "honey", "honor", "horse", "hotel",
  "house", "human", "humid", "humor", "hurry", "ideal", "image", "imply", "index", "inner",
  "input", "intro", "irony", "issue", "ivory", "jelly", "jewel", "joint", "jolly", "judge",
  "juice", "jumbo", "kneel", "knife", "knock", "known", "label", "labor", "lance", "large",
  "laser", "latch", "later", "laugh", "layer", "learn", "lease", "leash", "least", "leave",
  "legal", "lemon", "level", "lever", "light", "limit", "linen", "liver", "llama", "local",
  "lodge", "logic", "loose", "lorry", "lower", "loyal", "lucky", "lunar", "lunch", "lying",
  "macro", "magic", "major", "maker", "maple", "march", "match", "maybe", "mayor", "meant",
  "medal", "media", "melon", "mercy", "merge", "merit", "metal", "meter", "midst", "might",
  "minor", "minus", "mixed", "model", "moist", "money", "month", "moral", "motor", "mount",
  "mouse", "mouth", "movie", "music", "naive", "naked", "nasty", "naval", "nectar", "nerve",
  "never", "newer", "newly", "night", "noble", "noise", "north", "notch", "novel", "nurse",
  "nylon", "oasis", "occur", "ocean", "offer", "often", "olive", "onion", "onset", "opera",
  "orbit", "order", "organ", "other", "otter", "ought", "ounce", "outer", "owner", "oxide",
  "ozone", "paint", "panel", "panic", "paper", "party", "pasta", "patch", "pause", "peace",
  "peach", "pearl", "pedal", "penny", "perch", "phase", "phone", "photo", "piano", "piece",
  "pilot", "pinch", "pitch", "pixel", "pizza", "place", "plaid", "plain", "plane", "plank",
  "plant", "plate", "plaza", "plead", "point", "polar", "porch", "pouch", "pound", "power",
  "press", "price", "pride", "prime", "print", "prize", "probe", "proof", "prone", "proud",
  "prove", "prune", "pulse", "punch", "pupil", "puppy", "purse", "queen", "query", "quest",
  "queue", "quick", "quiet", "quilt", "quite", "quota", "radar", "radio", "raise", "rally",
  "ranch", "range", "rapid", "ratio", "reach", "react", "ready", "realm", "rebel", "refer",
  "reign", "relax", "relay", "renew", "reply", "reset", "resin", "retro", "rhyme", "ridge",
  "rifle", "right", "rigid", "rinse", "risky", "rival", "river", "roast", "robin", "robot",
  "rocky", "roman", "rough", "round", "route", "royal", "rugby", "ruler", "rumor", "rural",
  "sadly", "salad", "salon", "sauce", "scale", "scare", "scene", "scent", "scope", "score",
  "scout", "scrap", "screw", "seize", "sense", "serve", "seven", "shade", "shaft", "shake",
  "shall", "shame", "shape", "share", "sharp", "sheep", "sheet", "shelf", "shell", "shift",
  "shine", "shirt", "shock", "shoot", "shore", "short", "shout", "shown", "shrug", "sight",
  "silly", "since", "sixth", "sixty", "skill", "skirt", "slate", "sleep", "slice", "slide",
  "slope", "small", "smart", "smell", "smile", "smoke", "snack", "snake", "sneak", "solar",
  "solid", "solve", "sorry", "sound", "south", "space", "spare", "spark", "speak", "speed",
  "spell", "spend", "spice", "spike", "spine", "spite", "split", "spoil", "spoke", "spoon",
  "sport", "spray", "squad", "stack", "staff", "stage", "stain", "stair", "stake", "stamp",
  "stand", "stare", "start", "state", "steam", "steel", "steep", "steer", "stern", "stick",
  "still", "sting", "stock", "stone", "stood", "stool", "store", "storm", "story", "stout",
  "stove", "strap", "straw", "strip", "study", "stuff", "stump", "style", "sugar", "suite",
  "sunny", "super", "surge", "sweet", "swept", "swift", "swing", "sword", "table", "taken",
  "taste", "teach", "teeth", "tempo", "tenth", "thank", "theft", "their", "theme", "there",
  "these", "thick", "thief", "thigh", "thing", "think", "third", "those", "three", "threw",
  "throw", "thumb", "tiger", "tight", "timer", "tired", "title", "toast", "today", "token",
  "torch", "total", "touch", "tough", "towel", "tower", "toxic", "trace", "track", "trade",
  "trail", "train", "trait", "treat", "trend", "trial", "tribe", "trick", "tried", "troop",
  "trout", "truly", "trunk", "trust", "truth", "tulip", "tumor", "tutor", "twice", "twist",
  "ultra", "uncle", "under", "union", "unite", "unity", "until", "upper", "upset", "urban",
  "usage", "usual", "vague", "valid", "value", "vault", "venue", "verse", "video", "vigor",
  "villa", "vinyl", "viral", "virus", "visit", "vital", "vivid", "vocal", "voice", "voter",
  "wagon", "waste", "watch", "water", "weary", "wheat", "wheel", "where", "which", "while",
  "white", "whole", "whose", "widow", "width", "witch", "woman", "world", "worry", "worse",
  "worst", "worth", "would", "wound", "wrist", "write", "wrong", "wrote", "yacht", "yield",
  "young", "youth", "zebra",
];

export type TileState = "correct" | "present" | "absent";

const VALID_GUESSES = new Set<string>(validGuessesJson as string[]);

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic daily answer — every player gets the same word each day. */
export function getDailyAnswer(dateKey: string = getTodayKey()): string {
  const days = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  return ANSWERS[days % ANSWERS.length] ?? "crane";
}

export function isValidGuess(guess: string): boolean {
  return VALID_GUESSES.has(guess.toLowerCase());
}

export function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array(5).fill("absent");
  const remaining: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      const c = answer[i];
      if (c) remaining[c] = (remaining[c] ?? 0) + 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    const g = guess[i];
    if (result[i] !== "correct" && g && (remaining[g] ?? 0) > 0) {
      result[i] = "present";
      remaining[g] = (remaining[g] ?? 1) - 1;
    }
  }
  return result;
}

export function shiftDate(dateKey: string, deltaDays: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

/** Current win streak, counting consecutive won days ending today (or yesterday). */
export function computeStreak(
  results: { puzzle_date: string; won: boolean }[],
): number {
  const wonDays = new Set(results.filter((r) => r.won).map((r) => r.puzzle_date));
  let day = getTodayKey();
  if (!wonDays.has(day)) day = shiftDate(day, -1);
  let streak = 0;
  while (wonDays.has(day)) {
    streak += 1;
    day = shiftDate(day, -1);
  }
  return streak;
}
