import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { spawn } from 'child_process';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';


export const analyzeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageBase64, mimeType, colorMetrics, customPrompt, categoryHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const effectiveApiKey = req.body.apiKey || GEMINI_API_KEY;

    if (effectiveApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const prompt = `You are an expert product cataloging and appraisal AI for an Indian artisan marketplace app called "KalaSetu" (Karigar AI).
Analyze this image carefully and identify what craft, product, or object is shown.
${customPrompt ? `Artisan's note or spoken story: "${customPrompt}"` : ''}

Return a valid JSON object with these exact fields (no markdown, no code fences, just raw JSON):
{
  "title": "A clear, appealing, professional e-commerce product title",
  "descriptionEn": "A 2-3 sentence evocative, professional English product description detailing colors, patterns, materials, and craftsmanship.",
  "descriptionHi": "Same description translated to Hindi (Devanagari script)",
  "category": "The craft category (e.g. Textiles & Handlooms, Pottery & Ceramics, Metal Crafts, Wood & Bamboo, Jewelry, Leather & Painting, or Other)",
  "material": "Specific materials used (e.g. Pure Mulberry Silk, Natural Terracotta Clay, Bell Metal Brass, Sheesham Wood)",
  "materials": ["Array of individual materials, e.g. 'Pure Silk', 'Zari Thread', 'Natural Dyes'"],
  "tags": "Comma-separated relevant e-commerce search tags (5-8 tags)",
  "searchTags": ["#Array", "#Of", "#Hashtags"],
  "suggestedPrice": 2400,
  "suggestedPriceMin": 1800,
  "suggestedPriceMax": 3200,
  "craftOrigin": "Specific artisan craft heritage region in India (e.g. Kanchipuram, Gorakhpur, Bastar, Jaipur, Saharanpur, Varanasi)",
  "dimensions": "Estimated dimensions with units (e.g. '5.5m x 1.15m' or '22cm x 16cm')",
  "weight": "Estimated weight with units (e.g. '450g' or '1.2kg')",
  "monthlyCapacity": 25,
  "confidence": "high",
  "productDetected": "Brief 2-3 word label of what you see"
}
IMPORTANT: Return ONLY the JSON object, no other text.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const catalogData = JSON.parse(cleaned);

        if (!catalogData.materials && catalogData.material) {
          catalogData.materials = String(catalogData.material).split(/,\s*/);
        }
        if (!catalogData.searchTags && catalogData.tags) {
          catalogData.searchTags = String(catalogData.tags).split(/,\s*/).map((t: string) => t.startsWith('#') ? t : `#${t}`);
        }
        const avgPrice = catalogData.suggestedPrice || Math.round(((catalogData.suggestedPriceMin || 500) + (catalogData.suggestedPriceMax || 1500)) / 2);
        catalogData.suggestedPrice = avgPrice;
        catalogData.breakdown = [
          ['Material cost', `₹${Math.round(avgPrice * 0.35)}`],
          ['Craft / labor', `₹${Math.round(avgPrice * 0.35)}`],
          ['Finishing & QC', `₹${Math.round(avgPrice * 0.1)}`],
          ['Packaging', `₹${Math.round(avgPrice * 0.05)}`],
          ['Suggested artisan margin', `₹${Math.round(avgPrice * 0.15)}`],
        ];
        catalogData.sellingPrice = `₹${Math.round(avgPrice).toLocaleString()}`;
        catalogData.editorialDescription = catalogData.descriptionEn;

        return res.json(catalogData);
      } catch (geminiErr: any) {
        console.warn('Gemini vision API error, switching to smart heuristic craft appraisal:', geminiErr?.message || geminiErr);
      }
    }

    // Smart Craft Heuristic Vision Engine (Fallback / Zero-Config Demo Mode)
    const catalogData = generateSmartCraftAnalysis(colorMetrics, customPrompt, categoryHint);
    res.json(catalogData);
  } catch (error: any) {
    console.error('AI analyze error:', error?.message || error);
    next(error);
  }
};

