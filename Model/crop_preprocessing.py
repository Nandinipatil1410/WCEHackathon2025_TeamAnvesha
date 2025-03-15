import pandas as pd
import json

# Load dataset
df = pd.read_csv("Crop_recommendation.csv")

# Drop unnecessary columns
df = df.drop(columns=["N", "P", "K", "temperature", "humidity", "rainfall"])

# Convert pH into soil type
def classify_soil(pH):
    if pH < 5.5:
        return "Acidic (Sandy)"
    elif 5.5 <= pH <= 7.5:
        return "Neutral (Loamy)"
    else:
        return "Alkaline (Clayey)"

df["Soil_Type"] = df["ph"].apply(classify_soil)
df = df.drop(columns=["ph"])

# Define crop growing months
crop_month_map = {
    "Rice": ["June", "July", "August"],
    "Maize": ["May", "June", "July"],
    "Chickpea": ["October", "November", "December"],
    "Kidneybeans": ["March", "April", "May"],
    "Pigeonpeas": ["June", "July", "August"],
    "Mothbeans": ["July", "August", "September"],
    "Mungbean": ["March", "April", "May"],
    "Blackgram": ["June", "July", "August"],
    "Lentil": ["November", "December", "January"],
    "Pomegranate": ["February", "March", "April"],
    "Banana": ["All Year"],
    "Mango": ["December", "January", "February"],
    "Grapes": ["January", "February", "March"],
    "Watermelon": ["March", "April", "May"],
    "Muskmelon": ["February", "March", "April"],
    "Apple": ["October", "November", "December"],
    "Orange": ["July", "August", "September"],
    "Papaya": ["All Year"],
    "Coconut": ["All Year"],
    "Cotton": ["April", "May", "June"],
    "Jute": ["March", "April", "May"],
    "Coffee": ["September", "October", "November"]
}

# Generate dataset with Month, Soil Type, and Recommended Crop
new_data = []
for crop, months in crop_month_map.items():
    soil_types = df[df["label"].str.lower() == crop.lower()]["Soil_Type"].unique()
    if len(soil_types) == 0:
        print(f"⚠ Warning: No soil type found for crop '{crop}' in dataset.")
    for month in months:
        for soil in soil_types:
            new_data.append([month, soil, crop])

# Convert to DataFrame
df_new = pd.DataFrame(new_data, columns=["Month", "Soil_Type", "Recommended_Crop"])

df_new.to_csv("Modified_Crop_Recommendation.csv", index=False)
print("✅ Modified dataset saved successfully!")

# Save JSON format
df_json = df_new.to_json(orient="records", indent=4)
with open("crop_data.json", "w") as json_file:
    json_file.write(df_json)
print("✅ Modified dataset saved as JSON!")

# Convert JSON to TensorFlow.js format
tfjs_data = {"data": json.loads(df_json)}
with open("crop_data_tfjs.json", "w") as tfjs_file:
    json.dump(tfjs_data, tfjs_file, indent=4)
print("✅ TensorFlow.js dataset saved successfully!")
