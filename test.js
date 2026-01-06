import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
});

const stream = await openrouter.chat.send({
    model: "nex-agi/deepseek-v3.1-nex-n1:free",
    messages: [
        {
            "role": "user",
            "content": "What is america doing in Venezuela?"
        }
    ],
    stream: true
});

for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
        process.stdout.write(content);
    }
}