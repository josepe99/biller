import { reportsDatasource } from '../lib/datasources/reports.datasource';
import { prisma } from '../lib/prisma';

async function debugDateFiltering() {
  console.log('Debugging date filtering in reports...\n');
  
  try {
    // First, let's see what sales exist in the database
    console.log('=== Database Content Check ===');
    const totalSales = await prisma.sale.count({
      where: { deletedAt: null }
    });
    console.log(`Total sales in database: ${totalSales}`);
    
    if (totalSales > 0) {
      const recentSales = await prisma.sale.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          createdAt: true,
          total: true,
          status: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('Recent sales:');
      recentSales.forEach((sale, index) => {
        console.log(`  ${index + 1}. Sale ${sale.id}: ${sale.total} on ${sale.createdAt.toISOString()} (${sale.status})`);
      });
      
      // Get the date range of all sales
      const dateRange = await prisma.sale.aggregate({
        where: { deletedAt: null },
        _min: { createdAt: true },
        _max: { createdAt: true }
      });
      
      console.log(`\nSales date range: ${dateRange._min.createdAt?.toISOString()} to ${dateRange._max.createdAt?.toISOString()}`);
    }
    
    // Now let's test the filters using a broader date range
    console.log('\n=== Testing Broad Date Range ===');
    const veryOldDate = new Date('2020-01-01');
    const futureDate = new Date('2030-12-31');
    
    console.log(`Testing with range: ${veryOldDate.toISOString()} to ${futureDate.toISOString()}`);
    
    const productSales = await reportsDatasource.getSalesByProduct({
      from: veryOldDate,
      to: futureDate,
      limit: 5
    });
    
    console.log(`Product sales with broad range: ${productSales.length} items`);
    
    // Test without any date filters
    console.log('\n=== Testing Without Date Filters ===');
    const productSalesNoFilter = await reportsDatasource.getSalesByProduct({
      limit: 5
    });
    
    console.log(`Product sales without date filter: ${productSalesNoFilter.length} items`);
    
    if (productSalesNoFilter.length > 0) {
      console.log('Sample results:');
      productSalesNoFilter.forEach((item, index) => {
        console.log(`  ${index + 1}. Product: ${item.name || 'N/A'} (${item.productId})`);
        console.log(`     Quantity: ${item.quantity}, Total: ${item.total}`);
        console.log(`     Last sale: ${item.lastSaleAt ? item.lastSaleAt.toISOString() : 'N/A'}`);
      });
    }
    
    // Let's also test the raw aggregation
    console.log('\n=== Raw Aggregation Test ===');
    const rawResult = await prisma.sale.aggregateRaw({
      pipeline: [
        { $match: { deletedAt: null } },
        { $count: "totalSales" }
      ] as any
    }) as unknown as Array<{ totalSales: number }>;
    
    console.log('Raw aggregation result:', rawResult);
    
  } catch (error) {
    console.error('Error debugging date filtering:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
  }
}

// Run the debug test
debugDateFiltering().then(() => {
  console.log('\nDebug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Debug failed:', error);
  process.exit(1);
});