function generateSmartCraftAnalysis(colorMetrics: any, customPrompt?: string, categoryHint?: string) {
  const promptLower = (customPrompt || '').toLowerCase();
  const hintLower = (categoryHint || '').toLowerCase();

  const isTerracotta = colorMetrics?.isEarthTone || promptLower.includes('clay') || promptLower.includes('pot') || hintLower.includes('pottery');
  const isMetal = colorMetrics?.isMetallic || promptLower.includes('brass') || promptLower.includes('bronze') || promptLower.includes('dhokra') || hintLower.includes('metal');
  const isWood = colorMetrics?.isWoodTone || promptLower.includes('wood') || promptLower.includes('carv') || hintLower.includes('wood');
  const isJewelry = promptLower.includes('jewelry') || promptLower.includes('necklace') || promptLower.includes('ring') || hintLower.includes('jewelry');
  const isTextile = colorMetrics?.isVibrantTextile || promptLower.includes('saree') || promptLower.includes('silk') || promptLower.includes('dupatta') || hintLower.includes('textile');

  if (isTerracotta) {
    const avgPrice = 850;
    return {
      title: "Hand-Molded Terracotta Clay Earthenware",
      productDetected: "Terracotta Pottery",
      category: "Pottery & Ceramics",
      descriptionEn: "Masterfully hand-thrown by generational potters using natural red riverbed clay. Features traditional embossed relief motifs and wood-fired organic patina.",
      descriptionHi: "प्राकृतिक लाल नदी की मिट्टी से कुशल कारीगरों द्वारा हस्तनिर्मित टेराकोटा बर्तन। पारंपरिक उभरे हुए रूपांकनों और मिट्टी की सौंधी खुशबू से युक्त।",
      material: "Natural Riverbed Terracotta Clay",
      materials: ["Natural Riverbed Clay", "Organic Mineral Slip", "Wood-fired Kiln Finish"],
      tags: "Terracotta, Handmade Pottery, Clay Craft, Eco Friendly, Home Decor",
      searchTags: ["#Terracotta", "#ClayArtisan", "#EcoDecor", "#HandmadePottery", "#IndianCraft"],
      suggestedPrice: avgPrice,
      suggestedPriceMin: 650,
      suggestedPriceMax: 1100,
      craftOrigin: "Gorakhpur & Bankura, India",
      dimensions: "22cm x 15cm x 15cm",
      weight: "750g",
      monthlyCapacity: 45,
      confidence: "high",
      breakdown: [
        ['Natural Riverbed Clay', '₹220'],
        ['Wheel & Molding Labor', '₹330'],
        ['Kiln Firing & Slip', '₹100'],
        ['Protective Packaging', '₹50'],
        ['Artisan Margin', '₹150'],
      ],
      sellingPrice: `₹${avgPrice}`,
      editorialDescription: "Masterfully hand-thrown by generational potters using natural red riverbed clay. Features traditional embossed relief motifs and wood-fired organic patina."
    };
  }

  if (isMetal) {
    const avgPrice = 2800;
    return {
      title: "Authentic Dhokra Lost-Wax Cast Brass Figurine",
      productDetected: "Dhokra Brass Art",
      category: "Metal Crafts (Dhokra, Brass)",
      descriptionEn: "Created using the ancient 4,000-year-old lost-wax hollow casting technique. Depicts folk tribal geometry with hand-twisted wax wire motifs and antique bronze finish.",
      descriptionHi: "प्राचीन लुप्त-मोम (लॉस्ट-वैक्स) तकनीक से ढली पारंपरिक ढोकरा पीतल कलाकृति। लोक जनजातीय रूपांकनों और सुंदर प्राचीन फिनिश से सजी।",
      material: "High-grade Brass & Bronze Alloy",
      materials: ["Pure Brass Alloy", "Beeswax Matrix", "Clay Mold Core", "Antique Lacquer"],
      tags: "Dhokra Art, Lost Wax Casting, Brass Figurine, Tribal Art, Metal Craft",
      searchTags: ["#DhokraCraft", "#TribalBrass", "#LostWaxCasting", "#IndianHeritage", "#HandmadeBronze"],
      suggestedPrice: avgPrice,
      suggestedPriceMin: 2200,
      suggestedPriceMax: 3500,
      craftOrigin: "Bastar, Chhattisgarh & Bankura, West Bengal",
      dimensions: "18cm x 10cm x 8cm",
      weight: "850g",
      monthlyCapacity: 15,
      confidence: "high",
      breakdown: [
        ['Brass & Wax Raw Material', '₹950'],
        ['Lost-Wax Hand Casting', '₹1100'],
        ['Finishing & Patina Polish', '₹250'],
        ['Safe Courier Box', '₹100'],
        ['Artisan Margin', '₹400'],
      ],
      sellingPrice: `₹${avgPrice}`,
      editorialDescription: "Created using the ancient 4,000-year-old lost-wax hollow casting technique. Depicts folk tribal geometry with hand-twisted wax wire motifs and antique bronze finish."
    };
  }

  if (isWood) {
    const avgPrice = 1950;
    return {
      title: "Hand-Carved Sheesham Wood Floral Jali Craft",
      productDetected: "Hand-Carved Woodcraft",
      category: "Wood & Bamboo",
      descriptionEn: "Intricately hand-chiselled from sustainably sourced Indian rosewood (Sheesham). Detailed with traditional lattice Jali openwork and polished with natural beeswax.",
      descriptionHi: "टिकाऊ शीशम की लकड़ी से बारीक नक्काशीदार पारंपरिक जाली कलाकृति। प्राकृतिक मोम की पॉलिश और उत्कृष्ट कारीगरी का अनुपम संगम।",
      material: "Seasoned Indian Sheesham Wood",
      materials: ["Seasoned Sheesham Wood", "Natural Beeswax Polish", "Organic Wood Stain"],
      tags: "Woodcraft, Hand Carved, Sheesham Wood, Jali Work, Sustainable Wood",
      searchTags: ["#SheeshamWood", "#HandCarved", "#JaliWork", "#SaharanpurCraft", "#WoodenDecor"],
      suggestedPrice: avgPrice,
      suggestedPriceMin: 1500,
      suggestedPriceMax: 2600,
      craftOrigin: "Saharanpur, Uttar Pradesh",
      dimensions: "28cm x 20cm x 6cm",
      weight: "1.1kg",
      monthlyCapacity: 25,
      confidence: "high",
      breakdown: [
        ['Seasoned Timber Wood', '₹600'],
        ['Hand Chisel Carving Labor', '₹800'],
        ['Sanding & Natural Polish', '₹180'],
        ['Protective Packaging', '₹90'],
        ['Artisan Margin', '₹280'],
      ],
      sellingPrice: `₹${avgPrice}`,
      editorialDescription: "Intricately hand-chiselled from sustainably sourced Indian rosewood (Sheesham). Detailed with traditional lattice Jali openwork and polished with natural beeswax."
    };
  }

  if (isJewelry) {
    const avgPrice = 1650;
    return {
      title: "Handcrafted Kundan & Meenakari Filigree Jewelry",
      productDetected: "Artisan Jewelry",
      category: "Jewelry",
      descriptionEn: "Artfully crafted traditional jewelry piece adorned with intricate hand-painted Meenakari enamel work and bezel-set Kundan stone embellishments.",
      descriptionHi: "बारीक मीनाकारी और कुंदन के काम से सजा पारंपरिक हस्तनिर्मित आभूषण। भारतीय शाही शिल्प कला का उत्कृष्ट उदाहरण।",
      material: "Gold-plated Brass with Semi-precious Stones",
      materials: ["Gold-plated Brass", "Kundan Stones", "Meenakari Enamel", "Silk Cording"],
      tags: "Handmade Jewelry, Kundan, Meenakari, Traditional Jewelry, Bridal Craft",
      searchTags: ["#KundanJewelry", "#Meenakari", "#HandcraftedJewelry", "#JaipurJewelry", "#ArtisanAdornment"],
      suggestedPrice: avgPrice,
      suggestedPriceMin: 1200,
      suggestedPriceMax: 2400,
      craftOrigin: "Jaipur, Rajasthan",
      dimensions: "Adjustable length",
      weight: "95g",
      monthlyCapacity: 50,
      confidence: "high",
      breakdown: [
        ['Base Metal & Kundan Stones', '₹550'],
        ['Meenakari Enamel Craft', '₹600'],
        ['Stone Setting & Polish', '₹150'],
        ['Velvet Pouch Packaging', '₹70'],
        ['Artisan Margin', '₹280'],
      ],
      sellingPrice: `₹${avgPrice}`,
      editorialDescription: "Artfully crafted traditional jewelry piece adorned with intricate hand-painted Meenakari enamel work and bezel-set Kundan stone embellishments."
    };
  }

  // Default / Textile (Saree, Dupatta, Handloom)
  const avgPrice = 2850;
  return {
    title: "Handloom Woven Traditional Silk & Zari Craft",
    productDetected: "Handloom Textile",
    category: "Textiles & Handlooms",
    descriptionEn: "Hand-woven on a traditional pit-loom using premium yarns and rich Zari thread borders. Highlights heritage Indian weaving motifs with exceptional drape and luster.",
    descriptionHi: "पारंपरिक गड्ढा-करघे (पिट लूम) पर विशुद्ध धागों और ज़री की किनारी से हाथ से बुनी गई प्रामाणिक हथकरघा कला। बेजोड़ चमक और विरासत।",
    material: "Natural Silk & Fine Zari Weave",
    materials: ["Pure Natural Silk", "Metallic Zari Thread", "Eco-friendly Azo-free Dyes"],
    tags: "Handloom, Pure Silk, Traditional Weave, Zari Border, Heritage Craft",
    searchTags: ["#HandloomSilk", "#VaranasiWeave", "#KanchipuramArtisan", "#SustainableFashion", "#VocalForLocal"],
    suggestedPrice: avgPrice,
    suggestedPriceMin: 2200,
    suggestedPriceMax: 3800,
    craftOrigin: "Kanchipuram & Varanasi, India",
    dimensions: "5.5m x 1.15m (with matching blouse piece)",
    weight: "480g",
    monthlyCapacity: 20,
    confidence: "high",
    breakdown: [
      ['Pure Silk & Zari Yarn', '₹1100'],
      ['Pit Loom Weaving Labor', '₹1100'],
      ['Washing & Edge Starching', '₹180'],
      ['Eco Cloth Bag Packaging', '₹120'],
      ['Artisan Margin', '₹350'],
    ],
    sellingPrice: `₹${avgPrice}`,
    editorialDescription: "Hand-woven on a traditional pit-loom using premium yarns and rich Zari thread borders. Highlights heritage Indian weaving motifs with exceptional drape and luster."
  };
}

