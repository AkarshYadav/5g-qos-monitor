"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import CountUp from "react-countup"
import { useEffect, useState } from "react"

export default function MetricsCard({ title, value, unit, progress, status, isPrimary = false, icon }) {
  const [prevValue, setPrevValue] = useState(value)
  const [showPulse, setShowPulse] = useState(false)
  const progressValue = useMotionValue(0)
  const progressWidth = useMotionTemplate`${progressValue}%`

  useEffect(() => {
    if (value !== prevValue) {
      setShowPulse(true)
      const timer = setTimeout(() => setShowPulse(false), 1000)
      setPrevValue(value)
      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  useEffect(() => {
    progressValue.set(progress)
  }, [progress, progressValue])

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return {
          text: "text-status-good",
          bg: "bg-status-good",
          bgLight: "bg-status-good/20",
          border: "border-status-good/30",
          shadow: "shadow-status-good/10",
          glow: "glow-success",
        }
      case "warning":
        return {
          text: "text-status-warning",
          bg: "bg-status-warning",
          bgLight: "bg-status-warning/20",
          border: "border-status-warning/30",
          shadow: "shadow-status-warning/10",
          glow: "glow-warning",
        }
      case "critical":
        return {
          text: "text-status-critical",
          bg: "bg-status-critical",
          bgLight: "bg-status-critical/20",
          border: "border-status-critical/30",
          shadow: "shadow-status-critical/10",
          glow: "glow-danger",
        }
      default:
        return {
          text: "text-muted-foreground",
          bg: "bg-muted",
          bgLight: "bg-muted/20",
          border: "border-muted/30",
          shadow: "shadow-muted/10",
          glow: "",
        }
    }
  }

  const colors = getStatusColor(status)

  return (
    <motion.div
      whileHover={{ scale: isPrimary ? 1.02 : 1.01, y: -4 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="h-full"
      layout
    >
      <Card className={`w-full h-full backdrop-blur-sm bg-card/60 border border-border/40 rounded-xl overflow-hidden`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
          <CardTitle
            className={`${isPrimary ? "text-md" : "text-sm"} font-medium flex items-center gap-2 text-indigo-200`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${colors.bgLight} ${colors.text} p-1.5 rounded-md`}
            >
              {icon}
            </motion.div>
            {title}
          </CardTitle>
          <motion.span
            className={`${colors.bgLight} ${colors.text} ${colors.border} text-xs font-medium px-2 py-0.5 rounded-full border`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {status.toUpperCase()}
          </motion.span>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <motion.div
            className={`${isPrimary ? "text-3xl" : "text-2xl"} font-bold flex items-baseline text-white`}
            animate={showPulse ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <CountUp start={prevValue} end={value} duration={1} separator="," decimals={0} />
            <span className="ml-1 text-indigo-300 text-lg">{unit}</span>
          </motion.div>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative w-full h-2.5 bg-indigo-900/30 rounded-full overflow-hidden">
              <motion.div
                className={`absolute left-0 top-0 h-full ${colors.bg} ${colors.glow}`}
                style={{ width: progressWidth }}
                initial={{ width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 15,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
