[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/birobirobiro/awesome-shadcn-ui/)
[![CI](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/ci.yml/badge.svg)](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/ci.yml)
[![CD](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/cd.yml/badge.svg)](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/cd.yml)

# `shadcn/ui` Event Timeline Roadmap

A pair of customizable, animated event timeline components built with [shadcn/ui](https://ui.shadcn.com/), React, and Framer Motion. This package includes two variants:

- **HorizontalEventTimelineCarousel**: A swipeable, card-based carousel for browsing events horizontally.
- **VerticalEventTimeline**: A stacked, expandable timeline with a vertical layout and alternating card positions.

## Features

- **Interactive Navigation**: Swipe gestures (horizontal), arrow buttons, and pagination dots (horizontal); expandable cards (both).
- **Responsive Design**: Adapts to various screen sizes; horizontal carousel supports custom height, vertical timeline alternates card sides on desktop.
- **Dynamic Period Formatting**: Supports quarterly (e.g., Q1 2025) or half-year (e.g., H1 2025) periods.
- **Visual Feedback**: Completed vs. planned events marked with checkmark icons.
- **Smooth Animations**: Powered by Framer Motion for transitions and expansions.
- **Customizable**: Adjust styling via Tailwind CSS and extend functionality through props and data.

## Usage

1. **Install Dependencies**  
   Ensure your project includes the required dependencies:

   ```bash
   npm install framer-motion lucide-react
   ```

   You’ll also need `shadcn/ui` components (`Card` and `Badge`). Follow the [shadcn/ui installation guide](https://ui.shadcn.com/docs/installation) to set them up.

2. **Set Up Event Data**  
   Create a `data/events.ts` file (or adjust the import path) with your event data:

   ```typescript
   export const events = [
     {
       year: 2025,
       periodType: "Q",
       periodNumber: 1,
       isChecked: true,
       events: [
         { title: "Launch MVP", isChecked: true },
         { title: "User Testing", isChecked: false },
       ],
     },
     {
       year: 2025,
       periodType: "H",
       periodNumber: 2,
       isChecked: false,
       events: [{ title: "Feature Expansion", isChecked: false }],
     },
     // Add more events as needed
   ];
   ```

   Optionally, define a TypeScript type in `types/events.ts` for better type safety:

   ```typescript
   export type Events = {
     year: number;
     periodType: "Q" | "H" | "Y";
     periodNumber?: number;
     isChecked: boolean;
     events: { title: string; isChecked: boolean }[];
   }[];
   ```

## Props

### HorizontalEventTimelineCarousel

| Prop     | Type     | Default   | Description                                |
| -------- | -------- | --------- | ------------------------------------------ |
| `height` | `string` | `"30rem"` | Sets the height of the carousel container. |

### VerticalEventTimeline

- No props currently defined (controlled via the `events` data).

## Usage

### HorizontalEventTimelineCarousel

```tsx
<HorizontalEventTimelineCarousel height="40rem" />
```

- Adjust the `height` prop to fit your layout.
- Navigate via swipe, arrows, or dots; click cards to expand.

### VerticalEventTimeline

```tsx
<VerticalEventTimeline />
```

- Cards expand on click and alternate sides on desktop for visual appeal.

## Customization

- **Styling**: Modify Tailwind CSS classes (e.g., `bg-primary`, `text-muted-foreground`) or override styles globally.
- **Animations**: Tweak Framer Motion settings (e.g., `cardVariants` in horizontal, transition durations in both) for custom effects.
- **Data**: Extend the `events` array with additional fields (e.g., descriptions, dates) and update rendering logic as needed.

## Dependencies

- React
- Framer Motion (`npm install framer-motion`)
- Lucide React (`npm install lucide-react`)
- shadcn/ui (`Card`, `Badge`)

## Notes

- **HorizontalEventTimelineCarousel**:
  - Dynamically calculates expanded section height based on container size minus header.
  - Swipe threshold is 50px for navigation.
- **VerticalEventTimeline**:
  - Features a centered timeline with a connecting line and dots.
  - Expansion includes a 300ms delay on collapse for smoother transitions.
- Ensure `events` data is correctly formatted to prevent rendering issues.

## Contributing

Submit issues or pull requests to improve these components! Suggestions for new features or bug fixes are welcome.
