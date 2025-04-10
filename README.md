<img src="https://roadmap.hncore.website/banner.jpg" alt="Event Timeline Roadmap aliezzahn">

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/birobirobiro/awesome-shadcn-ui/)
[![CI](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/ci.yml/badge.svg)](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/ci.yml)
[![CD](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/cd.yml/badge.svg)](https://github.com/aliezzahn/event-timeline-roadmap/actions/workflows/cd.yml)

# `shadcn/ui` Roadmap Timeline

A highly customizable, animated roadmap timeline component built with [shadcn/ui](https://ui.shadcn.com/), React, Framer
Motion, and Recharts. This component combines a vertical event timeline with an integrated analytics dashboard, offering
a comprehensive view of project milestones and progress.

## Features

- **Vertical Timeline**: Expandable cards with a centered timeline, status indicators (past, current, future), and type
  categorization.
- **Analytics Dashboard**: Interactive charts including progress bars, status distribution pie, completion trends, type
  breakdowns, completion estimates, and event density heatmaps.
- **Type Categorization**: Events tagged with types (e.g., Development, Marketing) displayed as color-coded badges and
  summarized per period.
- **Dark Theme Support**: Seamlessly integrates with Next.js `next-themes` and custom CSS variables from `global.css`
  for light/dark mode switching.
- **Dynamic Period Formatting**: Supports quarterly (e.g., Q1 2025) or half-year (e.g., H1 2025) periods.
- **Visual Feedback**: Progress bars, checkmarks, and status-specific styling (e.g., green for past, yellow for
  current).
- **Smooth Animations**: Framer Motion powers card expansions, transitions, and progress animations.
- **Exportable Data**: Download analytics data as JSON with a single click.
- **Customizable**: Tailwind CSS with custom theme variables (`--card`, `--chart-1`, etc.) and extensible via props and
  data.

## Dependencies

- React
- Framer Motion (`npm install framer-motion`)
- Lucide React (`npm install lucide-react`)
- Recharts (`npm install recharts`)
- Next Themes (`npm install next-themes`)
- shadcn/ui (`Card`)

## Notes

- **Timeline**:
    - Cards expand on click with progress bars and type badges.
    - Status (past, current, future) affects styling and timeline markers.
    - Type summaries (e.g., "2 Development, 1 Marketing") appear in card headers.
- **Analytics Dashboard**:
    - Features filterable tabs (Overview, Types, Estimates, Density).
    - Charts are responsive but fixed at 300x200px; adjust via Recharts props if needed.
    - Data export saves as `roadmap-analytics.json`.
- **Theme Integration**:
    - Relies on `next-themes` with `attribute="class"` and your `global.css` variables.
    - No explicit `useTheme` needed; CSS variables handle light/dark switching.
- **Performance**: Uses `useMemo` for event rendering to optimize re-renders.

## Contributing

Submit issues or pull requests to enhance this component! Ideas for new chart types, additional filters, or improved UX
are welcome.