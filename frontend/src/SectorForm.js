import React, { useState, useEffect } from 'react';
import './SectorForm.css';

const fetchSectorsFromApi = async () => {
    const response = await fetch('http://localhost:8080/api/sectors');
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorBody || 'No additional details.'}`);
    }
    const data = await response.json();
    return data;
};

function SectorForm() {
    const [sectors, setSectors] = useState([]);
    const [name, setName] = useState('');
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [submissionId, setSubmissionId] = useState(null);
    const [generalFormError, setGeneralFormError] = useState(null);
    const [isLoadingSectors, setIsLoadingSectors] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setGeneralFormError(null);
        setErrors({});
        setSuccessMessage(null);

        let validationErrors = {};

        if (!name.trim()) {
            validationErrors.name = 'Name is required';
        }

        if (selectedSectors.length === 0) {
            validationErrors.selectedSectors = 'At least one sector must be selected';
        }
         
        if (!agreeToTerms) {
            validationErrors.agreeToTerms = 'You must agree to the terms';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            console.log('Form is valid. Submitting data:', { name, selectedSectors, agreeToTerms });
            const httpMethod = submissionId ? 'PUT' : 'POST';
            const apiUrl = submissionId ? `http://localhost:8080/api/submissions/${submissionId}` : 'http://localhost:8080/api/submissions';
            try {
                const response = await fetch(apiUrl, {
                    method: httpMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        selectedSectors: selectedSectors.map(id => ({ id : Number(id) })),
                        agreeToTerms
                    }),
                });

                if (!response.ok) {
                    let errorDetails = 'An unexpected error occurred during submission.';
                    let fieldErrors = {};
                    try {
                        const errorData = await response.json();
                        fieldErrors = errorData; 
                        if (Object.keys(fieldErrors).length > 0) {
                            setErrors(fieldErrors);
                            return;
                        }
                        errorDetails = errorData.message || errorDetails; 
                    } catch (jsonError) {
                        errorDetails = `Server error: ${response.status} ${response.statusText || ''}.`;
                        console.error('Failed to parse error response from submission:', jsonError);
                    }
                    console.error('Error submitting form:', errorDetails);
                    setGeneralFormError(errorDetails);
                    return;
                }

                const savedSubmission = await response.json();
                console.log('Form submitted successfully:', savedSubmission);

                localStorage.setItem('submissionId', savedSubmission.id);
                
                setName(savedSubmission.name);
                setSelectedSectors(savedSubmission.selectedSectors.map(sector => sector.id.toString()));
                setAgreeToTerms(savedSubmission.agreeToTerms);
                setErrors({});
                setGeneralFormError(null);
                setSuccessMessage('Your data has been saved successfully!');
                setTimeout(() => setSuccessMessage(null), 5000);

            } catch (error) {
                console.error('Network or other error submitting form:', error);
                setGeneralFormError('An error occurred while connecting to the server. Please try again later.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Form has validation errors:', validationErrors);
            setGeneralFormError('Please fix the highlighted errors and try again.');
        }
    };

    useEffect(() => {
        const loadSectorsAndSubmission = async () => {
            setIsLoadingSectors(true);
            setGeneralFormError(null);

            try {
                const sectorData = await fetchSectorsFromApi();
                setSectors(sectorData);
                
                const storedSubmissionId = localStorage.getItem('submissionId');
                if (storedSubmissionId) {
                    const submissionIdNum = Number(storedSubmissionId);
                    setSubmissionId(submissionIdNum);

                    const response = await fetch(`http://localhost:8080/api/submissions/${submissionIdNum}`);
                    if (response.ok) {
                        const submissionData = await response.json();
                        setName(submissionData.name);
                        setSelectedSectors(submissionData.selectedSectors.map(sector => sector.id.toString()));
                        setAgreeToTerms(submissionData.agreeToTerms);
                    } else {
                        const errorBody = await response.text();
                        console.error(`Error fetching submission data (Status: ${response.status}): ${errorBody}`);
                        setGeneralFormError(`Failed to load previous submission data. (Status: ${response.status})`);
                    }
                }
            } catch (error) {
                console.error('Error during initial data load:', error);
                setGeneralFormError('Failed to load initial data (sectors or saved submission). Please check your connection.');
            } finally {
                setIsLoadingSectors(false);
            }
        };    

        loadSectorsAndSubmission();
    }, []);

    const isFormDisabled = isLoadingSectors || isSubmitting;

    return (
        <div className="sectorFormContainer">
            <h2> Sector Form</h2>
            {generalFormError && <p className="general-error-message"> {generalFormError}</p>}
            {successMessage && <p className="success-message"> {successMessage}</p>}
            
            {isLoadingSectors ? (
                <p className="loading-message">Loading sectors and your saved data...</p>
            ) : (
                <>
                    <p className="sector-count-info">Number of sectors loaded: {sectors.length}</p>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="nameInput">
                            Name:
                            <input
                                type="text"
                                id="nameInput"
                                name="userName" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                disabled={isFormDisabled}    
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "nameError" : undefined}
                            />
                            {errors.name && <span id="nameError" className="error-message"> {errors.name}</span>}
                        </label>
                        <label htmlFor="sectorsSelect">
                            Select Sector:
                            <select
                                multiple 
                                size="5" 
                                id="sectorsSelect"
                                name="selectedSectors"
                                value={selectedSectors} 
                                onChange={(e) => { const options = Array.from(e.target.selectedOptions);
                                    setSelectedSectors(options.map(option => option.value));}}
                                disabled={isFormDisabled}
                                aria-invalid={!!errors.selectedSectors}
                                aria-describedby={errors.selectedSectors ? "sectorsError" : undefined}
                            >
                                {sectors.length > 0 ? (
                                    sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id}>
                                            {'\u00A0'.repeat(sector.level * 4) + sector.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled value ="">
                                        {generalFormError ? "Failed to load sectors" : "No sectors available"}
                                    </option>
                                )}
                            </select>
                            {errors.selectedSectors && <span id="sectorsError" className="error-message"> {errors.selectedSectors}</span>}
                        </label>
                        <label htmlFor="agreeToTermsCheckbox">
                            Agree to Terms:
                            <input
                                type="checkbox" 
                                id='agreeToTermsCheckbox'
                                name="agreeToTerms" 
                                checked={agreeToTerms} 
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                disabled={isFormDisabled}
                                aria-invalid={!!errors.agreeToTerms}
                                aria-describedby={errors.agreeToTerms ? "termsError" : undefined}
                            />
                            {errors.agreeToTerms && <span id="termsError" className="error-message"> {errors.agreeToTerms}</span>}
                        </label>
                        <input
                            type="submit" 
                            value={isSubmitting ? "Saving..." : "Save"}
                            disabled={isFormDisabled}
                        />
                    </form>
                </>
            )}
        </div>
    );
}


export default SectorForm;