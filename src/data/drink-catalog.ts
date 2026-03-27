/**
 * Complete drink catalog with pricing, cost, and spirit categorization.
 * Source: cbm/generate-sample-data.js
 */

export type SpiritCategory =
  | "TEQUILA"
  | "VODKA"
  | "WHISKEY"
  | "RUM"
  | "GIN"
  | "OTHER_SPIRIT";

export type MenuGroup =
  | "Cocktails"
  | "Spirits (Neat/Rocks)"
  | "Shots"
  | "Beer - Draft"
  | "Beer - Bottle/Can"
  | "Wine"
  | "Non-Alcoholic"
  | "Frozen Cocktails"
  | "Champagne / Sparkling";

export interface DrinkItem {
  group: MenuGroup;
  spirit: SpiritCategory | null;
  price: number;
  cost: number;
  oz: number;
}

export const SPIRIT_CATEGORIES: Record<string, string> = {
  TEQUILA: "Tequila / Mezcal",
  VODKA: "Vodka",
  WHISKEY: "Whiskey / Bourbon",
  RUM: "Rum",
  GIN: "Gin",
  OTHER_SPIRIT: "Other Spirits",
};

export const MENU_GROUPS: Record<string, string> = {
  COCKTAILS: "Cocktails",
  SPIRITS: "Spirits (Neat/Rocks)",
  SHOTS: "Shots",
  BEER_DRAFT: "Beer - Draft",
  BEER_BOTTLE: "Beer - Bottle/Can",
  WINE: "Wine",
  NA_BEV: "Non-Alcoholic",
  FROZEN: "Frozen Cocktails",
  CHAMPAGNE: "Champagne / Sparkling",
};

