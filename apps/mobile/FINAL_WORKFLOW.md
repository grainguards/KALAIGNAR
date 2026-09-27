# Kala Setu Complete Technical Workflow

![TECHNICAL WORKFLOW](/C:/Users/DELL/.gemini/antigravity/brain/483cf0df-084c-47da-9bfd-c2099ca146bb/TECHNICAL_WORKFLOW.png)

## Step-by-Step Technical Explanation

### 1. Artisan Input & AI Processing (Top Section)
* **The Entry Point:** An artisan uploads a raw photo of their craft and attaches a voice note in their local language.
* **Multimodal Edge Processing:** The system splits this raw data into four AI pipelines:
  * **NLP (Speech-to-Text):** Translates the local dialect into standardized English catalog text.
  * **Computer Vision:** Automatically removes the messy background and enhances lighting.
  * **Metadata Extraction:** Identifies the material, region, and craft type.
  * **Smart Pricing Engine:** Uses recent market trends to suggest a competitive price.

### 2. Quality & Trust Score Decision (First Diamond)
Before a product goes live, the aggregated data passes through a **Quality & Trust Score** algorithm.
* **Low Score (< 700):** If the photo is too blurry or details are missing, the system loops back, alerting the artisan via a push notification to improve their input.
* **High Score (>= 700):** The product is officially pushed into the **Central Smart Product Catalog**, making it live on the global marketplace. *(Note: Artisans can also use the Mapbox API from here to source their own raw materials).*

### 3. Buyer Intent & Recommendation (Middle Section)
* **Buyer Entry Point:** A global buyer (e.g., Fabindia, IKEA) posts a bulk requirement (e.g., "Need 500 silk scarves").
* **LLM Intent Parser:** The AI reads the unstructured buyer request and extracts the exact parameters.
* **Matching Engine:** An LLM Recommendation Engine compares the parsed buyer requirement against the entire Smart Catalog.

### 4. Match Score Decision (Second Diamond)
* **Low Match:** If there are no artisans currently capable of fulfilling the request, the data is saved for future Predictive Demand Analysis.
* **High Match:** The system immediately pushes the match into the **Transaction & Allocation Hub**.

### 5. Execution & Ecosystem Outputs (Bottom Section)
Once a match is made, the workflow triggers four simultaneous technical outputs:
1. **Transactions:** Initiates either an Automated Greedy Bulk Allocation (if a single artisan can fulfill it) or a **Live Bid War** (if multiple artisans are competing).
2. **Communications:** Connects to the **Meta WhatsApp API** to send automated SMS/WhatsApp alerts directly to the artisans' phones without requiring them to open the app.
3. **Govt Compliance:** All transactions sync to the **Impact Analytics Database**, populating the Government Dashboard with real-time economic data.
4. **Schemes:** The government database can trigger automated financial scheme or grant allocations to top-performing rural MSMEs.
