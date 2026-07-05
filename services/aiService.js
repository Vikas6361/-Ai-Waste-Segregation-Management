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
    const flaskUrl = process.env.FLASK_API_URL || 'http://127.0.0.1:5000/predict';

    try {
        const response = await axios.post(flaskUrl, {
            file: base64,
            filename: originalName,
            mimetype: mimetype
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000 
        });

        const data = response.data;
        data.nearbyCenters = MOCK_CENTERS[data.classification] || [];
        
        return data;
    } catch (error) {
        console.error('❌ AI Service Error: Could not reach Flask server.', error.message);
        throw new Error('AI Model server is offline. Please ensure flask_server.py is running on port 5000.');
    }
};
