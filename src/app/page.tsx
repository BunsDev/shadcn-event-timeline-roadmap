import BlockPreview from "@/components/block-preview";
import fs from "fs";
import path from "path";

function loadCode(filePath: string): string {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.readFileSync(fullPath, "utf-8");
}

export default function Page() {
  return (
    <main className="">
      <section>
        <div className="mx-4 max-w-7xl border-x px-4 py-16 [--color-border:color-mix(in_oklab,var(--color-zinc-200)_75%,transparent)] md:mx-auto dark:[--color-border:color-mix(in_oklab,var(--color-zinc-800)_60%,transparent)]">
          <div className="max-w-2xl">
            <h1 className="text-balance text-3xl font-bold sm:text-4xl">
              shadcn/ui Roadmap Timeline Blocks
            </h1>
            <p className="mb-6 mt-3 text-base">
              Speed up your workflow with responsive, pre-built UI blocks
              designed for websites.
            </p>
          </div>
        </div>
      </section>
      <BlockPreview
        category="horizontal-event-timeline-carousel"
        title="horizontal-event"
        code={loadCode("src/app/horizontal/page.tsx")}
        preview="/horizontal"
      />
      <BlockPreview
        category="vertical-dynamic-path-arrow-event-timeline-carousel"
        title="vertical-event"
        code={loadCode("src/app/dynamic-path-arrow/page.tsx")}
        preview="/dynamic-path-arrow"
      />
      <BlockPreview
        category="vertical-event-timeline"
        title="vertical-event"
        code={loadCode("src/app/vertical/page.tsx")}
        preview="/vertical"
      />
      <BlockPreview
        category="modern-vertical-event-timeline"
        title="modern-vertical-event"
        code={loadCode("src/app/modern/page.tsx")}
        preview="/modern"
      />
      <BlockPreview
        category="gantt-chart-roadmap-timeline"
        title="gantt-chart-roadmap"
        code={loadCode("src/app/gantt/page.tsx")}
        preview="/gantt"
      />
      <BlockPreview
        category="kanban-roadmap-timeline"
        title="kanban-roadmap"
        code={loadCode("src/app/kanban/page.tsx")}
        preview="/kanban"
      />
    </main>
  );
}
