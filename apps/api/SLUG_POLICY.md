# Event Slug Policy

Lumiere event slugs are public, human-readable identifiers for invite URLs such as
`/e/amara-theo`. They are not secrets and must not be used for RSVP authorization.

Rules:

- Store event URL slugs in `events.public_slug`.
- Keep `events.public_slug` globally unique.
- Validate slugs with the shared public slug schema: lowercase letters, numbers, hyphens, length
  limits, and reserved route words.
- Check slug availability in create/edit APIs before saving, while keeping the database unique index
  as the race-condition backstop.
- Use high-entropy guest tokens for guest-specific RSVP links and store only protected token hashes.

Future private or unlisted events should add an optional random public key or explicit unguessable
slug mode. That can coexist with normal readable slugs without changing guest-token security.
