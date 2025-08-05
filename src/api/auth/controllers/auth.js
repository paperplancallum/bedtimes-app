'use strict';

module.exports = {
  /**
   * Send verification code to email
   */
  async sendCode(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    try {
      // Check if user exists
      let user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Find the authenticated role
        const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });

        // Create new user
        user = await strapi.query('plugin::users-permissions.user').create({
          data: {
            email: email.toLowerCase(),
            username: email.toLowerCase(),
            confirmed: true,
            blocked: false,
            provider: 'local',
            role: defaultRole ? defaultRole.id : 1,
          },
        });

        // Create subscription for new user with anniversary-based access
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        await strapi.query('api::user-subscription.user-subscription').create({
          data: {
            user: user.id,
            planType: 'annual',
            startDate: startDate,
            endDate: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
            currentVolumeNumber: 1,
            nextVolumeDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: 'active',
            publishedDate: now,
          },
        });
      }

      // In production, generate and send real code via email
      // For now, we'll use a fixed code: 123456
      const verificationCode = '123456';

      // Store code in cache or database with expiration
      // For demo purposes, we'll accept the hardcoded code

      ctx.send({
        message: 'Verification code sent',
        success: true,
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      return ctx.badRequest('Failed to send verification code');
    }
  },

  /**
   * Verify code and return JWT token
   */
  async verifyCode(ctx) {
    const { email, code } = ctx.request.body;

    if (!email || !code) {
      return ctx.badRequest('Email and code are required');
    }

    try {
      // For demo, accept code 123456
      if (code !== '123456') {
        return ctx.badRequest('Invalid verification code');
      }

      // Find user
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
        populate: ['role'],
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      // Get subscription
      const subscription = await strapi.query('api::user-subscription.user-subscription').findOne({
        where: { user: user.id },
      });

      // Calculate accessible volumes if subscription exists
      let subscriptionWithAccess = null;
      if (subscription) {
        let accessibleVolumes = subscription.currentVolumeNumber || 1;
        
        const now = new Date();
        const startDate = new Date(subscription.startDate);
        const monthsSinceStart = Math.floor(
          (now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
        );
        const calculatedVolumes = Math.min(monthsSinceStart + 1, 12);
        
        accessibleVolumes = Math.max(accessibleVolumes, calculatedVolumes);
        
        subscriptionWithAccess = {
          ...subscription,
          accessibleVolumes,
        };
      }

      // Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      ctx.send({
        jwt,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        subscription: subscriptionWithAccess,
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      return ctx.badRequest('Failed to verify code');
    }
  },

  /**
   * Get current user subscription
   */
  async getSubscription(ctx) {
    // Get JWT from Authorization header
    const authHeader = ctx.request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.unauthorized('No authorization header');
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify JWT and get user ID
      const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      const userId = decoded.id;
      
      if (!userId) {
        return ctx.unauthorized('Invalid token');
      }

      const subscription = await strapi.query('api::user-subscription.user-subscription').findOne({
        where: { user: userId },
      });

      if (!subscription) {
        return ctx.notFound('Subscription not found');
      }

      // Use currentVolumeNumber from subscription if set, otherwise calculate based on start date
      let accessibleVolumes = subscription.currentVolumeNumber || 1;
      
      // Optionally still calculate based on time if you want to enforce minimum access
      const now = new Date();
      const startDate = new Date(subscription.startDate);
      const monthsSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      const calculatedVolumes = Math.min(monthsSinceStart + 1, 12);
      
      // Use the higher of the two values (manual setting or calculated)
      accessibleVolumes = Math.max(accessibleVolumes, calculatedVolumes);

      ctx.send({
        ...subscription,
        accessibleVolumes,
      });
    } catch (error) {
      console.error('Error getting subscription:', error);
      return ctx.badRequest('Failed to get subscription');
    }
  },
};