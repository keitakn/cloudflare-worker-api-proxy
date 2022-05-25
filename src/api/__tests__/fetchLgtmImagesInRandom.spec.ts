/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import fetchLgtmImagesMockBody from '../../mocks/api/fetchLgtmImagesMockBody';
import mockFetchLgtmImages from '../../mocks/api/mockFetchLgtmImages';
import { isSuccessResult } from '../../result';
import { fetchLgtmImagesInRandom } from '../fetchLgtmImages';

const apiUrl = 'https://stg-api.lgtmeow.com';

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
      apiUrl,
      accessToken: '',
    });

    expect(isSuccessResult(lgtmImagesResult)).toBeTruthy();
    expect(lgtmImagesResult.value).toStrictEqual(expected);
  });
});
