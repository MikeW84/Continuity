# Personal Life Management System - iOS Architecture Documentation

## Project Overview

This document provides comprehensive architecture and functionality details for reproducing the Personal Life Management System as a native iOS application. The system is designed as a comprehensive personal development and life tracking platform with multiple interconnected modules.

## Core Architecture

### Technology Stack (Current Web Implementation)
- **Frontend**: TypeScript React with Wouter routing
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS with Shadcn UI components
- **Data Fetching**: TanStack Query (React Query)

### iOS Implementation Recommendations
- **Language**: Swift/SwiftUI
- **Architecture Pattern**: MVVM with Combine
- **Data Persistence**: Core Data or SQLite
- **Networking**: URLSession with async/await
- **UI Framework**: SwiftUI with custom component library
- **State Management**: ObservableObject with @StateObject/@ObservedObject

## Database Schema

### Core Tables

#### 1. Users
```sql
users {
  id: serial (primary key)
  username: text (unique, not null)
  password: text (not null)
  display_name: text
  email: text
}
```

#### 2. Projects
```sql
projects {
  id: serial (primary key)
  title: text (not null)
  description: text
  progress: integer (default 0, 0-100%)
  due_date: timestamp
  is_priority: boolean (default false, only one can be true per user)
  is_archived: boolean (default false)
  impact: text (default "Medium", values: "High", "Medium", "Low")
  user_id: integer (not null, foreign key)
}
```

#### 3. Project Tasks
```sql
project_tasks {
  id: serial (primary key)
  title: text (not null)
  is_completed: boolean (default false)
  project_id: integer (not null, foreign key, cascade delete)
  created_at: timestamp (default now)
}
```

#### 4. Ideas
```sql
ideas {
  id: serial (primary key)
  title: text (not null)
  description: text
  votes: integer (default 0)
  tags: text[] (array)
  user_id: integer (not null)
}
```

#### 5. Learning Items
```sql
learning_items {
  id: serial (primary key)
  title: text (not null)
  category: text
  resources: text
  progress: integer (default 0, 0-100%)
  is_currently_learning: boolean (default false)
  user_id: integer (not null)
}
```

#### 6. Habits
```sql
habits {
  id: serial (primary key)
  title: text (not null)
  completed_days: integer (default 0)
  target_days: integer (default 20, monthly target)
  is_completed_today: boolean (default false)
  user_id: integer (not null)
}
```

#### 7. Habit Completions
```sql
habit_completions {
  id: serial (primary key)
  habit_id: integer (not null, foreign key, cascade delete)
  date: timestamp
  completed: boolean (default true)
  year: integer (not null)
  month: integer (not null, 1-12)
  day: integer (not null, 1-31)
}
```

#### 8. Exercises
```sql
exercises {
  id: serial (primary key)
  name: text (not null)
  date: text (not null, YYYY-MM-DD format)
  category: text (not null, values: "Cardio", "Strength", "Flexibility")
  -- Category-specific fields:
  time: integer (minutes, for Cardio)
  distance: double (miles, for Cardio)
  heart_rate: integer (peak, for Cardio)
  weight: double (kg, for Strength)
  reps: integer (for Strength)
  sets: integer (for Strength)
  duration: integer (minutes, for Flexibility)
  muscles_worked: text (for Flexibility)
  user_id: integer (not null)
}
```

#### 9. Exercise Completions
```sql
exercise_completions {
  id: serial (primary key)
  exercise_id: integer (not null, foreign key, cascade delete)
  date: timestamp (not null)
  year: integer (not null)
  month: integer (not null, 1-12)
  day: integer (not null, 1-31)
  category: text (not null)
  user_id: integer (not null)
}
```

#### 10. Date Ideas
```sql
date_ideas {
  id: serial (primary key)
  title: text (not null)
  description: text
  date: timestamp
  is_scheduled: boolean (default false)
  user_id: integer (not null)
}
```

#### 11. Parenting Tasks
```sql
parenting_tasks {
  id: serial (primary key)
  title: text (not null)
  description: text
  is_completed: boolean (default false)
  user_id: integer (not null)
}
```

