const Classification = require('../models/Classification');
const aiService = require('../services/aiService');

exports.classifyWaste = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    try {
        const { username } = req.body;
        
        const aiResult = await aiService.getPrediction(
            req.file.buffer, 
            req.file.originalname, 
            req.file.mimetype
        );

        if (username && aiResult.success && aiResult.classification !== 'Unclear') {
            await Classification.create({
                username,
                wasteType: aiResult.classification,
                confidence: parseFloat(aiResult.recyclingPotential)
            });
        }

        return res.json(aiResult);

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
