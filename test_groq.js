import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  try {
    const TAGGING_SCHEMA = {
      type: "object",
      properties: {
        category: { type: "string", enum: ["top", "bottom", "outerwear", "shoes", "accessory"] },
        color_primary: { type: "string" },
        color_secondary: { type: "string" },
        pattern: { type: "string", enum: ["solid", "striped", "printed", "checked", "other"] },
        fit: { type: "string", enum: ["fitted", "regular", "oversized"] },
        formality: { type: "integer" },
        material: { type: "string" },
        season: { type: "string", enum: ["summer", "winter", "all-season"] },
      },
      required: ["category", "color_primary", "pattern", "fit", "formality", "season"],
    };

    // Use a random image URL for testing
    const imageUrl = "https://images.unsplash.com/photo-1596755094514-f87e32f85f26?auto=format&fit=crop&w=400&q=80"; // A shirt
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    console.log("Sending request to Groq...");
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this clothing item photo and return ONLY valid JSON matching this schema exactly: " + JSON.stringify(TAGGING_SCHEMA) },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });
    console.log("Response:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
