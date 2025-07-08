/**
 * Utility functions for WhatsApp integration
 */

/**
 * Format phone number for WhatsApp URL
 * @param phone - The phone number (can be with or without + prefix)
 * @returns WhatsApp URL in format https://wa.me/+countrycode+number
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except the leading +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Ensure phone starts with +
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }
  
  return `https://wa.me/${cleanPhone}`;
}

/**
 * Format phone number for WhatsApp URL from business/phone data object
 * @param data - Object containing phone number information
 * @returns WhatsApp URL
 */
export function formatPhoneForWhatsAppFromData(data: { phone?: string; number?: string }): string {
  // Prefer 'number' field over 'phone' if both exist
  const phoneNumber = data.number || data.phone;
  return formatPhoneForWhatsApp(phoneNumber || '');
}
