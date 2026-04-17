"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, UserCheck, X, Phone, MapPin, Car } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"

interface Driver {
  id: string; fullName: string; phone: string; vehicleType: string; vehiclePlate: string;
  vehicleBrandModel: string; baseLocation: string; isVerified: boolean; isAvailable: boolean
}

const mockDrivers: Driver[] = [
  { id: "1", fullName: "Somchai Prasert", phone: "+66 81 234 5678", vehicleType: "Van", vehiclePlate: "กข 1234", vehicleBrandModel: "Toyota Commuter", baseLocation: "Bangkok", isVerified: true, isAvailable: true },
  { id: "2", fullName: "Narong Thongchai", phone: "+66 82 345 6789", vehicleType: "Sedan", vehiclePlate: "ขค 5678", vehicleBrandModel: "Toyota Camry", baseLocation: "Bangkok", isVerified: true, isAvailable: false },
  { id: "3", fullName: "Prasit Wongsa", phone: "+66 83 456 7890", vehicleType: "SUV", vehiclePlate: "คง 9012", vehicleBrandModel: "Toyota Fortuner", baseLocation: "Phuket", isVerified: true, isAvailable: true },
  { id: "4", fullName: "Manop Srisuk", phone: "+66 84 567 8901", vehicleType: "Van", vehiclePlate: "งจ 3456", vehicleBrandModel: "Hyundai H1", baseLocation: "Chiang Mai", isVerified: true, isAvailable: true },
]

export default function DriversPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const filteredDrivers = mockDrivers.filter(driver =>
    driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.baseLocation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Drivers", th: "คนขับ", zh: "司机" })}</h1>
          <span className="text-[13px] text-muted">Verified driver pool</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search drivers..." className="pl-9 w-[200px] h-9 bg-surface" />
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="py-12 text-center"><UserCheck className="w-10 h-10 text-muted/30 mx-auto mb-3" /><p className="text-[14px] font-medium text-foreground">No verified drivers yet</p></div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {filteredDrivers.map((driver, index) => (
            <motion.div key={driver.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedDriver(driver)}
              className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
                  <span className="font-mono text-[13px] text-primary font-medium">{driver.fullName.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{driver.fullName}</div>
                  <div className="text-[11px] text-muted">{driver.baseLocation}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${driver.isAvailable ? "bg-primary-dim text-primary" : "bg-amber-dim text-amber"}`}>
                  {driver.isAvailable ? "Available" : "Busy"}
                </span>
              </div>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-center gap-2 text-muted"><Car className="w-3.5 h-3.5" /><span>{driver.vehicleBrandModel}</span></div>
                <div className="flex items-center gap-2 text-muted"><span className="font-mono">{driver.vehiclePlate}</span><span className="text-muted/50">·</span><span>{driver.vehicleType}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedDriver && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDriver(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.26, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-[440px] bg-surface border-l border-border z-50 overflow-y-auto">
              <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-foreground">Driver Details</h2>
                  <span className="text-[11px] text-muted">View only</span>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-elevated transition-colors">
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-dim flex items-center justify-center">
                    <span className="font-mono text-xl text-primary font-medium">{selectedDriver.fullName.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <div className="text-[18px] font-semibold text-foreground">{selectedDriver.fullName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${selectedDriver.isVerified ? "bg-primary-dim text-primary" : "bg-amber-dim text-amber"}`}>{selectedDriver.isVerified ? "Verified" : "Pending"}</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${selectedDriver.isAvailable ? "bg-green/10 text-green" : "bg-amber-dim text-amber"}`}>{selectedDriver.isAvailable ? "Available" : "Busy"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted mb-1">Phone</div>
                    <div className="flex items-center gap-2 text-[13px] text-foreground"><Phone className="w-4 h-4 text-muted" />{selectedDriver.phone}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted mb-1">Base Location</div>
                    <div className="flex items-center gap-2 text-[13px] text-foreground"><MapPin className="w-4 h-4 text-muted" />{selectedDriver.baseLocation}</div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="font-mono text-[10px] uppercase text-muted mb-3">Vehicle</div>
                    <div className="bg-surface-elevated rounded-lg p-3 space-y-2">
                      {[["Type", selectedDriver.vehicleType], ["Model", selectedDriver.vehicleBrandModel], ["Plate", selectedDriver.vehiclePlate]].map(([label, val]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-[12px] text-muted">{label}</span>
                          <span className={`text-[12px] font-medium text-foreground ${label === "Plate" ? "font-mono" : ""}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}