#### 12. Values
```sql
values {
  id: serial (primary key)
  title: text (not null)
  description: text
  user_id: integer (not null)
}
```

#### 13. Dreams
```sql
dreams {
  id: serial (primary key)
  title: text (not null)
  description: text
  tags: text[] (array)
  timeframe: text
  user_id: integer (not null)
}
```

#### 14. Today Tasks
```sql
today_tasks {
  id: serial (primary key)
  title: text (not null)
  notes: text
  is_priority: boolean (default false, "Top 3" designation)
  is_completed: boolean (default false)
  position: integer (default 0, for ordering)
  date: timestamp (not null, the date this task is for)
  user_id: integer (not null)
}
```

#### 15. Quotes
```sql
quotes {
  id: serial (primary key)
  text: text (not null)
  author: text
  source: text
  user_id: integer (not null)
}
```

### Relationship Tables

#### Project-Value Relations
```sql
project_values {
  id: serial (primary key)
  project_id: integer (not null, foreign key, cascade delete)
  value_id: integer (not null, foreign key, cascade delete)
}
```

#### Project-Dream Relations
```sql
project_dreams {
  id: serial (primary key)
  project_id: integer (not null, foreign key, cascade delete)
  dream_id: integer (not null, foreign key, cascade delete)
}
```

## Application Structure

### Navigation Architecture

The app uses a sidebar-based navigation with the following main sections:

1. **Dashboard** (/) - Overview of all sections
2. **Today** (/today) - Daily task management
3. **Projects** (/projects) - Project tracking and management
4. **Ideas** (/ideas) - Idea capture and voting
5. **Learning** (/learning) - Learning progress tracking
6. **Health Habits** (/health-habits) - Health and wellness tracking
7. **Habits** (/habits) - Daily habit tracking
8. **Exercise** (/exercise) - Exercise logging and tracking
9. **Family** (/family) - Date ideas and parenting tasks
10. **Values** (/values) - Personal values definition
11. **Settings** (/settings) - App configuration and quotes

### iOS Navigation Implementation
```swift
// TabView with sidebar-style navigation
TabView {
    DashboardView()
        .tabItem { Label("Dashboard", systemImage: "house") }
    
    TodayView()
        .tabItem { Label("Today", systemImage: "calendar") }
    
    ProjectsView()
        .tabItem { Label("Projects", systemImage: "folder") }
    
    // Additional tabs...
}
```

## Core Functionality by Module

### 1. Dashboard Module

**Purpose**: Centralized overview of all life management areas

**Key Features**:
- Displays condensed views of all sections
- Shows priority project prominently
- Provides quick access to current habits
- Displays today's tasks
- Shows progress indicators

**Data Requirements**:
- Fetch all active data from each module
- Calculate progress percentages
- Show completion rates
- Display upcoming deadlines

**iOS Implementation**:
```swift
struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ProjectsSectionView(projects: viewModel.projects)
                HabitsSectionView(habits: viewModel.habits)
                TodayTasksSectionView(tasks: viewModel.todayTasks)
                // Additional sections...
            }
        }
        .onAppear { viewModel.fetchAllData() }
    }
}
```

### 2. Projects Module

**Purpose**: Comprehensive project tracking with task management

**Key Features**:
- Create, edit, delete projects
- Set one priority project per user
- Track progress via task completion (auto-calculated)
- Archive/unarchive projects
- Link projects to values and dreams
- Set due dates and impact levels
- Sub-task management within projects

**Business Logic**:
- Progress calculation: `(completed_tasks / total_tasks) * 100`
- Only one project can be marked as priority
- Archived projects hidden by default
- Tasks auto-update project progress when completed

**API Endpoints**:
```
GET /api/projects?showArchived=false
GET /api/projects/:id
POST /api/projects
PATCH /api/projects/:id
DELETE /api/projects/:id
POST /api/projects/:id/priority
POST /api/projects/:id/archive

GET /api/projects/:projectId/tasks
GET /api/project-tasks/:id
POST /api/project-tasks
PATCH /api/project-tasks/:id
DELETE /api/project-tasks/:id
POST /api/project-tasks/:id/toggle
```

