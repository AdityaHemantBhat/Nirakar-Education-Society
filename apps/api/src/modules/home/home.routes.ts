import { Router } from 'express';
import { HomeController } from './home.controller.js';

const router = Router();
const controller = new HomeController();

router.get('/', controller.getHome);

export { router as homeRoutes };
