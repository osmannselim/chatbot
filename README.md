# OpenRouter Test

This project tests the OpenRouter SDK for AI chat completions.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**
   - Get your API key from [OpenRouter](https://openrouter.ai/keys)
   - Open the `.env` file
   - Add your API key:
     ```
     OPENROUTER_API_KEY=your_actual_api_key_here
     ```

## Running the Test

Once you've added your API key to the `.env` file, run:

```bash
node test.js
```

The script will stream a response from the DeepSeek model to answer "What is the meaning of life?"

## What the Script Does

- Uses the OpenRouter SDK to connect to the DeepSeek V3.1 model
- Sends a chat message asking about the meaning of life
- Streams the response in real-time to the console
