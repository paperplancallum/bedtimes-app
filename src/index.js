'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Create default admin user if none exists
    try {
      const adminUsers = await strapi.db.query('admin::user').findMany();
      
      if (!adminUsers || adminUsers.length === 0) {
        console.log('No admin users found. Creating default admin...');
        
        // Get the super admin role
        const superAdminRole = await strapi.db.query('admin::role').findOne({
          where: { code: 'strapi-super-admin' }
        });
        
        if (!superAdminRole) {
          console.error('Super admin role not found!');
          return;
        }
        
        const defaultAdmin = {
          firstname: 'Admin',
          lastname: 'User', 
          email: 'callum@paperplan.co',
          password: await strapi.admin.services.auth.hashPassword('BedtimesAdmin123!'),
          isActive: true,
          blocked: false,
          preferedLanguage: 'en',
          roles: [superAdminRole.id]
        };
        
        const createdAdmin = await strapi.db.query('admin::user').create({
          data: defaultAdmin,
          populate: ['roles']
        });
        
        console.log('=====================================');
        console.log('Default admin user created!');
        console.log('Email: callum@paperplan.co');
        console.log('Password: BedtimesAdmin123!');
        console.log('Please change this password after first login!');
        console.log('=====================================');
      } else {
        console.log(`Found ${adminUsers.length} existing admin user(s)`);
        
        // TEMPORARY: Reset password for first admin user
        const firstAdmin = adminUsers[0];
        const newPassword = await strapi.admin.services.auth.hashPassword('BedtimesAdmin123!');
        
        await strapi.db.query('admin::user').update({
          where: { id: firstAdmin.id },
          data: { 
            password: newPassword,
            email: 'callum@paperplan.co'
          }
        });
        
        console.log('=====================================');
        console.log('Admin password has been reset!');
        console.log('Email: callum@paperplan.co');
        console.log('Password: BedtimesAdmin123!');
        console.log('IMPORTANT: Remove this code after first login!');
        console.log('=====================================');
      }
    } catch (error) {
      console.error('Error during admin user creation:', error);
    }
  },
};