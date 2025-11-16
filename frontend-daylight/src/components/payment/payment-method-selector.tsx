'use client';

import { useState } from 'react';
import { PaymentMethod, PaymentMethodGroup } from '@/types/payment.types';
import { Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface PaymentMethodSelectorProps {
  methods: PaymentMethodGroup;
  flatMethods: PaymentMethod[];
  selectedMethod: string | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  methods,
  flatMethods,
  selectedMethod,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Convert methods object to array if needed
  const groupNames = Object.keys(methods || {});

  if (groupNames.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No payment methods available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupNames.map((groupName) => {
        const groupMethods = methods[groupName];
        
        // Ensure groupMethods is an array
        if (!Array.isArray(groupMethods) || groupMethods.length === 0) {
          return null;
        }

        const isExpanded = expandedGroup === groupName;
        const hasSelectedInGroup = groupMethods.some(
          (m) => m.code === selectedMethod
        );

        return (
          <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Group Header */}
            <button
              type="button"
              onClick={() => setExpandedGroup(isExpanded ? null : groupName)}
              disabled={disabled}
              className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${hasSelectedInGroup ? 'bg-brand/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasSelectedInGroup ? 'bg-brand/20' : 'bg-gray-100'
                  }`}
                >
                  {hasSelectedInGroup ? (
                    <Check className="w-5 h-5 text-brand" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">
                      {groupMethods.length}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{groupName}</h3>
                  <p className="text-xs text-gray-600">
                    {groupMethods.length} method{groupMethods.length > 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Group Methods */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                {groupMethods.map((method) => {
                  const isSelected = method.code === selectedMethod;

                  return (
                    <button
                      key={method.code}
                      type="button"
                      onClick={() => onSelect(method)}
                      disabled={disabled}
                      className={`w-full flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                      } ${isSelected ? 'bg-white' : ''}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                          {method.iconUrl ? (
                            <Image
                              src={method.iconUrl}
                              alt={method.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="text-left flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {method.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {method.type === 'DIRECT'
                              ? 'Instant'
                              : 'Redirect to payment page'}
                          </p>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}