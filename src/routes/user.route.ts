import express from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import {
    createUserSchema,
    updateUserSchema,
    deleteUserSchema,
    getUserSchema,
    listUsersSchema
} from '../validation/user.validation';

const router = express.Router();

// Protect ALL routes below and restricts them to ADMIN only
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router
    .route('/')
    .get(validate(listUsersSchema), userController.getUsers)
    .post(validate(createUserSchema), userController.createUser);

router
    .route('/:id')
    .get(validate(getUserSchema), userController.getUser)
    .put(validate(updateUserSchema), userController.updateUser)
    .delete(validate(deleteUserSchema), userController.deleteUser);

export default router;
