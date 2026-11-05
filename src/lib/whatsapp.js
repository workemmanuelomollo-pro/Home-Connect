    import { site } from "../config/site";

export function buildWhatsAppLink(provider, form) {
  // 1. Remove any spaces, plus signs, or dashes from the phone number
  const cleanPhone = provider.phone.replace(/\D/g, "");
  
  // 2. Generate the message using our template from config
  const message = site.whatsappTemplate(provider, form);
  
  // 3. Encode the message so it works in a URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}