"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import 'katex/dist/katex.min.css';
import {
  fetchQuestionsForExam,
  assignQuestionsToExam,
  getExamQuestions,
  getQuestionCountsPerSubject,
} from "../../../../../server_actions/actions/examController/collegeActions";
import { getTopics, data } from "../../../../../utils/examUtils/subject_Details";
import ModalHeader from './QuestionAssignmentModal/ModalHeader';
import ModalFilters from './QuestionAssignmentModal/ModalFilters';
import QuestionsList from './QuestionAssignmentModal/QuestionsList';
import ModalFooter from './QuestionAssignmentModal/ModalFooter';

// Utility function to calculate marks based on exam stream and question subjects using the official marking scheme
const calculateTotalMarks = (selectedQuestionIds, questions, examStream) => {
  let totalMarks = 0;
  
  selectedQuestionIds.forEach(questionId => {
    const question = questions.find(q => q._id === questionId);
    if (!question) return;
    
    // Get the marking scheme from the data structure
    const markingScheme = data[examStream]?.positiveMarking;
    
    if (markingScheme && typeof markingScheme.value === 'object') {
      // For exams like MHT-CET with subject-specific marking
      const subjectMarks = markingScheme.value[question.subject];
      totalMarks += subjectMarks || markingScheme.value.default || 1;
    } else if (markingScheme && typeof markingScheme.value === 'number') {
      // For exams like JEE/NEET with uniform marking
      totalMarks += markingScheme.value;
    } else {
      // Fallback: 4 marks per question for other streams
      totalMarks += 4;
    }
  });
  
  return totalMarks;
};

