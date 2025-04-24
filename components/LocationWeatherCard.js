"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, MapPin, Compass, Thermometer, Wind, Droplets, Gauge } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function LocationWeatherCard({ locationData, weatherData }) {
  const formatCoordinate = (value) => {
    if (value === undefined && value !== 0) return "N/A"
    return value.toFixed(4)
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-lg border border-border/40 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="flex items-center justify-between text-lg font-medium text-indigo-200">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-indigo-500/20 p-1.5 rounded-md text-indigo-400"
              >
                <MapPin className="h-4 w-4" />
              </motion.div>
              Location & Weather
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Real-time data
              </Badge>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <AnimatePresence>
            {locationData || weatherData ? (
              <motion.div
                className="grid grid-cols-2 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <motion.div className="space-y-4" variants={itemVariants}>
                  <h3 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-indigo-400" />
                    Location Data
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300">Latitude</span>
                      <span className="text-sm font-medium text-white">{formatCoordinate(locationData?.latitude)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300">Longitude</span>
                      <span className="text-sm font-medium text-white">
                        {formatCoordinate(locationData?.longitude)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300">Altitude</span>
                      <span className="text-sm font-medium text-white">
                        {locationData?.altitude ? `${locationData.altitude.toFixed(1)} m` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300">Speed</span>
                      <span className="text-sm font-medium text-white">
                        {locationData?.speed_kmh ? `${locationData.speed_kmh.toFixed(1)} km/h` : "0 km/h"}
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.div className="space-y-4" variants={itemVariants}>
                  <h3 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-indigo-400" />
                    Weather Conditions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300 flex items-center">
                        <Thermometer className="h-3 w-3 mr-1" />
                        Temperature
                      </span>
                      <span className="text-sm font-medium text-white">
                        {weatherData?.temperature ? `${weatherData.temperature}°C` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300 flex items-center">
                        <Droplets className="h-3 w-3 mr-1" />
                        Humidity
                      </span>
                      <span className="text-sm font-medium text-white">
                        {weatherData?.humidity ? `${weatherData.humidity}%` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300 flex items-center">
                        <Wind className="h-3 w-3 mr-1" />
                        Wind Speed
                      </span>
                      <span className="text-sm font-medium text-white">
                        {weatherData?.windSpeed ? `${weatherData.windSpeed} m/s` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300 flex items-center">
                        <Gauge className="h-3 w-3 mr-1" />
                        Pressure
                      </span>
                      <span className="text-sm font-medium text-white">
                        {weatherData?.pressure ? `${weatherData.pressure} hPa` : "N/A"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center justify-center h-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center text-indigo-300">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No location or weather data available</p>
                  <p className="text-sm mt-1">Click "Use current location" to update</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
