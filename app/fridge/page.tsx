'use client'

import React, { useState } from 'react'
import Fridge from '@/components/Fridge';
import { getUserFridge } from '@/lib/actions/recipe.actions';
import { Quantity } from '@/lib/types';

const FridgePage = async () => {
    const [fridgeItems, setFridgeItems] = useState<{ [ingredientId: string]: Quantity }>({});

    const initialFridgeContents = await getUserFridge();
    console.log(initialFridgeContents);

    return (
        <div className="mt-8 lg:mt-0">
            <Fridge items={fridgeItems} setItems={setFridgeItems} aggregatedUsage={{}}/>
        </div>
    )
}

export default FridgePage