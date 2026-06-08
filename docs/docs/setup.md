# Raman Family Hub Setup

This first build is a local static prototype. The production setup should split responsibilities:

- Cloudflare: DNS, public website, private app, Cloudflare Access login, optional D1 database.
- iCloud+: real custom-domain mailboxes for the Apple-only family.
- Email sending service: reminders and login-related app emails from `notifications@yourdomain.com`.

## iCloud Mailbox Setup

1. Enable iCloud+ and Family Sharing.
2. In iCloud settings, add your existing custom domain.
3. Choose to share the domain with your family.
4. Create addresses such as:
   - `raman@yourdomain.com`
   - `family@yourdomain.com`
   - `contact@yourdomain.com`
5. Copy Apple's DNS records into Cloudflare DNS.
6. Remove Cloudflare Email Routing MX records for the same domain if they exist.
7. Wait for iCloud verification.

## Private App Login

Use Cloudflare Access in front of `app.yourdomain.com`.

Recommended policy:

- Application: Self-hosted
- Domain: `app.yourdomain.com`
- Login method: One-time PIN by email
- Allowed emails: your family iCloud custom-domain addresses

The app should treat the Cloudflare Access identity email as the user key. That keeps family accounts separate without building password storage first.

## Data Model

Use the SQL in `db/schema.sql` when adding Cloudflare D1 persistence. It separates:

- users
- private and family tasks
- private messages
- custom-domain mailbox addresses

## Next Production Step

Convert the static prototype into a Cloudflare Worker or Pages Functions app with:

- authenticated API routes
- D1-backed tasks and messages
- Cloudflare Access identity headers
- reminder email sending through Resend or Cloudflare Email Service
