import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  BarChart3,
  Bus,
  CarFront,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Truck,
  UserCheck,
  Wrench,
  X,
} from "lucide-react"
import {
  Link,
  Navigate,
  Route as RouterRoute,
  Routes,
  useLocation,
} from "react-router"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { LiveMap } from "./components/LiveMap"
import "./App.css"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useDashboard,
  useDrivers,
  useExpenses,
  useFuelLogs,
  useMaintenance,
  useReports,
  useTrips,
  useVehicles,
  useAddVehicle,
  useAddDriver,
  useAddTrip,
  useAddMaintenance,
  useAddFuelLog,
  useAddExpense,
} from "@/hooks/useTransitData"
import { API_BASE_URL, TOKEN_STORAGE_KEY, apiClient } from "@/lib/api"
import { currentUser } from "@/data/mock-data"
import type {
  Driver,
  Expense,
  FuelLog,
  MaintenanceRecord,
  Trip,
  User,
  Vehicle,
} from "@/types/transit"

/* ── Navigation config ─────────────────────────── */

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicles", href: "/vehicles", icon: Truck },
  { label: "Drivers", href: "/drivers", icon: UserCheck },
  { label: "Trips", href: "/trips", icon: Route },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Fuel", href: "/fuel", icon: Fuel },
  { label: "Expenses", href: "/expenses", icon: CircleDollarSign },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

/* ── Auth schema ───────────────────────────────── */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginForm = z.infer<typeof loginSchema>

type AuthState = {
  token: string | null
  user: User | null
}

/* ── Chart palette ─────────────────────────────── */

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#64748b", "#ec4899", "#06b6d4"]

/* ── Status map ────────────────────────────────── */

const statusClassName: Record<string, string> = {
  AVAILABLE: "status status-success",
  ON_TRIP: "status status-info",
  IN_SHOP: "status status-warning",
  RETIRED: "status status-muted",
  OFF_DUTY: "status status-muted",
  SUSPENDED: "status status-danger",
  DRAFT: "status status-muted",
  DISPATCHED: "status status-info",
  COMPLETED: "status status-success",
  CANCELLED: "status status-danger",
  IN_PROGRESS: "status status-warning",
  SCHEDULED: "status status-info",
}

/* ── Utility functions ─────────────────────────── */

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value)
}

/* ── Reusable hook: search ─────────────────────── */

function useSearch<T>(items: T[], fields: Array<keyof T>) {
  const [search, setSearch] = useState("")
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) =>
      fields.some((field) => String(item[field]).toLowerCase().includes(term))
    )
  }, [fields, items, search])
  return { search, setSearch, filtered }
}

/* ── Dark mode hook ────────────────────────────── */

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem("transitops.theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("transitops.theme", dark ? "dark" : "light")
  }, [dark])

  const toggle = useCallback(() => setDark((prev) => !prev), [])
  return { dark, toggle }
}

/* ── Shared small components ───────────────────── */

function StatusBadge({ value }: { value: string }) {
  return <span className={statusClassName[value] ?? "status"}>{value.replace(/_/g, " ")}</span>
}

function DataState({
  isLoading,
  isError,
  empty,
  children,
}: {
  isLoading: boolean
  isError: boolean
  empty: boolean
  children: React.ReactNode
}) {
  if (isLoading) {
    return <div className="state-box">Loading data…</div>
  }
  if (isError) {
    return <div className="state-box">Could not load live data. Showing local fallback.</div>
  }
  if (empty) {
    return <div className="state-box">No records found.</div>
  }
  return children
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{action}</div>}
    </div>
  )
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="search-box">
      <Search size={16} />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  )
}

/* ── Login Page ────────────────────────────────── */

