/**
 * Tutor Controller
 * Extracts request inputs and orchestrates response.
 */

const tutorService = require('../services/tutorService');

const getTutors = async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        
        // Access tutors collection from req.app.locals
        const tutorsColl = req.app.locals.tutorsColl;

        if (!tutorsColl) {
            return res.status(500).json({ error: "Database connection not initialized" });
        }

        // Call the service layer with inputs
        const tutors = await tutorService.getTutors(tutorsColl, search, startDate, endDate);
        
        res.status(200).json(tutors);
    } catch (error) {
        console.error("Error in getTutors controller:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getTutors
};
