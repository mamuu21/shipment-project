import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
       "inline-flex h-10 items-center justify-center rounded-full bg-gray-100 p-1 space-x-1 border border-gray-300", // Light gray background with border
      "dark:bg-gray-800 dark:border-gray-700", // Dark mode variants
      className
    )}
    {...props}
  />
))

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium",
      // Base styles
      "bg-gray-200 text-gray-800 border border-gray-300", // Gray background with border
      "dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600", // Dark mode
      
      // Hover styles
      "hover:bg-gray-300 hover:border-gray-400", // Darker gray on hover
      "dark:hover:bg-gray-600 dark:hover:border-gray-500", // Dark mode hover
      
      // Focus styles (blue outline)
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      // Active state
      "data-[state=active]:bg-gray-300 data-[state=active]:border-gray-400 data-[state=active]:text-gray-900",
      "dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:border-gray-500 dark:data-[state=active]:text-white",
      
      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",
      
      // Transition
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
