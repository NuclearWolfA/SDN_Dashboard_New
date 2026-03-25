"""add full routes table

Revision ID: 7d1a4ef8c2b1
Revises: 11b440e86586
Create Date: 2026-03-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d1a4ef8c2b1'
down_revision: Union[str, Sequence[str], None] = '11b440e86586'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'full_routes',
        sa.Column('full_route_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('source', sa.LargeBinary(length=4), nullable=False),
        sa.Column('destination', sa.LargeBinary(length=4), nullable=False),
        sa.Column('dest_seq_num', sa.Integer(), nullable=False),
        sa.Column('path', sa.String(), nullable=False),
        sa.Column('hop_count', sa.Integer(), nullable=False),
        sa.Column('is_complete', sa.Boolean(), nullable=False),
        sa.Column('updated_at', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['destination'], ['nodes.id']),
        sa.ForeignKeyConstraint(['source'], ['nodes.id']),
        sa.PrimaryKeyConstraint('full_route_id'),
        sa.UniqueConstraint('source', 'destination', 'dest_seq_num', name='uq_full_route_triplet'),
    )
    op.create_index(op.f('ix_full_routes_full_route_id'), 'full_routes', ['full_route_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_full_routes_full_route_id'), table_name='full_routes')
    op.drop_table('full_routes')
