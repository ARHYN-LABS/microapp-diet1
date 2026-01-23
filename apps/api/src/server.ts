import "dotenv/config"
import cors from "cors"
import express from "express"
import { PrismaClient } from "@prisma/client"
import multer from "multer"
import {
  analyzeFromParsed,
  parseExtraction,
  type NutritionParsed,
  type OCRExtraction,
  type ParsedData
} from "@wimf/shared"
import { z } from "zod"
import { createWorker } from "tesseract.js"
import rateLimit from "express-rate-limit"
import OpenAI from "openai"

class OcrError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OcrError"
  }
}

const app = express()
const prisma = new PrismaClient()
let dbAvailable = true
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }
})

const port = Number(process.env.PORT || 4000)
const openAiKey = process.env.OPENAI_API_KEY
const openAiModel = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini"
const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true
  })
)

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false
})

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

const runOcr = async (buffer: Buffer) => {
  const worker = await createWorker("eng")
  try {
    const {
      data: { text, confidence }
    } = await worker.recognize(buffer)

    return {
      text: text || "",
      confidence: typeof confidence === "number" ? confidence / 100 : 0
    }
  } catch (error) {
    console.error("OCR failure", error)
    throw new OcrError("OCR failed to read one or more images.")
  } finally {
    await worker.terminate()
  }
}

const truncateText = (value: string, maxLength = 2000) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value

const sanitizeExtracted = (payload?: {
  ingredientsText?: string
  nutritionText?: string
  frontText?: string
}) => {
  if (!payload) return undefined
  return {
    ...payload,
    ingredientsText: payload.ingredientsText
      ? truncateText(payload.ingredientsText)
      : undefined,
    nutritionText: payload.nutritionText ? truncateText(payload.nutritionText) : undefined,
    frontText: payload.frontText ? truncateText(payload.frontText) : undefined
  }
}

const extractImagesSchema = z.object({
  ingredientsImage: z.any().optional(),
  nutritionImage: z.any().optional(),
  frontImage: z.any().optional()
})

const IMAGE_CONFIDENCE_MIN = 0.45

const isParsedEmpty = (parsed: ReturnType<typeof parseExtraction>) =>
  !parsed.productName && parsed.ingredients.length === 0 && !parsed.nutrition

const withDb = async <T>(action: () => Promise<T>, context: string): Promise<T | null> => {
  if (!dbAvailable) return null
  try {
    return await action()
  } catch (error) {
    dbAvailable = false
    console.warn(`DB unavailable, skipping ${context}.`, error)
    return null
  }
}

const visionSchema = z.object({
  productName: z.string().nullable().optional(),
  ingredients: z.array(z.string()).optional(),
  nutrition: z
    .object({
      calories: z.number().nullable().optional(),
      servingSizeG: z.number().nullable().optional(),
      caloriesPer100g: z.number().nullable().optional(),
      protein_g: z.number().nullable().optional(),
      carbs_g: z.number().nullable().optional(),
      sugar_g: z.number().nullable().optional(),
      sodium_mg: z.number().nullable().optional()
    })
    .nullable()
    .optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional()
})

const toDataUrl = (buffer: Buffer, mimeType?: string) => {
  const safeType = mimeType && mimeType.includes("/") ? mimeType : "image/jpeg"
  return `data:${safeType};base64,${buffer.toString("base64")}`
}

const getResponseText = (response: any) => {
  if (typeof response?.output_text === "string") return response.output_text
  const content = response?.output?.[0]?.content
  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === "output_text")
    if (textItem?.text) return textItem.text
  }
  return ""
}

const buildVisionParsed = (payload: z.infer<typeof visionSchema>): ParsedData => {
  const ingredients = (payload.ingredients || []).map((item) => item.trim()).filter(Boolean)
  const nutrition = payload.nutrition ?? null
  const inferredName = guessDishName(payload.productName ?? null, ingredients)
  const confidence = typeof payload.confidence === "number" ? payload.confidence : 0.4
  const ingredientConfidence = ingredients.length ? Math.min(0.9, confidence) : 0.2
  const nutritionFields = nutrition
    ? Object.values(nutrition).filter((value) => value !== null && value !== undefined).length
    : 0
  const nutritionConfidence = nutritionFields
    ? Math.min(0.9, confidence * Math.min(1, nutritionFields / 6))
    : 0.2
  const nameConfidence = inferredName ? Math.min(0.85, confidence) : 0.2

  return {
    productName: inferredName,
    ingredients,
    nutrition: nutritionFields ? (nutrition as NutritionParsed) : null,
    confidences: {
      ingredientsConfidence: ingredientConfidence,
      nutritionConfidence,
      nameConfidence
    }
  }
}

