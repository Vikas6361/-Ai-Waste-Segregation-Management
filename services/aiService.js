const axios = require('axios');

const MOCK_CENTERS = {
    'Plastic': [
        { name: 'City Plastic Recycling Hub', address: '124 Green Ave, Industrial Area', map: '#' },
    ],
    'E-Waste': [
        { name: 'TechSalvage E-Waste Center', address: 'Tech Park, Building 9', map: '#' },
    ],
    'Bio-Waste': [
        { name: 'Municipal Compost Facility', address: 'Outer Ring Road, Farm District', map: '#' },
    ],
    'Unclear': []
};

exports.getPrediction = async (fileBuffer, originalName, mimetype) => {
    const base64 = fileBuffer.toString('base64');
    // Updated fallback URL
    const flaskUrl = process.env.FLASK_API_URL || 'https://ai-waste-segregation-management-3.onrender.com/predict';

    try {
        const response = await axios.post(flaskUrl, {
            file: base64,
            filename: originalName,
            mimetype: mimetype
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 120000 // Increased from 20000 to 120000 (120 seconds)
        });

        const data = response.data;
        data.nearbyCenters = MOCK_CENTERS[data.classification] || [];
        
        return data;
    } catch (error) {
        console.error('❌ AI Service Error: Could not reach Flask server.', error.message);
        // Updated error message to be accurate for production
        throw new Error('AI Model server timed out or is offline. Please try again in a moment.');
    }
};