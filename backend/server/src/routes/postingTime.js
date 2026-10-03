import { generateText, safeJsonParse, GeminiError } from '../services/gemini.js';

const PLATFORM_AUDIENCE_PRIMETIME = {
  Facebook: '9:00 AM and 1:00 PM weekdays',
  Instagram: '11:00 AM and 7:30 PM weekdays, 11:00 AM weekends',
  LinkedIn: '8:00 AM and 10:00 AM Tuesday-Thursday',
  Pinterest: '2:00 PM and 8:00 PM weekends',
  Threads: '12:00 PM and 6:00 PM weekdays',
  'Twitter/X': '8:00 AM, 12:00 PM, and 5:00 PM weekdays',
  Reddit: '6:00 AM and 9:00 AM US-Pacific weekdays',
  Blog: '8:00 AM and 12:00 PM weekdays',
};

/**
 * Returns best posting time & reach potential for the given topic/platform.
 * Throws GeminiError on failure.
 */
export async function generatePostingTime(topic, platform) {
  const primetime = PLATFORM_AUDIENCE_PRIMETIME[platform] || 'weekday evenings';
  const prompt = `You are a content-strategy analyst. Recommend the best posting time for a piece of content on ${platform} about the topic: "${topic}".

Return ONLY JSON:
{
  "bestTime": "HH:MM AM/PM (local)",
  "bestDay": "Day of week",
  "expectedEngagement": "High" | "Medium" | "Low",
  "potentialReach": "High" | "Medium" | "Low",
  "reason": "2-3 sentence reasoning citing audience behavior and topic virality"
}

Reference: ${platform}'s typical prime-time windows are ${primetime}.
Return only the JSON object, no other text.`;

  const r = await generateText({ prompt, temperature: 0.5, maxOutputTokens: 1024, responseMimeType: 'application/json' });
  const parsed = safeJsonParse(r.text, null);
  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiError('AI returned malformed posting-time data.', { status: 502, model: r.model });
  }
  return {
    bestTime: String(parsed.bestTime || ''),
    bestDay: String(parsed.bestDay || ''),
    expectedEngagement: ['High', 'Medium', 'Low'].includes(parsed.expectedEngagement) ? parsed.expectedEngagement : 'Medium',
    potentialReach: ['High', 'Medium', 'Low'].includes(parsed.potentialReach) ? parsed.potentialReach : 'Medium',
    reason: String(parsed.reason || ''),
  };
}
