"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Bell, User, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav
      className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-xl flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mr-2 bg-indigo-500/20 p-1.5 rounded-md"
            >
              <Activity className="h-5 w-5 text-indigo-400" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-primary/70 to-primary"
            >
              5G QoS Monitor
            </motion.span>
          </Link>
          <div className="hidden md:flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              Analytics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              Settings
            </Button>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            </Button>
          </motion.div>
          <ModeToggle />
         

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-[#1a1c30] border-b border-indigo-900/40"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
              >
                Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
              >
                Settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