function LoginPage({ onLogin }: { onLogin: (auth: AuthState) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@transitops.com",
      password: "password123",
    },
  })

  const [loginError, setLoginError] = useState("")

  async function submit(data: LoginForm) {
    try {
      setLoginError("")
      const res = await apiClient.post<{ data: { token: string; user: User } }>("/auth/login", data)
      const { token, user } = res.data.data
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      onLogin({ token, user })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setLoginError(error.response?.data?.message || "Invalid credentials or server error")
    }
  }

  return (
    <main className="login-page">
      <section className="login-copy">
        <Badge>TransitOps MVP</Badge>
        <h1>Smart transport operations, from dispatch to profitability.</h1>
        <p>
          Digitize fleet assets, drivers, trips, maintenance, fuel, expenses, and operational analytics in one role-aware ERP workspace.
        </p>
        <div className="login-stats">
          <span>8 modules</span>
          <span>RBAC ready</span>
          <span>Live API fallback</span>
        </div>
      </section>
      <Card className="login-card">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Demo credentials are prefilled for hackathon review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="form-stack" onSubmit={handleSubmit(submit)}>
            <label>
              Email
              <Input {...register("email")} />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </label>
            <label>
              Password
              <Input type="password" {...register("password")} />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </label>
            {loginError && <div className="field-error" style={{ marginBottom: "10px" }}>{loginError}</div>}
            <Button type="submit" size="lg">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

/* ── Shell ─────────────────────────────────────── */

function Shell({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const location = useLocation()
  const { dark, toggle } = useDarkMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prevPath, setPrevPath] = useState(location.pathname)

  // Close sidebar on route change (mobile) — avoids setState in effect
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    if (sidebarOpen) setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/dashboard" className="brand">
          <span className="brand-mark"><Bus size={20} /></span>
          <span>
            TransitOps
            <small>Fleet ERP</small>
          </span>
        </Link>
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.href
            return (
              <Link key={item.href} to={item.href} className={active ? "nav-link active" : "nav-link"}>
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Workspace */}
      <div className="workspace">
        <header className="topbar">
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <strong>{auth.user?.name}</strong>
            <span>{auth.user?.role.replace(/_/g, " ")}</span>
          </div>
          <div className="topbar-actions">
            <Button variant="outline" size="icon" onClick={toggle} aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </header>
        <main className="content">
          <Routes>
            <RouterRoute path="/" element={<Navigate to="/dashboard" replace />} />
            <RouterRoute path="/dashboard" element={<DashboardPage />} />
            <RouterRoute path="/vehicles" element={<VehiclesPage />} />
            <RouterRoute path="/drivers" element={<DriversPage />} />
            <RouterRoute path="/trips" element={<TripsPage />} />
            <RouterRoute path="/maintenance" element={<MaintenancePage />} />
            <RouterRoute path="/fuel" element={<FuelPage />} />
            <RouterRoute path="/expenses" element={<ExpensesPage />} />
            <RouterRoute path="/reports" element={<ReportsPage />} />
            <RouterRoute path="/settings" element={<SettingsPage />} />
            <RouterRoute path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

/* ── KPI Card ──────────────────────────────────── */

function KpiCard({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string | number }) {
  return (
    <Card className="kpi-card">
      <CardContent>
        <span className="kpi-icon"><Icon size={18} /></span>
        <div>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Dashboard ─────────────────────────────────── */

function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()
  const kpis = data?.kpis
  const { data: trips = [] } = useTrips()

  return (
    <section>
      <PageHeader
        title="Operations Dashboard"
        description="Monitor fleet utilization, vehicle availability, dispatch activity, and driver load."
      />
      <DataState isLoading={isLoading} isError={isError} empty={!data}>
        <div className="kpi-grid">
          <KpiCard icon={Truck} label="Total Vehicles" value={kpis?.totalVehicles ?? 0} />
          <KpiCard icon={CarFront} label="Available" value={kpis?.availableVehicles ?? 0} />
          <KpiCard icon={Activity} label="Active Trips" value={kpis?.activeTrips ?? 0} />
          <KpiCard icon={UserCheck} label="Drivers On Duty" value={kpis?.driversOnDuty ?? 0} />
          <KpiCard icon={Wrench} label="In Maintenance" value={kpis?.vehiclesInMaintenance ?? 0} />
          <KpiCard icon={BarChart3} label="Fleet Utilization" value={`${kpis?.fleetUtilization ?? 0}%`} />
        </div>
        <div style={{ marginTop: '24px' }}>
          <LiveMap trips={trips} />
        </div>
        <div className="chart-grid">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
              <CardDescription>Current operational split.</CardDescription>
            </CardHeader>
            <CardContent className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data?.breakdowns.statuses ?? []} dataKey="count" nameKey="status" outerRadius={90} strokeWidth={2}>
                    {(data?.breakdowns.statuses ?? []).map((_item, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Regional Fleet</CardTitle>
              <CardDescription>Vehicle distribution by region.</CardDescription>
            </CardHeader>
            <CardContent className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.breakdowns.regions ?? []}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DataState>
    </section>
  )
}

/* ── Vehicles ──────────────────────────────────── */

function VehiclesPage() {
  const { data = [], isLoading, isError } = useVehicles()
  const { search, setSearch, filtered } = useSearch<Vehicle>(data, ["registration", "name", "type", "region", "status"])

  return (
    <ModulePage
      title="Vehicles"
      description="Master registry with availability and lifecycle status."
      search={<SearchBox value={search} onChange={setSearch} placeholder="Search vehicles" />}
      addButton={<AddVehicleDialog />}
    >
      <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
        <table>
          <thead><tr><th>Registration</th><th>Model</th><th>Type</th><th>Region</th><th>Capacity</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.registration}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.region}</td>
                <td>{formatNumber(vehicle.capacity)} kg</td>
                <td><StatusBadge value={vehicle.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </ModulePage>
  )
}

/* ── Drivers ───────────────────────────────────── */

function DriversPage() {
  const { data = [], isLoading, isError } = useDrivers()
  const { search, setSearch, filtered } = useSearch<Driver>(data, ["name", "licenseNumber", "licenseCategory", "status"])

  return (
    <ModulePage
      title="Drivers"
      description="Compliance, license validity, and safety scores."
      search={<SearchBox value={search} onChange={setSearch} placeholder="Search drivers" />}
      addButton={<AddDriverDialog />}
    >
      <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
        <table>
          <thead><tr><th>Name</th><th>License</th><th>Category</th><th>Expiry</th><th>Safety</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.licenseCategory}</td>
                <td>{driver.expiryDate}</td>
                <td>{driver.safetyScore}</td>
                <td><StatusBadge value={driver.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </ModulePage>
  )
}

/* ── Trips ─────────────────────────────────────── */

function TripsPage() {
  const { data = [], isLoading, isError } = useTrips()
  const { search, setSearch, filtered } = useSearch<Trip>(data, ["source", "destination", "status"])

  return (
    <section>
      <PageHeader
        title="Trips"
        description="Dispatch lifecycle with capacity and assignment controls."
        action={
          <>
            <SearchBox value={search} onChange={setSearch} placeholder="Search trips" />
            <AddTripDialog />
          </>
        }
      />
      <Card>
        <CardContent className="table-card">
          <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <LiveMap trips={filtered} />
            </div>
            <div className="workflow-strip">
              {["Draft", "Dispatch", "On Trip", "Complete", "Restore"].map((step) => <span key={step}>{step}</span>)}
            </div>
            <table>
              <thead><tr><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo</th><th>Distance</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.source} → {trip.destination}</td>
                    <td>{trip.vehicle?.registration ?? trip.vehicleId}</td>
                    <td>{trip.driver?.name ?? trip.driverId}</td>
                    <td>{formatNumber(trip.cargoWeight)} kg</td>
                    <td>{formatNumber(trip.distance)} km</td>
                    <td><StatusBadge value={trip.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataState>
        </CardContent>
      </Card>
    </section>
  )
}

/* ── Maintenance ───────────────────────────────── */

function MaintenancePage() {
  const { data = [], isLoading, isError } = useMaintenance()
  const { search, setSearch, filtered } = useSearch<MaintenanceRecord>(data, ["description", "status"])

  return (
    <section>
      <PageHeader
        title="Maintenance"
        description="Active maintenance removes vehicles from dispatch selection."
        action={
          <>
            <SearchBox value={search} onChange={setSearch} placeholder="Search maintenance" />
            <AddMaintenanceDialog />
          </>
        }
      />
      <Card>
        <CardContent className="table-card">
          <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
            <RecordCards records={filtered} kind="maintenance" />
          </DataState>
        </CardContent>
      </Card>
    </section>
  )
}

/* ── Fuel ──────────────────────────────────────── */

function FuelPage() {
  const { data = [], isLoading, isError } = useFuelLogs()
  const { search, setSearch, filtered } = useSearch<FuelLog>(data, ["loggedAt"])

  return (
    <section>
      <PageHeader
        title="Fuel"
        description="Fuel logging for vehicles and optional trip attribution."
        action={
          <>
            <SearchBox value={search} onChange={setSearch} placeholder="Search fuel logs" />
            <AddFuelDialog />
          </>
        }
      />
      <Card>
        <CardContent className="table-card">
          <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
            <RecordCards records={filtered} kind="fuel" />
          </DataState>
        </CardContent>
      </Card>
    </section>
  )
}

/* ── Expenses ──────────────────────────────────── */

function ExpensesPage() {
  const { data = [], isLoading, isError } = useExpenses()
  const { search, setSearch, filtered } = useSearch<Expense>(data, ["category", "notes"])

  return (
    <section>
      <PageHeader
        title="Expenses"
        description="Track tolls, maintenance, and operational costs by vehicle."
        action={
          <>
            <SearchBox value={search} onChange={setSearch} placeholder="Search expenses" />
            <AddExpenseDialog />
          </>
        }
      />
      <Card>
        <CardContent className="table-card">
          <DataState isLoading={isLoading} isError={isError} empty={filtered.length === 0}>
            <RecordCards records={filtered} kind="expense" />
          </DataState>
        </CardContent>
      </Card>
    </section>
  )
}

/* ── Reports ───────────────────────────────────── */

function ReportsPage() {
  const { data, isLoading, isError } = useReports()

  function handleExport() {
    window.open(`${API_BASE_URL}/reports/export.csv`, "_blank")
  }

  return (
    <section>
      <PageHeader
        title="Reports"
        description="Fuel efficiency, operating cost, and vehicle ROI."
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
        }
      />
      <DataState isLoading={isLoading} isError={isError} empty={!data}>
        <div className="kpi-grid report-summary">
          <KpiCard icon={Truck} label="Vehicles" value={data?.summary.vehicleCount ?? 0} />
          <KpiCard icon={Fuel} label="Fuel Cost" value={formatMoney(data?.summary.fuelCost ?? 0)} />
          <KpiCard icon={Wrench} label="Maintenance" value={formatMoney(data?.summary.maintenanceCost ?? 0)} />
          <KpiCard icon={CircleDollarSign} label="Operational Cost" value={formatMoney(data?.summary.operationalCost ?? 0)} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle ROI</CardTitle>
            <CardDescription>Revenue minus fuel and maintenance over acquisition cost.</CardDescription>
          </CardHeader>
          <CardContent className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.vehicles ?? []}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="registration" />
                <YAxis />
                <Tooltip />
                <Line dataKey="roi" stroke="#6366f1" strokeWidth={3} dot />
                <Line dataKey="fuelEfficiency" stroke="#22c55e" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </DataState>
    </section>
  )
}

/* ── Settings ──────────────────────────────────── */

function SettingsPage() {
  return (
    <section>
      <PageHeader title="Settings" description="Operational preferences for roles, regions, and deployment readiness." />
      <div className="settings-grid">
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access</CardTitle>
            <CardDescription>Four roles enforced by API middleware.</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span><ShieldCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Fleet Manager — full access</span>
              <span><UserCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Driver — trips and profile</span>
              <span><ClipboardCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Safety Officer — compliance and reports</span>
              <span><CircleDollarSign size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Financial Analyst — expenses and reports</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Backend connectivity status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <span><strong>Base URL:</strong> {API_BASE_URL}</span>
              <span><strong>Database:</strong> PostgreSQL via Prisma 6</span>
              <span><strong>Auth:</strong> JWT with stateless logout</span>
              <span><strong>Fallback:</strong> Local mock data when API is unreachable</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
            <CardDescription>Planned targets for production.</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <span>Frontend → Vercel</span>
              <span>Backend → Render or Railway</span>
              <span>Database → Hosted PostgreSQL</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

/* ── Module Page Layout ────────────────────────── */

function ModulePage({
  title,
  description,
  search,
  addButton,
  children,
}: {
  title: string
  description: string
  search?: React.ReactNode
  addButton?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <PageHeader
        title={title}
        description={description}
        action={
          <>
            {search}
            {addButton}
          </>
        }
      />
      <Card>
        <CardContent className="table-card">
          {children}
        </CardContent>
      </Card>
    </section>
  )
}

/* ── Record Cards ──────────────────────────────── */

function RecordCards({ records, kind }: { records: Array<MaintenanceRecord | FuelLog | Expense>; kind: "maintenance" | "fuel" | "expense" }) {
  return (
    <div className="record-grid">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <CardTitle>
              {kind === "maintenance" && (record as MaintenanceRecord).description}
              {kind === "fuel" && `${(record as FuelLog).liters} liters`}
              {kind === "expense" && (record as Expense).category}
            </CardTitle>
            <CardDescription>{record.vehicle?.registration ?? record.vehicleId}</CardDescription>
          </CardHeader>
          <CardContent>
            {kind === "maintenance" && <StatusBadge value={(record as MaintenanceRecord).status} />}
            {kind === "fuel" && <strong>{formatMoney((record as FuelLog).cost)}</strong>}
            {kind === "expense" && <strong>{formatMoney((record as Expense).amount)}</strong>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ── Add Dialogs (CRUD create stubs) ───────────── */

function AddVehicleDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddVehicle()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.capacity) data.capacity = Number(data.capacity)
    if (data.purchaseCost) data.purchaseCost = Number(data.purchaseCost)
    if (data.odometer) data.odometer = Number(data.odometer)

    mutate(data, {
      onSuccess: () => {
        toast.success("Vehicle added successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to add vehicle: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> Add Vehicle</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>Register a new vehicle in the fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <div className="form-row">
              <label>Registration <Input name="registration" required placeholder="GJ-01-XX-0000" /></label>
              <label>Name / Model <Input name="name" required placeholder="Tata Ultra 1014" /></label>
            </div>
            <div className="form-row">
              <label>Type <Input name="type" required placeholder="Truck, Van, Bus…" /></label>
              <label>Region <Input name="region" required placeholder="Ahmedabad" /></label>
            </div>
            <div className="form-row">
              <label>Capacity (kg) <Input name="capacity" type="number" required placeholder="4200" /></label>
              <label>Purchase Cost (₹) <Input name="purchaseCost" type="number" required placeholder="2450000" /></label>
            </div>
            <label>Odometer (km) <Input name="odometer" type="number" required placeholder="0" /></label>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Vehicle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddDriverDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddDriver()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.safetyScore) data.safetyScore = Number(data.safetyScore)

    mutate(data, {
      onSuccess: () => {
        toast.success("Driver added successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to add driver: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> Add Driver</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
          <DialogDescription>Register a new driver.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <div className="form-row">
              <label>Full Name <Input name="name" required placeholder="Alex Fernandes" /></label>
              <label>Phone <Input name="phone" required placeholder="+91 98765 12001" /></label>
            </div>
            <div className="form-row">
              <label>License Number <Input name="licenseNumber" required placeholder="GJ2026ALEX" /></label>
              <label>License Category <Input name="licenseCategory" required placeholder="HMV, LMV, Transport" /></label>
            </div>
            <div className="form-row">
              <label>License Expiry <Input name="expiryDate" type="date" required /></label>
              <label>Safety Score <Input name="safetyScore" type="number" required placeholder="100" min="0" max="100" /></label>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Driver"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddTripDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddTrip()
  const { data: vehicles } = useVehicles()
  const { data: drivers } = useDrivers()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.cargoWeight) data.cargoWeight = Number(data.cargoWeight)
    if (data.distance) data.distance = Number(data.distance)

    mutate(data, {
      onSuccess: () => {
        toast.success("Trip drafted successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to draft trip: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> New Trip</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Trip</DialogTitle>
          <DialogDescription>Draft a new trip for dispatch.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <div className="form-row">
              <label>Source <Input name="source" required placeholder="Pune Warehouse" /></label>
              <label>Destination <Input name="destination" required placeholder="Mumbai Central Hub" /></label>
            </div>
            <div className="form-row">
              <label>Cargo Weight (kg) <Input name="cargoWeight" type="number" required placeholder="3200" /></label>
              <label>Distance (km) <Input name="distance" type="number" required placeholder="156" /></label>
            </div>
            <div className="form-row">
              <label>Vehicle <select name="vehicleId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a vehicle...</option>{vehicles?.filter(v => v.status === "AVAILABLE").map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration})</option>)}</select></label>
              <label>Driver <select name="driverId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a driver...</option>{drivers?.filter(d => d.status === "AVAILABLE").map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Draft"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddMaintenanceDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddMaintenance()
  const { data: vehicles } = useVehicles()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.cost) data.cost = Number(data.cost)

    mutate(data, {
      onSuccess: () => {
        toast.success("Maintenance logged successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to log maintenance: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> Log Maintenance</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Maintenance</DialogTitle>
          <DialogDescription>Create a maintenance record. The vehicle will be marked IN_SHOP.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <label>Vehicle <select name="vehicleId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a vehicle...</option>{vehicles?.filter(v => v.status === "AVAILABLE" || v.status === "IN_SHOP").map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration})</option>)}</select></label>
            <label>Description <Textarea name="description" required placeholder="Oil change and cooling unit inspection" /></label>
            <label>Estimated Cost (₹) <Input name="cost" type="number" required placeholder="14200" /></label>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddFuelDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddFuelLog()
  const { data: vehicles } = useVehicles()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.liters) data.liters = Number(data.liters)
    if (data.cost) data.cost = Number(data.cost)
    if (data.mileage) data.mileage = Number(data.mileage)
    if (!data.tripId) delete data.tripId
    if (!data.tripId) delete data.tripId

    mutate(data, {
      onSuccess: () => {
        toast.success("Fuel logged successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to log fuel: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> Log Fuel</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Fuel</DialogTitle>
          <DialogDescription>Record fuel consumption for a vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <div className="form-row">
              <label>Vehicle <select name="vehicleId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a vehicle...</option>{vehicles?.filter(v => v.status !== "RETIRED").map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration})</option>)}</select></label>
              <label>Trip ID (optional) <Input name="tripId" placeholder="trip-1" /></label>
            </div>
            <div className="form-row">
              <label>Liters <Input name="liters" type="number" required placeholder="62" /></label>
              <label>Cost (₹) <Input name="cost" type="number" required placeholder="6080" /></label>
            </div>
            <label>Mileage (km/L) <Input name="mileage" type="number" required placeholder="8.2" /></label>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddExpenseDialog() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAddExpense()
  const { data: vehicles } = useVehicles()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(fd as any)
    if (data.amount) data.amount = Number(data.amount)
    if (!data.notes) delete data.notes

    mutate(data, {
      onSuccess: () => {
        toast.success("Expense added successfully")
        setOpen(false)
      },
      onError: (err) => {
        toast.error("Failed to add expense: " + String(err))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} /> Add Expense</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Track an operational expense for a vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="dialog-form">
            <div className="form-row">
              <label>Vehicle <select name="vehicleId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a vehicle...</option>{vehicles?.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration})</option>)}</select></label>
              <label>Category <Input name="category" required placeholder="Toll, Repair, Insurance…" /></label>
            </div>
            <label>Amount (₹) <Input name="amount" type="number" required placeholder="1850" /></label>
            <label>Notes <Textarea name="notes" placeholder="Expressway toll" /></label>
            <label>Expense Date <Input name="expenseDate" type="date" required /></label>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ── App Root ──────────────────────────────────── */

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem(TOKEN_STORAGE_KEY),
    user: localStorage.getItem(TOKEN_STORAGE_KEY) ? currentUser : null,
  }))

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setAuth({ token: null, user: null })
  }

  if (!auth.token || !auth.user) {
    return <LoginPage onLogin={setAuth} />
  }

  return <Shell auth={auth} onLogout={logout} />
}
