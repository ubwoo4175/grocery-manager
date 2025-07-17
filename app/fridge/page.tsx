'use client'

import React, { useState, useEffect } from 'react'
import Fridge from '@/components/Fridge';
import { getUserFridge } from '@/lib/actions/recipe.actions';
import { Quantity } from '@/lib/types';

const FridgePage = () => {
    const [fridgeItems, setFridgeItems] = useState<{ [ingredientId: string]: Quantity }>({});

    useEffect( () => {
        const fetchFridgeContents = async () => {
            const fetchedFridgeContents = await getUserFridge();
            if (fetchedFridgeContents) {
                const transformedFridge: { [ingredientId: string]: Quantity } = {};
                if (Array.isArray(fetchedFridgeContents)) {
                    fetchedFridgeContents.forEach(fridgeEntry => {
                        if (fridgeEntry.ingredients) {
                            for (const ingredientId in fridgeEntry.ingredients) {
                                const quantityMap = fridgeEntry.ingredients[ingredientId];
                                if (!transformedFridge[ingredientId]) {
                                    transformedFridge[ingredientId] = {};
                                }
                                for (const unit in quantityMap) {
                                    const quantity = quantityMap[unit];
                                    if (!transformedFridge[ingredientId][unit]) {
                                        transformedFridge[ingredientId][unit] = 0;
                                    }
                                    if (typeof quantity === 'number' && typeof transformedFridge[ingredientId][unit] === 'number') {
                                        (transformedFridge[ingredientId][unit] as number) += quantity;
                                    } else {
                                        transformedFridge[ingredientId][unit] = quantity;
                                    }
                                }
                            }
                        }
                    });
                }
                setFridgeItems(transformedFridge);
            }
        };

        fetchFridgeContents();
    }, []);

    return (
        <div className="mt-8 lg:mt-0">
            <Fridge items={fridgeItems} setItems={setFridgeItems} aggregatedUsage={{}}/>
        </div>
    )
}

export default FridgePage