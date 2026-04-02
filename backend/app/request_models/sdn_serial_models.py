from pydantic import BaseModel, Field


class RouteInstallRequest(BaseModel):
    destination: str | int = Field(..., description="Destination node ID as hex, e.g. a1b2c3d4 or 0xa1b2c3d4")
    path: list[str | int] = Field(..., description="Hop list of 1-byte node IDs as hex, e.g. [01, 0a, ff], max 8")
    install_id: int = Field(1, ge=0, le=255)
    start_node: str | int | None = Field(None, description="Start node ID as 4-byte hex, e.g. a1b2c3d4")
    channel_index: int = Field(0, ge=0)
    want_ack: bool = False


class RouteSwitchRequest(BaseModel):
    target_node: str | int = Field(..., description="Node ID that applies route switch as hex, e.g. a1b2c3d4")
    destination: str | int = Field(..., description="Destination node ID as hex, e.g. a1b2c3d4")
    next_hop: str | int = Field(..., description="Next hop as hex, e.g. 1f or 0x1f")
    channel_index: int = Field(0, ge=0)
    want_ack: bool = False


class GenericSendResponse(BaseModel):
    status: str
    details: dict