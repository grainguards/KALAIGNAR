const fs = require('fs');
const file = 'C:/Users/indir/Downloads/Kalaignar/KalaSetu-App/apps/api/src/controllers/aiController.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `export const parseVoiceIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript, audioBase64, contextData, language } = req.body;
    if (!transcript && !audioBase64) return res.status(400).json({ error: 'transcript or audioBase64 required' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = \`You are "Karigar Saathi" (Artisan's Companion), the AI Intent Parser and friendly assistant for rural Indian artisans on the Kalaignar app.
\${audioBase64 ? "Analyze the user's spoken audio." : "Analyze the following voice transcript (translated to or written in " + (language || 'English') + ")."}
If contextData is provided, use it to personalize the response.

Intents to identify:
1. UPDATE_INVENTORY: The user wants to add or update stock (e.g., "I made 15 new baskets"). Extract product_name and quantity_to_add.
2. DASHBOARD_SUMMARY: The user is asking about their business, sales, or performance. Act as a friendly advisor, use contextData to give a short, encouraging summary in \${language || 'English'}.
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

\${transcript ? 'Transcript: "' + transcript + '"' : ''}
Context Data: \${JSON.stringify(contextData || {})}
\`;

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
    const cleaned = text.replace(/\`\`\`json\\n?/g, '').replace(/\`\`\`\\n?/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error('Intent parsing error:', error);
    next(error);
  }
};`;

content = content.replace(/export const parseVoiceIntent = async \([\s\S]*?\}\s*catch \(error: any\) \{[\s\S]*?next\(error\);\s*\}\s*\};/, replacement.trim());
fs.writeFileSync(file, content);
