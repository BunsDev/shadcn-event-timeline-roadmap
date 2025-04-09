"use client";

import {useState, useMemo, useCallback} from "react";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {Download, Search, Save} from "lucide-react";
import {events} from "@/data/events";
import {useMediaQuery} from "@/hooks/use-media-query";

// Define enhanced event types
type EnhancedEvent = {
  id: string;
  title: string;
  isChecked: boolean;
  type?: string;
  description: string;
  assignee: string;
  dependencies: string[];
  period: string;
};

type EnhancedEvents = {
  year: number;
  periodType: "Q" | "H";
  periodNumber: number;
  isChecked: boolean;
  events: EnhancedEvent[];
};

export default function KanbanRoadmap() {
  // State
  const [selectedEvent, setSelectedEvent] = useState<EnhancedEvent | null>(null);
  const [editedEvent, setEditedEvent] = useState<EnhancedEvent | null>(null);
  const [columns, setColumns] = useState<{
    "To Do": EnhancedEvent[];
    "In Progress": EnhancedEvent[];
    Completed: EnhancedEvent[];
  }>({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"title" | "period">("title");
  const [showCompleted, setShowCompleted] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Color mappings
  const typeColors: { [key: string]: string } = {
    Development: "var(--chart-1)",
    Marketing: "var(--chart-2)",
    Partnerships: "var(--chart-3)",
    Security: "var(--chart-4)",
    Deployment: "var(--chart-5)",
    Community: "var(--chart-1)",
    "E-commerce": "var(--chart-2)",
  };

  const statusColors = {
    "To Do": "var(--chart-2)",
    "In Progress": "var(--chart-3)",
    Completed: "var(--chart-1)",
  };

  // Memoized enhanced events with editable state
  const [eventData, setEventData] = useState<EnhancedEvents[]>(() =>
    events.map((period) => ({
      ...period,
      events: period.events.map((event, idx) => ({
        ...event,
        id: `${period.year}-${period.periodType}${period.periodNumber}-${event.title}-${idx}`,
        description: `Details for ${event.title}`,
        assignee: "Team A",
        dependencies: event.title.includes("Phase 2") ? ["Phase 1"] : [],
        period: `${period.year} ${period.periodType}${period.periodNumber}`,
      })),
    }))
  );

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    const allEvents = eventData.flatMap((p) => p.events);
    return allEvents
      .filter((e) => (filterType === "all" ? true : e.type === filterType))
      .filter((e) =>
        searchQuery ? e.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .filter((e) => (showCompleted ? true : !e.isChecked))
      .sort((a, b) =>
        sortBy === "title" ? a.title.localeCompare(b.title) : a.period.localeCompare(b.period)
      );
  }, [eventData, filterType, searchQuery, sortBy, showCompleted]);

  // Initialize columns
  useMemo(() => {
    setColumns({
      "To Do": filteredEvents.filter((e) => !e.isChecked),
      "In Progress": filteredEvents.filter((e) => !e.isChecked).slice(0, 3), // Mocked subset
      Completed: filteredEvents.filter((e) => e.isChecked),
    });
  }, [filteredEvents]);

  // Analytics data
  const typeData = useMemo(() => {
    const types = Object.keys(typeColors);
    return types.map((type, idx) => ({
      name: type,
      completed: filteredEvents.filter((e) => e.type === type && e.isChecked).length,
      total: filteredEvents.filter((e) => e.type === type).length,
      fill: typeColors[type] || `var(--chart-${(idx % 5) + 1})`,
    }));
  }, [filteredEvents]);

  const densityData = useMemo(() => {
    const periods: { [key: string]: number } = {};
    eventData.forEach((period) => {
      const key = `${period.year} ${period.periodType}${period.periodNumber}`;
      periods[key] = (periods[key] || 0) + period.events.length;
    });
    return Object.entries(periods).map(([name, count]) => ({name, count}));
  }, [eventData]);

  const statusData = useMemo(() => [
    {name: "To Do", value: columns["To Do"].length, fill: statusColors["To Do"]},
    {name: "In Progress", value: columns["In Progress"].length, fill: statusColors["In Progress"]},
    {name: "Completed", value: columns.Completed.length, fill: statusColors.Completed},
  ], [columns]);

  const trendData = useMemo(() => {
    const periods: { [key: string]: { completed: number; total: number } } = {};
    eventData.forEach((period) => {
      const key = `${period.year} ${period.periodType}${period.periodNumber}`;
      periods[key] = {
        completed: (periods[key]?.completed || 0) + period.events.filter((e) => e.isChecked).length,
        total: (periods[key]?.total || 0) + period.events.length,
      };
    });
    return Object.entries(periods).map(([name, {completed, total}]) => ({
      name,
      completed,
      total,
    }));
  }, [eventData]);

  // Export function
  const exportData = useCallback(
    (format: "json" | "csv") => {
      const data = {columns, typeData, densityData, statusData, trendData};
      if (format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kanban-roadmap.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const csv = [
          "Status,Title,Type,Period,Assignee,Dependencies",
          ...Object.entries(columns).flatMap(([status, events]) =>
            events.map((e) =>
              `${status},${e.title},${e.type || "N/A"},${e.period},${e.assignee},${e.dependencies.join("|")}`
            )
          ),
        ].join("\n");
        const blob = new Blob([csv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kanban-roadmap.csv";
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [columns, typeData, densityData, statusData, trendData]
  );

  // Save edited event
  const saveEditedEvent = useCallback(() => {
    if (!editedEvent) return;
    setEventData((prev) =>
      prev.map((period) => ({
        ...period,
        events: period.events.map((e) => (e.id === editedEvent.id ? {...editedEvent} : e)),
      }))
    );
    setSelectedEvent(editedEvent);
    setEditedEvent(null);
  }, [editedEvent]);

  // Responsive chart width
  const chartWidth = isMobile ? 300 : 500;

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <motion.header
          className="space-y-3"
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Kanban Roadmap</h1>
          <p className="text-base text-muted-foreground/80">Plan, track, and analyze with precision</p>
        </motion.header>

        {/* Analytics Dashboard */}
        <motion.section
          className="bg-gradient-to-br from-card to-muted/10 border border-border rounded-xl shadow-md p-6"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.2}}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h2>
            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background hover:bg-muted/50 border-border/50 text-foreground font-medium"
                    onClick={() => exportData("json")}
                  >
                    <Download className="h-4 w-4 mr-2"/> JSON
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as JSON</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background hover:bg-muted/50 border-border/50 text-foreground font-medium"
                    onClick={() => exportData("csv")}
                  >
                    <Download className="h-4 w-4 mr-2"/> CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as CSV</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className={cn("space-y-8", !isMobile && "grid grid-cols-2 gap-8")}>
            {/* Completion by Type */}
            <motion.div
              className="bg-card border border-border/50 rounded-lg shadow-sm p-4 transition-all hover:shadow-md hover:scale-[1.02]"
              whileHover={{scale: 1.02}}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Completion by Type</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Completed vs. total events per type
                  </p>
                </div>
              </div>
              <BarChart width={chartWidth} height={250} data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)"/>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <YAxis stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend wrapperStyle={{fontSize: 12}}/>
                <Bar dataKey="completed" name="Completed" fillOpacity={0.8}/>
                <Bar dataKey="total" name="Total" fillOpacity={0.3}/>
              </BarChart>
            </motion.div>

            {/* Event Density */}
            <motion.div
              className="bg-card border border-border/50 rounded-lg shadow-sm p-4 transition-all hover:shadow-md hover:scale-[1.02]"
              whileHover={{scale: 1.02}}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Event Density</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Number of events per period
                  </p>
                </div>
              </div>
              <AreaChart width={chartWidth} height={250} data={densityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)"/>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <YAxis stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  fill="var(--chart-1)"
                  fillOpacity={0.3}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </motion.div>

            {/* Status Distribution */}
            <motion.div
              className="bg-card border border-border/50 rounded-lg shadow-sm p-4 transition-all hover:shadow-md hover:scale-[1.02]"
              whileHover={{scale: 1.02}}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Status Distribution</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Breakdown of events by status
                  </p>
                </div>
              </div>
              <PieChart width={chartWidth} height={250}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, value}) => `${name}: ${value}`}
                  labelLine={false}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill}/>
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend wrapperStyle={{fontSize: 12}}/>
              </PieChart>
            </motion.div>

            {/* Completion Trend */}
            <motion.div
              className="bg-card border border-border/50 rounded-lg shadow-sm p-4 transition-all hover:shadow-md hover:scale-[1.02]"
              whileHover={{scale: 1.02}}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Completion Trend</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Completed vs. total events over time
                  </p>
                </div>
              </div>
              <LineChart width={chartWidth} height={250} data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)"/>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <YAxis stroke="var(--muted-foreground)" tick={{fontSize: 12}}/>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend wrapperStyle={{fontSize: 12}}/>
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  name="Total"
                />
              </LineChart>
            </motion.div>
          </div>
        </motion.section>

        {/* Filters and Controls */}
        <motion.section
          className="flex flex-col md:flex-row gap-4 items-center bg-gradient-to-br from-card to-muted/10 border border-border rounded-xl p-5 shadow-md"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.4}}
        >
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground/70"/>
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-border/50 focus:ring-2 focus:ring-ring focus:border-transparent rounded-lg"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] bg-background border-border/50">
                <SelectValue placeholder="Filter by Type"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(typeColors).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "title" | "period")}>
              <SelectTrigger className="w-[160px] bg-background border-border/50">
                <SelectValue placeholder="Sort by"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="period">Period</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
                id="show-completed"
                className="data-[state=checked]:bg-[var(--chart-1)]"
              />
              <Label htmlFor="show-completed" className="text-sm text-muted-foreground/80 font-medium">
                Show Completed
              </Label>
            </div>
          </div>
        </motion.section>

        {/* Kanban Board */}
        <motion.section
          className="flex gap-6 flex-col md:flex-row"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.6}}
        >
          {Object.entries(columns).map(([status, events]) => (
            <Card
              key={status}
              className={cn(
                "flex-1 bg-card border border-border rounded-xl shadow-md overflow-hidden",
                "transition-all hover:shadow-lg",
                status === "To Do" && "border-t-4 border-t-[var(--chart-2)]",
                status === "In Progress" && "border-t-4 border-t-[var(--chart-3)]",
                status === "Completed" && "border-t-4 border-t-[var(--chart-1)]"
              )}
            >
              <CardHeader className="bg-gradient-to-r from-muted/20 to-muted/10 p-4">
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  <span>{status}</span>
                  <Badge
                    variant="outline"
                    className="text-sm font-medium bg-background border-border/50"
                  >
                    {events.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-5">
                  {events.length === 0 ? (
                    <p className="text-muted-foreground text-center text-sm font-medium">
                      No events in this status
                    </p>
                  ) : (
                    events.map((event) => (
                      <motion.div
                        key={event.id}
                        className="mb-4"
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.3}}
                      >
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Card
                              className={cn(
                                "border-l-4 max-w-[21rem] cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] focus:shadow-lg focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring",
                                event.type && `border-l-[${typeColors[event.type]}]`,
                                event.isChecked && "bg-muted/10"
                              )}
                              onClick={() => {
                                setSelectedEvent(event);
                                setEditedEvent({...event});
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`Event: ${event.title}, ${event.isChecked ? "Completed" : "In Progress"}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-base font-semibold text-foreground truncate">
                                    {event.title}
                                  </h3>
                                  <Badge
                                    variant={event.isChecked ? "default" : "secondary"}
                                    className={cn(
                                      "ml-2 text-xs font-medium",
                                      event.isChecked
                                        ? "bg-[var(--chart-1)]/90"
                                        : "bg-[var(--chart-3)]/20 text-[var(--chart-3)]"
                                    )}
                                  >
                                    {event.isChecked ? "Done" : "Active"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground/80 mb-1">
                                  Type: <span className="font-medium">{event.type || "N/A"}</span>
                                </p>
                                <p className="text-sm text-muted-foreground/80 mb-2">
                                  Period: <span className="font-medium">{event.period}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7 border border-border/50">
                                    <AvatarFallback className="bg-muted/30 text-foreground font-medium">
                                      {event.assignee[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground/80 font-medium">
                                    {event.assignee}
                                  </span>
                                </div>
                                {!event.isChecked && (
                                  <Progress
                                    value={50} // Mocked progress
                                    className="mt-3 w-full [&>div]:bg-[color:var(--accent)]"
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 bg-gradient-to-br from-card to-muted border-border/50">
                            <p className="text-base font-semibold text-foreground">{event.title}</p>
                            <p className="text-sm text-muted-foreground/80 mt-1">
                              {event.description}
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-1">
                              Dependencies: {event.dependencies.join(", ") || "None"}
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </motion.div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </motion.section>

        {/* Event Details */}
        {isMobile ? (
          <Drawer
            open={selectedEvent !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedEvent(null);
                setEditedEvent(null);
              }
            }}
          >
            <DrawerContent
              className="rounded-t-[var(--radius)] bg-gradient-to-br from-card to-muted border-t border-border/50">
              <DrawerHeader>
                <DrawerTitle className="text-xl font-semibold text-foreground">
                  {selectedEvent?.title || "Event Details"}
                </DrawerTitle>
              </DrawerHeader>
              {selectedEvent && editedEvent && (
                <div className="space-y-5 p-5">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title" className="text-sm font-medium text-foreground">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={editedEvent.title}
                        onChange={(e) =>
                          setEditedEvent({...editedEvent, title: e.target.value})
                        }
                        className="bg-background border-border/50 focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={editedEvent.isChecked}
                        onCheckedChange={(checked) =>
                          setEditedEvent({...editedEvent, isChecked: !!checked})
                        }
                        id="status"
                        className="h-5 w-5 border-border/50"
                      />
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-foreground"
                      >
                        {editedEvent.isChecked ? "Completed" : "In Progress"}
                      </Label>
                    </div>
                  </div>
                  <Separator className="bg-border/30"/>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="type" className="text-sm font-medium text-foreground">
                        Type
                      </Label>
                      <Select
                        value={editedEvent.type || "N/A"}
                        onValueChange={(value) =>
                          setEditedEvent({...editedEvent, type: value === "N/A" ? undefined : value})
                        }
                      >
                        <SelectTrigger
                          id="type"
                          className="bg-background border-border/50"
                        >
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {Object.keys(typeColors).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm">
                      <strong className="text-foreground font-medium">Period:</strong>{" "}
                      <span className="text-muted-foreground/80">{editedEvent.period}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="assignee"
                        className="text-sm font-medium text-foreground"
                      >
                        Assignee
                      </Label>
                      <Input
                        id="assignee"
                        value={editedEvent.assignee}
                        onChange={(e) =>
                          setEditedEvent({...editedEvent, assignee: e.target.value})
                        }
                        className="bg-background border-border/50 focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-foreground"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={editedEvent.description}
                      onChange={(e) =>
                        setEditedEvent({...editedEvent, description: e.target.value})
                      }
                      className="min-h-[120px] bg-background border-border/50 focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div>
                    <strong className="text-foreground text-sm font-medium">Dependencies:</strong>
                    {editedEvent.dependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedEvent.dependencies.map((dep) => (
                          <Badge
                            key={dep}
                            variant="outline"
                            className="bg-muted/20 text-muted-foreground/80 font-medium"
                          >
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/80 mt-1 font-medium">None</p>
                    )}
                  </div>
                  <Button
                    onClick={saveEditedEvent}
                    className="w-full bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/90 text-background"
                  >
                    <Save className="h-4 w-4 mr-2"/> Save Changes
                  </Button>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={selectedEvent !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedEvent(null);
                setEditedEvent(null);
              }
            }}
          >
            <DialogContent
              className="rounded-[var(--radius)] bg-gradient-to-br from-card to-muted border border-border/50 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {selectedEvent?.title || "Event Details"}
                </DialogTitle>
              </DialogHeader>
              {selectedEvent && editedEvent && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title" className="text-sm font-medium text-foreground">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={editedEvent.title}
                        onChange={(e) =>
                          setEditedEvent({...editedEvent, title: e.target.value})
                        }
                        className="bg-background border-border/50 focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={editedEvent.isChecked}
                        onCheckedChange={(checked) =>
                          setEditedEvent({...editedEvent, isChecked: !!checked})
                        }
                        id="status"
                        className="h-5 w-5 border-border/50"
                      />
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-foreground"
                      >
                        {editedEvent.isChecked ? "Completed" : "In Progress"}
                      </Label>
                    </div>
                  </div>
                  <Separator className="bg-border/30"/>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="type" className="text-sm font-medium text-foreground">
                        Type
                      </Label>
                      <Select
                        value={editedEvent.type || "N/A"}
                        onValueChange={(value) =>
                          setEditedEvent({...editedEvent, type: value === "N/A" ? undefined : value})
                        }
                      >
                        <SelectTrigger
                          id="type"
                          className="bg-background border-border/50"
                        >
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {Object.keys(typeColors).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm">
                      <strong className="text-foreground font-medium">Period:</strong>{" "}
                      <span className="text-muted-foreground/80">{editedEvent.period}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="assignee"
                        className="text-sm font-medium text-foreground"
                      >
                        Assignee
                      </Label>
                      <Input
                        id="assignee"
                        value={editedEvent.assignee}
                        onChange={(e) =>
                          setEditedEvent({...editedEvent, assignee: e.target.value})
                        }
                        className="bg-background border-border/50 focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-foreground"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={editedEvent.description}
                      onChange={(e) =>
                        setEditedEvent({...editedEvent, description: e.target.value})
                      }
                      className="min-h-[120px] bg-background border-border/50 focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div>
                    <strong className="text-foreground text-sm font-medium">Dependencies:</strong>
                    {editedEvent.dependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedEvent.dependencies.map((dep) => (
                          <Badge
                            key={dep}
                            variant="outline"
                            className="bg-muted/20 text-muted-foreground/80 font-medium"
                          >
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/80 mt-1 font-medium">None</p>
                    )}
                  </div>
                  <Button
                    onClick={saveEditedEvent}
                    className="w-full bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/90 text-background"
                  >
                    <Save className="h-4 w-4 mr-2"/> Save Changes
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}