const express = require('express');
const router = express.Router();

const {
    runPipeline,
    getAllRuns,
    getRunById
} = require('./agentOrchestrator');

// Run maritime agent pipeline
router.post('/run', async (req, res) => {
    try {
        const report = await runPipeline(req.body);
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all pipeline runs
router.get('/runs', (req, res) => {
    res.json({
        success: true,
        data: getAllRuns()
    });
});

// Get a specific pipeline run
router.get('/runs/:id', (req, res) => {
    const report = getRunById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Run not found'
        });
    }

    res.json({
        success: true,
        data: report
    });
});

module.exports = router;