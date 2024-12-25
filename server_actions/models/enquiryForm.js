import mongoose from 'mongoose';

let EnquiryForm;
try {
  EnquiryForm = mongoose.model('EnquiryForm');
} catch {
  const enquiryFormSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    stream:{
      type: String,
      required: true,
    },
    class:{
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    seen:  {
      type: Boolean,
      default: false,
    },
    contacted:  {
      type: Boolean,
      default: false,
    },
  }, { 
    timestamps: true ,
  });

  EnquiryForm = mongoose.model('EnquiryForm', enquiryFormSchema);
}

export default EnquiryForm;