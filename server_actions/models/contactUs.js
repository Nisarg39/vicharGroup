import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile_number: {
    type: String,
    required: true,
    unique: true,
  },
  interest_area: {
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
}, { timestamps: true });

const ContactUs = mongoose.models.ContactUs || mongoose.model('ContactUs', contactUsSchema);
export default ContactUs;