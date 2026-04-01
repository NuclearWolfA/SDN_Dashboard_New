from sqlalchemy import Column, ForeignKey, Integer, LargeBinary, String
from app.core.database import Base

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    reporter = Column(LargeBinary(4), ForeignKey('nodes.id'))
    destination = Column(LargeBinary(4), ForeignKey('nodes.id'))
    next_hop = Column(LargeBinary(4), ForeignKey('nodes.id'))
    expiring_time = Column(String)
    hop_count = Column(Integer)
    dest_seq_num = Column(Integer)
    timestamp = Column(String)