const guessDishName = (productName: string | null, ingredients: string[]) => {
  const cleanedName = productName?.trim() || ""
  const lowerName = cleanedName.toLowerCase()
  const genericNames = new Set([
    "sandwich",
    "likely sandwich",
    "burger",
    "likely burger",
    "meal",
    "dish",
    "food",
    "likely food"
  ])

  const lower = ingredients.map((item) => item.toLowerCase())
  const hasRice = lower.some((item) => item.includes("rice") || item.includes("basmati"))
  const hasChicken = lower.some((item) => item.includes("chicken"))
  const hasYogurt = lower.some((item) => item.includes("yogurt"))
  const hasSpice = lower.some((item) => item.includes("spice") || item.includes("cardamom"))
  const hasBread = lower.some((item) => item.includes("bread") || item.includes("bun"))
  const hasSesame = lower.some((item) => item.includes("sesame"))
  const hasSausage = lower.some((item) => item.includes("sausage") || item.includes("salami"))
  const hasPickle = lower.some((item) => item.includes("pickle") || item.includes("jalape"))
  const hasTomato = lower.some((item) => item.includes("tomato"))

  if (hasRice && hasChicken && (hasYogurt || hasSpice)) {
    return "Likely chicken biryani"
  }
  if (hasBread && (hasSausage || hasPickle || hasTomato)) {
    return hasSesame ? "Likely sesame sausage sandwich" : "Likely sausage sandwich"
  }
  if (hasBread && hasSesame) {
    return "Likely sesame bread sandwich"
  }
  if (cleanedName && !genericNames.has(lowerName)) {
    return cleanedName
  }
  if (hasRice && hasChicken) {
    return "Likely chicken and rice dish"
  }
  if (hasRice) {
    return "Likely rice-based dish"
  }
  if (hasChicken) {
    return "Likely chicken dish"
  }

  return null
}

const runVisionEstimate = async (buffer: Buffer, mimeType?: string) => {
  if (!openai) {
    throw new OcrError("Vision AI is not configured. Upload a label or set OPENAI_API_KEY.")
  }

  const prompt = [
    "You are analyzing a food photo without a label.",
    "Return JSON only.",
    "Always provide a best-guess productName (prefix with 'Likely' if uncertain).",
    "If you cannot infer a field, return null.",
    "For ingredients, list the most likely ingredients in plain English.",
    "For nutrition, estimate per 100g if possible (calories, protein_g, carbs_g, sugar_g, sodium_mg).",
    "Include a confidence value from 0 to 1."
  ].join(" ")

  const response = await openai.responses.create({
    model: openAiModel,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_url: toDataUrl(buffer, mimeType),
            detail: "low"
          }
        ]
      }
    ],
    max_output_tokens: 300,
    text: {
      format: { type: "json_object" }
    }
  })

  const responseText = getResponseText(response)
  if (!responseText) {
    throw new OcrError("Vision AI did not return usable data.")
  }

  const payload = visionSchema.parse(JSON.parse(responseText))
  return buildVisionParsed(payload)
}

const buildVisionExtraction = (parsed: ParsedData): OCRExtraction => ({
  ingredientsText: "AI Vision estimate (no label detected).",
  nutritionText: "AI Vision estimate (no label detected).",
  frontText: parsed.productName || "AI Vision estimate (no label detected)."
})

