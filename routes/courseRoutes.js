const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.createCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), courseController.deleteCourse);

module.exports = router;