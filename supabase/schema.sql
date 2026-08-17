-- ========================================================
-- COGNIA AI - SUPABASE POSTGRESQL SCHEMA WITH ADMIN APPROVAL
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial departments
INSERT INTO departments (code, name) VALUES
('CS', 'Computer Science & Engineering'),
('EC', 'Electronics & Communication'),
('ME', 'Mechanical Engineering'),
('EE', 'Electrical Engineering')
ON CONFLICT (code) DO NOTHING;

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_code VARCHAR(20) REFERENCES departments(code) ON DELETE CASCADE,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial courses
INSERT INTO courses (department_code, course_code, course_name, semester) VALUES
('CS', 'CS501', 'Database Management Systems', 5),
('CS', 'CS502', 'Operating Systems', 5),
('CS', 'CS601', 'Artificial Intelligence & RAG', 6),
('EC', 'EC401', 'Signals and Systems', 4)
ON CONFLICT (course_code) DO NOTHING;

-- 3. PROFILES / USERS TABLE WITH ADMIN APPROVAL WORKFLOW
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- References Supabase auth.users(id)
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    university_id VARCHAR(50), -- Roll Number / Employee ID
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    department VARCHAR(20) DEFAULT 'CS',
    course VARCHAR(20) DEFAULT 'CS501',
    semester INT DEFAULT 1,
    section VARCHAR(10) DEFAULT 'A',
    designation VARCHAR(50), -- e.g. Assistant Professor / HOD
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID,
    rejected_at TIMESTAMP WITH TIME ZONE,
    suspended_by UUID,
    suspended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alias view for legacy backward compatibility if needed
CREATE OR REPLACE VIEW users AS SELECT * FROM profiles;

-- Seed Initial Demo Accounts for instant local evaluation
INSERT INTO profiles (id, email, full_name, university_id, role, status, department, course, semester, section, designation) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@univ.edu', 'Dr. Sarah Connor', 'EMP-001', 'admin', 'approved', 'CS', 'ALL', 0, 'A', 'Head Administrator'),
('b0000000-0000-0000-0000-000000000002', 'teacher@univ.edu', 'Prof. Alan Turing', 'EMP-102', 'teacher', 'approved', 'CS', 'CS501', 0, 'A', 'Associate Professor'),
('c0000000-0000-0000-0000-000000000003', 'student@univ.edu', 'Alex Rivera', 'STUD-501', 'student', 'approved', 'CS', 'CS501', 5, 'A', 'Student'),
('d0000000-0000-0000-0000-000000000004', 'pending_student@univ.edu', 'Jane Doe (Pending)', 'STUD-999', 'student', 'pending', 'CS', 'CS501', 5, 'B', 'Student')
ON CONFLICT (id) DO NOTHING;

-- 4. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'circular', 'curriculum', 'pyq', 'academic_calendar',
        'regulation', 'exam_notice', 'lecture_notes', 'assignment', 'other'
    )),
    department VARCHAR(20) DEFAULT 'ALL',
    course VARCHAR(20) DEFAULT 'ALL',
    semester INT DEFAULT 0,
    audience VARCHAR(50) DEFAULT 'everyone',
    uploaded_by VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    visibility VARCHAR(30) NOT NULL CHECK (visibility IN (
        'everyone', 'students', 'teachers', 'department', 'course_students', 'owner_only'
    )),
    effective_date DATE DEFAULT CURRENT_DATE,
    version INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    storage_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DOCUMENT VERSIONS TABLE
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    change_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    course VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["A", "B", "C", "D"]
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    topic VARCHAR(100),
    source_document VARCHAR(255),
    source_page INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. QUIZ ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    course VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) DEFAULT 'ALL',
    deadline TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES quiz_assignments(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    answers JSONB NOT NULL, -- Student selected options
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profile view" ON profiles FOR SELECT USING (true);
CREATE POLICY "Documents access control" ON documents FOR SELECT USING (
    visibility = 'everyone' OR
    visibility = 'students' OR
    visibility = 'teachers'
);
