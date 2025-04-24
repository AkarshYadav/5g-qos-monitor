"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts"
import { motion, useInView } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { useRef, useState } from "react"

export default function MetricsChart({ data, title, dataKey, color = "#6366f1", unit = "" }) {
  const chartRef = useRef(null)
  const isInView = useInView(chartRef, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)

  const gradientId = `gradient-${dataKey}`

  // Calculate average value for reference line
  const avgValue = data.length > 0 ? data.reduce((sum, item) => sum + item[dataKey], 0) / data.length : 0

  // Find max value for scaling
  const maxValue = data.length > 0 ? Math.max(...data.map((item) => item[dataKey])) * 1.1 : 100

  return (
    <motion.div
      ref={chartRef}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 , duration: 0.5, delay: 0.2}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
    >
      <Card className="shadow-lg border border-border/40 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-x-2 pb-2 pt-5 px-5">
          <CardTitle className="text-lg font-medium text-indigo-200 flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-indigo-500/20 p-1.5 rounded-md text-indigo-400"
            >
              <TrendingUp className="h-4 w-4" />
            </motion.div>
            {title}
          </CardTitle>
          <motion.div
            className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-1 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {data.length > 0 ? `Avg: ${Math.round(avgValue)} ${unit}` : "No data"}
          </motion.div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] w-full px-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} vertical={false} stroke="#4c4f7a" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#a5b4fc", fontSize: 11 }}
                  axisLine={{ stroke: "#4c4f7a", strokeOpacity: 0.5 }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tick={{ fill: "#a5b4fc", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, maxValue]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(var(--card) / 0.95)",
                    border: "1px solid oklch(var(--primary) / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(var(--card-foreground))",
                    fontSize: "0.85rem",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  labelStyle={{ color: "#a5b4fc", fontWeight: "bold", marginBottom: "4px" }}
                  cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }}
                  formatter={(value) => [`${value} ${unit}`, dataKey.charAt(0).toUpperCase() + dataKey.slice(1)]}
                />
                <ReferenceLine y={avgValue} stroke={color} strokeDasharray="3 3" strokeOpacity={0.7} isFront={true} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                  className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
