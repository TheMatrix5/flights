"""
Database connection management using psycopg2
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from typing import Optional
from contextlib import contextmanager


class DatabaseConnection:
    """Manages PostgreSQL database connections"""

    def __init__(self):
        self.pool: Optional[SimpleConnectionPool] = None

    def initialize(
        self,
        host: str = "localhost",
        port: int = 5432,
        database: str = "flights_db",
        user: str = "postgres",
        password: str = "postgres",
        min_conn: int = 1,
        max_conn: int = 10
    ):
        """Initialize connection pool"""
        try:
            self.pool = SimpleConnectionPool(
                min_conn,
                max_conn,
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            print(f"Database connection pool created successfully")
        except Exception as e:
            print(f"Error creating database connection pool: {e}")
            raise

    @contextmanager
    def get_connection(self):
        """Get connection from pool"""
        if not self.pool:
            raise Exception("Database pool not initialized")

        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            self.pool.putconn(conn)

    @contextmanager
    def get_cursor(self, cursor_factory=RealDictCursor):
        """Get cursor from connection"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=cursor_factory)
            try:
                yield cursor
            finally:
                cursor.close()

    def close(self):
        """Close all connections in pool"""
        if self.pool:
            self.pool.closeall()
            print("Database connection pool closed")


# Global database instance
db = DatabaseConnection()
