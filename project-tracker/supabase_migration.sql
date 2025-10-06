/*
  # Схема базы данных для системы управления дефектами

  ИНСТРУКЦИЯ ПО ПРИМЕНЕНИЮ:
  1. Откройте Supabase Dashboard
  2. Перейдите в SQL Editor
  3. Скопируйте и выполните этот SQL код

  ## Таблицы:
  - profiles (профили пользователей с ролями)
  - projects (проекты)
  - project_stages (этапы проектов)
  - defects (дефекты)
  - defect_comments (комментарии к дефектам)
  - defect_history (история изменений дефектов)
  - defect_attachments (вложения к дефектам)
*/

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('manager', 'engineer', 'observer')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Таблица этапов проектов
CREATE TABLE IF NOT EXISTS project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;

-- Таблица дефектов
CREATE TABLE IF NOT EXISTS defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES project_stages(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'review', 'closed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE defects ENABLE ROW LEVEL SECURITY;

-- Таблица комментариев
CREATE TABLE IF NOT EXISTS defect_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_id uuid NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE defect_comments ENABLE ROW LEVEL SECURITY;

-- Таблица истории изменений
CREATE TABLE IF NOT EXISTS defect_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_id uuid NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  field_name text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE defect_history ENABLE ROW LEVEL SECURITY;

-- Таблица вложений
CREATE TABLE IF NOT EXISTS defect_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_id uuid NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE defect_attachments ENABLE ROW LEVEL SECURITY;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_defects_updated_at ON defects;
CREATE TRIGGER update_defects_updated_at
  BEFORE UPDATE ON defects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для получения роли пользователя
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS политики для profiles
CREATE POLICY "Пользователи могут видеть все профили"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Пользователи могут обновлять свой профиль"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Создание профиля при регистрации"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS политики для projects
CREATE POLICY "Все пользователи могут просматривать проекты"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры могут создавать проекты"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'manager');

CREATE POLICY "Менеджеры и создатели могут обновлять проекты"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'manager' OR
    created_by = auth.uid()
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'manager' OR
    created_by = auth.uid()
  );

CREATE POLICY "Менеджеры могут удалять проекты"
  ON projects FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'manager');

-- RLS политики для project_stages
CREATE POLICY "Все пользователи могут просматривать этапы"
  ON project_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры могут управлять этапами"
  ON project_stages FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'manager')
  WITH CHECK (get_user_role(auth.uid()) = 'manager');

-- RLS политики для defects
CREATE POLICY "Все пользователи могут просматривать дефекты"
  ON defects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры и инженеры могут создавать дефекты"
  ON defects FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('manager', 'engineer')
  );

CREATE POLICY "Менеджеры, создатели и назначенные могут обновлять дефекты"
  ON defects FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'manager' OR
    created_by = auth.uid() OR
    assigned_to = auth.uid()
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'manager' OR
    created_by = auth.uid() OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Менеджеры могут удалять дефекты"
  ON defects FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'manager');

-- RLS политики для defect_comments
CREATE POLICY "Все пользователи могут просматривать комментарии"
  ON defect_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры и инженеры могут создавать комментарии"
  ON defect_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('manager', 'engineer') AND
    user_id = auth.uid()
  );

CREATE POLICY "Авторы могут удалять свои комментарии"
  ON defect_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS политики для defect_history
CREATE POLICY "Все пользователи могут просматривать историю"
  ON defect_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Система может создавать записи истории"
  ON defect_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS политики для defect_attachments
CREATE POLICY "Все пользователи могут просматривать вложения"
  ON defect_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Менеджеры и инженеры могут загружать вложения"
  ON defect_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('manager', 'engineer') AND
    uploaded_by = auth.uid()
  );

CREATE POLICY "Менеджеры и загрузившие могут удалять вложения"
  ON defect_attachments FOR DELETE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'manager' OR
    uploaded_by = auth.uid()
  );

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_defects_project_id ON defects(project_id);
CREATE INDEX IF NOT EXISTS idx_defects_assigned_to ON defects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_defects_status ON defects(status);
CREATE INDEX IF NOT EXISTS idx_defects_priority ON defects(priority);
CREATE INDEX IF NOT EXISTS idx_defect_comments_defect_id ON defect_comments(defect_id);
CREATE INDEX IF NOT EXISTS idx_defect_history_defect_id ON defect_history(defect_id);
CREATE INDEX IF NOT EXISTS idx_defect_attachments_defect_id ON defect_attachments(defect_id);

-- Storage bucket для вложений (выполнить в Storage UI или через SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('defect-attachments', 'defect-attachments', false);
