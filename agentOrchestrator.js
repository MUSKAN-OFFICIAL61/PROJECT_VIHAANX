const crypto = require('crypto');

const runs = [];

async function runPipeline({
    studentName,
    targetRoleId,
    resumeText,
    linkedInData,
    gitHubData
}) {
    const report = {
        id: crypto.randomUUID(),
        studentName: studentName || 'Student',
        targetRoleId: targetRoleId || null,
        status: 'completed',
        mode: 'demo',
        generatedAt: new Date().toISOString(),

        inputsReceived: {
            resume: Boolean(resumeText),
            linkedIn: Boolean(linkedInData),
            gitHub: Boolean(gitHubData)
        },

        message:
            'Pipeline executed successfully. This is a local demo report, not a live AI analysis.'
    };

    runs.push(report);

    return report;
}

function getAllRuns() {
    return runs;
}

function getRunById(id) {
    return runs.find(run => run.id === id) || null;
}

module.exports = {
    runPipeline,
    getAllRuns,
    getRunById
};