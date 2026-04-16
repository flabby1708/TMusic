import { getDatabaseStatus } from '../config/db.js'

export const getHealth = (_req, res) => {
  res.json({
    ok: true,
    service: 'TMusic API',
    timestamp: new Date().toISOString(),
    database: {
      status: getDatabaseStatus(),
    },
  })
}