app.post(
  "/extract",
  upload.fields([
    { name: "ingredientsImage", maxCount: 1 },
    { name: "nutritionImage", maxCount: 1 },
    { name: "frontImage", maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      const files = extractImagesSchema.parse(req.files || {})
      const ingredientsFile = files.ingredientsImage?.[0]
      const nutritionFile = files.nutritionImage?.[0]
      const frontFile = files.frontImage?.[0]

      if (!ingredientsFile && !nutritionFile && !frontFile) {
        return res.status(400).json({ error: "At least one label image is required." })
      }

      let extracted = {
        ingredientsText: "",
        nutritionText: "",
        frontText: ""
      }
      let confidence = 0

      if (ingredientsFile || nutritionFile) {
        const [ingredientsOcr, nutritionOcr, frontOcr] = await Promise.all([
          ingredientsFile ? runOcr(ingredientsFile.buffer) : Promise.resolve({ text: "", confidence: 0 }),
          nutritionFile ? runOcr(nutritionFile.buffer) : Promise.resolve({ text: "", confidence: 0 }),
          frontFile ? runOcr(frontFile.buffer) : Promise.resolve(null)
        ])
        extracted = {
          ingredientsText: ingredientsOcr.text,
          nutritionText: nutritionOcr.text,
          frontText: frontOcr?.text || ""
        }
        confidence = Math.max(ingredientsOcr.confidence, nutritionOcr.confidence, frontOcr?.confidence || 0)
      } else if (frontFile) {
        const frontOcr = await runOcr(frontFile.buffer)
        extracted = {
          ingredientsText: frontOcr.text,
          nutritionText: frontOcr.text,
          frontText: frontOcr.text
        }
        confidence = frontOcr.confidence
      }

      let parsed = parseExtraction(extracted.ingredientsText, extracted.nutritionText, extracted.frontText)
      const needsVision =
        !!frontFile &&
        (confidence < IMAGE_CONFIDENCE_MIN || isParsedEmpty(parsed))

      if (needsVision) {
        parsed = await runVisionEstimate(frontFile.buffer, frontFile.mimetype)
        extracted = buildVisionExtraction(parsed)
      } else if (confidence < IMAGE_CONFIDENCE_MIN || isParsedEmpty(parsed)) {
        throw new OcrError("Image is not clear. Upload again.")
      }

      return res.json({
        extractedText: extracted,
        parsed,
        confidences: parsed.confidences
      })
    } catch (error) {
      return next(error)
    }
  }
)

app.post(
  "/analyze-from-images",
  analyzeLimiter,
  upload.fields([
    { name: "ingredientsImage", maxCount: 1 },
    { name: "nutritionImage", maxCount: 1 },
    { name: "frontImage", maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      const files = extractImagesSchema.parse(req.files || {})
      const ingredientsFile = files.ingredientsImage?.[0]
      const nutritionFile = files.nutritionImage?.[0]
      const frontFile = files.frontImage?.[0]

      if (!ingredientsFile && !nutritionFile && !frontFile) {
        return res.status(400).json({ error: "At least one label image is required." })
      }

      let extracted = {
        ingredientsText: "",
        nutritionText: "",
        frontText: ""
      }
      let confidence = 0

      if (ingredientsFile || nutritionFile) {
        const [ingredientsOcr, nutritionOcr, frontOcr] = await Promise.all([
          ingredientsFile ? runOcr(ingredientsFile.buffer) : Promise.resolve({ text: "", confidence: 0 }),
          nutritionFile ? runOcr(nutritionFile.buffer) : Promise.resolve({ text: "", confidence: 0 }),
          frontFile ? runOcr(frontFile.buffer) : Promise.resolve(null)
        ])
        extracted = {
          ingredientsText: ingredientsOcr.text,
          nutritionText: nutritionOcr.text,
          frontText: frontOcr?.text || ""
        }
        confidence = Math.max(ingredientsOcr.confidence, nutritionOcr.confidence, frontOcr?.confidence || 0)
      } else if (frontFile) {
        const frontOcr = await runOcr(frontFile.buffer)
        extracted = {
          ingredientsText: frontOcr.text,
          nutritionText: frontOcr.text,
          frontText: frontOcr.text
        }
        confidence = frontOcr.confidence
      }

      let parsed = parseExtraction(extracted.ingredientsText, extracted.nutritionText, extracted.frontText)
      const needsVision =
        !!frontFile &&
        (confidence < IMAGE_CONFIDENCE_MIN || isParsedEmpty(parsed))

      if (needsVision) {
        parsed = await runVisionEstimate(frontFile.buffer, frontFile.mimetype)
        extracted = buildVisionExtraction(parsed)
      } else if (confidence < IMAGE_CONFIDENCE_MIN || isParsedEmpty(parsed)) {
        throw new OcrError("Image is not clear. Upload again.")
      }

      let userPrefs = undefined as any
      if (req.body.userPrefs) {
        try {
          userPrefs = JSON.parse(req.body.userPrefs)
        } catch {
          return res.status(400).json({ error: "Invalid userPrefs JSON" })
        }
      } else if (req.body.userId) {
        const prefs = await withDb(
          () => prisma.userPrefs.findUnique({ where: { userId: req.body.userId } }),
          "prefs lookup"
        )
        if (prefs) userPrefs = prefs
      }

      const analysis = analyzeFromParsed(parsed, userPrefs ?? undefined, extracted)

      return res.json({
        ...analysis,
        parsing: {
          extractedText: extracted,
          confidences: parsed.confidences
        }
      })
    } catch (error) {
      return next(error)
    }
  }
)

app.get("/history", async (req, res, next) => {
  try {
    const userId = z.string().min(1).parse(req.query.userId)

    const history = await withDb(
      () =>
        prisma.scanHistory.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" }
        }),
      "history read"
    )

    if (!history) {
      return res.json([])
    }

    const response = history.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      createdAt: entry.createdAt.toISOString(),
      productName: entry.productName,
      extractedText: entry.extractedText,
      parsedIngredients: entry.parsedIngredients,
      parsedNutrition: entry.parsedNutrition,
      analysisSnapshot: entry.analysisSnapshot
    }))

    return res.json(response)
  } catch (error) {
    return next(error)
  }
})

