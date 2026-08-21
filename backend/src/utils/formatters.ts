/**
 * Format currency in Indian Rupees format (e.g. 1,23,450)
 */
export function formatCurrency(amount: number): string {
  const absolute = Math.abs(amount);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absolute);
}

/**
 * Format date in standard display format
 */
export function formatDisplayDate(dateIso: string): { formattedDate: string; formattedTime: string } {
  try {
    const d = new Date(dateIso);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    let formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (isToday) formattedDate = 'Today';
    else if (isYesterday) formattedDate = 'Yesterday';

    const formattedTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return { formattedDate, formattedTime };
  } catch {
    return { formattedDate: 'Recently', formattedTime: '' };
  }
}

/**
 * Clean and normalize 10-digit Indian phone number
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
  }
  return phone.trim();
}

/**
 * Extract raw 10-digit phone string for matching
 */
export function extractDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Generate standard payment reminder message
 */
export function generateReminderMessage(
  customerName: string,
  amount: number,
  shopName: string,
  upiId?: string,
  language: 'en' | 'mr' = 'en'
): string {
  if (language === 'mr') {
    let msg = `नमस्ते ${customerName},\nतुमची ${shopName} कडे ₹${formatCurrency(amount)} उधारी बाकी आहे. कृपया लवकरात लवकर रक्कम भरावी ही विनंती.\nधन्यवाद!`;
    if (upiId) {
      msg += `\n\nUPI द्वारे पैसे पाठवा: ${upiId}`;
    }
    return msg;
  }

  let msg = `Hello ${customerName},\nYour outstanding balance of ₹${formatCurrency(amount)} is pending with ${shopName}. Please make the payment at your convenience. Thank you.`;
  if (upiId) {
    msg += `\n\nPay via UPI: ${upiId}`;
  }
  return msg;
}

/**
 * Generate WhatsApp URL
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate SMS URL
 */
export function getSMSUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
}
