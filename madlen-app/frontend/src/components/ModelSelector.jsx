/**
 * ModelSelector Component
 * 
 * Dropdown for selecting the AI model to use for chat.
 * Includes free and paid OpenRouter models.
 */

import { ChevronDown } from 'lucide-react';

const AVAILABLE_MODELS = [
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free)', provider: 'Google' },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)', provider: 'Meta' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', provider: 'Mistral' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
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
                        {model.name} ({model.provider})
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
