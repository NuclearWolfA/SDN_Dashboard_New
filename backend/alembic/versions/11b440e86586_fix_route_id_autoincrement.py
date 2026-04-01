"""fix_route_id_autoincrement

Revision ID: 11b440e86586
Revises: 9e04bd40e5ae
Create Date: 2026-03-05 23:24:19.214201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11b440e86586'
down_revision: Union[str, Sequence[str], None] = '9e04bd40e5ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create a sequence for route_id
    op.execute("CREATE SEQUENCE IF NOT EXISTS routes_route_id_seq")
    
    # Set existing route_id values to sequential numbers (if any rows exist)
    op.execute("""
        UPDATE routes 
        SET route_id = nextval('routes_route_id_seq')
        WHERE route_id IS NULL OR route_id = 0
    """)
    
    # Set the default value for route_id to use the sequence
    op.execute("ALTER TABLE routes ALTER COLUMN route_id SET DEFAULT nextval('routes_route_id_seq')")
    
    # Drop the old primary key constraint if it exists (on sequence_number)
    op.execute("ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_pkey")
    
    # Make route_id NOT NULL and set it as primary key
    op.execute("ALTER TABLE routes ALTER COLUMN route_id SET NOT NULL")
    op.execute("ALTER TABLE routes ADD PRIMARY KEY (route_id)")
    
    # Set the sequence to continue from the current max value
    op.execute("SELECT setval('routes_route_id_seq', COALESCE((SELECT MAX(route_id) FROM routes), 0) + 1, false)")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove primary key from route_id
    op.execute("ALTER TABLE routes DROP CONSTRAINT routes_pkey")
    
    # Remove default and make nullable
    op.execute("ALTER TABLE routes ALTER COLUMN route_id DROP DEFAULT")
    op.execute("ALTER TABLE routes ALTER COLUMN route_id DROP NOT NULL")
    
    # Drop the sequence
    op.execute("DROP SEQUENCE IF EXISTS routes_route_id_seq")
