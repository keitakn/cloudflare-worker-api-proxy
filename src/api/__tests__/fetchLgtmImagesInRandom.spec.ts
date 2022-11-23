/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import mockInternalServerError from '../../mocks/api/error/mockInternalServerError';
import fetchLgtmImagesMockBody from '../../mocks/api/fetchLgtmImagesMockBody';
import mockFetchLgtmImages from '../../mocks/api/mockFetchLgtmImages';
import { isSuccessResult } from '../../result';
import { fetchLgtmImagesInRandom } from '../fetchLgtmImages';

const apiUrl = 'https://api.example.com';

const mockHandlers = [rest.get(`${apiUrl}/lgtm-images`, mockFetchLgtmImages)];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('fetchLgtmImagesInRandom TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  // eslint-disable-next-line max-lines-per-function
  it('should be able to fetch LGTM Images', async () => {
    const expected = {
      lgtmImages: fetchLgtmImagesMockBody,
      xRequestId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      xLambdaRequestId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    };

    const lgtmImagesResult = await fetchLgtmImagesInRandom({
      apiBaseUrl: apiUrl,
      accessToken: '',
    });

    expect(isSuccessResult(lgtmImagesResult)).toBeTruthy();
    expect(lgtmImagesResult.value).toStrictEqual(expected);
  });

  it('should return a FailureResponse because the API returns an Error', async () => {
    mockServer.use(rest.get(`${apiUrl}/lgtm-images`, mockInternalServerError));

    const lgtmImagesResult = await fetchLgtmImagesInRandom({
      apiBaseUrl: apiUrl,
      accessToken: '',
    });

    const expected = {
      error: new Error('failed to fetchLgtmImagesInRandom'),
      xRequestId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      xLambdaRequestId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    };

    expect(isSuccessResult(lgtmImagesResult)).toBeFalsy();
    expect(lgtmImagesResult.value).toStrictEqual(expected);
  });
});
