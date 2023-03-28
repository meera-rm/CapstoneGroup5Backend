const express = require('express');
const { getAdmin } = require('../queries/adminQueries');

const admin = express.Router();

// const adminController = require('./adminController.js')
admin.use('/:userId ', async (req, res) => {
	const { userId } = req.params;
	try {
		const adminUser = await getAdmin(userId);
		res.status(200).json({ success: true, payload: adminUser });
	} catch (error) {
		res.status(404).json({
			success: false,
			message: 'Login attempt not successful',
		});
	}
});

module.exports = adminController;
