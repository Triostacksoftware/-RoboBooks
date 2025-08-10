'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { itemService, Item } from '../services/itemService';

interface ItemSelectorProps {
  value: string;
  onChange: (itemId: string, item?: Item) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Search and select item...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Set selected item when value changes
  useEffect(() => {
    if (value && items.length > 0) {
      const item = items.find(i => i._id === value);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [value, items]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await itemService.getActiveItems(100);
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.error || 'Failed to load items');
      }
    } catch (err) {
      setError('Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen) {
      setIsOpen(true);
      setSearchTerm('');
      // Focus the search input after a short delay to ensure the dropdown is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    onChange(item._id, item);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedItem(null);
    onChange('', undefined);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayValue = selectedItem ? selectedItem.name : '';

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Selected Item Display / Placeholder Button */}
      <div
        onClick={handleToggle}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`${displayValue ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayValue || placeholder}
          </span>
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search items..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                Loading items...
              </div>
            ) : error ? (
              <div className="p-3 text-center text-red-500 text-sm">
                {error}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                {searchTerm ? 'No items found' : 'No items available'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelectItem(item)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.type} • {item.category || 'No category'}
                        {item.sku && ` • SKU: ${item.sku}`}
                      </div>
                    </div>
                    {item.sellingPrice && (
                      <div className="text-xs text-gray-600 font-medium">
                        ₹{item.sellingPrice}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clear Button */}
          {selectedItem && (
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
