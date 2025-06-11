// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { isString, isObject, ApiResponse } from "../../lib/type-guards";

type Data = {
  name: string;
};

interface RequestBody {
  name?: string;
}

function isRequestBody(value: unknown): value is RequestBody {
  if (!isObject(value)) {
    return true; // Allow empty body
  }
  
  const obj = value as Record<string, unknown>;
  
  // If name is provided, it must be a string
  if (obj.name !== undefined && !isString(obj.name)) {
    return false;
  }
  
  return true;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Data>>,
) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Validate request body for POST requests
  if (req.method === 'POST') {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body format'
      });
    }
    
    const body = req.body as RequestBody;
    const name = body.name || "John Doe";
    
    return res.status(200).json({
      success: true,
      data: { name },
      message: 'POST request processed successfully'
    });
  }

  // Handle GET request
  res.status(200).json({
    success: true,
    data: { name: "John Doe" },
    message: 'GET request processed successfully'
  });
}
