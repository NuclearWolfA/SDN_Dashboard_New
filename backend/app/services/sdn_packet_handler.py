from app.core.database import SessionLocal
from app.models import Route
    
def handle_SDN_route_update(reporter, destination, hop_count, next_hop, timestamp, dest_seq_num, app):
    """Function to handle incoming SDN route updates and broadcast them to connected clients"""
    broadcaster = app.state.broadcaster
    db = SessionLocal()
    
    # Convert hex strings to bytes for database operations, padding to 4 bytes
    if isinstance(reporter, str) and reporter.startswith('0x'):
        reporter_bytes = int(reporter, 16).to_bytes(4, 'big')
    else:
        reporter_bytes = reporter
    
    if isinstance(destination, str) and destination.startswith('0x'):
        destination_bytes = int(destination, 16).to_bytes(4, 'big')
    else:
        destination_bytes = destination
    
    # Convert next_hop integer to its last byte for lookup
    next_hop_last_byte = next_hop.to_bytes(4, 'big')[-1:] if isinstance(next_hop, int) else bytes([next_hop & 0xFF])
    
    reporter_node = ensure_node_in_db(reporter_bytes, db)
    destination_node = ensure_node_in_db(destination_bytes, db)
    next_hop_node = find_node_by_last_byte(next_hop_last_byte, db)
    
    if next_hop_node is not None:
        route_update = {
            "reporter": reporter_node.id,
            "destination": destination_node.id,
            "hop_count": hop_count,
            "next_hop": next_hop_node.id,
            "timestamp": str(timestamp),
            "dest_seq_num": dest_seq_num
        }
        route = Route(**route_update)
        db.add(route)
        db.commit()
        db.refresh(route)
        db.close()
        broadcaster.publish(route_update)
        print(f"Published SDN route update: {route_update}")
    else:
        print(f"Warning: Could not find next_hop node with last_byte={next_hop_last_byte.hex()}. Route update skipped.")
        db.close()

def ensure_node_in_db(node_id, db):
    """Helper function to ensure a node exists in the database
    
    Args:
        node_id: bytes object (4 bytes) representing the node ID
        db: database session
    """
    from app.models import Node
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        node = Node(id=node_id)
        db.add(node)
        db.commit()
        print(f"Added new node to database: {node_id.hex()}")
    return node

def find_node_by_last_byte(last_byte, db):
    """Helper function to find a node by the last byte of its ID
    
    Args:
        last_byte: bytes object (1 byte) representing the last byte of the node ID
        db: database session
    """
    from app.models import Node
    node = db.query(Node).filter(Node.last_byte == last_byte).first()
    return node 