import mongoose from "mongoose";
const collegeSchema = new mongoose.Schema({
    collegeName: {
        type: String,
        required: true,
    },
    collegeCode: {
        type: String,
        required: true,
    },
    collegeLocation: {
        type: String,
        required: true,
    },
    collegeContact: {
        type: String,
        required: true,
    },
    collegeEmail: {
        type: String,
        required: true,
    },
    collegeLogo: {
        type: String,
    },
    collegeWebsite: {
        type: String,
    },
    principalName: {
        type: String,
    },
    principalContact: {
        type: String,
    },
    Address: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    allocatedSubjects: {
        type: [String],
    },
    password: {
        type: String,
        default: "collegeadmin@123"
    },
},{
    timestamps: true
});

const college = mongoose.models.College || mongoose.model('College', collegeSchema);
export default college;