"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Calendar, Globe, Star, StarOff, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useTheme } from "next-themes"

const HIJRI_MONTHS = {
  en: [
    "Muharram",
    "Safar",
    "Rabi' al-awwal",
    "Rabi' al-thani",
    "Jumada al-awwal",
    "Jumada al-thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ],
  ar: [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأولى",
    "جمادى الثانية",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ],
}

const GREGORIAN_MONTHS = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
}

const WEEKDAYS_SHORT = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
}

const WEEKDAYS_FULL = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
}

const ARABIC_NUMERALS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

function toArabicNumerals(num: number): string {
  return num
    .toString()
    .split("")
    .map((digit) => ARABIC_NUMERALS[Number.parseInt(digit)])
    .join("")
}

function formatNumber(num: number, language: "en" | "ar"): string {
  return language === "ar" ? toArabicNumerals(num) : num.toString()
}

function gregorianToHijri(date: Date) {
  const gYear = date.getFullYear()
  const gMonth = date.getMonth() + 1
  const gDay = date.getDate()

  let hYear = Math.floor((gYear - 622) * 1.030684 + 0.5)
  let hMonth = Math.floor((gMonth - 1) * 0.970224 + 1)
  let hDay = Math.floor(gDay * 0.970224)

  if (hMonth > 12) {
    hMonth = hMonth - 12
    hYear++
  }
  if (hMonth < 1) {
    hMonth = hMonth + 12
    hYear--
  }
  if (hDay < 1) hDay = 1
  if (hDay > 30) hDay = 30

  return { year: hYear, month: hMonth, day: hDay }
}

function hijriToGregorian(hYear: number, hMonth: number, hDay: number) {
  const gYear = Math.floor((hYear - 1) / 1.030684 + 622)
  const gMonth = Math.floor((hMonth - 1) / 0.970224 + 1)
  const gDay = Math.floor(hDay / 0.970224)

  return new Date(gYear, gMonth - 1, gDay)
}

