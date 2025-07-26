# Exam Portal Development Task List

## 🎯 Pending Development Tasks

### **Priority: High**

1. **Complete ExamList.js UI Layout Redesign**
   - Status: Pending (In Progress)
   - Description: Fix UI layout issues in ExamList component by removing subjects from shrink view and implementing 3-dot menu for actions
   - Components Affected:
     - `components/examPortal/collegeComponents/collegeDashboardComponents/manageExamComponents/ExamList.js`
   - Technical Requirements:
     - Remove subjects column from shrink view (currently col-span-2 in grid layout)
     - Replace individual Edit and Assign Questions buttons with 3-dot dropdown menu
     - Add state management for dropdown visibility (useState for activeDropdown)
     - Implement click-outside-to-close functionality
     - Adjust responsive grid layout from 12-column to optimize space usage
     - Ensure changes persist correctly (previous MultiEdit attempt failed)
     - Maintain existing active exam indicators and expand/collapse functionality
   - **Immediate Next Steps:**
     - Target lines 317-323 (header grid structure)
     - Target lines 326-476 (exam rows structure)  
     - Add dropdown state management and click handlers
     - Test file persistence after changes

2. **Apply Negative Marking Scheme in Result Evaluation**
   - Status: Pending
   - Description: Implement the negative marking calculation when evaluating student exam results
   - Components Affected: 
     - ExamResult calculation logic
     - Student result display
     - Result analytics
   - Technical Requirements:
     - Update result calculation algorithm
     - Apply college-specific negative marking rules
     - Handle different question types (MCQ, Numerical)
     - Show the negative rules in results section in frontend and also in downloaded pdf which will show the default values which the super admin has as - current rules and show college negative marking rules for comparison and making student know that this is customised exam

2. **Automated Actions for Exams**
   - Status: Pending
   - Description: Implement automation for common exam lifecycle actions to reduce manual work and errors
   - Components Affected:
     - Exam scheduling system
     - Notification service
     - Result publishing module
   - Technical Requirements:
     - Auto-start and auto-end exams based on scheduled time
     - Auto-publish results once evaluation is complete
     - Notify students before exam start and after result publication
     - Auto-generate exam room codes for live sessions
     - Flag inconsistent or late submissions for review
     - Add admin-configurable toggles to enable/disable automation per exam

3. **Improve Question Selection for Colleges**
   - Status: Pending
   - Description: Make the question selection process easier and more intuitive for college administrators
   - Components Affected:
     - QuestionAssignmentModal
     - Question filtering system
     - Question preview interface
   - Technical Requirements:
     - add a prompt when user selects a different subject in QuestionAssignmentModal at the time when he has marked new questions for that subject and forget to assign them . the prompt should be to save marked questions or discard the newly selected questions for that subject and take action based on user input and then switch the subject 
     - also show a seperate list where the user has selected the questions and show marked questions list as well which are not saved yet for each subject
     - Enhanced filtering options
     - Better UI/UX for question selection
     - Bulk selection capabilities
     - Preview functionality 
     - download as pdf option in exams list of college with all the exam related data 
     - assign unique questions for each exam

4. **Global Statistics Section for Students**
   - Status: Pending  
   - Description: Create a global stats dashboard showing student ranking compared to others who took the same exam
   - Components Affected:
     - Student dashboard
     - Result display components
     - Analytics system
   - Technical Requirements:
     - Ranking calculation system
     - Comparative analytics
     - Performance metrics
     - Percentile calculations

5. **Test Student Exam-Taking Experience**
   - Status: Pending
   - Description: Conduct end-to-end testing of the exam portal to verify that students can successfully attempt and submit exams according to the defined rule file
   - Components Affected:
     - Exam attempt flow
     - Timer logic and auto-submit
     - Response saving and navigation
   - Technical Requirements:
     - Simulate complete exam scenarios
     - Validate rule compliance (e.g. time limits, unattempted behavior)
     - Ensure smooth UX and functional stability
     - Test how much images can be stored for offline exam

6. **Show Result in College Portal**
   - Status: Pending
   - Description: Display student exam results within the college portal view for authorized college admins
   - Components Affected:
     - College dashboard
     - Result viewer module
     - Access control system
   - Technical Requirements:
     - Filter results by exam, batch, student
     - Ensure only authorized colleges can view their student data
     - Include summary metrics and PDF export option

### **Priority: Medium**

1. **Create User Guide Documentation for All Roles**
   - Status: Pending
   - Description: Build documentation modules to guide users based on their roles — College Admins, Students, and Super Admins
   - Components Affected:
     - UI help components
     - Onboarding tooltips
     - Dedicated user guide pages
   - Technical Requirements:
     - Role-based content rendering
     - Markdown or CMS integration for easy updates
     - Include videos, screenshots, and walkthroughs
     - Accessible from dashboards and login screens

### **Priority: Low**

6. **Future Enhancements**
  - Shuffle Questions feature for each student
  - Adding a feature of bulk promotion to existing students to another class

7. **Add To-Do List Feature in Main Admin Panel**
   - Status: Pending
   - Description: Create a to-do list module in the super admin panel (`/admin`) to track future enhancements, bug reports, and feature demands
   - Components Affected:
     - Admin dashboard UI
     - To-do management system
     - Task storage and classification
   - Technical Requirements:
     - Add new task with title, description, and priority (High/Medium/Low)
     - Categorize and filter tasks based on type (Bug, Feature, Improvement)
     - Option to mark task as complete or archive
     - Ensure persistence across sessions (saved in database)

---

## 📋 Task Categories

### **Backend Development**
- Result evaluation system
- Ranking algorithms
- Analytics calculations

### **Frontend Development**  
- Question selection interface
- Student statistics dashboard
- Result display improvements

### **Database Design**
- Result storage optimization
- Analytics data structure
- Performance indexing

---

## ⚠️ Important Notes

- This file is maintained manually - do not auto-update
- Tasks are added only when specifically instructed
- Completion status updated manually
- Technical details added as tasks are refined

---

*Last Updated: [Manual updates only]*
