"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Check,
  Layout,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Circle,
  Square,
  ImageIcon,
  Type,
  Briefcase,
  GraduationCap,
  Languages,
  FileText,
  Undo,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import type { ResumeStyle } from "@/types/resume"

export function StyleEditor() {
  const { resumeData, updateResumeStyle } = useContext(ResumeContext)
  const { style } = resumeData
  const { toast } = useToast()
  const [lastStyle, setLastStyle] = useState<ResumeStyle>({ ...style })

  const handleStyleChange = (key: keyof ResumeStyle, value: any) => {
    setLastStyle({ ...style })
    updateResumeStyle({ [key]: value } as any)

    // Show subtle toast for feedback
    toast({
      title: "Style updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")} has been updated`,
      duration: 1500,
    })
  }

  const handleResetStyle = () => {
    updateResumeStyle(lastStyle)
    toast({
      title: "Style reset",
      description: "Previous style settings have been restored",
      duration: 2000,
    })
  }

  return (
    <div className="space-y-6 pb-12 px-4">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 py-2 -mx-4 px-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-primary">Style Editor</h3>
        <Button variant="outline" size="sm" onClick={handleResetStyle} className="text-xs flex items-center gap-1">
          <Undo className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* 1. Choose a Template */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Choose a Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {["professional", "creative", "minimal"].map((template) => (
              <motion.div
                key={template}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-md overflow-hidden transition-all duration-200 border-2 hover:border-[#e3c27e]/70 ${
                  style.theme === template ? "ring-2 ring-[#e3c27e] border-[#e3c27e]" : "border-gray-200"
                }`}
                onClick={() => handleStyleChange("theme", template)}
              >
                <div className="aspect-[8.5/11] bg-gray-100">
                  <div
                    className="w-full h-full p-1"
                    style={{
                      backgroundImage: `url(/placeholder.svg?height=120&width=90&query=resume%20${template}%20template%20thumbnail)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                  {style.theme === template && (
                    <div className="bg-[#e3c27e] text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="text-center py-2 text-xs capitalize font-medium">{template}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Layout */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={style.spacing === "compact" ? "default" : "outline"}
              className="h-16 w-16 flex flex-col items-center justify-center gap-1 p-2"
              onClick={() => handleStyleChange("spacing", "compact")}
            >
              <Minimize2 className="h-5 w-5" />
              <span className="text-xs">Compact</span>
            </Button>
            <Button
              variant={style.spacing === "normal" ? "default" : "outline"}
              className="h-16 w-16 flex flex-col items-center justify-center gap-1 p-2"
              onClick={() => handleStyleChange("spacing", "normal")}
            >
              <Layout className="h-5 w-5" />
              <span className="text-xs">Balanced</span>
            </Button>
            <Button
              variant={style.spacing === "spacious" ? "default" : "outline"}
              className="h-16 w-16 flex flex-col items-center justify-center gap-1 p-2"
              onClick={() => handleStyleChange("spacing", "spacious")}
            >
              <Maximize2 className="h-5 w-5" />
              <span className="text-xs">Spacious</span>
            </Button>
          </div>

          <div className="space-y-2 border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
            <Label className="text-sm font-medium">Section Order</Label>
            <div className="space-y-2 mt-2">
              {["Contact", "Summary", "Experience", "Education", "Skills"].map((section, index) => (
                <div
                  key={section}
                  className="flex items-center bg-white dark:bg-gray-800 p-2 rounded border cursor-move hover:border-[#e3c27e]/50"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{index + 1}</span>
                    <span className="text-sm font-medium">{section}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                    <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Colors */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="primary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="primary">Primary</TabsTrigger>
              <TabsTrigger value="pastels">Pastels</TabsTrigger>
              <TabsTrigger value="neutrals">Neutrals</TabsTrigger>
            </TabsList>
            <TabsContent value="primary" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: "blue", hex: "#3b82f6" },
                  { name: "green", hex: "#22c55e" },
                  { name: "purple", hex: "#a855f7" },
                  { name: "red", hex: "#ef4444" },
                  { name: "gold", hex: "#e3c27e" },
                ].map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`h-12 w-12 rounded-full transition-all duration-200 mx-auto ${
                      style.color === color.name
                        ? "ring-4 ring-offset-2 ring-[#e3c27e]/50"
                        : "hover:ring-2 hover:ring-[#e3c27e]/30"
                    }`}
                    style={{
                      backgroundColor: color.hex,
                    }}
                    onClick={() => handleStyleChange("color", color.name)}
                  >
                    {style.color === color.name && <Check className="h-5 w-5 text-white mx-auto" />}
                  </motion.button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="pastels" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: "blue", hex: "#a8d5ff" },
                  { name: "green", hex: "#a8ffb0" },
                  { name: "purple", hex: "#e5a8ff" },
                  { name: "red", hex: "#ffa8a8" },
                  { name: "gold", hex: "#f0e6c9" },
                ].map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`h-12 w-12 rounded-full transition-all duration-200 mx-auto ${
                      style.color === color.name
                        ? "ring-4 ring-offset-2 ring-[#e3c27e]/50"
                        : "hover:ring-2 hover:ring-[#e3c27e]/30"
                    }`}
                    style={{
                      backgroundColor: color.hex,
                    }}
                    onClick={() => handleStyleChange("color", color.name)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="neutrals" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: "gray", hex: "#2d3748" },
                  { name: "gray", hex: "#4a5568" },
                  { name: "gray", hex: "#718096" },
                  { name: "gray", hex: "#a0aec0" },
                  { name: "gray", hex: "#e2e8f0" },
                ].map((color, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`h-12 w-12 rounded-full transition-all duration-200 mx-auto ${
                      style.color === "gray"
                        ? "ring-4 ring-offset-2 ring-[#e3c27e]/50"
                        : "hover:ring-2 hover:ring-[#e3c27e]/30"
                    }`}
                    style={{
                      backgroundColor: color.hex,
                    }}
                    onClick={() => handleStyleChange("color", "gray")}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant={style.theme === "light" ? "default" : "outline"}
                className="rounded-l-md rounded-r-none"
                onClick={() => handleStyleChange("theme", "light")}
              >
                Light Background
              </Button>
              <Button
                variant={style.theme === "dark" ? "default" : "outline"}
                className="rounded-r-md rounded-l-none"
                onClick={() => handleStyleChange("theme", "dark")}
              >
                Dark Background
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Spacing */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Font Size</Label>
              <span className="text-sm text-gray-500">
                {style.fontSize === "small" ? "Small" : style.fontSize === "medium" ? "Medium" : "Large"}
              </span>
            </div>
            <Slider
              defaultValue={[style.fontSize === "small" ? 0 : style.fontSize === "medium" ? 50 : 100]}
              max={100}
              step={50}
              onValueChange={(value) => {
                const size = value[0] === 0 ? "small" : value[0] === 50 ? "medium" : "large"
                handleStyleChange("fontSize", size)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Line Height</Label>
              <span className="text-sm text-gray-500">
                {style.lineHeight === "tight" ? "Tight" : style.lineHeight === "normal" ? "Normal" : "Relaxed"}
              </span>
            </div>
            <Slider
              defaultValue={[style.lineHeight === "tight" ? 0 : style.lineHeight === "normal" ? 50 : 100]}
              max={100}
              step={50}
              onValueChange={(value) => {
                const lineHeight = value[0] === 0 ? "tight" : value[0] === 50 ? "normal" : "relaxed"
                handleStyleChange("lineHeight", lineHeight)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Section Spacing</Label>
              <span className="text-sm text-gray-500">
                {style.spacing === "compact" ? "Compact" : style.spacing === "normal" ? "Normal" : "Spacious"}
              </span>
            </div>
            <Slider
              defaultValue={[style.spacing === "compact" ? 0 : style.spacing === "normal" ? 50 : 100]}
              max={100}
              step={50}
              onValueChange={(value) => {
                const spacing = value[0] === 0 ? "compact" : value[0] === 50 ? "normal" : "spacious"
                handleStyleChange("spacing", spacing)
              }}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Font */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Font</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Family</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "Inter", label: "Inter", preview: "Sans-serif" },
                { value: "Georgia", label: "Georgia", preview: "Serif" },
                { value: "Roboto", label: "Roboto", preview: "Sans-serif" },
                { value: "Merriweather", label: "Merriweather", preview: "Serif" },
                { value: "Montserrat", label: "Montserrat", preview: "Sans-serif" },
              ].map((font) => (
                <Button
                  key={font.value}
                  variant={style.fontFamily === font.value ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleStyleChange("fontFamily", font.value)}
                >
                  <div className="text-left">
                    <div className="font-medium" style={{ fontFamily: font.value }}>
                      {font.label}
                    </div>
                    <div className="text-xs opacity-70">{font.preview}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Heading Style */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Heading Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Heading Size</Label>
            <Slider
              defaultValue={[style.headingSize === "small" ? 0 : style.headingSize === "medium" ? 50 : 100]}
              max={100}
              step={50}
              onValueChange={(value) => {
                const size = value[0] === 0 ? "small" : value[0] === 50 ? "medium" : "large"
                handleStyleChange("headingSize", size)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Capitalization</Label>
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={style.headingStyle === "normal" ? "default" : "outline"}
                className="w-full rounded-l-md rounded-r-none"
                onClick={() => handleStyleChange("headingStyle", "normal")}
              >
                Normal
              </Button>
              <Button
                variant={style.headingStyle === "uppercase" ? "default" : "outline"}
                className="w-full rounded-none border-x-0 uppercase"
                onClick={() => handleStyleChange("headingStyle", "uppercase")}
              >
                UPPERCASE
              </Button>
              <Button
                variant={style.headingStyle === "capitalize" ? "default" : "outline"}
                className="w-full rounded-r-md rounded-l-none capitalize"
                onClick={() => handleStyleChange("headingStyle", "capitalize")}
              >
                Capitalize
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Divider Style</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.dividerStyle === "line" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dividerStyle", "line")}
              >
                Line
              </Button>
              <Button
                variant={style.dividerStyle === "dots" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dividerStyle", "dots")}
              >
                Dots
              </Button>
              <Button
                variant={style.dividerStyle === "none" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dividerStyle", "none")}
              >
                None
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Entry Layout */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Entry Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Placement</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.dateAlignment === "left" ? "default" : "outline"}
                className="w-full flex items-center justify-center gap-1"
                onClick={() => handleStyleChange("dateAlignment", "left")}
              >
                <AlignLeft className="h-4 w-4" />
                <span>Left</span>
              </Button>
              <Button
                variant={style.dateAlignment === "right" ? "default" : "outline"}
                className="w-full flex items-center justify-center gap-1"
                onClick={() => handleStyleChange("dateAlignment", "right")}
              >
                <AlignRight className="h-4 w-4" />
                <span>Right</span>
              </Button>
              <Button
                variant={style.dateAlignment === "inline" ? "default" : "outline"}
                className="w-full flex items-center justify-center gap-1"
                onClick={() => handleStyleChange("dateAlignment", "inline")}
              >
                <AlignCenter className="h-4 w-4" />
                <span>Inline</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Bullet Style</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.bulletStyle === "disc" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("bulletStyle", "disc")}
              >
                • Disc
              </Button>
              <Button
                variant={style.bulletStyle === "circle" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("bulletStyle", "circle")}
              >
                ◦ Circle
              </Button>
              <Button
                variant={style.bulletStyle === "square" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("bulletStyle", "square")}
              >
                ▪ Square
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Entry Dividers</Label>
              <Switch
                checked={style.showDividers !== false}
                onCheckedChange={(checked) => handleStyleChange("showDividers", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Header Layout */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Header Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Contact Layout</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.contactLayout === "inline" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("contactLayout", "inline")}
              >
                Inline
              </Button>
              <Button
                variant={style.contactLayout === "stacked" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("contactLayout", "stacked")}
              >
                Stacked
              </Button>
              <Button
                variant={style.contactLayout === "minimal" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("contactLayout", "minimal")}
              >
                Minimal
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Contact Icons</Label>
              <Switch
                checked={style.showContactIcons !== false}
                onCheckedChange={(checked) => handleStyleChange("showContactIcons", checked)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Header Alignment</Label>
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={style.headerAlignment === "left" ? "default" : "outline"}
                className="w-full rounded-l-md rounded-r-none"
                onClick={() => handleStyleChange("headerAlignment", "left")}
              >
                <AlignLeft className="h-4 w-4 mx-auto" />
              </Button>
              <Button
                variant={style.headerAlignment === "center" ? "default" : "outline"}
                className="w-full rounded-none border-x-0"
                onClick={() => handleStyleChange("headerAlignment", "center")}
              >
                <AlignCenter className="h-4 w-4 mx-auto" />
              </Button>
              <Button
                variant={style.headerAlignment === "right" ? "default" : "outline"}
                className="w-full rounded-r-md rounded-l-none"
                onClick={() => handleStyleChange("headerAlignment", "right")}
              >
                <AlignRight className="h-4 w-4 mx-auto" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 9. Name Display */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Name Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Name Size</Label>
            <Slider
              defaultValue={[style.nameSize === "small" ? 0 : style.nameSize === "medium" ? 50 : 100]}
              max={100}
              step={50}
              onValueChange={(value) => {
                const size = value[0] === 0 ? "small" : value[0] === 50 ? "medium" : "large"
                handleStyleChange("nameSize", size)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Name Style</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.nameStyle === "normal" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("nameStyle", "normal")}
              >
                Normal
              </Button>
              <Button
                variant={style.nameStyle === "uppercase" ? "default" : "outline"}
                className="w-full uppercase"
                onClick={() => handleStyleChange("nameStyle", "uppercase")}
              >
                UPPERCASE
              </Button>
              <Button
                variant={style.nameStyle === "bold" ? "default" : "outline"}
                className="w-full font-bold"
                onClick={() => handleStyleChange("nameStyle", "bold")}
              >
                Bold
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10. Date Format */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Date Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Format</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style.dateFormat === "MM/YYYY" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dateFormat", "MM/YYYY")}
              >
                MM/YYYY
              </Button>
              <Button
                variant={style.dateFormat === "YYYY-MM" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dateFormat", "YYYY-MM")}
              >
                YYYY-MM
              </Button>
              <Button
                variant={style.dateFormat === "MMM YYYY" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("dateFormat", "MMM YYYY")}
              >
                MMM YYYY
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 11. Photo Settings */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Photo Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Photo</Label>
              <Switch
                checked={style.includePhoto === true}
                onCheckedChange={(checked) => handleStyleChange("includePhoto", checked)}
              />
            </div>
          </div>

          {style.includePhoto && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Photo Shape</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={style.photoShape === "circle" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-1"
                    onClick={() => handleStyleChange("photoShape", "circle")}
                  >
                    <Circle className="h-4 w-4" />
                    <span>Circle</span>
                  </Button>
                  <Button
                    variant={style.photoShape === "square" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-1"
                    onClick={() => handleStyleChange("photoShape", "square")}
                  >
                    <Square className="h-4 w-4" />
                    <span>Square</span>
                  </Button>
                  <Button
                    variant={style.photoShape === "rounded" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-1"
                    onClick={() => handleStyleChange("photoShape", "rounded")}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Rounded</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Photo Size</Label>
                <Slider
                  defaultValue={[style.photoSize === "small" ? 0 : style.photoSize === "medium" ? 50 : 100]}
                  max={100}
                  step={50}
                  onValueChange={(value) => {
                    const size = value[0] === 0 ? "small" : value[0] === 50 ? "medium" : "large"
                    handleStyleChange("photoSize", size)
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Photo Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={style.photoPosition === "left" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("photoPosition", "left")}
                  >
                    Left
                  </Button>
                  <Button
                    variant={style.photoPosition === "right" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("photoPosition", "right")}
                  >
                    Right
                  </Button>
                  <Button
                    variant={style.photoPosition === "center" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("photoPosition", "center")}
                  >
                    Center
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 12. Footer Settings */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Footer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Footer</Label>
              <Switch
                checked={style.includeFooter === true}
                onCheckedChange={(checked) => handleStyleChange("includeFooter", checked)}
              />
            </div>
          </div>

          {style.includeFooter && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Show Contact Info</Label>
                  <Switch
                    checked={style.showContactInFooter !== false}
                    onCheckedChange={(checked) => handleStyleChange("showContactInFooter", checked)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Show Social Links</Label>
                  <Switch
                    checked={style.showSocialLinks !== false}
                    onCheckedChange={(checked) => handleStyleChange("showSocialLinks", checked)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Footer Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={style.footerStyle === "minimal" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("footerStyle", "minimal")}
                  >
                    Minimal
                  </Button>
                  <Button
                    variant={style.footerStyle === "full" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("footerStyle", "full")}
                  >
                    Full
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 13. Skills Section Style */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Skills Section Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Display Style</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={style.skillsDisplayStyle === "badges" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("skillsDisplayStyle", "badges")}
              >
                Badges
              </Button>
              <Button
                variant={style.skillsDisplayStyle === "bars" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("skillsDisplayStyle", "bars")}
              >
                Bars
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Label Style</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={style.skillsLabelStyle === "inline" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("skillsLabelStyle", "inline")}
              >
                Inline
              </Button>
              <Button
                variant={style.skillsLabelStyle === "block" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("skillsLabelStyle", "block")}
              >
                Block
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Skill Level</Label>
              <Switch
                checked={style.showSkillLevel !== false}
                onCheckedChange={(checked) => handleStyleChange("showSkillLevel", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 14. Languages Section Style */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Languages Section Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Display Style</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={style.languagesDisplayStyle === "badges" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("languagesDisplayStyle", "badges")}
              >
                Badges
              </Button>
              <Button
                variant={style.languagesDisplayStyle === "bars" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("languagesDisplayStyle", "bars")}
              >
                Bars
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Proficiency Level</Label>
              <Switch
                checked={style.showProficiencyLevel !== false}
                onCheckedChange={(checked) => handleStyleChange("showProficiencyLevel", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 15. Education Section Style */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education Section Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Layout</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={style.educationLayout === "grouped" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("educationLayout", "grouped")}
              >
                Grouped
              </Button>
              <Button
                variant={style.educationLayout === "flat" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleStyleChange("educationLayout", "flat")}
              >
                Flat
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show GPA</Label>
              <Switch
                checked={style.showGPA !== false}
                onCheckedChange={(checked) => handleStyleChange("showGPA", checked)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Courses</Label>
              <Switch
                checked={style.showCourses === true}
                onCheckedChange={(checked) => handleStyleChange("showCourses", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 16. Work Experience Style */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Work Experience Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Responsibilities</Label>
              <Switch
                checked={style.showResponsibilities !== false}
                onCheckedChange={(checked) => handleStyleChange("showResponsibilities", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 17. Declaration Section */}
      <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Declaration Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Declaration</Label>
              <Switch
                checked={style.showDeclaration === true}
                onCheckedChange={(checked) => handleStyleChange("showDeclaration", checked)}
              />
            </div>
          </div>

          {style.showDeclaration && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={style.declarationFormat === "simple" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("declarationFormat", "simple")}
                  >
                    Simple
                  </Button>
                  <Button
                    variant={style.declarationFormat === "detailed" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleStyleChange("declarationFormat", "detailed")}
                  >
                    Detailed
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
