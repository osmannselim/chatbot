/**
 * ModelSelector Component
 * 
 * Dropdown for selecting the AI model to use for chat.
 * Models list auto-generated from OpenRouter API on 2026-01-08.
 * All models verified as FREE (pricing.prompt = 0).
 */

import { ChevronDown } from 'lucide-react';

// Verified free models from OpenRouter API - prioritized by reliability
const AVAILABLE_MODELS = [
    // Top picks - most reliable
    {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B Instruct',
        provider: 'Meta',
        context: '131K'
    },
    {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B Instruct',
        provider: 'Mistral',
        context: '32K'
    },
    {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash Exp',
        provider: 'Google',
        context: '1M'
    },
    // Strong performers
    {
        id: 'meta-llama/llama-3.1-405b-instruct:free',
        name: 'Llama 3.1 405B Instruct',
        provider: 'Meta',
        context: '131K'
    },
    {
        id: 'mistralai/mistral-small-3.1-24b-instruct:free',
        name: 'Mistral Small 3.1 24B',
        provider: 'Mistral',
        context: '128K'
    },
    {
        id: 'deepseek/deepseek-r1-0528:free',
        name: 'DeepSeek R1 0528',
        provider: 'DeepSeek',
        context: '164K'
    },
    // Google Gemma family
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
    // Qwen models
    {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen3 Coder 480B A35B',
        provider: 'Qwen',
        context: '262K'
    },
    {
        id: 'qwen/qwen-2.5-vl-7b-instruct:free',
        name: 'Qwen2.5-VL 7B Instruct',
        provider: 'Qwen',
        context: '32K'
    },
    // NVIDIA models
    {
        id: 'nvidia/nemotron-nano-9b-v2:free',
        name: 'Nemotron Nano 9B V2',
        provider: 'NVIDIA',
        context: '128K'
    },
    // Additional options
    {
        id: 'nousresearch/hermes-3-llama-3.1-405b:free',
        name: 'Hermes 3 405B Instruct',
        provider: 'Nous',
        context: '131K'
    },
    {
        id: 'moonshotai/kimi-k2:free',
        name: 'Kimi K2',
        provider: 'Moonshot',
        context: '32K'
    },
    {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'MiMo-V2-Flash',
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
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
            >
                {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name} ({model.provider}) [{model.context}]
                    </option>
                ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
        </div>
    );
}
