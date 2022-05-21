export const handleRequest = async (request: Request): Promise<Response> => {

  const responseBody = { message: `Hello World!`, requestMethod: request.method };

  const jsonBody = JSON.stringify(responseBody, null, 2);

  const headers = { 'Content-Type': 'application/json' };

  return new Response(jsonBody, { headers });
};
