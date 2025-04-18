import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, MapPin, Wind, Thermometer } from "lucide-react"

export default function LocationWeatherCard({ locationData, weatherData }) {
    const formatCoordinate = (value) => {
        if (!value && value !== 0) return "N/A"
        return value.toFixed(4)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location & Weather
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Coordinates</div>
                        <div className="text-sm">
                            Lat: {formatCoordinate(locationData?.latitude)}
                        </div>
                        <div className="text-sm">
                            Long: {formatCoordinate(locationData?.longitude)}
                        </div>
                        <div className="text-sm">
                            Alt: {locationData?.altitude ? `${locationData.altitude.toFixed(1)} m` : "N/A"}
                        </div>
                        <div className="text-sm">
                            Speed: {locationData?.speed_kmh ? `${locationData.speed_kmh.toFixed(1)} km/h` : "0 km/h"}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Weather Conditions</div>
                        <div className="text-sm flex items-center">
                            <Thermometer className="mr-2 h-4 w-4" />
                            {weatherData?.temperature ? `${weatherData.temperature}°C` : "N/A"}
                        </div>
                        <div className="text-sm flex items-center">
                            <CloudRain className="mr-2 h-4 w-4" />
                            {weatherData?.humidity ? `${weatherData.humidity}%` : "N/A"}
                        </div>
                        <div className="text-sm flex items-center">
                            <Wind className="mr-2 h-4 w-4" />
                            {weatherData?.windSpeed ? `${weatherData.windSpeed} m/s` : "N/A"}
                        </div>
                        <div className="text-sm">
                            Pressure: {weatherData?.pressure ? `${weatherData.pressure} hPa` : "N/A"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}