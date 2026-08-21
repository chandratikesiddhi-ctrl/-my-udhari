/**
 * Formatting and utility helpers for My Udhari
 */

export function formatCurrency(amount: number): string {
  const absolute = Math.abs(amount);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absolute);
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      if (diffMins <= 1) return 'Just now';
      return `${diffMins} mins ago`;
    }
    if (diffHours < 24) {
      if (diffHours === 1) return '1 hour ago';
      return `${diffHours} hours ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 14) {
      return '1 week ago';
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateReminderMessage(customerName: string, amount: number, shopName: string, upiId?: string): string {
  let msg = `Hello ${customerName},\nYour outstanding balance of ₹${formatCurrency(amount)} is pending with ${shopName}. Please make the payment at your convenience. Thank you.`;
  if (upiId) {
    msg += `\n\nPay via UPI: ${upiId}`;
  }
  return msg;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  // Clean phone number
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function getSMSUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `sms:${cleanPhone}?body=${encodedMsg}`;
}
