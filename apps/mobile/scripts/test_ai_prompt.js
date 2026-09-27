const key = process.env.GEMINI_API_KEY || '';
const transcribed = 'என்னிடம் 25 தான் மீதம் உள்ளது, மீதியை அடுத்த மாதம் தருகிறேன்';
const preferredLanguage = 'Tamil';

const prompt = `You are a B2B negotiation assistant. The user said: '${transcribed}' in ${preferredLanguage}. Step 1: Create a highly professional B2B English response. Step 2: Translate that professional English response back into ${preferredLanguage} so the user understands exactly what they are sending. Return strictly as a JSON object: { "englishDraft": "...", "localLanguageMeaning": "..." }`;

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Gemini JSON Response:');
    console.log(data.candidates[0].content.parts[0].text);
  })
  .catch(console.error);
