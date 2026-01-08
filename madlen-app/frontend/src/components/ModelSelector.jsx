/**
 * ModelSelector Component
 * 
 * Dropdown for selecting the AI model to use for chat.
 * Contains only proven stable FREE models from OpenRouter.
 */

import { ChevronDown } from 'lucide-react';

// Curated list of stable free models - removed unstable ones
const AVAILABLE_MODELS = [
    {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B',
        provider: 'Meta',
        context: '131K'
    },
    {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B',
        provider: 'Mistral',
        context: '32K'
    },
    {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        context: '1M'
    },
    {
        id: 'mistralai/mistral-small-3.1-24b-instruct:free',
        name: 'Mistral Small 24B',
        provider: 'Mistral',
        context: '128K'
    },
    {
        id: 'deepseek/deepseek-r1-0528:free',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        context: '164K'
    },
    {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B',
        provider: 'Google',
        context: '131K'
    },
    {
        id: 'google/gemma-3-12b-it:free',
        name: 'Gemma 3 12B',
        provider: 'Google',
        context: '32K'
    },
    {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen3 Coder',
        provider: 'Qwen',
        context: '262K'
    },
    {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'MiMo V2 Flash',
        provider: 'Xiaomi',
        context: '262K'
    },
];

export default function ModelSelector({ selectedModel, onSelect, disabled = false }) {
    return (
        <div className="relative">
            <select
                value={selectedModel}
                onChange={(e) => onSelect(e.target.value)}
                disabled={disabled}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
            >
                {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                    </option>
                ))}
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
        </div>
    );
}
