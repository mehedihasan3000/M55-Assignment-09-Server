/**
 * Tutor Service
 * Handles MongoDB queries for searching and filtering tutors.
 */

const getTutors = async (tutorsColl, search, startDate, endDate) => {
    const query = {};

    // 1. Case-insensitive search by tutor name
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // 2. Date range filtering for registrationStartDate between selected dates
    if (startDate || endDate) {
        query.registrationStartDate = {};
        if (startDate) {
            query.registrationStartDate.$gte = startDate; // Format: YYYY-MM-DD
        }
        if (endDate) {
            query.registrationStartDate.$lte = endDate; // Format: YYYY-MM-DD
        }
    }

    // Fetch and return results
    const cursor = tutorsColl.find(query);
    const tutors = await cursor.toArray();
    return tutors;
};

module.exports = {
    getTutors
};
