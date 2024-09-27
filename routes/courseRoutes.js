const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/addCourse', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.createCourse);
router.get('/getCourses', courseController.getCourses);
router.get('/getCourse/:id', courseController.getCourse);
router.put('/updateCourse/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.updateCourse);
router.delete('/deleteCourse/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.deleteCourse);

module.exports = router;