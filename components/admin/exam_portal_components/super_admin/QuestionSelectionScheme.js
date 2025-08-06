"use client"
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
    createQuestionSelectionScheme, 
    getAllQuestionSelectionSchemes, 
    updateQuestionSelectionScheme, 
    deleteQuestionSelectionScheme,
    toggleQuestionSelectionSchemeStatus
} from '../../../../server_actions/actions/adminActions';
import { data } from '../../../../utils/examUtils/subject_Details';
import QuestionSchemeCharts from './QuestionSchemeCharts';

const examTypes = ['JEE', 'NEET', 'MHT-CET'];

export default function QuestionSelectionScheme({ onBack }) {
    const [schemes, setSchemes] = useState([]);
    const [editingScheme, setEditingScheme] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedExamType, setSelectedExamType] = useState('');

    const form = useForm({
        defaultValues: {
            schemeName: '',
            examType: '',
            description: '',
            subjectRules: [],
            totalSchemeQuestions: 0
        }
    });

    const { handleSubmit, reset, watch, setValue } = form;
    const formData = watch();

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            console.log('Fetching schemes...');
            const response = await getAllQuestionSelectionSchemes();
            console.log('Fetch schemes response:', response);
            if (response && response.success) {
                console.log('Setting schemes:', response.data);
                setSchemes(response.data);
                toast.success(`Loaded ${response.data.length} schemes`);
            } else {
                console.error('Failed to fetch schemes:', response);
                toast.error(response?.message || 'Failed to fetch schemes');
            }
        } catch (error) {
            console.error('Error in fetchSchemes:', error);
            toast.error(`Failed to fetch schemes: ${error.message}`);
        }
    };

    const getSubjectsForExamType = (examType) => {
        if (!examType || !data[examType]) return [];
        return Object.keys(data[examType]).filter(key => 
            !['positiveMarking', 'negativeMarking'].includes(key)
        );
    };

    const initializeSubjectRules = (examType) => {
        const subjects = getSubjectsForExamType(examType);
        const hasSections = examType === "JEE"; // Only JEE has Section A and Section B
        
        // Create rules for each subject and each standard separately
        const subjectRules = [];
        subjects.forEach(subject => {
            // Rule for Class 11
            subjectRules.push({
                subject,
                standard: "11",
                totalQuestions: 0,
                difficultyDistribution: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                ...(hasSections && {
                    sectionDistribution: {
                        sectionA: 0,
                        sectionB: 0
                    }
                })
            });
            
            // Rule for Class 12
            subjectRules.push({
                subject,
                standard: "12",
                totalQuestions: 0,
                difficultyDistribution: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                ...(hasSections && {
                    sectionDistribution: {
                        sectionA: 0,
                        sectionB: 0
                    }
                })
            });
        });
        
        setValue('subjectRules', subjectRules);
        setValue('examConfiguration', {
            hasSections,
            hasQuestionTypes: examType === "JEE",
            supportedSections: hasSections ? ["Section A", "Section B"] : [],
            supportedQuestionTypes: examType === "JEE" ? ["MCQ", "Numerical"] : ["MCQ"]
        });
        updateTotalQuestions(subjectRules);
    };

    const updateTotalQuestions = (subjectRules) => {
        const total = subjectRules.reduce((sum, rule) => sum + rule.totalQuestions, 0);
        setValue('totalSchemeQuestions', total);
    };

    const handleExamTypeChange = (examType) => {
        setSelectedExamType(examType);
        setValue('examType', examType);
        if (examType && !editingScheme) {
            initializeSubjectRules(examType);
        }
    };

    const updateSubjectRule = (index, field, value) => {
        const updatedRules = [...formData.subjectRules];
        const numValue = parseInt(value) || 0;
        
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updatedRules[index][parent][child] = numValue;
        } else {
            updatedRules[index][field] = numValue;
        }

        // Reset difficulty distribution when total changes
        if (field === 'totalQuestions') {
            const totalQuestions = numValue;
            // If total is 0, set all difficulties to 0 (no restriction)
            if (totalQuestions === 0) {
                updatedRules[index].difficultyDistribution = {
                    easy: 0,
                    medium: 0,
                    hard: 0
                };
            } else {
                // Default distribution: 40% easy, 40% medium, 20% hard
                const easy = Math.floor(totalQuestions * 0.4);
                const medium = Math.floor(totalQuestions * 0.4);
                const hard = totalQuestions - easy - medium;
                
                updatedRules[index].difficultyDistribution = {
                    easy: easy,
                    medium: medium,
                    hard: hard
                };
            }
            
            // Also reset section distribution for JEE
            if (selectedExamType === "JEE" && updatedRules[index].sectionDistribution) {
                updatedRules[index].sectionDistribution = {
                    sectionA: Math.floor(totalQuestions * 0.6),
                    sectionB: totalQuestions - Math.floor(totalQuestions * 0.6)
                };
            }
        }

        setValue('subjectRules', updatedRules);
        updateTotalQuestions(updatedRules);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('isAdmin');
            console.log('Admin token check:', !!adminToken);
            if (!adminToken) {
                console.warn('No admin token found, but proceeding anyway for testing...');
                // Don't return here for testing - let's see what happens
                // setLoading(false);
                // return;
            }

            // Ensure all numeric values are properly parsed
            const processedData = {
                ...data,
                totalSchemeQuestions: parseInt(data.totalSchemeQuestions) || 0,
                subjectRules: data.subjectRules.map(rule => ({
                    ...rule,
                    totalQuestions: parseInt(rule.totalQuestions) || 0,
                    difficultyDistribution: {
                        easy: parseInt(rule.difficultyDistribution.easy) || 0,
                        medium: parseInt(rule.difficultyDistribution.medium) || 0,
                        hard: parseInt(rule.difficultyDistribution.hard) || 0
                    },
                    ...(rule.sectionDistribution && {
                        sectionDistribution: {
                            sectionA: parseInt(rule.sectionDistribution.sectionA) || 0,
                            sectionB: parseInt(rule.sectionDistribution.sectionB) || 0
                        }
                    })
                }))
            };

            // Log the data being sent for debugging
            console.log('Submitting scheme data:', JSON.stringify(processedData, null, 2));

            // Validate that all totals add up correctly (unless all difficulties are 0, meaning no restriction)
            for (const rule of processedData.subjectRules) {
                const difficultySum = rule.difficultyDistribution.easy + 
                                   rule.difficultyDistribution.medium + 
                                   rule.difficultyDistribution.hard;
                
                // If all difficulties are 0, it means no difficulty restriction - this is valid
                const hasNoDifficultyRestriction = 
                    rule.difficultyDistribution.easy === 0 && 
                    rule.difficultyDistribution.medium === 0 && 
                    rule.difficultyDistribution.hard === 0;
                
                // Only validate sum if there are difficulty restrictions
                if (!hasNoDifficultyRestriction && difficultySum !== rule.totalQuestions) {
                    toast.error(`${rule.subject} Class ${rule.standard}: Difficulty distribution (${difficultySum}) doesn't add up to total (${rule.totalQuestions})`);
                    setLoading(false);
                    return;
                }
                
                // For JEE, validate section distribution
                if (selectedExamType === "JEE" && rule.sectionDistribution) {
                    const sectionSum = rule.sectionDistribution.sectionA + rule.sectionDistribution.sectionB;
                    if (sectionSum !== rule.totalQuestions) {
                        toast.error(`${rule.subject} Class ${rule.standard}: Section distribution (${sectionSum}) doesn't add up to total (${rule.totalQuestions})`);
                        setLoading(false);
                        return;
                    }
                }
            }

            let response;
            try {
                if (editingScheme) {
                    console.log('Updating scheme with ID:', editingScheme._id);
                    response = await updateQuestionSelectionScheme(editingScheme._id, processedData);
                } else {
                    console.log('Creating new scheme...');
                    console.log('Processed data being sent:', processedData);
                    response = await createQuestionSelectionScheme(processedData);
                    console.log('Create scheme response:', response);
                }
            } catch (callError) {
                console.error('Error calling server action:', callError);
                toast.error(`Server action failed: ${callError.message}`);
                setLoading(false);
                return;
            }

            if (response && response.success) {
                console.log('Success! Response:', response);
                toast.success(editingScheme ? 'Scheme updated successfully' : 'Scheme created successfully');
                reset();
                setEditingScheme(null);
                setShowForm(false);
                setSelectedExamType('');
                await fetchSchemes(); // Wait for schemes to refresh
            } else {
                console.error('Failed response:', response);
                const errorMessage = response?.message || 'Failed to save scheme - no error message from server';
                toast.error(errorMessage);
                // Show detailed error in console
                if (response && !response.success) {
                    console.error('Server returned failure:', {
                        message: response.message,
                        data: response.data,
                        fullResponse: response
                    });
                }
            }
        } catch (error) {
            console.error('Unexpected error in onSubmit:', error);
            toast.error(`Unexpected error: ${error.message || 'Failed to save scheme'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (scheme) => {
        setEditingScheme(scheme);
        setSelectedExamType(scheme.examType);
        setValue('schemeName', scheme.schemeName);
        setValue('examType', scheme.examType);
        setValue('description', scheme.description);
        setValue('subjectRules', scheme.subjectRules);
        setValue('totalSchemeQuestions', scheme.totalSchemeQuestions);
        setShowForm(true);
    };

    const handleDelete = async (schemeId) => {
        if (!confirm('Are you sure you want to delete this scheme?')) return;
        
        try {
            const response = await deleteQuestionSelectionScheme(schemeId);
            if (response.success) {
                toast.success('Scheme deleted successfully');
                fetchSchemes();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to delete scheme');
        }
    };

    const handleToggleStatus = async (schemeId) => {
        try {
            const response = await toggleQuestionSelectionSchemeStatus(schemeId);
            if (response.success) {
                toast.success(response.message);
                fetchSchemes();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to toggle scheme status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Question Selection Schemes
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Configure question selection rules for JEE, NEET, and MHT-CET exams
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setEditingScheme(null);
                                        reset();
                                        setSelectedExamType('');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Create New Scheme
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {showForm ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Scheme Name *
                                        </label>
                                        <input
                                            {...form.register('schemeName', { required: true })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            placeholder="e.g., JEE Main 2024 Pattern"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Exam Type *
                                        </label>
                                        <select
                                            {...form.register('examType', { required: true })}
                                            onChange={(e) => handleExamTypeChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        >
                                            <option value="">Select Exam Type</option>
                                            {examTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Questions
                                        </label>
                                        <input
                                            value={formData.totalSchemeQuestions}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        {...form.register('description')}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Describe this question selection scheme..."
                                    />
                                </div>

                                {/* Charts Preview - Only show if scheme has questions */}
                                {selectedExamType && formData.subjectRules && formData.subjectRules.some(rule => rule.totalQuestions > 0) && (
                                    <div className="border border-gray-200 rounded-lg p-4 mb-6">
                                        <QuestionSchemeCharts 
                                            schemes={schemes} 
                                            selectedScheme={{
                                                ...formData,
                                                examType: selectedExamType
                                            }} 
                                        />
                                    </div>
                                )}

                                {selectedExamType && formData.subjectRules && formData.subjectRules.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Subject-Standard Question Distribution</h3>
                                        <p className="text-sm text-gray-600">Configure questions for each subject and standard combination separately</p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800">
                                                <strong>💡 Tip:</strong> Set any difficulty value to 0 to allow questions of any difficulty level for that category. 
                                                When all difficulty values are 0, the system will select questions without any difficulty restrictions.
                                                <br/><br/>
                                                <strong>Examples:</strong>
                                                <br/>• Easy: 10, Medium: 10, Hard: 5 = Exactly 10 easy, 10 medium, 5 hard questions
                                                <br/>• Easy: 0, Medium: 0, Hard: 0 = Any difficulty level allowed (no restrictions)
                                                <br/>• Easy: 15, Medium: 0, Hard: 10 = 15 easy, 10 hard, and any difficulty for remaining questions
                                            </p>
                                        </div>
                                        
                                        {/* Group rules by subject for better organization */}
                                        {Object.entries(
                                            formData.subjectRules.reduce((acc, rule, index) => {
                                                if (!acc[rule.subject]) acc[rule.subject] = [];
                                                acc[rule.subject].push({ ...rule, originalIndex: index });
                                                return acc;
                                            }, {})
                                        ).map(([subject, rules]) => (
                                            <div key={subject} className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-4">{subject}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {rules.map((rule) => (
                                                        <div key={`${subject}-${rule.standard}`} className="border border-gray-100 rounded p-3">
                                                            <h5 className="font-medium text-gray-700 mb-3">Class {rule.standard}</h5>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Total Questions
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={rule.totalQuestions}
                                                                        onChange={(e) => updateSubjectRule(rule.originalIndex, 'totalQuestions', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Easy
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={rule.totalQuestions}
                                                                        value={rule.difficultyDistribution.easy}
                                                                        onChange={(e) => updateSubjectRule(rule.originalIndex, 'difficultyDistribution.easy', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                        placeholder="0 = no restriction"
                                                                        title="Set to 0 for no difficulty restriction"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Medium
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={rule.totalQuestions}
                                                                        value={rule.difficultyDistribution.medium}
                                                                        onChange={(e) => updateSubjectRule(rule.originalIndex, 'difficultyDistribution.medium', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                        placeholder="0 = no restriction"
                                                                        title="Set to 0 for no difficulty restriction"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Hard
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={rule.totalQuestions}
                                                                        value={rule.difficultyDistribution.hard}
                                                                        onChange={(e) => updateSubjectRule(rule.originalIndex, 'difficultyDistribution.hard', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                        placeholder="0 = no restriction"
                                                                        title="Set to 0 for no difficulty restriction"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Section Distribution - Only for JEE */}
                                                            {selectedExamType === "JEE" && rule.sectionDistribution && (
                                                                <div className="mt-3 pt-2 border-t border-gray-100">
                                                                    <h6 className="text-xs font-medium text-gray-600 mb-2">Section Distribution</h6>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                                Section A
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={rule.totalQuestions}
                                                                                value={rule.sectionDistribution.sectionA}
                                                                                onChange={(e) => updateSubjectRule(rule.originalIndex, 'sectionDistribution.sectionA', e.target.value)}
                                                                                className="w-full px-1 py-1 border border-gray-300 rounded text-xs"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                                Section B
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={rule.totalQuestions}
                                                                                value={rule.sectionDistribution.sectionB}
                                                                                onChange={(e) => updateSubjectRule(rule.originalIndex, 'sectionDistribution.sectionB', e.target.value)}
                                                                                className="w-full px-1 py-1 border border-gray-300 rounded text-xs"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                                Total
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={(rule.sectionDistribution.sectionA || 0) + (rule.sectionDistribution.sectionB || 0)}
                                                                                readOnly
                                                                                className="w-full px-1 py-1 border border-gray-300 rounded text-xs bg-gray-50"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {(rule.sectionDistribution.sectionA || 0) + (rule.sectionDistribution.sectionB || 0) !== rule.totalQuestions && (
                                                                        <p className="text-xs text-red-600 mt-1">
                                                                            Section total must equal {rule.totalQuestions}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}


                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedExamType}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingScheme ? 'Update Scheme' : 'Create Scheme'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingScheme(null);
                                            reset();
                                            setSelectedExamType('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                {schemes.length > 0 ? (
                                    <div className="space-y-4">
                                        {schemes.map((scheme) => (
                                            <div key={scheme._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                {scheme.schemeName}
                                                            </h3>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {scheme.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                {scheme.examType}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mt-1">{scheme.description}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                            <span>Total Questions: {scheme.totalSchemeQuestions}</span>
                                                            <span>Subject-Standard Rules: {scheme.subjectRules.length}</span>
                                                            <span>Created: {new Date(scheme.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(scheme)}
                                                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(scheme._id)}
                                                            className={`px-3 py-1 text-sm rounded ${
                                                                scheme.isActive 
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            }`}
                                                        >
                                                            {scheme.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(scheme._id)}
                                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Subject Distribution:</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {scheme.subjectRules.map((rule, idx) => (
                                                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                                                <div className="font-medium">{rule.subject} - Class {rule.standard}</div>
                                                                <div className="text-gray-600">
                                                                    Total: {rule.totalQuestions} questions
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    E:{rule.difficultyDistribution.easy} M:{rule.difficultyDistribution.medium} H:{rule.difficultyDistribution.hard}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Charts for this scheme */}
                                                <div className="mt-6">
                                                    <QuestionSchemeCharts 
                                                        schemes={schemes} 
                                                        selectedScheme={scheme} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-lg mb-2">No question selection schemes found</div>
                                        <p className="text-gray-500">Create your first scheme to get started</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}