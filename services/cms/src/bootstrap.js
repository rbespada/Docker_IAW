module.exports = async ({ strapi }) => {
  // ensure necessary roles exist in users-permissions
  const roleService = strapi.plugin('users-permissions').service('role');
  const existing = await roleService.find();
  const needed = [
    { name: 'Admin', type: 'administrator' },
    { name: 'Manager', type: 'manager' },
    { name: 'Customer', type: 'customer' }
  ];
  for (const r of needed) {
    if (!existing.find(x => x.type === r.type)) {
      await roleService.create({ name: r.name, type: r.type });
      strapi.log.info(`Created role ${r.name}`);
    }
  }

  // create default admin user if none exists
  const userService = strapi.plugin('users-permissions').service('user');
  const admins = await userService.fetch({ role: { type: 'administrator' } });
  if (admins.length === 0) {
    await userService.add({
      username: 'admin',
      email: 'admin@webstack.local',
      password: 'admin123',
      provider: 'local',
      confirmed: true,
      blocked: false,
      role: (existing.find(x => x.type === 'administrator') || {}).id,
    });
    strapi.log.info('Created default admin user (admin/admin123)');
  }
};
