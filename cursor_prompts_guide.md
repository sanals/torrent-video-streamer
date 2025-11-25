# Step-by-Step Cursor Prompts for Torrent Video Streaming App

## Phase 1: Project Setup & Configuration

### Prompt 1: Initial Project Setup
```
Create a new React TypeScript project using Vite with the following requirements:

1. Initialize the project with: `npm create vite@latest torrent-video-streamer -- --template react-ts`
2. Install all dependencies from the package.json in the cursor rules
3. Set up the exact folder structure specified in the rules
4. Create all configuration files: tsconfig.json, vite.config.ts, eslint, etc.
5. Create empty index.ts files in each component folder for re-exports
6. Set up the basic App.tsx with MUI ThemeProvider and dark theme
7. Create a basic main.tsx entry point

Focus on getting the project structure and build system working first.
```

### Prompt 2: TypeScript Types & Interfaces
```
Create all TypeScript interfaces and types for the torrent streaming app:

1. In src/types/torrent.ts: Define TorrentFile, TorrentData, VideoFile, and SearchResult interfaces
2. In src/types/video.ts: Define VideoPlayer props and state interfaces
3. In src/types/api.ts: Define API response types for search functionality
4. In src/types/index.ts: Create a barrel export for all types
5. Use the exact interfaces from the torrent service documentation
6. Add JSDoc comments for complex type definitions

Make sure all types are strictly typed with no `any` usage.
```

### Prompt 3: Constants & Utilities
```
Create utility functions and constants:

1. In src/utils/constants.ts: Define app constants like video file extensions, torrent categories, etc.
2. In src/utils/fileUtils.ts: Create functions for file type detection, size formatting, etc.
3. In src/utils/magnetParser.ts: Create magnet link parsing and validation functions
4. In src/utils/helpers.ts: Create general helper functions for the app
5. In src/utils/index.ts: Create barrel exports

Focus on pure functions with comprehensive error handling and TypeScript types.
```

## Phase 2: Core Services

### Prompt 4: WebTorrent Service
```
Create the core torrent service in src/services/torrentService.ts:

1. Implement the TorrentService class exactly as specified in the documentation
2. Include all methods: addTorrent, getVideoFiles, streamFile, removeTorrent, etc.
3. Add proper WebTorrent event handling with cleanup
4. Implement error handling for network issues and invalid torrents
5. Add progress tracking and stats collection
6. Include memory management for torrent instances

Make sure the service is a singleton and properly typed with TypeScript.
```

### Prompt 5: Search Service
```
Create the search service in src/services/searchService.ts:

1. Create a service for torrent search functionality
2. Include mock search results for development (as shown in TorrentSearch component)
3. Add functions for validating search queries
4. Include error handling for search failures
5. Add support for different search categories
6. Implement rate limiting for search requests

Structure it to easily integrate with real torrent search APIs later.
```

### Prompt 6: API Service
```
Create the HTTP client service in src/services/apiService.ts:

1. Set up Axios with proper configuration
2. Add interceptors for request/response logging
3. Include error handling for network failures
4. Add retry logic for failed requests
5. Create typed API methods
6. Include request cancellation support

Make it ready for integration with external torrent search APIs.
```

## Phase 3: Context & State Management

### Prompt 7: Torrent Context
```
Create the global state management in src/contexts/TorrentContext.tsx:

1. Create TorrentContext with useContext hook
2. Manage active torrents state
3. Include download progress tracking
4. Add torrent addition/removal functions
5. Include error state management
6. Add loading states for async operations
7. Create custom hook useTorrentContext for easy access

Use useReducer for complex state management and ensure immutable updates.
```

### Prompt 8: Custom Hooks
```
Create custom hooks for the application:

1. In src/hooks/useTorrent.ts: Create hook for torrent management logic
2. In src/hooks/useVideoPlayer.ts: Create hook for video player controls
3. In src/hooks/useSearch.ts: Create hook for search functionality
4. In src/hooks/index.ts: Create barrel exports

Each hook should encapsulate complex logic and provide clean interfaces to components.
```

## Phase 4: UI Components

### Prompt 9: Basic UI Components
```
Create reusable UI components in src/components/UI/:

1. LoadingSpinner.tsx: Material-UI based loading spinner
2. ErrorMessage.tsx: Error display component with retry functionality
3. ProgressBar.tsx: Custom progress bar for download progress
4. Create proper TypeScript interfaces for all props
5. Use MUI components as building blocks
6. Add proper styling with sx prop
7. Include responsive design considerations

Focus on reusability and consistent styling across the app.
```

### Prompt 10: Layout Components
```
Create layout components in src/components/Layout/:

1. Header.tsx: App header with navigation and branding
2. Sidebar.tsx: Navigation sidebar (if needed)
3. Layout.tsx: Main layout wrapper component
4. Use MUI's AppBar, Drawer, and layout components
5. Add responsive behavior for mobile/desktop
6. Include dark theme styling
7. Add proper navigation structure

Make the layout flexible and responsive for different screen sizes.
```

