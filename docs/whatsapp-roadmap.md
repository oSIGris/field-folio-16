# WhatsApp Document Lookup Roadmap

Future goal: allow a farmer/socio to ask about their files through WhatsApp.

## Identifier

Use `socios.whatsapp_phone_e164` as the normalized lookup value.

Examples:

- `+34600111222`
- `+34953111222`

Do not rely on free-form `telefono_1` or `telefono_2` for automated WhatsApp lookup. Those fields are useful for office work, but WhatsApp needs a normalized and verified value.

## Consent

Use:

- `whatsapp_opt_in`
- `whatsapp_opt_in_at`
- `whatsapp_last_interaction_at`

No automated WhatsApp document flow should respond with private information unless `whatsapp_opt_in = true` and the phone number is verified.

## Recommended future flow

1. Admin sets or imports `whatsapp_phone_e164` for a socio.
2. Admin records explicit consent.
3. WhatsApp provider receives an inbound message.
4. Edge Function normalizes the sender phone to E.164.
5. The function searches active socios by `whatsapp_phone_e164`.
6. If exactly one socio is found and consent is active, the bot can show safe metadata or generate signed download links.
7. If multiple matches exist, the bot asks for an additional verification factor such as NIF/CIF suffix.
8. Every interaction is logged.

## Security notes

- Never send public Storage URLs for private documents.
- Prefer short-lived signed URLs or document summaries.
- Do not expose the Supabase service role key in the frontend.
- Log all WhatsApp file access in an audit table before production.
- For high-risk documents, require a second factor before sharing.

## Current implementation

The current code only prepares the database fields and indexes. It does not implement the WhatsApp bot yet.