export const DRINK_CATALOG: Record<string, DrinkItem> = {
  // === COCKTAILS ===
  "Casamigos Margarita":       { group: "Cocktails", spirit: "TEQUILA",  price: 16, cost: 3.80, oz: 2.0 },
  "Spicy Margarita":           { group: "Cocktails", spirit: "TEQUILA",  price: 17, cost: 4.20, oz: 2.0 },
  "Paloma":                    { group: "Cocktails", spirit: "TEQUILA",  price: 15, cost: 3.50, oz: 2.0 },
  "Ranch Water":               { group: "Cocktails", spirit: "TEQUILA",  price: 14, cost: 2.80, oz: 2.0 },
  "Mezcal Mule":               { group: "Cocktails", spirit: "TEQUILA",  price: 16, cost: 4.00, oz: 2.0 },
  "Oaxacan Old Fashioned":     { group: "Cocktails", spirit: "TEQUILA",  price: 18, cost: 5.20, oz: 2.0 },
  "Tito's Soda":               { group: "Cocktails", spirit: "VODKA",    price: 13, cost: 2.20, oz: 2.0 },
  "Moscow Mule":               { group: "Cocktails", spirit: "VODKA",    price: 14, cost: 3.00, oz: 2.0 },
  "Espresso Martini":          { group: "Cocktails", spirit: "VODKA",    price: 17, cost: 4.50, oz: 2.0 },
  "Vodka Red Bull":            { group: "Cocktails", spirit: "VODKA",    price: 15, cost: 3.80, oz: 2.0 },
  "Lemon Drop":                { group: "Cocktails", spirit: "VODKA",    price: 15, cost: 3.20, oz: 2.0 },
  "Cosmopolitan":              { group: "Cocktails", spirit: "VODKA",    price: 15, cost: 3.50, oz: 2.0 },
  "Dirty Martini":             { group: "Cocktails", spirit: "VODKA",    price: 16, cost: 3.40, oz: 2.5 },
  "Old Fashioned":             { group: "Cocktails", spirit: "WHISKEY",  price: 16, cost: 4.00, oz: 2.0 },
  "Whiskey Sour":              { group: "Cocktails", spirit: "WHISKEY",  price: 15, cost: 3.50, oz: 2.0 },
  "Manhattan":                 { group: "Cocktails", spirit: "WHISKEY",  price: 17, cost: 4.80, oz: 2.5 },
  "Jack & Coke":               { group: "Cocktails", spirit: "WHISKEY",  price: 12, cost: 2.40, oz: 1.5 },
  "Boulevardier":              { group: "Cocktails", spirit: "WHISKEY",  price: 16, cost: 4.20, oz: 2.0 },
  "Mint Julep":                { group: "Cocktails", spirit: "WHISKEY",  price: 15, cost: 3.60, oz: 2.0 },
  "Mojito":                    { group: "Cocktails", spirit: "RUM",      price: 14, cost: 2.80, oz: 2.0 },
  "Dark & Stormy":             { group: "Cocktails", spirit: "RUM",      price: 14, cost: 3.00, oz: 2.0 },
  "Rum Punch":                 { group: "Cocktails", spirit: "RUM",      price: 13, cost: 2.50, oz: 2.0 },
  "Pi\u00f1a Colada":          { group: "Cocktails", spirit: "RUM",      price: 15, cost: 3.50, oz: 2.0 },
  "Mai Tai":                   { group: "Cocktails", spirit: "RUM",      price: 16, cost: 4.00, oz: 2.5 },
  "Gin & Tonic":               { group: "Cocktails", spirit: "GIN",      price: 13, cost: 2.60, oz: 2.0 },
  "Negroni":                   { group: "Cocktails", spirit: "GIN",      price: 16, cost: 4.50, oz: 2.5 },
  "Aperol Spritz":             { group: "Cocktails", spirit: "OTHER_SPIRIT", price: 14, cost: 3.80, oz: 3.0 },
  "Long Island Iced Tea":      { group: "Cocktails", spirit: "OTHER_SPIRIT", price: 16, cost: 3.00, oz: 3.0 },

  // === SPIRITS NEAT/ROCKS ===
  "Casamigos Blanco":          { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 14, cost: 3.20, oz: 2.0 },
  "Casamigos Reposado":        { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 16, cost: 3.80, oz: 2.0 },
  "Don Julio 1942":            { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 38, cost: 12.00, oz: 2.0 },
  "Clase Azul Reposado":       { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 45, cost: 15.00, oz: 2.0 },
  "Patron Silver":             { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 14, cost: 3.00, oz: 2.0 },
  "Del Maguey Vida Mezcal":    { group: "Spirits (Neat/Rocks)", spirit: "TEQUILA",  price: 14, cost: 3.40, oz: 2.0 },
  "Tito's Handmade":           { group: "Spirits (Neat/Rocks)", spirit: "VODKA",    price: 12, cost: 1.80, oz: 2.0 },
  "Grey Goose":                { group: "Spirits (Neat/Rocks)", spirit: "VODKA",    price: 15, cost: 3.00, oz: 2.0 },
  "Belvedere":                 { group: "Spirits (Neat/Rocks)", spirit: "VODKA",    price: 15, cost: 3.20, oz: 2.0 },
  "Absolut":                   { group: "Spirits (Neat/Rocks)", spirit: "VODKA",    price: 11, cost: 1.60, oz: 2.0 },
  "Jameson":                   { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 12, cost: 2.40, oz: 2.0 },
  "Maker's Mark":              { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 13, cost: 2.80, oz: 2.0 },
  "Woodford Reserve":          { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 15, cost: 3.60, oz: 2.0 },
  "Macallan 12":               { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 22, cost: 6.00, oz: 2.0 },
  "Macallan 18":               { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 55, cost: 20.00, oz: 2.0 },
  "Bulleit Bourbon":           { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 13, cost: 2.60, oz: 2.0 },
  "Jack Daniel's":             { group: "Spirits (Neat/Rocks)", spirit: "WHISKEY",  price: 11, cost: 2.00, oz: 2.0 },
  "Hendrick's":                { group: "Spirits (Neat/Rocks)", spirit: "GIN",      price: 14, cost: 3.20, oz: 2.0 },
  "Bacardi Superior":          { group: "Spirits (Neat/Rocks)", spirit: "RUM",      price: 10, cost: 1.60, oz: 2.0 },
  "Flor de Ca\u00f1a 12":      { group: "Spirits (Neat/Rocks)", spirit: "RUM",      price: 14, cost: 3.00, oz: 2.0 },

  // === SHOTS ===
  "Patron Shot":               { group: "Shots", spirit: "TEQUILA",  price: 12, cost: 2.60, oz: 1.5 },
  "Casamigos Shot":            { group: "Shots", spirit: "TEQUILA",  price: 12, cost: 2.80, oz: 1.5 },
  "Don Julio Shot":            { group: "Shots", spirit: "TEQUILA",  price: 14, cost: 3.40, oz: 1.5 },
  "Fireball":                  { group: "Shots", spirit: "WHISKEY",  price: 8,  cost: 1.20, oz: 1.5 },
  "Jameson Shot":              { group: "Shots", spirit: "WHISKEY",  price: 10, cost: 2.00, oz: 1.5 },
  "Jagermeister":              { group: "Shots", spirit: "OTHER_SPIRIT", price: 8,  cost: 1.40, oz: 1.5 },
  "Rumple Minze":              { group: "Shots", spirit: "OTHER_SPIRIT", price: 9,  cost: 1.60, oz: 1.5 },
  "Vegas Bomb":                { group: "Shots", spirit: "OTHER_SPIRIT", price: 10, cost: 2.80, oz: 2.0 },
  "Lemon Drop Shot":           { group: "Shots", spirit: "VODKA",    price: 10, cost: 1.80, oz: 1.5 },
  "Kamikaze":                  { group: "Shots", spirit: "VODKA",    price: 9,  cost: 1.60, oz: 1.5 },

  // === DRAFT BEER ===
  "Modelo Especial Draft":     { group: "Beer - Draft", spirit: null, price: 8,  cost: 1.80, oz: 16 },
  "Corona Draft":              { group: "Beer - Draft", spirit: null, price: 8,  cost: 1.80, oz: 16 },
  "Stella Artois Draft":       { group: "Beer - Draft", spirit: null, price: 9,  cost: 2.20, oz: 16 },
  "Bud Light Draft":           { group: "Beer - Draft", spirit: null, price: 7,  cost: 1.20, oz: 16 },
  "Local IPA Draft":           { group: "Beer - Draft", spirit: null, price: 9,  cost: 2.40, oz: 16 },
  "Dos Equis Draft":           { group: "Beer - Draft", spirit: null, price: 8,  cost: 1.60, oz: 16 },
  "Blue Moon Draft":           { group: "Beer - Draft", spirit: null, price: 8,  cost: 1.80, oz: 16 },
  "Guinness Draft":            { group: "Beer - Draft", spirit: null, price: 9,  cost: 2.60, oz: 16 },

  // === BOTTLE/CAN BEER ===
  "Modelo Bottle":             { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.40, oz: 12 },
  "Corona Bottle":             { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.40, oz: 12 },
  "Pacifico Bottle":           { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.40, oz: 12 },
  "Dos Equis Bottle":          { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.20, oz: 12 },
  "Bud Light Bottle":          { group: "Beer - Bottle/Can", spirit: null, price: 6,  cost: 0.90, oz: 12 },
  "Michelob Ultra":            { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.10, oz: 12 },
  "White Claw":                { group: "Beer - Bottle/Can", spirit: null, price: 8,  cost: 1.60, oz: 12 },
  "Heineken Bottle":           { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.60, oz: 12 },
  "Tecate":                    { group: "Beer - Bottle/Can", spirit: null, price: 6,  cost: 1.00, oz: 12 },
  "Negra Modelo":              { group: "Beer - Bottle/Can", spirit: null, price: 7,  cost: 1.40, oz: 12 },

  // === WINE ===
  "House Cabernet":            { group: "Wine", spirit: null, price: 12, cost: 2.40, oz: 6 },
  "House Chardonnay":          { group: "Wine", spirit: null, price: 12, cost: 2.40, oz: 6 },
  "House Pinot Grigio":        { group: "Wine", spirit: null, price: 12, cost: 2.20, oz: 6 },
  "Prosecco Glass":            { group: "Wine", spirit: null, price: 14, cost: 3.00, oz: 6 },
  "Ros\u00e9 Glass":           { group: "Wine", spirit: null, price: 13, cost: 2.80, oz: 6 },
  "House Malbec":              { group: "Wine", spirit: null, price: 13, cost: 2.60, oz: 6 },

  // === CHAMPAGNE / SPARKLING ===
  "Mo\u00ebt & Chandon Bottle": { group: "Champagne / Sparkling", spirit: null, price: 180, cost: 45.00, oz: 25.4 },
  "Veuve Clicquot Bottle":     { group: "Champagne / Sparkling", spirit: null, price: 220, cost: 55.00, oz: 25.4 },
  "Dom P\u00e9rignon Bottle":  { group: "Champagne / Sparkling", spirit: null, price: 450, cost: 150.00, oz: 25.4 },
  "Prosecco Bottle":           { group: "Champagne / Sparkling", spirit: null, price: 48, cost: 12.00, oz: 25.4 },

  // === FROZEN ===
  "Frozen Margarita":          { group: "Frozen Cocktails", spirit: "TEQUILA", price: 14, cost: 2.80, oz: 2.0 },
  "Fros\u00e9":                { group: "Frozen Cocktails", spirit: "OTHER_SPIRIT", price: 14, cost: 3.20, oz: 3.0 },
  "Frozen Rum Runner":         { group: "Frozen Cocktails", spirit: "RUM", price: 14, cost: 2.60, oz: 2.0 },
  "Frozen Pi\u00f1a Colada":   { group: "Frozen Cocktails", spirit: "RUM", price: 14, cost: 2.80, oz: 2.0 },

  // === NON-ALCOHOLIC ===
  "Red Bull":                  { group: "Non-Alcoholic", spirit: null, price: 6,  cost: 2.00, oz: 8.4 },
  "Water Bottle":              { group: "Non-Alcoholic", spirit: null, price: 5,  cost: 0.50, oz: 16 },
  "Soft Drink":                { group: "Non-Alcoholic", spirit: null, price: 4,  cost: 0.30, oz: 16 },
  "Red Bull (Standalone)":     { group: "Non-Alcoholic", spirit: null, price: 7,  cost: 2.00, oz: 8.4 },
  "Liquid Death":              { group: "Non-Alcoholic", spirit: null, price: 6,  cost: 1.20, oz: 16 },
  "Athletic Brewing NA IPA":   { group: "Non-Alcoholic", spirit: null, price: 7,  cost: 2.00, oz: 12 },
};
