"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import Navbar from "@/components/Navbar"
import MetricsCard from "@/components/MetricsCard"
import NetworkParameters from "@/components/NetworkParameters"
import MetricsChart from "@/components/MetricsChart"
import LocationWeatherCard from "@/components/LocationWeatherCard"
import NetworkMap from "@/components/NetworkMap"
import { prepareQoSData, fetchQoSPredictions } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, Cpu, Signal, Wifi, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
    // Primary predicted metric
    const [throughput, setThroughput] = useState({
        value: 850,
        unit: "Mbps",
        progress: 85,
        status: "good",
        maxValue: 1000,
    })

    // Contextual metrics (not direct predictions)
    const [contextMetrics, setContextMetrics] = useState({
        signalQuality: { value: 75, unit: "%", progress: 75, status: "good" },
        networkLoad: { value: 45, unit: "%", progress: 55, status: "good" },
        connectionStability: { value: 90, unit: "%", progress: 90, status: "good" },
    })

    const [chartData, setChartData] = useState([])
    const [networkParams, setNetworkParams] = useState({
        bandwidth: 100,
        signalStrength: -70,
        users: 100,
        operator: 1,
    })

    const [locationData, setLocationData] = useState(null)
    const [weatherData, setWeatherData] = useState({
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        pressure: 1013
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [refreshRotation, setRefreshRotation] = useState(0)
    const [efficiency, setEfficiency] = useState(82)
    const [parameters, setParameters] = useState(11)

    // Function to fetch data and make predictions
    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setRefreshRotation((prev) => prev + 360)

        try {
            // Prepare full data payload with location, weather, and network params
            const fullData = await prepareQoSData(networkParams.operator)

            // Save location and weather data for display
            setLocationData({
                latitude: fullData.Latitude,
                longitude: fullData.Longitude,
                altitude: fullData.Altitude,
                speed_kmh: fullData.speed_kmh,
            })

            setWeatherData({
                temperature: fullData.temperature,
                humidity: fullData.humidity,
                windSpeed: fullData.windSpeed,
                pressure: fullData.pressure,
            })

            // Get predictions from backend
            let predictions;
            try {
                predictions = await fetchQoSPredictions(fullData);
            } catch (error) {
                console.error("Error fetching predictions:", error);
                predictions = { throughput: 500 };
            }

            // Get the actual throughput prediction
            const predictedThroughput = predictions.throughput || 0
            const maxThroughput = 1000 // Maximum possible throughput

            // Determine throughput status
            let throughputStatus = "critical"
            if (predictedThroughput > 500) throughputStatus = "good"
            else if (predictedThroughput > 200) throughputStatus = "warning"
            //
            // Update throughput with the actual prediction
            setThroughput({
                value: Math.round(predictedThroughput / 1000000),
                unit: "Mbps",
                progress: Math.min(100, (predictedThroughput / maxThroughput) * 100),
                status: throughputStatus,
                maxValue: maxThroughput,
            })

            // Calculate contextual metrics based on input parameters and predicted throughput
            // These aren't ML predictions but provide context to the user

            // Signal quality based on signalStrength parameter (better signal = higher quality)
            const signalQuality = Math.round(((networkParams.signalStrength + 100) / 70) * 100)

            // Network load based on users parameter (more users = higher load)
            const networkLoad = Math.min(100, Math.round(networkParams.users / 10))

            // Ensure weatherData is available before using it
            // Connection stability (inverse of weather factors)
            const weatherImpact = (weatherData?.windSpeed || 5) / 10 + (weatherData?.humidity || 60) / 200
            const connectionStability = Math.round(Math.max(0, Math.min(100, 100 - weatherImpact * 10)))

            setContextMetrics({
                signalQuality: {
                    value: signalQuality,
                    unit: "%",
                    progress: signalQuality,
                    status: signalQuality > 70 ? "good" : signalQuality > 50 ? "warning" : "critical",
                },
                networkLoad: {
                    value: networkLoad,
                    unit: "%",
                    progress: 100 - networkLoad,
                    status: networkLoad < 50 ? "good" : networkLoad < 80 ? "warning" : "critical",
                },
                connectionStability: {
                    value: connectionStability,
                    unit: "%",
                    progress: connectionStability,
                    status: connectionStability > 70 ? "good" : connectionStability > 50 ? "warning" : "critical",
                },
            })

            // Add to chart data
            const now = new Date()
            const newData = {
                time: now.toLocaleTimeString(),
                throughput: predictedThroughput,
                signalQuality: signalQuality,
                networkLoad: networkLoad,
                connectionStability: connectionStability,
            }

            setChartData((prev) => [...prev.slice(-9), newData])

            // Update efficiency based on all metrics
            const newEfficiency =
                Math.round(
                    (predictedThroughput / maxThroughput) * 0.4 +
                    (signalQuality / 100) * 0.2 +
                    ((100 - networkLoad) / 100) * 0.2 +
                    (connectionStability / 100) * 0.2,
                ) * 100

            setEfficiency(Math.min(99, Math.max(50, newEfficiency)))
        } catch (error) {
            console.error("Error:", error)
            setError("Failed to fetch data. Please check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    // Handle location update request
    const handleLocationUpdate = async () => {
        return fetchData()
    }

    // Handle parameter change
    const handleParameterChange = (param, value) => {
        setNetworkParams((prev) => ({
            ...prev,
            [param]: value,
        }))
    }

    useEffect(() => {
        // Initial fetch
        fetchData()

        // Set up interval for periodic updates
        const interval = setInterval(() => {
            fetchData()
        }, 60000) // Update every minute

        return () => clearInterval(interval)
    }, []) // Only run on mount

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
    }

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
                {/* Hexagonal background pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                    <div className="absolute inset-0 hexagon-pattern"></div>
                </div>

                <Navbar />

                <main className="container mx-auto p-4 md:p-6 space-y-6 relative z-10">
                    {/* Header with efficiency metric */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <motion.div
                            className="lg:col-span-1 bg-card/60 rounded-2xl p-6 border border-border/40 backdrop-blur-sm"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-medium text-indigo-200">Network Efficiency</h2>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    Real-time
                                </Badge>
                            </div>

                            <div className="flex items-center">
                                <motion.div
                                    className="text-7xl font-bold text-white mr-2"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    {efficiency}%
                                </motion.div>
                            </div>

                            <div className="text-indigo-300 text-sm mt-2">
                                Efficiency is {efficiency > 75 ? "above average" : "below average"} <br />
                                based on{" "}
                                <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {parameters} parameters
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-2 bg-card/60 rounded-2xl p-6 border border-border/40 backdrop-blur-sm"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-medium text-indigo-200">Total Throughput</h2>
                                    <div className="text-indigo-300 text-sm">ML-predicted network capacity</div>
                                </div>
                                <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300">IN TRANSFER</Badge>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="relative w-40 h-40">
                                    {/* Circular progress background */}
                                    <div className="absolute inset-0 rounded-full bg-indigo-900/20"></div>

                                    {/* Circular progress indicator */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2142" strokeWidth="10" />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="oklch(var(--primary))"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray="251.2"
                                            initial={{ strokeDashoffset: 251.2 }}
                                            animate={{
                                                strokeDashoffset: 251.2 - (throughput.progress / 100) * 251.2,
                                            }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                            transform="rotate(-90 50 50)"
                                            className="glow-primary"
                                        />
                                    </svg>

                                    {/* Center text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.div
                                            className="text-3xl font-bold"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            {throughput.value}
                                        </motion.div>
                                        <div className="text-indigo-300 text-sm">{throughput.unit}</div>
                                    </div>
                                </div>

                                <div className="ml-8">
                                    <div className="text-sm text-indigo-300 mb-2">
                                        from {throughput.maxValue} {throughput.unit}
                                    </div>

                                    <div className="space-y-3 max-w-xs">
                                        {Object.entries(contextMetrics).map(([key, metric]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-2 h-2 rounded-full mr-2 ${metric.status === "good"
                                                            ? "bg-green-400"
                                                            : metric.status === "warning"
                                                                ? "bg-amber-400"
                                                                : "bg-rose-400"
                                                            }`}
                                                    ></div>
                                                    <div className="text-sm font-medium">
                                                        {metric.value}
                                                        {metric.unit}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Network Map */}
                    <motion.div
                        className="bg-[#1e2142]/60 rounded-2xl border border-indigo-900/40 backdrop-blur-sm overflow-hidden"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="p-4 border-b border-indigo-900/40 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-indigo-200 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
                                Network Topology
                            </h2>
                            <Button
                                onClick={fetchData}
                                disabled={loading}
                                className="relative overflow-hidden group"
                                variant="outline"
                                size="sm"
                            >
                                <motion.div
                                    style={{ rotate: refreshRotation }}
                                    transition={{ type: "spring", damping: 10 }}
                                    className="mr-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                </motion.div>
                                <span>{loading ? "Updating..." : "Refresh"}</span>
                            </Button>
                        </div>
                        <div className="h-[300px] relative">
                            <NetworkMap locationData={locationData} networkParams={networkParams} throughput={throughput} />
                        </div>
                    </motion.div>

                    {/* Contextual Metrics Cards Grid */}
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div variants={itemVariants}>
                                <MetricsCard
                                    title="Signal Quality"
                                    value={contextMetrics.signalQuality.value}
                                    unit={contextMetrics.signalQuality.unit}
                                    progress={contextMetrics.signalQuality.progress}
                                    status={contextMetrics.signalQuality.status}
                                    icon={<Signal />}
                                />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <MetricsCard
                                    title="Network Load"
                                    value={contextMetrics.networkLoad.value}
                                    unit={contextMetrics.networkLoad.unit}
                                    progress={contextMetrics.networkLoad.progress}
                                    status={contextMetrics.networkLoad.status}
                                    icon={<Wifi />}
                                />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <MetricsCard
                                    title="Connection Stability"
                                    value={contextMetrics.connectionStability.value}
                                    unit={contextMetrics.connectionStability.unit}
                                    progress={contextMetrics.connectionStability.progress}
                                    status={contextMetrics.connectionStability.status}
                                    icon={<Cpu />}
                                />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Location/Weather and Parameters Grid */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div variants={itemVariants}>
                            <LocationWeatherCard locationData={locationData} weatherData={weatherData} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <NetworkParameters
                                onParameterChange={handleParameterChange}
                                onLocationUpdate={handleLocationUpdate}
                                initialValues={networkParams}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Charts Grid */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div variants={itemVariants}>
                            <MetricsChart
                                data={chartData}
                                title="Throughput Over Time"
                                dataKey="throughput"
                                color="#6366f1"
                                unit="Mbps"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <MetricsChart
                                data={chartData}
                                title="Signal Quality Over Time"
                                dataKey="signalQuality"
                                color="#10b981"
                                unit="%"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Distance to arrival */}
                    <motion.div
                        className="bg-[#1e2142]/60 rounded-2xl p-4 border border-indigo-900/40 backdrop-blur-sm"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-indigo-300">Distance to optimal throughput:</div>
                            <div className="text-sm font-medium">
                                <span className="text-green-400">{throughput.value}</span> / {throughput.maxValue} {throughput.unit}
                            </div>
                        </div>
                        <div className="relative h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${throughput.progress}%` }}
                                transition={{ duration: 1 }}
                            />
                            <div
                                className="absolute top-0 left-0 h-full w-full flex items-center justify-center"
                                style={{ left: `${throughput.progress}%` }}
                            >
                                <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] -ml-1.5"></div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="text-xs h-8 px-3 py-1">
                                    Optimize network
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs h-8 px-3 py-1">
                                    View details
                                </Button>
                            </div>
                            <Button variant="default" size="sm" className="text-xs h-8 px-3 py-1 bg-indigo-600 hover:bg-indigo-700">
                                Run diagnostics
                            </Button>
                        </div>
                    </motion.div>
                </main>
            </div>
        </MotionConfig>
    )
}