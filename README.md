# NutriTrack AI — Intelligent Nutrition & Calorie Tracking Platform

NutriTrack AI is a production-oriented, full-stack web platform for intelligent nutrition logging, personalized metabolic target calculation, and dietary analytics.

---

## 🌟 Key Features

1. **AI Food Recognition & Segmentation (FoodSAM Architecture)**:
   - Detects multiple food regions in mixed-plate meals (cooked rice, curries, flatbreads, proteins).
   - Generates confidence scores, bounding boxes, and candidate alternatives.
   - **Portion Confirmation Flow**: Never guesses exact calories from pixels alone; prompts the user to confirm or adjust portion sizes before saving.

2. **Structured Natural Language Food Parsing**:
   - Parses complex inputs such as: `"I ate two medium rotis, one bowl of dal, 150 grams of cooked rice, and 120 grams of chicken curry"`.
   - Extracts foods, quantities, units, and preparation methods.
   - Generates disambiguation questions (e.g., cooked vs. uncooked rice, standard vs. large bowl).

3. **Curated & External Nutrition Catalogs**:
   - Pre-seeded local catalog tailored with Bengali and Indian staples (Roti, Cooked Basmati Rice, Dal Tadka, Bengali Fish Curry, Paneer, etc.) and global benchmarks.
   - Integrated with **USDA FoodData Central** REST API for comprehensive micronutrient and macronutrient lookups.
   - **Open Food Facts** barcode scanning engine for packaged products.

4. **Deterministic Calculation Engine**:
   - Basal Metabolic Rate (BMR) via the **Mifflin–St Jeor** formula.
   - Total Daily Energy Expenditure (TDEE) with activity multipliers.
   - Safe caloric deficit/surplus boundaries with minimum safety floors (1200 kcal for females, 1400 kcal for males).
   - Unit and portion normalization (grams, bowls, pieces, rotis, ml).

5. **Interactive Health Dashboard & Visual Analytics**:
   - Circular calorie gauge with remaining/over-target tracking.
   - Macronutrient distribution meters (Protein, Carbs, Fat, Fiber).
   - Water hydration logger (+250ml, +500ml quick actions).
   - Recharts visual analytics: 7/14/30-day calorie intake vs. target, macro donut breakdown, protein progression, and body weight trend.
   - Transparent, evidence-backed nutritional insights.

6. **Additional Modules**:
   - **Recipe Builder**: Combine ingredients, compute total nutrients, and calculate per-serving nutrition.
   - **Weight & BMI Tracker**: Log periodic body measurements with BMI screening category.
   - **Weekly Reports**: Printable, comprehensive adherence and intake summaries.
   - **Data Privacy & GDPR**: One-click JSON data export and complete account deletion.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Python 3.14 + FastAPI, Pydantic, SQLAlchemy ORM, SQLite / PostgreSQL.
- **Security**: Argon2/bcrypt password hashing, PyJWT tokens, CORS security headers.
- **AI & Vision Pipeline**: FoodSAM segmentation heuristics + candidate classifiers, EXIF-safe Pillow image preprocessor.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js LTS (v20+ or v24+)

### 2. Backend Setup
```bash
# In the project root
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt   # or pip install fastapi uvicorn pydantic sqlalchemy pillow httpx bcrypt pyjwt pytest email-validator

# Run tests
$env:PYTHONPATH = "backend"
python -m pytest backend/tests

# Launch backend server (default: port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```

API docs will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Visit the application at: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 🔑 Default Demo Account

For instant evaluation without sign-up:
- **Email**: `demo@nutritrack.ai`
- **Password**: `demopassword`
- Pre-seeded with 7 days of realistic meals (breakfast, lunch, dinner), weight measurements, and hydration logs.
