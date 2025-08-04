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
    const adminCount = await strapi.query('admin::user').count();
    
    if (adminCount === 0) {
      const defaultAdmin = {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@bedtimes.app',
        password: await strapi.admin.services.auth.hashPassword('BedtimesAdmin123!'),
        isActive: true,
        roles: [1] // Super Admin role ID
      };
      
      try {
        await strapi.query('admin::user').create({ data: defaultAdmin });
        console.log('Default admin user created successfully');
        console.log('Email: admin@bedtimes.app');
        console.log('Password: BedtimesAdmin123!');
        console.log('IMPORTANT: Change this password after first login!');
      } catch (error) {
        console.error('Failed to create default admin:', error);
      }
    }
  },
};