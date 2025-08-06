# Exam Portal Development Task List

## 🎯 Pending Development Tasks

### **Priority: High**

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
