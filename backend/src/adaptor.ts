import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export function handleWebRoute(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const url = `${protocol}://${host}${req.originalUrl}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      // Convert Express req stream to Web Request body
      const method = req.method;
      const hasBody = !['GET', 'HEAD'].includes(method);

      let body: any = undefined;
      if (hasBody) {
        const chunks: any[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
      }

      const webReq = new Request(url, {
        method,
        headers,
        body: hasBody ? body : undefined,
      });

      const context = {
        params: Promise.resolve(req.params),
      };

      const webRes = await handler(webReq, context);

      // Send status code
      res.status(webRes.status);

      // Send headers
      webRes.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });

      // Send body
      const text = await webRes.text();
      res.send(text);
    } catch (error: any) {
      console.error('Express Web Route Adaptor Error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };
}
