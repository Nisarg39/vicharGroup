# Mongoose Development Guidelines

## Critical Rules to Prevent Common Errors

### 1. Maximum Call Stack Size Exceeded Prevention

**Always use `.lean()` for read operations that return data to frontend:**

```javascript
// ✅ CORRECT - Use .lean() to return plain JavaScript objects
const exam = await Exam.findById(examId)
  .populate("college")
  .populate("examQuestions")
  .lean(); // This prevents circular references

// ❌ INCORRECT - Without .lean() can cause circular references
const exam = await Exam.findById(examId)
  .populate("college")
  .populate("examQuestions");
```

**Serialize Date objects before sending to Redux:**

```javascript
// ✅ CORRECT - Serialize before returning
if(student){
    const serializedStudent = JSON.parse(JSON.stringify(student));
    return {
        success: true,
        student: serializedStudent
    }
}

// ❌ INCORRECT - Raw Mongoose documents with Date objects
return {
    success: true,
    student: student // Contains non-serializable Date objects
}
```

### 2. Database Connection Best Practices

**Always call `connectDB()` at the start of server actions:**

```javascript
// ✅ CORRECT
export async function getStudentDetails(token) {
    await connectDB(); // Always first line
    const student = await Student.findOne({token: token});
    // ... rest of function
}

// ❌ INCORRECT - Missing connectDB()
export async function getStudentDetails(token) {
    const student = await Student.findOne({token: token}); // Will fail
}
```

### 3. Model Creation Rules

**When creating new Mongoose models, follow this template:**

```javascript
// models/example.js
import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema({
    // Your fields here
    name: {
        type: String,
        required: true,
    },
    // Use ObjectId for references
    relatedModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RelatedModel",
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// ✅ CORRECT - Prevents model re-compilation errors
const Example = mongoose.models?.Example || mongoose.model("Example", ExampleSchema);
export default Example;
```

### 4. Server Action Function Template

**Use this template for all server actions:**

```javascript
"use server";
import { connectDB } from "../config/mongoose";
import YourModel from "../models/yourModel";
import mongoose from "mongoose";

export async function yourServerAction(data) {
    try {
        // 1. Always connect to database first
        await connectDB();

        // 2. Validate ObjectIds if needed
        if (!mongoose.Types.ObjectId.isValid(data.id)) {
            return {
                success: false,
                message: "Invalid ID format",
            };
        }

        // 3. Use .lean() for read operations
        const result = await YourModel.findById(data.id)
            .populate("relatedField")
            .lean(); // Prevents circular references

        // 4. Handle not found
        if (!result) {
            return {
                success: false,
                message: "Record not found",
            };
        }

        // 5. Serialize before returning (if sending to frontend)
        const serializedResult = JSON.parse(JSON.stringify(result));

        return {
            success: true,
            message: "Operation successful",
            data: serializedResult
        };

    } catch (error) {
        console.error("Error in yourServerAction:", error);
        return {
            success: false,
            message: `Operation failed: ${error.message}`,
        };
    }
}
```

### 5. Specific Rules by Operation Type

#### Read Operations (GET)
```javascript
// Always use .lean() for read operations
const data = await Model.find(query).populate("field").lean();
return JSON.parse(JSON.stringify(data)); // Serialize dates
```

#### Write Operations (POST/PUT)
```javascript
// Don't use .lean() for write operations
const newRecord = await Model.create(data);
// Or for updates:
const updatedRecord = await Model.findByIdAndUpdate(id, data, { new: true });

// If returning to frontend, serialize:
return JSON.parse(JSON.stringify(newRecord));
```

#### Populate Operations
```javascript
// ✅ CORRECT - Use .lean() with populate
const result = await Model.findById(id)
    .populate({
        path: "relatedField",
        select: "field1 field2", // Only select needed fields
    })
    .lean();

// ❌ INCORRECT - Without .lean() can cause circular references
const result = await Model.findById(id).populate("relatedField");
```

### 6. Error Prevention Checklist

Before deploying any new model or server action, check:

- [ ] `await connectDB()` is the first line
- [ ] `.lean()` is used for all read operations that return to frontend
- [ ] `JSON.parse(JSON.stringify())` is used before returning data to Redux
- [ ] ObjectId validation using `mongoose.Types.ObjectId.isValid()`
- [ ] Proper error handling with try-catch blocks
- [ ] Model export uses `mongoose.models?.ModelName || mongoose.model()`

### 7. Common Patterns to Avoid

```javascript
// ❌ AVOID - These patterns cause errors:

// 1. Missing database connection
export async function badFunction() {
    const result = await Model.find(); // ERROR: Database not connected
}

// 2. No .lean() with populated data returned to frontend
const exam = await Exam.findById(id).populate("questions");
dispatch(setExam(exam)); // ERROR: Circular references

// 3. Not serializing dates for Redux
const student = await Student.findById(id).lean();
dispatch(setStudent(student)); // ERROR: Non-serializable dates

// 4. Model re-compilation
const Model = mongoose.model("Example", schema); // ERROR: Model already compiled
```

### 8. Quick Reference Commands

```bash
# If you see "Maximum call stack size exceeded":
# 1. Add .lean() to your query
# 2. Add JSON.parse(JSON.stringify()) before returning

# If you see "Database not found":
# 1. Add await connectDB() at start of function
# 2. Check your MongoDB connection string

# If you see "Model already compiled":
# 1. Use: mongoose.models?.ModelName || mongoose.model()
```

## Implementation Notes

- This guideline should be followed for ALL new models and server actions
- Existing code should be gradually updated to follow these patterns
- When in doubt, always use `.lean()` for read operations
- Always serialize data before sending to Redux store

## Examples in Codebase

Good examples to reference:
- `server_actions/actions/examController/studentExamActions.js` (after fixes)
- `server_actions/actions/studentActions.js` (after fixes)

These patterns will prevent the most common Mongoose-related errors in the application.