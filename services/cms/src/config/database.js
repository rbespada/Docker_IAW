module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'webstack'),
          user: env('DATABASE_USERNAME', 'postgres'),
          password: env('DATABASE_PASSWORD', 'postgres'),
          ssl: env.bool('DATABASE_SSL', false),
        },
        useNullAsDefault: true,
      },
    };
  }

  // fallback to sqlite for simple development
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
  };
};