**iOS Implementation**:
```swift
class ProjectsViewModel: ObservableObject {
    @Published var projects: [Project] = []
    @Published var showArchived = false
    @Published var priorityProject: Project?
    
    func fetchProjects() async {
        // Network call implementation
    }
    
    func setPriorityProject(_ project: Project) async {
        // Update priority logic
    }
    
    func calculateProgress(for project: Project) -> Int {
        let tasks = project.tasks
        guard !tasks.isEmpty else { return 0 }
        let completed = tasks.filter { $0.isCompleted }.count
        return Int((Double(completed) / Double(tasks.count)) * 100)
    }
}
```

### 3. Ideas Module

**Purpose**: Capture and prioritize creative ideas

**Key Features**:
- Quick idea capture with title and description
- Tag-based categorization
- Voting system for prioritization
- Edit and delete ideas

**Business Logic**:
- Ideas sorted by vote count (highest first)
- Tags stored as array for filtering
- Simple upvote/downvote system

**API Endpoints**:
```
GET /api/ideas
GET /api/ideas/:id
POST /api/ideas
PATCH /api/ideas/:id
DELETE /api/ideas/:id
POST /api/ideas/:id/vote
```

### 4. Learning Module

**Purpose**: Track learning goals and resources

**Key Features**:
- Create learning items with categories
- Track progress percentage
- Mark items as "currently learning"
- Store resources/links
- Progress tracking

**Business Logic**:
- Progress is manually set (0-100%)
- Category-based organization
- "Currently learning" flag for active items

**API Endpoints**:
```
GET /api/learning
GET /api/learning/:id
POST /api/learning
PATCH /api/learning/:id
DELETE /api/learning/:id
```

### 5. Habits Module

**Purpose**: Daily habit tracking with calendar view

**Key Features**:
- Create habits with monthly targets (default 20 days)
- Daily completion tracking
- Calendar view showing completion history
- Progress visualization
- Monthly completion statistics

**Business Logic**:
- Habits have monthly targets (typically 20 days)
- Individual day completions tracked in separate table
- Progress calculated as: `(completed_days_this_month / target_days) * 100`
- Calendar view shows completion status for each day

**API Endpoints**:
```
GET /api/habits
GET /api/habits/:id
POST /api/habits
PATCH /api/habits/:id
DELETE /api/habits/:id
POST /api/habits/:id/toggle
GET /api/habits/:id/completions/:year/:month
POST /api/habits/:id/toggle-day
```

**iOS Implementation**:
```swift
struct HabitCalendarView: View {
    let habit: Habit
    @State private var completions: [HabitCompletion] = []
    
    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7)) {
            ForEach(daysInMonth, id: \.self) { day in
                DayCell(
                    day: day,
                    isCompleted: completions.contains { $0.day == day },
                    onTap: { toggleDay(day) }
                )
            }
        }
    }
}
```

### 6. Exercise Module

**Purpose**: Exercise logging with category-specific fields

**Key Features**:
- Three exercise categories: Cardio, Strength, Flexibility
- Category-specific data fields:
  - **Cardio**: time, distance, heart rate
  - **Strength**: weight, reps, sets
  - **Flexibility**: duration, muscles worked
- Calendar completion tracking
- Exercise history and progress

**Business Logic**:
- Date stored as YYYY-MM-DD string
- Category determines which fields are relevant
- Separate completion tracking for calendar views

**API Endpoints**:
```
GET /api/exercises
GET /api/exercises/:id
POST /api/exercises
PATCH /api/exercises/:id
DELETE /api/exercises/:id
GET /api/exercise-completions/:year/:month
POST /api/exercise-completions
```

### 7. Family Module

**Purpose**: Family relationship management

**Components**:
- **Date Ideas**: Planning and scheduling romantic activities
- **Parenting Tasks**: Tracking parenting responsibilities

**Date Ideas Features**:
- Create date ideas with descriptions
- Schedule dates with specific times
- Mark ideas as scheduled/unscheduled

**Parenting Tasks Features**:
- Task creation with descriptions
- Completion tracking
- Simple todo-style management

