-- ENUMS
create type public.task_priority as enum ('baja','normal','alta','urgente');
create type public.task_status as enum ('pendiente','en_curso','bloqueada','hecha','cancelada');
create type public.calendar_event_type as enum ('vencimiento','recordatorio','cita','llamada','interno');
create type public.automation_rule_type as enum ('avisar_antes','falta_documentacion','expediente_parado','subvencion_sin_expediente','fecha_aviso_socio');
create type public.automation_rule_status as enum ('activa','pausada','archivada');
create type public.email_draft_status as enum ('draft','pending_approval','approved','cancelled','sent');
create type public.ai_proposal_status as enum ('pending','accepted','rejected','executed');

-- ============ TASKS ============
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  title text not null,
  description text,
  due_date date,
  reminder_at timestamptz,
  priority public.task_priority not null default 'normal',
  status public.task_status not null default 'pendiente',
  socio_id uuid,
  aid_application_id uuid,
  assigned_to uuid,
  completed_at timestamptz,
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "Members view tasks" on public.tasks for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create tasks" on public.tasks for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update tasks" on public.tasks for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ CALENDAR EVENTS ============
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  title text not null,
  description text,
  event_type public.calendar_event_type not null default 'recordatorio',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  socio_id uuid,
  aid_application_id uuid,
  created_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.calendar_events to authenticated;
grant all on public.calendar_events to service_role;
alter table public.calendar_events enable row level security;
create policy "Members view events" on public.calendar_events for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create events" on public.calendar_events for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update events" on public.calendar_events for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ AUTOMATION RULES ============
create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  name text not null,
  rule_type public.automation_rule_type not null,
  days_before integer not null default 0,
  channel text not null default 'notificacion_interna',
  create_email_draft boolean not null default false,
  status public.automation_rule_status not null default 'activa',
  config jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_rules to authenticated;
grant all on public.automation_rules to service_role;
alter table public.automation_rules enable row level security;
create policy "Members view rules" on public.automation_rules for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create rules" on public.automation_rules for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update rules" on public.automation_rules for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ AUTOMATION RUNS ============
create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  rule_id uuid not null,
  ran_at timestamptz not null default now(),
  status text not null default 'ok',
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.automation_runs to authenticated;
grant all on public.automation_runs to service_role;
alter table public.automation_runs enable row level security;
create policy "Members view runs" on public.automation_runs for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  user_id uuid not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Editors create notifications" on public.notifications for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ EMAIL TEMPLATES ============
create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  name text not null,
  subject text not null default '',
  body text not null default '',
  created_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.email_templates to authenticated;
grant all on public.email_templates to service_role;
alter table public.email_templates enable row level security;
create policy "Members view templates" on public.email_templates for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create templates" on public.email_templates for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update templates" on public.email_templates for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ EMAIL DRAFTS ============
create table public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  recipient text,
  subject text not null default '',
  body text not null default '',
  socio_id uuid,
  task_id uuid,
  status public.email_draft_status not null default 'draft',
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.email_drafts to authenticated;
grant all on public.email_drafts to service_role;
alter table public.email_drafts enable row level security;
create policy "Members view drafts" on public.email_drafts for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create drafts" on public.email_drafts for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update drafts" on public.email_drafts for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ AI CONVERSATIONS ============
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  user_id uuid not null,
  title text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.ai_conversations to authenticated;
grant all on public.ai_conversations to service_role;
alter table public.ai_conversations enable row level security;
create policy "Owner views conversations" on public.ai_conversations for select to authenticated
  using (user_id = auth.uid() and is_org_member(auth.uid(), cooperative_id));
create policy "Owner creates conversations" on public.ai_conversations for insert to authenticated
  with check (user_id = auth.uid() and has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Owner updates conversations" on public.ai_conversations for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ AI MESSAGES ============
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  cooperative_id uuid not null,
  role text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert on public.ai_messages to authenticated;
grant all on public.ai_messages to service_role;
alter table public.ai_messages enable row level security;
create policy "Owner views messages" on public.ai_messages for select to authenticated
  using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "Owner creates messages" on public.ai_messages for insert to authenticated
  with check (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- ============ AI ACTION PROPOSALS ============
create table public.ai_action_proposals (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null,
  conversation_id uuid,
  message_id uuid,
  kind text not null,
  title text not null,
  description text,
  payload jsonb not null default '{}'::jsonb,
  status public.ai_proposal_status not null default 'pending',
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.ai_action_proposals to authenticated;
grant all on public.ai_action_proposals to service_role;
alter table public.ai_action_proposals enable row level security;
create policy "Members view proposals" on public.ai_action_proposals for select to authenticated
  using (is_org_member(auth.uid(), cooperative_id));
create policy "Editors create proposals" on public.ai_action_proposals for insert to authenticated
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));
create policy "Editors update proposals" on public.ai_action_proposals for update to authenticated
  using (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]))
  with check (has_org_role(auth.uid(), cooperative_id, array['admin'::org_role,'gestor'::org_role]));

-- ============ updated_at triggers ============
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.update_updated_at_column();
create trigger trg_calendar_events_updated before update on public.calendar_events
  for each row execute function public.update_updated_at_column();
create trigger trg_automation_rules_updated before update on public.automation_rules
  for each row execute function public.update_updated_at_column();
create trigger trg_email_templates_updated before update on public.email_templates
  for each row execute function public.update_updated_at_column();
create trigger trg_email_drafts_updated before update on public.email_drafts
  for each row execute function public.update_updated_at_column();
create trigger trg_ai_conversations_updated before update on public.ai_conversations
  for each row execute function public.update_updated_at_column();
create trigger trg_ai_action_proposals_updated before update on public.ai_action_proposals
  for each row execute function public.update_updated_at_column();

-- ============ indexes ============
create index idx_tasks_coop on public.tasks(cooperative_id) where archived_at is null;
create index idx_tasks_socio on public.tasks(socio_id);
create index idx_calendar_events_coop on public.calendar_events(cooperative_id) where archived_at is null;
create index idx_automation_rules_coop on public.automation_rules(cooperative_id) where archived_at is null;
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_email_drafts_coop on public.email_drafts(cooperative_id) where archived_at is null;
create index idx_ai_messages_conv on public.ai_messages(conversation_id);
create index idx_ai_proposals_coop on public.ai_action_proposals(cooperative_id);