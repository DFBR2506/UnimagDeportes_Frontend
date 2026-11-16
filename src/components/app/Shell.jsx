import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Gauge,
  Home,
  LogOut,
  Menu,
  ScrollText,
  ShieldCheck,
  SquareStack,
  TimerOff,
  UserRound,
} from 'lucide-react'
import { SidebarMenuButton, SidebarProvider } from '@/components/smoothui/sidebar'
import Drawer from '@/components/smoothui/drawer'
import DropdownMenu from '@/components/smoothui/dropdown-menu'
import Avatar from '@/components/smoothui/avatar'
import ContactFab from '@/components/app/ContactDialog'
import Toaster from '@/components/smoothui/toast'
import Spinner from '@/components/smoothui/spinner'
import SmoothButton from '@/components/smoothui/smooth-button'
import Logo from '@/components/app/Logo'
import { pageVariants } from '@/lib/anim'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

// Mi cuota y Reglas de uso viven dentro de Mis reservas; el contacto es un botón flotante.
export const STUDENT_NAV = [
  { to: '/app/inicio', label: 'Inicio', icon: Home },
  { to: '/app/disponibilidad', label: 'Disponibilidad', icon: CalendarDays },
  { to: '/app/mis-reservas', label: 'Mis reservas', icon: ClipboardList },
]

export const ADMIN_NAV = [
  { to: '/admin', label: 'Panel de ocupación', icon: Gauge, exact: true },
  { to: '/admin/espacios', label: 'Espacios', icon: SquareStack },
  { to: '/admin/bloqueos', label: 'Bloquear franjas', icon: TimerOff },
  { to: '/admin/reglas', label: 'Reglas de uso', icon: ScrollText },
]

const VARIANTS = {
  student: {
    nav: STUDENT_NAV,
    home: '/app/inicio',
    navClass: 'md:flex',
    burgerClass: 'md:hidden',
  },
  admin: {
    nav: ADMIN_NAV,
    home: '/admin',
    // cuatro secciones + distintivo ADMIN no caben en md
    navClass: 'lg:flex',
    burgerClass: 'lg:hidden',
  },
}

const navButtonClass = (active) =>
  cn(
    'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring',
    active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
  )

const isActive = (pathname, { to, exact }) =>
  exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

/** Las subsecciones con barra flotante comparten layout: no animar toda la página entre ellas. */
const transitionKey = (pathname) => {
  if (/^\/app\/mis-reservas(\/(cuota|reglas))?$/.test(pathname)) return '/app/mis-reservas'
  if (/^\/admin\/espacios(\/(qr|implementos))?$/.test(pathname)) return '/admin/espacios'
  return pathname
}