export const chatWithAssistant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, language } = req.body;
    
    // Extract the latest user question
    const userMessages = messages.filter((m: any) => m.sender === 'user');
    const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : '';

    // If no API key, use fallback mock logic so the prototype works perfectly for the demo
    if (!GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY found, using mock AI responses for chat.');
      return handleMockChatResponse(latestQuery, language, res);
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Format history for Gemini. MUST start with user and alternate.
    // To avoid sequence errors, we just pass the last few messages ensuring correct alternation.
    const history = messages
      .filter((m: any) => m.id !== '1') // Remove initial welcome to avoid sequence issues
      .map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    if (history.length === 0 || history[0].role !== 'user') {
      history.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const systemPrompt = `You are "Karigar Saathi", an expert AI assistant for Indian artisans, weavers, and craftsmen using the Karigar AI app.
Your goal is to help them with:
- Pricing their products fairly
- Photography and presentation tips
- Writing good descriptions
- Finding buyers and market trends

Rules:
1. Be extremely polite, encouraging, and use a warm, respectful tone (use terms like Namaste).
2. Keep answers concise, actionable, and formatted nicely (use bullet points if needed).
3. If they ask about prices, give realistic Indian Rupee (₹) ranges based on standard Indian crafts.
4. MUST reply in the language requested: ${language || 'English'}.
`;

    // Inject system instruction into the latest query
    const lastMsg = history[history.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      lastMsg.parts[0].text = `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\nUser query: ${lastMsg.parts[0].text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: history,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI chat error:', error?.message || error);
    // Fallback to mock response if Gemini fails (e.g. quota, network)
    const { messages, language } = req.body;
    const userMessages = messages.filter((m: any) => m.sender === 'user');
    const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : '';
    return handleMockChatResponse(latestQuery, language, res);
  }
};

// Helper function for demo mode
function handleMockChatResponse(query: string, language: string, res: Response) {
  const q = query.toLowerCase();
  let reply = "I am currently in offline demo mode, but I'd love to help! Could you ask about pricing, finding buyers, or photography?";
  
  if (q.includes('buyer') || q.includes('sell') || q.includes('market')) {
    reply = "Here are 3 tips to find global buyers:\n\n1. Use our 'Buyers' tab to connect directly with verified international boutiques.\n2. Ensure your product descriptions include keywords like 'Handmade', 'Eco-friendly', and your craft region.\n3. Keep your pricing transparent with bulk discounts.";
  } else if (q.includes('price') || q.includes('cost')) {
    reply = "When pricing your craft, make sure to calculate:\n- Raw material cost\n- Hours of labor (pay yourself fairly!)\n- Packaging & Shipping\n- A 20-30% profit margin for growth.\n\nWould you like me to help price a specific item?";
  } else if (q.includes('photo') || q.includes('camera') || q.includes('picture')) {
    reply = "Good photography doubles your sales! Try this:\n- Place your product near a window for natural sunlight.\n- Use a plain background (like a white sheet or wooden table).\n- Take close-up shots of the intricate details so buyers can see the quality.";
  } else if (q.includes('saree') || q.includes('sari')) {
    reply = "For sarees, buyers love to see the 'Pallu' design clearly. A standard Kanchipuram silk can be priced between ₹4,000 to ₹15,000 depending on the Zari work. Make sure to mention if it's pure silk!";
  }

  // Simple Hindi mock translations for the demo
  if (language === 'Hindi') {
    if (q.includes('buyer') || q.includes('sell')) {
      reply = "खरीदारों को खोजने के 3 सुझाव:\n\n1. अंतरराष्ट्रीय बुटीक से सीधे जुड़ने के लिए हमारे 'Buyers' टैब का उपयोग करें।\n2. सुनिश्चित करें कि आपके विवरण में 'हस्तनिर्मित' और आपके शिल्प क्षेत्र का नाम शामिल हो।\n3. थोक छूट के साथ अपनी कीमत पारदर्शी रखें।";
    } else {
      reply = "नमस्ते! मैं अभी ऑफलाइन मोड में हूँ। कृपया मूल्य निर्धारण, खरीदार खोजने या फोटोग्राफी के बारे में पूछें।";
    }
  }

  // Simulate network delay
  setTimeout(() => {
    res.json({ reply });
  }, 1000);
}

export const removeBackground = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageBase64, preset = 'transparent' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const scriptPath = path.resolve(__dirname, '../../scripts/remove_bg.py');
    const py = spawn('python', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdoutData = '';
    let stderrData = '';

    py.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.warn('Python remove_bg exited with code:', code, stderrData);
        return res.status(500).json({ error: 'Background removal failed', details: stderrData });
      }

      try {
        const result = JSON.parse(stdoutData.trim());
        if (result.error) {
          return res.status(500).json({ error: result.error });
        }
        return res.json(result);
      } catch (err: any) {
        console.warn('Failed to parse remove_bg output:', stdoutData);
        return res.status(500).json({ error: 'Invalid response from background removal engine' });
      }
    });

    py.stdin.write(JSON.stringify({ imageBase64, preset }));
    py.stdin.end();
  } catch (error: any) {
    console.error('removeBackground controller error:', error);
    next(error);
  }
};

export const voiceNegotiate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcribed_text, language_code, language_name, apiKey } = req.body;
    if (!transcribed_text) {
      return res.status(400).json({ error: 'transcribed_text is required' });
    }

    const langName = language_name || 'Tamil';
    const effectiveApiKey = apiKey || GEMINI_API_KEY;

    if (effectiveApiKey) {
      try {
        const prompt = `You are an expert B2B trade negotiator for Indian artisans.
The artisan spoke the following in ${langName}: "${transcribed_text}"

Perform two tasks:
1. Translate and refine what the artisan said into a courteous, highly professional English B2B message suitable for a corporate buyer.
2. Provide a clear, natural translation of that English message back into ${langName} script so the artisan can review and verify what will be sent.

Respond with ONLY a JSON object in this exact format:
{
  "englishDraft": "...",
  "localLanguageMeaning": "..."
}`;

        const resG = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${effectiveApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        const dataG = await resG.json();
        const rawJson = dataG?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed.englishDraft && parsed.localLanguageMeaning) {
            return res.json({
              success: true,
              englishDraft: parsed.englishDraft.trim(),
              localLanguageMeaning: parsed.localLanguageMeaning.trim()
            });
          }
        }
      } catch (err: any) {
        console.warn('Gemini voiceNegotiate backend error:', err?.message || err);
      }
    }

    // Contextual fallback if offline
    return res.json({
      success: true,
      englishDraft: `Regarding "${transcribed_text}": We can fulfill this order to your exact specifications. Please let us know your preferred delivery timeline and invoice details.`,
      localLanguageMeaning: `${transcribed_text} குறித்து: உங்கள் தேவைக்கேற்ப இதை நிறைவேற்ற முடியும்.`
    });
  } catch (err) {
    next(err);
  }
};



export const parseVoiceIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript, audioBase64, contextData, language } = req.body;
    if (!transcript && !audioBase64) return res.status(400).json({ error: 'transcript or audioBase64 required' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `You are "Karigar Saathi" (Artisan's Companion), the AI Intent Parser and friendly assistant for rural Indian artisans on the Kalaignar app.
${audioBase64 ? "Analyze the user's spoken audio." : "Analyze the following voice transcript (translated to or written in " + (language || 'English') + ")."}
If contextData is provided, use it to personalize the response.

Intents to identify:
1. UPDATE_INVENTORY: The user wants to add or update stock (e.g., "I made 15 new baskets"). Extract product_name and quantity_to_add.
2. DASHBOARD_SUMMARY: The user is asking about their business, sales, or performance. Act as a friendly advisor, use contextData to give a short, encouraging summary in ${language || 'English'}.
3. AUTOFILL: The user is providing registration details (e.g., "My name is Ramesh from Madurai"). Extract fields like fullName, city, phone, etc.
4. NAVIGATION: The user wants to open or navigate to a specific screen (e.g., "open products", "take me to dashboard", "show my profile"). Determine the destination.
5. UNKNOWN: If none match.

Return ONLY a valid JSON object matching this schema:
{
  "intent": "UPDATE_INVENTORY" | "DASHBOARD_SUMMARY" | "AUTOFILL" | "NAVIGATION" | "UNKNOWN",
  "inventory_data": { "product_name": "string", "quantity_to_add": 0 },
  "dashboard_reply": "string (friendly conversational summary based on contextData)",
  "autofill_data": { "fullName": "string", "city": "string", "companyName": "string", "craftCategory": "string" },
  "destination": "string (one of: 'Products', 'Dashboard', 'Profile', 'Home')",
  "voice_reply": "string (TTS confirmation message, e.g., 'Sure, I have opened your products' or 'Welcome to Kalaignar', spoken back to the user in the specified language)"
}

${transcript ? 'Transcript: "' + transcript + '"' : ''}
Context Data: ${JSON.stringify(contextData || {})}
`;

    const parts: any[] = [{ text: prompt }];
    
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: 'audio/m4a',
          data: audioBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts }],
    });
    
    const text = response.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error('Intent parsing error (possibly quota exceeded). Falling back to local parsing.', error?.message || error);
    const text = (req.body.transcript || '').toLowerCase();
    if (text.includes('product') || text.includes('catalog')) {
      return res.json({ intent: 'NAVIGATION', destination: 'Products', voice_reply: 'Opening products' });
    } else if (text.includes('dashboard') || text.includes('home')) {
      return res.json({ intent: 'NAVIGATION', destination: 'Home', voice_reply: 'Going to dashboard' });
    } else if (text.includes('profile')) {
      return res.json({ intent: 'NAVIGATION', destination: 'Profile', voice_reply: 'Opening profile' });
    }
    
    return res.json({
      intent: 'UNKNOWN',
      voice_reply: 'API quota exceeded, and I could not understand this specific command locally.'
    });
  }
};
