import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export default function NetworkParameters({ onParameterChange, onLocationUpdate, initialValues = {} }) {
    const [values, setValues] = useState({
        bandwidth: initialValues.bandwidth || 100,
        signalStrength: initialValues.signalStrength || -70,
        users: initialValues.users || 100,
        operator: initialValues.operator || 1
    })

    const [locationStatus, setLocationStatus] = useState({
        granted: false,
        message: "Use current location"
    })

    useEffect(() => {
        setValues({
            bandwidth: initialValues.bandwidth || 100,
            signalStrength: initialValues.signalStrength || -70,
            users: initialValues.users || 100,
            operator: initialValues.operator || 1
        })
    }, [initialValues])

    const handleChange = (param, value) => {
        const newValues = {
            ...values,
            [param]: value
        }
        setValues(newValues)
        onParameterChange(param, value)
    }

    const handleGetLocation = () => {
        setLocationStatus({ granted: false, message: "Requesting location..." })
        onLocationUpdate()
            .then(() => {
                setLocationStatus({ granted: true, message: "Location updated" })
            })
            .catch(error => {
                console.error("Location error:", error)
                setLocationStatus({ granted: false, message: "Location access denied" })
            })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Network Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Button 
                        variant={locationStatus.granted ? "outline" : "default"}
                        className="w-full"
                        onClick={handleGetLocation}
                    >
                        <MapPin className="mr-2 h-4 w-4" />
                        {locationStatus.message}
                    </Button>
                    
                    <div className="space-y-2">
                        <Label htmlFor="operator">Network Operator</Label>
                        <Select
                            value={values.operator.toString()}
                            onValueChange={(value) => handleChange('operator', parseInt(value))}
                        >
                            <SelectTrigger id="operator">
                                <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Jio</SelectItem>
                                <SelectItem value="2">Airtel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Bandwidth (MHz)</Label>
                        <span className="text-sm font-medium">{values.bandwidth} MHz</span>
                    </div>
                    <Slider
                        value={[values.bandwidth]}
                        max={1000}
                        step={10}
                        onValueChange={(value) => handleChange('bandwidth', value[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0 MHz</span>
                        <span>1000 MHz</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Signal Strength (dBm)</Label>
                        <span className="text-sm font-medium">{values.signalStrength} dBm</span>
                    </div>
                    <Slider
                        value={[values.signalStrength]}
                        max={-30}
                        min={-100}
                        step={1}
                        onValueChange={(value) => handleChange('signalStrength', value[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>-100 dBm</span>
                        <span>-30 dBm</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Number of Users</Label>
                    <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={values.users}
                        onChange={(e) => handleChange('users', parseInt(e.target.value))}
                    />
                </div>
            </CardContent>
        </Card>
    )
}