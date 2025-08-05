"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

interface CustomCurvedArrowProps {
  startElement: React.RefObject<HTMLElement | null> | null;
  endElement: React.RefObject<HTMLElement | null> | null;
  obstacleElement?: React.RefObject<HTMLElement | null> | null;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  curveIntensity?: number;
  curveType?:
    | "smooth"
    | "dramatic"
    | "s-curve"
    | "wave"
    | "spiral"
    | "elegant"
    | "shortest-path"
    | "around-obstacle";
  curveDirection?: "auto" | "up" | "down" | "left" | "right";
  strokeWidth?: number;
  arrowSize?: number;
  className?: string;
  animated?: boolean;
  startPosition?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  endPosition?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
}

interface Coordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  obstacleRect: { x: number; y: number; width: number; height: number } | null;
}

export function CustomCurvedArrow({
  startElement,
  endElement,
  obstacleElement,
  startX = 0,
  startY = 0,
  endX = 100,
  endY = 100,
  curveIntensity = 0.4,
  curveType = "smooth",
  curveDirection = "auto",
  strokeWidth = 4,
  arrowSize = 20,
  className = "",
  startPosition = "bottom",
  endPosition = "top",
}: CustomCurvedArrowProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    startX,
    startY,
    endX,
    endY,
    obstacleRect: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(
    (element: HTMLElement, position: string) => {
      const rect = element.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!containerRect) return { x: 0, y: 0 };

      const relativeX = rect.left - containerRect.left;
      const relativeY = rect.top - containerRect.top;

      // Add padding adjustments for more accurate positioning
      const padding = 5;

      switch (position) {
        case "top":
          return { x: relativeX + rect.width / 2, y: relativeY - padding };
        case "bottom":
          return {
            x: relativeX + rect.width / 2,
            y: relativeY + rect.height + padding,
          };
        case "left":
          return { x: relativeX - padding, y: relativeY + rect.height / 2 };
        case "right":
          return {
            x: relativeX + rect.width + padding,
            y: relativeY + rect.height / 2,
          };
        case "center":
          return {
            x: relativeX + rect.width / 2,
            y: relativeY + rect.height / 2,
          };
        case "top-left":
          return { x: relativeX, y: relativeY };
        case "top-right":
          return { x: relativeX + rect.width, y: relativeY };
        case "bottom-left":
          return { x: relativeX, y: relativeY + rect.height };
        case "bottom-right":
          return { x: relativeX + rect.width, y: relativeY + rect.height };
        default:
          return {
            x: relativeX + rect.width / 2,
            y: relativeY + rect.height / 2,
          };
      }
    },
    [containerRef]
  );

  const updateCoordinates = useCallback(() => {
    if (startElement?.current && endElement?.current && containerRef.current) {
      const startPos = calculatePosition(startElement.current, startPosition);
      const endPos = calculatePosition(endElement.current, endPosition);

      let obstacleRect: Coordinates["obstacleRect"] = null;
      if (obstacleElement?.current && containerRef.current) {
        const obstacleElementRect =
          obstacleElement.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        obstacleRect = {
          x: obstacleElementRect.left - containerRect.left,
          y: obstacleElementRect.top - containerRect.top,
          width: obstacleElementRect.width,
          height: obstacleElementRect.height,
        };
      }

      setCoordinates({
        startX: startPos.x,
        startY: startPos.y,
        endX: endPos.x,
        endY: endPos.y,
        obstacleRect,
      });
    }
  }, [
    startElement,
    endElement,
    obstacleElement,
    startPosition,
    endPosition,
    calculatePosition,
    containerRef,
  ]);

  useEffect(() => {
    if (startElement?.current && endElement?.current) {
      updateCoordinates();

      const resizeObserver = new ResizeObserver(() => {
        updateCoordinates();
      });

      const mutationObserver = new MutationObserver(() => {
        updateCoordinates();
      });

      // Observe both elements and their parents
      if (startElement.current) {
        resizeObserver.observe(startElement.current);
        mutationObserver.observe(startElement.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      if (endElement.current) {
        resizeObserver.observe(endElement.current);
        mutationObserver.observe(endElement.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      if (obstacleElement?.current) {
        resizeObserver.observe(obstacleElement.current);
        mutationObserver.observe(obstacleElement.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }

      // Also observe window resize
      const handleResize = () => {
        setTimeout(updateCoordinates, 100);
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", updateCoordinates);

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", updateCoordinates);
      };
    }
  }, [
    startElement,
    endElement,
    obstacleElement,
    startPosition,
    endPosition,
    updateCoordinates,
  ]);

  const {
    startX: calcStartX,
    startY: calcStartY,
    endX: calcEndX,
    endY: calcEndY,
    obstacleRect,
  } = coordinates;

  const createCurvePath = () => {
    const dx = calcEndX - calcStartX;
    const dy = calcEndY - calcStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Auto-determine curve direction if not specified
    let effectiveDirection = curveDirection;
    if (curveDirection === "auto") {
      if (Math.abs(dx) > Math.abs(dy)) {
        effectiveDirection = dy > 0 ? "down" : "up";
      } else {
        effectiveDirection = dx > 0 ? "right" : "left";
      }
    }

    // Calculate curve offset based on direction
    let offsetX = 0;
    let offsetY = 0;
    const baseOffset = Math.min(distance * curveIntensity, 200);

    switch (effectiveDirection) {
      case "up":
        offsetY = -baseOffset;
        break;
      case "down":
        offsetY = baseOffset;
        break;
      case "left":
        offsetX = -baseOffset;
        break;
      case "right":
        offsetX = baseOffset;
        break;
    }

    let pathString = "";
    let control1X: number = 0;
    let control1Y: number = 0;
    let control2X: number = 0;
    let control2Y: number = 0;

    switch (curveType) {
      case "shortest-path":
        if (obstacleRect) {
          // Calculate the shortest path around the obstacle with better rounding
          const obstacleMargin = 40; // Margin for rounding the descriptions

          // Define obstacle boundaries
          const obstacleTop = obstacleRect.y - obstacleMargin;
          const obstacleBottom =
            obstacleRect.y + obstacleRect.height + obstacleMargin;
          const obstacleLeft = obstacleRect.x - obstacleMargin;
          const obstacleRight =
            obstacleRect.x + obstacleRect.width + obstacleMargin;

          // Since we start from top-left of Step 2 image and need to round the descriptions
          // We'll create a path that goes right and curves around the descriptions

          if (calcEndX > obstacleRight && calcStartX < obstacleLeft) {
            // Path goes around the right side of descriptions
            const waypoint1X = obstacleRight + baseOffset * 0.4;
            const waypoint1Y = obstacleTop + obstacleRect.height * 0.3;

            const waypoint2X = obstacleRight + baseOffset * 0.2;
            const waypoint2Y = obstacleBottom - baseOffset * 0.1;

            // Control points for smooth rounding
            control1X = calcStartX + (waypoint1X - calcStartX) * 0.3;
            control1Y = calcStartY + (waypoint1Y - calcStartY) * 0.4;

            const midControlX = waypoint1X + baseOffset * 0.1;
            const midControlY = waypoint1Y + (waypoint2Y - waypoint1Y) * 0.5;

            control2X = waypoint2X + (calcEndX - waypoint2X) * 0.4;
            control2Y = waypoint2Y + (calcEndY - waypoint2Y) * 0.6;

            // Create smooth rounding path
            pathString = `M ${calcStartX} ${calcStartY} 
                         C ${control1X} ${control1Y} ${waypoint1X - 30} ${
              waypoint1Y - 15
            } ${waypoint1X} ${waypoint1Y}
                         C ${midControlX} ${midControlY} ${waypoint2X - 20} ${
              waypoint2Y + 10
            } ${waypoint2X} ${waypoint2Y}
                         C ${control2X} ${control2Y} ${calcEndX - 40} ${
              calcEndY - 25
            } ${calcEndX} ${calcEndY}`;
          } else {
            // Fallback path - go over the top if right path isn't optimal
            const waypointX = (calcStartX + calcEndX) / 2 + baseOffset * 0.3;
            const waypointY = obstacleTop - baseOffset * 0.2;

            control1X = calcStartX + (waypointX - calcStartX) * 0.4;
            control1Y = calcStartY + (waypointY - calcStartY) * 0.6;
            control2X = waypointX + (calcEndX - waypointX) * 0.6;
            control2Y = waypointY + (calcEndY - waypointY) * 0.4;

            pathString = `M ${calcStartX} ${calcStartY} 
                         C ${control1X} ${control1Y} ${
              waypointX - 20
            } ${waypointY} ${waypointX} ${waypointY}
                         C ${control2X} ${control2Y} ${calcEndX - 30} ${
              calcEndY - 20
            } ${calcEndX} ${calcEndY}`;
          }
        } else {
          // Direct path if no obstacle
          control1X = calcStartX + dx * 0.3;
          control1Y = calcStartY + dy * 0.3;
          control2X = calcEndX - dx * 0.3;
          control2Y = calcEndY - dy * 0.3;
          pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        }
        break;

      case "around-obstacle":
        if (obstacleRect) {
          // Create a path that curves around the obstacle from top-left
          const obstacleMargin = 60; // Extra space around obstacle
          const obstacleLeft = obstacleRect.x - obstacleMargin;
          const obstacleRight =
            obstacleRect.x + obstacleRect.width + obstacleMargin;
          const obstacleBottom =
            obstacleRect.y + obstacleRect.height + obstacleMargin;

          // Since we start from top-left, we need to go left first, then around
          // First curve: go left and down to avoid the obstacle
          const waypoint1X = Math.min(
            calcStartX - baseOffset * 0.8,
            obstacleLeft
          );
          const waypoint1Y = calcStartY + (obstacleBottom - calcStartY) * 0.4;

          // Second curve: go around the bottom of the obstacle
          const waypoint2X = obstacleRight + baseOffset * 0.3;
          const waypoint2Y = obstacleBottom + baseOffset * 0.2;

          // Control points for smooth curves
          control1X = calcStartX + (waypoint1X - calcStartX) * 0.3;
          control1Y = calcStartY + (waypoint1Y - calcStartY) * 0.5;

          const midControlX = waypoint1X - baseOffset * 0.2;
          const midControlY = waypoint1Y + (waypoint2Y - waypoint1Y) * 0.5;

          control2X = waypoint2X + (calcEndX - waypoint2X) * 0.3;
          control2Y = waypoint2Y + (calcEndY - waypoint2Y) * 0.3;

          // Create a complex path that goes around the obstacle from top-left
          pathString = `M ${calcStartX} ${calcStartY} 
                       C ${control1X} ${control1Y} ${waypoint1X + 20} ${
            waypoint1Y - 20
          } ${waypoint1X} ${waypoint1Y}
                       C ${midControlX} ${midControlY} ${waypoint2X - 40} ${
            waypoint2Y - 20
          } ${waypoint2X} ${waypoint2Y}
                       C ${control2X} ${control2Y} ${calcEndX - 50} ${
            calcEndY - 30
          } ${calcEndX} ${calcEndY}`;
        } else {
          // Fallback to elegant curve if no obstacle
          control1X = calcStartX + dx * 0.2 + offsetX * 0.4;
          control1Y = calcStartY + dy * 0.2 + offsetY * 0.4;
          const midControlX = (calcStartX + calcEndX) / 2 + offsetX * 0.8;
          const midControlY = (calcStartY + calcEndY) / 2 + offsetY * 0.8;
          control2X = calcEndX - dx * 0.2 + offsetX * 0.4;
          control2Y = calcEndY - dy * 0.2 + offsetY * 0.4;

          pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${midControlX} ${midControlY} ${
            (calcStartX + calcEndX) / 2
          } ${
            (calcStartY + calcEndY) / 2
          } S ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        }
        break;

      case "smooth":
        control1X = calcStartX + dx * 0.3 + offsetX * 0.5;
        control1Y = calcStartY + dy * 0.3 + offsetY * 0.5;
        control2X = calcEndX - dx * 0.3 + offsetX * 0.5;
        control2Y = calcEndY - dy * 0.3 + offsetY * 0.5;
        pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        break;

      case "dramatic":
        control1X = calcStartX + dx * 0.1 + offsetX * 1.2;
        control1Y = calcStartY + dy * 0.1 + offsetY * 1.2;
        control2X = calcEndX - dx * 0.1 + offsetX * 1.2;
        control2Y = calcEndY - dy * 0.1 + offsetY * 1.2;
        pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        break;

      case "s-curve":
        control1X = calcStartX + dx * 0.25 + offsetX * 3.8;
        control1Y = calcStartY + dy * 0.25 + offsetY * 0.8;
        control2X = calcEndX - dx * 0.25 - offsetX * 0.8;
        control2Y = calcEndY - dy * 0.25 - offsetY * 0.8;
        pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        break;

      case "wave":
        const wavePoints: { x: number; y: number }[] = [];
        const segments = 3;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = calcStartX + dx * t;
          const y =
            calcStartY + dy * t + Math.sin(t * Math.PI * 2) * offsetY * 0.3;
          wavePoints.push({ x, y });
        }
        pathString = `M ${wavePoints[0].x} ${wavePoints[0].y}`;
        for (let i = 1; i < wavePoints.length; i++) {
          const prev = wavePoints[i - 1];
          const curr = wavePoints[i];
          const cpX = prev.x + (curr.x - prev.x) * 0.5;
          const cpY = prev.y + (curr.y - prev.y) * 0.5 + offsetY * 0.2;
          pathString += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
        }
        control2X = wavePoints[wavePoints.length - 2].x;
        control2Y = wavePoints[wavePoints.length - 2].y;
        break;

      case "spiral":
        const spiralRadius = Math.min(distance * 0.2, 80);
        const centerX = (calcStartX + calcEndX) / 2 + offsetX * 0.5;
        const centerY = (calcStartY + calcEndY) / 2 + offsetY * 0.5;

        pathString = `M ${calcStartX} ${calcStartY}`;
        pathString += ` Q ${
          centerX - spiralRadius
        } ${centerY} ${centerX} ${centerY}`;
        pathString += ` Q ${
          centerX + spiralRadius
        } ${centerY} ${calcEndX} ${calcEndY}`;

        control2X = centerX + spiralRadius;
        control2Y = centerY;
        break;

      case "elegant":
        control1X = calcStartX + dx * 0.2 + offsetX * 0.4;
        control1Y = calcStartY + dy * 0.2 + offsetY * 0.4;
        const midControlX = (calcStartX + calcEndX) / 2 + offsetX * 0.8;
        const midControlY = (calcStartY + calcEndY) / 2 + offsetY * 0.8;
        control2X = calcEndX - dx * 0.2 + offsetX * 0.4;
        control2Y = calcEndY - dy * 0.2 + offsetY * 0.4;

        pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${midControlX} ${midControlY} ${
          (calcStartX + calcEndX) / 2
        } ${
          (calcStartY + calcEndY) / 2
        } S ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
        break;

      default:
        // Default smooth curve
        control1X = calcStartX + dx * 0.3 + offsetX * 0.5;
        control1Y = calcStartY + dy * 0.3 + offsetY * 0.5;
        control2X = calcEndX - dx * 0.3 + offsetX * 0.5;
        control2Y = calcEndY - dy * 0.3 + offsetY * 0.5;
        pathString = `M ${calcStartX} ${calcStartY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${calcEndX} ${calcEndY}`;
    }

    return {
      pathString,
      control2X: control2X || calcEndX,
      control2Y: control2Y || calcEndY,
    };
  };

  const { pathString, control2X, control2Y } = createCurvePath();

  // Calculate arrow head angle
  const endAngle = Math.atan2(calcEndY - control2Y, calcEndX - control2X);
  const arrowAngle = Math.PI / 6;
  const arrowX1 = calcEndX - arrowSize * Math.cos(endAngle - arrowAngle);
  const arrowY1 = calcEndY - arrowSize * Math.sin(endAngle - arrowAngle);
  const arrowX2 = calcEndX - arrowSize * Math.cos(endAngle + arrowAngle);
  const arrowY2 = calcEndY - arrowSize * Math.sin(endAngle + arrowAngle);

  const arrowHead = `M ${calcEndX} ${calcEndY} L ${arrowX1} ${arrowY1} M ${calcEndX} ${calcEndY} L ${arrowX2} ${arrowY2}`;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{
          filter: `drop-shadow(0 4px 12px rgba(133, 45, 238, 0.3))`,
          zIndex: 10,
          overflow: "visible",
        }}
        preserveAspectRatio="none"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient
            id="purpleGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#852DEE" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow effect background */}
        <path
          d={pathString}
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth + 4}
          fill="none"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#glow)"
        />

        {/* Main curved arrow line */}
        <path
          d={pathString}
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Arrow Head */}
        <path
          d={arrowHead}
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
