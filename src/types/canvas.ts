export interface Profile {
    id: string;
    name: string;
}

export interface Course {
    id: number;
    longName: string;
    shortName: string;
    originalName: string;
    courseCode: string;
}

export interface Assignment {
    id: number;
    name: string;
    course_id: number;
    points_possible: number | null;
    due_at: string | null;
    description?: string;
    html_url?: string;
}

export interface Announcement {
    id: number;
    title: string;
    course_id: number;
    posted_at: string | null;
    author?: {
        display_name: string;
    };
    message: string;
    html_url?: string;
}

export interface File {
    id: number;
    display_name: string;
    course_id: number;
    content_type: string;
    size: number;
    mime_class?: string;
    filename?: string;
    created_at?: string;
    updated_at?: string;
    url?: string;
    preview_url?: string;
    thumbnail_url?: string;
    uuid?: string;
    folder_id?: number;
    locked?: boolean;
    hidden?: boolean;
    modified_at?: string;
}

export interface CanvasData {
    profile: Profile;
    courses: Course[];
    assignments: Assignment[];
    announcements: Announcement[];
    files: File[];
    message?: string;
} 