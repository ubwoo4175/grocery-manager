'use client'

import React, { useState } from 'react';
import { Quantity, AggregatedIngredients } from '../lib/types';
import { upsertFridge, getUserFridge } from '@/lib/actions/recipe.actions';

// --- TYPE DEFINITIONS ---
interface FridgeItemDisplay {
    id: string; // Use ingredient ID as stable key
    name: string;
    quantity: number | string;
    unit: string;
}

type EditableField = 'quantity' | 'unit'; // Name is now the key, not editable via this

// --- ICONS ---
const RefrigeratorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mr-2">
        <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z"></path><path d="M5 10h14"></path><path d="M8 14v2"></path>
    </svg>
);

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-5 w-5">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${className}`}>
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const RightArrowIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mx-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

interface FridgeProps {
    items: { [ingredientId: string]: Quantity };
    setItems: React.Dispatch<React.SetStateAction<{ [ingredientId: string]: Quantity }>>;
    aggregatedUsage: AggregatedIngredients;
}

const Fridge: React.FC<FridgeProps> = ({ items, setItems, aggregatedUsage }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');
    
    // State to track the specific field being edited
    const [editingField, setEditingField] = useState<{ id: string; field: EditableField } | null>(null); // Changed id to string
    const [editingValue, setEditingValue] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() && newItemQty.trim() && newItemUnit.trim()) {
            const normalizedName = newItemName.trim().toLowerCase().replace(/ /g, '_');
            const newQuantity = parseFloat(newItemQty);
            const newUnit = newItemUnit.trim().toLowerCase();

            setItems(prevItems => ({
                ...prevItems,
                [normalizedName]: {
                    ...(prevItems[normalizedName] || {}),
                    [newUnit]: newQuantity
                }
            }));
            setNewItemName('');
            setNewItemQty('');
            setNewItemUnit('');
        }
    };

    const handleDeleteItem = (ingIdToDelete: string) => {
        setItems(prevItems => {
            const newItems = { ...prevItems };
            delete newItems[ingIdToDelete];
            return newItems;
        });
    };
    
    const handleStartEdit = (ingId: string, unit: string, field: EditableField, value: string) => {
        setEditingField({ id: ingId, field });
        setEditingValue(value);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditingValue('');
    };

    const handleSaveEdit = () => {
        if (!editingField) return;
        
        const { id: editingIngId, field: editingFieldType } = editingField;
        setItems(prevItems => {
            const newItems = { ...prevItems };
            const currentIngredient = newItems[editingIngId];

            if (currentIngredient) {
                if (editingFieldType === 'quantity') {
                    // Assuming we are editing the first unit found or a specific one
                    const unitKey = Object.keys(currentIngredient)[0]; // Simplistic: takes first unit
                    if (unitKey) {
                        currentIngredient[unitKey] = parseFloat(editingValue) || 0;
                    }
                } else if (editingFieldType === 'unit') {
                    // This is more complex, might require re-structuring the ingredient if the unit changes
                    // For now, let's assume direct replacement for simplicity or flag as an area for more robust handling
                    const oldUnitKey = Object.keys(currentIngredient)[0];
                    if (oldUnitKey && oldUnitKey !== editingValue) {
                        const oldQuantity = currentIngredient[oldUnitKey];
                        delete currentIngredient[oldUnitKey];
                        currentIngredient[editingValue.trim().toLowerCase()] = oldQuantity;
                    }
                }
                newItems[editingIngId] = { ...currentIngredient }; // Ensure immutability for React
            }
            return newItems;
        });

        handleCancelEdit();
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-24">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 flex items-center">
                <RefrigeratorIcon />
                My Fridge
            </h2>
            
            {/* Headers for quantity columns */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5 text-sm font-medium text-gray-600 pl-3">Ingredient</div>
                <div className="col-span-3 text-sm font-medium text-gray-600 pl-3">Amount left</div>
                <div className="col-span-2 text-sm font-medium text-gray-600 pl-3">You need</div>
                <div className="col-span-2"></div> {/* Empty column for delete button alignment */}
            </div>
            
            {/* Item List */}
            <ul className="grid grid-cols-12 gap-2 space-y-1 mb-4">
                {Object.entries(items).map(([ingId, quantityMap]) => {
                    const itemName = ingId.replace(/_/g, ' ');
                    const [unit, quantity] = Object.entries(quantityMap)[0]; // Assuming one unit per ingredient for simplicity

                    // Find usage for this item (case-insensitive match)
                    const usageEntry = aggregatedUsage![ingId];
                    let usedQty: number | string | null = null;
                    let usedUnit = '';

                    if (usageEntry) {
                        const unitMatch = Object.entries(usageEntry).find(([u]) => u.toLowerCase() === unit.toLowerCase());
                        if (unitMatch) {
                            usedQty = unitMatch[1];
                            usedUnit = unitMatch[0];
                        }
                    }
                    
                    const remaining = typeof quantity === 'number' && typeof usedQty === 'number' ? quantity - usedQty : quantity;

                    return (
                        <li key={ingId} className="col-span-12 grid grid-cols-12 gap-2 items-center p-1 rounded-md hover:bg-gray-50 group">
                            {/* Name Field - Not directly editable here as it's the key */}
                            <div className="col-span-5">
                                <span className="block w-full px-3 py-2 text-gray-600">{itemName}</span>
                            </div>  
                            {/* Quantity and Unit Fields (Amount Left) */}
                            <div className="col-span-3">
                                {editingField?.id === ingId && editingField?.field === 'quantity' ? (
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={handleEditKeyDown}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors" onClick={() => handleStartEdit(ingId, unit, 'quantity', String(quantity))}>{quantity} {unit}</span>
                                )}
                            </div>
                            {/* You Need Field */}
                            <div className="col-span-3">
                                <span className={`block w-full px-3 py-2 rounded-md ${typeof remaining === 'number' && remaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                    {usedQty !== null && usedUnit ? `${usedQty} ${usedUnit}` : ''}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-end pr-2">
                                <button onClick={() => handleDeleteItem(ingId)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity">
                                        <TrashIcon />
                                </button>
                            </div>

                        </li>
                    );
                })}
            </ul>
            
             {Object.keys(items).length === 0 && (
                <p className="text-gray-500 text-center py-4">Your fridge is empty. Add an item below.</p>
            )}

            {/* Add Item Form */}
            <div className="mt-4 pt-4 border-t">
                 <h3 className="font-semibold text-lg mb-2">Add New Item</h3>
                 <form onSubmit={handleAddItem} className="grid grid-cols-12 gap-2">
                     <input 
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Ingredient Name"
                        className="col-span-12 md:col-span-5 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                     />
                     <input 
                        type="text" // Changed to text to allow non-numeric input for quantity if needed
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        placeholder="Qty"
                        className="col-span-4 md:col-span-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                     />
                     <input 
                        type="text"
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        placeholder="Unit"
                        className="col-span-8 md:col-span-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                     />
                     <button type="submit" className="col-span-12 md:col-span-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                         <PlusIcon />
                     </button>
                 </form>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end">
                <button 
                    type="button"
                    onClick={async () => {
                        try {
                            await upsertFridge({ ingredients: items });
                            alert('Fridge contents saved successfully!');
                        } catch (error) {
                            console.error('Failed to save fridge contents:', error);
                            alert('Failed to save fridge contents.');
                        }
                    }}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
                >
                    Save Fridge
                </button>
            </div>
        </div>
    );
};

export default Fridge;
