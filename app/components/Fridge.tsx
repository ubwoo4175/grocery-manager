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

const RightArrowIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mx-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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

interface FridgeProps {
    items: FridgeItem[];
    setItems: React.Dispatch<React.SetStateAction<FridgeItem[]>>;
    aggregatedUsage: { [ingredientId: string]: { [unit: string]: number | string } };
    database: any;
}

const Fridge: React.FC<FridgeProps> = ({ items, setItems, aggregatedUsage, database }) => {
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
            
            {/* Headers for quantity columns */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5 text-sm font-medium text-gray-600 pl-3">Ingredient</div>
                <div className="col-span-3 text-sm font-medium text-gray-600 pl-3">Amount left</div>
                <div className="col-span-2 text-sm font-medium text-gray-600 pl-3">You need</div>
                <div className="col-span-2"></div> {/* Empty column for delete button alignment */}
            </div>
            
            {/* Item List */}
            <ul className="grid grid-cols-12 gap-2 space-y-1 mb-4">
                {items.map((item) => {
                    // Find usage for this item (case-insensitive match)
                    const usageEntry = Object.entries(aggregatedUsage).find(([ingId, unitMap]) => {
                        // Try to match by name (case-insensitive)
                        return (
                            item.name.toLowerCase() === ingId.replace(/_/g, ' ').toLowerCase() ||
                            item.name.toLowerCase() === database.ingredients_info[ingId]?.name?.toLowerCase()
                        );
                    });
                    let usedQty: number | null = null;
                    let usedUnit = '';
                    if (usageEntry) {
                        const [ingId, unitMap] = usageEntry;
                        // Try to match by unit (case-insensitive)
                        const unitMatch = Object.entries(unitMap).find(([unit, qty]) => unit.toLowerCase() === item.unit.toLowerCase());
                        if (unitMatch && typeof unitMatch[1] === 'number') {
                            usedQty = unitMatch[1] as number;
                            usedUnit = unitMatch[0];
                        }
                    }
                    const remaining = usedQty !== null ? item.quantity - usedQty : item.quantity;
                    return (
                        <li key={item.id} className="col-span-12 grid grid-cols-12 gap-2 items-center p-1 rounded-md hover:bg-gray-50 group">
                            {/* Name Field */}
                            <div className="col-span-5">
                                {editingField?.id === item.id && editingField?.field === 'name' ? (
                                    <input 
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={handleEditKeyDown}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors" onClick={() => handleStartEdit(item, 'name')}>{item.name}</span>
                                )}
                            </div>  
                            {/* Quantity and Unit Fields (Amount Left) */}
                            <div className="col-span-3">
                                {editingField?.id === item.id && editingField?.field === 'quantity' ? (
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
                                    <span className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors" onClick={() => handleStartEdit(item, 'quantity')}>{item.quantity} {item.unit}</span>
                                )}
                            </div>
                            {/* You Need Field */}
                            <div className="col-span-3">
                                <span className={`block w-full px-3 py-2 rounded-md ${usedQty !== null && usedQty > item.quantity ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                    {usedQty !== null && usedUnit ? `${usedQty} ${usedUnit}` : 'N/A'}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-end pr-2">
                                <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity">
                                        <TrashIcon />
                                </button>
                            </div>
                        </li>
                    );
                })}
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