export default function QuestionAssignmentModal({
  exam,
  isOpen,
  onClose,
  onQuestionsAssigned,
  collegeData,
}) {
  // All hooks must be declared at the top level, before any logic or return
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalQuestions: 0,
    questionsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    stream: exam?.stream || "",
    subject: exam?.examSubject?.[0] || "",
    standard: exam?.standard || "",
    topic: "",
    difficultyLevel: "",
    section: exam?.section || "",
    questionType: "",
    marks: "",
  });
  const [showSelectedQuestions, setShowSelectedQuestions] = useState(false);
  const [allSelectedQuestions, setAllSelectedQuestions] = useState([]);
  const [topics, setTopics] = useState({});
  const [totalQuestionsPerSubject, setTotalQuestionsPerSubject] = useState({});

  // Add this state for showing selected questions
  // Add this function to reset filters
  const resetFilters = () => {
    setFilters({
      stream: exam?.stream || "",
      subject: exam?.examSubject?.[0] || "",
      standard: exam?.standard || "", // Always use exam's standard
      topic: "",
      difficultyLevel: "",
      section: exam?.section || "",
      questionType: "",
      marks: "",
    });
    setPagination(prev => ({...prev, currentPage: 1}));
  };

  // Add this function to get selected question details
  const getSelectedQuestionDetails = () => {
    return questions.filter((q) => selectedQuestions.includes(q._id));
  };

  // State to store all selected questions with full details
  // Handle sorting toggle
  const handleShowSelectedQuestions = () => {
    const newShowSelected = !showSelectedQuestions;
    setShowSelectedQuestions(newShowSelected);
    
    // Sort current questions immediately without refetching
    if (newShowSelected) {
      const sortedQuestions = [...questions].sort((a, b) => {
        const aSelected = selectedQuestions.includes(a._id);
        const bSelected = selectedQuestions.includes(b._id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
      setQuestions(sortedQuestions);
    } else {
      // Restore original order by refetching
      fetchQuestions();
    }
  };

  // Update filters when exam changes
  useEffect(() => {
    if (exam) {
      setFilters(prev => ({
        ...prev,
        stream: exam?.stream || "",
        subject: exam?.examSubject?.[0] || "",
        standard: exam?.standard || "", // Always use exam's standard
        section: exam?.section || "",
      }));
    }
  }, [exam]);

  // Fetch questions with useCallback to always use latest filters
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    console.log('Fetching with filters:', filters); // Debug log
    try {
      const response = await fetchQuestionsForExam({
        ...filters,
        page: pagination.currentPage,
        limit: pagination.questionsPerPage,
      });
      console.log('Backend response:', response); // Debug log for backend response
      if (response.success) {
        setQuestions(response.questions);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
    setLoading(false);
  }, [filters, pagination.currentPage, pagination.questionsPerPage]);

  // Fetch questions when modal opens or filters change
  useEffect(() => {
    if (isOpen && exam) {
      fetchQuestions();
      fetchAssignedQuestions();
    }
  }, [isOpen, exam, fetchQuestions]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const availableTopics = getTopics(
      filters.stream,
      filters.subject,
      filters.standard
    );
    setTopics(availableTopics);
  }, [filters.stream, filters.subject, filters.standard]);

  const fetchAssignedQuestions = async () => {
    try {
      const response = await getExamQuestions(exam._id);
      if (response.success) {
        const assignedIds = response.assignedQuestions.map((q) => q._id);
        setSelectedQuestions(assignedIds);
        // Store all selected questions with full details
        setAllSelectedQuestions(response.assignedQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch assigned questions:", error);
    }
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) => {
      const newSelected = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      
      // Update allSelectedQuestions when toggling
      setAllSelectedQuestions((prevAll) => {
        if (prev.includes(questionId)) {
          // Removing question
          return prevAll.filter((q) => q._id !== questionId);
        } else {
          // Adding question - find it in current questions or existing allSelectedQuestions
          const questionToAdd = questions.find((q) => q._id === questionId) || 
                               prevAll.find((q) => q._id === questionId);
          if (questionToAdd && !prevAll.some((q) => q._id === questionId)) {
            return [...prevAll, questionToAdd];
          }
          return prevAll;
        }
      });
      
      // If showSelectedQuestions is enabled, re-sort the questions to maintain order
      if (showSelectedQuestions) {
        setQuestions((prevQuestions) => {
          const sortedQuestions = [...prevQuestions].sort((a, b) => {
            const aSelected = newSelected.includes(a._id);
            const bSelected = newSelected.includes(b._id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
          });
          return sortedQuestions;
        });
      }
      
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      // Deselect all current page questions
      const currentPageIds = questions.map((q) => q._id);
      setSelectedQuestions((prev) => prev.filter((id) => !currentPageIds.includes(id)));
      setAllSelectedQuestions((prev) => prev.filter((q) => !currentPageIds.includes(q._id)));
    } else {
      // Select all current page questions
      const questionIds = questions.map((q) => q._id);
      const newSelections = questionIds.filter((id) => !selectedQuestions.includes(id));
      
      setSelectedQuestions((prev) => [...prev, ...newSelections]);
      setAllSelectedQuestions((prev) => {
        const newQuestions = questions.filter((q) => 
          newSelections.includes(q._id) && !prev.some((existing) => existing._id === q._id)
        );
        return [...prev, ...newQuestions];
      });
    }
  };

  const handleAssignQuestions = async () => {
    setAssigning(true);
    try {
      const response = await assignQuestionsToExam(exam._id, selectedQuestions);
      if (response.success) {
        alert(response.message);
        onQuestionsAssigned && onQuestionsAssigned();

        // Let the user close the modal manually after seeing the success message
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Failed to assign questions:", error);
      alert("Failed to assign questions");
    }
    setAssigning(false);
  };

  const handleFilterChange = (field, value) => {
    // Prevent changing the standard - it should always be the exam's standard
    if (field === 'standard') {
      return;
    }
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Helper to omit 'subject' from filters
  const getSubjectlessFilters = (filters) => {
    const { subject, ...rest } = filters;
    return rest;
  };

  // Fetch subject counts for all questions in DB (for current filters, but not subject)
  const fetchSubjectCounts = useCallback(async () => {
    try {
      const response = await getQuestionCountsPerSubject(getSubjectlessFilters(filters));
      if (response.success) {
        setTotalQuestionsPerSubject(response.counts);
      } else {
        setTotalQuestionsPerSubject({});
      }
    } catch (error) {
      setTotalQuestionsPerSubject({});
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen && exam) {
      fetchSubjectCounts();
    }
  }, [isOpen, exam, fetchSubjectCounts]);

  // Now, after all hooks, you can have early returns
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex"
      onClick={handleBackdropClick}
    >
      <div className="relative h-full w-full bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <ModalHeader exam={exam} onClose={onClose} />
        {/* Main Content Area with Sidebar Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar for Filters */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <ModalFilters 
              exam={exam}
              filters={filters}
              handleFilterChange={handleFilterChange}
            />
          </div>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <QuestionsList 
                loading={loading}
                questions={questions}
                selectedQuestions={selectedQuestions}
                handleQuestionToggle={handleQuestionToggle}
                pagination={pagination}
                setPagination={setPagination}
                handlePageChange={handlePageChange}
                allSelectedQuestions={allSelectedQuestions}
                showSelectedQuestions={showSelectedQuestions}
              />
            </div>
            <div className="flex-shrink-0">
              <ModalFooter 
                selectedQuestions={selectedQuestions}
                questions={questions}
                onClose={onClose}
                handleAssignQuestions={handleAssignQuestions}
                assigning={assigning}
                setSelectedQuestions={setSelectedQuestions}
                totalQuestionsPerSubject={totalQuestionsPerSubject}
                allSelectedQuestions={allSelectedQuestions}
                showSelectedQuestions={showSelectedQuestions}
                setShowSelectedQuestions={handleShowSelectedQuestions}
                handleSelectAll={handleSelectAll}
                handleQuestionToggle={handleQuestionToggle}
                getSelectedQuestionDetails={getSelectedQuestionDetails}
                examSubjects={exam?.examSubject || []}
                calculateTotalMarks={calculateTotalMarks}
                examStream={exam?.stream}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, typeof window !== 'undefined' ? document.body : null);
}
