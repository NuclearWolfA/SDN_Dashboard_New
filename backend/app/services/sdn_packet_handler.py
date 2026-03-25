from app.core.database import SessionLocal
from app.models import FullRoute, Route


def _bytes_to_hex(node_id):
    if node_id is None:
        return None
    return node_id.hex()


def _path_to_storage(path_nodes):
    return ",".join(node.hex() for node in path_nodes)


def _build_full_paths_for_destination(routes, destination):
    latest_by_reporter = {}
    for route in routes:
        if route.reporter not in latest_by_reporter:
            latest_by_reporter[route.reporter] = route

    next_hop_map = {
        route.reporter: route.next_hop
        for route in latest_by_reporter.values()
        if route.reporter and route.next_hop
    }

    built_paths = []
    for source in next_hop_map.keys():
        seen = {source}
        path = [source]
        current = source
        is_complete = False

        while True:
            if current == destination:
                is_complete = True
                break

            nxt = next_hop_map.get(current)
            if not nxt:
                break

            path.append(nxt)
            if nxt == destination:
                is_complete = True
                break

            if nxt in seen:
                break

            seen.add(nxt)
            current = nxt

        built_paths.append(
            {
                "source": source,
                "path_nodes": path,
                "hop_count": max(len(path) - 1, 0),
                "is_complete": is_complete,
            }
        )

    return built_paths


def rebuild_full_routes(destination, dest_seq_num, timestamp, db):
    routes = (
        db.query(Route)
        .filter(Route.destination == destination, Route.dest_seq_num == dest_seq_num)
        .order_by(Route.route_id.desc())
        .all()
    )

    if not routes:
        return

    built_paths = _build_full_paths_for_destination(routes, destination)

    for built in built_paths:
        existing = (
            db.query(FullRoute)
            .filter(
                FullRoute.source == built["source"],
                FullRoute.destination == destination,
                FullRoute.dest_seq_num == dest_seq_num,
            )
            .first()
        )

        path_storage = _path_to_storage(built["path_nodes"])
        if existing:
            existing.path = path_storage
            existing.hop_count = built["hop_count"]
            existing.is_complete = built["is_complete"]
            existing.updated_at = str(timestamp)
        else:
            db.add(
                FullRoute(
                    source=built["source"],
                    destination=destination,
                    dest_seq_num=dest_seq_num,
                    path=path_storage,
                    hop_count=built["hop_count"],
                    is_complete=built["is_complete"],
                    updated_at=str(timestamp),
                )
            )
    
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
        route_update_db = {
            "reporter": reporter_node.id,
            "destination": destination_node.id,
            "hop_count": hop_count,
            "next_hop": next_hop_node.id,
            "timestamp": str(timestamp),
            "dest_seq_num": dest_seq_num
        }
        route = Route(**route_update_db)
        db.add(route)
        db.flush()
        rebuild_full_routes(destination_node.id, dest_seq_num, timestamp, db)
        db.commit()
        db.refresh(route)

        route_update_ws = {
            "reporter": _bytes_to_hex(reporter_node.id),
            "destination": _bytes_to_hex(destination_node.id),
            "hop_count": hop_count,
            "next_hop": _bytes_to_hex(next_hop_node.id),
            "timestamp": str(timestamp),
            "dest_seq_num": dest_seq_num,
        }

        db.close()
        broadcaster.publish(route_update_ws)
        print(f"Published SDN route update: {route_update_ws}")
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

 