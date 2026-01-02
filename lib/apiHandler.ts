import { NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import { formatZodError } from './validations';

/**
 * API Error Response Interface
 */
export interface ApiError {
  error: string;
  success: false;
  errors?: Record<string, string>;
  code?: string;
}

/**
 * API Success Response Interface
 */
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Custom API Errors
 */
export class ApiException extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.name = 'ApiException';
  }
}

/**
 * Centralized Error Handler
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error);

  // Zod Validation Error
  if (error instanceof ZodError) {
    const errorMessages: Record<string, string> = {};
      const issues = error.issues || [];
    if (issues.length > 0) {
      issues.forEach((err: any) => {
        const path = (err.path || []).join('.') || 'root';
        errorMessages[path] = err.message || 'Geçersiz değer';
      });
    }
    
    const firstError = issues.length > 0 ? issues[0] : null;
    const errorMessage = firstError?.message || formatZodError(error);
    
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: errorMessage,
        errors: errorMessages,
      },
      { status: 400 }
    );
  }

  // Custom API Exception
  if (error instanceof ApiException) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: error.message,
        code: error.code,
        errors: error.errors,
      },
      { status: error.statusCode }
    );
  }

  // Prisma Errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: 'Bu kayıt zaten mevcut',
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
          },
          { status: 409 }
        );

      case 'P2025':
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: 'Kayıt bulunamadı',
            code: 'RECORD_NOT_FOUND',
          },
          { status: 404 }
        );

      case 'P2003':
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: 'İlişkili kayıt bulunamadı',
            code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          },
          { status: 400 }
        );
    }
  }

  // Generic Error
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

  return NextResponse.json<ApiError>(
    {
      success: false,
      error:
        process.env.NODE_ENV === 'development'
          ? errorMessage
          : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    },
    { status: 500 }
  );
}

/**
 * API Route Handler Wrapper
 * Automatically handles errors and validates requests
 */
export function createApiHandler<T extends z.ZodTypeAny>(
  handler: (
    req: NextRequest,
    validatedData: T extends z.ZodType<any, any, infer U> ? U : any,
    context?: any
  ) => Promise<NextResponse<ApiSuccess | ApiError>>,
  schema?: T
) {
  return async (req: NextRequest, context?: any) => {
    try {
      let validatedData: any = undefined;

      // Validate request body if schema provided
      if (schema) {
        try {
          const body = await req.json().catch(() => ({}));
          validatedData = await schema.parseAsync(body);
        } catch (error) {
          if (error instanceof ZodError) {
            return handleApiError(error);
          }
          throw error;
        }
      }

      // Call the handler
      return await handler(req, validatedData, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse<ApiError> }> {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      // JSON parse hatası
      return {
        success: false,
        response: createErrorResponse('Geçersiz JSON formatı', 400),
      };
    }
    
    const data = await schema.parseAsync(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: handleApiError(error),
      };
    }
    // Beklenmeyen hata
    console.error('Unexpected validation error:', error);
    return {
      success: false,
      response: createErrorResponse('Validation hatası', 400),
    };
  }
}

/**
 * Validate search params with Zod schema
 */
export function validateSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse<ApiError> } {
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: handleApiError(error),
      };
    }
    throw error;
  }
}

/**
 * Create success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      ...(data && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  code?: string,
  errors?: Record<string, string>
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error,
      ...(code && { code }),
      ...(errors && { errors }),
    },
    { status }
  );
}

