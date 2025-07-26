"use client"
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
    createNegativeMarkingRule, 
    getNegativeMarkingRules, 
    updateNegativeMarkingRule, 
    deleteNegativeMarkingRule 
} from '../../../../server_actions/actions/examController/collegeActions';
import { VicharCard, VicharCardHeader, VicharCardTitle, VicharCardContent } from '@/components/ui/vichar-card';
import { VicharButton } from '@/components/ui/vichar-button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function NegativeMarkingSettings({ collegeData, onBack }) {
    const [rules, setRules] = useState([]);
    const [editingRule, setEditingRule] = useState(null);
    const [loading, setLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            stream: '',
            standard: '',
            subject: '',
            negativeMarks: 0,
            description: '',
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
            const response = await getNegativeMarkingRules(collegeData._id);
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
            const ruleData = {
                stream: data.stream,
                standard: data.standard || null,
                subject: data.subject || null,
                negativeMarks: parseFloat(data.negativeMarks) || 0,
                description: data.description || null,
                priority: parseInt(data.priority) || 0
            };

            let response;
            if (editingRule) {
                response = await updateNegativeMarkingRule(editingRule._id, ruleData, collegeData._id);
            } else {
                response = await createNegativeMarkingRule(ruleData, collegeData._id);
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
        form.setValue('description', rule.description || '');
        form.setValue('priority', rule.priority);
    };

    const handleDelete = async (ruleId) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        
        try {
            const response = await deleteNegativeMarkingRule(ruleId, collegeData._id);
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

    const cancelEdit = () => {
        setEditingRule(null);
        reset();
    };

    const getRuleScope = (rule) => {
        if (rule.subject) return `${rule.stream} > ${rule.standard}th > ${rule.subject}`;
        if (rule.standard) return `${rule.stream} > ${rule.standard}th`;
        return `${rule.stream} (All)`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-2 py-6 max-w-7xl">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Negative Marking Settings
                                </h1>
                                <p className="text-gray-600 mt-1">Configure default negative marking rules for your exams</p>
                            </div>
                        </div>
                        <VicharButton onClick={onBack} variant="outline" className="flex items-center gap-2 px-6 py-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </VicharButton>
                    </div>

                    {/* Add/Edit Rule Form */}
                    <VicharCard>
                        <VicharCardHeader>
                            <VicharCardTitle>
                                {editingRule ? 'Edit Negative Marking Rule' : 'Add New Rule'}
                            </VicharCardTitle>
                        </VicharCardHeader>
                        <VicharCardContent>
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <FormField name="stream" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stream <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Stream" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {collegeData?.allocatedStreams?.map((stream) => (
                                                                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField name="standard" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Standard (Optional)</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value || "all_standards"} onValueChange={(value) => field.onChange(value === "all_standards" ? "" : value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All Standards" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all_standards">All Standards</SelectItem>
                                                            {collegeData?.allocatedClasses?.map((cls) => (
                                                                <SelectItem key={cls} value={cls}>{cls}th</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField name="subject" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject (Optional)</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value || "all_subjects"} onValueChange={(value) => field.onChange(value === "all_subjects" ? "" : value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All Subjects" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all_subjects">All Subjects</SelectItem>
                                                            {collegeData?.allocatedSubjects?.map((subject) => (
                                                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <FormField name="negativeMarks" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Negative Marks <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.01" min="0" placeholder="0.25" required />
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField name="priority" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Priority</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" min="0" placeholder="0" />
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField name="description" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., -0.25 for each wrong answer" />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        {editingRule && (
                                            <VicharButton type="button" variant="outline" onClick={cancelEdit}>
                                                Cancel
                                            </VicharButton>
                                        )}
                                        <VicharButton type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Add Rule')}
                                        </VicharButton>
                                    </div>
                                </form>
                            </Form>
                        </VicharCardContent>
                    </VicharCard>

                    {/* Rules List */}
                    <VicharCard>
                        <VicharCardHeader>
                            <VicharCardTitle>Current Negative Marking Rules</VicharCardTitle>
                        </VicharCardHeader>
                        <VicharCardContent>
                            {rules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p>No negative marking rules configured yet.</p>
                                    <p className="text-sm">Add your first rule to get started!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Scope</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Negative Marks</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rules.map((rule) => (
                                                <tr key={rule._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-blue-600">{getRuleScope(rule)}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                                            -{rule.negativeMarks}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {rule.description || '-'}
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
                        </VicharCardContent>
                    </VicharCard>

                    {/* Help Section */}
                    <VicharCard>
                        <VicharCardHeader>
                            <VicharCardTitle>How It Works</VicharCardTitle>
                        </VicharCardHeader>
                        <VicharCardContent>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Rule Priority</p>
                                        <p>More specific rules override general ones: Subject-specific → Standard-specific → Stream-wide → Global default</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">2</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Auto-Application</p>
                                        <p>When creating exams, the most specific matching rule will be automatically applied</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">3</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Override Capability</p>
                                        <p>You can still manually change negative marking for individual exams when needed</p>
                                    </div>
                                </div>
                            </div>
                        </VicharCardContent>
                    </VicharCard>
                </div>
            </div>
        </div>
    );
}