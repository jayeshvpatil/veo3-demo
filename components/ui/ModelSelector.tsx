import React from "react";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
}) => {
  const models = [
    "veo-2.0-generate-001", // More stable, might have better quota availability
    "veo-3.0-fast-generate-preview", // Fast model
    "veo-3.0-generate-preview",
  ];

  const formatModelName = (model: string) => {
    if (model.includes("veo-2.0")) return "Veo 2 (Recommended)";
    if (model.includes("veo-3.0-fast")) return "Veo 3 - Fast";
    if (model.includes("veo-3.0")) return "Veo 3 - Standard";
    return model;
  };

  return (
    <div className="relative flex items-center">
      <select
        aria-label="Model selector"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="pl-3 pr-8 py-2 text-sm rounded-md border  focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {formatModelName(model)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default ModelSelector;
