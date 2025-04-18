import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Navbar() {
    return (
        <nav className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="font-bold text-xl">
                        5G QoS Monitor
                    </Link>
                    {/* <div className="hidden md:flex space-x-4">
                        <Link href="/dashboard">
                            <Button variant="ghost">Dashboard</Button>
                        </Link>
                        <Link href="/metrics">
                            <Button variant="ghost">Metrics</Button>
                        </Link>
                        <Link href="/settings">
                            <Button variant="ghost">Settings</Button>
                        </Link>
                    </div> */}
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
} 