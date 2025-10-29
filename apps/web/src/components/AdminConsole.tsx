import React, { useEffect, useState } from 'react';
import {
  type LucideIcon,
  Activity,
  CheckCircle2,
  ClipboardList,
  Database,
  KeyRound,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { auth } from '../lib/api';
import { normalizeRole } from '../lib/roles';
import AdminUserManager from './AdminUserManager';
import InventoryPermissionManager from './InventoryPermissionManager';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  org_unit_id: string;
  org_unit_nombre: string;
}

const AdminConsole: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let storedToken: string | null = null;

    try {
      storedToken = window.localStorage.getItem('access_token');
    } catch (storageError) {
      console.error('No se pudo leer el token desde el almacenamiento local:', storageError);
    }

    if (!storedToken) {
      setError('Tu sesión ha expirado. Inicia sesión nuevamente para acceder al centro administrativo.');
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadProfile = async () => {
      try {
        const data = await auth.getProfile();
        if (!isActive) {
          return;
        }
        setProfile(data);
      } catch (err: any) {
        if (!isActive) {
          return;
        }
        const detail = err?.message || 'No se pudo cargar el perfil del usuario.';
        setError(detail);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!error || typeof window === 'undefined') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        window.location.replace('/login');
      } catch (redirectError) {
        console.error('No se pudo redirigir al inicio de sesión:', redirectError);
      }
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [error]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <p className="text-lg font-semibold">{error}</p>
        <p className="mt-2 text-sm text-red-600">Vuelve a iniciar sesión para acceder al centro administrativo.</p>
        <a
          href="/login"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Ir al inicio de sesión
        </a>
      </div>
    );
  }

  const normalizedRole = normalizeRole(profile?.rol);

  if (!profile || normalizedRole !== 'LIDER_TI') {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
        <h2 className="text-2xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">
          Solo los usuarios con rol <span className="font-semibold">LÍDER_TI</span> pueden ingresar al centro de administración global.
        </p>
        <a
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
        >
          Volver al dashboard
        </a>
      </div>
    );
  }

  const quickActions = [
    {
      href: '/inventory/admin',
      title: 'Panel de inventario',
      description: 'Gestiona el parque tecnológico y da seguimiento a cada equipo.',
      icon: ShieldCheck,
    },
    {
      href: '/inventory/new',
      title: 'Ingresar dispositivo',
      description: 'Registra nuevos activos con trazabilidad y control de auditoría.',
      icon: Activity,
    },
    {
      href: '/helpdesk',
      title: 'HelpDesk TI',
      description: 'Supervisa los tickets y asigna tareas al equipo de soporte.',
      icon: ClipboardList,
    },
    {
      href: '/backups',
      title: 'Backups & Resguardo',
      description: 'Consulta las copias de seguridad y evidencias de cumplimiento.',
      icon: Shield,
    },
  ];

  const capabilitySections: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
    items: string[];
  }> = [
    {
      title: 'Gobernanza del inventario',
      description:
        'Controla el ciclo de vida de los activos tecnológicos, asegurando registros completos y trazables.',
      icon: ShieldCheck,
      items: [
        'Supervisar las altas, bajas y transferencias de dispositivos críticos.',
        'Definir responsables por unidad organizacional y monitorear su cumplimiento.',
        'Auditar el historial de movimientos y la asignación de custodios.',
      ],
    },
    {
      title: 'Gestión de accesos y roles',
      description: 'Administra quién puede ver y modificar la información sensible del sistema.',
      icon: KeyRound,
      items: [
        'Crear, actualizar o suspender cuentas de usuarios internos y externos.',
        'Delegar permisos temporales sobre el inventario y revocarlos en tiempo real.',
        'Homologar roles para mantener políticas de seguridad consistentes.',
      ],
    },
    {
      title: 'Operación del HelpDesk',
      description: 'Coordina la atención de incidencias y prioriza las necesidades del colegio.',
      icon: ClipboardList,
      items: [
        'Supervisar la bandeja de tickets y asignar responsables del soporte.',
        'Dar seguimiento al estado de resolución y confirmar la satisfacción del usuario.',
        'Analizar tendencias para planificar mantenimientos preventivos.',
      ],
    },
    {
      title: 'Continuidad y cumplimiento',
      description: 'Garantiza la disponibilidad de la información y la alineación con auditorías.',
      icon: Database,
      items: [
        'Revisar respaldos automáticos y validar su integridad.',
        'Documentar planes de contingencia y planes de recuperación ante desastres.',
        'Generar reportes ejecutivos para inspecciones o comités directivos.',
      ],
    },
  ];
  
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <header className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-100">Centro de control global</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Bienvenido, {profile.nombre}</h1>
            <p className="mt-3 max-w-2xl text-blue-100">
              Desde este panel puedes coordinar la operación tecnológica del colegio: usuarios, accesos al inventario,
              y los permisos críticos para mantener la infraestructura bajo control.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-white/10 px-6 py-4 text-blue-50 backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Rol: Líder TI
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Unidad organizacional</p>
              <p className="text-sm text-blue-100">{profile.org_unit_nombre || 'Administración central'}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
              <action.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{action.description}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
              Ingresar
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        ))}
      </section>

      <section aria-labelledby="admin-capabilities" className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 id="admin-capabilities" className="text-2xl font-semibold text-gray-900">
            Capacidades del administrador
          </h2>
          <p className="text-sm text-gray-600">
            El rol de LÍDER_TI concentra las funciones estratégicas de la plataforma. Utiliza este resumen para consultar
            rápidamente todo lo que puedes gestionar dentro del ecosistema Gemelli IT.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {capabilitySections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                key={section.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      
      <AdminUserManager />

      <section id="permisos" className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
                <Users className="h-6 w-6 text-blue-600" />
                Delegación de permisos de inventario
              </h2>
              <p className="text-sm text-gray-600">
                Autoriza accesos excepcionales al inventario para personal externo al equipo de TI y revoca permisos en tiempo real.
              </p>
            </div>
          </div>
        </div>
        <InventoryPermissionManager />
      </section>
    </div>
  );
};

export default AdminConsole;
