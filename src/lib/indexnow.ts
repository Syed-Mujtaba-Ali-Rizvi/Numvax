/**
 * Microsoft IndexNow Integration for Numvax
 * Submits updated, added, or deleted URLs directly to Bing & IndexNow search engines.
 */

export const INDEXNOW_KEY = 'e8f9210c47b34b6289d0f5e123456789';
export const INDEXNOW_HOST = 'numvax.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export async function submitIndexNowUrls(urls: string[]): Promise<{ success: boolean; status: number; message: string }> {
  if (!urls || urls.length === 0) {
    return { success: false, status: 400, message: 'No URLs provided for IndexNow submission.' };
  }

  // Ensure absolute URLs on numvax.com domain
  const formattedUrls = urls.map((u) => {
    if (u.startsWith('http')) return u;
    return `https://${INDEXNOW_HOST}${u.startsWith('/') ? u : `/${u}`}`;
  });

  const payload: IndexNowPayload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: formattedUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 202) {
      return {
        success: true,
        status: response.status,
        message: `Successfully submitted ${formattedUrls.length} URL(s) to IndexNow.`,
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `IndexNow API returned status code ${response.status}.`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: `IndexNow submission error: ${error?.message || 'Unknown network error'}`,
    };
  }
}
