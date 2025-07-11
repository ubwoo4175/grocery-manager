import React, { useState } from 'react';

// --- TYPE DEFINITIONS ---
interface FridgeItem {
    id: number; // Use ID for stable key and editing
    name: string;
    quantity: number;
    unit: string;
}

type EditableField = 'name' | 'quantity' | 'unit';

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

// --- INITIAL MOCK DATA ---
const initialFridgeContents: FridgeItem[] = [
    { id: 1, name: 'Olive Oil', quantity: 1, unit: 'bottle' },
    { id: 2, name: 'Soy Sauce', quantity: 1, unit: 'bottle' },
    { id: 3, name: 'Salt', quantity: 1, unit: 'shaker' },
    { id: 4, name: 'Black Pepper', quantity: 1, unit: 'grinder' },
    { id: 5, name: 'Onion', quantity: 2, unit: 'whole' },
    { id: 6, name: 'Garlic Clove', quantity: 5, unit: 'cloves' },
    { id: 7, name: 'Chicken Breast', quantity: 1, unit: 'breasts' },
];


const Fridge: React.FC = () => {
    const [items, setItems] = useState<FridgeItem[]>(initialFridgeContents);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');
    
    // State to track the specific field being edited
    const [editingField, setEditingField] = useState<{ id: number; field: EditableField } | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() && newItemQty.trim()) {
            const newItem: FridgeItem = {
                id: Date.now(),
                name: newItemName.trim(),
                quantity: parseFloat(newItemQty),
                unit: newItemUnit.trim()
            };
            setItems([...items, newItem]);
            setNewItemName('');
            setNewItemQty('');
            setNewItemUnit('');
        }
    };

    const handleDeleteItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };
    
    const handleStartEdit = (item: FridgeItem, field: EditableField) => {
        setEditingField({ id: item.id, field });
        // Set the initial value for the input based on the field clicked
        switch (field) {
            case 'name':
                setEditingValue(item.name);
                break;
            case 'quantity':
                setEditingValue(String(item.quantity));
                break;
            case 'unit':
                setEditingValue(item.unit);
                break;
        }
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditingValue('');
    };

    const handleSaveEdit = () => {
        if (!editingField) return;
        
        setItems(items.map(item => {
            if (item.id === editingField.id) {
                const updatedItem = { ...item };
                switch (editingField.field) {
                    case 'name':
                        updatedItem.name = editingValue.trim() || 'Unnamed Item';
                        break;
                    case 'quantity':
                        updatedItem.quantity = parseFloat(editingValue) || 0;
                        break;
                    case 'unit':
                        updatedItem.unit = editingValue.trim();
                        break;
                }
                return updatedItem;
            }
            return item;
        }));

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
            
            {/* Item List */}
            <ul className="space-y-1 mb-4">
                {items.map((item) => (
                    <li key={item.id} className="group flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                        {/* Name Field */}
                        <div className="flex-1 ml-10">
                            {editingField?.id === item.id && editingField?.field === 'name' ? (
                                <input 
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={handleSaveEdit}
                                    onKeyDown={handleEditKeyDown}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-gray-800 cursor-pointer" onClick={() => handleStartEdit(item, 'name')}>{item.name}</span>
                            )}
                        </div>

                        {/* Quantity and Unit Fields */}
                        <div className="flex items-center gap-2 ml-4">
                            {editingField?.id === item.id && editingField?.field === 'quantity' ? (
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={handleSaveEdit}
                                    onKeyDown={handleEditKeyDown}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    autoFocus
                                />
                            ) : (
                                <span className="font-medium text-gray-600 cursor-pointer px-2 py-1 rounded-md" onClick={() => handleStartEdit(item, 'quantity')}>
                                    {item.quantity}
                                </span>
                            )}

                            {editingField?.id === item.id && editingField?.field === 'unit' ? (
                                <input 
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={handleSaveEdit}
                                    onKeyDown={handleEditKeyDown}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-gray-600 w-24 cursor-pointer" onClick={() => handleStartEdit(item, 'unit')}>{item.unit}</span>
                            )}

                            <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity">
                                <TrashIcon />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            
             {items.length === 0 && (
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
                        type="number"
                        step="0.1"
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
                     />
                     <button type="submit" className="col-span-12 md:col-span-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                         <PlusIcon />
                     </button>
                 </form>
            </div>
        </div>
    );
};

export default Fridge;
