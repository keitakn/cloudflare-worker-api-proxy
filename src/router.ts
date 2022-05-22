import { Router } from 'itty-router';

import { handleCatImageValidation, handleNotFound } from './handler';

export const router = Router();

router.post('/cat-images/validation-results', handleCatImageValidation);
router.all('*', handleNotFound);
