import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { storeRepository } from '../repositories/store.repository';
import { generateReminderMessage, formatCurrency } from '../utils/formatters';

export class AiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err) {
        logger.warn('Failed to initialize Google GenAI SDK', { error: err });
      }
    }
  }

  /**
   * Generate personalized polite reminder in Marathi or English
   */
  async generatePersonalizedReminder(params: {
    customerName: string;
    amount: number;
    daysOverdue?: number;
    language?: 'en' | 'mr';
    tone?: 'polite' | 'firm' | 'festive';
  }): Promise<{ message: string; source: 'gemini' | 'template' }> {
    const { customerName, amount, daysOverdue = 8, language = 'mr', tone = 'polite' } = params;
    const store = await storeRepository.getProfile();

    if (this.ai) {
      try {
        const prompt = `You are an AI assistant for an Indian neighborhood grocery/kirana store named "${store.name}".
Write a short, respectful, polite, and natural WhatsApp reminder message to a valued customer named "${customerName}".
The customer has a pending credit balance of ₹${formatCurrency(amount)} which is overdue by ${daysOverdue} days.
Tone: ${tone}.
Target Language: ${language === 'mr' ? 'Marathi (मराठी)' : 'English'}.
Include the store's UPI payment ID: "${store.upiId || 'N/A'}".
Do not use harsh or threatening language. Maintain warmth and customer relationship.
Return ONLY the final message text ready to send on WhatsApp.`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text?.trim();
        if (text) {
          return { message: text, source: 'gemini' };
        }
      } catch (err) {
        logger.warn('Gemini API call failed, falling back to local template', { error: err });
      }
    }

    // High quality template fallback
    const templateMsg = generateReminderMessage(
      customerName,
      amount,
      store.name,
      store.upiId,
      language
    );

    return { message: templateMsg, source: 'template' };
  }

  /**
   * Generate intelligent credit health insights
   */
  async generateCreditInsights(stats: {
    totalOutstanding: number;
    recoveryRate: number;
    activeDebtorsCount: number;
    overdueDebtorsCount: number;
  }): Promise<{ summary: string; recommendations: string[] }> {
    const { totalOutstanding, recoveryRate, activeDebtorsCount, overdueDebtorsCount } = stats;

    if (this.ai) {
      try {
        const prompt = `Analyze this retail kirana store credit ledger status:
- Total Outstanding: ₹${formatCurrency(totalOutstanding)}
- 6-Month Recovery Rate: ${recoveryRate}%
- Active Debtors: ${activeDebtorsCount}
- Critical Overdue (>16 days): ${overdueDebtorsCount}

Provide a concise 2-sentence health summary and 3 bullet point actionable collection recommendations for the store owner. Return as JSON with keys "summary" and "recommendations".`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text?.trim();
        if (text) {
          try {
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.summary && Array.isArray(parsed.recommendations)) {
              return parsed;
            }
          } catch {
            // fallback
          }
        }
      } catch (err) {
        logger.warn('Gemini credit insights call failed, using default rules', { error: err });
      }
    }

    // Rule-based insights
    let summary = `Your store has ₹${formatCurrency(totalOutstanding)} outstanding across ${activeDebtorsCount} customers with a ${recoveryRate}% recovery rate.`;
    if (recoveryRate >= 70) {
      summary += ' Overall credit health is steady with healthy repayments.';
    } else {
      summary += ' Immediate follow-up is recommended to improve cash flow recovery.';
    }

    const recommendations = [
      `Trigger batch 8-day WhatsApp payment reminders to ${overdueDebtorsCount} overdue accounts today.`,
      `Share your UPI QR link on WhatsApp to enable instant direct customer settlements.`,
      `Set temporary credit caps on accounts pending over 15 days until partial payment is made.`,
    ];

    return { summary, recommendations };
  }
}

export const aiService = new AiService();
