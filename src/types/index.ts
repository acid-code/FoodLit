export type SupermarketPlatform =
  | 'self-point'      // Carrefour, Victory, Machsanei HaShuk, Keshet Teamim, Tiv Taam
  | 'nuxt-quickbuy'   // Rami Levy
  | 'sap-hybris'      // Shufersal, Super-Pharm
  | 'in-store'        // Osher Ad
  | 'wolt-only';      // Am:Pm, Wolt partners

export type StoreId =
  | 'carrefour'
  | 'victory'
  | 'ramilevy'
  | 'machsaneihashuk'
  | 'shufersal'
  | 'keshet'
  | 'tivtaam'
  | 'osherad'
  | 'ampm'
  | 'yochananof';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert';

export type CuisineType =
  | 'israeli'       // ישראלי
  | 'italian'       // איטלקי
  | 'asian'         // אסייתי
  | 'indian'        // הודי
  | 'mediterranean' // ים תיכוני
  | 'mexican'       // מקסיקני
  | 'traditional'   // מסורתי / שבת
  | 'american';     // אמריקאי

export interface Product {
  id: string;
  barcode: string; // standard Israeli EAN-13
  carrefourCode?: string; // Carrefour online internal catalog SKU
  carrefourBarcode?: string; // Carrefour verified packaged barcode
  carrefourSearchQuery?: string; // exact search string for Carrefour online
  nameHe: string;
  nameEn: string;
  brandHe: string;
  brandEn: string;
  category: 'dairy' | 'produce' | 'pantry' | 'meat' | 'bakery' | 'beverages' | 'snacks' | 'seafood';
  unit: string;
  basePrice: number; // reference avg price in NIS
  prices: Partial<Record<StoreId, number>>;
  isRegulated?: boolean; // מחיר מפוקח ממשלתי
  isMehadrin?: boolean;
  isKosher?: boolean; // false for non-kosher items e.g. bacon, shrimp (Tiv Taam)
  aisle: string; // for Osher Ad / in-store aisle sorting
  alternativeId?: string; // smart substitute product id
  alternativeReasonHe?: string;
  iconName: string;
  isWeighedOrButcher?: boolean; // true for fresh loose produce and fresh butcher counter items requiring scale/branch weighting
  isCarrefourVerifiedPackaged?: boolean; // true for 100% verified EAN-13 packaged products guaranteed recognized in Carrefour online
}

