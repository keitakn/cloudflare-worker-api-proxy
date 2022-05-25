import { Router } from 'itty-router';

import {
  handleCatImageValidation,
  handleFetchLgtmImagesInRandom,
  handleNotFound,
} from './handler';

export const router = Router();

router.get('/lgtm-images', handleFetchLgtmImagesInRandom);
router.post('/cat-images/validation-results', handleCatImageValidation);
router.all('*', handleNotFound);
