import { reportsDatasource } from '../lib/datasources/reports.datasource';

async function testDateFiltering() {
  console.log('Testing date filtering in reports...\n');
  
  try {
    // Test 1: Get sales for a specific date range
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log('Test 1: Sales by product with date range filter');
    console.log(`From: ${lastWeek.toISOString()}`);
    console.log(`To: ${today.toISOString()}\n`);
    
    const productSales = await reportsDatasource.getSalesByProduct({
      from: lastWeek,
      to: today,
      limit: 5
    });
    
    console.log('Product sales results:', productSales.length, 'items');
    productSales.forEach((item, index) => {
      console.log(`  ${index + 1}. Product: ${item.name || 'N/A'} (${item.productId})`);
      console.log(`     Quantity: ${item.quantity}, Total: ${item.total}`);
      console.log(`     Last sale: ${item.lastSaleAt ? item.lastSaleAt.toISOString() : 'N/A'}\n`);
    });
    
    // Test 2: Get sales by user with date range
    console.log('\nTest 2: Sales by user with date range filter');
    const userSales = await reportsDatasource.getSalesByUser({
      from: lastWeek,
      to: today,
      limit: 5
    });
    
    console.log('User sales results:', userSales.length, 'items');
    userSales.forEach((user, index) => {
      console.log(`  ${index + 1}. User: ${user.name} ${user.lastname}`);
      console.log(`     Sales: ${user.saleCount}, Total: ${user.total}`);
      console.log(`     Average ticket: ${user.averageTicket}`);
      console.log(`     Last sale: ${user.lastSaleAt ? user.lastSaleAt.toISOString() : 'N/A'}\n`);
    });
    
    // Test 3: Daily sales report for current month
    console.log('\nTest 3: Daily sales report for current month');
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const dailySales = await reportsDatasource.getDailySalesReport({
      year: currentYear,
      month: currentMonth
    });
    
    console.log(`Daily sales for ${currentYear}-${currentMonth.toString().padStart(2, '0')}:`, dailySales.length, 'days');
    dailySales.slice(0, 5).forEach((day, index) => {
      console.log(`  ${index + 1}. ${day.date}: ${day.saleCount} sales, Total: ${day.total}`);
    });
    
    // Test 4: Test with different date formats
    console.log('\nTest 4: Testing different date formats');
    
    // Test with string dates
    const productSalesString = await reportsDatasource.getSalesByProduct({
      from: '2024-10-01',
      to: '2024-10-08',
      limit: 3
    });
    
    console.log('Results with string dates:', productSalesString.length, 'items');
    
  } catch (error) {
    console.error('Error testing date filtering:', error);
  }
}

// Run the test
testDateFiltering().then(() => {
  console.log('\nTest completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});