function TopNav({ items, className }) {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <nav aria-label="Principal" className={cn('hidden h-full items-center gap-1', className)}>
      {items.map((item) => {
        const { to, label, icon: Icon } = item
        const active = isActive(location.pathname, item)
        return (
          <button
            key={to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-full cursor-pointer items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-300 focus-ring xl:px-4',
              active ? 'text-white' : 'text-sidebar-foreground/70 hover:text-white'
            )}
            onClick={() => navigate(to)}
            type="button"
          >
            <Icon className="size-4" />
            {label}
            {active && (
              <motion.span
                className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-sidebar-primary"
                layoutId="topnav-indicator"
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function MobileTopNav({ items, extra, className }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const go = (fn) => {
    fn()
    setOpen(false)
  }
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      side="left"
      title="Unimag Deportes"
      className="bg-sidebar text-sidebar-foreground"
      trigger={
        <SmoothButton
          aria-label="Abrir menú"
          className={cn('text-white hover:bg-white/10', className)}
          size="icon-sm"
          variant="ghost"
        >
          <Menu />
        </SmoothButton>
      }
    >
      <div className="flex min-h-[60vh] flex-col gap-1 pb-4">
        {items.map((item) => {
          const { to, label, icon: Icon } = item
          const active = isActive(location.pathname, item)
          return (
            <SidebarMenuButton
              key={to}
              active={active}
              className={navButtonClass(active)}
              icon={<Icon />}
              onClick={() => go(() => navigate(to))}
            >
              {label}
            </SidebarMenuButton>
          )
        })}
        <div className="mt-auto flex flex-col gap-1">
          {extra.map(({ key, label, icon, onSelect }) => (
            <SidebarMenuButton
              key={key}
              className={navButtonClass(false)}
              icon={icon}
              onClick={() => go(onSelect)}
            >
              {label}
            </SidebarMenuButton>
          ))}
        </div>
      </div>
    </Drawer>
  )
}

/**
 * Estructura común (RNF-02 móvil primero): topbar azul institucional para
 * estudiantes y administradores; en pantallas pequeñas la navegación va en un drawer.
 */
export default function Shell({ variant = 'student' }) {
  const { token, session, logout, isAdmin, sessionNotice } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // Sin token: al acceso, recordando el destino (RN-34, RN-56: tras vencer, se vuelve a la pantalla de origen).
  if (!token) {
    return (
      <Navigate
        to={sessionNotice === 'expired' ? '/acceso' : '/bienvenida'}
        replace
        state={{ from: location.pathname }}
      />
    )
  }
  // Token guardado pero aún sin GET /me.
  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner aria-label="Cargando tu sesión" className="text-accent-ink" size="lg" />
      </div>
    )
  }
  if (session.needsName) {
    return <Navigate to="/acceso/nombre" replace state={{ from: location.pathname }} />
  }
  // RN-60: el rol lo asigna el backend (APP_AUTH_ADMIN_EMAILS).
  if (variant === 'admin' && !isAdmin) {
    return <Navigate to="/app/inicio" replace />
  }

  const config = VARIANTS[variant]

  const onLogout = async () => {
    await logout()
    navigate('/bienvenida')
  }

  const initials = session.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  // acciones de cuenta: cambio de rol + cerrar sesión
  const accountActions = [
    ...(variant === 'student' && isAdmin
      ? [{ key: 'admin', label: 'Modo administrador', icon: <ShieldCheck className="size-4" />, onSelect: () => navigate('/admin') }]
      : []),
    ...(variant === 'admin'
      ? [{ key: 'student', label: 'Ver como estudiante', icon: <UserRound className="size-4" />, onSelect: () => navigate('/app/inicio') }]
      : []),
    { key: 'logout', label: 'Cerrar sesión', icon: <LogOut className="size-4" />, onSelect: onLogout },
  ]

  const userMenu = [
    { key: 'email', groupLabel: variant === 'admin' ? `Administrador · ${session.email}` : session.email },
    { key: 'sep', separator: true },
    ...accountActions.map((a) => (a.key === 'logout' ? { ...a, variant: 'destructive' } : a)),
  ]

  return (
    <SidebarProvider>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground shadow-md shadow-sidebar/20 print:hidden">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:px-8">
            <MobileTopNav className={config.burgerClass} extra={accountActions} items={config.nav} />
            <button className="cursor-pointer rounded-md focus-ring" onClick={() => navigate(config.home)} type="button">
              <Logo className="text-base text-white" />
            </button>
            {variant === 'admin' && (
              <span className="hidden rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sidebar-primary uppercase sm:inline">
                Admin
              </span>
            )}
            <div className="ml-4 hidden h-full sm:block xl:ml-6">
              <TopNav className={config.navClass} items={config.nav} />
            </div>
            <div className="ml-auto">
              <DropdownMenu align="end" items={userMenu}>
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-white/10 focus-ring"
                  type="button"
                >
                  <Avatar
                    alt={session.name}
                    className="rounded-full bg-sidebar-primary font-semibold text-sidebar-primary-foreground [&_*]:rounded-full [&_*]:bg-transparent [&_*]:text-sidebar-primary-foreground"
                    fallback={initials}
                    size="sm"
                  />
                  <span className="hidden max-w-40 truncate text-sm font-medium xl:block">{session.name}</span>
                  <ChevronDown className="size-4 opacity-70" />
                </button>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={transitionKey(location.pathname)}
              className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {variant === 'student' && <ContactFab />}
      <Toaster />
    </SidebarProvider>
  )
}
