// Script para verificar y limpiar checkouts con id inválido en MongoDB
// Ejecuta este script con: node scripts/clean-invalid-checkouts.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/pos-system';
const dbName = uri.split('/').pop();

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Checkout');

    // Encuentra checkouts con id inválido
    const invalidCheckouts = await collection.find({
      _id: { $not: { $type: 'objectId' } }
    }).toArray();

    if (invalidCheckouts.length === 0) {
      console.log('✅ Todos los checkouts tienen ObjectId válido.');
      return;
    }

    console.log('❌ Checkouts con id inválido encontrados:');
    invalidCheckouts.forEach(c => console.log(c));

    // Elimina los checkouts con id inválido
    const result = await collection.deleteMany({
      _id: { $not: { $type: 'objectId' } }
    });
    console.log(`🗑️  Eliminados ${result.deletedCount} checkouts con id inválido.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
