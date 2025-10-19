import React, { useState, useEffect } from 'react';
import './SectorForm.css';
import { fetchSectors, fetchSubmission, saveSubmission } from '../../api/sectorsApi';

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
        if (!name.trim()) validationErrors.name = 'Name is required';
        if (selectedSectors.length === 0) validationErrors.selectedSectors = 'At least one sector must be selected';
        if (!agreeToTerms) validationErrors.agreeToTerms = 'You must agree to the terms';
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                const submissionData = {
                    name,
                    selectedSectors: selectedSectors.map(id => ({ id: Number(id) })),
                    agreeToTerms
                };
                const savedSubmission = await saveSubmission(submissionData, submissionId);

                localStorage.setItem('submissionId', savedSubmission.id);
                setSubmissionId(savedSubmission.id); // Update submissionId if it was a POST
                setName(savedSubmission.name);
                setSelectedSectors(savedSubmission.selectedSectors.map(sector => sector.id.toString()));
                setAgreeToTerms(savedSubmission.agreeToTerms);
                setErrors({});
                setGeneralFormError(null);
                setSuccessMessage('Your data has been saved successfully!');
                setTimeout(() => setSuccessMessage(null), 5000);

            } catch (error) {
                console.error('Submission error:', error);
                if (error.type === 'validation') {
                     setErrors(error.errors);
                     setGeneralFormError('Please fix the highlighted errors and try again.');
                } else {
                    setGeneralFormError(error.message || 'An unexpected error occurred during submission.');
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setGeneralFormError('Please fix the highlighted errors and try again.');
        }
    };

    useEffect(() => {
        const loadSectorsAndSubmission = async () => {
            setIsLoadingSectors(true);
            setGeneralFormError(null);
            try {
                const sectorData = await fetchSectors();
                setSectors(sectorData);

                const storedSubmissionId = localStorage.getItem('submissionId');
                if (storedSubmissionId) {
                    const submissionIdNum = Number(storedSubmissionId);
                    setSubmissionId(submissionIdNum);
                    const submissionData = await fetchSubmission(submissionIdNum);
                    setName(submissionData.name);
                    setSelectedSectors(submissionData.selectedSectors.map(sector => sector.id.toString()));
                    setAgreeToTerms(submissionData.agreeToTerms);
                }
            } catch (error) {
                console.error('Error during initial data load:', error);
                setGeneralFormError(error.message || 'Failed to load initial data (sectors or saved submission). Please check your connection.');
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
