import Organization from '../models/Organization.js';

// Get all organizations for the current user
export const getOrganizations = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get organizations where user is owner or member
    const organizations = await Organization.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('owner', 'name email').populate('members.user', 'name email');

    res.json({
      success: true,
      data: organizations,
      message: 'Organizations fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

// Get a specific organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const organization = await Organization.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('owner', 'name email').populate('members.user', 'name email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization,
      message: 'Organization fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: error.message
    });
  }
};

// Create a new organization
export const createOrganization = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description, tier = 'Free' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required'
      });
    }

    const organization = new Organization({
      name,
      description,
      tier,
      owner: userId,
      members: [{
        user: userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await organization.save();

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

// Update an organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body;

    // Check if user is owner or admin member
    const organization = await Organization.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin'] } }
      ]
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or insufficient permissions'
      });
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members.user', 'name email');

    res.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// Delete an organization
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Only owner can delete organization
    const organization = await Organization.findOne({
      _id: id,
      owner: userId
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or insufficient permissions'
      });
    }

    await Organization.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};

// Set an organization as active
export const setActiveOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Check if user is member of the organization
    const organization = await Organization.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or insufficient permissions'
      });
    }

    // Set all user's organizations to inactive
    await Organization.updateMany(
      {
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      },
      { active: false }
    );

    // Set the selected organization as active
    await Organization.findByIdAndUpdate(id, { active: true });

    res.json({
      success: true,
      message: 'Organization set as active successfully'
    });
  } catch (error) {
    console.error('Error setting active organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set active organization',
      error: error.message
    });
  }
};

// Get the currently active organization
export const getActiveOrganization = async (req, res) => {
  try {
    const userId = req.user.uid;

    const activeOrganization = await Organization.findOne({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      active: true
    }).populate('owner', 'name email').populate('members.user', 'name email');

    res.json({
      success: true,
      data: activeOrganization,
      message: activeOrganization ? 'Active organization fetched successfully' : 'No active organization found'
    });
  } catch (error) {
    console.error('Error fetching active organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active organization',
      error: error.message
    });
  }
};


