'use client'

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import axios from 'axios';
// Quill will be imported dynamically to avoid SSR issues
import { getTopics } from '../../../../../utils/examUtils/subject_Details';
import { addExamQuestion, updateExamQuestion } from '../../../../../server_actions/actions/adminActions';

// Dynamic import for ReactQuill with better error handling
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-[200px] flex items-center justify-center bg-gray-50">Loading editor...</div>
});

// CustomClipboard will be defined and registered inside the component when Quill is loaded

const getNextQuestionNumber = async (stream, standard, subject) => {
  try {
    const response = await fetch('https://api.drcexam.in/questions/getNextQuestionNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}` // Add the auth token
      },
      body: JSON.stringify({
        stream,
        standard,
        subject
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.nextQuestionNumber;
  } catch (error) {
    // Log the error for debugging
    console.log('Error getting next question number:', error);
    
    // Make a fallback API call to count existing questions and add 1
    try {
      const countResponse = await fetch('https://api.drcexam.in/questions/count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          stream,
          standard,
          subject
        })
      });
      
      const countData = await countResponse.json();
      return countData.count + 1;
    } catch (countError) {
      console.log('Fallback count failed:', countError);
      return Math.floor(Date.now() / 1000); // Use timestamp as last resort
    }
  }
};

const AddQuestion = ({ subjects, questionToEdit, onClose, onUpdate }) => {
  const quillRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);
  const [adminToken, setAdminToken] = useState(null);
  const [isQuillReady, setIsQuillReady] = useState(false);
  // Add error handling
  const [quillError, setQuillError] = useState(null);
  const [topics, setTopics] = useState([]); // Added topics state

