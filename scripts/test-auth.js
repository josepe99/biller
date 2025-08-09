#!/usr/bin/env node

/**
 * Test script para el sistema de autenticación
 * 
 * Este script prueba las funcionalidades principales del sistema de autenticación:
 * 1. Creación de sesión
 * 2. Validación de sesión
 * 3. Renovación de sesión
 * 4. Limpieza de sesiones expiradas
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { randomBytes } = require('crypto')

const prisma = new PrismaClient()

async function testAuthSystem() {
  try {
    console.log('🔍 Iniciando pruebas del sistema de autenticación...\n')

    // 1. Crear usuario de prueba
    console.log('1. Creando usuario de prueba...')
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test',
        lastname: 'User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Usuario de prueba creado:', testUser.email)

    // 2. Crear sesión de prueba
    console.log('\n2. Creando sesión de prueba...')
    const sessionId = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    const refreshBefore = new Date(Date.now() + 48 * 60 * 1000) // 48 minutos
    
    const testSession = await prisma.session.create({
      data: {
        id: sessionId,
        userId: testUser.id,
        expiresAt,
        refreshBefore,
        userAgent: 'Test Script',
        ipAddress: '127.0.0.1'
      }
    })
    console.log('✅ Sesión creada:', testSession.id.substring(0, 8) + '...')

    // 3. Validar sesión
    console.log('\n3. Validando sesión...')
    const validSession = await prisma.session.findUnique({
      where: { 
        id: sessionId,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            deletedAt: true
          }
        }
      }
    })
    
    if (validSession && !validSession.user.deletedAt) {
      console.log('✅ Sesión válida para usuario:', validSession.user.email)
    } else {
      console.log('❌ Sesión inválida')
    }

    // 4. Renovar sesión
    console.log('\n4. Renovando sesión...')
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const newRefreshBefore = new Date(Date.now() + 48 * 60 * 1000)
    
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: newExpiresAt,
        refreshBefore: newRefreshBefore,
        updatedAt: new Date()
      }
    })
    console.log('✅ Sesión renovada hasta:', updatedSession.expiresAt.toISOString())

    // 5. Comprobar sesiones expiradas
    console.log('\n5. Verificando sesiones expiradas...')
    const expiredSessions = await prisma.session.findMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    console.log(`📊 Sesiones expiradas encontradas: ${expiredSessions.length}`)

    // 6. Limpiar sesión de prueba
    console.log('\n6. Limpiando datos de prueba...')
    await prisma.session.delete({
      where: { id: sessionId }
    })
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Datos de prueba eliminados')

    console.log('\n🎉 ¡Todas las pruebas del sistema de autenticación han pasado!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Función para limpiar sesiones expiradas en producción
async function cleanupExpiredSessions() {
  try {
    console.log('🧹 Limpiando sesiones expiradas...')
    
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    
    console.log(`✅ ${result.count} sesiones expiradas eliminadas`)
  } catch (error) {
    console.error('❌ Error limpiando sesiones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar según el argumento de línea de comandos
const command = process.argv[2]

if (command === 'cleanup') {
  cleanupExpiredSessions()
} else if (command === 'test') {
  testAuthSystem()
} else {
  console.log('Uso:')
  console.log('  node test-auth.js test    - Ejecutar pruebas del sistema')
  console.log('  node test-auth.js cleanup - Limpiar sesiones expiradas')
}
