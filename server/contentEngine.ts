import { invokeLLM } from "./_core/llm";

export type CaptionContext = {
  business: {
    name: string;
    market: string;
    primaryLanguage: "fr" | "ar" | "darija" | "mixed";
    tone: string;
    phone: string | null;
    whatsapp: string | null;
    orderUrl: string | null;
    orderInstructions: string | null;
  };
  contentType: "commercial" | "saisonnier" | "traditionnel" | "produit" | "offre" | "engagement";
  product?: { name: string; description: string | null; priceDzd: string | null; category: string } | null;
  offer?: { title: string; description: string | null; terms: string | null } | null;
};

export type GeneratedCaption = {
  title: string;
  caption: string;
  callToAction: string;
  hashtags: string;
  imagePrompt: string;
};

export function buildScenePrompt(input: {
  productName: string;
  productDescription?: string | null;
  direction?: string | null;
}) {
  const direction = input.direction?.trim() || "lumière chaude de fin d’après-midi, fond minéral crème, accessoires sobres en laiton brossé";
  return [
    "Create a premium editorial food-photography presentation around the supplied pastry photograph.",
    `Product: ${input.productName}${input.productDescription ? ` — ${input.productDescription}` : ""}.`,
    `Art direction: ${direction}.`,
    "NON-NEGOTIABLE PRODUCT LOCK: preserve the pastry exactly as supplied; do not alter its shape, decorations, piping, colors, texture, size, toppings, writing, edges, or proportions.",
    "Only enhance the surrounding scene: lighting, set dressing, surface, background, tasteful props, lens-like depth and professional framing.",
    "No text, no logos, no price tags, no additional pastries, no hands, no people. Refined Algerian patisserie campaign, high-end, appetizing and realistic.",
  ].join(" ");
}

export async function generateLocalizedCaption(context: CaptionContext): Promise<GeneratedCaption> {
  const orderRoute = [
    context.business.whatsapp ? `WhatsApp: ${context.business.whatsapp}` : null,
    context.business.phone ? `Téléphone: ${context.business.phone}` : null,
    context.business.orderUrl ? `Order link: ${context.business.orderUrl}` : null,
    context.business.orderInstructions,
  ].filter(Boolean).join(" | ");

  const languageRequirement = context.business.primaryLanguage === "ar"
    ? "Write every customer-facing field (title, caption, callToAction and hashtags) in clear, elegant Modern Standard Arabic. Address an Algerian, predominantly female audience with warmth and refinement. Do not use French in the post body or CTA, except for a proper brand name, a web address, or a phone number supplied in the context. Use Arabic naturally, never transliterated Arabic."
    : "Write in natural French; add a few familiar Algerian words only when helpful and never force them.";

  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: "You write concise, elegant and conversion-oriented Facebook posts for an Algerian pastry shop. Never invent prices, delivery zones, ingredients, promotions, reviews or claims. Keep every marketing statement grounded in the supplied context.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Create one varied Facebook post for the Algerian market.",
          brand: context.business,
          contentType: context.contentType,
          product: context.product,
          offer: context.offer,
          orderingInformation: orderRoute || "Invite the customer to contact the pastry shop for ordering details.",
          requirements: [
            languageRequirement,
            "The caption must be ready to publish, warm and elegant, maximum 115 words excluding hashtags.",
            "Include one clear, configurable ordering call to action.",
            "Return 4 to 8 relevant hashtags including a local Algerian context where natural.",
            "Create an English image-art-direction prompt with no text or logos.",
          ],
        }),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "facebook_pastry_caption",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            caption: { type: "string" },
            callToAction: { type: "string" },
            hashtags: { type: "string" },
            imagePrompt: { type: "string" },
          },
          required: ["title", "caption", "callToAction", "hashtags", "imagePrompt"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices[0]?.message.content;
  if (!raw || typeof raw !== "string") throw new Error("La génération de légende n’a renvoyé aucun contenu.");
  return JSON.parse(raw) as GeneratedCaption;
}
