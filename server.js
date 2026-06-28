const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
async function generateWithRetry(prompt) {
    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            return result;

        } catch (error) {

            // Quota exceeded - don't retry
            if (error.status === 429) {
                throw new Error(
                    "🚫 Daily Gemini API quota exceeded. Please try again later."
                );
            }

            // Retry only for temporary server issues
            const isRetryable =
                error.status === 503 ||
                error.message?.includes("UNAVAILABLE");

            if (isRetryable && attempt < MAX_RETRIES) {
                console.log(`Retry ${attempt}/${MAX_RETRIES}...`);

                await new Promise(resolve =>
                    setTimeout(resolve, 5000 * attempt + Math.random() * 2000)
                );

                continue;
            }

            // After all retries fail
            if (error.status === 503) {
                throw new Error(
                    "🚀 Gemini is currently experiencing high demand. Please try again in a minute."
                );
            }

            throw error;
        }
    }
}
app.post("/plan", async (req, res) => {
  try {
    const { task } = req.body;

    const result = await generateWithRetry(`
You are Deadline Hero, an expert AI productivity coach.

The student has entered:

${task}

Generate the answer in EXACTLY this format:

# 🎯 PRIORITY MATRIX

🟥 HIGH PRIORITY
(List urgent and important tasks)

🟨 MEDIUM PRIORITY
(List important but less urgent tasks)

🟩 LOW PRIORITY
(List tasks that can be done later)

IMPORTANT:
Every task MUST be placed in exactly one category.
Do NOT skip any task.
# ⏰ TIME PLAN
(Create a realistic schedule with time slots.)

# 📚 STUDY TIPS
(Give 3 practical tips.)

# 💪 MOTIVATION
(Write 2-3 motivating sentences.)

# ⭐ PRODUCTIVITY SCORE
(Give a score out of 100 with one-line reasoning.)

Keep the response clear, structured and attractive.
    `);

    const reply =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.text?.() ||
        "No response generated";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
    reply: error.message || "⚠️ Something went wrong. Please try again."
});
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});