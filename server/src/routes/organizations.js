const express = require('express');
const { body, validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create organization (Employer only)
router.post('/',
  auth,
  authorize('EMPLOYER'),
  [
    body('name').notEmpty(),
    body('address').isObject(),
    body('workLocations').isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organization = new Organization({
        ...req.body,
        admin: req.user._id
      });

      await organization.save();
      
      // Update user with organization
      req.user.organization = organization._id;
      await req.user.save();

      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Error creating organization', error: error.message });
    }
  }
);

// Get organization details
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id)
        .populate('admin', 'email profile')
        .populate('employees', 'email profile')
        .populate('bankApprover', 'email profile');

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching organization', error: error.message });
    }
  }
);

// Update organization
router.patch('/:id',
  auth,
  authorize('EMPLOYER'),
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'address', 'workLocations'];
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      const organization = await Organization.findOne({
        _id: req.params.id,
        admin: req.user._id
      });

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      updates.forEach(update => organization[update] = req.body[update]);
      await organization.save();

      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Error updating organization', error: error.message });
    }
  }
);

// Approve organization (Bank Admin only)
router.post('/:id/approve',
  auth,
  authorize('BANK_ADMIN'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      organization.status = 'APPROVED';
      organization.bankApprover = req.user._id;
      await organization.save();

      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Error approving organization', error: error.message });
    }
  }
);

// Add employee to organization
router.post('/:id/employees',
  auth,
  authorize('EMPLOYER'),
  [
    body('email').isEmail().normalizeEmail(),
    body('role').equals('EMPLOYEE')
  ],
  async (req, res) => {
    try {
      const organization = await Organization.findOne({
        _id: req.params.id,
        admin: req.user._id
      });

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      const employee = await User.findOne({ email: req.body.email });
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      if (employee.organization) {
        return res.status(400).json({ message: 'Employee already belongs to an organization' });
      }

      employee.organization = organization._id;
      employee.status = 'APPROVED';
      await employee.save();

      organization.employees.push(employee._id);
      await organization.save();

      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Error adding employee', error: error.message });
    }
  }
);

// Get organization's carbon credits
router.get('/:id/credits',
  auth,
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.json(organization.carbonCredits);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching credits', error: error.message });
    }
  }
);

module.exports = router; 