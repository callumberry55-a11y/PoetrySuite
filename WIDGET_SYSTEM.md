# Web-Based Widget System

## 1. Goal

To create a system for building self-contained, reusable UI widgets that can be displayed within the Poetry Suite application (e.g., on a user dashboard) or potentially embedded on external websites. This system will be built using web technologies and will not require a native application build.

## 2. Architecture

-   **Technology**: React for component structure, TypeScript for type safety, and CSS Modules for encapsulated styling to prevent style conflicts.
-   **Directory Structure**: All widget-related code will live in the `src/widgets` directory.
-   **Widget Structure**: Each widget will be a self-contained component in its own sub-directory.

### Example Directory Structure:

```
src/
|-- widgets/
|   |-- WidgetContainer.tsx       # (Optional) A common wrapper for consistent styling/functionality.
|   |-- PoemOfTheDay/
|   |   |-- PoemOfTheDay.tsx
|   |   |-- PoemOfTheDay.module.css
|   |-- WritingStreak/
|   |   |-- WritingStreak.tsx
|   |   |-- WritingStreak.module.css
|   |-- manifest.ts               # A file to register and export all available widgets.
```

## 3. Implementation Plan

1.  **Create Directory**: Create the `src/widgets` directory.
2.  **Create Manifest**: Create `src/widgets/manifest.ts` to define the available widgets.
3.  **Build First Widget**: Implement the `PoemOfTheDay` widget as the first example. This will involve fetching a poem and displaying it.
4.  **Create Widget Renderer**: Create a component (`src/components/WidgetDisplay.tsx`) that can dynamically render widgets from the manifest.
5.  **Add to UI**: Integrate the `WidgetDisplay` into a part of the application, such as a new "Dashboard" page or the user's profile.

## 4. Creating a New Widget

To create a new widget (e.g., "RandomPrompt"):

1.  Create a new folder: `src/widgets/RandomPrompt`.
2.  Create the component file: `src/widgets/RandomPrompt/RandomPrompt.tsx`.
3.  Create the style file: `src/widgets/RandomPrompt/RandomPrompt.module.css`.
4.  Register the new widget in `src/widgets/manifest.ts`.
