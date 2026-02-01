// Shared error handling utilities for edge functions
// Maps internal errors to safe client-facing messages

export function mapError(error: unknown): { message: string; status: number } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Log the full error server-side for debugging
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      message: error.message,
      name: error.name,
    } : String(error),
  }));
  
  // Map specific database errors to generic messages
  if (errorMessage.includes('foreign key constraint')) {
    return { message: 'Invalid reference: related record not found', status: 400 };
  }
  
  if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
    return { message: 'Duplicate value: record already exists', status: 409 };
  }
  
  if (errorMessage.includes('not-null constraint') || errorMessage.includes('null value')) {
    return { message: 'Missing required field', status: 400 };
  }
  
  if (errorMessage.includes('invalid input syntax') || errorMessage.includes('is of type')) {
    return { message: 'Invalid data format', status: 400 };
  }
  
  if (errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
    return { message: 'Access denied', status: 403 };
  }
  
  if (errorMessage.includes('does not exist') || errorMessage.includes('no rows')) {
    return { message: 'Record not found', status: 404 };
  }
  
  // Default generic error
  return { message: 'Operation failed', status: 500 };
}

export function createErrorResponse(
  error: unknown,
  corsHeaders: Record<string, string>
): Response {
  const { message, status } = mapError(error);
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
