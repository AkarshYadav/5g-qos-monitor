"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin, Sliders, Wifi, Signal, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function NetworkParameters({ onParameterChange, onLocationUpdate, initialValues = {} }) {
    const [values, setValues] = useState({
        bandwidth: initialValues.bandwidth || 100,
        signalStrength: initialValues.signalStrength || -70,
        users: initialValues.users || 100,
        operator: initialValues.operator || 1,
    })

    const [locationStatus, setLocationStatus] = useState({
        granted: false,
        message: "Use current location",
    })

    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        setValues({
            bandwidth: initialValues.bandwidth || 100,
            signalStrength: initialValues.signalStrength || -70,
            users: initialValues.users || 100,
            operator: initialValues.operator || 1,
        })
    }, [initialValues])

    const handleChange = (param, value) => {
        const newValues = {
            ...values,
            [param]: value,
        }
        setValues(newValues)
        onParameterChange(param, value)
    }

    const handleGetLocation = async () => {
        setIsUpdating(true)
        setLocationStatus({ granted: false, message: "Requesting location..." })

        try {
            await onLocationUpdate()
            setLocationStatus({ granted: true, message: "Location updated" })

            // Reset status after 3 seconds
            setTimeout(() => {
                setLocationStatus({ granted: true, message: "Use current location" })
            }, 3000)
        } catch (error) {
            console.error("Location error:", error)
            setLocationStatus({ granted: false, message: "Location access denied" })

            // Reset status after 3 seconds
            setTimeout(() => {
                setLocationStatus({ granted: false, message: "Use current location" })
            }, 3000)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border border-border/40 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2 pt-5 px-5">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-indigo-200">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-indigo-500/20 p-1.5 rounded-md text-indigo-400"
                        >
                            <Sliders className="h-4 w-4" />
                        </motion.div>
                        Network Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-5 pb-5">
                    <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                variant="outline"
                                className="w-full relative overflow-hidden group border-primary/30 text-primary hover:text-primary-foreground hover:bg-primary/20"
                                onClick={handleGetLocation}
                                disabled={isUpdating}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isUpdating ? "updating" : "idle"}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {locationStatus.message}
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <motion.div
                                    className="absolute inset-0 bg-indigo-500/10 rounded-md"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </Button>
                        </motion.div>

                        <div className="space-y-2">
                            <Label htmlFor="operator" className="text-sm font-medium text-indigo-200">
                                Network Operator
                            </Label>
                            <Select
                                value={values.operator.toString()}
                                onValueChange={(value) => handleChange("operator", Number.parseInt(value))}
                            >
                                <SelectTrigger
                                    id="operator"
                                    className="bg-indigo-900/30 border-indigo-500/30 text-indigo-100 focus:ring-indigo-500/50"
                                >
                                    <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e2142] border-indigo-500/30 text-indigo-100">
                                    <SelectItem value="1">Jio</SelectItem>
                                    <SelectItem value="2">Airtel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm font-medium text-indigo-200">
                                <Wifi className="h-4 w-4 mr-2 text-indigo-400" />
                                Bandwidth (MHz)
                            </div>
                            <motion.span
                                key={values.bandwidth}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-indigo-300"
                            >
                                {values.bandwidth} MHz
                            </motion.span>
                        </div>
                        <Slider
                            value={[values.bandwidth]}
                            max={1000}
                            step={10}
                            onValueChange={(value) => handleChange("bandwidth", value[0])}
                            className="py-1"
                        />
                        <div className="flex justify-between text-xs text-indigo-400/70">
                            <span>0 MHz</span>
                            <span>1000 MHz</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm font-medium text-indigo-200">
                                <Signal className="h-4 w-4 mr-2 text-indigo-400" />
                                Signal Strength (dBm)
                            </div>
                            <motion.span
                                key={values.signalStrength}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-indigo-300"
                            >
                                {values.signalStrength} dBm
                            </motion.span>
                        </div>
                        <Slider
                            value={[values.signalStrength]}
                            max={-30}
                            min={-100}
                            step={1}
                            onValueChange={(value) => handleChange("signalStrength", value[0])}
                            className="py-1"
                        />
                        <div className="flex justify-between text-xs text-indigo-400/70">
                            <span>-100 dBm</span>
                            <span>-30 dBm</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium text-indigo-200">
                            <Users className="h-4 w-4 mr-2 text-indigo-400" />
                            Number of Users
                        </div>
                        <Input
                            type="number"
                            min={1}
                            max={1000}
                            value={values.users}
                            onChange={(e) => handleChange("users", Number.parseInt(e.target.value))}
                            className="bg-primary/10 border-primary/30 text-primary-foreground focus:ring-primary/50"
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
