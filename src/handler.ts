export const handleCatImageValidation = async (
  request: Request,
): Promise<Response> => {
  const responseBody = {
    message: `Hello World!`,
    requestMethod: request.method,
  };

  const jsonBody = JSON.stringify(responseBody);

  const headers = { 'Content-Type': 'application/json' };

  return new Response(jsonBody, { headers });
};

export const handleNotFound = async (request: Request): Promise<Response> => {
  const responseBody = { message: `NotFound`, requestMethod: request.method };

  const jsonBody = JSON.stringify(responseBody);

  const headers = { 'Content-Type': 'application/json' };

  return new Response(jsonBody, { headers, status: 404 });
};