//   console.log(subjects)
  const [formData, setFormData] = useState({
    stream: questionToEdit?.stream || '',
    subject: questionToEdit?.subject || '',
    standard: questionToEdit?.standard || '',
    section: questionToEdit?.section || '',
    topic: questionToEdit?.topic || '',
    question: questionToEdit?.question || '',
    optionA: questionToEdit?.options?.[0] || '',
    optionB: questionToEdit?.options?.[1] || '',
    optionC: questionToEdit?.options?.[2] || '',
    optionD: questionToEdit?.options?.[3] || '',
    answer: questionToEdit?.answer || '',
    marks: questionToEdit?.marks || '',
    userInputAnswer: questionToEdit?.userInputAnswer || false,
    isMultipleAnswer: questionToEdit?.isMultipleAnswer || false,
    multipleAnswer: questionToEdit?.multipleAnswer || [],
    difficultyLevel: questionToEdit?.difficultyLevel || 'Easy', // Default to Easy
  });
  
  const handleQuillError = useCallback((error) => {
    console.error('Quill error:', error);
    setQuillError(error);
  }, []);
  
  // Reset error when tab changes
  useEffect(() => {
    setQuillError(null);
  }, [tabValue]);
  
  // Initialize Quill modules only once
  useEffect(() => {
    if (typeof window !== 'undefined' && !isQuillReady) {
      const initQuill = async () => {
        try {
          const Quill = (await import('quill')).default;
          
          // Register CustomClipboard here when Quill is available
          if (!Quill.imports['modules/clipboard'] || !Quill.imports['modules/clipboard'].name?.includes('Custom')) {
            const Clipboard = Quill.import('modules/clipboard');
            
            class CustomClipboard extends Clipboard {
              onPaste(e) {
                const clipboardData = e.clipboardData || window.clipboardData;
                const items = clipboardData.items;
                
                for (const item of items) {
                  if (item.type.startsWith('image')) {
                    const file = item.getAsFile();
                    this.uploadImage(file);
                    e.preventDefault();
                    return;
                  }
                }
                super.onPaste(e);
              }

              async uploadImage(file) {
                try {
                  const fileName = `pasted_image_${Date.now()}.png`;
                  const response = await fetch('https://api.drcexam.in/getPreSignedURL', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                      fileName,
                      type: 'questionImage'
                    })
                  });

                  const data = await response.json();
                  const preSignedURL = data.url;

                  await fetch(preSignedURL, {
                    method: 'PUT',
                    body: file
                  });

                  const imageUrl = preSignedURL.split('?')[0];
                  const range = this.quill.getSelection();
                  this.quill.insertEmbed(range.index, 'image', imageUrl);
                } catch (error) {
                  console.error('Error uploading pasted image:', error);
                }
              }
            }
            
            Quill.register('modules/clipboard', CustomClipboard);
          }
          
          // Check if ImageResize is already registered
          if (!Quill.imports['modules/imageResize']) {
            const ImageResize = (await import('quill-image-resize-module-react')).default;
            Quill.register('modules/imageResize', ImageResize);
          }
          
          // Initialize KaTeX if not already done
          if (!window.katex) {
            const katex = await import('katex');
            window.katex = katex.default;
          }
          
          setIsQuillReady(true);
        } catch (error) {
          console.error('Error initializing Quill:', error);
          setIsQuillReady(true); // Set to true even on error to prevent infinite loading
        }
      };
      
      initQuill();
    }
  }, [isQuillReady, adminToken]);

  // Create a stable change handler using useCallback
  const handleQuillChange = useCallback((content) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (tabValue === 0) newData.question = content;
      else if (tabValue === 1) newData.optionA = content;
      else if (tabValue === 2) newData.optionB = content;
      else if (tabValue === 3) newData.optionC = content;
      else if (tabValue === 4) newData.optionD = content;
      return newData;
    });
  }, [tabValue]);

  // Get the current editor value based on tab
  const getCurrentEditorValue = useMemo(() => {
    switch (tabValue) {
      case 0: return formData.question;
      case 1: return formData.optionA;
      case 2: return formData.optionB;
      case 3: return formData.optionC;
      case 4: return formData.optionD;
      default: return '';
    }
  }, [tabValue, formData]);

  // Memoize the modules configuration to prevent re-creation on every render
  const modules = useMemo(() => {
    const baseModules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image', 'formula'],
          [{ 'color': [] }, { 'background': [] }],
          ['clean'],
          [{
            'special-chars': [
              '±', '∓', '×', '÷', '∑', '∏', 
              '√', '∛', '∜', '∫', '∮', '∯', '∰',
              '∂', '∇', '∆', '∞', '∝', '≈', '≠',
              '≡', '≤', '≥', '⊂', '⊃', '⊆', '⊇',
              '∈', '∉', '∋', '∌', '∩', '∪', '⊥',
              'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η',
              'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ',
              'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ',
              'ψ', 'ω', 'Δ', 'Π', 'Σ', 'Φ', 'Ψ',
              'Ω', '°', '′', '″', '℃', '℉', '⇒',
              '⇔', '←', '→', '↑', '↓', '↔', '↕'
            ]
          }]
        ],
        handlers: {
          'special-chars': function(value) {
            const cursorPosition = this.quill.getSelection().index;
            this.quill.insertText(cursorPosition, value);
            this.quill.setSelection(cursorPosition + 1);
          },
          image: function() {
            if (typeof window === 'undefined') return; // Guard for SSR
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = () => {
              const file = input.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (e) => {
                const editor = this.quill;
                const range = editor.getSelection(true);
              
                // Create temporary image to get dimensions
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                  // Calculate scaled dimensions to fit editor width
                  const maxWidth = editor.container.offsetWidth - 30; // Padding buffer
                  const ratio = maxWidth / img.width;
                  const width = Math.min(maxWidth, img.width);
                  const height = img.height * ratio;

                  // Insert image with calculated dimensions
                  if (range) {
                    editor.insertEmbed(range.index, 'image', e.target.result, 'user');
                    editor.formatText(range.index, 1, {
                      width: `${width}px`,
                      height: `${height}px`
                    });
                    editor.setSelection(range.index + 1);
                  }
                };
              };
              reader.readAsDataURL(file);
            };
          }
        }
      },
      clipboard: {
        matchVisual: false
      }
    };

    // Only add imageResize if we're on the client and Quill is ready
    if (typeof window !== 'undefined' && isQuillReady) {
      try {
        const Quill = window.Quill || require('quill');
        baseModules.imageResize = {
          parchment: Quill.import('parchment'),
          modules: ['Resize', 'DisplaySize'],
          displaySize: true
        };
      } catch (error) {
        console.log('Error setting up imageResize module:', error);
      }
    }

    return baseModules;
  }, [isQuillReady]);

  useEffect(() => {
    const getAdminToken = async () => {
      try {
        const response = await axios.post('https://api.drcexam.in/user/auth/signin', {
          email: 'admin.support@drcexam.in',
          password: 'Exam@2024',
          remember: true
        });
        const token = response.data.payload.token;
        setAdminToken(token);
      } catch (error) {
        console.log('Admin authentication error:', error);
      }
    };
    getAdminToken();
  }, []);

  useEffect(() => {
    const { stream, subject, standard } = formData;
    if (stream && subject && standard) {
      const topicsData = getTopics(stream, subject, standard);
      const topicsArray = Object.entries(topicsData);
      setTopics(topicsArray);
    } else {
      setTopics([]);
    }
  }, [formData.stream, formData.subject, formData.standard]);

  const [uploadedQuestionUrl, setUploadedQuestionUrl] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const processImages = async (questionContent) => {
    setIsUploading(true);
    if (typeof window === 'undefined') {
      setIsUploading(false);
      return questionContent;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(questionContent, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images) {
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:')) {
        const mime = src.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)[1];
        const base64Data = src.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length).fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: mime });
        const fileName = `image_${Date.now()}.png`;

        const response = await fetch('https://api.drcexam.in/getPreSignedURL', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            fileName,
            type: 'questionImage'
          })
        });

        const data = await response.json();
        const preSignedURL = data.payload;

        await fetch(preSignedURL, {
          method: 'PUT',
          body: file
        });

        const uploadedUrl = preSignedURL.split('?')[0];
        img.setAttribute('src', uploadedUrl);
      }
    }
    setIsUploading(false);
    return doc.body.innerHTML;
  };

  const [previewContent, setPreviewContent] = useState({
    question: '',
    optionA: '',
    optionB: '', 
    optionC: '',
    optionD: ''
  });

  const validateForm = () => {
    const requiredFields = {
      stream: 'Stream',
      standard: 'Standard', 
      subject: 'Subject',
      question: 'Question',
      marks: 'Marks',
      difficultyLevel: 'Difficulty Level' // Add difficulty validation
    };

    const errors = [];

    // Check required fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        errors.push(`${label} is required`);
      }
    });

    // Validate marks
    if (formData.marks && (isNaN(formData.marks) || formData.marks <= 0)) {
      errors.push('Marks must be a positive number');
    }

    // Validate answer based on type
    if (formData.userInputAnswer) {
      if (!formData.answer) {
        errors.push('Answer is required for user input questions');
      }
    } else if (formData.isMultipleAnswer) {
      if (formData.multipleAnswer.length < 2) {
        errors.push('Select at least 2 correct options for multiple answer questions');
      }
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
        errors.push('All options must be filled for multiple choice questions');
      }
    } else {
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
        errors.push('All options must be filled for multiple choice questions');
      }
      if (!['A', 'B', 'C', 'D'].includes(formData.answer)) {
        errors.push('Select one correct answer for single choice questions');
      }
    }

    return errors;
  }
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Process question and options
    const processedQuestion = await processImages(formData.question);
    const processedOptionA = await processImages(formData.optionA);
    const processedOptionB = await processImages(formData.optionB);
    const processedOptionC = await processImages(formData.optionC);
    const processedOptionD = await processImages(formData.optionD);

    // Update preview content
    setPreviewContent({
      question: processedQuestion,
      optionA: processedOptionA,
      optionB: processedOptionB,
      optionC: processedOptionC,
      optionD: processedOptionD
    });

    const questionData = {
      stream: formData.stream,
      standard: formData.standard,
      topic: formData.topic,
      question: processedQuestion,
      subject: formData.subject,
      marks: parseInt(formData.marks) || 4,
      section: parseInt(formData.section) || 1,
      userInputAnswer: formData.userInputAnswer,
      isMultipleAnswer: formData.isMultipleAnswer,
      answer: formData.isMultipleAnswer 
            ? formData.multipleAnswer[0] 
            : formData.answer,
      multipleAnswer: formData.isMultipleAnswer ? formData.multipleAnswer : [],
      options: formData.userInputAnswer ? [] : [
        processedOptionA,
        processedOptionB, 
        processedOptionC,
        processedOptionD
      ],
      difficultyLevel: formData.difficultyLevel,
    };

    try {
      let result;
      if (questionToEdit) {
        // Update existing question
        result = await updateExamQuestion({
          ...questionData,
          _id: questionToEdit._id,
          questionNumber: questionToEdit.questionNumber,
          difficultyLevel: formData.difficultyLevel
        });
      } else {
        // Create new question
        result = await addExamQuestion(questionData);
      }
      
      if (result.success) {
        alert(result.message);
        if (typeof onUpdate === 'function') {
          onUpdate();
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (error) {
      alert(error.message || 'Error processing question');
    }
  };

  const testS3Connection = async () => {
    try {
      const response = await fetch('https://api.drcexam.in/getPreSignedURL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          fileName: 'test.jpg',
          type: 'questionImage'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return null;
      }
      
      const data = await response.json();
      console.log('Pre-signed URL response:', data);
      return data;
    } catch (error) {
      console.log('Connection test error:', error);
      return null;
    }
  };

  // Clear dependent fields when parent selection changes
  const handleStreamChange = (e) => {
    setFormData({
      ...formData,
      stream: e.target.value,
      subject: '',
      user: '',
      standard: '',
      section: '',
      topic: ''
    });
  };

  const handleSubjectChange = (e) => {
    setFormData({
      ...formData,
      subject: e.target.value,
      standard: '',
      section: '',
      topic: ''
    });
  };

  const handleStandardChange = (e) => {
    setFormData({
      ...formData,
      standard: e.target.value,
      section: '',
      topic: ''
    });
  };

  useEffect(() => {
    // Focus the editor when it's ready and we're on the question tab
    if (isQuillReady && tabValue === 0 && quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.focus();
      
      // Place cursor at the end of existing content
      const length = editor.getLength();
      editor.setSelection(length, length);
    }
  }, [isQuillReady, tabValue]);

  // Keyboard shortcut handler for tab switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger on Ctrl+Arrow or Ctrl+Number
      if (e.ctrlKey) {
        // Ctrl+ArrowLeft/ArrowRight for previous/next tab
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setTabValue((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setTabValue((prev) => (prev < 5 ? prev + 1 : 5));
        }
        // Ctrl+1-6 for direct tab access (1=Question, 2=OptionA, ..., 6=Answer)
        if (e.key >= '1' && e.key <= '6') {
          e.preventDefault();
          setTabValue(Number(e.key) - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Add the new header section */}
      <div className="p-6 border-b">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1d77bc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={questionToEdit ? 
              "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" :
              "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
          </svg>
          {questionToEdit ? 'Update Question' : 'Add Question'}
        </h1>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
        <select 
          value={formData.stream}
          onChange={handleStreamChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
        >
          <option value="">Stream</option>
          <option value="NEET">NEET</option>
          <option value="JEE">JEE</option>
          <option value="MHT-CET">MHT-CET</option>
        </select>

        <select 
          value={formData.subject}
          onChange={handleSubjectChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
          disabled={!formData.stream}
        >
          <option value="">Select Subject</option>
          {subjects && subjects.length > 0 && subjects.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>

        <select 
          value={formData.standard}
          onChange={handleStandardChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
          disabled={!formData.subject}
        >
          <option value="">Select Standard</option>
          <option value="11">11th</option>
          <option value="12">12th</option>
        </select>

        {formData.stream !== 'MHT-CET' && formData.stream !== 'NEET' && formData.stream && (
          <select
            value={formData.section}
            onChange={(e) => setFormData({...formData, section: e.target.value})}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
          >
            <option value="">Select Section</option>
            <option value="1">Section A</option>
            <option value="2">Section B</option>
          </select>
        )}

        <select 
          value={formData.topic}
          onChange={(e) => setFormData({...formData, topic: e.target.value})}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
          disabled={!topics.length}
        >
          <option value="">Select Topic</option>
          {topics.map(([topic, id]) => (
            <option key={id} value={id}>
              {topic}
            </option>
          ))}
        </select>

        <select 
          value={formData.difficultyLevel}
          onChange={(e) => setFormData({...formData, difficultyLevel: e.target.value})}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option> 
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Question Preview */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4 mx-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800">Preview</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Live Preview</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-700 mb-2">Question</div>
            <div dangerouslySetInnerHTML={{ __html: previewContent.question || formData.question }} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((option, index) => (
              <div key={option} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1d77bc] text-white flex items-center justify-center text-sm">
                    {option}
                  </span>
                </div>
                <div 
                  className=""
                                    dangerouslySetInnerHTML={{ 
                    __html: previewContent[`option${option}`] || formData[`option${option}`] 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mx-4 mb-3">
        <div className="flex bg-gray-50 rounded-xl p-1">
          {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer'].map((tab, index) => (
            <button
              key={index}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${tabValue === index 
                  ? 'bg-white text-[#1d77bc] shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setTabValue(index)}
            >
              <span>{tab}</span>
              <span className="ml-2 text-xs text-gray-400 font-normal">Ctrl+{index + 1}</span>
            </button>
          ))}
        </div>
        {/* Keyboard shortcut helper text */}
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/></svg>
          <span>
            Use <span className="font-medium text-gray-600">Ctrl + 1-6</span> to switch tabs directly, or <span className="font-medium text-gray-600">Ctrl + ←/→</span> to move between tabs.
          </span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="mx-4 mb-2 relative">
        {/* Style override for Quill formula popup */}
        <style>{`
          /* Ensure Quill formula tooltip stays above modal and inside editor */
          .ql-tooltip.ql-editing {
            z-index: 10510 !important;
            position: absolute !important;
            max-width: 95vw;
            left: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
          }
          /* Prevent tooltip from going out of the editor area */
          .ql-container .ql-tooltip {
            max-width: 95vw;
            word-break: break-word;
          }
        `}</style>
        {tabValue === 5 ? (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex flex-col gap-3">
              {/* Question Type Toggles */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mr-6">
                  <input
                    type="checkbox"
                    id="userInputToggle"
                    checked={formData.userInputAnswer}
                    onChange={(e) => setFormData({...formData, userInputAnswer: e.target.checked, isMultipleAnswer: false})}
                    className="w-4 h-4 text-[#1d77bc] rounded focus:ring-[#1d77bc]"
                  />
                  <label htmlFor="userInputToggle" className="text-sm text-gray-700 font-medium">
                    User Input Answer
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="multipleAnswerToggle"
                    checked={formData.isMultipleAnswer}
                    onChange={(e) => setFormData({...formData, isMultipleAnswer: e.target.checked, userInputAnswer: false})}
                    className="w-4 h-4 text-[#1d77bc] rounded focus:ring-[#1d77bc]"
                  />
                  <label htmlFor="multipleAnswerToggle" className="text-sm text-gray-700 font-medium">
                    Multiple Correct Options
                  </label>
                </div>
              </div>

              {/* Answer Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Answer</label>
                  {formData.userInputAnswer ? (
                    <input
                      type="text"
                      placeholder="Enter numeric or text answer"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.answer}
                      onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    />
                  ) : formData.isMultipleAnswer ? (
                    <div className="space-y-2 p-3 border rounded-lg">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`option${option}`}
                            checked={formData.multipleAnswer.includes(option)}
                            onChange={(e) => {
                              const newAnswers = e.target.checked 
                                ? [...formData.multipleAnswer, option]
                                : formData.multipleAnswer.filter(ans => ans !== option);
                              setFormData({...formData, multipleAnswer: newAnswers});
                            }}
                            className="w-4 h-4 text-[#1d77bc] rounded focus:ring-[#1d77bc]"
                          />
                          <label htmlFor={`option${option}`} className="text-sm">Option {option}</label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <select
                      value={formData.answer}
                      onChange={(e) => setFormData({...formData, answer: e.target.value})}
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Answer</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Marks</label>
                  <input

                    type="number"
                    placeholder="Enter marks"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          isQuillReady && (
            <div key={`quill-${tabValue}`} className="min-h-[250px]">
              <ReactQuill
                ref={quillRef}
                value={getCurrentEditorValue}
                onChange={handleQuillChange}
                modules={modules}
                theme="snow"
                placeholder="Write your content here..."
                preserveWhitespace={true}
                style={{height: '200px'}}
                className="bg-white [&_.ql-container]:!h-[150px] [&_.ql-editor_img]:max-w-full [&_.ql-editor_img]:h-auto"
              />
            </div>
          )
        )}
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-md px-6 py-4 mt-8">
        <div className="max-w-screen-xl mx-auto flex justify-end items-center">
          <button 
            onClick={handleSubmit}
            disabled={isUploading}
            className={`bg-[#e96030] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md flex items-center gap-2 font-medium ${isUploading ? 'opacity-75' : ''}`}
          >
            {isUploading ? (
              <>
                <span>Uploading...</span>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>Save Question</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
