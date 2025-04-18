import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Defs,
    LinearGradient,
    Stop,
} from "recharts"
import { motion } from "framer-motion"
import { ChartBarIcon } from "lucide-react"

export default function MetricsChart({ data, title, dataKey, color = "#4f46e5" }) {
    const gradientId = `gradient-${dataKey}`

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <Card className="shadow-lg border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm">
                <CardHeader className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
                                <XAxis dataKey="time" tick={{ fill: "#888" }} />
                                <YAxis tick={{ fill: "#888" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        color: "#fff",
                                        fontSize: "0.85rem"
                                    }}
                                    labelStyle={{ color: "#93c5fd" }}
                                    cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={`url(#${gradientId})`}
                                    strokeWidth={3}
                                    dot={false}
                                    isAnimationActive
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
