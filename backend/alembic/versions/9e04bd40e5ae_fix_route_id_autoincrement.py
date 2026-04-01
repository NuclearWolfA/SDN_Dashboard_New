"""fix_route_id_autoincrement

Revision ID: 9e04bd40e5ae
Revises: f25a91e1701d
Create Date: 2026-03-05 23:22:57.647709

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e04bd40e5ae'
down_revision: Union[str, Sequence[str], None] = 'f25a91e1701d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
