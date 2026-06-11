-- seed.sql — sample catalog for local development.
-- Safe to run repeatedly (idempotent on slugs/numbers).

with uni as (
  insert into public.universities (name, slug)
  values ('Example Institute of Technology', 'example-tech')
  on conflict (slug) do update set name = excluded.name
  returning id
),
br as (
  insert into public.branches (university_id, name, slug)
  select id, 'Computer Science & Engineering', 'cse' from uni
  on conflict (university_id, slug) do update set name = excluded.name
  returning id
),
sem as (
  insert into public.semesters (branch_id, number, name)
  select id, 3, 'Semester 3' from br
  on conflict (branch_id, number) do update set name = excluded.name
  returning id
),
subj as (
  insert into public.subjects (semester_id, name, code, slug)
  select id, 'Data Structures Lab', 'CS231', 'data-structures-lab' from sem
  on conflict (semester_id, slug) do update set name = excluded.name
  returning id
)
insert into public.experiments (subject_id, number, title, description)
select id, n.number, n.title, n.description
from subj,
  (values
    (1, 'Implement a singly linked list', 'Create, traverse, insert, delete.'),
    (2, 'Stack using arrays', 'Push/pop with overflow/underflow handling.'),
    (3, 'Binary search tree', 'Insertion, traversal, and search.')
  ) as n(number, title, description)
on conflict (subject_id, number) do update set title = excluded.title;
