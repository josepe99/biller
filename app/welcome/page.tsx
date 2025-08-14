import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, ShoppingCart, Package, Users } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-blue-600"></div>
              <h1 className="text-2xl font-bold text-gray-900">Biller</h1>
            </div>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Punto de Venta Moderno
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gestiona tu negocio de manera eficiente con nuestro sistema integral de ventas, 
            inventario y administración. Diseñado para ser fácil de usar y potente.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Ventas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Procesa ventas de manera rápida y eficiente con una interfaz intuitiva
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Gestión de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Controla tu stock en tiempo real y recibe alertas de productos bajos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <LayoutDashboard className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Dashboard Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualiza métricas importantes y reportes de tu negocio
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Multi-Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema con roles y permisos para diferentes tipos de usuarios
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">¿Listo para empezar?</CardTitle>
              <CardDescription>
                Accede al sistema con tus credenciales para comenzar a gestionar tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button size="lg" className="px-8">
                  Acceder al Sistema
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Biller. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
