const mongoose = require('mongoose');
const User = require('./models/User');

async function createUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medexplain');
    console.log('✅ Connected to MongoDB');
    
    // Delete existing user if any
    await User.deleteOne({ email: 'atchayam265@gmail.com' }).catch(() => {});
    
    const user = await User.create({
      name: 'Atchaya M',
      email: 'atchayam265@gmail.com',
      password: 'Atchaya@123',
      role: 'patient'
    });
    
    console.log('✅ User created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: Atchaya@123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createUser();
