export type IngredientGlossaryItem = {
  name: string
  variants?: string[]
  plainEnglish: string
  purpose: string
  whoMightCare: string
  halalRisk: "plant" | "animal" | "unknown" | "haram_known"
  tags: string[]
}

export const ingredientGlossary: IngredientGlossaryItem[] = [
  {
    name: "high fructose corn syrup",
    variants: ["hfcs"],
    plainEnglish: "A sweetener made from corn.",
    purpose: "Adds sweetness and texture.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar", "ultra_processed"]
  },
  {
    name: "corn syrup",
    plainEnglish: "A syrupy sweetener from corn.",
    purpose: "Adds sweetness and moisture.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "sugar",
    variants: ["cane sugar", "brown sugar"],
    plainEnglish: "Common sweetener.",
    purpose: "Adds sweetness.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "dextrose",
    plainEnglish: "A simple sugar from corn.",
    purpose: "Sweetener and binder.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "aspartame",
    plainEnglish: "Zero-calorie sweetener.",
    purpose: "Adds sweetness without sugar.",
    whoMightCare: "People sensitive to artificial sweeteners.",
    halalRisk: "unknown",
    tags: ["ultra_processed", "artificial_sweetener", "sensitive_stomach_trigger"]
  },
  {
    name: "sucralose",
    plainEnglish: "Zero-calorie sweetener.",
    purpose: "Adds sweetness without sugar.",
    whoMightCare: "People sensitive to artificial sweeteners.",
    halalRisk: "unknown",
    tags: ["ultra_processed", "artificial_sweetener", "sensitive_stomach_trigger"]
  },
  {
    name: "acesulfame potassium",
    variants: ["acesulfame k"],
    plainEnglish: "Zero-calorie sweetener.",
    purpose: "Adds sweetness without sugar.",
    whoMightCare: "People sensitive to artificial sweeteners.",
    halalRisk: "unknown",
    tags: ["ultra_processed", "artificial_sweetener"]
  },
  {
    name: "red 40",
    variants: ["fd&c red 40", "red dye 40"],
    plainEnglish: "A synthetic food dye.",
    purpose: "Adds color.",
    whoMightCare: "People avoiding artificial dyes.",
    halalRisk: "unknown",
    tags: ["dye", "ultra_processed"]
  },
  {
    name: "yellow 5",
    variants: ["fd&c yellow 5"],
    plainEnglish: "A synthetic food dye.",
    purpose: "Adds color.",
    whoMightCare: "People avoiding artificial dyes.",
    halalRisk: "unknown",
    tags: ["dye", "ultra_processed"]
  },
  {
    name: "blue 1",
    variants: ["fd&c blue 1"],
    plainEnglish: "A synthetic food dye.",
    purpose: "Adds color.",
    whoMightCare: "People avoiding artificial dyes.",
    halalRisk: "unknown",
    tags: ["dye", "ultra_processed"]
  },
  {
    name: "caramel color",
    plainEnglish: "A coloring made by heating sugar.",
    purpose: "Adds color.",
    whoMightCare: "People avoiding added colorants.",
    halalRisk: "unknown",
    tags: ["color"]
  },
  {
    name: "natural flavors",
    variants: ["natural flavour", "natural flavor"],
    plainEnglish: "Flavoring derived from natural sources.",
    purpose: "Adds flavor.",
    whoMightCare: "People seeking transparency in ingredients.",
    halalRisk: "unknown",
    tags: ["uncertain_source"]
  },
  {
    name: "sodium benzoate",
    plainEnglish: "A preservative to prevent spoilage.",
    purpose: "Extends shelf life.",
    whoMightCare: "People sensitive to preservatives.",
    halalRisk: "unknown",
    tags: ["preservative", "ultra_processed", "sensitive_stomach_trigger"]
  },
  {
    name: "potassium sorbate",
    plainEnglish: "A preservative to prevent mold.",
    purpose: "Extends shelf life.",
    whoMightCare: "People sensitive to preservatives.",
    halalRisk: "unknown",
    tags: ["preservative", "ultra_processed"]
  },
  {
    name: "citric acid",
    plainEnglish: "A natural acid found in citrus.",
    purpose: "Adds tang and preserves.",
    whoMightCare: "People with sensitive stomach.",
    halalRisk: "plant",
    tags: ["acid", "sensitive_stomach_trigger"]
  },
  {
    name: "phosphoric acid",
    plainEnglish: "Acid used in sodas.",
    purpose: "Adds tartness.",
    whoMightCare: "People with sensitive stomach.",
    halalRisk: "unknown",
    tags: ["acid", "sensitive_stomach_trigger"]
  },
  {
    name: "carrageenan",
    plainEnglish: "A thickener from seaweed.",
    purpose: "Improves texture.",
    whoMightCare: "People with sensitive stomach.",
    halalRisk: "plant",
    tags: ["stabilizer", "sensitive_stomach_trigger", "ultra_processed"]
  },
  {
    name: "xanthan gum",
    plainEnglish: "A thickener from fermentation.",
    purpose: "Improves texture.",
    whoMightCare: "People with sensitive stomach.",
    halalRisk: "unknown",
    tags: ["stabilizer"]
  },
  {
    name: "guar gum",
    plainEnglish: "A thickener from guar beans.",
    purpose: "Improves texture.",
    whoMightCare: "People with sensitive stomach.",
    halalRisk: "plant",
    tags: ["stabilizer"]
  },
  {
    name: "cellulose gum",
    variants: ["carboxymethylcellulose"],
    plainEnglish: "Plant fiber used as a thickener.",
    purpose: "Stabilizes texture.",
    whoMightCare: "People avoiding heavy processing.",
    halalRisk: "plant",
    tags: ["stabilizer", "ultra_processed"]
  },
  {
    name: "soy lecithin",
    plainEnglish: "An emulsifier from soy.",
    purpose: "Keeps ingredients mixed.",
    whoMightCare: "People avoiding soy.",
    halalRisk: "plant",
    tags: ["emulsifier"]
  },
  {
    name: "mono- and diglycerides",
    variants: ["monoglycerides", "diglycerides"],
    plainEnglish: "Emulsifiers that can be plant or animal derived.",
    purpose: "Improves texture.",
    whoMightCare: "People seeking halal or vegan clarity.",
    halalRisk: "unknown",
    tags: ["emulsifier", "ultra_processed"]
  },
  {
    name: "hydrogenated oil",
    variants: ["partially hydrogenated"],
    plainEnglish: "Oil processed for stability.",
    purpose: "Improves shelf life.",
    whoMightCare: "People avoiding trans fats.",
    halalRisk: "unknown",
    tags: ["trans_fat", "ultra_processed"]
  },
  {
    name: "maltodextrin",
    plainEnglish: "A processed starch.",
    purpose: "Adds texture or sweetness.",
    whoMightCare: "People limiting ultra-processed additives.",
    halalRisk: "plant",
    tags: ["ultra_processed"]
  },
  {
    name: "modified food starch",
    plainEnglish: "Starch altered for stability.",
    purpose: "Improves texture.",
    whoMightCare: "People limiting ultra-processed additives.",
    halalRisk: "unknown",
    tags: ["stabilizer", "ultra_processed"]
  },
  {
    name: "gelatin",
    plainEnglish: "Protein derived from animal collagen.",
    purpose: "Provides texture and binding.",
    whoMightCare: "People who avoid animal-derived ingredients.",
    halalRisk: "animal",
    tags: ["animal_derived"]
  },
  {
    name: "carmine",
    variants: ["cochineal"],
    plainEnglish: "Red pigment derived from insects.",
    purpose: "Adds red color.",
    whoMightCare: "People avoiding animal-derived colorants.",
    halalRisk: "animal",
    tags: ["dye", "animal_derived"]
  },
  {
    name: "rennet",
    plainEnglish: "Enzyme used in cheese making.",
    purpose: "Helps milk coagulate.",
    whoMightCare: "People avoiding animal-derived enzymes.",
    halalRisk: "animal",
    tags: ["animal_derived"]
  },
  {
    name: "lard",
    plainEnglish: "Rendered pork fat.",
    purpose: "Adds flavor and texture.",
    whoMightCare: "People avoiding pork-derived ingredients.",
    halalRisk: "animal",
    tags: ["animal_derived"]
  },
  {
    name: "pork",
    plainEnglish: "Meat from pigs.",
    purpose: "Adds flavor and protein.",
    whoMightCare: "People avoiding pork-derived ingredients.",
    halalRisk: "animal",
    tags: ["animal_derived"]
  },
  {
    name: "whey",
    variants: ["whey protein"],
    plainEnglish: "Protein from milk.",
    purpose: "Adds protein.",
    whoMightCare: "People avoiding dairy.",
    halalRisk: "animal",
    tags: ["dairy", "animal_derived"]
  },
  {
    name: "casein",
    plainEnglish: "Protein from milk.",
    purpose: "Adds protein and texture.",
    whoMightCare: "People avoiding dairy.",
    halalRisk: "animal",
    tags: ["dairy", "animal_derived"]
  },
  {
    name: "milk",
    variants: ["whole milk", "skim milk"],
    plainEnglish: "Dairy ingredient.",
    purpose: "Adds creaminess.",
    whoMightCare: "People avoiding dairy.",
    halalRisk: "animal",
    tags: ["dairy", "animal_derived"]
  },
  {
    name: "egg",
    variants: ["egg whites", "egg yolk"],
    plainEnglish: "Animal-derived ingredient.",
    purpose: "Adds structure and protein.",
    whoMightCare: "People avoiding animal products.",
    halalRisk: "animal",
    tags: ["animal_derived"]
  },
  {
    name: "sodium nitrite",
    plainEnglish: "Preservative in processed meats.",
    purpose: "Prevents spoilage and color loss.",
    whoMightCare: "People limiting processed meats.",
    halalRisk: "unknown",
    tags: ["preservative", "ultra_processed"]
  },
  {
    name: "bht",
    variants: ["bha"],
    plainEnglish: "Antioxidant preservative.",
    purpose: "Prevents fats from going rancid.",
    whoMightCare: "People limiting synthetic additives.",
    halalRisk: "unknown",
    tags: ["preservative", "ultra_processed"]
  },
  {
    name: "monosodium glutamate",
    variants: ["msg"],
    plainEnglish: "Flavor enhancer.",
    purpose: "Boosts savory flavor.",
    whoMightCare: "People sensitive to flavor enhancers.",
    halalRisk: "unknown",
    tags: ["flavor_enhancer", "ultra_processed"]
  },
  {
    name: "yeast extract",
    plainEnglish: "Concentrated yeast flavoring.",
    purpose: "Adds savory flavor.",
    whoMightCare: "People sensitive to flavor enhancers.",
    halalRisk: "plant",
    tags: ["flavor_enhancer"]
  },
  {
    name: "spices",
    plainEnglish: "Blend of seasonings.",
    purpose: "Adds flavor.",
    whoMightCare: "People avoiding unspecified ingredients.",
    halalRisk: "unknown",
    tags: ["uncertain_source"]
  },
  {
    name: "enzymes",
    plainEnglish: "Proteins that help processing.",
    purpose: "Aid in food production.",
    whoMightCare: "People seeking ingredient sourcing clarity.",
    halalRisk: "unknown",
    tags: ["uncertain_source"]
  },
  {
    name: "corn starch",
    plainEnglish: "Starch from corn.",
    purpose: "Thickens and stabilizes.",
    whoMightCare: "People avoiding refined starches.",
    halalRisk: "plant",
    tags: ["stabilizer"]
  },
  {
    name: "tapioca starch",
    plainEnglish: "Starch from cassava.",
    purpose: "Thickens and binds.",
    whoMightCare: "People avoiding refined starches.",
    halalRisk: "plant",
    tags: ["stabilizer"]
  },
  {
    name: "wheat flour",
    plainEnglish: "Ground wheat.",
    purpose: "Provides structure.",
    whoMightCare: "People avoiding gluten.",
    halalRisk: "plant",
    tags: ["gluten"]
  },
  {
    name: "soy protein isolate",
    plainEnglish: "Highly concentrated soy protein.",
    purpose: "Adds protein and texture.",
    whoMightCare: "People avoiding soy.",
    halalRisk: "plant",
    tags: ["soy"]
  },
  {
    name: "palm oil",
    plainEnglish: "Oil from palm fruit.",
    purpose: "Adds fat and texture.",
    whoMightCare: "People limiting saturated fat.",
    halalRisk: "plant",
    tags: ["fat"]
  },
  {
    name: "canola oil",
    plainEnglish: "Oil from canola seeds.",
    purpose: "Adds fat and moisture.",
    whoMightCare: "People limiting processed oils.",
    halalRisk: "plant",
    tags: ["fat"]
  },
  {
    name: "sunflower oil",
    plainEnglish: "Oil from sunflower seeds.",
    purpose: "Adds fat and moisture.",
    whoMightCare: "People limiting processed oils.",
    halalRisk: "plant",
    tags: ["fat"]
  },
  {
    name: "coconut oil",
    plainEnglish: "Oil from coconuts.",
    purpose: "Adds fat and flavor.",
    whoMightCare: "People limiting saturated fat.",
    halalRisk: "plant",
    tags: ["fat"]
  },
  {
    name: "fructose",
    plainEnglish: "A simple sugar.",
    purpose: "Adds sweetness.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "glucose",
    plainEnglish: "A simple sugar.",
    purpose: "Adds sweetness.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "invert sugar",
    plainEnglish: "Liquid sweetener made from sugar.",
    purpose: "Adds sweetness and moisture.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "brown rice syrup",
    plainEnglish: "Sweetener from brown rice.",
    purpose: "Adds sweetness and texture.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "molasses",
    plainEnglish: "Thick syrup from sugar processing.",
    purpose: "Adds sweetness and flavor.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar"]
  },
  {
    name: "barley malt",
    plainEnglish: "Sweetener from barley.",
    purpose: "Adds sweetness and flavor.",
    whoMightCare: "People limiting added sugar.",
    halalRisk: "plant",
    tags: ["added_sugar", "gluten"]
  },
  {
    name: "cocoa",
    plainEnglish: "Ground cacao beans.",
    purpose: "Adds chocolate flavor.",
    whoMightCare: "People sensitive to caffeine-like compounds.",
    halalRisk: "plant",
    tags: []
  },
  {
    name: "cocoa butter",
    plainEnglish: "Fat from cacao beans.",
    purpose: "Adds texture and flavor.",
    whoMightCare: "People limiting saturated fat.",
    halalRisk: "plant",
    tags: ["fat"]
  },
  {
    name: "lecithin",
    variants: ["sunflower lecithin", "soy lecithin"],
    plainEnglish: "Emulsifier from plants.",
    purpose: "Keeps ingredients mixed.",
    whoMightCare: "People avoiding soy.",
    halalRisk: "plant",
    tags: ["emulsifier"]
  },
  {
    name: "salt",
    variants: ["sea salt", "sodium chloride"],
    plainEnglish: "Common seasoning.",
    purpose: "Adds flavor.",
    whoMightCare: "People limiting sodium.",
    halalRisk: "plant",
    tags: ["high_sodium"]
  },
  {
    name: "potassium chloride",
    plainEnglish: "Salt substitute.",
    purpose: "Adds salty flavor.",
    whoMightCare: "People monitoring potassium.",
    halalRisk: "unknown",
    tags: []
  },
  {
    name: "sodium bicarbonate",
    variants: ["baking soda"],
    plainEnglish: "Leavening agent.",
    purpose: "Helps baked goods rise.",
    whoMightCare: "People limiting sodium.",
    halalRisk: "unknown",
    tags: ["high_sodium"]
  },
  {
    name: "sodium citrate",
    plainEnglish: "Salt of citric acid.",
    purpose: "Adds tang and stability.",
    whoMightCare: "People limiting sodium.",
    halalRisk: "unknown",
    tags: ["high_sodium", "stabilizer"]
  },
  {
    name: "sorbic acid",
    plainEnglish: "Preservative to prevent mold.",
    purpose: "Extends shelf life.",
    whoMightCare: "People sensitive to preservatives.",
    halalRisk: "unknown",
    tags: ["preservative"]
  },
  {
    name: "propylene glycol",
    plainEnglish: "Moisture-retaining agent.",
    purpose: "Keeps foods moist.",
    whoMightCare: "People limiting additives.",
    halalRisk: "unknown",
    tags: ["ultra_processed"]
  },
  {
    name: "glycerin",
    variants: ["glycerol"],
    plainEnglish: "Sweet, moisture-retaining compound.",
    purpose: "Keeps foods moist.",
    whoMightCare: "People limiting additives.",
    halalRisk: "unknown",
    tags: ["ultra_processed"]
  },
  {
    name: "polysorbate 80",
    plainEnglish: "Emulsifier.",
    purpose: "Keeps ingredients mixed.",
    whoMightCare: "People limiting additives.",
    halalRisk: "unknown",
    tags: ["emulsifier", "ultra_processed"]
  },
  {
    name: "sodium phosphate",
    variants: ["disodium phosphate"],
    plainEnglish: "Salt used for stability.",
    purpose: "Improves texture and shelf life.",
    whoMightCare: "People limiting additives.",
    halalRisk: "unknown",
    tags: ["stabilizer"]
  },
  {
    name: "calcium carbonate",
    plainEnglish: "Mineral additive.",
    purpose: "Adds calcium or acts as anti-caking agent.",
    whoMightCare: "People tracking mineral intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "iron",
    variants: ["reduced iron"],
    plainEnglish: "Mineral additive.",
    purpose: "Adds iron.",
    whoMightCare: "People tracking mineral intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "niacin",
    variants: ["niacinamide"],
    plainEnglish: "Vitamin B3 additive.",
    purpose: "Fortification.",
    whoMightCare: "People tracking vitamin intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "riboflavin",
    plainEnglish: "Vitamin B2 additive.",
    purpose: "Fortification.",
    whoMightCare: "People tracking vitamin intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "thiamin",
    variants: ["thiamine mononitrate"],
    plainEnglish: "Vitamin B1 additive.",
    purpose: "Fortification.",
    whoMightCare: "People tracking vitamin intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "folic acid",
    plainEnglish: "Vitamin B9 additive.",
    purpose: "Fortification.",
    whoMightCare: "People tracking vitamin intake.",
    halalRisk: "unknown",
    tags: ["additive"]
  },
  {
    name: "sodium nitrite",
    plainEnglish: "Preservative in processed meats.",
    purpose: "Prevents spoilage and color loss.",
    whoMightCare: "People limiting processed meats.",
    halalRisk: "unknown",
    tags: ["preservative", "ultra_processed"]
  },
  {
    name: "hydrogenated soybean oil",
    variants: ["partially hydrogenated soybean oil"],
    plainEnglish: "Processed soybean oil.",
    purpose: "Improves shelf life.",
    whoMightCare: "People avoiding trans fats.",
    halalRisk: "unknown",
    tags: ["trans_fat", "ultra_processed"]
  },
  {
    name: "alcohol",
    plainEnglish: "Ethanol-based ingredient.",
    purpose: "Flavor or preservation.",
    whoMightCare: "People avoiding alcohol.",
    halalRisk: "haram_known",
    tags: ["haram_known"]
  }
]

export const findGlossaryMatch = (ingredient: string) => {
  const normalized = ingredient.toLowerCase()
  return ingredientGlossary.find((item) => {
    if (normalized.includes(item.name)) return true
    return (item.variants || []).some((variant) => normalized.includes(variant))
  })
}
