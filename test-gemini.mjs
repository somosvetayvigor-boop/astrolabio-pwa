import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  try {
    const key = process.env.GEMINI_API_KEY || 'AIzaSyBO5xT-w7TI_DhVXe5B52sDt6dCXVsJiGQ';
    console.log("Using key length:", key.length);
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent("Hola");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch(e) {
    console.error("Error:", e.message || e);
  }
}
run();
