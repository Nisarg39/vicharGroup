"use client"
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createExam, getDefaultNegativeMarking } from '../../../../../server_actions/actions/examController/collegeActions';
import ExamList from './ExamList';
import { toast } from 'react-hot-toast';
import { data } from '../../../../../utils/examUtils/subject_Details';
import { VicharCard, VicharCardHeader, VicharCardTitle, VicharCardContent } from '@/components/ui/vichar-card';
import { VicharButton } from '@/components/ui/vichar-button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export default function CreateExam({ onBack, collegeData }) {
    const [examListRefreshKey, setExamListRefreshKey] = useState(Date.now());
    const form = useForm({
        defaultValues: {
            examName: '',
            examAvailability: '',
            examType: '',
            examInstructions: '',
            examDate: '',
            examTime: '',
            stream: '',
            examSubject: [],
            standard: '',
            section: '',
            startTime: '',
            endTime: '',
            examDurationMinutes: '',
            status: 'draft',
            totalMarks: 0,
            passingMarks: 0,
            negativeMarks: 0,
            questionShuffle: false,
            reattempt: 0,
            examGroup: null,
            collegeId: collegeData._id
        }
    });
    const { watch, setValue, getValues, handleSubmit, reset } = form;
    const formData = watch();

    // Handle stream change: auto-select subjects and set negative marking
    useEffect(() => {
        if (formData.stream) {
            const streamData = data[formData.stream];
            let autoSubjects = [];
            if (streamData) {
                if (formData.standard) {
                    autoSubjects = Object.keys(streamData).filter(subject => streamData[subject][formData.standard]);
                } else {
                    const subjectSet = new Set();
                    Object.keys(streamData).forEach(subject => {
                        if (typeof streamData[subject] === 'object') {
                            Object.keys(streamData[subject]).forEach(std => {
                                subjectSet.add(subject);
                            });
                        }
                    });
                    autoSubjects = Array.from(subjectSet);
                }
            }
            setValue('examSubject', autoSubjects);
            setValue('standard', '');
            setValue('section', '');
            
            // Fetch default negative marking from college rules
            const fetchDefaultNegativeMarking = async () => {
                try {
                    const response = await getDefaultNegativeMarking(
                        collegeData._id,
                        formData.stream,
                        formData.standard,
                        autoSubjects[0] // Use first subject as reference
                    );
                    if (response.success) {
                        setValue('negativeMarks', response.negativeMarks);
                    }
                } catch (error) {
                    console.error('Error fetching default negative marking:', error);
                    // Fallback to hardcoded data if college rules fail
                    const fallbackNegativeMarks = streamData?.negativeMarking?.value ?? 0;
                    setValue('negativeMarks', fallbackNegativeMarks);
                }
            };
            
            fetchDefaultNegativeMarking();
        }
        // eslint-disable-next-line
    }, [formData.stream]);

    // Handle standard change: auto-select subjects and update negative marking
    useEffect(() => {
        if (formData.stream && formData.standard) {
            const streamData = data[formData.stream];
            let autoSubjects = [];
            if (streamData) {
                autoSubjects = Object.keys(streamData).filter(subject => streamData[subject][formData.standard]);
            }
            setValue('examSubject', autoSubjects);
            setValue('section', '');
            
            // Update negative marking for the specific standard
            const fetchUpdatedNegativeMarking = async () => {
                try {
                    const response = await getDefaultNegativeMarking(
                        collegeData._id,
                        formData.stream,
                        formData.standard,
                        autoSubjects[0] // Use first subject as reference
                    );
                    if (response.success) {
                        setValue('negativeMarks', response.negativeMarks);
                    }
                } catch (error) {
                    console.error('Error fetching updated negative marking:', error);
                }
            };
            
            fetchUpdatedNegativeMarking();
        }
        // eslint-disable-next-line
    }, [formData.standard]);

    // Handle examAvailability change: clear times if practice
    useEffect(() => {
        if (formData.examAvailability === 'practice') {
            setValue('startTime', '');
            setValue('endTime', '');
        }
        // eslint-disable-next-line
    }, [formData.examAvailability]);

    const handleSubjectChange = (subject) => {
        const currentSubjects = getValues('examSubject') || [];
        if (currentSubjects.includes(subject)) {
            setValue('examSubject', currentSubjects.filter(s => s !== subject));
        } else {
            setValue('examSubject', [...currentSubjects, subject]);
        }
    };

    const onSubmit = async (values) => {
        if (!values.examSubject || values.examSubject.length === 0) {
            toast.error("Please select at least one subject for the exam.");
            return;
        }
        const cleanStandard = typeof values.standard === 'string' ? values.standard.replace(/[^0-9]/g, '') : values.standard;
        const cleanExamData = {
            examName: values.examName,
            examAvailability: values.examAvailability,
            examType: values.examType,
            examInstructions: values.examInstructions,
            stream: values.stream,
            examSubject: values.examSubject,
            standard: cleanStandard,
            section: values.section,
            startTime: values.examAvailability === 'scheduled' ? new Date(values.startTime).toISOString() : null,
            endTime: values.examAvailability === 'scheduled' ? new Date(values.endTime).toISOString() : null,
            examDurationMinutes: values.examDurationMinutes,
            status: 'draft',
            totalMarks: values.totalMarks || 0,
            passingMarks: values.passingMarks || 0,
            negativeMarks: values.negativeMarks || 0,
            questionShuffle: values.questionShuffle || false,
            reattempt: values.reattempt || 0
        };
        try {
            const response = await createExam(cleanExamData, collegeData._id);
            if (response.success) {
                toast.success("Exam created successfully!");
                setExamListRefreshKey(Date.now());
                reset();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Error creating exam. Please try again.");
            console.error("Create exam error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-2 py-6 max-w-7xl">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Create New Exam
                                </h1>
                                <p className="text-gray-600 mt-1">Design and configure your examination</p>
                            </div>
                        </div>
                        <VicharButton onClick={onBack} variant="outline" className="flex items-center gap-2 px-6 py-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </VicharButton>
                    </div>
                    <VicharCard>
                        <VicharCardHeader>
                            <VicharCardTitle>Create Exam</VicharCardTitle>
                        </VicharCardHeader>
                        <VicharCardContent>
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <FormField name="examName" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exam Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter exam name" required />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="examAvailability" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exam Type <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Exam Type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="scheduled">📅 Scheduled</SelectItem>
                                                            <SelectItem value="practice">🎯 Practice</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        {formData.examAvailability !== 'practice' && (
                                            <>
                                                <FormField name="startTime" control={form.control} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Date & Time <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="datetime-local" required={formData.examAvailability === 'scheduled'} />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField name="endTime" control={form.control} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Date & Time <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="datetime-local" required={formData.examAvailability === 'scheduled'} />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                            </>
                                        )}
                                        <FormField name="examDurationMinutes" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration (in minutes)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="stream" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stream</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Stream" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {collegeData?.allocatedStreams && collegeData.allocatedStreams.length > 0 ? (
                                                                collegeData.allocatedStreams.map((stream) => (
                                                                    <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="" disabled>No streams allocated</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="examSubject" control={form.control} render={() => (
                                            <FormItem>
                                                <FormLabel>Subjects <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                        {!formData.stream ? (
                                                            <p className="text-sm text-gray-500 italic">Please select a stream first</p>
                                                        ) : collegeData?.allocatedSubjects?.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {collegeData.allocatedSubjects.map((subject) => (
                                                                    <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                                                        <Checkbox
                                                                            checked={formData.examSubject.includes(subject)}
                                                                            onCheckedChange={() => handleSubjectChange(subject)}
                                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-700">{subject}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">No subjects allocated to this college</p>
                                                        )}
                                                        {formData.examSubject.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <p className="text-xs text-gray-600">
                                                                    Selected: <span className="font-medium">{formData.examSubject.join(', ')}</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="standard" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Standard</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange} disabled={formData.examSubject.length === 0} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Standard" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {collegeData?.allocatedClasses && collegeData.allocatedClasses.length > 0 ? (
                                                                collegeData.allocatedClasses.map((cls) => (
                                                                    <SelectItem key={cls} value={cls}>{cls}th</SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="" disabled>No classes allocated</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        {formData.stream === 'JEE' && (
                                            <FormField name="section" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Section <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange} required={formData.stream === 'JEE'}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Section" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Section A">Section A</SelectItem>
                                                                <SelectItem value="Section B">Section B</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        )}
                                        {/* Positive Marking Display */}
                                        {formData.stream && data[formData.stream]?.positiveMarking && (
                                            <div className="flex flex-col mb-2">
                                                <label className="text-sm font-medium text-gray-700 mb-1">
                                                    Positive Marking
                                                </label>
                                                <span className="text-xs text-green-600">
                                                    {(() => {
                                                        const pm = data[formData.stream].positiveMarking;
                                                        if (formData.stream === 'MHT-CET' && formData.examSubject.length === 1) {
                                                            const subj = formData.examSubject[0];
                                                            const val = pm.value[subj] || pm.value[Object.keys(pm.value)[0]];
                                                            return `+${val} for each correct answer in ${subj}`;
                                                        }
                                                        return pm.rule;
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                        <FormField name="negativeMarks" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Negative Marking</FormLabel>
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        <Input {...field} type="number" step="0.01" />
                                                        {formData.stream && (
                                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                                                <span className="font-medium">💡 Using college default: </span>
                                                                {field.value > 0 
                                                                    ? `-${field.value} marks for each wrong answer`
                                                                    : 'No negative marking'
                                                                }
                                                                <br />
                                                                <span className="text-gray-600">You can override this value if needed</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="flex justify-end">
                                        <VicharButton type="submit" className="px-8 py-3">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Exam
                                            </span>
                                        </VicharButton>
                                    </div>
                                </form>
                            </Form>
                        </VicharCardContent>
                    </VicharCard>
                    <VicharCard className="mt-6">
                        <VicharCardHeader>
                            <VicharCardTitle>Exam List</VicharCardTitle>
                        </VicharCardHeader>
                        <VicharCardContent>
                            <ExamList collegeData={collegeData} refreshKey={examListRefreshKey} />
                        </VicharCardContent>
                    </VicharCard>
                </div>
            </div>
        </div>
    );
}