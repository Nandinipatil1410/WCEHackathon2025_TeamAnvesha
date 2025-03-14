const tf = require('@tensorflow/tfjs-node'); // Use tfjs-node for better performance
const data = require('./data.js'); // Import the dataset

// Encode categorical variables
const monthToNumber = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'All Year': 12
};

const soilTypeToNumber = {
    'Neutral (Loamy)': 0, 'Alkaline (Clayey)': 1, 'Acidic (Sandy)': 2
};

const cropToNumber = {
    'Rice': 0, 'Maize': 1, 'Chickpea': 2, 'Kidneybeans': 3, 'Pigeonpeas': 4,
    'Mothbeans': 5, 'Mungbean': 6, 'Blackgram': 7, 'Lentil': 8, 'Pomegranate': 9,
    'Banana': 10, 'Mango': 11, 'Grapes': 12, 'Watermelon': 13, 'Muskmelon': 14,
    'Apple': 15, 'Orange': 16, 'Papaya': 17, 'Coconut': 18, 'Cotton': 19, 'Jute': 20, 'Coffee': 21
};

// Encode the dataset
const encodedData = data.map(item => ({
    input: [monthToNumber[item.Month], soilTypeToNumber[item.Soil_Type]],
    output: cropToNumber[item.Recommended_Crop]
}));

// Prepare the data for training
const xs = tf.tensor2d(encodedData.map(item => item.input)); // Input features
const ys = tf.tensor1d(encodedData.map(item => item.output), 'int32').toFloat(); // Convert to float32

// Define the model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [2] }));
model.add(tf.layers.dense({ units: Object.keys(cropToNumber).length, activation: 'softmax' }));

// Compile the model
model.compile({
    optimizer: tf.train.adam(),
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
});

// Train the model
async function trainModel() {
    await model.fit(xs, ys, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
            }
        }
    });
    console.log('Training complete');
}

// Save the model (optional)
async function saveModel() {
    await model.save('file://./model');
    console.log('Model saved');
}

// Make predictions
function predictCrop(month, soilType) {
    const input = tf.tensor2d([[monthToNumber[month], soilTypeToNumber[soilType]]]);
    const prediction = model.predict(input);
    const predictedCropIndex = prediction.argMax(1).dataSync()[0];
    const predictedCrop = Object.keys(cropToNumber).find(key => cropToNumber[key] === predictedCropIndex);
    return predictedCrop;
}

// Example usage
trainModel().then(() => {
    console.log(predictCrop('June', 'Neutral (Loamy)')); // Output: Rice
    saveModel(); // Save the model after training
});