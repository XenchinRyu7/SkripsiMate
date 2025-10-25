# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The SkripsiMate team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability?

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **saefulrohman@example.com** (replace with actual email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include in Your Report

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

### What to Expect

After you submit a report, we will:

1. **Confirm receipt** of your vulnerability report within 48 hours
2. **Investigate** and validate the security issue
3. **Keep you informed** of our progress via email
4. **Work on a fix** and determine a release timeline
5. **Notify you** when the security issue has been fixed
6. **Publicly acknowledge** your responsible disclosure (if you wish)

### Bug Bounty Program

We currently do not have a bug bounty program. However, we will publicly acknowledge security researchers who responsibly disclose vulnerabilities.

## Security Best Practices for Self-Hosting

If you're self-hosting SkripsiMate, please follow these security best practices:

### 1. Environment Variables
- **Never** commit `.env` files to version control
- Use strong, unique API keys
- Rotate API keys regularly
- Use different keys for development and production

### 2. Database Security
- Enable Supabase Row Level Security (RLS) policies
- Use service role key only in secure server environments
- Regularly backup your database
- Monitor database access logs

### 3. API Keys
- Keep Gemini API key server-side only
- Never expose API keys in client-side code
- Set up rate limiting to prevent abuse
- Monitor API usage for unusual patterns

### 4. Authentication
- Use Firebase Authentication with proper security rules
- Enable multi-factor authentication (MFA) when possible
- Implement session timeout
- Regularly review authorized users

### 5. Deployment
- Use HTTPS only (enforce SSL/TLS)
- Keep dependencies up to date (`npm audit`)
- Enable Vercel security headers
- Use environment-specific configurations

### 6. Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Review logs for suspicious activity
- Set up alerts for unusual patterns

## Known Security Considerations

### AI-Generated Content
- AI responses should not be considered secure or validated
- Users should verify AI suggestions before implementation
- Do not share sensitive thesis content if using shared API keys

### Data Storage
- User data is stored in Supabase (see their security practices)
- Authentication handled by Firebase (see their security practices)
- No credit card or payment data stored (when using self-hosted)

### Third-Party Services
SkripsiMate relies on:
- **Firebase** - Authentication
- **Supabase** - Database
- **Gemini AI** - AI generation
- **Vercel** - Hosting (for cloud version)

Please review their respective security policies.

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced via:

- GitHub Security Advisories
- Release notes
- Discord community (when available)

## Questions?

If you have questions about this security policy, please open a GitHub Discussion or email us at saefulrohman@example.com.

---

Thank you for helping keep SkripsiMate and our users safe! 🔒

