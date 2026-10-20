import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize @google/genai on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Server-side endpoint: POST /api/suggest-recipe
 * Takes user cravings and preferences and generates a tailored MealRecipe
 */
app.post('/api/suggest-recipe', async (req: Request, res: Response): Promise<void> => {
  const { prompt, mealType, householdSize, dietary, cuisinePreferences } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing prompt parameter' });
    return;
  }

  // If Gemini API Key is available on the server, call gemini-3.8-flash
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `
You are a senior Israeli culinary chef and nutrition consultant for an Israeli grocery and meal planning app called SalKal.
The user wants a recipe based on their prompt: "${prompt}".
Context:
- Meal Type: ${mealType || 'dinner'}
- Household diners: ${householdSize || 4}
- Dietary preference: ${dietary || 'standard'} (if non-kosher, pork, bacon, and shrimp from Tiv Taam are allowed; if kosher, strictly no pork or mixing meat and milk).
- Preferred cuisines: ${Array.isArray(cuisinePreferences) ? cuisinePreferences.join(', ') : 'any'}

Available Israeli supermarket ingredient product IDs:
- 'p-chicken-breast' (חזה עוף טרי)
- 'p-ground-beef' (בשר בקר טחון טרי)
- 'p-eggs-l' (ביצי L תבנית)
- 'p-spaghetti-osem' (ספגטי אסם)
- 'p-tomatoes' (עגבניות חממה)
- 'p-cucumbers' (מלפפונים)
- 'p-olive-oil' (שמן זית כתית מעולה)
- 'p-tomato-paste' (רסק עגבניות)
- 'p-rice-sugat' (אורז פרסי / בסמטי סוגת)
- 'p-coconut-milk' (קרם קוקוס)
- 'p-curry-powder' (תבלין קארי הודי)
- 'p-soy-sauce' (רוטב סויה)
- 'p-egg-noodles' (נודלס ביצים)
- 'p-red-lentils' (עדשים אדומות)
- 'p-tortillas-masterchef' (טורטיות מקסיקניות)
- 'p-tahini-baraka' (טחינה גולמית ברכה)
- 'p-challah-shabbat' (חלת שבת)
- 'p-milk-tnuva' (חלב תנובה 3%)
- 'p-cottage-tnuva' (קוטג׳ תנובה)
- 'p-white-cheese-strauss' (גבינה לבנה 5%)
- 'p-bacon-tivtaam' (בייקון מעושן טיב טעם - רק אם לא כשר!)
- 'p-shrimp-frozen' (שרימפס קפוא טיב טעם - רק אם לא כשר!)
- 'p-parmesan-reggiano' (פרמז׳ן רג׳יאנו איטלקי)
- 'p-cheddar-english' (גבינת צ׳דר אנגלית)
- 'p-pork-sausages' (נקניקיות פרנקפורטר טיב טעם - רק אם לא כשר!)
- 'p-turkish-coffee' (קפה טורקי עלית)
- 'p-petit-beurre' (פתי בר אסם)
- 'p-bamba-osem' (במבה אסם)

Generate a single valid JSON object representing the MealRecipe in Hebrew.
JSON schema format:
{
  "id": "meal-ai-" + timestamp,
  "titleHe": "כותרת עברית מושכת",
  "titleEn": "English Title",
  "subtitleHe": "תת-כותרת מעוררת תיאבון",
  "prepTimeMinutes": number (e.g. 15, 20, 30),
  "servings": number (matching ${householdSize || 4}),
  "yieldsMealsCount": number (1 or 2),
  "canSplitToNextDay": boolean,
  "difficultyHe": "קל" | "בינוני" | "מושקע",
  "mealType": "${mealType || 'dinner'}",
  "cuisineType": "israeli" | "italian" | "asian" | "indian" | "mediterranean" | "mexican" | "traditional" | "american",
  "categoryHe": "אמצע שבוע" | "שבת וחגים" | "ילדים" | "בוקר ובראנץ׳" | "צמחוני / בריא" | "קינוחים ומתוקים" | "מיוחדים ולא כשר",
  "estimatedCostNis": number (realistic NIS cost),
  "effortTagHe": "סיר אחד" | "פחות מ-20 דקות" | "ארוחת שבת" | "מחבת פשוטה" | "ידידותי לילדים" | "מתוק וקל",
  "isKosher": boolean,
  "descriptionHe": "תיאור קצר ומזמין של המנה",
  "ingredients": [
    { "productId": "exact_product_id_from_above", "quantity": number, "customNoteHe": "תיאור המוצר" }
  ],
  "instructionsHe": [
    "שלב 1 להכנה",
    "שלב 2 להכנה",
    "שלב 3 להכנה"
  ]
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedRecipe = JSON.parse(responseText);

      res.json({
        recipe: parsedRecipe,
        modelUsed: 'gemini-3.8-flash',
      });
      return;
    } catch (genError) {
      console.error('Error with Gemini API call on server:', genError);
      // Fall through to error response so client uses graceful fallback
      res.status(500).json({ error: 'Gemini API call failed', fallbackNeeded: true });
      return;
    }
  }

  // If no Gemini API key configured, signal client to use smart local chef
  res.status(200).json({ fallbackNeeded: true, message: 'Server ready with local chef fallback' });
});

/**
 * Server-side endpoint: POST /api/sync-store-catalog
 * Simulates / orchestrates periodic cross-reference sync with supermarket catalogs
 */
app.post('/api/sync-store-catalog', (req: Request, res: Response): void => {
  const { stores } = req.body || {};
  res.json({
    status: 'success',
    syncedAt: new Date().toISOString(),
    stores: stores || ['shufersal', 'ramilevy', 'carrefour', 'tivtaam'],
    message: 'Store internal IDs synchronized with supermarket catalog feeds',
    updates: [],
  });
});

/**
 * Server-side endpoint: POST /api/shufersal/mcp-handoff
 * Formats cart items for matipojo/shufersal-mcp and eshaham/shufersal-automation
 */
app.post('/api/shufersal/mcp-handoff', (req: Request, res: Response): void => {
  const { items } = req.body || {};
  const formattedItems = Array.isArray(items)
    ? items.map((it: any) => ({
        productCode: it.productCode || (it.barcode ? `P_${it.barcode}` : 'P_unknown'),
        quantity: it.quantity || 1,
        name: it.name || '',
      }))
    : [];

  res.json({
    mcpPayload: {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'shufersal_add_to_cart',
        arguments: {
          items: formattedItems,
        },
      },
    },
    totalItems: formattedItems.length,
  });
});


// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`SalKal Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
