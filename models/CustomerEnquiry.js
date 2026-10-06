import mongoose from 'mongoose';

const customerEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    customerName: { type: String },
    email: { type: String },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\+?\d{7,15}$/.test(v.replace(/[\s\-\(\)]+/g, ''));
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    enquiryType: {
      type: String,
      enum: ['PRODUCT_INQUIRY', 'BESPOKE_DESIGN', 'APPOINTMENT', 'BULK_ORDER', 'SEND_QUERY', 'CONTACT_US'],
      default: 'BESPOKE_DESIGN'
    },
    status: {
      type: String,
      enum: ['NEW', 'IN_REVIEW', 'CLOSED'],
      default: 'NEW'
    },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

const CustomerEnquiry = mongoose.model('CustomerEnquiry', customerEnquirySchema);
export default CustomerEnquiry;
