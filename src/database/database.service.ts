import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as process from 'node:process';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT ?? '5432'),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });
    // console.log('Database ', process.env.PG_DATABASE);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async onModuleInit() {
    try {
      // Test connection with a simple query
      await this.pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      throw new Error('Database connection failed');
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('Disconnected from PostgreSQL database');
  }

  async query(text: string, params: any[] = []): Promise<QueryResult> {
    try {
      return await this.pool.query(text, params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
}
