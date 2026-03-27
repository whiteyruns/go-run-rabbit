#!/usr/bin/env node
/**
 * Toast PMIX & SevenRooms Sample Data Generator
 * Generates realistic drink/alcohol sales data for all 9 CBM venues.
 *
 * Usage: node generate-sample-data.js
 * Output: data/toast-pmix.csv, data/sevenrooms-reservations.csv
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// VENUE DRINK MENUS — realistic items, prices, costs, categories
// ============================================================================

const SPIRIT_CATEGORIES = {
  TEQUILA: "Tequila / Mezcal",
  VODKA: "Vodka",
  WHISKEY: "Whiskey / Bourbon",
  RUM: "Rum",
  GIN: "Gin",
  OTHER_SPIRIT: "Other Spirits",
};

const MENU_GROUPS = {
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

// Common drink items shared across venues (with venue-specific weighting)
const DRINK_CATALOG = {
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
  "Piña Colada":               { group: "Cocktails", spirit: "RUM",      price: 15, cost: 3.50, oz: 2.0 },
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
  "Flor de Caña 12":           { group: "Spirits (Neat/Rocks)", spirit: "RUM",      price: 14, cost: 3.00, oz: 2.0 },

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
  "Rosé Glass":                { group: "Wine", spirit: null, price: 13, cost: 2.80, oz: 6 },
  "House Malbec":              { group: "Wine", spirit: null, price: 13, cost: 2.60, oz: 6 },

  // === CHAMPAGNE / SPARKLING (bottle service) ===
  "Moët & Chandon Bottle":     { group: "Champagne / Sparkling", spirit: null, price: 180, cost: 45.00, oz: 25.4 },
  "Veuve Clicquot Bottle":     { group: "Champagne / Sparkling", spirit: null, price: 220, cost: 55.00, oz: 25.4 },
  "Dom Pérignon Bottle":       { group: "Champagne / Sparkling", spirit: null, price: 450, cost: 150.00, oz: 25.4 },
  "Prosecco Bottle":           { group: "Champagne / Sparkling", spirit: null, price: 48, cost: 12.00, oz: 25.4 },

  // === FROZEN ===
  "Frozen Margarita":          { group: "Frozen Cocktails", spirit: "TEQUILA", price: 14, cost: 2.80, oz: 2.0 },
  "Frosé":                     { group: "Frozen Cocktails", spirit: "OTHER_SPIRIT", price: 14, cost: 3.20, oz: 3.0 },
  "Frozen Rum Runner":         { group: "Frozen Cocktails", spirit: "RUM", price: 14, cost: 2.60, oz: 2.0 },
  "Frozen Piña Colada":        { group: "Frozen Cocktails", spirit: "RUM", price: 14, cost: 2.80, oz: 2.0 },

  // === NON-ALCOHOLIC ===
  "Red Bull":                  { group: "Non-Alcoholic", spirit: null, price: 6,  cost: 2.00, oz: 8.4 },
  "Water Bottle":              { group: "Non-Alcoholic", spirit: null, price: 5,  cost: 0.50, oz: 16 },
  "Soft Drink":                { group: "Non-Alcoholic", spirit: null, price: 4,  cost: 0.30, oz: 16 },
  "Red Bull (Standalone)":     { group: "Non-Alcoholic", spirit: null, price: 7,  cost: 2.00, oz: 8.4 },
  "Liquid Death":              { group: "Non-Alcoholic", spirit: null, price: 6,  cost: 1.20, oz: 16 },
  "Athletic Brewing NA IPA":   { group: "Non-Alcoholic", spirit: null, price: 7,  cost: 2.00, oz: 12 },
};

// ============================================================================
// VENUE-SPECIFIC DRINK WEIGHTS (relative popularity 0-100)
// Higher = more popular at that venue
// ============================================================================
const VENUE_DRINK_PROFILES = {
  "commonwealth": {
    // Cocktail bar / Nightclub — broad mix, cocktail-forward
    weights: {
      "Casamigos Margarita": 65, "Spicy Margarita": 50, "Paloma": 30, "Ranch Water": 35,
      "Tito's Soda": 80, "Moscow Mule": 45, "Espresso Martini": 70, "Vodka Red Bull": 60,
      "Lemon Drop": 35, "Cosmopolitan": 25, "Dirty Martini": 20,
      "Old Fashioned": 55, "Whiskey Sour": 40, "Manhattan": 25, "Jack & Coke": 50,
      "Mojito": 30, "Dark & Stormy": 15, "Rum Punch": 20,
      "Gin & Tonic": 35, "Negroni": 20, "Aperol Spritz": 40,
      "Long Island Iced Tea": 30,
      "Patron Shot": 40, "Casamigos Shot": 35, "Fireball": 45, "Jameson Shot": 35,
      "Jagermeister": 30, "Vegas Bomb": 25, "Lemon Drop Shot": 20,
      "Modelo Especial Draft": 70, "Corona Draft": 50, "Stella Artois Draft": 35,
      "Bud Light Draft": 60, "Local IPA Draft": 25, "Blue Moon Draft": 20,
      "Modelo Bottle": 40, "Corona Bottle": 35, "Bud Light Bottle": 30,
      "White Claw": 35, "Heineken Bottle": 20,
      "House Cabernet": 20, "House Chardonnay": 25, "Prosecco Glass": 30, "Rosé Glass": 20,
      "Moët & Chandon Bottle": 8, "Veuve Clicquot Bottle": 5, "Prosecco Bottle": 12,
      "Red Bull": 40, "Water Bottle": 30, "Soft Drink": 25,
    },
    weeklyTraffic: 3500,
    avgDrinksPerGuest: 3.2,
    peakDays: { Fri: 1.6, Sat: 1.8, Thu: 1.2, Sun: 0.9, Mon: 0.5, Tue: 0.6, Wed: 0.7 },
  },

  "laundry-room": {
    // Speakeasy — premium spirits, craft cocktails, whiskey-heavy
    weights: {
      "Old Fashioned": 90, "Manhattan": 75, "Boulevardier": 50, "Whiskey Sour": 45,
      "Negroni": 60, "Espresso Martini": 55, "Dirty Martini": 40,
      "Aperol Spritz": 30, "Cosmopolitan": 25,
      "Oaxacan Old Fashioned": 35, "Paloma": 20,
      "Macallan 12": 70, "Macallan 18": 30, "Woodford Reserve": 50,
      "Maker's Mark": 35, "Bulleit Bourbon": 25,
      "Hendrick's": 30, "Grey Goose": 25, "Belvedere": 20,
      "Don Julio 1942": 25, "Clase Azul Reposado": 15, "Casamigos Reposado": 20,
      "Del Maguey Vida Mezcal": 15,
      "Flor de Caña 12": 10,
      "House Cabernet": 30, "House Chardonnay": 20, "Prosecco Glass": 25,
      "Veuve Clicquot Bottle": 8, "Dom Pérignon Bottle": 3,
      "Water Bottle": 15,
    },
    weeklyTraffic: 200,
    avgDrinksPerGuest: 2.8,
    peakDays: { Fri: 1.5, Sat: 1.6, Thu: 1.3, Sun: 0.6, Mon: 0.0, Tue: 0.0, Wed: 0.8 },
  },

  "we-all-scream": {
    // Nightclub / Ice Creamery — highest volume, simple drinks, vodka-heavy
    weights: {
      "Tito's Soda": 95, "Vodka Red Bull": 90, "Moscow Mule": 50, "Lemon Drop": 40,
      "Espresso Martini": 45, "Dirty Martini": 15,
      "Casamigos Margarita": 55, "Spicy Margarita": 40, "Ranch Water": 45,
      "Jack & Coke": 65, "Fireball": 70, "Jameson Shot": 50,
      "Patron Shot": 55, "Casamigos Shot": 45, "Vegas Bomb": 40,
      "Jagermeister": 50, "Rumple Minze": 25, "Kamikaze": 20, "Lemon Drop Shot": 30,
      "Long Island Iced Tea": 50,
      "Mojito": 25, "Rum Punch": 30,
      "Modelo Especial Draft": 85, "Corona Draft": 65, "Bud Light Draft": 80,
      "Dos Equis Draft": 40, "Blue Moon Draft": 25,
      "Modelo Bottle": 70, "Corona Bottle": 60, "Bud Light Bottle": 65,
      "Pacifico Bottle": 35, "White Claw": 55, "Michelob Ultra": 30,
      "Frozen Margarita": 35, "Frosé": 25,
      "Red Bull": 60, "Red Bull (Standalone)": 30, "Water Bottle": 50, "Liquid Death": 20,
      "Moët & Chandon Bottle": 12, "Veuve Clicquot Bottle": 8, "Dom Pérignon Bottle": 4,
    },
    weeklyTraffic: 5500,
    avgDrinksPerGuest: 3.5,
    peakDays: { Fri: 1.7, Sat: 2.0, Thu: 1.3, Sun: 0.8, Mon: 0.3, Tue: 0.4, Wed: 0.5 },
  },

  "discopussy": {
    // House/Techno Nightclub — vodka/energy dominant, EDM crowd
    weights: {
      "Vodka Red Bull": 95, "Tito's Soda": 80, "Moscow Mule": 35,
      "Espresso Martini": 40, "Lemon Drop": 30,
      "Casamigos Margarita": 40, "Spicy Margarita": 30, "Ranch Water": 25,
      "Jack & Coke": 55, "Fireball": 65, "Jameson Shot": 40,
      "Patron Shot": 45, "Casamigos Shot": 35, "Vegas Bomb": 50,
      "Jagermeister": 55, "Rumple Minze": 30, "Kamikaze": 25, "Lemon Drop Shot": 25,
      "Long Island Iced Tea": 40,
      "Modelo Especial Draft": 60, "Corona Draft": 45, "Bud Light Draft": 70,
      "Modelo Bottle": 50, "Corona Bottle": 40, "Bud Light Bottle": 55,
      "White Claw": 45, "Michelob Ultra": 20,
      "Red Bull": 70, "Red Bull (Standalone)": 35, "Water Bottle": 45, "Liquid Death": 25,
      "Moët & Chandon Bottle": 10, "Veuve Clicquot Bottle": 6,
    },
    weeklyTraffic: 3000,
    avgDrinksPerGuest: 3.8,
    peakDays: { Fri: 1.6, Sat: 1.9, Thu: 1.4, Sun: 0.7, Mon: 0.0, Tue: 0.4, Wed: 0.5 },
  },

  "lucky-day": {
    // Tequila & Mezcal Bar — agave spirits dominant
    weights: {
      "Casamigos Margarita": 90, "Spicy Margarita": 85, "Paloma": 70, "Ranch Water": 60,
      "Mezcal Mule": 55, "Oaxacan Old Fashioned": 45, "Frozen Margarita": 50,
      "Casamigos Blanco": 65, "Casamigos Reposado": 50, "Don Julio 1942": 40,
      "Clase Azul Reposado": 35, "Patron Silver": 55, "Del Maguey Vida Mezcal": 45,
      "Patron Shot": 70, "Casamigos Shot": 65, "Don Julio Shot": 50,
      "Tito's Soda": 20, "Moscow Mule": 15,
      "Old Fashioned": 15, "Jack & Coke": 20, "Fireball": 15,
      "Modelo Especial Draft": 35, "Corona Draft": 30, "Dos Equis Draft": 40,
      "Modelo Bottle": 30, "Corona Bottle": 25, "Pacifico Bottle": 35,
      "Dos Equis Bottle": 30, "Tecate": 25, "Negra Modelo": 20,
      "House Malbec": 10, "Prosecco Glass": 10,
      "Water Bottle": 20, "Soft Drink": 15,
    },
    weeklyTraffic: 1400,
    avgDrinksPerGuest: 3.0,
    peakDays: { Fri: 1.5, Sat: 1.7, Thu: 1.2, Sun: 0.9, Mon: 0.6, Tue: 0.7, Wed: 0.8 },
  },

  "park-on-fremont": {
    // Restaurant & Bar — beer-forward, casual, food-paired
    weights: {
      "Casamigos Margarita": 40, "Spicy Margarita": 30, "Paloma": 25, "Ranch Water": 30,
      "Tito's Soda": 35, "Moscow Mule": 25,
      "Old Fashioned": 25, "Whiskey Sour": 20, "Jack & Coke": 35,
      "Mojito": 20, "Dark & Stormy": 15,
      "Gin & Tonic": 20, "Aperol Spritz": 25,
      "Fireball": 20, "Jameson Shot": 15,
      "Modelo Especial Draft": 80, "Corona Draft": 60, "Stella Artois Draft": 30,
      "Bud Light Draft": 65, "Local IPA Draft": 35, "Blue Moon Draft": 30,
      "Dos Equis Draft": 25, "Guinness Draft": 15,
      "Modelo Bottle": 50, "Corona Bottle": 45, "Pacifico Bottle": 30,
      "Bud Light Bottle": 40, "Michelob Ultra": 25, "Heineken Bottle": 20,
      "White Claw": 30,
      "House Cabernet": 30, "House Chardonnay": 35, "House Pinot Grigio": 25,
      "Prosecco Glass": 20, "Rosé Glass": 20, "House Malbec": 15,
      "Prosecco Bottle": 8,
      "Water Bottle": 25, "Soft Drink": 35,
    },
    weeklyTraffic: 2200,
    avgDrinksPerGuest: 2.4,
    peakDays: { Fri: 1.4, Sat: 1.5, Thu: 1.1, Sun: 1.2, Mon: 0.7, Tue: 0.8, Wed: 0.9 },
  },

  "cheapshot": {
    // Variety Showroom & Bar — show-oriented, beer/cocktails
    weights: {
      "Tito's Soda": 40, "Moscow Mule": 25, "Vodka Red Bull": 30,
      "Casamigos Margarita": 30, "Ranch Water": 20,
      "Old Fashioned": 30, "Jack & Coke": 45, "Whiskey Sour": 25,
      "Fireball": 40, "Jameson Shot": 35, "Patron Shot": 20, "Vegas Bomb": 25,
      "Jagermeister": 25, "Lemon Drop Shot": 15,
      "Modelo Especial Draft": 55, "Corona Draft": 40, "Bud Light Draft": 60,
      "Local IPA Draft": 20, "Blue Moon Draft": 15,
      "Modelo Bottle": 40, "Corona Bottle": 30, "Bud Light Bottle": 50,
      "White Claw": 25,
      "House Cabernet": 10, "House Chardonnay": 12,
      "Water Bottle": 20, "Soft Drink": 25, "Red Bull (Standalone)": 10,
    },
    weeklyTraffic: 900,
    avgDrinksPerGuest: 2.8,
    peakDays: { Fri: 1.5, Sat: 1.6, Thu: 1.3, Sun: 0.5, Mon: 0.0, Tue: 0.5, Wed: 0.8 },
  },

  "la-mona-rosa": {
    // Mexican Restaurant & Bar — tequila and Mexican beer dominant
    weights: {
      "Casamigos Margarita": 90, "Spicy Margarita": 80, "Paloma": 65, "Ranch Water": 50,
      "Mezcal Mule": 35, "Oaxacan Old Fashioned": 25, "Frozen Margarita": 60,
      "Casamigos Blanco": 40, "Casamigos Reposado": 30, "Don Julio 1942": 20,
      "Patron Silver": 35, "Del Maguey Vida Mezcal": 25,
      "Patron Shot": 55, "Casamigos Shot": 50, "Don Julio Shot": 35,
      "Tito's Soda": 20, "Moscow Mule": 10,
      "Old Fashioned": 10, "Jack & Coke": 15,
      "Mojito": 25, "Dark & Stormy": 10,
      "Modelo Especial Draft": 75, "Corona Draft": 55, "Dos Equis Draft": 50,
      "Modelo Bottle": 60, "Corona Bottle": 50, "Pacifico Bottle": 45,
      "Dos Equis Bottle": 40, "Tecate": 35, "Negra Modelo": 30,
      "House Malbec": 15, "House Cabernet": 10,
      "Prosecco Glass": 10,
      "Water Bottle": 20, "Soft Drink": 30,
      "Frozen Piña Colada": 15,
    },
    weeklyTraffic: 1800,
    avgDrinksPerGuest: 2.6,
    peakDays: { Fri: 1.4, Sat: 1.6, Thu: 1.1, Sun: 1.1, Mon: 0.7, Tue: 0.8, Wed: 0.9 },
  },

  "doberman": {
    // Social Club / Cocktail Bar — premium, whiskey/gin forward, arts district vibe
    weights: {
      "Old Fashioned": 85, "Manhattan": 65, "Boulevardier": 50, "Mint Julep": 25,
      "Negroni": 60, "Gin & Tonic": 45, "Aperol Spritz": 35,
      "Espresso Martini": 50, "Dirty Martini": 35, "Cosmopolitan": 20,
      "Whiskey Sour": 40,
      "Paloma": 25, "Oaxacan Old Fashioned": 30, "Mezcal Mule": 20,
      "Macallan 12": 55, "Macallan 18": 20, "Woodford Reserve": 45,
      "Maker's Mark": 30, "Bulleit Bourbon": 25, "Jameson": 15,
      "Hendrick's": 35, "Grey Goose": 20, "Belvedere": 15,
      "Casamigos Reposado": 15, "Del Maguey Vida Mezcal": 20,
      "Flor de Caña 12": 15,
      "Stella Artois Draft": 20, "Local IPA Draft": 25, "Guinness Draft": 15,
      "Heineken Bottle": 10,
      "House Cabernet": 30, "House Chardonnay": 25, "House Pinot Grigio": 20,
      "Prosecco Glass": 25, "Rosé Glass": 20,
      "Veuve Clicquot Bottle": 5, "Prosecco Bottle": 8,
      "Water Bottle": 15, "Athletic Brewing NA IPA": 10,
    },
    weeklyTraffic: 800,
    avgDrinksPerGuest: 2.5,
    peakDays: { Fri: 1.5, Sat: 1.6, Thu: 1.3, Sun: 0.7, Mon: 0.0, Tue: 0.6, Wed: 0.9 },
  },
};

// ============================================================================
// DATA GENERATION ENGINE
// ============================================================================

function randomVariance(base, pct = 0.15) {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct));
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

// Vegas tentpole traffic multipliers by week
function getTentpoleMultiplier(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();

  // CES week (Jan 6-9)
  if (month === 0 && day >= 5 && day <= 10) return 2.8;
  // Super Bowl weekend (early Feb)
  if (month === 1 && day >= 7 && day <= 12) return 2.5;
  // March Madness / St. Patrick's
  if (month === 2 && day >= 14 && day <= 19) return 1.8;
  // NFL Draft / Block Party (early Apr)
  if (month === 3 && day >= 1 && day <= 6) return 2.2;
  // EDC (mid-May)
  if (month === 4 && day >= 15 && day <= 19) return 3.0;
  // 4th of July / UFC
  if (month === 6 && day >= 1 && day <= 6) return 2.2;
  // Life is Beautiful (mid-Sep)
  if (month === 8 && day >= 18 && day <= 22) return 2.0;
  // Halloween
  if (month === 9 && day >= 28 && day <= 31) return 1.8;
  // F1 (mid-Nov)
  if (month === 10 && day >= 18 && day <= 23) return 3.5;
  // NYE / Holiday (last 2 weeks of Dec)
  if (month === 11 && day >= 20) return 3.0;
  // NYE itself
  if (month === 11 && day === 31) return 5.0;

  return 1.0;
}

function generateToastPMIX(startDate, endDate) {
  const rows = [];
  const headers = [
    "Location", "Business Date", "Revenue Center", "Menu Group", "Menu Item",
    "Spirit Category", "Qty Sold", "Gross Sales", "Item Cost", "Net Sales",
    "Void Qty", "Void Amount", "Comp Qty", "Comp Amount", "Avg Price",
  ];
  rows.push(headers.join(","));

  const venues = Object.entries(VENUE_DRINK_PROFILES);
  const current = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const dayName = getDayOfWeek(dateStr);
    const tentpoleMultiplier = getTentpoleMultiplier(dateStr);

    for (const [venueId, profile] of venues) {
      const dayMultiplier = profile.peakDays[dayName] || 0.5;

      // Skip closed days (multiplier = 0)
      if (dayMultiplier === 0) continue;

      const dailyTraffic = Math.round(
        (profile.weeklyTraffic / 7) * dayMultiplier * tentpoleMultiplier
      );
      const totalDrinks = Math.round(dailyTraffic * profile.avgDrinksPerGuest);

      // Calculate total weight for this venue
      const totalWeight = Object.values(profile.weights).reduce((s, w) => s + w, 0);

      // Generate sales for each drink item
      for (const [drinkName, weight] of Object.entries(profile.weights)) {
        const drink = DRINK_CATALOG[drinkName];
        if (!drink) continue;

        // Calculate qty based on weight proportion
        const baseProportion = weight / totalWeight;
        const baseQty = totalDrinks * baseProportion;
        const qty = Math.max(0, randomVariance(baseQty, 0.20));

        if (qty === 0) continue;

        const grossSales = +(qty * drink.price).toFixed(2);
        const itemCost = +(qty * drink.cost).toFixed(2);

        // Random voids (~1.5%) and comps (~2%)
        const voidQty = Math.random() < 0.015 ? Math.ceil(qty * 0.02) : 0;
        const voidAmount = +(voidQty * drink.price).toFixed(2);
        const compQty = Math.random() < 0.02 ? Math.ceil(qty * 0.03) : 0;
        const compAmount = +(compQty * drink.price).toFixed(2);
        const netSales = +(grossSales - voidAmount - compAmount).toFixed(2);

        const venueName = venueId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const spiritCat = drink.spirit
          ? SPIRIT_CATEGORIES[drink.spirit] || drink.spirit
          : drink.group.startsWith("Beer") ? "Beer"
          : drink.group === "Wine" ? "Wine"
          : drink.group === "Champagne / Sparkling" ? "Champagne"
          : drink.group === "Non-Alcoholic" ? "Non-Alcoholic"
          : drink.group === "Frozen Cocktails" && drink.spirit ? SPIRIT_CATEGORIES[drink.spirit]
          : "Other";

        // CSV-safe: quote fields that might contain commas
        const row = [
          `"${venueName}"`,
          dateStr,
          "Bar",
          `"${drink.group}"`,
          `"${drinkName}"`,
          `"${spiritCat}"`,
          qty,
          grossSales,
          itemCost,
          netSales,
          voidQty,
          voidAmount,
          compQty,
          compAmount,
          drink.price,
        ];
        rows.push(row.join(","));
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return rows.join("\n");
}

// ============================================================================
// SEVENROOMS RESERVATION DATA
// ============================================================================

function generateSevenRoomsData(startDate, endDate) {
  const rows = [];
  const headers = [
    "Venue", "Date", "Time", "Party Size", "Status", "Source",
    "Guest Name", "Visit Count", "Lifetime Spend", "Tags",
    "Wait Time (min)", "No Show",
  ];
  rows.push(headers.join(","));

  // Only venues with reservations (not all are reservation-based)
  const reservationVenues = [
    { name: "The Laundry Room", avgPerDay: 8, avgParty: 2.5, premiumPct: 0.8, waitTime: 0 },
    { name: "Commonwealth", avgPerDay: 15, avgParty: 4.0, premiumPct: 0.3, waitTime: 15 },
    { name: "Park On Fremont", avgPerDay: 25, avgParty: 3.5, premiumPct: 0.15, waitTime: 20 },
    { name: "La Mona Rosa", avgPerDay: 20, avgParty: 3.8, premiumPct: 0.2, waitTime: 18 },
    { name: "Doberman Drawing Room", avgPerDay: 12, avgParty: 3.0, premiumPct: 0.5, waitTime: 5 },
    { name: "We All Scream", avgPerDay: 10, avgParty: 5.0, premiumPct: 0.25, waitTime: 25 },
    { name: "Discopussy", avgPerDay: 8, avgParty: 4.5, premiumPct: 0.2, waitTime: 20 },
  ];

  const sources = ["SevenRooms", "Google", "Walk-in", "Phone", "Instagram", "Concierge"];
  const tags = [
    "VIP", "Regular", "First Timer", "Birthday", "Bachelor/ette", "Date Night",
    "Corporate", "Tourist", "Local", "Industry", "High Roller", "Influencer",
  ];

  const firstNames = [
    "James", "Maria", "David", "Sarah", "Michael", "Jessica", "Robert", "Ashley",
    "Carlos", "Jennifer", "Marcus", "Amanda", "Tyler", "Nicole", "Brandon", "Samantha",
    "Derek", "Stephanie", "Chase", "Megan", "Ryan", "Rachel", "Kevin", "Lauren",
    "Travis", "Brittany", "Jordan", "Alexis", "Austin", "Kayla", "Jake", "Vanessa",
  ];
  const lastNames = [
    "Smith", "Johnson", "Martinez", "Davis", "Rodriguez", "Wilson", "Anderson", "Thomas",
    "Garcia", "Brown", "Lee", "Harris", "Clark", "Lewis", "Robinson", "Walker",
    "Hall", "Young", "Allen", "King", "Wright", "Hill", "Scott", "Green",
    "Baker", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips",
  ];

  const timeSlots = [
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
  ];

  const current = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const dayName = getDayOfWeek(dateStr);
    const tentMult = getTentpoleMultiplier(dateStr);

    const dayMults = { Sun: 0.7, Mon: 0.4, Tue: 0.5, Wed: 0.6, Thu: 0.9, Fri: 1.4, Sat: 1.5 };
    const dayMult = dayMults[dayName] || 0.5;

    for (const venue of reservationVenues) {
      const resCount = Math.max(0, randomVariance(
        venue.avgPerDay * dayMult * tentMult, 0.25
      ));

      for (let i = 0; i < resCount; i++) {
        const partySize = Math.max(1, randomVariance(venue.avgParty, 0.4));
        const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const visitCount = Math.random() < 0.3 ? randomVariance(8, 0.5) : randomVariance(2, 0.5);
        const lifetimeSpend = Math.round(visitCount * partySize * (venue.premiumPct > 0.4 ? 180 : 95) * (0.7 + Math.random() * 0.6));

        const noShow = Math.random() < 0.08;
        const status = noShow ? "No Show" : (Math.random() < 0.92 ? "Completed" : "Cancelled");
        const waitTime = source === "Walk-in" ? randomVariance(venue.waitTime, 0.5) : 0;

        // Assign 1-2 tags
        const guestTags = [];
        if (visitCount > 5) guestTags.push("Regular");
        else if (visitCount <= 1) guestTags.push("First Timer");
        if (lifetimeSpend > 2000) guestTags.push("VIP");
        if (Math.random() < 0.15) guestTags.push(tags[Math.floor(Math.random() * tags.length)]);

        const row = [
          `"${venue.name}"`,
          dateStr,
          time,
          partySize,
          status,
          source,
          `"${firstName} ${lastName}"`,
          Math.max(1, visitCount),
          lifetimeSpend,
          `"${guestTags.join("; ")}"`,
          waitTime,
          noShow ? "Yes" : "No",
        ];
        rows.push(row.join(","));
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return rows.join("\n");
}

// ============================================================================
// MAIN — Generate 6 months of data (Oct 2025 - Mar 2026)
// ============================================================================

const START_DATE = "2025-10-01";
const END_DATE = "2026-03-26";

console.log("Generating Toast PMIX data...");
const pmixCSV = generateToastPMIX(START_DATE, END_DATE);
fs.writeFileSync(path.join(__dirname, "data", "toast-pmix.csv"), pmixCSV);
const pmixLines = pmixCSV.split("\n").length - 1;
console.log(`  → ${pmixLines.toLocaleString()} rows written to data/toast-pmix.csv`);

console.log("Generating SevenRooms reservation data...");
const srCSV = generateSevenRoomsData(START_DATE, END_DATE);
fs.writeFileSync(path.join(__dirname, "data", "sevenrooms-reservations.csv"), srCSV);
const srLines = srCSV.split("\n").length - 1;
console.log(`  → ${srLines.toLocaleString()} rows written to data/sevenrooms-reservations.csv`);

console.log("\nDone! Sample data covers", START_DATE, "to", END_DATE);
console.log("Venues:", Object.keys(VENUE_DRINK_PROFILES).length);
console.log("Drink catalog:", Object.keys(DRINK_CATALOG).length, "items");