const createHistorySchema = z.object({
  userId: z.string().min(1),
  analysisSnapshot: z.any(),
  extractedText: z.any().optional(),
  parsedIngredients: z.array(z.string()).optional(),
  parsedNutrition: z.any().optional()
})

app.post("/history", async (req, res, next) => {
  try {
    const payload = createHistorySchema.parse(req.body)

    const created = await withDb(
      () =>
        prisma.scanHistory.create({
          data: {
            userId: payload.userId,
            productName: payload.analysisSnapshot?.productName || null,
            extractedText: sanitizeExtracted(payload.extractedText),
            parsedIngredients: payload.parsedIngredients,
            parsedNutrition: payload.parsedNutrition,
            analysisSnapshot: payload.analysisSnapshot
          }
        }),
      "history save"
    )

    if (!created) {
      return res.status(202).json({ status: "skipped", reason: "db_unavailable" })
    }

    return res.status(201).json({
      id: created.id,
      userId: created.userId,
      createdAt: created.createdAt.toISOString(),
      extractedText: created.extractedText,
      parsedIngredients: created.parsedIngredients,
      parsedNutrition: created.parsedNutrition,
      analysisSnapshot: created.analysisSnapshot
    })
  } catch (error) {
    return next(error)
  }
})

app.get("/prefs", async (req, res, next) => {
  try {
    const userId = z.string().min(1).parse(req.query.userId)
    const prefs = await withDb(
      () => prisma.userPrefs.findUnique({ where: { userId } }),
      "prefs read"
    )
    if (!prefs) {
      return res.status(503).json({ error: "Preferences unavailable" })
    }
    return res.json(prefs)
  } catch (error) {
    return next(error)
  }
})

const prefsSchema = z.object({
  userId: z.string().min(1),
  halalCheckEnabled: z.boolean(),
  lowSodiumMgLimit: z.number().nullable().optional(),
  lowSugarGlimit: z.number().nullable().optional(),
  lowCarbGlimit: z.number().nullable().optional(),
  lowCalorieLimit: z.number().nullable().optional(),
  highProteinGtarget: z.number().nullable().optional(),
  vegetarian: z.boolean().nullable().optional(),
  vegan: z.boolean().nullable().optional(),
  sensitiveStomach: z.boolean().nullable().optional()
})

app.post("/prefs", async (req, res, next) => {
  try {
    const payload = prefsSchema.parse(req.body)

    await withDb(
      () =>
        prisma.user.upsert({
          where: { id: payload.userId },
          update: {},
          create: { id: payload.userId }
        }),
      "user upsert"
    )

    const prefs = await withDb(
      () =>
        prisma.userPrefs.upsert({
          where: { userId: payload.userId },
          update: {
            halalCheckEnabled: payload.halalCheckEnabled,
            lowSodiumMgLimit: payload.lowSodiumMgLimit,
            lowSugarGlimit: payload.lowSugarGlimit,
            lowCarbGlimit: payload.lowCarbGlimit,
            lowCalorieLimit: payload.lowCalorieLimit,
            highProteinGtarget: payload.highProteinGtarget,
            vegetarian: payload.vegetarian,
            vegan: payload.vegan,
            sensitiveStomach: payload.sensitiveStomach
          },
          create: payload
        }),
      "prefs save"
    )

    if (!prefs) {
      return res.status(202).json(payload)
    }

    return res.json(prefs)
  } catch (error) {
    return next(error)
  }
})

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const errorStatus = (error as { status?: number })?.status
    const errorCode = (error as { code?: string })?.code
    const errorMessage = (error as { error?: { message?: string } })?.error?.message

    if (errorStatus === 429 || errorCode === "rate_limit_exceeded" || errorCode === "insufficient_quota") {
      return res.status(429).json({
        error:
          errorMessage ||
          "AI quota reached. Please add billing or wait for limits to reset, then try again."
      })
    }

    if ((error as { code?: string })?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Upload too large. Max 6MB per image." })
    }

    if (error instanceof OcrError) {
      return res.status(422).json({ error: error.message })
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.flatten() })
    }

    console.error(error)
    return res.status(500).json({ error: "Server error" })
  }
)

app.listen(port, () => {
  console.log(`API running on port ${port}`)
})
