const mongoose = require('mongoose');

/**


 * TODO: Add function description


 */


async function verifyDatabase() {
  try {
    // Kết nối với database mới
    await mongoose.connect('mongodb://127.0.0.1:27017/thohcm');
    console.log('✅ Successfully connected to database: thohcm');
    
    // Get thông tin database
    const dbStats = await mongoose.connection.db.stats();
    console.log('\n📊 Database Stats:');
    console.log(`Database Name: ${dbStats.db}`);
    console.log(`Collections: ${dbStats.collections}`);
    console.log(`Objects: ${dbStats.objects}`);
    console.log(`Data Size: ${(dbStats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`Storage Size: ${(dbStats.storageSize / 1024).toFixed(2)} KB`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Test create một document mẫu
    console.log('\n🧪 Testing database operations...');
    const testCollection = mongoose.connection.db.collection('test_migration');
    
    // Insert test document
    const testDoc = {
      message: 'Database migration successful',
      timestamp: new Date(),
      database: 'thohcm'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Test insert successful, ID:', insertResult.insertedId);
    
    // Find test document
    const foundDoc = await testCollection.findOne({_id: insertResult.insertedId});
    console.log('✅ Test find successful:', foundDoc.message);
    
    // Clean up test document
    await testCollection.deleteOne({_id: insertResult.insertedId});
    console.log('✅ Test cleanup successful');
    
    console.log('\n🎉 Database verification completed successfully!');
    console.log('✅ Database "thohcm" is ready for use');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Database connection closed');
  }
}

verifyDatabase();