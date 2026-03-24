"""Reset database - drop all tables."""
from app.core.database import engine
from sqlalchemy import text, inspect

# Drop all tables
with engine.begin() as conn:
    # Get all table names
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    # Drop alembic_version first
    conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))
    
    # Drop all other tables
    for table in tables:
        conn.execute(text(f'DROP TABLE IF EXISTS {table} CASCADE'))
    
    print(f'Dropped {len(tables) + 1} tables successfully')
    print('Tables dropped:', ['alembic_version'] + tables)
