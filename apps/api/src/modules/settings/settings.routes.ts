import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new SettingsController();

/* Where the sign-in page lives. This has to be readable before anyone has
   signed in, so that the console can send a lapsed administrator to the
   right address. */
router.get('/login-path', controller.getLoginPath);

/* The console's settings are for the people who run it. */
router.get(
  '/console',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  controller.getConsoleSettings,
);

router.put(
  '/console',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  controller.updateConsoleSettings,
);

/* Any signed-in administrator may change their own password — including
   an editor, who cannot change the console's settings but can still look
   after their own account. */
router.post('/password', authenticate, controller.changePassword);

/* Administrator & Editor user account management:
   - Reading list: SUPER_ADMIN and ADMIN
   - Creating new admins/editors: SUPER_ADMIN only
   - Resetting password: SUPER_ADMIN and ADMIN
   - Deleting accounts: SUPER_ADMIN only (and SUPER_ADMIN cannot be deleted)
*/
router.get('/users', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.listAdminUsers);
router.post('/users', authenticate, requireRole('SUPER_ADMIN'), controller.createAdminUser);
router.post('/users/:id/password', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.resetAdminUserPassword);
router.delete('/users/:id', authenticate, requireRole('SUPER_ADMIN'), controller.deleteAdminUser);

export { router as settingsRoutes };
