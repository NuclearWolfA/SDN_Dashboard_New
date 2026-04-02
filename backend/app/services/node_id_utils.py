def parse_hex_node_id(
    value,
    *,
    field_name: str = "node_id",
    max_value: int = 0xFFFFFFFF,
    exact_hex_len: int | None = None,
) -> int:
    if isinstance(value, int):
        if value < 0 or value > max_value:
            raise ValueError(f"{field_name} must be in range 0..{max_value}")
        return value

    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a hex string or integer")

    normalized = value.strip().lower()
    if normalized.startswith("!"):
        normalized = normalized[1:]
    if normalized.startswith("0x"):
        normalized = normalized[2:]

    if not normalized:
        raise ValueError(f"{field_name} cannot be empty")

    if exact_hex_len is not None and len(normalized) != exact_hex_len:
        raise ValueError(
            f"{field_name} must be exactly {exact_hex_len} hex characters"
        )

    try:
        parsed = int(normalized, 16)
    except ValueError as exc:
        raise ValueError(f"{field_name} must be a valid hex value") from exc

    if parsed < 0 or parsed > max_value:
        raise ValueError(f"{field_name} must be in range 0..{max_value}")

    return parsed


def format_hex_node_id(value: int, *, width: int = 8) -> str:
    return f"{value & ((1 << (width * 4)) - 1):0{width}x}"