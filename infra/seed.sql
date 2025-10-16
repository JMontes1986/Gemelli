insert into org_units (id, name) values ('00000000-0000-0000-0000-000000000001','Colegio'), ('00000000-0000-0000-0000-000000000002','Administración') on conflict do nothing;
insert into users (id,email,full_name,role,org_unit_id) values ('11111111-1111-1111-1111-111111111111','lider.ti@colegio.edu','Líder TI','LIDER_TI','00000000-0000-0000-0000-000000000001') on conflict do nothing;
