import React from 'react';
import { Target, Rocket, Heart } from 'lucide-react';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target':
        return <Target className="w-8 h-8" strokeWidth={1.5} />;
      case 'rocket':
        return <Rocket className="w-8 h-8" strokeWidth={1.5} />;
      case 'heart':
        return <Heart className="w-8 h-8" strokeWidth={1.5} />;
      default:
        return <Target className="w-8 h-8" strokeWidth={1.5} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'text-blue-600 bg-blue-50';
      case 'business':
        return 'text-green-600 bg-green-50';
      case 'relationship':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="group cursor-pointer">
      <div 
        className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
        onClick={() => onSelect(template)}
      >
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg mb-4 ${getCategoryColor(template.category)}`}>
          {getIcon(template.icon)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {template.description}
        </p>

        {/* Use Template Button */}
        <button 
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium text-sm transition-colors hover:bg-gray-800 active:bg-gray-900"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template);
          }}
        >
          Use Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;