'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import MetricsCard from '@/components/MetricsCard'
import NetworkParameters from '@/components/NetworkParameters'
import MetricsChart from '@/components/MetricsChart'
import LocationWeatherCard from '@/components/LocationWeatherCard'
import { prepareQoSData, fetchQoSPredictions } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, Info, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
    // Primary predicted metric
    const [throughput, setThroughput] = useState({
        value: 850,
        unit: 'Mbps',
        progress: 85,
        status: 'good'
    })

    // Contextual metrics (not direct predictions)
    const [contextMetrics, setContextMetrics] = useState({
        signalQuality: { value: 75, unit: '%', progress: 75, status: 'good' },
        networkLoad: { value: 45, unit: '%', progress: 55, status: 'good' },
        connectionStability: { value: 90, unit: '%', progress: 90, status: 'good' }
    })

    const [chartData, setChartData] = useState([])
    const [networkParams, setNetworkParams] = useState({
        bandwidth: 100,
        signalStrength: -70,
        users: 100,
        operator: 1
    })

    const [locationData, setLocationData] = useState(null)
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [refreshRotation, setRefreshRotation] = useState(0)

    // Function to fetch data and make predictions
    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setRefreshRotation(prev => prev + 360)

        try {
            // Prepare full data payload with location, weather, and network params
            const fullData = await prepareQoSData(networkParams.operator)

            // Save location and weather data for display
            setLocationData({
                latitude: fullData.Latitude,
                longitude: fullData.Longitude,
                altitude: fullData.Altitude,
                speed_kmh: fullData.speed_kmh
            })

            setWeatherData({
                temperature: fullData.temperature,
                humidity: fullData.humidity,
                windSpeed: fullData.windSpeed,
                pressure: fullData.pressure
            })

            // Get predictions from backend
            const predictions = await fetchQoSPredictions(fullData)

            // Get the actual throughput prediction
            const predictedThroughput = predictions.throughput || 0

            // Determine throughput status
            let throughputStatus = 'critical'
            if (predictedThroughput > 500) throughputStatus = 'good'
            else if (predictedThroughput > 200) throughputStatus = 'warning'

            // Update throughput with the actual prediction
            setThroughput({
                value: Math.round(predictedThroughput),
                unit: 'Mbps',
                progress: Math.min(100, predictedThroughput / 10),
                status: throughputStatus
            })

            // Calculate contextual metrics based on input parameters and predicted throughput
            // These aren't ML predictions but provide context to the user

            // Signal quality based on signalStrength parameter (better signal = higher quality)
            const signalQuality = Math.round(((networkParams.signalStrength + 100) / 70) * 100)

            // Network load based on users parameter (more users = higher load)
            const networkLoad = Math.min(100, Math.round((networkParams.users / 10)))

            // Connection stability (inverse of weather factors)
            const weatherImpact = (weatherData.windSpeed / 10) + (weatherData.humidity / 200)
            const connectionStability = Math.round(Math.max(0, Math.min(100, 100 - weatherImpact * 10)))

            setContextMetrics({
                signalQuality: {
                    value: signalQuality,
                    unit: '%',
                    progress: signalQuality,
                    status: signalQuality > 70 ? 'good' : signalQuality > 50 ? 'warning' : 'critical'
                },
                networkLoad: {
                    value: networkLoad,
                    unit: '%',
                    progress: 100 - networkLoad,
                    status: networkLoad < 50 ? 'good' : networkLoad < 80 ? 'warning' : 'critical'
                },
                connectionStability: {
                    value: connectionStability,
                    unit: '%',
                    progress: connectionStability,
                    status: connectionStability > 70 ? 'good' : connectionStability > 50 ? 'warning' : 'critical'
                }
            })

            // Add to chart data
            const now = new Date()
            const newData = {
                time: now.toLocaleTimeString(),
                throughput: predictedThroughput,
                signalQuality: signalQuality,
                networkLoad: networkLoad,
                connectionStability: connectionStability
            }

            setChartData(prev => [...prev.slice(-9), newData])

        } catch (error) {
            console.error('Error:', error)
            setError('Failed to fetch data. Please check your connection and try again.')
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
        setNetworkParams(prev => ({
            ...prev,
            [param]: value
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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <div className="min-h-screen bg-background bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/95">
            <Navbar />
            <main className="container mx-auto p-6 space-y-6">
                <motion.div 
                    className="flex flex-col md:flex-row justify-between items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="mr-3 bg-primary/10 p-2 rounded-md"
                        >
                            <Cpu className="h-6 w-6 text-primary" />
                        </motion.div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                            5G Network Throughput Dashboard
                        </h1>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={fetchData}
                            disabled={loading}
                            className="mt-4 md:mt-0 relative overflow-hidden group"
                            variant="default"
                        >
                            <motion.div
                                style={{ rotate: refreshRotation }}
                                transition={{ type: "spring", damping: 10 }}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </motion.div>
                            <span>{loading ? 'Updating...' : 'Refresh Data'}</span>
                            <motion.div
                                className="absolute inset-0 bg-primary/10 rounded-md"
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Model Info */}
                <motion.div 
                    className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            ML Throughput Prediction Active
                        </motion.span>
                    </h2>
                </motion.div>

                {/* Primary Metric Card */}
                <motion.div 
                    className="mb-4"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-xl font-bold mb-2">ML Predicted Throughput</h2>
                    <MetricsCard
                        title="Throughput"
                        value={throughput.value}
                        unit={throughput.unit}
                        progress={throughput.progress}
                        status={throughput.status}
                        isPrimary={true}
                    />
                </motion.div>

                {/* Contextual Metrics Cards Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-xl font-bold mb-2">Contextual Network Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div variants={cardVariants}>
                            <MetricsCard
                                title="Signal Quality"
                                value={contextMetrics.signalQuality.value}
                                unit={contextMetrics.signalQuality.unit}
                                progress={contextMetrics.signalQuality.progress}
                                status={contextMetrics.signalQuality.status}
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <MetricsCard
                                title="Network Load"
                                value={contextMetrics.networkLoad.value}
                                unit={contextMetrics.networkLoad.unit}
                                progress={contextMetrics.networkLoad.progress}
                                status={contextMetrics.networkLoad.status}
                            />
                        </motion.div>
                        <motion.div variants={cardVariants}>
                            <MetricsCard
                                title="Connection Stability"
                                value={contextMetrics.connectionStability.value}
                                unit={contextMetrics.connectionStability.unit}
                                progress={contextMetrics.connectionStability.progress}
                                status={contextMetrics.connectionStability.status}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Location/Weather and Parameters Grid */}
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <motion.div variants={cardVariants}>
                        <LocationWeatherCard
                            locationData={locationData}
                            weatherData={weatherData}
                        />
                    </motion.div>
                    <motion.div variants={cardVariants}>
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
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                >
                    <motion.div variants={cardVariants}>
                        <MetricsChart
                            data={chartData}
                            title="Throughput Over Time"
                            dataKey="throughput"
                            color="#8884d8"
                        />
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <MetricsChart
                            data={chartData}
                            title="Signal Quality Over Time"
                            dataKey="signalQuality"
                            color="#82ca9d"
                        />
                    </motion.div>
                </motion.div>
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    variants={staggerContainer} 
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.7 }}
                >
                    <motion.div variants={cardVariants}>
                        <MetricsChart
                            data={chartData}
                            title="Network Load Over Time"
                            dataKey="networkLoad"
                            color="#ff8042"
                        />
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <MetricsChart
                            data={chartData}
                            title="Connection Stability Over Time"
                            dataKey="connectionStability"
                            color="#0088FE"
                        />
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}