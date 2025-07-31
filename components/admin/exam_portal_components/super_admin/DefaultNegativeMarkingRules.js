"use client"
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
    createDefaultNegativeMarkingRule, 
    getDefaultNegativeMarkingRules, 
    updateDefaultNegativeMarkingRule, 
    deleteDefaultNegativeMarkingRule,
    migrateNegativeMarkingRules
} from '../../../../server_actions/actions/adminActions';
import negativeMarkingRulesData from '../../../../utils/examUtils/negative_marking_rules';

export default function DefaultNegativeMarkingRules({ onBack }) {
    const [rules, setRules] = useState([]);
    const [editingRule, setEditingRule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showMigrationSection, setShowMigrationSection] = useState(false);

    const form = useForm({
        defaultValues: {
            stream: '',
            standard: '',
            subject: '',
            negativeMarks: 0,
            positiveMarks: 4,
            description: '',
            examType: '',
            conductedBy: '',
            questionType: '',
            priority: 0
        }
    });

    const { handleSubmit, reset, watch } = form;
    const formData = watch();

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await getDefaultNegativeMarkingRules();
            if (response.success) {
                setRules(JSON.parse(response.rules));
            }
        } catch (error) {
            toast.error('Failed to fetch rules');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('isAdmin');
            if (!adminToken) {
                toast.error('Admin authentication required');
                return;
            }

            const ruleData = {
                stream: data.stream,
                standard: data.standard || null,
                subject: data.subject || null,
                negativeMarks: parseFloat(data.negativeMarks) || 0,
                positiveMarks: parseFloat(data.positiveMarks) || 4,
                description: data.description || null,
                examType: data.examType || null,
                conductedBy: data.conductedBy || null,
                questionType: data.questionType || null,
                priority: parseInt(data.priority) || 0
            };

            let response;
            if (editingRule) {
                response = await updateDefaultNegativeMarkingRule(editingRule._id, ruleData);
            } else {
                // For creating, we need to pass admin ID (decode from token or get from context)
                response = await createDefaultNegativeMarkingRule(ruleData, '000000000000000000000001'); // Placeholder admin ID
            }

            if (response.success) {
                toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
                reset();
                setEditingRule(null);
                fetchRules();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to save rule');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        form.setValue('stream', rule.stream);
        form.setValue('standard', rule.standard || '');
        form.setValue('subject', rule.subject || '');
        form.setValue('negativeMarks', rule.negativeMarks);
        form.setValue('positiveMarks', rule.positiveMarks || 4);
        form.setValue('description', rule.description || '');
        form.setValue('examType', rule.examType || '');
        form.setValue('conductedBy', rule.conductedBy || '');
        form.setValue('questionType', rule.questionType || '');
        form.setValue('priority', rule.priority);
    };

    const handleDelete = async (ruleId) => {
        if (!confirm('Are you sure you want to delete this rule? This will affect all future colleges.')) return;
        
        try {
            const response = await deleteDefaultNegativeMarkingRule(ruleId);
            if (response.success) {
                toast.success('Rule deleted successfully');
                fetchRules();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    const handleMigration = async () => {
        if (!confirm('This will migrate data from negative_marking_rules.js. Continue?')) return;
        
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('isAdmin');
            if (!adminToken) {
                toast.error('Admin authentication required');
                setLoading(false);
                return;
            }

            // For now, we'll use a placeholder admin ID - you may need to decode the JWT token to get the actual ID
            const response = await migrateNegativeMarkingRules(negativeMarkingRulesData, '000000000000000000000001');
            if (response.success) {
                toast.success(response.message);
                fetchRules();
                setShowMigrationSection(false);
            } else {
                toast.error(response.message);
                console.error('Migration error:', response.message);
            }
        } catch (error) {
            console.error('Migration failed:', error);
            toast.error('Migration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingRule(null);
        reset();
    };

    const getRuleScope = (rule) => {
        let scope = rule.stream;
        if (rule.standard) scope += ` > ${rule.standard}th`;
        if (rule.subject) scope += ` > ${rule.subject}`;
        if (rule.questionType) scope += ` > ${rule.questionType}`;
        return scope;
    };

    const streamOptions = ['JEE', 'NEET', 'MHT-CET'];
    const standardOptions = ['11', '12'];
    const subjectOptions = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
    const questionTypeOptions = ['MCQ', 'MCMA', 'Numerical'];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Default Negative Marking Rules
                            </h1>
                            <p className="text-gray-600 mt-1">Configure default rules that apply to all new colleges</p>
                        </div>
                    </div>
                    <button 
                        onClick={onBack}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* Migration Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Data Migration</h3>
                                <p className="text-gray-600 text-sm">Import rules from negative_marking_rules.js file</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowMigrationSection(!showMigrationSection)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    {showMigrationSection ? 'Hide' : 'Show'} Migration
                                </button>
                            </div>
                        </div>
                        
                        {showMigrationSection && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-800">
                                            This will create default rules based on JEE Main, NEET, and MHT-CET marking schemes.
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Found {negativeMarkingRulesData.exams.length} exam configurations to migrate.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleMigration}
                                        disabled={loading}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Migrating...' : 'Start Migration'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Rule Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingRule ? 'Edit Default Rule' : 'Add New Default Rule'}
                        </h3>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stream <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        {...form.register('stream', { required: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Stream</option>
                                        {streamOptions.map(stream => (
                                            <option key={stream} value={stream}>{stream}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Standard (Optional)
                                    </label>
                                    <select 
                                        {...form.register('standard')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Standards</option>
                                        {standardOptions.map(std => (
                                            <option key={std} value={std}>{std}th</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject (Optional)
                                    </label>
                                    <select 
                                        {...form.register('subject')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjectOptions.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Type (Optional)
                                    </label>
                                    <select 
                                        {...form.register('questionType')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        {questionTypeOptions.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Negative Marks <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        {...form.register('negativeMarks', { required: true })}
                                        type="number" 
                                        step="0.01" 
                                        min="0" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.25"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Positive Marks
                                    </label>
                                    <input 
                                        {...form.register('positiveMarks')}
                                        type="number" 
                                        step="0.01" 
                                        min="0" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <input 
                                        {...form.register('priority')}
                                        type="number" 
                                        min="0" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Type
                                    </label>
                                    <input 
                                        {...form.register('examType')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="JEE Main"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conducted By
                                    </label>
                                    <input 
                                        {...form.register('conductedBy')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="NTA"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <input 
                                        {...form.register('description')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., -0.25 for each wrong answer"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                {editingRule && (
                                    <button type="button" onClick={cancelEdit} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Add Rule')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Rules List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Default Rules</h3>
                        
                        {rules.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p>No default rules configured yet.</p>
                                <p className="text-sm">Add your first rule or use migration to get started!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Scope</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Negative Marks</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Positive Marks</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Exam Type</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rules.map((rule) => (
                                            <tr key={rule._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-blue-600">{getRuleScope(rule)}</span>
                                                    {rule.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{rule.description}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                                        -{rule.negativeMarks}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                        +{rule.positiveMarks || 4}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">
                                                    {rule.examType || '-'}
                                                    {rule.conductedBy && (
                                                        <p className="text-xs text-gray-400">{rule.conductedBy}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                                        {rule.priority}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(rule)}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rule._id)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">How It Works</h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                                <div>
                                    <p className="font-medium text-gray-800">Default Templates</p>
                                    <p>These rules serve as templates that are automatically applied to all newly created colleges</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">2</span>
                                <div>
                                    <p className="font-medium text-gray-800">College Independence</p>
                                    <p>Once applied, colleges can modify their own rules independently without affecting others</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">3</span>
                                <div>
                                    <p className="font-medium text-gray-800">Priority System</p>
                                    <p>Higher priority rules (specific subjects/question types) override lower priority ones (general stream rules)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}