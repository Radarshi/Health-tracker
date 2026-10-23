import re
from typing import List, Dict, Any, Optional

NUMBER_WORDS = {
    "one": 1.0, "a": 1.0, "an": 1.0, "two": 2.0, "three": 3.0, "four": 4.0,
    "five": 5.0, "six": 6.0, "seven": 7.0, "eight": 8.0, "nine": 9.0, "ten": 10.0,
    "half": 0.5, "quarter": 0.25, "single": 1.0, "double": 2.0, "triple": 3.0
}

COMMON_UNITS = [
    "grams", "gram", "g", "kg", "kilograms", "oz", "ounces", "lb", "pounds",
    "bowl", "bowls", "cup", "cups", "plate", "plates", "piece", "pieces",
    "roti", "rotis", "chapati", "chapatis", "paratha", "parathas",
    "slice", "slices", "tbsp", "tablespoon", "tsp", "teaspoon", "ml", "liters", "katori"
]

PREPARATION_KEYWORDS = [
    "cooked", "boiled", "fried", "steamed", "grilled", "roasted", "baked",
    "raw", "mashed", "curried", "stir-fried", "sauteed", "deep-fried"
]

class NaturalLanguageFoodParser:
    @classmethod
    def parse_text(cls, text: str) -> Dict[str, Any]:
        """
        Parses a natural language meal text string into structured food candidates,
        extracting food name, quantity, unit, preparation method, and follow-up questions.
        """
        cleaned = text.strip()
        # Remove prefix pleasantries like "I ate", "I had for lunch", "Consumed", etc.
        cleaned = re.sub(r'^(i\s+ate|i\s+had|i\s+consumed|for\s+(breakfast|lunch|dinner|snack),?\s*i\s+(ate|had))\s+', '', cleaned, flags=re.IGNORECASE)
        
        # Split on commas, 'and', semicolons, 'plus', '+'
        raw_items = re.split(r',\s*and\s+|\s+and\s+|,\s*|\s*\+\s*|;\s*', cleaned, flags=re.IGNORECASE)
        
        parsed_items: List[Dict[str, Any]] = []
        ambiguities: List[str] = []
        
        for raw in raw_items:
            item_str = raw.strip()
            if not item_str:
                continue
            
            parsed_item = cls._parse_single_clause(item_str)
            if parsed_item:
                parsed_items.append(parsed_item)
                
                # Check for standard ambiguities
                name_lower = parsed_item["food_name"].lower()
                if "rice" in name_lower and not any(p in name_lower for p in ["cooked", "raw", "uncooked"]):
                    ambiguities.append(f"Did you log cooked or uncooked {parsed_item['food_name']}? (Cooked rice is standard for 130 kcal/100g).")
                if parsed_item["unit"] in ["bowl", "bowls", "plate"] and not parsed_item.get("size_modifier"):
                    ambiguities.append(f"For '{parsed_item['food_name']}', was the {parsed_item['unit']} standard (medium ~250g) or larger?")
        
        return {
            "original_text": text,
            "detected_items": parsed_items,
            "has_ambiguity": len(ambiguities) > 0,
            "clarification_questions": ambiguities
        }

    @classmethod
    def _parse_single_clause(cls, clause: str) -> Optional[Dict[str, Any]]:
        # Match pattern: [quantity] [unit] [of] [modifiers] [food]
        # Example: "150 grams of cooked rice", "two medium rotis", "1 bowl of dal", "3 boiled eggs"
        words = clause.split()
        if not words:
            return None

        quantity = 1.0
        unit = "serving"
        preparation = None
        size_modifier = None
        
        # Check size modifiers: small, medium, large
        size_match = re.search(r'\b(small|medium|large|big)\b', clause, flags=re.IGNORECASE)
        if size_match:
            size_modifier = size_match.group(1).lower()
            clause = re.sub(r'\b(small|medium|large|big)\b', '', clause, flags=re.IGNORECASE)
        
        # Check preparation keyword
        for prep in PREPARATION_KEYWORDS:
            if re.search(rf'\b{prep}\b', clause, flags=re.IGNORECASE):
                preparation = prep
                break

        # Pattern: number + optional unit
        pattern = r'^(\d+(?:\.\d+)?|[a-zA-Z]+)\s*([a-zA-Z]+)?\s*(?:of\s+)?(.*)$'
        match = re.match(pattern, clause.strip(), flags=re.IGNORECASE)
        
        if match:
            first_token = match.group(1).lower()
            second_token = (match.group(2) or "").lower()
            remainder = (match.group(3) or "").strip()
            
            # Resolve numeric quantity
            if first_token in NUMBER_WORDS:
                quantity = NUMBER_WORDS[first_token]
            else:
                try:
                    quantity = float(first_token)
                except ValueError:
                    quantity = 1.0
                    remainder = f"{first_token} {second_token} {remainder}".strip()
                    second_token = ""

            # Check if second token is a known unit
            if second_token in COMMON_UNITS:
                unit = second_token
                food_name = remainder
            elif second_token in ["roti", "rotis", "chapati", "chapatis", "egg", "eggs", "apple", "apples", "banana", "bananas", "idli", "idlis", "dosa", "dosas"]:
                unit = second_token
                food_name = f"{second_token} {remainder}".strip()
            else:
                food_name = f"{second_token} {remainder}".strip() if second_token else remainder
        else:
            food_name = clause.strip()

        # Clean food name
        food_name = re.sub(r'^(of\s+|a\s+|an\s+)', '', food_name, flags=re.IGNORECASE).strip()
        if not food_name:
            food_name = clause.strip()

        # If food_name ends with unit, handle (e.g. "2 rotis")
        return {
            "food_name": food_name.title(),
            "quantity": quantity,
            "unit": unit,
            "size_modifier": size_modifier,
            "preparation_method": preparation or "standard"
        }
