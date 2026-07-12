# Event Slug Policy

Lumiere event slugs are public, human-readable identifiers for invite URLs such as
`/e/amara-theo`. They are not secrets and must not be used for RSVP authorization.

Rules:

- Store event URL slugs in `events.public_slug`.
- Keep `events.public_slug` globally unique.
- Validate slugs with the shared public slug schema: lowercase letters, numbers, hyphens, length
  limits, and reserved route words.
- Check slug availability in create/edit APIs before saving. Serialize writes for the same slug and
  keep database unique indexes as race-condition backstops.
- Preserve a changed slug in `event_slug_aliases` so previously shared links continue resolving to
  the event. Alias slugs are reserved from reuse.
- Use high-entropy guest tokens for guest-specific RSVP links and store only protected token hashes.
- For private or unlisted public pages, require an additional access code and store only its keyed
  hash. This code does not replace the event ID, readable slug, or guest RSVP token.

Manager APIs expose the immutable event ID because dashboard routes need it. Public page responses
expose the readable slug but omit the internal event ID and every protected token or hash.
