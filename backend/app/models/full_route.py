from sqlalchemy import Boolean, Column, ForeignKey, Integer, LargeBinary, String, UniqueConstraint
from app.core.database import Base


class FullRoute(Base):
    __tablename__ = "full_routes"
    __table_args__ = (
        UniqueConstraint("source", "destination", "dest_seq_num", name="uq_full_route_triplet"),
    )

    full_route_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    source = Column(LargeBinary(4), ForeignKey("nodes.id"), nullable=False)
    destination = Column(LargeBinary(4), ForeignKey("nodes.id"), nullable=False)
    dest_seq_num = Column(Integer, nullable=False)
    path = Column(String, nullable=False)
    hop_count = Column(Integer, nullable=False)
    is_complete = Column(Boolean, nullable=False, default=False)
    updated_at = Column(String, nullable=False)
