# Access Model

This ERP separates internal cooperative users from farmer/socio portal users.

## Internal cooperative users

Internal users are stored in `organization_members` and belong to one or more cooperatives.

Roles:

- `admin`: manages cooperative configuration, users, socios and portal links.
- `gestor`: edits socios and operational records.
- `consulta`: read-only access to cooperative data.

Internal users can access socios through RLS when they are members of the matching `cooperative_id`.

## Farmer/socio portal users

Farmer accounts are not inserted into `organization_members` by default.

They are linked to exactly the records they can see through `socio_user_access`:

- `user_id`: Supabase Auth user.
- `socio_id`: linked socio record.
- `cooperative_id`: tenant boundary, enforced by a composite foreign key.
- `status`: `active`, `invited` or `disabled`.

The `socios` SELECT policy allows access when either condition is true:

1. The user is an internal member of the cooperative.
2. The user has an active link in `socio_user_access` for that specific socio.

This prevents a farmer portal login from inheriting tenant-wide access.

## Deletions

Authenticated users do not hard-delete socios. The UI soft-deletes by setting `deleted_at` through the UPDATE policy. Queries should filter `deleted_at IS NULL` by default.

## Current portal scope

The first portal screen is read-only and shows the linked socio's basic administrative status. Future phases should add document upload, secure notifications and campaign-specific forms.
