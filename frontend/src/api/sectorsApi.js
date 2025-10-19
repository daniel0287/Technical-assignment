const API_BASE_URL = 'http://localhost:8080/api';

export const fetchSectors = async () => {
    const response = await fetch(`${API_BASE_URL}/sectors`);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorBody || 'No additional details.'}`);
    }
    return await response.json();
};

export const fetchSubmission = async (submissionId) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorBody || 'No additional details.'}`);
    }
    return await response.json();
};

export const saveSubmission = async (submissionData, submissionId = null) => {
    const httpMethod = submissionId ? 'PUT' : 'POST';
    const apiUrl = submissionId ? `${API_BASE_URL}/submissions/${submissionId}` : `${API_BASE_URL}/submissions`;

    const response = await fetch(apiUrl, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
        let errorDetails = 'An unexpected error occurred during submission.';
        let fieldErrors = {};
        try {
            const errorData = await response.json();
            fieldErrors = errorData;
            if (Object.keys(fieldErrors).length > 0) {
                throw { type: 'validation', errors: fieldErrors };
            }
            errorDetails = errorData.message || errorDetails;
        } catch (jsonError) {
            errorDetails = `Server error: ${response.status} ${response.statusText || ''}.`;
            console.error('Failed to parse error response from submission:', jsonError);
        }
        throw new Error(errorDetails);
    }
    return await response.json();
};