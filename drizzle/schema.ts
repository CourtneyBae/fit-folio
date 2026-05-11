import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const analyses = mysqlTable('analyses', {
  id:             int('id').autoincrement().primaryKey(),
  userId:         varchar('userId', { length: 64 }),    // Supabase auth UUID
  portfolioKey:   varchar('portfolioKey', { length: 512 }),
  portfolioText:  text('portfolioText'),
  jdText:         text('jdText').notNull(),
  status:         mysqlEnum('status', ['pending', 'processing', 'done', 'error']).default('pending').notNull(),
  result:         text('result'),
  errorMessage:   text('errorMessage'),
  createdAt:      timestamp('createdAt').defaultNow().notNull(),
  updatedAt:      timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
})

export type Analysis = typeof analyses.$inferSelect