export interface Store {
  id: StoreId;
  nameHe: string;
  nameEn: string;
  platform: SupermarketPlatform;
  domain: string;
  accentColor: string;
  confidence: 'high' | 'medium' | 'low';
  requiresLogin: boolean;
  handoffMethodHe: string;
  handoffMethodEn: string;
  woltPartner?: boolean;
  isNonKosherSpecialist?: boolean; // e.g. Tiv Taam, Keshet Teamim
  notesHe: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type KitchenAppliance =
  | 'stovetop'      // כיריים גז / אינדוקציה
  | 'oven'          // תנור אפייה
  | 'airfryer'      // אייר-פרייר / נינג׳ה
  | 'blender'       // בלנדר / מעבד מזון
  | 'toaster-oven'  // טוסטר אובן
  | 'microwave'     // מיקרוגל
  | 'instant-pot'   // סיר לחץ חשמלי / בישול איטי
  | 'grill-pan'     // מחבת פסים / גריל
  | 'panini-press'  // טוסטר לחיצה
  | 'sous-vide'     // סו-וויד
  | 'food-processor'; // מעבד מזון

export interface MealRecipe {
  id: string;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  prepTimeMinutes: number;
  servings: number;
  yieldsMealsCount?: number; // e.g. 2 = makes enough for 2 meals (e.g. dinner + next day lunch)
  canSplitToNextDay?: boolean; // whether recipe is suitable for multi-day leftovers
  difficultyHe: 'קל' | 'בינוני' | 'מושקע';
  mealType: MealType;
  cuisineType: CuisineType;
  categoryHe: 'שבת וחגים' | 'אמצע שבוע' | 'ילדים' | 'בוקר ובראנץ׳' | 'צמחוני / בריא' | 'קינוחים ומתוקים' | 'מיוחדים ולא כשר';
  estimatedCostNis: number;
  effortTagHe: 'סיר אחד' | 'פחות מ-20 דקות' | 'ארוחת שבת' | 'מחבת פשוטה' | 'ידידותי לילדים' | 'מתוק וקל';
  isKosher?: boolean; // false for authentic non-kosher dishes (e.g. Carbonara, Butter Garlic Shrimp, Bacon Burger)
  isAiGenerated?: boolean; // created by AI Model from user input
  aiPrompt?: string; // original user prompt/craving
  descriptionHe: string;
  appliancesRequired?: KitchenAppliance[]; // appliances needed to make this recipe
  proteinGrams?: number; // estimated protein grams per serving
  isHighProtein?: boolean; // >= 25g protein
  flavorProfile?: 'savory' | 'sweet'; // savory or sweet
  healthLevel?: 'everyday' | 'light-fit' | 'high-protein' | 'comfort';
  ingredients: {
    productId: string;
    quantity: number;
    customNoteHe?: string;
  }[];
  instructionsHe: string[];
}

export interface SplitBasketOptimization {
  store1: Store;
  items1: CartItem[];
  subtotal1: number;
  store2: Store;
  items2: CartItem[];
  subtotal2: number;
  combinedTotal: number;
  singleBestStore: Store;
  singleBestTotal: number;
  savingsNis: number;
  savingsPercentage: number;
}

export type CulinaryStyle =
  | 'quick-20'       // פחות מ-20 דקות
  | 'one-pot'        // סיר אחד
  | 'kids-friendly'  // ידידותי לילדים
  | 'israeli-home'   // בישול ביתי ישראלי
  | 'healthy-med'    // ים תיכוני ובריא
  | 'batch-cooking'  // בישול מראש לכמה ימים
  | 'shabbat-festive'; // מסורתי לשבת

export interface PantryItemCheck {
  product: Product;
  recipeNeeded: number;
  alreadyHave: number; // increment in 0.5s (0, 0.5, 1, 1.5, etc.)
  toBuy: number; // Math.max(0, recipeNeeded - alreadyHave)
}

export interface UserPreferences {
  householdSize: number; // 1 to 10 diners
  budgetMin: number; // in NIS e.g. 250
  budgetMax: number; // in NIS e.g. 800
  weeklyBudget: number; // in NIS = budgetMax
  dietary: 'standard' | 'kosher-mehadrin' | 'vegetarian' | 'healthy-budget' | 'non-kosher';
  culinaryPreferences: string[]; // e.g. ['quick-20', 'one-pot', 'batch-cooking']
  cuisinePreferences: CuisineType[]; // e.g. ['israeli', 'indian', 'asian', 'italian']
  kitchenAppliances?: KitchenAppliance[]; // Neat Eat style interactive appliances selector
  highProteinFocus?: boolean; // user wants high protein meals
  targetProteinPerMeal?: { breakfast?: number; lunch?: number; dinner?: number };
  hasProteinPowder?: boolean; // user has protein powder at home
  proteinSweetPreference?: 'both' | 'savory-only'; // sweet protein treats vs savory only
  enableBatchCooking?: boolean; // split meals to different days
  selectedMealTypes?: MealType[]; // ['breakfast', 'lunch', 'dinner', 'dessert']
  selectedMealsByDay: Record<string, MealType[]>; // dayId ('sun'..'sat') -> MealType[]
  preferredStoreId?: StoreId; // chosen at the end when the list is done!
}

export interface DayMealSlot {
  dayId: string;
  dayNameHe: string;
  dayShortHe: string;
  dateStr?: string;
  meals: {
    type: MealType;
    labelHe: string;
    recipe: MealRecipe;
    isLeftover?: boolean; // cooked on an earlier day
    cookedOnDayId?: string;
  }[];
}

export interface SwapMealSelection {
  dayId: string;
  mealType: MealType;
  recipeTitle: string;
}

export interface StoreProductMapping {
  productId: string;
  barcode: string; // EAN-13
  storeId: StoreId;
  storeInternalId: string; // e.g. P_7290004131074 for Shufersal, 245890 for Rami Levy, 4131074 for Carrefour
  storeInternalSku?: string;
  storeProductNameHe?: string;
  isDirectInjectSupported: boolean;
  unitType?: 'unit' | 'kg' | 'pack';
  lastVerified: string; // ISO date string
  syncSource: 'catalog-sync' | 'official-api' | 'community-verified' | 'inferred';
}

export interface StoreSyncResult {
  storeId: StoreId;
  storeNameHe: string;
  syncedAt: string;
  totalProductsCount: number;
  mappedCount: number;
  newlyDiscoveredCount: number;
  directInjectSupported: boolean;
  automationSupport: {
    bookmarklet: boolean;
    mcp: boolean;
    directUrl: boolean;
    apiPayload: boolean;
  };
}

