import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: String,
    required: true,
  },
  interest_area: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  seen:  {
    type: Boolean,
    default: false,
  },
  contacted:  {
    type: Boolean,
    default: false,
  },
  followUpNote: {
    type: String,
    default: "Enter Follow Up Note",
  }
}, { timestamps: true });

const ContactUs = mongoose.models.ContactUs || mongoose.model('ContactUs', contactUsSchema);
export default ContactUs;