import MakerApplication from "../models/makerApplication.js";
import Profile from "../models/profile.js";

/**
 * Submit maker application
 */
export const submitApplication = async (req, res) => {
  const userId = req.user.uid;

  try {
    // Check if user already has an application
    const existingApplication = await MakerApplication.findOne({
      userId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You already have a pending or approved application.",
        application: existingApplication,
      });
    }

    const {
      whatToSell,
      machines,
      machineCount,
      filamentBrands,
      location,
      experience,
      productionCapacity,
      whyJoin,
      portfolioImages,
      termsAccepted,
    } = req.body;

    // Validate required fields
    if (!whatToSell || !machines || !machineCount || !filamentBrands || !location || !termsAccepted) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    if (!Array.isArray(machines) || machines.length === 0) {
      return res.status(400).json({
        message: "At least one machine is required.",
      });
    }

    if (!Array.isArray(filamentBrands) || filamentBrands.length === 0) {
      return res.status(400).json({
        message: "At least one filament brand is required.",
      });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({
        message: "You must accept the terms and conditions.",
      });
    }

    // Create application
    const application = await MakerApplication.create({
      userId,
      answers: {
        whatToSell,
        machines,
        machineCount,
        filamentBrands,
        location,
        experience,
        productionCapacity,
        whyJoin,
      },
      portfolioImages: portfolioImages || [],
      termsAccepted: true,
      submittedAt: new Date(),
    });

    // Update user profile
    await Profile.updateOne(
      { userId },
      {
        $set: {
          makerStatus: 'pending',
          makerApplicationId: application._id,
        },
      },
      { upsert: true }
    );

    return res.status(201).json(application);
  } catch (error) {
    console.error("[makerApplication] submitApplication failed:", error);
    return res.status(500).json({ message: "Unable to submit application." });
  }
};

/**
 * Get user's application status
 */
export const getMyApplication = async (req, res) => {
  const userId = req.user.uid;

  try {
    const application = await MakerApplication.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!application) {
      return res.status(404).json({ message: "No application found." });
    }

    return res.json(application);
  } catch (error) {
    console.error("[makerApplication] getMyApplication failed:", error);
    return res.status(500).json({ message: "Unable to get application." });
  }
};

/**
 * List all applications (admin only)
 */
export const listApplications = async (req, res) => {
  const { status, limit = 50 } = req.query;

  try {
    const query = {};
    if (status) {
      query.status = status;
    }

    const applications = await MakerApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Populate user info
    const applicationsWithUser = await Promise.all(
      applications.map(async (app) => {
        const profile = await Profile.findOne({ userId: app.userId }).lean();
        return {
          ...app,
          user: {
            email: profile?.email,
            displayName: profile?.displayName,
          },
        };
      })
    );

    return res.json(applicationsWithUser);
  } catch (error) {
    console.error("[makerApplication] listApplications failed:", error);
    return res.status(500).json({ message: "Unable to list applications." });
  }
};

/**
 * Get application by ID (admin only)
 */
export const getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await MakerApplication.findById(id).lean();

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const profile = await Profile.findOne({ userId: application.userId }).lean();

    return res.json({
      ...application,
      user: {
        email: profile?.email,
        displayName: profile?.displayName,
      },
    });
  } catch (error) {
    console.error("[makerApplication] getApplicationById failed:", error);
    return res.status(500).json({ message: "Unable to get application." });
  }
};

/**
 * Approve application (admin only)
 */
export const approveApplication = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.uid;

  try {
    const application = await MakerApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        message: `Application is already ${application.status}.`,
      });
    }

    // Update application
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    await application.save();

    // Update user profile to maker
    await Profile.updateOne(
      { userId: application.userId },
      {
        $set: {
          role: 'maker',
          makerStatus: 'approved',
          makerApplicationId: application._id,
          'makerProfile.businessName': application.answers.whatToSell,
          'makerProfile.location': application.answers.location,
          'makerProfile.machines': application.answers.machines,
          'makerProfile.filamentBrands': application.answers.filamentBrands,
          'makerProfile.experience': application.answers.experience,
          'makerProfile.productionCapacity': application.answers.productionCapacity,
          'makerProfile.portfolio': application.portfolioImages,
          'makerProfile.joinedDate': new Date(),
        },
      }
    );

    // TODO: Send approval email to maker

    return res.json({
      success: true,
      message: "Application approved. User is now a maker.",
      application,
    });
  } catch (error) {
    console.error("[makerApplication] approveApplication failed:", error);
    return res.status(500).json({ message: "Unable to approve application." });
  }
};

/**
 * Reject application (admin only)
 */
export const rejectApplication = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.user.uid;

  try {
    const application = await MakerApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        message: `Application is already ${application.status}.`,
      });
    }

    // Update application
    application.status = 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.rejectionReason = rejectionReason || 'Application did not meet quality standards.';
    await application.save();

    // Update user profile
    await Profile.updateOne(
      { userId: application.userId },
      {
        $set: {
          makerStatus: 'rejected',
        },
      }
    );

    // TODO: Send rejection email to user

    return res.json({
      success: true,
      message: "Application rejected.",
      application,
    });
  } catch (error) {
    console.error("[makerApplication] rejectApplication failed:", error);
    return res.status(500).json({ message: "Unable to reject application." });
  }
};

