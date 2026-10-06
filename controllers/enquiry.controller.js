import CustomerEnquiry from "../models/CustomerEnquiry.js";

/**
 * Submit Customer Inquiry
 */
export const createEnquiry = async (req, res) => {
  try {
    const { name, customerName, email, phone, message, enquiryType } = req.body;

    const enquiry = await CustomerEnquiry.create({
      name: name || customerName || "Swariya Customer",
      customerName: customerName || name || "Swariya Customer",
      email,
      phone,
      enquiryType: enquiryType || "BESPOKE_DESIGN",
      message
    });

    return res.status(201).json({
      success: true,
      message: "Customer enquiry submitted successfully.",
      data: enquiry
    });
  } catch (error) {
    console.error("Create Customer Enquiry Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Admin: List Customer Enquiries with Pagination
 * GET /api/v1/enquiries?page=1&limit=10
 */
export const getEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await CustomerEnquiry.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const enquiries = await CustomerEnquiry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ensure customerName is populated for frontend UI compatibility
    const formattedEnquiries = enquiries.map(e => ({
      ...e,
      customerName: e.customerName || e.name || "Swariya Customer"
    }));

    return res.status(200).json({
      success: true,
      data: formattedEnquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get Customer Enquiries Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Admin: Update Enquiry Status
 * PUT /api/v1/enquiries/:id
 */
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await CustomerEnquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update Enquiry Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Admin: Delete Enquiry by ID
 * DELETE /api/v1/enquiries/:id
 */
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CustomerEnquiry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully"
    });
  } catch (error) {
    console.error("Delete Enquiry Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
