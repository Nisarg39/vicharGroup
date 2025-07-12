"use client";
import React, { useState, useEffect } from "react";
import {
  fetchQuestionsForExam,
  assignQuestionsToExam,
  getExamQuestions,
} from "../../../../../server_actions/actions/examController/collegeActions";
import { getTopics } from "../../../../../utils/examUtils/subject_Details";
import ModalHeader from './QuestionAssignmentModal/ModalHeader';
import ModalFilters from './QuestionAssignmentModal/ModalFilters';
import QuestionSelectionStats from './QuestionAssignmentModal/QuestionSelectionStats';
import QuestionsList from './QuestionAssignmentModal/QuestionsList';
import ModalFooter from './QuestionAssignmentModal/ModalFooter';

export default function QuestionAssignmentModal({
  exam,
  isOpen,
  onClose,
  onQuestionsAssigned,
  collegeData,
}) {
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

  // Add this state for showing selected questions
  const [showSelectedQuestions, setShowSelectedQuestions] = useState(false);

  // Add this function to reset filters
  const resetFilters = () => {
    setFilters({
      stream: exam?.stream || "",
      subject: exam?.examSubject?.[0] || "",
      standard: exam?.standard || "",
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

  // Modify the show selected questions toggle to include filter reset
  const handleShowSelectedQuestions = () => {
    if (!showSelectedQuestions) {
      resetFilters(); // Reset filters when showing selected questions
    }
    setShowSelectedQuestions(!showSelectedQuestions);
  };

  // Fetch questions when modal opens or filters change
  useEffect(() => {
    if (isOpen && exam) {
      fetchQuestions();
      fetchAssignedQuestions();
    }
  }, [isOpen, exam, filters, pagination.currentPage]);

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

  const [topics, setTopics] = useState({});

  useEffect(() => {
    const availableTopics = getTopics(
      filters.stream,
      filters.subject,
      filters.standard
    );
    setTopics(availableTopics);
  }, [filters.stream, filters.subject, filters.standard]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetchQuestionsForExam({
        ...filters,
        page: pagination.currentPage,
        limit: pagination.questionsPerPage,
      });

      if (response.success) {
        setQuestions(response.questions);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
    setLoading(false);
  };

  const fetchAssignedQuestions = async () => {
    try {
      const response = await getExamQuestions(exam._id);
      if (response.success) {
        const assignedIds = response.assignedQuestions.map((q) => q._id);
        setSelectedQuestions(assignedIds);
      }
    } catch (error) {
      console.error("Failed to fetch assigned questions:", error);
    }
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      const questionIds = questions.map((q) => q._id);
      setSelectedQuestions(questionIds);
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
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-white overflow-hidden flex flex-col">
  {/* Header */}
  <ModalHeader exam={exam} onClose={onClose} />

        {/* Filters */}
        <ModalFilters 
          exam={exam}
          filters={filters}
          handleFilterChange={handleFilterChange}
        />

        <QuestionSelectionStats 
          showSelectedQuestions={showSelectedQuestions}
          setShowSelectedQuestions={setShowSelectedQuestions}
          selectedQuestions={selectedQuestions}
          questions={questions}
          handleSelectAll={handleSelectAll}
          handleQuestionToggle={handleQuestionToggle}
          getSelectedQuestionDetails={getSelectedQuestionDetails}
        />

        {/* Questions List - This should be flex-1 and scrollable */}
        <QuestionsList 
          loading={loading}
          questions={questions}
          selectedQuestions={selectedQuestions}
          handleQuestionToggle={handleQuestionToggle}
          pagination={pagination}
          setPagination={setPagination}
          handlePageChange={handlePageChange}
        />

        {/* Footer - Move this OUTSIDE the scrollable area */}
        <ModalFooter 
          selectedQuestions={selectedQuestions}
          questions={questions}
          onClose={onClose}
          handleAssignQuestions={handleAssignQuestions}
          assigning={assigning}
          setSelectedQuestions={setSelectedQuestions}
        />
      </div>
    </div>
  );
}