**API Endpoints**:
```
GET /api/date-ideas
POST /api/date-ideas
PATCH /api/date-ideas/:id
DELETE /api/date-ideas/:id

GET /api/parenting-tasks
POST /api/parenting-tasks
PATCH /api/parenting-tasks/:id
DELETE /api/parenting-tasks/:id
POST /api/parenting-tasks/:id/toggle
```

### 8. Today Module

**Purpose**: Daily task management with prioritization

**Key Features**:
- Daily task creation for current date
- "Top 3" priority designation
- Task reordering via drag-and-drop
- Completion tracking
- Notes field for additional context

**Business Logic**:
- Tasks are date-specific
- Priority tasks (Top 3) limited to 3 per day
- Position field enables custom ordering
- Tasks can be reordered via API

**API Endpoints**:
```
GET /api/today-tasks
GET /api/today-tasks/priority
GET /api/today-tasks/regular
GET /api/today-tasks/:id
POST /api/today-tasks
PATCH /api/today-tasks/:id
DELETE /api/today-tasks/:id
POST /api/today-tasks/:id/toggle
POST /api/today-tasks/:id/priority
POST /api/today-tasks/reorder
```

### 9. Values Module

**Purpose**: Define and track personal values

**Key Features**:
- Create values with descriptions
- Link values to projects (many-to-many relationship)
- Value-based project filtering

**Business Logic**:
- Values can be associated with multiple projects
- Projects can embody multiple values
- Used for project alignment and filtering

**API Endpoints**:
```
GET /api/values
GET /api/values/:id
POST /api/values
PATCH /api/values/:id
DELETE /api/values/:id
```

### 10. Dreams Module

**Purpose**: Long-term goal and aspiration tracking

**Key Features**:
- Create dreams with descriptions
- Tag-based categorization
- Timeframe specification
- Link dreams to projects (many-to-many relationship)

**Business Logic**:
- Dreams can span multiple projects
- Projects can contribute to multiple dreams
- Timeframe is free-text (e.g., "5 years", "by 2025")

**API Endpoints**:
```
GET /api/dreams
GET /api/dreams/:id
POST /api/dreams
PATCH /api/dreams/:id
DELETE /api/dreams/:id
```

### 11. Settings Module

**Purpose**: App configuration and inspirational content

**Key Features**:
- Theme management (light/dark)
- Section visibility toggles
- Quotes management
- App preferences

**Quotes Sub-module**:
- Store inspirational quotes
- Author and source attribution
- Personal quote collection

**API Endpoints**:
```
GET /api/quotes
GET /api/quotes/:id
POST /api/quotes
PATCH /api/quotes/:id
DELETE /api/quotes/:id
```

## Data Flow Architecture

### State Management Pattern

**Current Web Implementation**:
```typescript
// Context-based state management
const AppContext = createContext<AppContextProps | null>(null);

// Provider wraps entire app
<AppProvider>
  <App />
</AppProvider>

// Components consume context
const { projects, addProject, updateProject } = useAppContext();
```

**iOS Implementation Recommendation**:
```swift
// ObservableObject for app-wide state
class AppState: ObservableObject {
    @Published var projects: [Project] = []
    @Published var habits: [Habit] = []
    @Published var user: User?
    
    // Business logic methods
    func addProject(_ project: Project) async {
        // API call and state update
    }
}

// Environment injection
@main
struct LifeManagementApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}
```

### API Communication Pattern

**RESTful API Design**:
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- Consistent URL patterns
- JSON request/response format
- Error handling with appropriate status codes

**iOS Networking Layer**:
```swift
class APIClient {
    private let baseURL = "https://api.yourapp.com"
    
    func fetch<T: Codable>(_ endpoint: String, type: T.Type) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    func post<T: Codable>(_ endpoint: String, body: Encodable, type: T.Type) async throws -> T {
        // POST implementation
    }
}
```

## User Interface Patterns

### Layout Structure

**Current Web Implementation**:
- Sidebar navigation (64px wide on mobile, 256px on desktop)
- Main content area with header
- Responsive design with mobile-first approach
- Floating action buttons for quick actions

