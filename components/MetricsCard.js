import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { useEffect, useState } from "react"

export default function MetricsCard({ title, value, unit, progress, status, isPrimary = false }) {
    const [prevValue, setPrevValue] = useState(value)
    const [showPulse, setShowPulse] = useState(false)
    
    useEffect(() => {
        if (value !== prevValue) {
            setShowPulse(true)
            const timer = setTimeout(() => setShowPulse(false), 1000)
            setPrevValue(value)
            return () => clearTimeout(timer)
        }
    }, [value, prevValue])
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return {
                    text: 'text-green-500',
                    bg: 'bg-green-500',
                    bgLight: 'bg-green-100 dark:bg-green-900/30',
                    border: 'border-green-200 dark:border-green-800'
                }
            case 'warning':
                return {
                    text: 'text-yellow-500',
                    bg: 'bg-yellow-500',
                    bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
                    border: 'border-yellow-200 dark:border-yellow-800'
                }
            case 'critical':
                return {
                    text: 'text-red-500',
                    bg: 'bg-red-500',
                    bgLight: 'bg-red-100 dark:bg-red-900/30',
                    border: 'border-red-200 dark:border-red-800'
                }
            default:
                return {
                    text: 'text-gray-500',
                    bg: 'bg-gray-500',
                    bgLight: 'bg-gray-100 dark:bg-gray-800',
                    border: 'border-gray-200 dark:border-gray-700'
                }
        }
    }
    
    const colors = getStatusColor(status)

    return (
        <motion.div 
            whileHover={{ scale: isPrimary ? 1.02 : 1.01 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="h-full"
        >
            <Card className={`w-full h-full backdrop-blur-sm ${isPrimary 
                ? "bg-gradient-to-br from-blue-50/90 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-300 dark:border-blue-700 shadow-lg" 
                : "bg-white/80 dark:bg-gray-950/50"}`}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`${isPrimary ? "text-md" : "text-sm"} font-medium`}>
                        {title}
                    </CardTitle>
                    {isPrimary && (
                        <motion.span 
                            className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            ML-Predicted
                        </motion.span>
                    )}
                </CardHeader>
                <CardContent>
                    <motion.div 
                        className={`${isPrimary ? "text-3xl" : "text-2xl"} font-bold flex items-baseline`}
                        animate={showPulse ? { scale: [1, 1.03, 1] } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <CountUp 
                            start={prevValue} 
                            end={value} 
                            duration={1} 
                            separator="," 
                            decimals={0}
                        /> 
                        <span className="ml-1">{unit}</span>
                    </motion.div>
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                                className={`absolute left-0 top-0 h-full ${colors.bg}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <motion.span 
                            className={`text-sm font-semibold px-2 py-0.5 rounded-full ${colors.bgLight} ${colors.text} ${colors.border} border`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            {status.toUpperCase()}
                        </motion.span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}