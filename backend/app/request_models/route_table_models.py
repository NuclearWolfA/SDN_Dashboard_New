from pydantic import BaseModel, Field


class RouteTableRequest(BaseModel):
    timeout: int = Field(10, ge=1, le=60)
    channel_index: int = Field(0, ge=0)
    want_ack: bool = False


class RouteEntry(BaseModel):
    destination: str
    next_hop: str
    hop_count: int
    destination_seq_num: int
    lifetime: int
    valid: bool


class RouteTableResponse(BaseModel):
    status: str
    request_id: int
    node_num: str
    routes: list[RouteEntry]