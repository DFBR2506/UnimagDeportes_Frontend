import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Gauge,
  Home,
  LogOut,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  SquareStack,
  TimerOff,
  UserRound,
} from 'lucide-react'
import { SidebarProvider } from '@/components/smoothui/sidebar'
import DropdownMenu from '@/components/smoothui/dropdown-menu'
import Avatar from '@/components/smoothui/avatar'
import ContactFab from '@/components/app/ContactDialog'
import Toaster from '@/components/smoothui/toast'
import ConnectionState from '@/components/app/ConnectionState'
import SmoothButton from '@/components/smoothui/smooth-button'
import Spinner from '@/components/smoothui/spinner'
import Logo from '@/components/app/Logo'
import { pageVariants } from '@/lib/anim'
import { resetMobileScroll } from '@/lib/scroll'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

// Mi cuota y Reglas de uso viven dentro de Mis reservas; el contacto es un botón flotante
// (en móvil, un elemento de la barra inferior). `short` es la etiqueta de esa barra.
export const STUDENT_NAV = [
  { to: '/app/inicio', label: 'Inicio', icon: Home },
  { to: '/app/disponibilidad', label: 'Disponibilidad', short: 'Canchas', icon: CalendarDays },
  { to: '/app/mis-reservas', label: 'Mis reservas', short: 'Reservas', icon: ClipboardList },
]

export const ADMIN_NAV = [
  { to: '/admin', label: 'Panel de ocupación', short: 'Panel', icon: Gauge, exact: true },
  { to: '/admin/espacios', label: 'Espacios', icon: SquareStack },
  { to: '/admin/bloqueos', label: 'Bloquear franjas', short: 'Bloqueos', icon: TimerOff },
  { to: '/admin/reglas', label: 'Reglas de uso', short: 'Reglas', icon: ScrollText },
]

const VARIANTS = {
  student: {
    nav: STUDENT_NAV,
    home: '/app/inicio',
    navClass: 'md:flex',
    bottomBarClass: 'md:hidden',
    pageClass: 'max-md:pb-[calc(var(--bottom-bar-space)+1rem)]',
    toasterClass: 'max-md:bottom-[var(--bottom-bar-space)]',
  },
  admin: {
    nav: ADMIN_NAV,
    home: '/admin',
    // cuatro secciones + distintivo ADMIN no caben en md
    navClass: 'lg:flex',
    bottomBarClass: 'lg:hidden',
    pageClass: 'max-lg:pb-[calc(var(--bottom-bar-space)+1rem)]',
    toasterClass: 'max-lg:bottom-[var(--bottom-bar-space)]',
  },
}

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

/** Barra inferior de móvil con las secciones principales. */
function BottomBar({ items, className }) {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <nav
      aria-label="Principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 bg-sidebar pb-[env(safe-area-inset-bottom,0px)] text-sidebar-foreground shadow-[0_-4px_12px_rgb(3_41_79/0.15)] print:hidden',
        className
      )}
    >
      <ul className="mx-auto grid h-16 max-w-xl auto-cols-fr grid-flow-col">
        {items.map((item) => {
          const { to, label, short = label, icon: Icon, onSelect } = item
          const active = Boolean(to) && isActive(location.pathname, item)
          return (
            <li key={to ?? label}>
              <button
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex size-full cursor-pointer flex-col items-center justify-center gap-1 text-[11px] leading-none font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset',
                  active ? 'text-white' : 'text-sidebar-foreground/70'
                )}
                onClick={onSelect ?? (() => navigate(to))}
                type="button"
              >
                {active && (
                  <motion.span
                    className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-sidebar-primary"
                    layoutId="bottombar-indicator"
                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                  />
                )}
                <Icon aria-hidden className={cn('size-5', active && 'text-sidebar-primary')} />
                {short}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Estructura común (RNF-02 móvil primero): topbar azul institucional para
 * estudiantes y administradores; en pantallas pequeñas la navegación va en una barra inferior.
 */
export default function Shell({ variant = 'student' }) {
  const { token, session, logout, isAdmin, sessionNotice, sessionError, retrySession, dataError, dataLoaded, refreshData } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  // useOutlet captura el elemento actual: la página saliente conserva su contenido durante la transición
  // (con <Outlet /> mostraría ya la ruta nueva y se montaría dos veces).
  const outlet = useOutlet()
  const [contactOpen, setContactOpen] = useState(false)

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
      <ConnectionState error={sessionError} onRetry={retrySession} />
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

  const bottomBarItems =
    variant === 'student'
      ? [...config.nav, { label: 'Contacto', icon: MessageCircle, onSelect: () => setContactOpen(true) }]
      : config.nav

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
                  className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 pointer-coarse:py-2 transition-colors hover:bg-white/10 focus-ring"
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
          <AnimatePresence mode="wait" onExitComplete={resetMobileScroll}>
            <motion.div
              key={transitionKey(location.pathname)}
              className={cn('mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10', config.pageClass)}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {dataError || !dataLoaded ? (
                <ConnectionState error={dataError} onRetry={refreshData} label="Cargando datos" retryLabel="Reintentar" />
              ) : outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomBar className={config.bottomBarClass} items={bottomBarItems} />
      {variant === 'student' && <ContactFab open={contactOpen} onOpenChange={setContactOpen} />}
      <Toaster className={config.toasterClass} />
    </SidebarProvider>
  )
}