function getHijriDaysInMonth(year: number, month: number): number {
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]
  return monthLengths[month - 1]
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function TimelyoCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentHijriDate, setCurrentHijriDate] = useState(() => gregorianToHijri(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarType, setCalendarType] = useState<"gregorian" | "hijri">("gregorian")
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showYearPicker, setShowYearPicker] = useState(false)

  const generateYearOptions = () => {
    const currentYear = calendarType === "gregorian" ? new Date().getFullYear() : gregorianToHijri(new Date()).year
    const years = []
    for (let year = currentYear - 100; year <= currentYear + 10; year++) {
      years.push(year)
    }
    return years
  }

  const handleYearChange = (year: number) => {
    if (calendarType === "gregorian") {
      const newDate = new Date(currentDate)
      newDate.setFullYear(year)
      setCurrentDate(newDate)
    } else {
      const newHijriDate = { ...currentHijriDate, year }
      setCurrentHijriDate(newHijriDate)
      const gregorianEquivalent = hijriToGregorian(newHijriDate.year, newHijriDate.month, 1)
      setCurrentDate(gregorianEquivalent)
    }
    setShowYearPicker(false)
  }

  useEffect(() => {
    setMounted(true)
    const savedMarkedDates = localStorage.getItem("timelyo-marked-dates")
    const savedLanguage = localStorage.getItem("timelyo-language")
    const savedCalendarType = localStorage.getItem("timelyo-calendar-type")

    if (savedMarkedDates) {
      setMarkedDates(new Set(JSON.parse(savedMarkedDates)))
    }
    if (savedLanguage) {
      setLanguage(savedLanguage as "en" | "ar")
    } else {
      setLanguage("en")
    }
    if (savedCalendarType) {
      setCalendarType(savedCalendarType as "gregorian" | "hijri")
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("timelyo-marked-dates", JSON.stringify(Array.from(markedDates)))
    }
  }, [markedDates, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("timelyo-language", language)
    }
  }, [language, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("timelyo-calendar-type", calendarType)
    }
  }, [calendarType, mounted])

  useEffect(() => {
    if (calendarType === "hijri") {
      setCurrentHijriDate(gregorianToHijri(currentDate))
    }
  }, [calendarType, currentDate])

  const hijriDate = gregorianToHijri(selectedDate)
  const selectedDateKey = formatDateKey(selectedDate)
  const isSelectedDateMarked = markedDates.has(selectedDateKey)

  const toggleMarkDate = () => {
    const newMarkedDates = new Set(markedDates)
    if (isSelectedDateMarked) {
      newMarkedDates.delete(selectedDateKey)
    } else {
      newMarkedDates.add(selectedDateKey)
    }
    setMarkedDates(newMarkedDates)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (calendarType === "gregorian") {
      const newDate = new Date(currentDate)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setCurrentDate(newDate)
    } else {
      const newHijriDate = { ...currentHijriDate }
      if (direction === "prev") {
        newHijriDate.month -= 1
        if (newHijriDate.month < 1) {
          newHijriDate.month = 12
          newHijriDate.year -= 1
        }
      } else {
        newHijriDate.month += 1
        if (newHijriDate.month > 12) {
          newHijriDate.month = 1
          newHijriDate.year += 1
        }
      }
      setCurrentHijriDate(newHijriDate)
      const gregorianEquivalent = hijriToGregorian(newHijriDate.year, newHijriDate.month, 1)
      setCurrentDate(gregorianEquivalent)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    if (calendarType === "hijri") {
      setCurrentHijriDate(gregorianToHijri(today))
    }
  }

  const renderGregorianCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square m-1"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = formatDateKey(date)
      const isTodayDate = isToday(date)
      const isSelected = selectedDate.toDateString() === date.toDateString()
      const isMarked = markedDates.has(dateKey)

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            aspect-square rounded-xl text-lg font-bold transition-all duration-200 relative flex items-center justify-center min-h-[56px] m-1
            ${
              isSelected
                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                : "hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900 dark:hover:to-pink-900 text-gray-700 dark:text-gray-300"
            }
            ${isTodayDate ? "ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-gray-900" : ""}
            ${
              isMarked && !isSelected
                ? "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-400"
                : ""
            }
          `}
        >
          {formatNumber(day, language)}
          {isMarked && <Star className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500 fill-current" />}
        </button>,
      )
    }

    return days
  }

  const renderHijriCalendar = () => {
    const year = currentHijriDate.year
    const month = currentHijriDate.month
    const daysInMonth = getHijriDaysInMonth(year, month)
    const firstDayGregorian = hijriToGregorian(year, month, 1)
    const firstDay = firstDayGregorian.getDay()

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square m-1"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const gregorianDate = hijriToGregorian(year, month, day)
      const dateKey = formatDateKey(gregorianDate)
      const isTodayDate = isToday(gregorianDate)
      const isSelected = selectedDate.toDateString() === gregorianDate.toDateString()
      const isMarked = markedDates.has(dateKey)

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(gregorianDate)}
          className={`
            aspect-square rounded-xl text-lg font-bold transition-all duration-200 relative flex items-center justify-center min-h-[56px] m-1
            ${
              isSelected
                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                : "hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900 dark:hover:to-pink-900 text-gray-700 dark:text-gray-300"
            }
            ${isTodayDate ? "ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-gray-900" : ""}
            ${
              isMarked && !isSelected
                ? "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-400"
                : ""
            }
          `}
        >
          {formatNumber(day, language)}
          {isMarked && <Star className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500 fill-current" />}
        </button>,
      )
    }

    return days
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 transition-all duration-500 ${language === "ar" ? "rtl" : "ltr"}`}
    >
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Timelyo
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === "en" ? "Dual Calendar System" : "نظام التقويم المزدوج"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-row flex-col">
              <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 rounded-lg p-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-mono">
                  {currentTime.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US")}
                </span>
              </div>


              <Select value={calendarType} onValueChange={(value: "gregorian" | "hijri") => setCalendarType(value)}>
                <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-700/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gregorian">{language === "en" ? "Gregorian" : "ميلادي"}</SelectItem>
                  <SelectItem value="hijri">{language === "en" ? "Hijri" : "هجري"}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={language} onValueChange={(value: "en" | "ar") => setLanguage(value)}>
                <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-700/50 border-0">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-white/50 dark:bg-gray-700/50 border-0 hover:bg-white/80 dark:hover:bg-gray-600/80"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="bg-white/50 dark:bg-gray-700/50 border-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {calendarType === "gregorian"
                            ? GREGORIAN_MONTHS[language][currentDate.getMonth()]
                            : HIJRI_MONTHS[language][currentHijriDate.month - 1]}
                        </h2>
                        <Button
                          variant="ghost"
                          onClick={() => setShowYearPicker(true)}
                          className="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900 px-2 py-1 h-auto"
                        >
                          {formatNumber(
                            calendarType === "gregorian" ? currentDate.getFullYear() : currentHijriDate.year,
                            language,
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {calendarType === "gregorian"
                          ? `${HIJRI_MONTHS[language][hijriDate.month - 1]} ${formatNumber(hijriDate.year, language)} ${language === "en" ? "AH" : "هـ"}`
                          : `${GREGORIAN_MONTHS[language][currentDate.getMonth()]} ${formatNumber(currentDate.getFullYear(), language)}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="bg-white/50 dark:bg-gray-700/50 border-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {calendarType === "gregorian"
                      ? language === "en"
                        ? "Gregorian"
                        : "ميلادي"
                      : language === "en"
                        ? "Hijri"
                        : "هجري"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {WEEKDAYS_SHORT[language].map((day) => (
                    <div
                      key={day}
                      className="aspect-square flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400 min-h-[44px]"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {calendarType === "gregorian" ? renderGregorianCalendar() : renderHijriCalendar()}
                </div>
              </CardContent>
            </Card>
            {showYearPicker && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowYearPicker(false)}
              >
                <Card
                  className="bg-white dark:bg-gray-800 w-96 max-h-96 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center">{language === "en" ? "Select Year" : "اختر السنة"}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-80 overflow-y-auto p-4">
                      <div className="grid grid-cols-4 gap-2">
                        {generateYearOptions().map((year) => (
                          <Button
                            key={year}
                            variant={
                              year ===
                              (calendarType === "gregorian" ? currentDate.getFullYear() : currentHijriDate.year)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleYearChange(year)}
                            className={`${
                              year ===
                              (calendarType === "gregorian" ? currentDate.getFullYear() : currentHijriDate.year)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "hover:bg-purple-100 dark:hover:bg-purple-900"
                            }`}
                          >
                            {formatNumber(year, language)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{language === "en" ? "Selected Date" : "التاريخ المحدد"}</span>
                  {isToday(selectedDate) && (
                    <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs">
                      {language === "en" ? "Today" : "اليوم"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl">
                  <div className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-1">
                    {WEEKDAYS_FULL[language][selectedDate.getDay()]}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {formatNumber(selectedDate.getDate(), language)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {GREGORIAN_MONTHS[language][selectedDate.getMonth()]}{" "}
                    {formatNumber(selectedDate.getFullYear(), language)}
                  </div>
                </div>

                <Button
                  onClick={toggleMarkDate}
                  className={`w-full transition-all duration-200 ${
                    isSelectedDateMarked
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  }`}
                >
                  {isSelectedDateMarked ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      {language === "en" ? "Unmark Date" : "إلغاء العلامة"}
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      {language === "en" ? "Mark Date" : "وضع علامة"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Hijri Date" : "التاريخ الهجري"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl">
                  <div className="text-xl font-bold text-green-800 dark:text-green-200">
                    {formatNumber(hijriDate.day, language)} {HIJRI_MONTHS[language][hijriDate.month - 1]}
                  </div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {formatNumber(hijriDate.year, language)} {language === "en" ? "AH" : "هـ"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Quick Actions" : "إجراءات سريعة"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600"
                >
                  {language === "en" ? "Go to Today" : "اذهب إلى اليوم"}
                </Button>

                {markedDates.size > 0 && (
                  <div className="text-center p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg">
                    <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {language === "en"
                        ? `${markedDates.size} marked date${markedDates.size > 1 ? "s" : ""}`
                        : `${formatNumber(markedDates.size, language)} تاريخ محفوظ`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === "en"
                ? "Timelyo - Your beautiful dual calendar companion"
                : "تايملايو - رفيقك الجميل في التقويم المزدوج"}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
