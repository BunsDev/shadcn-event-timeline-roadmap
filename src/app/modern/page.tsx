"use client";

import {useState, useMemo} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Plus, Minus, Target, Flag, Download} from "lucide-react";
import {Card} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";
import {Events} from "@/types/events";
import {events} from "@/data/events";

export default function ModernVerticalEventTimeline() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const toggleExpand = (index: number) => setExpandedIndex(expandedIndex === index ? null : index);
  const formatPeriod = (item: Events[0]) => (item.periodType === "Q" ? `Q${item.periodNumber}` : item.periodType === "H" ? `H${item.periodNumber}` : `${item.year}`);
  const getEventStatus = (item: Events[0]) => {
    const currentYear = 2025, currentQuarter = 2;
    const eventQuarter = item.periodType === "Q" ? item.periodNumber : item.periodNumber * 2;
    if (item.year < currentYear || (item.year === currentYear && eventQuarter < currentQuarter)) return "past";
    if (item.year === currentYear && eventQuarter === currentQuarter) return "current";
    return "future";
  };

  // Type Colors mapped to your chart variables
  const typeColors: { [key: string]: string } = {
    Development: "var(--chart-1)",  // OKLCH colors from your theme
    Marketing: "var(--chart-2)",
    Partnerships: "var(--chart-3)",
    Security: "var(--chart-4)",
    Deployment: "var(--chart-5)",
    Community: "var(--chart-1)",    // Reuse chart-1 for simplicity
    "E-commerce": "var(--chart-2)", // Reuse chart-2
  };

  // Analytics Data Preparation
  const filteredEvents = events.filter((item) => filterStatus === "all" || getEventStatus(item) === filterStatus);
  const progressData = filteredEvents.map((item) => ({
    name: `${item.year} ${formatPeriod(item)}`,
    completed: item.events.filter((e) => e.isChecked).length,
    total: item.events.length,
  }));
  const statusData = [
    {name: "Past", value: events.filter((item) => getEventStatus(item) === "past").length},
    {name: "Current", value: events.filter((item) => getEventStatus(item) === "current").length},
    {name: "Future", value: events.filter((item) => getEventStatus(item) === "future").length},
  ].filter((d) => d.value > 0);
  const trendData = filteredEvents.map((item) => ({
    name: `${item.year} ${formatPeriod(item)}`,
    completion: ((item.events.filter((e) => e.isChecked).length / item.events.length) * 100) || 0,
  }));
  const typeData = filteredEvents.map((item) => {
    const types = Object.keys(typeColors);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {name: `${item.year} ${formatPeriod(item)}`, Total: item.events.length};
    types.forEach((type) => {
      result[type] = item.events.filter((e) => e.type === type && e.isChecked).length;
    });
    return result;
  });
  const completionEstimate = filteredEvents.map((item, idx) => {
    const pastEvents = filteredEvents.slice(0, idx + 1).filter((e) => getEventStatus(e) === "past");
    const completedEvents = pastEvents.reduce((sum, e) => sum + e.events.filter((ev) => ev.isChecked).length, 0);
    const totalPastEvents = pastEvents.reduce((sum, e) => sum + e.events.length, 0);
    const avgCompletionRate = totalPastEvents > 0 ? completedEvents / totalPastEvents : 0;
    const remainingEvents = item.events.filter((e) => !e.isChecked).length;
    const estimatedPeriods = avgCompletionRate > 0 ? remainingEvents / avgCompletionRate : 0;
    return {
      name: `${item.year} ${formatPeriod(item)}`,
      estimated: estimatedPeriods > 0 ? Number(estimatedPeriods.toFixed(1)) : 0
    };
  });
  const densityData = filteredEvents.map((item) => ({
    name: `${item.year} ${formatPeriod(item)}`,
    events: item.events.length,
  }));

  const STATUS_COLORS = [typeColors.Development, typeColors.Marketing, typeColors.Partnerships]; // For PieChart

  const predictCompletion = () => {
    const pastEvents = events.filter((item) => getEventStatus(item) === "past");
    const totalEvents = events.reduce((sum, item) => sum + item.events.length, 0);
    const completedEvents = pastEvents.reduce((sum, item) => sum + item.events.filter((e) => e.isChecked).length, 0);
    const avgCompletionRate = pastEvents.length ? completedEvents / pastEvents.length : 0;
    const remainingEvents = totalEvents - completedEvents;
    return remainingEvents / avgCompletionRate || "N/A";
  };

  const exportData = () => {
    const data = {progressData, statusData, trendData, typeData, completionEstimate, densityData};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadmap-analytics.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Memoized event items with type integration
  const eventItems = useMemo(
    () =>
      filteredEvents.map((item, index) => {
        const completedEvents = item.events.filter((e) => e.isChecked).length;
        const totalEvents = item.events.length;
        const progress = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
        const status = getEventStatus(item);

        const typeCounts = item.events.reduce((acc: { [key: string]: number }, event) => {
          acc[event.type || "Unknown"] = (acc[event.type || "Unknown"] || 0) + 1;
          return acc;
        }, {});
        const typeSummary = Object.entries(typeCounts)
          .map(([type, count]) => `${count} ${type}`)
          .join(", ");

        return (
          <motion.div key={index} className="relative flex items-start gap-6 mb-12" initial={{opacity: 0, x: -20}}
                      animate={{opacity: 1, x: 0}} transition={{duration: 0.5, delay: index * 0.1}}>
            <div className="flex flex-col items-center relative">
              <div
                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded-full ${
                  status === "past" ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : status === "current" ? "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]" : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                }`}
              >
                {item.year}
              </div>
              <div
                className={`absolute top-7 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded-full ${
                  status === "past" ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : status === "current" ? "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]" : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                }`}
              >
                {formatPeriod(item)}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 border-[color:var(--border)] shadow-md ${
                  status === "past" ? "bg-[color:var(--chart-1)]" : status === "current" ? "bg-[color:var(--chart-2)]" : "bg-[color:var(--muted)]"
                }`}
              >
                {status === "current" && <Flag
                  className="w-3 h-3 text-[color:var(--primary-foreground)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>}
              </div>
              <div
                className={`w-0.5 ${index === filteredEvents.length - 1 ? "h-0" : status === "future" ? "h-20 border-l-2 border-dashed border-[color:var(--border)]" : "h-20 bg-[color:var(--chart-1)]/30"}`}
              />
            </div>
            <Card
              className={`flex-1 bg-[color:var(--card)] text-[color:var(--card-foreground)] border-none shadow-md rounded-[var(--radius-md)] overflow-hidden ${status === "current" ? "ring-2 ring-[color:var(--ring)]" : ""}`}>
              <button
                className={`w-full p-4 flex items-center justify-between text-left transition-all duration-200 ${
                  status === "past" ? "bg-[color:var(--accent)] hover:bg-[color:var(--accent-foreground)]/10" : status === "current" ? "bg-[color:var(--secondary)] hover:bg-[color:var(--secondary-foreground)]/10" : "bg-[color:var(--muted)] hover:bg-[color:var(--muted-foreground)]/10"
                }`}
                onClick={() => toggleExpand(index)}
                aria-expanded={expandedIndex === index}
                aria-controls={`event-details-${index}`}
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold">{item.year} Roadmap</h3>
                  <p className="text-xs text-[color:var(--muted-foreground)]">{typeSummary}</p>
                </div>
                <motion.div animate={{rotate: expandedIndex === index ? 0 : 45}} transition={{duration: 0.3}}>
                  {expandedIndex === index ? (
                    <Minus
                      className={`w-5 h-5 ${status === "past" ? "text-[color:var(--chart-1)]" : status === "current" ? "text-[color:var(--chart-2)]" : "text-[color:var(--muted-foreground)]"}`}
                      aria-label="Collapse"
                    />
                  ) : (
                    <Plus
                      className={`w-5 h-5 ${status === "past" ? "text-[color:var(--chart-1)]" : status === "current" ? "text-[color:var(--chart-2)]" : "text-[color:var(--muted-foreground)]"}`}
                      aria-label="Expand"
                    />
                  )}
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div id={`event-details-${index}`} initial={{height: 0, opacity: 0}}
                              animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}}
                              transition={{duration: 0.3}} className="overflow-hidden">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-[color:var(--primary)]"/>
                            Progress
                          </span>
                          <span>{progress.toFixed(0)}% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-[color:var(--muted)] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${status === "past" ? "bg-[color:var(--chart-1)]" : status === "current" ? "bg-[color:var(--chart-2)]" : "bg-[color:var(--muted-foreground)]"}`}
                            initial={{width: 0}}
                            animate={{width: `${progress}%`}}
                            transition={{duration: 0.5}}
                          />
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {item.events.map((event, i) => (
                          <motion.li key={i} className="flex items-start gap-2 text-sm" initial={{opacity: 0, y: 10}}
                                     animate={{opacity: 1, y: 0}} transition={{duration: 0.3, delay: i * 0.05}}>
                            <span
                              className={`w-2 h-2 mt-1.5 rounded-full ${event.isChecked ? "bg-[color:var(--chart-1)]" : "bg-[color:var(--muted)]"}`}/>
                            <div className="flex items-center gap-2">
                              <span>{event.title}</span>
                              {event.type && (
                                <span
                                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${typeColors[event.type]}20`,
                                    color: typeColors[event.type]
                                  }}
                                >
                                  {event.type}
                                </span>
                              )}
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      }),
    [filteredEvents, expandedIndex]
  );


  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.h1 className="text-3xl font-bold text-center mb-2" initial={{opacity: 0, y: -20}}
                 animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
        Project Roadmap
      </motion.h1>
      <motion.p className="text-center text-[color:var(--muted-foreground)] mb-12" initial={{opacity: 0}}
                animate={{opacity: 1}} transition={{duration: 0.5, delay: 0.2}}>
        Mapping our past achievements and future goals
      </motion.p>

      {/* Analytics Dashboard */}
      <div
        className="mb-16 bg-[color:var(--card)] text-[color:var(--card-foreground)] p-6 rounded-[var(--radius-md)] shadow-md border border-[color:var(--border)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Roadmap Analytics</h2>
          <div className="flex gap-4">
            <select
              className="border border-[color:var(--border)] rounded-[var(--radius-sm)] p-2 text-sm bg-[color:var(--card)] text-[color:var(--card-foreground)]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="past">Past</option>
              <option value="current">Current</option>
              <option value="future">Future</option>
            </select>
            <button onClick={exportData}
                    className="flex items-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-4 py-2 rounded-[var(--radius-sm)]">
              <Download className="w-4 h-4"/> Export
            </button>
          </div>
        </div>
        <div className="flex border-b mb-4 border-[color:var(--border)]">
          {["overview", "types", "estimates", "density"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]" : "text-[color:var(--muted-foreground)]"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "overview" && (
            <>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Progress by Period</h3>
                <BarChart width={300} height={200} data={progressData}>
                  <XAxis id="x-axis-1" dataKey="name" tick={{fontSize: 12, fill: "var(--muted-foreground)"}}
                         stroke="var(--muted-foreground)"/>
                  <YAxis id="x-axis" stroke="var(--muted-foreground)"/>
                  <Tooltip contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)"
                  }}/>
                  <Legend/>
                  <Bar dataKey="completed" fill="var(--chart-1)" name="Completed"/>
                  <Bar dataKey="total" fill="var(--muted)" name="Total" opacity={0.4}/>
                </BarChart>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Status Distribution</h3>
                <PieChart width={300} height={200}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{stroke: "var(--muted-foreground)"}}
                  >
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`}
                                                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)"
                  }}/>
                </PieChart>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Completion Trend</h3>
                <LineChart width={300} height={200} data={trendData}>
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: "var(--muted-foreground)"}}
                         stroke="var(--muted-foreground)"/>
                  <YAxis stroke="var(--muted-foreground)"/>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <Tooltip contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)"
                  }}/>
                  <Legend/>
                  <Line type="monotone" dataKey="completion" stroke="var(--chart-5)" name="Completion (%)"/>
                </LineChart>
              </div>
            </>
          )}
          {activeTab === "types" && (
            <div>
              <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Completion by Event
                Type</h3>
              <BarChart width={300} height={200} data={typeData}>
                <XAxis dataKey="name" tick={{fontSize: 12, fill: "var(--muted-foreground)"}}
                       stroke="var(--muted-foreground)"/>
                <YAxis stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  border: "1px solid var(--border)"
                }}/>
                <Legend/>
                <Bar dataKey="Development" stackId="a" fill="var(--chart-1)" name="Development"/>
                <Bar dataKey="Marketing" stackId="a" fill="var(--chart-2)" name="Marketing"/>
                <Bar dataKey="Partnerships" stackId="a" fill="var(--chart-3)" name="Partnerships"/>
                <Bar dataKey="Security" stackId="a" fill="var(--chart-4)" name="Security"/>
                <Bar dataKey="Deployment" stackId="a" fill="var(--chart-5)" name="Deployment"/>
                <Bar dataKey="Community" stackId="a" fill="var(--chart-1)" name="Community"/>
                <Bar dataKey="E-commerce" stackId="a" fill="var(--chart-2)" name="E-commerce"/>
                <Bar dataKey="Total" fill="var(--muted)" name="Total" opacity={0.4}/>
              </BarChart>
            </div>
          )}
          {activeTab === "estimates" && (
            <div>
              <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Time to Completion
                Estimate</h3>
              <ScatterChart width={300} height={200} data={completionEstimate}>
                <XAxis dataKey="name" tick={{fontSize: 12, fill: "var(--muted-foreground)"}}
                       stroke="var(--muted-foreground)" name="Period"/>
                <YAxis dataKey="estimated" name="Periods" stroke="var(--muted-foreground)"/>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <Tooltip cursor={{strokeDasharray: "3 3"}} contentStyle={{
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  border: "1px solid var(--border)"
                }}/>
                <Legend/>
                <Scatter name="Estimated Periods" data={completionEstimate} fill="var(--chart-5)"/>
              </ScatterChart>
              <p className="text-xs text-[color:var(--muted-foreground)] mt-2">Predicted remaining
                periods: {Number(predictCompletion()).toFixed(1) || "N/A"}</p>
            </div>
          )}
          {activeTab === "density" && (
            <div>
              <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-2">Event Density Heatmap</h3>
              <AreaChart width={300} height={200} data={densityData}>
                <XAxis dataKey="name" tick={{fontSize: 12, fill: "var(--muted-foreground)"}}
                       stroke="var(--muted-foreground)"/>
                <YAxis stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  border: "1px solid var(--border)"
                }}/>
                <Area type="monotone" dataKey="events" fill="var(--chart-1)" fillOpacity={0.3} stroke="var(--chart-1)"/>
              </AreaChart>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {eventItems.length > 0 ? eventItems :
          <p className="text-center text-[color:var(--muted-foreground)]">No roadmap data available.</p>}
      </div>
    </div>
  );
}