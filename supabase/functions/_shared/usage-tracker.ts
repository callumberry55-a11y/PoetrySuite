export async function trackUsage(
  supabase: any,
  apiKeyId: string,
  developerId: string,
  endpoint: string,
  statusCode: number,
  executionTimeMs: number,
  requestSize: number = 0,
  responseSize: number = 0,
  metadata: Record<string, any> = {}
) {
  try {
    await supabase.from('paas_api_usage').insert({
      api_key_id: apiKeyId,
      developer_id: developerId,
      endpoint,
      request_size: requestSize,
      response_size: responseSize,
      execution_time_ms: executionTimeMs,
      status_code: statusCode,
      metadata
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
  }
}

export function getRequestSize(req: Request): number {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    return 0;
  } catch {
    return 0;
  }
}

export function getResponseSize(data: any): number {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}