**iOS Adaptation**:
```swift
struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "house") }
            
            TodayView()
                .tabItem { Label("Today", systemImage: "calendar") }
            
            // Additional tabs
        }
        .accentColor(.primary)
    }
}

struct NavigationWrapper<Content: View>: View {
    let title: String
    let content: Content
    
    var body: some View {
        NavigationView {
            content
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.large)
        }
    }
}
```

### Component Library

**Essential UI Components**:

1. **Card Components**:
   - Project cards with progress indicators
   - Habit completion cards
   - Idea cards with voting buttons

2. **Form Components**:
   - Text input fields
   - Date pickers
   - Multi-select components
   - Progress sliders

3. **List Components**:
   - Draggable task lists
   - Filterable project lists
   - Completion checkboxes

4. **Calendar Components**:
   - Monthly habit tracking grid
   - Exercise completion calendar
   - Date selection interfaces

**iOS Component Examples**:
```swift
struct ProjectCard: View {
    let project: Project
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(project.title)
                    .font(.headline)
                Spacer()
                if project.isPriority {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                }
            }
            
            Text(project.description ?? "")
                .font(.caption)
                .foregroundColor(.secondary)
            
            ProgressView(value: Double(project.progress), total: 100)
                .progressViewStyle(LinearProgressViewStyle())
            
            Text("\(project.progress)% Complete")
                .font(.caption)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onTapGesture(perform: onTap)
    }
}
```

## Critical Business Rules

### Priority Project Logic
- Only one project per user can be marked as priority
- Setting a new priority project automatically removes priority from the previous one
- Priority projects are prominently displayed on the dashboard

### Progress Calculation
- Project progress is automatically calculated based on task completion
- Formula: `(completed_tasks / total_tasks) * 100`
- Projects with no tasks show 0% progress
- Progress updates in real-time when tasks are toggled

### Habit Tracking Logic
- Habits have monthly targets (default 20 days)
- Individual day completions are tracked separately
- Today's completion status is separate from calendar tracking
- Monthly progress resets each month

### Today Tasks Management
- Tasks are date-specific and don't carry over
- Maximum 3 priority tasks per day
- Tasks can be reordered within their priority group
- Position field maintains custom ordering

### Archive and Visibility Rules
- Archived projects are hidden by default
- Archive status can be toggled
- Deleted items are permanently removed (no soft delete)
- User can toggle visibility of archived items

## Data Validation Rules

### Required Fields
- All titles/names are required
- User ID is required for all user-generated content
- Project ID is required for project tasks
- Habit ID is required for habit completions

### Format Constraints
- Exercise dates must be in YYYY-MM-DD format
- Progress values must be 0-100
- Vote counts can be negative (downvotes)
- Habit target days default to 20 if not specified

### Relationship Constraints
- Cascade delete for dependent records (tasks when project deleted)
- Foreign key constraints for all relationships
- Many-to-many relationships properly maintained through junction tables

## Performance Considerations

### Data Loading Strategies
- Dashboard loads overview data for all sections
- Individual modules load detailed data on demand
- Pagination for large lists (if needed)
- Caching strategies for frequently accessed data

### iOS-Specific Optimizations
- Use lazy loading for large lists
- Implement proper memory management for images
- Cache network responses appropriately
- Use Core Data NSFetchedResultsController for automatic UI updates

## Security and Privacy

### Authentication
- User authentication required for all operations
- Session management for persistent login
- Secure password storage (hashed)

### Data Privacy
- All data is user-specific and isolated
- No cross-user data access
- Local data encryption on device (iOS)
- Secure API communication (HTTPS)

## Deployment Considerations

### Database Setup
- PostgreSQL database with proper indexing
- Foreign key constraints enabled
- Backup and recovery procedures
- Migration scripts for schema updates

### iOS App Store Requirements
- Privacy policy for data collection
- Proper app metadata and descriptions
- Icon and screenshot requirements
- App Store review guidelines compliance

This documentation provides a comprehensive foundation for implementing the Personal Life Management System as a native iOS application, maintaining all functionality while adapting to iOS-specific patterns and best practices.