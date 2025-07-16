'use client'

import React, { useState } from 'react'
import Fridge from '@/components/Fridge';
import { getUserFridge } from '@/lib/actions/recipe.actions';
import { Quantity } from '@/lib/types';

const initialFridgeContents: { [ingredientId: string]: Quantity } = {
    'olive_oil' : {'bottle' : 1},
    'soy_sauce' : {'bottle' : 1},
    'salt' : {'shaker' : 1},
    'black_pepper' : {'grinder' : 1},
    'onion' : {'whole' : 2},
    'garlic_clove' : {'clove' : 5},
    'chicken_breast' : {'breast' : 1}
};

const FridgePage = () => {
    const [fridgeItems, setFridgeItems] = useState<{ [ingredientId: string]: Quantity }>({});
    return (
        <div className="mt-8 lg:mt-0">
            <Fridge items={fridgeItems} setItems={setFridgeItems} aggregatedUsage={{}}/>
        </div>
  )
}

export default FridgePage