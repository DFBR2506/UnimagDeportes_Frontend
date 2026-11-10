import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  Gauge,
  Home,
  LogOut,
  Mail,
  Menu,
  QrCode,
  ScrollText,
  ShieldCheck,
  SquareStack,
  TimerOff,
  UserRound,
} from 'lucide-react'
import Sidebar, {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/smoothui/sidebar'
import Drawer from '@/components/smoothui/drawer'
import Toaster from '@/components/smoothui/toast'
import SmoothButton from '@/components/smoothui/smooth-button'
import Logo from '@/components/app/Logo'
import { pageVariants } from '@/lib/anim'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

export const STUDENT_NAV = [
  { to: '/app/inicio', label: 'Inicio', icon: Home },
  { to: '/app/disponibilidad', label: 'Disponibilidad', icon: CalendarDays },
  { to: '/app/mis-reservas', label: 'Mis reservas', icon: ClipboardList },
  { to: '/app/mi-cuota', label: 'Mi cuota', icon: Gauge },
  { to: '/app/reglas', label: 'Reglas de uso', icon: ScrollText },
  { to: '/app/contacto', label: 'Contactar administrador', icon: Mail },
]

export const ADMIN_NAV = [
  { to: '/admin', label: 'Panel de ocupación', icon: Gauge },
  { to: '/admin/espacios', label: 'Espacios y franjas', icon: SquareStack },
  { to: '/admin/bloqueos', label: 'Bloquear franjas', icon: TimerOff },
  { to: '/admin/reglas', label: 'Reglas de uso', icon: ScrollText },
  { to: '/admin/qr', label: 'Generar QR', icon: QrCode },
]

const navButtonClass = (active) =>
  cn(
    'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring',
    active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
  )

function NavList({ items, onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <SidebarMenu>
      {items.map(({ to, label, icon: Icon }) => {
        const active =
          to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)
        return (
          <SidebarMenuItem key={to}>
            <SidebarMenuButton
              active={active}
              className={navButtonClass(active)}
              icon={<Icon />}
              onClick={() => {
                navigate(to)
                onNavigate?.()
              }}
            >
              {label}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function MobileNav({ items, footer }) {
  const [open, setOpen] = useState(false)
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
          className="md:hidden"
          size="icon-sm"
          variant="ghost"
        >
          <Menu />
        </SmoothButton>
      }
    >
      <div className="flex min-h-[60vh] flex-col gap-2 pb-4">
        <NavList items={items} onNavigate={() => setOpen(false)} />
        <div className="mt-auto">{footer}</div>
      </div>
    </Drawer>
  )
}

/**
 * Estructura común (RNF-02 móvil primero): barra superior en móvil,
 * barra lateral azul institucional en escritorio.
 */
export default function Shell({ variant = 'student' }) {
  const { session, logout, isAdmin } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/bienvenida" replace state={{ from: location.pathname }} />
  }
  if (!session.name) {
    return <Navigate to="/acceso/nombre" replace />
  }
  // RN-60: el rol de administrador se asigna a correos específicos.
  if (variant === 'admin' && !isAdmin) {
    return <Navigate to="/app/inicio" replace />
  }

  const items = variant === 'admin' ? ADMIN_NAV : STUDENT_NAV

  const footer = (
    <div className="flex flex-col gap-1">
      {variant === 'student' && isAdmin && (
        <SidebarMenuButton
          className={navButtonClass(false)}
          icon={<ShieldCheck />}
          onClick={() => navigate('/admin')}
        >
          Modo administrador
        </SidebarMenuButton>
      )}
      {variant === 'admin' && (
        <SidebarMenuButton
          className={navButtonClass(false)}
          icon={<UserRound />}
          onClick={() => navigate('/app/inicio')}
        >
          Ver como estudiante
        </SidebarMenuButton>
      )}
      <SidebarMenuButton
        className={navButtonClass(false)}
        icon={<LogOut />}
        onClick={() => {
          logout()
          navigate('/bienvenida')
        }}
      >
        Cerrar sesión
      </SidebarMenuButton>
      <p className="truncate px-2.5 pt-2 text-xs text-sidebar-foreground/50">
        {variant === 'admin' ? 'Administrador' : session.email}
      </p>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar className="hidden border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
          <SidebarHeader className="h-16 px-4">
            <Logo className="text-base text-sidebar-foreground" />
          </SidebarHeader>
          <SidebarContent className="px-2 pt-4">
            <NavList items={items} />
          </SidebarContent>
          <SidebarFooter className="border-sidebar-border px-2 pb-4">{footer}</SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-card/60 px-4 backdrop-blur md:hidden">
            <MobileNav items={items} footer={footer} />
            <Logo className="text-sm text-foreground [&>span:last-child]:text-amber-ink" />
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12"
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
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
