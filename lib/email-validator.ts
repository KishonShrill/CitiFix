export const ALLOWED_EMAIL_PROVIDERS = [
    "Gmail",
    "Proton",
    "Yahoo",
    "Zoho",
    "iCloud",
    "MSU-IIT",
] as const;

export const ALLOWED_EMAIL_ERROR_MESSAGE =
    "Only email addresses from Gmail, Proton, Yahoo, Zoho, and iCloud are allowed.";

/**
 * Extracts and normalizes the domain from an email string.
 */
export function getEmailDomain(email: string): string {
    if (!email || typeof email !== "string") return "";
    const trimmed = email.trim().toLowerCase();
    const parts = trimmed.split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return "";
    return parts[1];
}

/**
 * Validates if the email domain is from one of the allowed providers:
 * - Gmail (gmail.com, googlemail.com)
 * - Proton (proton.me, protonmail.com, pm.me, protonmail.ch)
 * - Yahoo (yahoo.com, ymail.com, myyahoo.com, and regional ccTLDs like yahoo.com.ph, yahoo.co.uk)
 * - Zoho (zoho.com, zohomail.com, zoho.eu, zohomail.eu, zoho.in, zohomail.in, etc.)
 * - iCloud / Apple (icloud.com, me.com, mac.com)
 * - MSU-IIT (g.msuiit.edu.ph)
 */
export function isAllowedEmailDomain(email: string): boolean {
    const domain = getEmailDomain(email);
    if (!domain) return false;

    // 1. Gmail
    if (domain === "gmail.com" || domain === "googlemail.com") {
        return true;
    }

    // 2. Proton
    if (
        domain === "proton.me" ||
        domain === "protonmail.com" ||
        domain === "pm.me" ||
        domain === "protonmail.ch"
    ) {
        return true;
    }

    // 3. Yahoo (yahoo.com, ymail.com, myyahoo.com, yahoo.com.ph, yahoo.co.uk, yahoo.fr, etc.)
    if (
        domain === "yahoo.com" ||
        domain === "ymail.com" ||
        domain === "myyahoo.com" ||
        /^yahoo\.[a-z]{2,3}(\.[a-z]{2})?$/.test(domain) ||
        /^yahoo\.co\.[a-z]{2}$/.test(domain) ||
        /^yahoo\.com\.[a-z]{2}$/.test(domain)
    ) {
        return true;
    }

    // 4. Zoho (zoho.com, zohomail.com, zoho.eu, zohomail.eu, zoho.in, etc.)
    if (
        domain === "zoho.com" ||
        domain === "zohomail.com" ||
        /^zoho\.[a-z]{2,3}(\.[a-z]{2})?$/.test(domain) ||
        /^zohomail\.[a-z]{2,3}(\.[a-z]{2})?$/.test(domain)
    ) {
        return true;
    }

    // 5. iCloud (icloud.com, me.com, mac.com)
    if (
        domain === "icloud.com" ||
        domain === "me.com" ||
        domain === "mac.com"
    ) {
        return true;
    }

    // 6. MSU-IIT Academy
    if (domain === "g.msuiit.edu.ph") {
        return true;
    }

    return false;
}
