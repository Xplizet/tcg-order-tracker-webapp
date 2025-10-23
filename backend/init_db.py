"""
Initialize database with schema including PostgreSQL GENERATED columns
"""
from app.database import engine, Base
from app.models import User, Order
from sqlalchemy import text


def init_db():
    """Create all tables and add computed columns"""
    print("Creating database tables...")

    # Drop all tables (careful in production!)
    Base.metadata.drop_all(bind=engine)

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("✅ Base tables created")

    # Add computed columns to orders table using raw SQL
    # SQLAlchemy doesn't fully support GENERATED columns, so we add them manually
    print("Adding computed columns to orders table...")

    with engine.connect() as conn:
        # Drop the non-computed columns first
        conn.execute(text("""
            ALTER TABLE orders
            DROP COLUMN IF EXISTS total_cost,
            DROP COLUMN IF EXISTS amount_owing,
            DROP COLUMN IF EXISTS profit,
            DROP COLUMN IF EXISTS profit_margin;
        """))
        conn.commit()

        # Add computed columns
        conn.execute(text("""
            ALTER TABLE orders
            ADD COLUMN total_cost DECIMAL(10,2)
            GENERATED ALWAYS AS (cost_per_item * quantity) STORED;
        """))

        conn.execute(text("""
            ALTER TABLE orders
            ADD COLUMN amount_owing DECIMAL(10,2)
            GENERATED ALWAYS AS (cost_per_item * quantity - amount_paid) STORED;
        """))

        conn.execute(text("""
            ALTER TABLE orders
            ADD COLUMN profit DECIMAL(10,2)
            GENERATED ALWAYS AS (sold_price - (cost_per_item * quantity)) STORED;
        """))

        conn.execute(text("""
            ALTER TABLE orders
            ADD COLUMN profit_margin DECIMAL(5,2)
            GENERATED ALWAYS AS (
                CASE
                    WHEN sold_price > 0 THEN ((sold_price - (cost_per_item * quantity)) / sold_price * 100)
                    ELSE 0
                END
            ) STORED;
        """))
        conn.commit()

    print("✅ Computed columns added")

    # Create indexes
    print("Creating indexes...")
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
        """))
        conn.commit()

    print("✅ Indexes created")
    print("\n🎉 Database initialization complete!")
    print(f"Database: {engine.url}")


if __name__ == "__main__":
    init_db()