### Prompt 11: Video Player Component
```
Create the video player in src/components/VideoPlayer/:

1. VideoPlayer.tsx: Main video player component using Video.js
2. VideoPlayer.css: Custom styles for video player
3. Implement the exact component from the documentation
4. Add proper Video.js initialization and cleanup
5. Include error handling for video loading
6. Add custom controls for torrent-specific features
7. Make it responsive and accessible

Focus on smooth video playback and proper resource management.
```

## Phase 5: Core Features

### Prompt 12: Torrent Search Component
```
Create the torrent search in src/components/TorrentSearch/:

1. TorrentSearch.tsx: Main search component with input and results
2. SearchResults.tsx: Component for displaying search results
3. Implement the search interface from the documentation
4. Add support for both search queries and direct magnet links
5. Include result filtering and sorting
6. Add proper loading and error states
7. Use MUI components for consistent styling

Make the search intuitive and responsive.
```

### Prompt 13: Torrent Manager Component
```
Create the torrent manager in src/components/TorrentManager/:

1. TorrentManager.tsx: Main component for managing active torrents
2. TorrentItem.tsx: Individual torrent display component
3. Show download progress, speed, and peer information
4. Add controls for pause/resume/remove
5. Include file list with video file selection
6. Add sorting and filtering options
7. Use MUI List and Card components

Focus on real-time updates and user control.
```

### Prompt 14: Pages Setup
```
Create the main pages in src/pages/:

1. Home.tsx: Main dashboard combining search and active torrents
2. Player.tsx: Dedicated video player page
3. Search.tsx: Full-screen search page
4. NotFoundPage.tsx: 404 error page
5. Set up React Router routing in App.tsx
6. Add proper page titles and meta tags
7. Include loading states and error boundaries

Make navigation smooth and intuitive.
```

## Phase 6: Integration & Polish

### Prompt 15: App Integration
```
Update App.tsx to integrate all components:

1. Set up React Router with all pages
2. Integrate TorrentContext provider
3. Add MUI ThemeProvider with dark theme
4. Include global error boundary
5. Add proper loading states
6. Connect all components with the torrent service
7. Add keyboard shortcuts for common actions

Make sure all components work together seamlessly.
```

### Prompt 16: Error Handling & Validation
```
Add comprehensive error handling throughout the app:

1. Add error boundaries for component crashes
2. Implement proper validation for magnet links
3. Add user-friendly error messages
4. Include retry mechanisms for failed operations
5. Add proper logging for debugging
6. Include graceful degradation for unsupported features
7. Add legal compliance warnings

Focus on user experience and reliability.
```

### Prompt 17: Performance Optimization
```
Optimize the app for performance:

1. Add React.memo to expensive components
2. Implement useMemo and useCallback where needed
3. Add lazy loading for large components
4. Optimize WebTorrent memory usage
5. Add efficient re-rendering strategies
6. Include proper cleanup in useEffect hooks
7. Add bundle size optimization

Focus on smooth performance with large video files.
```

## Phase 7: Testing & Finalization

### Prompt 18: Basic Testing Setup
```
Set up testing for the application:

1. Configure Jest and React Testing Library
2. Create basic tests for utility functions
3. Add tests for custom hooks
4. Create component tests for UI components
5. Add integration tests for torrent service
6. Include tests for error scenarios
7. Set up test coverage reporting

Focus on critical functionality and edge cases.
```

### Prompt 19: Documentation & README
```
Create comprehensive documentation:

1. Update README.md with project overview and setup instructions
2. Add usage examples and screenshots
3. Include legal compliance information
4. Add troubleshooting guide
5. Document the API for extending the app
6. Add contributing guidelines
7. Include license information

Make the project easy to understand and use.
```

### Prompt 20: Final Polish & Deployment
```
Finalize the application for deployment:

1. Add production build optimization
2. Include proper environment variable handling
3. Add service worker for offline functionality (optional)
4. Optimize bundle size and loading performance
5. Add proper meta tags and SEO
6. Include analytics setup (if needed)
7. Add deployment configuration for Vercel/Netlify

Prepare the app for production deployment.
```

## Usage Instructions

### How to Use These Prompts:

1. **Sequential Order**: Use prompts in order as each builds on the previous work
2. **One at a Time**: Complete each prompt fully before moving to the next
3. **Review & Test**: After each prompt, review the generated code and test functionality
4. **Customize**: Modify prompts based on your specific needs or preferences
5. **Iterate**: If a prompt doesn't work perfectly, provide feedback and ask for refinements

### Tips for Success:

- **Be Specific**: If Cursor's output doesn't match expectations, provide specific feedback
- **Test Frequently**: Run the app after major changes to catch issues early
- **Read the Rules**: Reference the cursor rules document when needed
- **Ask Questions**: Don't hesitate to ask Cursor for clarification or alternatives
- **Iterate**: Use follow-up prompts to refine and improve the generated code

### Example Follow-up Prompts:

```
"The video player isn't loading properly. Can you debug the Video.js integration?"

"Add better error handling to the torrent service for network failures."

"Make the search results more visually appealing with better MUI styling."

"Add keyboard shortcuts for video player controls."
```

This systematic approach will help you build a complete, professional torrent video streaming application with Cursor's assistance!