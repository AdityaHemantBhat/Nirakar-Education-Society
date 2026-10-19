import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { alumniRoutes } from '../modules/alumni/alumni.routes.js';
import { facultyRoutes } from '../modules/faculty/faculty.routes.js';
import { magazineRoutes } from '../modules/magazine/magazine.routes.js';
import { accessRoutes } from '../modules/access/access.routes.js';
import { contentRoutes } from '../modules/content/content.routes.js';
import { socialRoutes } from '../modules/social/social.routes.js';
import { homeRoutes } from '../modules/home/home.routes.js';
import { admissionsRoutes } from '../modules/admissions/admissions.routes.js';
import { facultyMessagesRoutes } from '../modules/faculty-messages/faculty-messages.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/alumni', alumniRoutes);
apiRouter.use('/faculty', facultyRoutes);
apiRouter.use('/faculty-messages', facultyMessagesRoutes);
apiRouter.use('/magazine', magazineRoutes);
apiRouter.use('/access', accessRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/social', socialRoutes);
apiRouter.use('/home', homeRoutes);
apiRouter.use('/admissions', admissionsRoutes);

export { apiRouter };
