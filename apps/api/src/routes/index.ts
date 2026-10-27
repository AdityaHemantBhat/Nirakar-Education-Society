import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { alumniRoutes } from '../modules/alumni/alumni.routes.js';
import { facultyRoutes } from '../modules/faculty/faculty.routes.js';
import { magazineRoutes } from '../modules/magazine/magazine.routes.js';
import { libraryRoutes } from '../modules/library/library.routes.js';
import { accessRoutes } from '../modules/access/access.routes.js';
import { contentRoutes } from '../modules/content/content.routes.js';
import { homeRoutes } from '../modules/home/home.routes.js';
import { admissionsRoutes } from '../modules/admissions/admissions.routes.js';
import { admissionPopupRoutes } from '../modules/admissions/admissions.popup.routes.js';
import { facultyMessagesRoutes } from '../modules/faculty-messages/faculty-messages.routes.js';
import { auditLogRoutes } from '../modules/audit-log/audit-log.routes.js';
import { settingsRoutes } from '../modules/settings/settings.routes.js';
import { batchPhotosRoutes } from '../modules/batch-photos/batch-photos.routes.js';
import { communityPostsRoutes } from '../modules/community-posts/community-posts.routes.js';
import { academicResultsRoutes } from '../modules/results/results.routes.js';
import { privacyRoutes } from '../modules/privacy/privacy.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/alumni', alumniRoutes);
apiRouter.use('/faculty', facultyRoutes);
apiRouter.use('/faculty-messages', facultyMessagesRoutes);
apiRouter.use('/magazine', magazineRoutes);
apiRouter.use('/library', libraryRoutes);
apiRouter.use('/access', accessRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/home', homeRoutes);
apiRouter.use('/admissions', admissionsRoutes);
apiRouter.use('/admissions', admissionPopupRoutes);
apiRouter.use('/audit-log', auditLogRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/batch-photos', batchPhotosRoutes);
apiRouter.use('/community-posts', communityPostsRoutes);
apiRouter.use('/results', academicResultsRoutes);
apiRouter.use('/privacy', privacyRoutes);

export { apiRouter };

